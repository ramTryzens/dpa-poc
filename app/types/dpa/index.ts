export interface StorePaymentCardPayload {
  body: {
    pspTransactionId?: string;
    status?: string;
    DigitalPaymentTransaction?: {
      DigitalPaytTransResult: "01" | "05" | "02";
    };
  };
  headers?: Headers | unknown;
}

export interface StorePaymentCardErrorResponse {
  Id: string;
  AdviceItemIndex: number;
  TransactionByPaytSrvcPrvdr: string;
  ReferenceDocument: string;
  AttributeName: string;
  Currency: string;
  Amount: string;
  Date: string;
  Percentage: string;
  Session: string;
  ExpirationMonth: string;
  ExpirationYear: string;
  SchemaViolationPath: string;
  SchemaViolationMessage: string;
  DigitalPaymentTransaction: string;
  ProcessingStatus: string;
}

export interface ChargesPayload {
  Charges: Charge[];
}

export interface Charge {
  DigitalPaymentTransaction: {
    DigitalPaymentTransaction: string;
  };
  Source: {
    PaymentType: string;
    Merchant: {
      Account: string;
    };
    Card: {
      PaytCardByPaytServiceProvider: string;
      PaymentCardType: string;
      PaymentCardExpirationMonth: string;
      PaymentCardExpirationYear: string;
      PaymentCardMaskedNumber: string;
      PaymentCardHolderName: string;
      IssuerIdentificationNumber: string;
    };
  };
  AmountInPaymentCurrency: string;
  PaymentCurrency: string;
  PaymentTransactionDescription: string;
  PaymentIsToBeCaptured: boolean;
  ReferenceDocument: string;
  DigitalPaymentSettlementRef: string;
  CustomerAccountNumber: string;
  AuthorizationByPaytSrvcPrvdr: string;
  AuthorizationDateTime: string; // ISO 8601
  DigitalPaymentCommerceType: string;
  AuthorizationRelationId: string;
  DgtlPaytAuthznScenarioType: string;
  L2L3Data: L2L3Data;
  ChargeIsPartial: boolean;
}

export interface L2L3Data {
  DigitalPaymentExternalOrder: string;
  ExtendedDigitalPaymentExternalOrder: string;
  TransCrcyAlphaISOCode: string;
  TaxAmount: string;
  SalesOrder: string;
  SalesOrderDate: string;
  CustomerInvoice: string;
  DigitalPaymentFreightAmount: string;
  DigitalPaymentDutyAmount: string;
  DigitalPaymentDiscountAmount: string;
  ShipToPartyPostalCode: string;
  ShipToPartyCountryISO3Code: string;
  ShipToPartyRegionISOCode: string;
  ShipFromPartyPostalCode: string;
  ShipFromPartyCountryISO3Code: string;
  DigitalPaymentTaxRateInPercent: string;
  L3Items: L3Item[];
}

export interface L3Item {
  SalesDocumentItem: number;
  ProductName: string;
  Product: string;
  DigitalPaymentSalesDocItmAmt: string;
  UNSPSCCommodityCode: string;
  DgtlPaytSlsDocItmAmtIsGrssAmt: boolean;
  DigitalPaytSlsDocItmHasDiscAmt: boolean;
  DigitalPaymentDiscountAmount: string;
  Quantity: string;
  DigitalPaymentQuantityUnit: string;
  DigitalPaymentSlsDocItmUnitPrc: string;
  Tax: Tax[];
}

export interface Tax {
  DigitalPaymentSlsDocItmTxType: string;
  DigitalPaymentItmIsTaxExempted: boolean;
  DigitalPaymentTaxRateInPercent: string;
  TaxAmount: string;
}
