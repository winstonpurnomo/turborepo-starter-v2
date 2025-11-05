/** biome-ignore-all lint/suspicious/useAwait: Some return types required to be async */
"use client";

import {
  useAccessToken,
  useAuth,
} from "@workos/authkit-tanstack-react-start/client";
import { ConvexProviderWithAuth, type ConvexReactClient } from "convex/react";
import { type ReactNode, useCallback, useRef } from "react";

export function ConvexClientProvider({
  convex,
  children,
}: {
  convex: ConvexReactClient;
  children: ReactNode;
}) {
  return (
    <ConvexProviderWithAuth client={convex} useAuth={useAuthFromAuthKit}>
      {children}
    </ConvexProviderWithAuth>
  );
}

function useAuthFromAuthKit() {
  const { user, loading: isLoading } = useAuth();
  const {
    accessToken,
    loading: tokenLoading,
    error: tokenError,
  } = useAccessToken();

  const loading = (isLoading ?? false) || (tokenLoading ?? false);
  const authenticated = !!user && !!accessToken && !loading;

  const stableAccessToken = useRef<string | null>(null);
  if (accessToken && !tokenError) {
    stableAccessToken.current = accessToken;
  }

  const fetchAccessToken = useCallback(
    // biome-ignore lint/correctness/noUnusedFunctionParameters: <explanation>
    async ({ forceRefreshToken }: { forceRefreshToken: boolean }) => {
      if (stableAccessToken.current && !tokenError) {
        return stableAccessToken.current;
      }

      return null;
    },
    [tokenError]
  );

  return {
    isLoading: loading,
    isAuthenticated: authenticated,
    fetchAccessToken,
  };
}
