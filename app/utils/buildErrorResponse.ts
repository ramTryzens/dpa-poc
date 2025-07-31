import type { EuildErrorResponse } from "~/types/error";
import { CONSTANTS } from "./constants";

export function buildErrorResponse(errorData: EuildErrorResponse) {
  return Response.json(
    {
      status: errorData?.statusAsText ?? errorData?.status.toString(),
      message: errorData.message,
      identifier: errorData.identifier,
      version: CONSTANTS.API_VERSION,
    },
    { status: errorData.status }
  );
}
