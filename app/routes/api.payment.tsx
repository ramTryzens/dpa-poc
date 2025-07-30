import { validateJwt } from "~/utils/auth";
import type { Route } from "./+types/test";
import { getQuery } from "~/utils/getQuery";
import type {
  FetchTransactionDetailsResponse,
  PSPPaymentResponseBody,
} from "~/types/psp";
import { CONSTANTS } from "~/utils/constants";
import { fetchTransactionDetails } from "~/psp/fetchTransactionDetails";
import { chargePayment } from "~/psp/charge/chargePayment";
import { getPspPaymentSuccessStatus } from "~/psp/utils/getPspPaymentSuccessStatus";

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
      tenantId = undefined,
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
    if (!tenantId)
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
      tenantId,
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

  async function getChargePaymentPayload(
    pspTransactionDetails: FetchTransactionDetailsResponse
  ) {
    const token = pspTransactionDetails?.token;
    const cartTotalAmount = pspTransactionDetails?.cartTotalAmount;
    const currency = "USD";
    const paymentAction = "auth_only";
    const returnUrl = pspTransactionDetails?.returnUrl;
    return {
      token,
      cartTotalAmount,
      currency,
      paymentAction,
      returnUrl,
    };
  }

  const chargePaymentPayload = await getChargePaymentPayload(
    pspTransactionDetails
  );
  const charge = await chargePayment(chargePaymentPayload);
  const pspSuccessStatuses = getPspPaymentSuccessStatus();
  const DigitalPaytTransResult =
    pspResponse?.requestBody?.status === "success"
      ? "01"
      : pspResponse?.requestBody?.status === "cancel"
      ? "05"
      : "02";
  const [expiryMonth = "", expiryYear = ""] =
    charge?.cardDetails?.expiryDate?.split("/");
  if (!pspSuccessStatuses.includes(charge?.action)) {
    return Response.json({
      DigitalPaymentTransaction: {
        DigitalPaymentTransaction:
          pspResponse?.requestBody?.DigitalPaymentTransaction,
        DigitalPaytTransResult,
      },
      PaymentCard: {
        PaytCardByPaytServiceProvider: charge?.transactionId, //"384738665438646"
        PaymentCardType: charge?.cardDetails?.cardType, //"DPVI"
        PaymentCardExpirationMonth: expiryMonth, // "04"
        PaymentCardExpirationYear: expiryYear,
        PaymentCardMaskedNumber: charge?.cardDetails?.cardNumber,
        PaymentCardHolderName: charge?.cardDetails?.cardName,
      },
    });
  }

  return Response.json(
    {
      DigitalPaymentTransaction: {
        DigitalPaymentTransaction:
          pspResponse?.requestBody?.DigitalPaymentTransaction,
        DigitalPaytTransResult,
      },
      PaymentCard: {
        PaytCardByPaytServiceProvider: charge?.transactionId, //"384738665438646"
        PaymentCardType: charge?.cardDetails?.cardType, //"DPVI"
        PaymentCardExpirationMonth: expiryMonth, // "04"
        PaymentCardExpirationYear: expiryYear,
        PaymentCardMaskedNumber: charge?.cardDetails?.cardNumber,
        PaymentCardHolderName: charge?.cardDetails?.cardName,
      },
    },
    { status: 200, headers: {
      'X-SAP-TenantId': pspResponse?.requestBody?.tenantId ?? 'N/A'
    } }
  );
  // return Response.json(
  //   {
  //     DigitalPaymentTransaction: {
  //       DigitalPaymentTransaction:
  //         pspResponse?.requestBody?.DigitalPaymentTransaction,
  //       DigitalPaytTransResult,
  //     },
  //     PaymentCard: {
  //       PaytCardByPaytServiceProvider: charge?.transactionId, //"384738665438646"
  //       PaymentCardType: charge?.cardDetails?.cardType, //"DPVI"
  //       PaymentCardExpirationMonth: expiryMonth, // "04"
  //       PaymentCardExpirationYear: expiryYear,
  //       PaymentCardMaskedNumber: charge?.cardDetails?.cardNumber,
  //       PaymentCardHolderName: charge?.cardDetails?.cardName,
  //     },
  //   },
  //   { status: 200 }
  // );
}

export async function action(data: Route.ClientActionArgs) {
  const body = await data.request.json();
  return Response.json({}, { status: 200 });
}
