import type { LoaderFunctionArgs } from "react-router";

export async function validateJwt(loaderRequest: LoaderFunctionArgs) {
 // Placeholder for JWT or session check
 console.log("🚀 ~ validateJwt ~ cons:", loaderRequest?.request?.headers)
  return false;
}
