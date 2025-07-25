import { type RouteConfig, index, route } from "@react-router/dev/routes";

export default [
  index("routes/home.tsx"),
  route("test", "routes/test.tsx"),
  route("core/v1/tenants/:tenantId", "routes/core.v1.tenants.onboard.tsx"),
  route("core/v1/tenant/:tenantId", "routes/core.v1.tenant.tsx"),
  route("core/v1/cards/requestregistrationurl", "routes/core.v1.cards.requestregistrationurl.tsx"),
  route("mock-token", "routes/mock-token.tsx"),
  route("api-docs", "routes/api-docs.tsx"),
  route("api-docs.json", "routes/api-docs.json.tsx"),
  route("payment", "routes/api.payment.tsx"),

  // Catch-all fallback route (must come last)
  route("*", "routes/error-boundary.tsx")
] satisfies RouteConfig;
