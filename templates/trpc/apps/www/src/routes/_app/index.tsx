import { createFileRoute } from "@tanstack/react-router";
import { defineTanstackRouteHead, Title } from "@/components/header";

export const Route = createFileRoute("/")({
  ...defineTanstackRouteHead("tRPC"),
  loader: ({ context }) =>
    context.queryClient.ensureQueryData(context.trpc.hello.queryOptions()),
  component: RouteComponent,
});

export function RouteComponent() {
  const data = Route.useLoaderData();
  return (
    <>
      <Title>tRPC</Title>
      {JSON.stringify(data, null, 2)}
    </>
  );
}
