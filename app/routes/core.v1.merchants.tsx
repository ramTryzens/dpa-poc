import { FetchPSPAccountName as fetchPSPAccountName } from "~/psp/fetchPSPAccountName";
import type { Route } from "../+types/root";
import { validateJwt } from "~/utils/auth";

export async function loader(loader: Route.ClientLoaderArgs) {
  console.log("Merchants request received", {
    url: loader.request.url,
  });
  const authResponse = await validateJwt(loader);
  try {
   return Response.json({"Merchants": [{"Account": fetchPSPAccountName()}]}, { status: 200 });
  } catch (error) {
    return Response.json({ error }, { status: 500 });
  }
}
