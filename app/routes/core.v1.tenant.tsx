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

function splitCamelCaseToTitle(text: string): string {
  return text
    .replace(/([a-z])([A-Z])/g, '$1 $2') // add space between camelCase
    .replace(/^./, (str) => str.toUpperCase()); // capitalize first letter
}


export default function DefaultUI() {
  const data = useLoaderData();
  if (!data?.tenant?.tenantId) return <ErrorBoundary />;
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-900 text-center px-4">
      <h1 className="text-3xl font-bold text-red-400 mb-4">Tenant Details</h1>
      <div className="bg-gray-800 border border-gray-600 shadow-2xl rounded-2xl px-8 py-6 w-full max-w-2xl transform transition-all duration-300 hover:shadow-[0_0_15px_rgba(220,38,38,0.3)] hover:-translate-y-1">
        <table className="w-full border-separate border-spacing-0 table-fixed overflow-hidden rounded-xl">
          
          <tbody>
            {Object.keys(data.tenant).map((key, index, array) => (
              <tr key={index} className={index % 2 === 0 ? "bg-gray-700" : "bg-gray-800"}>
                <td className={`py-3 px-2 font-semibold text-gray-300 ${index === array.length - 1 ? '' : 'border-b border-gray-600'} ${index === array.length - 1 ? 'rounded-bl-lg' : ''}`}>
                  <b>{splitCamelCaseToTitle(key)}</b>
                </td>
                <td className={`py-3 px-2 text-gray-200 ${index === array.length - 1 ? '' : 'border-b border-gray-600'} ${index === array.length - 1 ? 'rounded-br-lg' : ''}`}>
                  {key === 'tenantUrl' ? (
                    <div className="max-w-full break-all">
                      <a href={data.tenant?.[key]} className="text-blue-400 hover:text-blue-300 hover:underline" target="_blank" rel="noopener noreferrer">
                        {data.tenant?.[key]}
                      </a>
                    </div>
                  ) : (
                    <div className="max-w-full break-all">
                      {data.tenant?.[key]}
                    </div>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
