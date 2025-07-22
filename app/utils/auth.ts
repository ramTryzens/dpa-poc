import type { LoaderFunctionArgs } from "react-router";
import jwt from "jsonwebtoken";
import type { JwtPayload } from "jsonwebtoken";
import NodeCache from "node-cache";
import axios from "axios";
// Import environment configuration
import './env';

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
    if (process.env.NODE_ENV === 'development' && isMockToken(token)) {
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
      decodedToken = await verifyToken(token);
     console.log('JWT token verified successfully', { 
        subject: decodedToken.sub,
        issuer: decodedToken.iss
      });
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
 * Verify JWT token
 * @param {string} token - JWT token
 * @returns {Promise<Object>} Decoded token
 */
const verifyToken = async (token: string) => {
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

/**
 * Fetch public key from UAA server
 * @param {string} kid - Key ID
 * @returns {Promise<string>} Public key
 */
const fetchPublicKey = async (kid: string) => {
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