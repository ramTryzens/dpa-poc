import { openApiSpec } from '~/utils/swagger';

export function loader() {
  // Add CORS headers to allow access from any origin
  return Response.json(openApiSpec, {
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Content-Type': 'application/json'
    }
  });
}
