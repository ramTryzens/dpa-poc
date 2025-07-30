import { getTokenforAdptrToCoreComm, validateJwt } from "~/utils/auth";
import type { Route } from "./+types/test";
import { getQuery } from "~/utils/getQuery";

export async function loader(loader: Route.ClientLoaderArgs) {
  const { tenantId = undefined } = await getQuery(loader.request)
  console.log("🚀 ~ loader ~ tenantId:", tenantId)
  const data = await getTokenforAdptrToCoreComm({ tenantId })
  console.log("🚀 ~ loader ~ loader:", data)
  const isAuthorized = await validateJwt(loader);
  if (!isAuthorized) return Response.json({ error: true }, { status: 500 });
  return Response.json({ method: loader?.request?.method }, { status: 200 });
}
