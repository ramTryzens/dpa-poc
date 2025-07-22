export interface OnboardTenantLoader {
  tenantId: string;
}

export interface OffboardTenantLoader {
  tenantId: string;
}

export interface CreateTenantRequest extends OnboardTenantRequestBody {
  tenantId: string;
}

export interface DeleteTenantRequest extends OffboardTenantRequestParams {
  tenantId: string;
}

export interface OnboardTenantRequestBody {
  tenantSubdomain: string;
  tenantPlan: string;
}

export interface OffboardTenantRequestParams {
  isMarked?: string;
}

export interface Tenant {
  tenantId: string;
  tenantUrl: string;
  tenantSubdomain: string;
  tenantPlan: string;
  markedForDeletion?: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface GetTenant {
  tenantId: string;
}
