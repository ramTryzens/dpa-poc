import { validateJwt } from "~/utils/auth";
import type { Route } from "./+types/test";
import { createTenant } from "~/db/tenant/create";
import type { GetTenant, OnboardTenantLoader } from "~/types/tenant";
import { findByTenantId } from "~/db/tenant/findByTenantId";
import { redirect, useActionData, useLoaderData } from "react-router";
import { ErrorBoundary } from "~/components/Error";

export async function action(loader: Route.ClientLoaderArgs) {
  try {
    const isAuthorized = await validateJwt(loader);
    if (!isAuthorized) throw new Error("Unable to validate tenant");
    const params = loader.params as OnboardTenantLoader;
    const tenant = await createTenant(params);
    return Response.json(tenant, { status: 200 });
  } catch (error) {
    return Response.json({ error }, { status: 500 });
  }
}

export function loader() {
  return redirect('/error')
}