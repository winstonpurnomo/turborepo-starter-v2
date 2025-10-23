import { useQuery } from "@tanstack/react-query";
import { createFileRoute } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { useAuth } from "@workos/authkit-tanstack-react-start/client";
import { defineTanstackRouteHead, Title } from "@/components/header";
import { OrgSwitcher } from "@/components/org-switcher";
import { listOrganizationMemberships } from "@/server/functions/workos";

export const Route = createFileRoute("/_app/")({
  ...defineTanstackRouteHead("Base"),
  component: RouteComponent,
});

export function RouteComponent() {
  const orgs = useServerFn(listOrganizationMemberships);
  const { user, loading } = useAuth();

  const orgsQuery = useQuery({
    queryKey: ["orgs"],
    queryFn: () => orgs({ data: { userId: user?.id ?? "" } }),
    enabled: !loading,
  });

  return (
    <>
      <Title>Convex</Title>
      <OrgSwitcher orgs={orgsQuery.data ?? []} />
    </>
  );
}
