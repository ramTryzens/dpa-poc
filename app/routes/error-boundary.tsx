import { ErrorPageNotFound } from "~/components/ErrorPageNotFound";

export async function loader() {
  return Response.json({}, { status: 500 });
}

export async function action() {
  return Response.json({}, { status: 500 });
}

export default function ErrorBoundaryPage() {
  return (
    <ErrorPageNotFound/>
  );
}
