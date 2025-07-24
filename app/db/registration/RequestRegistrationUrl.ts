import { getMockPSPHeaders } from "~/psp/utils/GetMockPSPHeaders";
import { getMockPSPUrl } from "~/psp/utils/GetMockPSPUrl";
import type { InitializeMockPSPPayload } from "~/types/psp";
import type { RequestRegistrationUrlBody } from "~/types/registration";

export async function requestRegistrationUrl(data: RequestRegistrationUrlBody) {
  const mockPspUrl = await getMockPSPUrl();
  const headers = await getMockPSPHeaders();
  const body = {
    cartTotalAmount: 1000,
    currency: "USD",
    paymentAction: "auth_only",
    returnUrl: "https://fb4cnp4q-5176.inc1.devtunnels.ms/test",
    webhookUrl: "https://fb4cnp4q-5176.inc1.devtunnels.ms/test",
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
  const response = await result?.json();
  return response;
}
