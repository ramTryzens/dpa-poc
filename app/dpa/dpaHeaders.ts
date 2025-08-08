import type { StorePaymentCardPayload } from "~/types/dpa";

export async function getDpaHeaders(payload: StorePaymentCardPayload) {
  const { headers = {} } = payload;
  return headers
}