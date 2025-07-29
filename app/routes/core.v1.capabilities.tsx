import type { Route } from "./+types/test";
import { validateJwt } from "~/utils/auth";
import { validateTenantOnboarded } from "~/utils/tenant";
import { allCapabilities, paymentCardCapabilities, externalPaymentCapabilities, additionalCapabilities, supportedPaymentTypeProperties } from "~/config/capabilities.config";

export async function loader(loader: Route.ClientLoaderArgs) {
    console.log('Capabilities request received', { 
        url: loader.request.url,
     });
try{
    // Get PSP code from configuration
    const pspCode = process.env.PSP_CODE;
    console.log('Retrieving capabilities for PSP', { pspCode });
    const authResponse = await validateJwt(loader);
    console.log("🚀 ~ action ~ isAuthorized:", authResponse);
     // If authResponse is a Response object (failed auth), return it
    if (authResponse instanceof Response) {
        console.error("Authorization failed with status:", authResponse.status);
        return authResponse;
    }
    const tenantOnBoarded = await validateTenantOnboarded(loader);
    console.log("🚀 ~ action ~ isTenantOnboarded:", tenantOnBoarded);

    if (tenantOnBoarded instanceof Response && tenantOnBoarded.status === 404) {
        console.error("Tenant not onboarded");
        return Response.json({ error: "Tenant not onboarded" }, { status: 404 });
    }
  
    // Using supportedPaymentTypeProperties imported from capabilities.config.ts

      const capabilitiesResponse = {
        capabilities: allCapabilities,
        supportedPaymentTypeProperties: supportedPaymentTypeProperties,
        paymentPagePath: `/payment-page/${pspCode}`
      };
    
    const response = Response.json(capabilitiesResponse, { status: 200 });
      console.log("Capabilities retrieved successfully with status 200");
      return response;
   
} catch (error) {
    return Response.json({ error }, { status: 500 });
  }
}   