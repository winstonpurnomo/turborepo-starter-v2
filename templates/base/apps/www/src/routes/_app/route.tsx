import {
  SidebarInset,
  SidebarRail,
  SidebarTrigger,
} from "@repo/ui/components/sidebar";
import { createFileRoute, Outlet, redirect } from "@tanstack/react-router";
import { useAuth } from "@workos/authkit-tanstack-react-start/client";
import { useEffect } from "react";
import { Provider as HeaderProvider, useTitle } from "@/components/header";
import { PendingComponent } from "@/components/pending-component";
import { AppSidebar } from "@/components/sidebar";

export const Route = createFileRoute("/_app")({
  component: RouteComponent,
  pendingComponent: PendingComponent,
});

function HeaderBar() {
  const { title } = useTitle();

  return (
    <header className="mb-2 flex shrink-0 items-center gap-3 rounded-md px-4 py-2">
      <SidebarTrigger />
      <h1 className="font-bold text-lg">{title}</h1>
    </header>
  );
}

function RouteComponent() {
  const { organizationId, loading } = useAuth();

  useEffect(() => {
    if (loading) {
      return;
    }
    if (organizationId === undefined) {
      throw redirect({ to: "/switch-organization" });
    }
  }, [loading, organizationId]);

  return (
    <>
      <AppSidebar />

      <div className="m-4 my-4 flex min-h-0 min-w-0 flex-1 flex-col sm:mx-4 md:ml-0 md:pl-0">
        <HeaderProvider>
          <HeaderBar />

          <SidebarInset className="flex min-h-0 min-w-0 flex-1 overflow-hidden rounded-xl bg-background shadow-sm">
            <SidebarRail />
            <div className="min-h-0 flex-1 overflow-y-auto overflow-x-hidden p-6 [&::-webkit-scrollbar-thumb]:rounded-full [&::-webkit-scrollbar-thumb]:border-2 [&::-webkit-scrollbar-thumb]:border-background [&::-webkit-scrollbar-thumb]:border-solid [&::-webkit-scrollbar-thumb]:bg-muted-foreground/20 [&::-webkit-scrollbar-thumb]:bg-clip-padding [&::-webkit-scrollbar-thumb]:transition-colors [&::-webkit-scrollbar-thumb]:duration-300 hover:[&::-webkit-scrollbar-thumb]:bg-muted-foreground/30 [&::-webkit-scrollbar-track]:my-2 [&::-webkit-scrollbar-track]:mr-1 [&::-webkit-scrollbar-track]:bg-transparent [&::-webkit-scrollbar]:w-2">
              <Outlet />
            </div>
          </SidebarInset>
        </HeaderProvider>
      </div>
    </>
  );
}
