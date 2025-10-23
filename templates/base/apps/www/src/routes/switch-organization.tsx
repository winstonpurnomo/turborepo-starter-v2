import { Avatar, AvatarFallback } from "@repo/ui/components/avatar";
import { Button } from "@repo/ui/components/button";
import {
	Item,
	ItemActions,
	ItemContent,
	ItemDescription,
	ItemGroup,
	ItemMedia,
	ItemTitle,
} from "@repo/ui/components/item";
import { useToast } from "@repo/ui/hooks/use-toast";
import { cn } from "@repo/ui/lib/utils";
import { createFileRoute } from "@tanstack/react-router";
import { useAuth } from "@workos/authkit-tanstack-react-start/client";
import { CheckCircle2 } from "lucide-react";
import { defineTanstackRouteHead } from "@/components/header";
import { listOrganizationMemberships } from "@/server/functions/workos";

const title = "Switch Organization";

export const Route = createFileRoute("/switch-organization")({
	...defineTanstackRouteHead(title),
	loader: ({ context }) =>
		context.queryClient.ensureQueryData({
			queryKey: ["orgs"],
			queryFn: () => listOrganizationMemberships({ data: {} }),
		}),
	component: RouteComponent,
});

function RouteComponent() {
	const data = Route.useLoaderData();
	const { switchToOrganization, organizationId } = useAuth();
	const toast = useToast();
	const navigate = Route.useNavigate();

	const handleSelectOrganization = (organizationId: string) => {
		try {
			switchToOrganization(organizationId);
			toast.add({
				title: "Switched organization",
				type: "success",
			});
		} catch {
			toast.add({
				title: "Could not switch organization",
				type: "error",
			});
		}
		navigate({ to: "/" });
	};

	return (
		<div className="flex h-screen w-screen items-center justify-center px-4 text-center">
			<div className="w-full max-w-md flex flex-col gap-6">
				<header>
					<h1 className="text-lg font-semibold tracking-tight text-foreground">
						Switch Organization
					</h1>
					<p className="mt-1.5 text-sm text-muted-foreground">
						{data.length === 0
							? "You aren’t a member of any organizations."
							: "Select an organization to switch to."}
					</p>
				</header>

				<ItemGroup className="space-y-2 text-left">
					{data.map((org) => {
						const isActive = organizationId === org.organizationId;
						const initials =
							org.organizationName?.charAt(0)?.toUpperCase() ?? "O";

						return (
							<Item
								key={org.organizationId}
								size="default"
								variant={isActive ? "outline" : "default"}
								role="button"
								tabIndex={0}
								onClick={() =>
									!isActive && handleSelectOrganization(org.organizationId)
								}
								onKeyDown={(e) => {
									if (e.key === "Enter" || e.key === " ") {
										e.preventDefault();
										!isActive && handleSelectOrganization(org.organizationId);
									}
								}}
								className={cn(
									"group transition-all focus-visible:ring-1 focus-visible:ring-ring",
									!isActive &&
										"hover:bg-muted/60 cursor-pointer border-border/40",
									isActive &&
										"bg-primary/[0.06] border-primary/30 text-foreground",
								)}
							>
								{/* Avatar */}
								<ItemMedia>
									<Avatar className="h-8 w-8">
										<AvatarFallback className="font-medium text-sm">
											{initials}
										</AvatarFallback>
									</Avatar>
								</ItemMedia>

								{/* Name / ID */}
								<ItemContent>
									<ItemTitle className="text-sm font-medium">
										{org.organizationName}
									</ItemTitle>
									<ItemDescription className="text-xs text-muted-foreground">
										{org.organizationId}
									</ItemDescription>
								</ItemContent>

								{/* Check icon */}
								<ItemActions>
									{isActive && (
										<div className="rounded-full p-1 text-primary opacity-90 transition-opacity group-hover:opacity-100">
											<CheckCircle2 size={16} strokeWidth={2} />
										</div>
									)}
								</ItemActions>
							</Item>
						);
					})}
				</ItemGroup>

				<Button
					onClick={() => navigate({ to: "/" })}
					className="w-xs mx-auto"
					variant="secondary"
				>
					Cancel
				</Button>
			</div>
		</div>
	);
}
