import { SidebarInset, SidebarProvider } from "@repo/ui/components/sidebar";
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
      {
        charSet: "utf-8",
      },
      {
        name: "viewport",
        content: "width=device-width, initial-scale=1",
      },
      {
        title: "TanStack Start Starter",
      },
    ],
    links: [
      {
        rel: "stylesheet",
        href: appCss,
      },
    ],
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
      <body>
        <div className="root">
          <ToastProvider timeout={2000}>
            <AuthKitProvider>
              <SidebarProvider>
                <AppSidebar />
                <SidebarInset>
                  <div className="m-4">{children}</div>
                </SidebarInset>
              </SidebarProvider>
            </AuthKitProvider>
          </ToastProvider>
          <TanStackDevtools
            config={{
              position: "bottom-right",
            }}
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
