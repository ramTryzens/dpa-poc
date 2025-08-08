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
import { isTenantIdFormatValid } from "~/utils/validateTenant";
import { OffboardTenant } from "./core.v1.tenants.offboard";
import type { Charge, ChargesPayload } from "~/types/dpa";
import { buildErrorResponse } from "~/utils/buildErrorResponse";
import { chargePayment } from "~/psp/charge/chargePayment";
import type { ChargePaymentParams } from "~/types/psp";

export async function action(loader: Route.ClientLoaderArgs) {
  // Validate Onboard Request
  async function validateDPAChargeRequest(loader: Route.ClientLoaderArgs) {
    let requestBody: ChargesPayload;
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
      return { error };
    }
    requestBody = (await loader.request.json()) as ChargesPayload;
    // if (!requestBody?.tenantPlan || !requestBody?.tenantSubdomain)
    //   error = {
    //     items: {
    //       status: "400",
    //       message: "Missing tenantSubdomain or tenantPlan in request body",
    //       identifier: "MISSING_MANDATORY_ATTRIBUTE",
    //       version: CONSTANTS.API_VERSION,
    //     },
    //     status: { status: 400 },
    //   };
    const errors: string[] = [];
    requestBody?.Charges?.forEach((charge) => {
      if (
        typeof charge.DigitalPaymentTransaction?.DigitalPaymentTransaction !==
        "string"
      ) {
        errors.push("DigitalPaymentTransaction.DigitalPaymentTransaction");
      }
      if (typeof charge.Source?.Merchant?.Account !== "string") {
        errors.push("Source.Merchant.Account");
      }
      if (typeof charge.AmountInPaymentCurrency !== "string") {
        errors.push("AmountInPaymentCurrency");
      }
      if (typeof charge.PaymentCurrency !== "string") {
        errors.push("PaymentCurrency");
      }
      if (typeof charge.PaymentTransactionDescription !== "string") {
        errors.push("PaymentTransactionDescription");
      }
      if (typeof charge.PaymentIsToBeCaptured !== "boolean") {
        errors.push("PaymentIsToBeCaptured");
      }
      if (typeof charge.ReferenceDocument !== "string") {
        errors.push("ReferenceDocument");
      }
      if (typeof charge.AuthorizationByPaytSrvcPrvdr !== "string") {
        errors.push("AuthorizationByPaytSrvcPrvdr");
      }
      if (typeof charge.AuthorizationDateTime !== "string") {
        errors.push("AuthorizationDateTime");
      }
      if (typeof charge.CustomerAccountNumber !== "string") {
        errors.push("CustomerAccountNumber");
      }
      if (typeof charge.DigitalPaymentCommerceType !== "string") {
        errors.push("DigitalPaymentCommerceType");
      }
    });
    if (errors.length)
      errors.length > 1
        ? (error = {
            items: {
              status: "400",
              message: `Missing ${errors.join(",")} in request body`,
              identifier: "MISSING_MANDATORY_ATTRIBUTE",
              version: CONSTANTS.API_VERSION,
            },
            status: { status: 400 },
          })
        : (error = {
            items: {
              status: "400",
              message: `Missing ${errors} in request body`,
              identifier: "MISSING_MANDATORY_ATTRIBUTE",
              version: CONSTANTS.API_VERSION,
            },
            status: { status: 400 },
          });

    if (error?.items)
      return {
        error,
      };

    return {
      requestBody,
    };
  }

  // Validate Onboard Request Params
  async function validateOnboardParams(loader: Route.ClientLoaderArgs) {
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
    else if (loader.params) {
      const isValid = await isTenantIdFormatValid(
        (loader?.params as OnboardTenantLoader).tenantId
      );
      if (!isValid)
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
      return {
        ...(loader?.params as OnboardTenantLoader),
      };
    } else
      return {
        ...(loader?.params as OnboardTenantLoader),
      };
  }

  function toCents(amountStr: string) {
  // Remove commas, spaces, and currency symbols
  const clean = amountStr.replace(/[^0-9.]/g, '');

  // Use string split instead of float math to avoid precision loss
  const [whole, fraction = ""] = clean.split(".");

  // Ensure fraction has exactly two digits
  const fractionPadded = (fraction + "00").slice(0, 2);

  return parseInt(whole + fractionPadded, 10);
}

  function getAllChargePaymentPayload(pspTransactionDetails: Charge) {
    const token =
      pspTransactionDetails?.Source?.Card?.PaytCardByPaytServiceProvider;
    const cartTotalAmount = toCents(pspTransactionDetails?.AmountInPaymentCurrency);
    const currency = pspTransactionDetails?.PaymentCurrency;
    const paymentAction = "auth_only";
    const returnUrl = 'https://google.com' as string; // Do not know what to do.
    return {
      token,
      cartTotalAmount,
      currency,
      paymentAction,
      returnUrl,
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
      const validateRequest = await validateDPAChargeRequest(loader);
      if (validateRequest?.error) {
        return buildErrorResponse({
          ...validateRequest?.error?.items,
          status: validateRequest?.error?.status?.status,
        });
      }
      const charge = validateRequest.requestBody?.Charges?.map(async (charge) => {
        const chargePayload = getAllChargePaymentPayload(charge) as ChargePaymentParams
        const chargeCall = await chargePayment(chargePayload)
        return chargeCall;
      });

      // Wait for all requests to finish
      const results = await Promise.all(charge);
      return results;
    }
  } catch (error) {
    console.log("🚀 ~ action ~ error:", error);
    return Response.json({ error }, { status: 500 });
  }
}

export function loader() {
  return redirect("/error");
}
