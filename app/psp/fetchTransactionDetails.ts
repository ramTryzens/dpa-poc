import type {
  FetchTransactionDetailsPayload,
  FetchTransactionDetailsResponse,
  PSPFetchTransactionDetailsPayload,
} from "~/types/psp";
import { getMockPSPDomain } from "./utils/getMockPSPUrl";
import { getMockPSPHeaders } from "./utils/getMockPSPHeaders";

export async function fetchTransactionDetails(
  payload: PSPFetchTransactionDetailsPayload
) {
  const mockPspUrl = await getMockPSPDomain();
  const headers = await getMockPSPHeaders();
  const options = {
    method: "GET",
    headers,
  };
  const psp = await transactionDetailsPSP({
    url: mockPspUrl,
    options,
    transactionId: payload?.pspTransactionId
  });
  return psp;
}

async function transactionDetailsPSP(payload: FetchTransactionDetailsPayload) {
  const {
    url = undefined,
    options = undefined,
    transactionId = undefined,
  } = payload;
  if (!url || !options || !transactionId) throw new Error("Missing fields to call PSP");
  const fetchPSPTransactionDetailsUrl = new URL(`${url}/mock/psp/transaction`);
  fetchPSPTransactionDetailsUrl.searchParams.append("transactionId", transactionId);
  const result = await fetch(fetchPSPTransactionDetailsUrl.toString(), {
    method: options.method,
    headers: options.headers,
  });
  const response = await result.json() as FetchTransactionDetailsResponse;
  return response;
}
