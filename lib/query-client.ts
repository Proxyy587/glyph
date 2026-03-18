import { QueryClient } from "@tanstack/react-query";

declare global {
  // eslint-disable-next-line no-var
  var __glyphQueryClient: QueryClient | undefined;
}

export function getQueryClient(): QueryClient {
  if (!globalThis.__glyphQueryClient) {
    globalThis.__glyphQueryClient = new QueryClient({
      defaultOptions: {
        queries: {
          staleTime: 10_000,
          gcTime: 5 * 60_000,
          retry: 1,
          refetchOnWindowFocus: false,
        },
      },
    });
  }

  return globalThis.__glyphQueryClient;
}

