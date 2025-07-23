import { validateJwt } from "~/utils/auth";
import type { Route } from "./+types/test";
import { createTenant } from "~/db/tenant/create";
import { deleteTenant } from "~/db/tenant/delete";
import type {
  GetTenant,
  OffboardTenantLoader,
  OffboardTenantRequestParams,
  OnboardTenantLoader,
  OnboardTenantRequestBody,
} from "~/types/tenant";
import { redirect } from "react-router";
import { ErrorBoundary } from "~/components/Error";
import { CONSTANTS } from "~/utils/constants";

export async function action(loader: Route.ClientLoaderArgs) {
  // Validate Onboard Request
  async function validateOnboardTenantRequest(loader: Route.ClientLoaderArgs) {
    let requestBody: OnboardTenantRequestBody;
    let error;
    // Verify if json request, so that we can extract payload
    if (
      !loader?.request?.headers
        .get("content-type")
        ?.includes("application/json")
    ) {
      error = {
        items: {
          status: "400",
          message: "Missing tenantSubdomain or tenantPlan in request body",
          identifier: "MISSING_MANDATORY_ATTRIBUTE",
          version: CONSTANTS.API_VERSION,
        },
        status: { status: 400 },
      };
    }
    requestBody = (await loader.request.json()) as OnboardTenantRequestBody;
    if (!requestBody?.tenantPlan || !requestBody?.tenantSubdomain)
      error = {
        items: {
          status: "400",
          message: "Missing tenantSubdomain or tenantPlan in request body",
          identifier: "MISSING_MANDATORY_ATTRIBUTE",
          version: CONSTANTS.API_VERSION,
        },
        status: { status: 400 },
      };
    if (
      typeof requestBody.tenantPlan !== "string" ||
      typeof requestBody.tenantSubdomain !== "string"
    )
      error = {
        items: {
          status: "400",
          message: "tenantSubdomain or tenantPlan contains invalid format",
          identifier: "INVALID_ATTRIBUTE",
          version: CONSTANTS.API_VERSION,
        },
        status: { status: 400 },
      };

    if (error?.items)
      return {
        error,
      };

    return {
      requestBody,
    };
  }

  // Validate Offboard Request
  async function validateOffboardTenantRequest(loader: Route.ClientLoaderArgs) {
    let requestBody: OffboardTenantRequestParams;
    const url = new URL(loader.request.url);
    const isMarked = url.searchParams.get("isMarked") || undefined;
    requestBody = { isMarked };
    return {
      requestBody,
    };
  }

  // Validate Onboard Request Params
  function validateOnboardParams(loader: Route.ClientLoaderArgs) {
    if (!loader?.params)
      return {
        error: {
          items: {
            status: "400",
            message: "Missing tenant id in path",
            identifier: "MISSING_MANDATORY_ATTRIBUTE",
            version: CONSTANTS.API_VERSION,
          },
          status: { status: 400 },
        },
      };
    else
      return {
        ...(loader?.params as OnboardTenantLoader),
      };
  }

  // Validate Offboard Request Params
  function validateOffboardParams(loader: Route.ClientLoaderArgs) {
    if (!loader?.params)
      return {
        error: {
          items: {
            status: "400",
            message: "Missing tenant id in path",
            identifier: "MISSING_MANDATORY_ATTRIBUTE",
            version: CONSTANTS.API_VERSION,
          },
          status: { status: 400 },
        },
      };
    else
      return {
        ...(loader?.params as OffboardTenantLoader),
      };
  }

  try {
    const authResponse = await validateJwt(loader);
    console.log("🚀 ~ action ~ isAuthorized:", authResponse);

    // If authResponse is a Response object (failed auth), return it
    if (authResponse instanceof Response) {
      console.error("Authorization failed with status:", authResponse.status);
      return authResponse;
    }

    if (loader.request.method === "PUT") {
      // All validations on request and request body
      const validateRequest = await validateOnboardTenantRequest(loader);
      if (validateRequest?.error) {
        return Response.json(
          validateRequest?.error?.items,
          validateRequest?.error?.status
        );
      }

      // If we get here, authorization was successful (authResponse is true)
      console.log("Authorization successful");
      const validateParams = validateOnboardParams(loader);
      if (validateParams?.error)
        return Response.json(
          validateParams?.error?.items,
          validateParams?.error?.status
        );
      const tenant = await createTenant({
        ...validateParams,
        ...validateRequest?.requestBody,
      });
      const response = Response.json(tenant, { status: 200 });
      console.log("Tenant onboarding successful with status 200");
      return response;
    }

    if (loader.request.method === "DELETE") {
      const validateRequest = await validateOffboardTenantRequest(loader);
      const validateParams = validateOffboardParams(loader);
      if (validateParams?.error)
        return Response.json(
          validateParams?.error?.items,
          validateParams?.error?.status
        );

      const tenant = await deleteTenant({
        ...validateParams,
        ...validateRequest?.requestBody,
      });

      if (!tenant)
        return Response.json(
          { message: "Unable to delete tenant" },
          { status: 500 }
        );
      return new Response(null, { status: 204 });
    }
    return Response.json({ message: "Method Not Allowed" }, { status: 405 });
  } catch (error) {
    console.log("🚀 ~ action ~ error:", error);
    return Response.json({ error }, { status: 500 });
  }
}

export function loader() {
  return redirect("/error");
}
