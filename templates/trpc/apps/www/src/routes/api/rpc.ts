import { fetchRequestHandlerForAppRouter } from "@repo/trpc/server";
import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/api/rpc")({
  server: {
    handlers: {
      GET: fetchRequestHandlerForAppRouter({
        endpoint: "/api/rpc",
        createContext: () => ({}),
      }),
      POST: fetchRequestHandlerForAppRouter({
        endpoint: "/api/rpc",
        createContext: () => ({}),
      }),
    },
  },
});
