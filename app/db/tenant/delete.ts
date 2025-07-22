import fs from "fs/promises";
import path from "path";
import type {
  CreateTenantRequest,
  DeleteTenantRequest,
  OffboardTenantRequestParams,
  OnboardTenantLoader,
  Tenant,
} from "~/types/tenant";
import { CONSTANTS } from "~/utils/constants";

// Deletes Tenant
export async function deleteTenant(
  tenant: DeleteTenantRequest
): Promise<boolean   | null> {
  if (!tenant.tenantId) throw new Error("Invalid Tenant ID");
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

    if (index === -1) {
      // Tenant NOT FOUND
      return null;
    }

    if (tenant.isMarked === "true") {
      tenants[index].markedForDeletion = true;
      tenants[index].updatedAt = now;
      await fs.writeFile(tenantsPath, JSON.stringify(tenants, null, 2), "utf8");
      return true;
    } else {
      // const removedTenant = tenants[index];
      tenants.splice(index, 1);
      await fs.writeFile(tenantsPath, JSON.stringify(tenants, null, 2), "utf8");
      return true;
    }
  } catch (err) {
    console.error("Error upserting tenant:", err);
    throw err;
  }
}
