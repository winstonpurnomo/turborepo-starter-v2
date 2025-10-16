import {
  SidebarInset,
  SidebarProvider,
  SidebarRail,
  SidebarTrigger,
} from "@repo/ui/components/sidebar";
import { ToastProvider } from "@repo/ui/components/toast";
import appCss from "@repo/ui/styles/globals.css?url";
import { TanStackDevtools } from "@tanstack/react-devtools";
import {
  createRootRoute,
  HeadContent,
  redirect,
  Scripts,
} from "@tanstack/react-router";
import { TanStackRouterDevtoolsPanel } from "@tanstack/react-router-devtools";
import { getAuth, getSignInUrl } from "@workos/authkit-tanstack-react-start";
import { AuthKitProvider } from "@workos/authkit-tanstack-react-start/client";
import { AppSidebar } from "@/components/sidebar";

export const Route = createRootRoute({
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
  shellComponent: RootDocument,
});

function RootDocument({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <head>
        <HeadContent />
      </head>
      <body className="min-h-screen bg-muted text-foreground">
        <div className="root flex min-h-screen">
          <ToastProvider timeout={2000}>
            <AuthKitProvider>
              <SidebarProvider>
                <AppSidebar />

                <div className="flex flex-1 flex-col p-4">
                  <header className="mb-2 flex shrink-0 items-center gap-3 rounded-md px-4 py-2">
                    <SidebarTrigger />
                    <h1 className="text-sm">Page Title</h1>
                  </header>

                  <SidebarInset className="flex-1 rounded-xl bg-background shadow-sm">
                    <SidebarRail />
                    <div className="overflow-auto p-6">{children}</div>
                  </SidebarInset>
                </div>
              </SidebarProvider>
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
