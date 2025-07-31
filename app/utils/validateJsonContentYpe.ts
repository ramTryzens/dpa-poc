import { CONSTANTS } from "./constants";

export async function validateJsonHeader(request: Request) {
  if (!request?.headers.get("content-type")?.includes("application/json")) {
    return Response.json(
      {
        status: "400",
        message: "Request body is not a json",
        identifier: "INVALID_ATTRIBUTE",
        version: CONSTANTS.API_VERSION,
      },
      { status: 400 }
    );
  } else return true;
}
