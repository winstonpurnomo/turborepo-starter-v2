import { ConvexQueryClient } from "@convex-dev/react-query";
import { QueryClient } from "@tanstack/react-query";
import { createRouter } from "@tanstack/react-router";
import { setupRouterSsrQueryIntegration } from "@tanstack/react-router-ssr-query";

// Import the generated route tree
import { routeTree } from "./routeTree.gen";

// Create a new router instance
export const getRouter = () => {
  const convexUrl = import.meta.env.VITE_CONVEX_URL;
  if (!convexUrl) {
    throw new Error("VITE_CONVEX_URL is not defined");
  }

  const convexQueryClient = new ConvexQueryClient(convexUrl);
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: {
        queryKeyHashFn: convexQueryClient.hashFn(),
        queryFn: convexQueryClient.queryFn(),
      },
    },
  });

  const router = createRouter({
    routeTree,
    context: { queryClient, convexQueryClient },
    defaultPreload: "intent",
  });

  setupRouterSsrQueryIntegration({
    router,
    queryClient,
  });

  return router;
};
