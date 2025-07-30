export async function isTenantIdFormatValid(tenantId: string) {
  const pattern = /^(?:[a-z0-9!"#$%&'()*+,\-./:;<=>?@[\\\]^_`{|}~]{1,36}|[a-f0-9]{8}-[a-f0-9]{4}-[1-5][a-f0-9]{3}-[89ab][a-f0-9]{3}-[a-f0-9]{12})$/;
  const isAscii = pattern.test(tenantId);
  return (
    typeof tenantId === "string" && isAscii && tenantId.length >= 1
  );
}
