import type { Route } from "./+types/test";
import { generateMockToken } from "~/utils/auth";


export async function action(loader: Route.ClientLoaderArgs) {
  console.log("🚀 ~ action ~ loader:", loader);
  const mockToken = await generateMockToken();
  return Response.json({ mockToken }, { status: 200 });
}