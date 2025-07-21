import { validateJwt } from "~/utils/auth";
import type { Route } from "./+types/test";

export async function loader(loader: Route.ClientLoaderArgs) {
  const isAuthorized = await validateJwt(loader);
  if (!isAuthorized) return Response.json({ error: true }, { status: 500 });
  return Response.json({ method: loader?.request?.method }, { status: 200 });
}
