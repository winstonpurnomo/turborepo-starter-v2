import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/")({
  loader: ({ context }) =>
    context.queryClient.ensureQueryData(context.trpc.hello.queryOptions()),
  component: RouteComponent,
});

export function RouteComponent() {
  const data = Route.useLoaderData();
  return <>Hello {data}</>;
}
