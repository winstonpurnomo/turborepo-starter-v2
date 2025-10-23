import type { ConvexQueryClient } from "@convex-dev/react-query";
import { SidebarProvider } from "@repo/ui/components/sidebar";
import { ToastProvider } from "@repo/ui/components/toast";
import appCss from "@repo/ui/styles/globals.css?url";
import { TanStackDevtools } from "@tanstack/react-devtools";
import type { QueryClient } from "@tanstack/react-query";
import {
  createRootRouteWithContext,
  HeadContent,
  Outlet,
  redirect,
  Scripts,
} from "@tanstack/react-router";
import { TanStackRouterDevtoolsPanel } from "@tanstack/react-router-devtools";
import { getAuth, getSignInUrl } from "@workos/authkit-tanstack-react-start";
import { AuthKitProvider } from "@workos/authkit-tanstack-react-start/client";
import { Authenticated } from "convex/react";
import { ConvexClientProvider } from "@/components/convex";

interface RouterContext {
  queryClient: QueryClient;
  convexQueryClient: ConvexQueryClient;
}

export const Route = createRootRouteWithContext<RouterContext>()({
  head: () => ({
    meta: [
      { charSet: "utf-8" },
      { name: "viewport", content: "width=device-width, initial-scale=1" },
      { title: "TanStack Start Starter" },
    ],
    links: [{ rel: "stylesheet", href: appCss }],
  }),
  loader: async ({ location }) => {
    const { user } = await getAuth();

    if (!user) {
      const signInUrl = await getSignInUrl({
        data: { returnPathname: location.pathname },
      });
      throw redirect({ href: signInUrl });
    }

    return { user };
  },
  component: RootDocument,
});

function RootDocument() {
  const { convexQueryClient } = Route.useRouteContext();
  return (
    <html lang="en">
      <head>
        <HeadContent />
      </head>
      <body className="flex h-screen flex-col bg-muted text-foreground">
        <div className="root flex min-h-0 flex-1">
          <ToastProvider timeout={2000}>
            <AuthKitProvider>
              <ConvexClientProvider convex={convexQueryClient.convexClient}>
                <Authenticated>
                  <SidebarProvider>
                    <Outlet />
                  </SidebarProvider>
                </Authenticated>
              </ConvexClientProvider>
            </AuthKitProvider>
          </ToastProvider>

          <TanStackDevtools
            config={{ position: "bottom-right" }}
            plugins={[
              {
                name: "Tanstack Router",
                render: <TanStackRouterDevtoolsPanel />,
              },
            ]}
          />
          <Scripts />
        </div>
      </body>
    </html>
  );
}
