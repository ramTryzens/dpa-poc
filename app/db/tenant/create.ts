import fs from "fs/promises";
import path from "path";
import type { OnboardTenantLoader, Tenant } from "~/types/tenant";
import { CONSTANTS } from "~/utils/constants";

// Upserts Tenant
export async function createTenant(tenant: OnboardTenantLoader): Promise<Tenant> {
  if (!tenant.tenantId) throw new Error('Invalid Tenant ID')
  const now = new Date().toISOString();
  const tenantsPath = path.resolve(CONSTANTS.DATA_DIRECTORY);

  try {
    // Ensure the file exists, or create it
    try {
      await fs.access(tenantsPath);
    } catch {
      await fs.mkdir(path.dirname(tenantsPath), { recursive: true });
      await fs.writeFile(tenantsPath, "[]", "utf8");
    }

    const data = await fs.readFile(tenantsPath, "utf8");
    let tenants: Tenant[] = JSON.parse(data);

    const index = tenants.findIndex((t) => t.tenantId === tenant.tenantId);

    if (index !== -1) {
      tenants[index].updatedAt = now;
      await fs.writeFile(tenantsPath, JSON.stringify(tenants, null, 2), "utf8");
      return tenants[index];
    }

    const tenantUrl = new URL(process.env.adapterbaseurl ?? 'http://localhost:5173')
    tenantUrl.pathname = `core/v1/tenant/${tenant.tenantId}`;

    const newTenant: Tenant = {
      tenantId: tenant.tenantId,
      tenantUrl: tenantUrl.toString(),
      createdAt: now,
      updatedAt: now,
    };

    tenants.push(newTenant);
    await fs.writeFile(tenantsPath, JSON.stringify(tenants, null, 2), "utf8");
    return newTenant;
  } catch (err) {
    console.error("Error upserting tenant:", err);
    throw err;
  }
}
