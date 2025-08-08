import { validateJwt } from "~/utils/auth";
import type { Route } from "./+types/test";
import { redirect } from "react-router";
import { CONSTANTS } from "~/utils/constants";
import type {
  RequestRegistrationUrlBody,
  RequestRegistrationUrlResponse,
} from "~/types/registration";
import { requestRegistrationUrl } from "~/psp/registration/RequestRegistrationUrl";
import { getTenantIdFromHeader, isTenantOnboarded, validateTenantOnboarded } from "~/utils/tenant";
import { validateJsonHeader } from "~/utils/validateJsonContentYpe";
import { buildErrorResponse } from "~/utils/buildErrorResponse";

export async function action(loader: Route.ClientLoaderArgs) {
  // Validate Registration URL Request
  async function validateRegistrationUrlRequest(
    loader: Route.ClientLoaderArgs
  ) {
    let requestBody: RequestRegistrationUrlBody;
    let error;
    // Verify if json request, so that we can extract payload
    const validateContentTypeHeader = await validateJsonHeader(loader?.request);
    if (!validateContentTypeHeader || validateContentTypeHeader instanceof Response) return validateContentTypeHeader;
    const validTenantInHeader = await validateTenantOnboarded(loader);
    if (!validTenantInHeader || validTenantInHeader instanceof Response) return validTenantInHeader;
    const tenantId = await getTenantIdFromHeader(loader);
    if (tenantId instanceof Response) return tenantId;
    const tenantOnboarded = await isTenantOnboarded(tenantId);
    if (!tenantOnboarded)
      return buildErrorResponse({
        message: 'Tenant not onboarded',
        status: 404,
        identifier: 'MISSING_CONFIGURATION',
      })
    requestBody = (await loader?.request?.json()) as RequestRegistrationUrlBody;
    if (!requestBody?.DigitalPaymentTransaction?.DigitalPaymentTransaction)
      return buildErrorResponse({
        status: 400,
        message: "Missing DigitalPaymentTransaction in request body",
        identifier: "MISSING_MANDATORY_ATTRIBUTE",
      })
    if (!requestBody?.RedirectURL)
      return buildErrorResponse({
        status: 400,
        message: "Missing RedirectURL in request body",
        identifier: "MISSING_MANDATORY_ATTRIBUTE",
      })
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
    return buildErrorResponse({
      message: "Method Not Allowed",
      status: 405,
      identifier: "INTERNAL_ERROR"
    })
  } catch (error) {
    console.log("🚀 ~ action ~ error:", error);
    const syntaxErrorMessage = error instanceof SyntaxError;
    if (syntaxErrorMessage)
      return buildErrorResponse({
        status: 400,
        message: "Request body is not a json",
        identifier: "INVALID_ATTRIBUTE",
      })
    return buildErrorResponse({
      status: 500,
      message: (error as Error)?.message,
      identifier: "INTERNAL_ERROR",
    })
  }
}

export function loader() {
  return redirect("/error");
}
