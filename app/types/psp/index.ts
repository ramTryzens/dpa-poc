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

export interface FetchTransactionDetailsResponse {
  id: string;
  token: string;
  pspAccountId: string;
  cartTotalAmount: number;
  capturedAmount: number;
  refundedAmount: number;
  voidAmount: number;
  returnUrl: string;
  webhookUrl: string;
  status: string; // AUTHORIZED
  createdAt: string;
  updatedAt: string;
  transactionInfo: {
    id: string;
    payload: string;
    action: string;
    mock_psp_transactionsId: string;
    createdAt: string;
    updatedAt: string;
  }[];
  cardDetails: PSPCardeDetails;
}

export interface PSPCardeDetails {
  cardName: string;
  cardNumber: string;
  cardType: string;
  expiryDate: string;
  isPermanent: boolean;
}

export interface ChargePaymentParams {
  token: string;
  cartTotalAmount: number;
  currency: string;
  paymentAction: string;
  returnUrl: string;
}

export interface ChargePaymentPayload {
  url: string;
  options: {
    method: string;
    headers: HeadersInit;
  };
  body: unknown;
}

export interface ChargePaymentResponse {
  transactionId: string;
  action: string;
  backUrl: string;
  cardDetails: {
    cardName: string;
    cardNumber: string;
    cardType: string;
    expiryDate: string;
    isPermanent: true;
  };
}
