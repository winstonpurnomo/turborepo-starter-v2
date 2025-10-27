import { PlusIcon } from "@phosphor-icons/react";
import { Avatar, AvatarFallback } from "@repo/ui/components/avatar";
import { Button } from "@repo/ui/components/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@repo/ui/components/dialog";
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
import { queryOptions, useSuspenseQuery } from "@tanstack/react-query";
import { createFileRoute } from "@tanstack/react-router";
import { useAuth } from "@workos/authkit-tanstack-react-start/client";
import { CheckCircle2 } from "lucide-react";
import { useState } from "react";
import { CreateOrganizationForm } from "@/components/create-organization-form";
import { defineTanstackRouteHead } from "@/components/header";
import { listOrganizationMemberships } from "@/server/functions/workos";

const title = "Switch Organization";

const organizationQueryOptions = queryOptions({
  queryKey: ["orgs"],
  queryFn: () => listOrganizationMemberships({ data: {} }),
});

export const Route = createFileRoute("/switch-organization")({
  ...defineTanstackRouteHead(title),
  loader: ({ context }) =>
    context.queryClient.ensureQueryData(organizationQueryOptions),
  component: RouteComponent,
});

function RouteComponent() {
  const { queryClient } = Route.useRouteContext();
  const { data } = useSuspenseQuery(organizationQueryOptions);
  const { switchToOrganization, organizationId } = useAuth();
  const toast = useToast();
  const navigate = Route.useNavigate();
  const [dialogOpen, setDialogOpen] = useState(false);

  const handleSelectOrganization = (orgId: string) => {
    try {
      switchToOrganization(orgId);
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
      <div className="flex w-full max-w-md flex-col gap-6">
        <header>
          <h1 className="font-semibold text-foreground text-lg tracking-tight">
            Switch Organization
          </h1>
          <p className="mt-1.5 text-muted-foreground text-sm">
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
                className={cn(
                  "group transition-all focus-visible:ring-1 focus-visible:ring-ring",
                  !isActive &&
                    "cursor-pointer border-border/40 hover:bg-muted/60",
                  isActive && "border-primary/30 bg-primary/6 text-foreground"
                )}
                key={org.organizationId}
                onClick={() =>
                  !isActive && handleSelectOrganization(org.organizationId)
                }
                onKeyDown={(e) => {
                  if (e.key === "Enter" || e.key === " ") {
                    e.preventDefault();
                    if (!isActive) {
                      handleSelectOrganization(org.organizationId);
                    }
                  }
                }}
                role="button"
                size="default"
                tabIndex={0}
                variant={isActive ? "outline" : "default"}
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
                  <ItemTitle className="font-medium text-sm">
                    {org.organizationName}
                  </ItemTitle>
                  <ItemDescription className="text-muted-foreground text-xs">
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

        <div className="flex gap-2">
          <Dialog onOpenChange={setDialogOpen} open={dialogOpen}>
            <DialogTrigger
              render={(props) => (
                <Button className="flex-1" variant="default" {...props}>
                  <PlusIcon className="h-4 w-4" />
                  Create Organization
                </Button>
              )}
            />
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Create Organization</DialogTitle>
              </DialogHeader>
              <CreateOrganizationForm
                onError={() => {
                  toast.add({
                    title: "Could not create organization",
                    type: "error",
                  });
                }}
                onSuccess={() => {
                  queryClient.resetQueries({ queryKey: ["orgs"] });
                  toast.add({
                    title: "Organization created",
                    type: "success",
                  });
                  setDialogOpen(false);
                }}
              />
            </DialogContent>
          </Dialog>

          <Button
            className="flex-1"
            onClick={() => navigate({ to: "/" })}
            variant="destructive"
          >
            Cancel
          </Button>
        </div>
      </div>
    </div>
  );
}
