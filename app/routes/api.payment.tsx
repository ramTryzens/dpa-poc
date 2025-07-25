import { validateJwt } from "~/utils/auth";
import type { Route } from "./+types/test";
import { getQuery } from "~/utils/getQuery";
import type { PSPPaymentResponseBody } from "~/types/psp";
import { CONSTANTS } from "~/utils/constants";
import { fetchTransactionDetails } from "~/psp/fetchTransactionDetails";

export async function loader(loader: Route.ClientLoaderArgs) {
  // Validate Registration URL Request
  async function validateRegistrationUrlRequest(
    loader: Route.ClientLoaderArgs
  ) {
    let requestBody;
    let error;
    const queryParams = (await getQuery(loader.request)) as unknown;
    const {
      transactionId = undefined,
      status = undefined,
      DigitalPaymentTransaction = undefined,
    } = queryParams as PSPPaymentResponseBody;
    if (!transactionId)
      error = {
        items: {
          status: "400",
          message: "Missing transaction id in request body",
          identifier: "MISSING_MANDATORY_ATTRIBUTE",
          version: CONSTANTS.API_VERSION,
        },
        status: { status: 400 },
      };
    if (!status)
      error = {
        items: {
          status: "400",
          message: "Missing status in request body",
          identifier: "MISSING_MANDATORY_ATTRIBUTE",
          version: CONSTANTS.API_VERSION,
        },
        status: { status: 400 },
      };
    if (!DigitalPaymentTransaction)
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
    requestBody = {
      pspTransactionId: transactionId as string,
      status,
      DigitalPaymentTransaction,
    };

    return {
      requestBody,
    };
  }
  const pspResponse = await validateRegistrationUrlRequest(loader);
  if (pspResponse?.error) {
    return Response.json(pspResponse?.error?.items, pspResponse?.error?.status);
  }

  const pspTransactionDetails = await fetchTransactionDetails({
    ...pspResponse?.requestBody,
  });

  return Response.json(
    {
      method: loader?.request?.method,
      pspTransactionId: pspResponse?.requestBody?.pspTransactionId,
      DigitalPaymentTransaction:
        pspResponse?.requestBody?.DigitalPaymentTransaction,
      pspTransactionDetails
    },
    { status: 200 }
  );
}
