import { createFileRoute } from "@tanstack/react-router";
import { getAuth, getSignInUrl } from "@workos/authkit-tanstack-react-start";

export const Route = createFileRoute("/login")({
  loader: async () => {
    const { user } = await getAuth();
    const signInUrl = await getSignInUrl();
    return { user, signInUrl };
  },
  component: RouteComponent,
});

function RouteComponent() {
  const { user, signInUrl } = Route.useLoaderData();
  if (!user) {
    return <a href={signInUrl}>Sign In</a>;
  }
  return <p>Hello {user?.firstName ?? "Guest"}</p>;
}
