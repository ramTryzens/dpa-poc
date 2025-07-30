import type { Route } from "./+types/test";
import { deleteTenant } from "~/db/tenant/delete";
import type {
  OffboardTenantLoader,
  OffboardTenantRequestParams,
} from "~/types/tenant";
import { CONSTANTS } from "~/utils/constants";

// Delete Action comes from core.v1.tenants.onboard
export async function OffboardTenant(loader: Route.ClientLoaderArgs) {
  // Validate Offboard Request
  async function validateOffboardTenantRequest(loader: Route.ClientLoaderArgs) {
    let requestBody: OffboardTenantRequestParams;
    const isMarked = process.env.SHOULD_MARK_FOR_DELETE;
    requestBody = { isMarked };
    return {
      requestBody,
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

  const validateRequest = await validateOffboardTenantRequest(loader);
  const validateParams = validateOffboardParams(loader);
  if (!validateParams || validateParams?.error)
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
