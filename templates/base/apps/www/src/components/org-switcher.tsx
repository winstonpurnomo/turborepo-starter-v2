import type { OrganizationMembership } from "@workos-inc/node";

export function OrgSwitcher({ orgs }: { orgs: OrganizationMembership[] }) {
	return orgs.map((org) => <div key={org.id}>{org.organizationName}</div>);
}
