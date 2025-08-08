import type {
  StorePaymentCardErrorResponse,
  StorePaymentCardPayload,
} from "~/types/dpa";
import { getDpaHeaders } from "./dpaHeaders";

export async function storePaymentCard(payload: StorePaymentCardPayload) {
  console.log("🚀 ~ storePaymentCard ~ payload:", payload);
  const headers = await getDpaHeaders(payload) as Headers;
  const result = await fetch(
    `${process.env.EXTERNAL_ADAPTER_UAA_URL}/storePaymentCard`,
    {
      method: "POST",
      headers,
      body: JSON.stringify(payload),
    }
  );
  if (result.status === 204) return true;
  console.log("🚀 ~ storePaymentCard ~ result:", await result?.text())
  return result.json() as Promise<StorePaymentCardErrorResponse>;
}
