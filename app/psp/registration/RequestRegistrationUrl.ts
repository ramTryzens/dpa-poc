import { getMockPSPHeaders } from "~/psp/utils/getMockPSPHeaders";
import { getMockPSPUrl } from "~/psp/utils/getMockPSPUrl";
import type { InitializeMockPSPPayload } from "~/types/psp";
import type { RequestRegistrationUrlBody } from "~/types/registration";

export async function requestRegistrationUrl(data: RequestRegistrationUrlBody) {
  const mockPspUrl = await getMockPSPUrl();
  const headers = await getMockPSPHeaders();
  const returnUrl = new URL(`${process.env.adapterbaseurl}/paymenmt`)
  returnUrl.searchParams.append('DigitalPaymentTransaction', data.DigitalPaymentTransaction.DigitalPaymentTransaction)
  const body = {
    cartTotalAmount: 1000,
    currency: "USD",
    paymentAction: "auth_only",
    returnUrl: returnUrl?.toString(),
    webhookUrl: `${process.env.adapterbaseurl}/payment`,
    // tokenize: true,
    showSavedCardOption: true,
  };

  const options = {
    method: "POST",
    headers,
  };

  const psp = await initializeMockPSP({
    url: mockPspUrl,
    body: JSON.stringify(body),
    options,
  });
  return {
    PaymentCardRegistrationURL: psp.redirectUrl,
  };
}

async function initializeMockPSP(payload: InitializeMockPSPPayload) {
  const { url = undefined, options = undefined, body = undefined } = payload;
  if (!url || !options || !body) throw new Error("Missing fields to call PSP");
  const result = await fetch(`${url}/mock/psp/initialize`, {
    method: options.method,
    headers: options.headers,
    body: body as string,
  });
  console.log('result.status')
  console.log(result.status)
  const response = await result?.json();
  return response;
}
