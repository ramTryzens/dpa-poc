// OpenAPI specification for the SAP DPA Adapter API
export const openApiSpec = {
  openapi: "3.0.0",
  info: {
    title: "SAP DPA Adapter API",
    description: "API documentation for the SAP Digital Payments Adapter",
    version: "1.0.0",
    contact: {
      name: "API Support",
      email: "support@example.com"
    }
  },
  servers: [
    {
      url: "http://localhost:5173",
      description: "Local development server"
    }
  ],
  tags: [
    {
      name: "Authentication",
      description: "Authentication related endpoints"
    },
    {
      name: "Tenant",
      description: "Tenant management endpoints"
    },
    {
      name: "Cards",
      description: "Payment card related endpoints"
    },
    {
      name: "Capabilities",
      description: "PSP capabilities endpoints"
    },
    {
      name: "Test",
      description: "Test endpoints"
    }
  ],
  paths: {
    "/mock-token": {
      get: {
        tags: ["Authentication"],
        summary: "Generate a mock JWT token",
        description: "Generates a mock JWT token for development and testing purposes",
        operationId: "generateMockToken",
        responses: {
          "200": {
            description: "Successful operation",
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  properties: {
                    mockToken: {
                      type: "string",
                      description: "Generated mock JWT token"
                    }
                  }
                }
              }
            }
          },
          "500": {
            description: "Internal server error",
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  properties: {
                    error: {
                      type: "boolean",
                      example: true
                    }
                  }
                }
              }
            }
          }
        }
      }
    },
    "/core/v1/tenants/{tenantId}": {
      put: {
        tags: ["Tenant"],
        summary: "Onboard a new tenant",
        description: "Creates a new tenant with the specified tenant ID",
        operationId: "onboardTenant",
        parameters: [
          {
            name: "tenantId",
            in: "path",
            description: "ID of the tenant to onboard",
            required: true,
            schema: {
              type: "string"
            }
          }
        ],
        requestBody: {
          description: "Tenant configuration details",
          required: true,
          content: {
            "application/json": {
              schema: {
                type: "object",
                properties: {
                  tenantSubDomain: {
                    type: "string",
                    description: "Subdomain for the tenant",
                    example: "acme-corp"
                  },
                  tenantPlan: {
                    type: "string",
                    description: "Subscription plan for the tenant",
                    enum: ["basic", "standard", "premium"],
                    example: "standard"
                  }
                },
                required: ["tenantSubDomain", "tenantPlan"]
              }
            }
          }
        },
        security: [
          {
            bearerAuth: []
          }
        ],
        responses: {
          "200": {
            description: "Tenant successfully onboarded",
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  properties: {
                    tenantId: {
                      type: "string",
                      description: "ID of the onboarded tenant"
                    },
                    createdAt: {
                      type: "string",
                      format: "date-time",
                      description: "Timestamp when the tenant was created"
                    },
                    updatedAt: {
                      type: "string",
                      format: "date-time",
                      description: "Timestamp when the tenant was last updated"
                    }
                  }
                }
              }
            }
          },
          "401": {
            description: "Unauthorized - Invalid or missing authentication token",
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  properties: {
                    status: {
                      type: "string",
                      example: "401"
                    },
                    message: {
                      type: "string",
                      example: "Authorization header missing or invalid"
                    }
                  }
                }
              }
            }
          },
          "500": {
            description: "Internal server error",
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  properties: {
                    error: {
                      type: "object",
                      description: "Error details"
                    }
                  }
                }
              }
            }
          }
        }
      },
      delete: {
        tags: ["Tenant"],
        summary: "Offboard a tenant",
        description: "Removes a tenant with the specified tenant ID",
        operationId: "offboardTenant",
        parameters: [
          {
            name: "tenantId",
            in: "path",
            description: "ID of the tenant to offboard",
            required: true,
            schema: {
              type: "string"
            }
          },
          {
            name: "isMarked",
            in: "query",
            description: "Optional flag to mark the tenant for deletion instead of immediate removal",
            required: false,
            schema: {
              type: "boolean"
            }
          }
        ],
        security: [
          {
            bearerAuth: []
          }
        ],
        responses: {
          "204": {
            description: "Tenant successfully offboarded"
          },
          "401": {
            description: "Unauthorized - Invalid or missing authentication token",
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  properties: {
                    status: {
                      type: "string",
                      example: "401"
                    },
                    message: {
                      type: "string",
                      example: "Authorization header missing or invalid"
                    }
                  }
                }
              }
            }
          },
          "404": {
            description: "Tenant not found",
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  properties: {
                    status: {
                      type: "string",
                      example: "404"
                    },
                    message: {
                      type: "string",
                      example: "Tenant not found"
                    }
                  }
                }
              }
            }
          },
          "500": {
            description: "Internal server error",
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  properties: {
                    error: {
                      type: "object",
                      description: "Error details"
                    }
                  }
                }
              }
            }
          }
        }
      }
    },
    "/core/v1/tenant/{tenantId}": {
      get: {
        tags: ["Tenant"],
        summary: "Get tenant details",
        description: "Retrieves details for a specific tenant by ID",
        operationId: "getTenant",
        parameters: [
          {
            name: "tenantId",
            in: "path",
            description: "ID of the tenant to retrieve",
            required: true,
            schema: {
              type: "string"
            }
          }
        ],
        security: [
          {
            bearerAuth: []
          }
        ],
        responses: {
          "200": {
            description: "Successful operation",
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  properties: {
                    tenant: {
                      type: "object",
                      properties: {
                        tenantId: {
                          type: "string",
                          description: "ID of the tenant"
                        },
                        createdAt: {
                          type: "string",
                          format: "date-time",
                          description: "Timestamp when the tenant was created"
                        },
                        updatedAt: {
                          type: "string",
                          format: "date-time",
                          description: "Timestamp when the tenant was last updated"
                        }
                      }
                    }
                  }
                }
              }
            }
          },
          "401": {
            description: "Unauthorized - Invalid or missing authentication token",
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  properties: {
                    status: {
                      type: "string",
                      example: "401"
                    },
                    message: {
                      type: "string",
                      example: "Authorization header missing or invalid"
                    }
                  }
                }
              }
            }
          },
          "500": {
            description: "Internal server error",
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  properties: {
                    error: {
                      type: "object",
                      description: "Error details"
                    }
                  }
                }
              }
            }
          }
        }
      }
    },
    "/test": {
      get: {
        tags: ["Test"],
        summary: "Test endpoint",
        description: "Simple test endpoint that returns the request method",
        operationId: "testEndpoint",
        security: [
          {
            bearerAuth: []
          }
        ],
        responses: {
          "200": {
            description: "Successful operation",
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  properties: {
                    method: {
                      type: "string",
                      description: "HTTP method used for the request"
                    }
                  }
                }
              }
            }
          },
          "401": {
            description: "Unauthorized - Invalid or missing authentication token",
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  properties: {
                    status: {
                      type: "string",
                      example: "401"
                    },
                    message: {
                      type: "string",
                      example: "Authorization header missing or invalid"
                    }
                  }
                }
              }
            }
          },
          "500": {
            description: "Internal server error",
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  properties: {
                    error: {
                      type: "boolean",
                      example: true
                    }
                  }
                }
              }
            }
          }
        }
      }
    },
    "/core/v1/cards/requestregistrationurl": {
      post: {
        tags: ["Cards"],
        summary: "Request payment card registration URL",
        description: "Generates a URL for registering a payment card with a payment service provider",
        operationId: "requestRegistrationUrl",
        requestBody: {
          description: "Registration URL request details",
          required: true,
          content: {
            "application/json": {
              schema: {
                type: "object",
                properties: {
                 
                  DigitalPaymentCommerceType: {
                    type: "string",
                    description: "Type of commerce for digital payment",
                    example: "ECOMMERCE"
                  },
                  DigitalPaymentSessionType: {
                    type: "string",
                    description: "Session type for digital payment",
                    example: "OFFLINE"
                  },
                  DigitalPaymentTransaction: {
                    type: "object",
                    properties: {
                      DigitalPaymentTransaction: {
                        type: "string",
                        description: "Unique identifier for the digital payment transaction",
                        example: "15e86080494113cfc0a48634e47b4f4d956f0b0381a"
                      }
                    },
                    required: ["DigitalPaymentTransaction"]
                  },
                  MerchantAccount: {
                    type: "string",
                    description: "Merchant account identifier",
                    example: "SHOP_USD"
                  },
                  RedirectURL: {
                    type: "string",
                    description: "URL to redirect after registration process",
                    example: "https://mywebshop.example/endpoint"
                  },
                  PaymentServiceProviderCode: {
                    type: "string",
                    description: "Code identifying the payment service provider",
                    example: "DPXX"
                  },
                  DgtlPaytCardRegnCntxtParamVal: {
                    type: "string",
                    description: "Context parameter value for digital payment card registration",
                    example: "voluptate officia veniam"
                  }
                },
                required: ["DigitalPaymentTransaction"]
              }
            }
          }
        },
        security: [
          {
            bearerAuth: []
          }
        ],
        responses: {
          "200": {
            description: "Registration URL successfully generated",
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  properties: {
                    PaymentCardRegistrationURL: {
                      type: "string",
                      description: "URL for payment card registration",
                      example: "https://psp-example.com/register/card/15e86080494113cfc0a48634e47b4f4d"
                    }
                  }
                }
              }
            }
          },
          "400": {
            description: "Bad request - Invalid or missing required parameters",
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  properties: {
                    status: {
                      type: "string",
                      example: "400"
                    },
                    message: {
                      type: "string",
                      example: "Missing DigitalPaymentTransaction in request body"
                    },
                    identifier: {
                      type: "string",
                      example: "MISSING_MANDATORY_ATTRIBUTE"
                    },
                    version: {
                      type: "string",
                      example: "1.0"
                    }
                  }
                }
              }
            }
          },
          "401": {
            description: "Unauthorized - Invalid or missing authentication token",
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  properties: {
                    status: {
                      type: "string",
                      example: "401"
                    },
                    message: {
                      type: "string",
                      example: "Authorization header missing or invalid"
                    }
                  }
                }
              }
            }
          },
          "405": {
            description: "Method not allowed",
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  properties: {
                    message: {
                      type: "string",
                      example: "Method Not Allowed"
                    }
                  }
                }
              }
            }
          },
          "500": {
            description: "Internal server error",
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  properties: {
                    error: {
                      type: "object",
                      description: "Error details"
                    }
                  }
                }
              }
            }
          }
        }
      }
    },
    "/core/v1/capabilities": {
      get: {
        tags: ["Capabilities"],
        summary: "Get PSP capabilities",
        description: "Retrieves the capabilities supported by the payment service provider for the authenticated tenant",
        operationId: "getCapabilities",
        security: [
          {
            bearerAuth: []
          }
        ],
        responses: {
          "200": {
            description: "Capabilities successfully retrieved",
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  properties: {
                    capabilities: {
                      type: "array",
                      description: "List of supported capabilities",
                      items: {
                        type: "string"
                      },
                      example: ["PAYMENT_CARD_REGISTRATION", "EXTERNAL_PAYMENT"]
                    },
                    supportedPaymentTypeProperties: {
                      type: "object",
                      description: "Properties for each supported payment type",
                      additionalProperties: {
                        type: "object"
                      }
                    },
                    paymentPagePath: {
                      type: "string",
                      description: "Path to the payment page for the PSP",
                      example: "/payment-page/DPXX"
                    }
                  }
                }
              }
            }
          },
          "401": {
            description: "Unauthorized - Invalid or missing authentication token",
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  properties: {
                    status: {
                      type: "string",
                      example: "401"
                    },
                    message: {
                      type: "string",
                      example: "Authorization header missing or invalid"
                    }
                  }
                }
              }
            }
          },
          "404": {
            description: "Tenant not found or not onboarded",
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  properties: {
                    error: {
                      type: "string",
                      example: "Tenant not onboarded"
                    }
                  }
                }
              }
            }
          },
          "500": {
            description: "Internal server error",
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  properties: {
                    error: {
                      type: "object",
                      description: "Error details"
                    }
                  }
                }
              }
            }
          }
        }
      }
    }
  },
  components: {
    securitySchemes: {
      bearerAuth: {
        type: "http",
        scheme: "bearer",
        bearerFormat: "JWT",
        description: "JWT token for API authentication"
      }
    }
  }
};
