export interface OnboardTenantLoader {
  tenantId: string
}

export interface Tenant {
  tenantId: string;
  tenantUrl: string;
  createdAt: string;
  updatedAt: string;
};

export interface GetTenant {
  tenantId: string;
};