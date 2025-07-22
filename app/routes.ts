import { type RouteConfig, index, route } from "@react-router/dev/routes";

export default [
  index("routes/home.tsx"),
  route("test", "routes/test.tsx"),
  route("core/v1/tenants/:tenantId", "routes/core.v1.tenants.onboard.tsx"),
  route("core/v1/tenant/:tenantId", "routes/core.v1.tenant.tsx"),
  route("mock-token", "routes/mock-token.tsx"),


  // Catch-all fallback route (must come last)
  // route("error", "routes/error-boundary.tsx"),
  route("*", "routes/error-boundary.tsx")
] satisfies RouteConfig;
