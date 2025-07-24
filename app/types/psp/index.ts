export interface InitializeMockPSPPayload {
  url: string;
  options: {
    method: string;
    headers: HeadersInit;
  }
  body: unknown;
}