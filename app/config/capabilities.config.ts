/**
 * Capabilities Configuration
 * Defines which payment processing capabilities are supported by this adapter
 */

/**
 * Payment Card Capabilities
 * 
 * Possible capabilities:
 * - PAYMENT_CARD_AUTHORIZATION: Authorize a payment card transaction
 * - PAYMENT_CARD_CAPTURE: Capture a previously authorized payment card transaction
 * - PAYMENT_CARD_REFUND: Refund a previously captured payment card transaction
 * - PAYMENT_CARD_REVERSAL: Reverse a previously authorized payment card transaction
 * - PAYMENT_CARD_INFORMATION: Retrieve information about a payment card transaction
 * - PAYMENT_CARD_TOKENIZATION: Tokenize payment card data for future use
 * - PAYMENT_CARD_DETOKENIZATION: Convert a token back to payment card data
 */
// Define types for our capabilities
type PaymentCardCapability = 'cc_authorize' | 'cc_register' | 'PAYMENT_CARD_TOKENIZATION' | 'PAYMENT_CARD_DETOKENIZATION';
type ExternalPaymentCapability = 'EXTERNAL_PAYMENT_INITIATION' | 'EXTERNAL_PAYMENT_COMPLETION' | 'EXTERNAL_PAYMENT_INFORMATION' | 'EXTERNAL_PAYMENT_CANCELLATION' | 'EXTERNAL_PAYMENT_REFUND';
type AdditionalCapability = 'MULTI_CURRENCY' | 'BATCH_PROCESSING' | 'RECURRING_PAYMENTS' | 'INSTALLMENT_PAYMENTS' | 'FRAUD_DETECTION';

const paymentCardCapabilities: PaymentCardCapability[] = [
 'cc_register',
  'cc_authorize'
  // Uncomment capabilities as they are implemented
  // 'PAYMENT_CARD_TOKENIZATION',
  // 'PAYMENT_CARD_DETOKENIZATION'
];

/**
 * External Payment Capabilities
 * 
 * Possible capabilities:
 * - EXTERNAL_PAYMENT_INITIATION: Initiate an external payment process
 * - EXTERNAL_PAYMENT_COMPLETION: Complete a previously initiated external payment
 * - EXTERNAL_PAYMENT_CANCELLATION: Cancel a previously initiated external payment
 * - EXTERNAL_PAYMENT_REFUND: Refund a previously completed external payment
 * - EXTERNAL_PAYMENT_INFORMATION: Retrieve information about an external payment
 */
const externalPaymentCapabilities: ExternalPaymentCapability[] = [
  //'EXTERNAL_PAYMENT_INITIATION',
  //'EXTERNAL_PAYMENT_COMPLETION',
  //'EXTERNAL_PAYMENT_INFORMATION'
  // Uncomment capabilities as they are implemented
  // 'EXTERNAL_PAYMENT_CANCELLATION',
  // 'EXTERNAL_PAYMENT_REFUND'
];

/**
 * Additional Capabilities
 * 
 * Possible capabilities:
 * - BATCH_PROCESSING: Support for batch processing of transactions
 * - RECURRING_PAYMENTS: Support for recurring payment schedules
 * - INSTALLMENT_PAYMENTS: Support for installment payment plans
 * - MULTI_CURRENCY: Support for multiple currencies
 * - FRAUD_DETECTION: Support for fraud detection services
 */
const additionalCapabilities: AdditionalCapability[] = [
  //'MULTI_CURRENCY'
  // Uncomment capabilities as they are implemented
  // 'BATCH_PROCESSING',
  // 'RECURRING_PAYMENTS',
  // 'INSTALLMENT_PAYMENTS',
  // 'FRAUD_DETECTION'
];

// Combine all capabilities
export const allCapabilities: (PaymentCardCapability | ExternalPaymentCapability | AdditionalCapability)[] = [
  ...paymentCardCapabilities,
  ...externalPaymentCapabilities,
  ...additionalCapabilities
];

/**
 * Supported Payment Type Properties
 * Defines the properties for each supported payment type
 */
type PaymentTypeIcon = {
  url: string;
};

type PaymentTypeIcons = {
  default: PaymentTypeIcon;
  light: PaymentTypeIcon;
  dark: PaymentTypeIcon;
};

export type SupportedPaymentTypeProperty = {
  paymentType: string;
  supportsExternalDigitalPaymentAuthorization: boolean;
  supportsExternalDigitalPaymentCapture: boolean;
  supportsPaymentPageConsumerManagedTokens: boolean;
  supportsPaymentPageTransactionTypeAuthorization: boolean;
  supportsPaymentPageTransactionTypeDirectCapture: boolean;
  paymentPagePluginPath?: string;
  isPaymentPageObsolete: boolean;
  paymentTypeRequiredProperties: string[];
  paymentTypeIcon: PaymentTypeIcons;
};

// Get PSP code from environment variable
const pspCode = process.env.PSP_CODE || 'default';

export const supportedPaymentTypeProperties: SupportedPaymentTypeProperty[] = [
  {
    paymentType: 'A3', // Credit Card
    supportsExternalDigitalPaymentAuthorization: false,
    supportsExternalDigitalPaymentCapture: false,
    supportsPaymentPageConsumerManagedTokens: false,
    supportsPaymentPageTransactionTypeAuthorization: true,
    supportsPaymentPageTransactionTypeDirectCapture: true,
    //paymentPagePluginPath: `/plugins/${pspCode}/creditcard`,
    isPaymentPageObsolete: false,
    paymentTypeRequiredProperties: [
      //'ShippingAddress-CityName',
      //'Customer'
    ],
    paymentTypeIcon: {
      default: {
        url: `https://static.sapdigitalpayment.com/icons/${pspCode}/creditcard.svg`
      },
      light: {
        url: `https://static.sapdigitalpayment.com/icons/${pspCode}/creditcard-light.svg`
      },
      dark: {
        url: `https://static.sapdigitalpayment.com/icons/${pspCode}/creditcard-dark.svg`
      }
    }
  },
  {
    paymentType: 'PP', // PayPal
    supportsExternalDigitalPaymentAuthorization: false,
    supportsExternalDigitalPaymentCapture: false,
    supportsPaymentPageConsumerManagedTokens: false,
    supportsPaymentPageTransactionTypeAuthorization: false,
    supportsPaymentPageTransactionTypeDirectCapture: false,
    paymentPagePluginPath: `/plugins/${pspCode}/paypal`,
    isPaymentPageObsolete: false,
    paymentTypeRequiredProperties: [
      'BillingAddress-AddressLine2',
      'BillingAddress-CountryThreeDigitISOCode'
    ],
    paymentTypeIcon: {
      default: {
        url: `https://static.sapdigitalpayment.com/icons/${pspCode}/paypal.svg`
      },
      light: {
        url: `https://static.sapdigitalpayment.com/icons/${pspCode}/paypal-light.svg`
      },
      dark: {
        url: `https://static.sapdigitalpayment.com/icons/${pspCode}/paypal-dark.svg`
      }
    }
  }
];

// Export individual capability groups for more granular access
export {
  paymentCardCapabilities,
  externalPaymentCapabilities,
  additionalCapabilities
};
