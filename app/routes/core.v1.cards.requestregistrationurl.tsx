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
import type { RequestRegistrationUrlBody, RequestRegistrationUrlResponse } from "~/types/registration";
import { requestRegistrationUrl } from "~/db/registration/RequestRegistrationUrl";

export async function action(loader: Route.ClientLoaderArgs) {
  // Validate Registration URL Request
  async function validateRegistrationUrlRequest(loader: Route.ClientLoaderArgs) {
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
      return { error }
    }
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
    };
  }
// const x = {
//   DigitalPaymentTransaction: 'unique identifier', // Request
// }
// const y = {
//   DigitalPaymentTransaction: 'unique identifier', // Response
//   DigitalPaytTransResult: '[01 - Successful, 02 - Not successful],[for payment card registration also 03 – Pending, 04 – Timeout, 05 - Canceled]',
//   DigitalPaytTransRsltDesc: 'description of the result of the transaction',
//   AdapterToCoreException: 'object',
//   RequestByPaytSrvcPrvdr: 'transactionIdFromPSP' // identifier that may be issued by the PSP to uniquely identify a request or a transaction
// }
  // Validate Offboard Request

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
      if (validateRequest?.error) {
        return Response.json(
          validateRequest?.error?.items,
          validateRequest?.error?.status
        );
      }

      // If we get here, authorization was successful (authResponse is true)
      console.log("Authorization successful");
      const registrationUrl = await requestRegistrationUrl({
        ...validateRequest?.requestBody,
      }) as RequestRegistrationUrlResponse;
      const response = Response.json(registrationUrl, { status: 200 });
      console.log("Request Registration URL successful with status 200");
      return response;
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
