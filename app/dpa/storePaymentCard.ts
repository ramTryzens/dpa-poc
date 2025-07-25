import type { StorePaymentCardPayload } from "~/types/dpa";

export async function storePaymentCard(payload: StorePaymentCardPayload) {
    console.log("🚀 ~ storePaymentCard ~ payload:", payload)
}