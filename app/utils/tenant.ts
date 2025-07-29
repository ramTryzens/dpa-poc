import type { LoaderFunctionArgs } from "react-router";
import { verifyToken, extractTenantId } from "./auth";
import { findByTenantId } from "~/db/tenant/findByTenantId";
import type { GetTenant } from "~/types/tenant";
/**
 * Check if a tenant is already onboarded in the system
 * @param tenantId - The ID of the tenant to check
 * @returns Promise<boolean> - True if tenant exists, false otherwise
 */
export async function isTenantOnboarded(tenantId: string): Promise<boolean> {
  try {
    // Use the existing findByTenantId function to check if tenant exists
    const tenant = await findByTenantId({ tenantId } as GetTenant);
    // If we get here without an error, the tenant exists
    return true;
  } catch (error) {
    console.log('Tenant not found or error checking tenant status', { tenantId, error });
    return false;
  }
}

export async function validateTenantOnboarded(loaderRequest: LoaderFunctionArgs): Promise<Response | boolean> {
    const headerTenantId = loaderRequest.request.headers.get("X-SAP-TenantId");
    if (!headerTenantId) {
        console.log('Tenant ID not present in ', { 
          url: loaderRequest.request.url, 
         
        });
        console.log('Fetching tenant from JWT token');
        let tenantId = await fetchTenantDetailsFromJWT(loaderRequest);
        if(process.env.NODE_ENV === 'development'
             && !tenantId) {
            tenantId = process.env.TENANT_ID || null;
        }
        if(!tenantId) {
           
            // Otherwise return an error response
            return Response.json({
              status: '401',
              message: 'Tenant ID header missing or invalid'
            }, { status: 401 });
        }
        
        // Check if the tenant is already onboarded
        const isOnboarded = await isTenantOnboarded(tenantId);
        if (!isOnboarded) {
            console.log('Tenant not onboarded', { tenantId });
            return Response.json({
              status: '404',
              message: 'Tenant not onboarded'
            }, { status: 404 });
        }
        
        // If we have a valid and onboarded tenantId, return true
        return true;
      }


    return true;
}

const fetchTenantDetailsFromJWT = async (loaderRequest: LoaderFunctionArgs) => {
    const authHeader = loaderRequest.request.headers.get("Authorization");
    
    if (!authHeader) {
        console.log('Authorization header missing');
        return null;
    }
    
    const token = authHeader.split(' ')[1];
    try {
        const verifyResult = await verifyToken(token);
        
        // Handle the union type returned by verifyToken
        if (typeof verifyResult !== 'string' && !(verifyResult instanceof Response)) {
            // Now TypeScript knows this is a JwtPayload
            const decodedToken = verifyResult;
            console.log('JWT token verified successfully', { 
                subject: decodedToken.sub,
                issuer: decodedToken.iss
            });
            
            // Process the JwtPayload as needed
            // For example, extract tenant ID
            const tenantId = extractTenantId(decodedToken);
            console.log('Extracted tenant ID from token', { tenantId });
            return tenantId;
        } else if (verifyResult instanceof Response) {
            console.log('JWT verification returned a Response object');
            return null;
        } else {
            // Handle string result
            console.log('JWT verification returned a string result');
            return null;
        }
    } catch (error) {
        console.error('Error verifying JWT token', error);
        return null;
    }
}