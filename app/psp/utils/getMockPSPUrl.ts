export async function getMockPSPUrl() {
  return (
    process?.env?.MOCK_PSP_URL ?? "https://dev-psp-mockapi.tryzens-ignite.com"
  );
}
