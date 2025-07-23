import { validateJwt } from "~/utils/auth";
import type { Route } from "./+types/test";
import type { GetTenant } from "~/types/tenant";
import { findByTenantId } from "~/db/tenant/findByTenantId";
import { useLoaderData } from "react-router";
import { ErrorBoundary } from "~/components/Error";

export async function loader(loader: Route.ClientLoaderArgs) {
  try {
    const isAuthorized = await validateJwt(loader);
    if (!isAuthorized) return Response.json({ error: true }, { status: 500 });
    const tenant = await findByTenantId(loader?.params as GetTenant);
    return Response.json({ tenant }, { status: 200 });
  } catch (error) {
    return Response.json({ error }, { status: 500 });
  }
}


export default function DefaultUI() {
  const data = useLoaderData();
  if (!data?.tenant?.tenantId) return <ErrorBoundary />;
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-200 text-center px-4">
      <h1 className="text-3xl font-bold text-red-600 mb-4">Tenant Details</h1>
      <div className="bg-white border border-gray-300 shadow-md rounded px-8 py-6 w-full max-w-md">
        <div className="mb-4">
          <h2 className="text-lg font-semibold text-gray-700 mb-1">
            Tenant ID
          </h2>
          <p className="text-gray-900">{data.tenant.tenantId}</p>
        </div>
        <div className="mb-4">
          <h2 className="text-lg font-semibold text-gray-700 mb-1">
            Created At
          </h2>
          <p className="text-gray-900">{data.tenant.createdAt}</p>
        </div>
        <div>
          <h2 className="text-lg font-semibold text-gray-700 mb-1">
            Updated At
          </h2>
          <p className="text-gray-900">{data.tenant.updatedAt}</p>
        </div>
      </div>
    </div>
  );
}
