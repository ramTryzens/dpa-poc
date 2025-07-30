export async function isTenantIdFormatValid(tenantId: string) {
  const maxLength = 50; // define your max length requirement
  const isAscii = /^[\x00-\x7F]*$/.test(tenantId);
  return (
    typeof tenantId === "string" && isAscii && tenantId.length <= maxLength
  );
}
