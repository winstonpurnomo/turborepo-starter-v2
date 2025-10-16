import { convexQuery } from "@convex-dev/react-query";
import { api } from "@repo/backend/convex/_generated/api";
import { useSuspenseQuery } from "@tanstack/react-query";
import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/")({
  component: RouteComponent,
});

export function RouteComponent() {
  const { data } = useSuspenseQuery(convexQuery(api.resource.get, {}));
  return <div className="p-4">{JSON.stringify(data, null, 2)}</div>;
}
