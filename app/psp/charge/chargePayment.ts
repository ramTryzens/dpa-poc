import type { ChargePaymentParams, ChargePaymentPayload, ChargePaymentResponse } from "~/types/psp";
import { getMockPSPDomain } from "../utils/getMockPSPUrl";
import { getMockPSPHeaders } from "../utils/getMockPSPHeaders";

export async function chargePayment(params: ChargePaymentParams) {
  const domain = await getMockPSPDomain();
  const headers = await getMockPSPHeaders();
  const body = JSON.stringify(params);
  const options = {
    method: "POST",
    headers,
  };
  const payload = {
    url: domain,
    options,
    body,
  };
  const charge = await chargeMockPSP(payload);
  console.log("🚀 ~ chargePayment ~ charge:", charge)
  return charge;
}

async function chargeMockPSP(payload: ChargePaymentPayload) {
  const { url = undefined, options = undefined, body = undefined } = payload;
  if (!url || !options || !body) throw new Error("Missing fields to call PSP");
  const result = await fetch(`${url}/mock/psp/charge`, {
    method: options.method,
    headers: options.headers,
    body: body as string,
  });
  const response = await result?.json();
  return response as ChargePaymentResponse;
}
