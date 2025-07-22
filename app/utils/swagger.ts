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
      name: "Test",
      description: "Test endpoints"
    }
  ],
  paths: {
    "/mock-token": {
      post: {
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
      post: {
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
