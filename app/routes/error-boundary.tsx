import { ErrorPageNotFound } from "~/components/ErrorPageNotFound";

export async function loader() {
  return Response.json({}, { status: 404 });
}

export async function action() {
  return Response.json({}, { status: 404 });
}

export default function ErrorBoundaryPage() {
  return (
    <ErrorPageNotFound/>
  );
}
