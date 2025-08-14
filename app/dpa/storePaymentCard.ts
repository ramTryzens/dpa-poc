import type {
  StorePaymentCardErrorResponse,
  StorePaymentCardPayload,
} from "~/types/dpa";
import { getDpaHeaders } from "./dpaHeaders";

export async function storePaymentCard(payload: StorePaymentCardPayload) {
  const headers = await getDpaHeaders(payload) as Headers;
  console.log("🚀 ~ storePaymentCard ~ payload:", payload)
  console.log("🚀 ~ storePaymentCard ~ URL:", `${process.env.EXTERNAL_ADAPTER_UAA_URL}/core/v1/storePaymentCard`);

  const result = await fetch(
    `${process.env.EXTERNAL_ADAPTER_UAA_URL}/core/v1/storePaymentCard`,
    {
      method: "POST",
      headers,
      body: JSON.stringify(payload),
    }
  );
  console.log("🚀 ~ storePaymentCard ~ result.status:", result.status)
  if (result.status === 204) return true;
  console.log("🚀 ~ storePaymentCard ~ result:", await result?.text())
  return result.json() as Promise<StorePaymentCardErrorResponse>;
}
