import { validateJwt } from "~/utils/auth";
import type { Route } from "./+types/test";
import { createTenant } from "~/db/tenant/create";
import type { GetTenant, OnboardTenantLoader } from "~/types/tenant";
import { findByTenantId } from "~/db/tenant/findByTenantId";
import { redirect, useActionData, useLoaderData } from "react-router";
import { ErrorBoundary } from "~/components/Error";

export async function action(loader: Route.ClientLoaderArgs) {
  try {
    const authResponse = await validateJwt(loader);
    console.log("🚀 ~ action ~ isAuthorized:", authResponse);
    
    // If authResponse is a Response object (failed auth), return it
    if (authResponse instanceof Response) {
      console.error("Authorization failed with status:", authResponse.status);
      return authResponse;
    }
    
    // If we get here, authorization was successful (authResponse is true)
    console.log("Authorization successful");
    const params = loader.params as OnboardTenantLoader;
    const tenant = await createTenant(params);
    const response = Response.json(tenant, { status: 200 });
    console.log("Tenant onboarding successful with status 200");
    return response;
  } catch (error) {
    return Response.json({ error }, { status: 500 });
  }
}

export function loader() {
  return redirect('/error')
}