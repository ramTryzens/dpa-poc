export interface InitializeMockPSPPayload {
  url: string;
  options: {
    method: string;
    headers: HeadersInit;
  };
  body: unknown;
}

export interface PSPPaymentResponseBody {
  transactionId: string;
  status: string;
  DigitalPaymentTransaction: string;
}

export interface PSPFetchTransactionDetailsPayload {
  pspTransactionId?: string;
  status?: string;
  DigitalPaymentTransaction?: string;
}

export interface FetchTransactionDetailsPayload {
  transactionId?: string;
  url: string;
  options: {
    method: string;
    headers: HeadersInit;
  };
}
