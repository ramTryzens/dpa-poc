import type { LoaderFunctionArgs } from "react-router";
import jwt from "jsonwebtoken";
import type { JwtPayload } from "jsonwebtoken";
import NodeCache from "node-cache";
import axios from "axios";


// Define interface for decoded JWT with complete option
interface DecodedJwt {
  header: { [key: string]: any };
  payload: JwtPayload;
  signature: string;
}

// Define interface for UAA key structure
interface UaaKey {
  kid: string;
  value: string;
  [key: string]: any; // Allow for other properties
}

// Configuration object for JWT settings
const config = {
  jwt: {
    publicKeyCacheMinutes: 60, // Cache public keys for 60 minutes
    publicKeyCacheTtl: 3600, // Cache TTL in seconds
    digitalPaymentsUaaUrl: process.env.DIGITAL_PAYMENTS_UAA_URL || 'https://uaa.example.com',
    externalAdapterUaaUrl: process.env.EXTERNAL_ADAPTER_UAA_URL || 'https://adapter-uaa.example.com'
  }
}

// Cache for storing public keys
const publicKeyCache = new NodeCache({
  stdTTL: config.jwt.publicKeyCacheMinutes * 60, // Convert minutes to seconds
  checkperiod: 120 // Check for expired keys every 2 minutes
});

// Cache for storing adapter to core tokens
const adapterToCoreTokenCache = new NodeCache({
  stdTTL: 3500, // Cache tokens for slightly less than the typical 1-hour expiration (3600 seconds)
  checkperiod: 60 // Check for expired tokens every minute
});

export async function validateJwt(loaderRequest: LoaderFunctionArgs): Promise<Response | boolean> {
  // Placeholder for JWT or session check
  const authHeader = loaderRequest.request.headers.get("Authorization");
  console.log("🚀 ~ validateJwt ~ Checking Authorization:");
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    console.log('Authorization header missing or invalid', { 
      ip: loaderRequest.request.url, 
     
    });
    return Response.json({
      status: '401',
      message: 'Authorization header missing or invalid'
    }, { status: 401 });
  }
  const token = authHeader.split(' ')[1];
  try {
    let decodedToken;
    // Only use mock tokens in development, not in stage or production
    if (process.env.NODE_ENV === 'development' && isMockToken(token)) {
      console.log("process.env.NODE_ENV", process.env.NODE_ENV);
      // For development environment with mock tokens, allow access
      console.log("Mock token detected in development environment, allowing access");
      decodedToken = verifyMockToken(token);
      return true;
    }else {
      // Verify token with real JWT verification
        // For production or non-mock tokens, implement actual JWT validation here
    // This is where you would verify the token with your auth provider
    // For now, we'll just return true to allow the request to proceed
      console.log('Verifying JWT token with UAA');
      const verifyResult = await verifyToken(token);
      
      // Check if the result is a JwtPayload
      if (typeof verifyResult !== 'string' && !(verifyResult instanceof Response)) {
        decodedToken = verifyResult;
        console.log('JWT token verified successfully', { 
          subject: decodedToken.sub,
          issuer: decodedToken.iss
        });
      } else if (verifyResult instanceof Response) {
        return verifyResult; // Return the Response directly
      } else {
        // Handle string result if needed
        console.log('JWT token verification returned a string result');
      }
    }
    
  
    
  } catch(error) {
    console.log("🚀 ~ Error Validating JWT: " + error);
    return Response.json({
      status: '401',
      message: 'Invalid token'
    }, { status: 401 });
  }
  console.log("🚀 ~ validateJwt ~ Validated Successfully");
  return true;
}


/**
 * Check if a token is a mock token
 * @param {string} token - JWT token to check
 * @returns {boolean} True if token is a mock token
 */
const isMockToken = (token: string) => {
  try {
    //const mockToken = generateMockToken();
    console.log('Checking if token is a mock token');
    
    // Try to decode the token without verification
    const decoded = jwt.decode(token, { complete: true }) as DecodedJwt | null;
    
    // Check if the token has the mock issuer
    const isMock = decoded && decoded.payload && decoded.payload.iss === 'mock-issuer';
    
    if (isMock) {
      console.log('Token identified as mock token', { 
        issuer: decoded.payload.iss,
        subject: decoded.payload.sub
      });
    } else {
      console.log('Token is not a mock token');
    }
    
    return isMock;
  } catch (error) {
    // Type narrowing for the error object
    const errorMessage = error instanceof Error ? error.message : String(error);
    console.log('Error checking if token is mock token', { error: errorMessage });
    return false;
  }
};

