import { SidebarProvider } from "@repo/ui/components/sidebar";
import appCss from "@repo/ui/styles/globals.css?url";
import { TanStackDevtools } from "@tanstack/react-devtools";
import { type QueryClient, QueryClientProvider } from "@tanstack/react-query";
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
import { ThemeProvider } from "tanstack-theme-kit";
import { PendingComponent } from "@/components/pending-component";

function NotFoundComponent() {
  return (
    <div className="flex h-screen w-screen items-center justify-center">
      <div className="flex flex-col items-center gap-4 text-center">
        <h1 className="font-bold text-4xl">404</h1>
        <p className="text-muted-foreground">Page not found</p>
      </div>
    </div>
  );
}

function ErrorComponent({ error }: { error: Error }) {
  return (
    <div className="flex h-screen w-screen items-center justify-center p-4">
      <div className="flex w-full max-w-md flex-col gap-4 rounded-lg border border-destructive/50 bg-destructive/10 p-6">
        <h1 className="font-bold text-destructive text-xl">Error</h1>
        <p className="text-foreground text-sm">{error.message}</p>
        <button
          className="mt-2 rounded-md bg-primary px-4 py-2 text-primary-foreground text-sm hover:bg-primary/90"
          onClick={() => window.location.reload()}
          type="button"
        >
          Reload Page
        </button>
      </div>
    </div>
  );
}

interface RouterContext {
  queryClient: QueryClient;
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
  pendingComponent: PendingComponent,
  notFoundComponent: NotFoundComponent,
  errorComponent: ErrorComponent,
});

function RootDocument() {
  const { queryClient } = Route.useRouteContext();
  return (
    <html lang="en">
      <head>
        <HeadContent />
      </head>
      <body className="flex h-screen flex-col bg-muted text-foreground">
        <div className="root flex min-h-0 flex-1">
          <ThemeProvider>
            <AuthKitProvider>
              <QueryClientProvider client={queryClient}>
                <SidebarProvider>
                  <Outlet />
                </SidebarProvider>
              </QueryClientProvider>
            </AuthKitProvider>
          </ThemeProvider>

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
