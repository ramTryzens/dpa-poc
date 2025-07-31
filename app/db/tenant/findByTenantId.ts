import type { GetTenant, Tenant } from "~/types/tenant";
import { CONSTANTS } from "~/utils/constants";
import fs from "fs/promises";
import path from "path";

export async function findByTenantId(tenant: GetTenant) {
  try {
    if (!tenant?.tenantId) throw new Error('Invalid Tenant ID');
    const { tenantId } = tenant;
    const tenantsPath = path.resolve(CONSTANTS.DATA_DIRECTORY);
    const data = await fs.readFile(tenantsPath, "utf8");
    const tenants = JSON.parse(data) as Tenant[];
    const tenantIndex = tenants.findIndex((t) => t?.tenantId === tenantId);
    if (tenantIndex === -1) throw new Error('Invalid Tenant ID');

    // Update `updatedAt` field
    tenants[tenantIndex].updatedAt = new Date().toISOString();
    await fs.writeFile(tenantsPath, JSON.stringify(tenants, null, 2), "utf8");

    return tenants[tenantIndex];
  } catch (error) {
    throw error;
  }
}