/**
 * Verify a mock JWT token
 * @param {string} token - JWT token to verify
 * @returns {Object} Decoded token payload
 */
const verifyMockToken = (token: string) => {
  try {
    console.log('Verifying mock JWT token');
    const MOCK_JWT_SECRET = process.env?.MOCK_JWT_SECRET;
    
    if (!MOCK_JWT_SECRET) {
      throw new Error('MOCK_JWT_SECRET is not defined in environment variables');
    }

    const decoded = jwt.verify(token, MOCK_JWT_SECRET) as JwtPayload;
    console.log('Mock JWT token verified successfully', { 
      subject: decoded.sub,
      issuer: decoded.iss
    });
    return decoded;
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    console.log('Mock JWT token verification failed', { error: errorMessage });
    throw error;
  }
};

export async function generateMockToken(): Promise<string> {
  console.log('Generating mock JWT token');
  const MOCK_JWT_SECRET = process.env?.MOCK_JWT_SECRET;
  
  if (!MOCK_JWT_SECRET) {
    throw new Error('MOCK_JWT_SECRET is not defined in environment variables');
  }
  // Default payload
  const defaultPayload = {
    // Standard JWT claims
    iss: 'mock-issuer',
    sub: 'mock-subject',
    aud: ['mock-audience'],
    exp: Math.floor(Date.now() / 1000) + (60 * 60 * 24), // 24 hours from now
    iat: Math.floor(Date.now() / 1000),
    jti: `mock-jwt-id-${Date.now()}`,
    
    // Custom claims
    client_id: 'mock-client',
    scope: ['uaa.resource'],
    
    // SAP specific claims
    psp_code: process.env.PSP_CODE,
    
    
  };
  
  console.log('Mock token payload prepared', { 
    issuer: defaultPayload.iss,
    subject: defaultPayload.sub,
    expiresIn: new Date(defaultPayload.exp * 1000).toISOString()
  });
  
  const token = jwt.sign(defaultPayload, MOCK_JWT_SECRET, { algorithm: 'HS256' });
  console.log('Mock JWT token generated successfully');
  
  return token;
};



/**
 * Fetch public key from UAA server
 * @param {string} kid - Key ID
 * @returns {Promise<string>} Public key
 */
async function fetchPublicKey(kid: string) {
  try {
    // Try Digital Payments UAA first
    const dpUaaUrl = config.jwt.digitalPaymentsUaaUrl;
    console.log(`Fetching public key from Digital Payments UAA`, { kid, uaaUrl: dpUaaUrl });
    
    const dpResponse = await axios.get(`${dpUaaUrl}/token_keys`);
    
    // Find key with matching kid
    const dpKey = dpResponse.data.keys.find((key: UaaKey) => key.kid === kid);
    console.log(`Found matching public key in Digital Payments UAA`, { kid });
    console.log(`Digital Payments UAA response: ${JSON.stringify(dpResponse.data)}`);
    
    if (dpKey) {
      console.log(`Found matching public key in Digital Payments UAA`, { kid });
      console.log(`Digital Payments UAA response: ${JSON.stringify(dpResponse.data)}`);
      console.log(`DPA Public Key: ${dpKey.value}`);
      return dpKey.value;
    }
    throw new Error(`Public key with kid ${kid} not found`);
    
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    console.error('Failed to fetch public key', { 
      kid, 
      error: errorMessage,
      });
    throw error;
  }
};

/**
 * Verify JWT token
 * @param {string} token - JWT token
 * @returns {Promise<Object>} Decoded token
 */
