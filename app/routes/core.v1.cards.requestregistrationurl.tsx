import { validateJwt } from "~/utils/auth";
import type { Route } from "./+types/test";
import { redirect } from "react-router";
import { CONSTANTS } from "~/utils/constants";
import type {
  RequestRegistrationUrlBody,
  RequestRegistrationUrlResponse,
} from "~/types/registration";
import { requestRegistrationUrl } from "~/psp/registration/RequestRegistrationUrl";
import { getTenantIdFromHeader, validateTenantOnboarded } from "~/utils/tenant";

export async function action(loader: Route.ClientLoaderArgs) {
  // Validate Registration URL Request
  async function validateRegistrationUrlRequest(
    loader: Route.ClientLoaderArgs
  ) {
    let requestBody: RequestRegistrationUrlBody;
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
          message: "Request body is not a json",
          identifier: "INVALID_ATTRIBUTE",
          version: CONSTANTS.API_VERSION,
        },
        status: { status: 400 },
      };
      return { error };
    }
    const validTenantInHeader = await validateTenantOnboarded(loader);
    if (validTenantInHeader instanceof Response) return validTenantInHeader;
    const tenantId = await getTenantIdFromHeader(loader);
    if (tenantId instanceof Response) return tenantId;
    requestBody = (await loader?.request?.json()) as RequestRegistrationUrlBody;
    if (!requestBody?.DigitalPaymentTransaction?.DigitalPaymentTransaction)
      error = {
        items: {
          status: "400",
          message: "Missing DigitalPaymentTransaction in request body",
          identifier: "MISSING_MANDATORY_ATTRIBUTE",
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
      tenantId,
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

    if (loader.request.method === "POST") {
      // All validations on request and request body
      const validateRequest = await validateRegistrationUrlRequest(loader);
      if (validateRequest instanceof Response) {
        return validateRequest;
      }

      if (validateRequest?.error) {
        return Response.json(
          validateRequest?.error?.items,
          validateRequest?.error?.status
        );
      }

      // If we get here, authorization was successful (authResponse is true)
      console.log("Authorization successful");
      const registrationUrl = (await requestRegistrationUrl({
        ...validateRequest?.requestBody,
        tenantId: validateRequest?.tenantId,
      })) as RequestRegistrationUrlResponse;
      const response = Response.json(registrationUrl, {
        status: 200,
        headers: {
          "X-SAP-TenantId": validateRequest?.tenantId ?? "N/A",
        },
      });
      console.log("Request Registration URL successful with status 200");
      return response;
    }
    return Response.json({ message: "Method Not Allowed" }, { status: 405 });
  } catch (error) {
    console.log("🚀 ~ action ~ error:", error);
    const syntaxErrorMessage = error instanceof SyntaxError;
    if (syntaxErrorMessage)
      return Response.json(
        {
          status: "400",
          message: "Request body is not a json",
          identifier: "INVALID_ATTRIBUTE",
          version: CONSTANTS.API_VERSION,
        },
        { status: 400 }
      );
    return Response.json({ error }, { status: 500 });
  }
}

export function loader() {
  return redirect("/error");
}
