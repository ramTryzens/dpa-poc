export interface RequestRegistrationUrlBody {
  tenantSubdomain: string;
  tenantPlan: string;
  DigitalPaymentCommerceType: string; // Eg: "ECOMMERCE"
  DigitalPaymentSessionType: string; // Eg: "OFFLINE"
  DigitalPaymentTransaction: {
    DigitalPaymentTransaction: string; // Eg: "15e86080494113cfc0a48634e47b4f4d956f0b0381a"
  };
  MerchantAccount: string; // Eg: "SHOP_USD or SALES_NORTH or 12345@psp_name.com"
  RedirectURL: string; // Eg: "https://mywebshop.example/endpoint"
  PaymentServiceProviderCode: string; // Eg: "DPXX"
  DgtlPaytCardRegnCntxtParamVal: string; // Eg: "voluptate officia veniam"
}

export interface RequestRegistrationUrlResponse {
  PaymentCardRegistrationURL: string;
}