export async function verifyToken  (token: string) : Promise<Response | string | JwtPayload> {
  try {
    // Decode token header to get key ID
    console.log('Verifying JWT token Token details', { token });
    const decoded = jwt.decode(token, { complete: true }) as DecodedJwt | null;
    
    if (!decoded) {
      throw new Error('Failed to decode JWT token');
    }
    
    const decodedHeader = decoded.header;
    const payload = decoded.payload;
    const signature = decoded.signature;
    console.log('Decoded Header', { decodedHeader });
    console.log('Decoded Payload', { payload });
    console.log('Decoded signature', { signature });
    const kid = decodedHeader.kid;
    
    console.log('Verifying JWT token', { kid });
    
    // Check if public key is in cache
    let publicKey: string | undefined = publicKeyCache.get(kid);
    
    // If not in cache, fetch from UAA
    if (!publicKey) {
      console.log('Public key not found in cache, fetching from UAA', { kid });
      publicKey = await fetchPublicKey(kid);
      console.log('Public key', {publicKey});
      publicKeyCache.set(kid, publicKey);
      console.log('Public key cached successfully', { kid, cacheTtl: config.jwt.publicKeyCacheTtl });
    } else {
      console.log('Using cached public key', { kid });
    }
    
    // Verify token with public key
    if (!publicKey) {
      throw new Error('Public key is undefined');
    }
    
    const decodedToken = jwt.verify(token, publicKey, {
      algorithms: ['RS256']
    }) as JwtPayload;
    
    console.log('Token verified successfully', { 
      subject: decodedToken.sub,
      issuer: decodedToken.iss,
      expiresIn: decodedToken.exp ? new Date(decodedToken.exp * 1000).toISOString() : 'undefined'
    });
    console.log('Decoded Token', { decodedToken });
    return decodedToken;
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    console.error('Token verification failed', { 
      error: errorMessage      
    });
    throw error;
  }
};


export function extractTenantId(decodedToken: JwtPayload): string | null {
  let extractedTenantId = null;
  console.log('Extracting az_attr from token', { az_attr: decodedToken.az_attr });
  console.log('Extracting tenant ID from token', { tenantId: decodedToken.az_attr?.tenantId });
  if (decodedToken && 
      decodedToken.az_attr && 
      decodedToken.az_attr.tenantId) {
    // Convert any potential undefined to null to match the return type
    return decodedToken.az_attr.tenantId || null;
  }
  return extractedTenantId;
};

/**
 * Get authentication token for adapter to core communication
 * Uses basic authentication with client ID and password to obtain an OAuth token
 * Implements caching for performance optimization
 * @returns {Promise<string>} Access token for adapter to core communication
 */
export async function getTokenforAdptrToCoreComm(): Promise<string> {
  const cacheKey = 'adapter_to_core_token';
  
  // Check if we have a valid token in cache
  const cachedToken = adapterToCoreTokenCache.get<string>(cacheKey);
  if (cachedToken) {
    console.log('Using cached adapter to core token');
    return cachedToken;
  }
  
  // No valid token in cache, fetch a new one
  try {
    const tokenUrl = process.env.DIGITAL_PAYMENTS_ADAPTER_TO_CORE_TOKEN_URL;
    if (!tokenUrl) {
      throw new Error('DIGITAL_PAYMENTS_ADAPTER_TO_CORE_TOKEN_URL environment variable is not defined');
    }
    
    const clientId = process.env.ADAPTER_TO_CORE_CLIENT_ID;
    const clientPassword = process.env.ADAPTER_TO_CORE_CLIENT_PASSWORD;
    
    if (!clientId || !clientPassword) {
      throw new Error('ADAPTER_TO_CORE_CLIENT_ID or ADAPTER_TO_CORE_CLIENT_PASSWORD environment variable is not defined');
    }
    
    // Create Basic Auth credentials
    const credentials = Buffer.from(`${clientId}:${clientPassword}`).toString('base64');
    
    console.log('Fetching new adapter to core token');
    const response = await axios.get(tokenUrl, {
      headers: {
        'Authorization': `Basic ${credentials}`,
        'Accept': 'application/json'
      },
      timeout: 5000 // 5 second timeout for the request
    });
    
    if (response.status !== 200 || !response.data.access_token) {
      throw new Error(`Failed to get token: ${response.status} ${JSON.stringify(response.data)}`);
    }
    
    const accessToken = response.data.access_token;
    
    // Calculate TTL based on expires_in if available, otherwise use default
    let tokenTtl = 3500; // Default to slightly less than 1 hour
    if (response.data.expires_in && typeof response.data.expires_in === 'number') {
      // Set cache TTL to 90% of the actual token expiration time to ensure we refresh before expiry
      tokenTtl = Math.floor(response.data.expires_in * 0.9);
    }
    
    // Cache the token
    adapterToCoreTokenCache.set(cacheKey, accessToken, tokenTtl);
    
    console.log('Successfully obtained and cached new adapter to core token');
    return accessToken;
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    console.error('Failed to get adapter to core token', { error: errorMessage });
    throw new Error(`Failed to get adapter to core token: ${errorMessage}`);
  }
}