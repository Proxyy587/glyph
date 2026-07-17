import { QueryClient } from "@tanstack/react-query";

declare global {
  var __glyphQueryClient: QueryClient | undefined;
}

export function getQueryClient(): QueryClient {
  if (!globalThis.__glyphQueryClient) {
    globalThis.__glyphQueryClient = new QueryClient({
      defaultOptions: {
        queries: {
          staleTime: 30_000,
          gcTime: 10 * 60_000,
          retry: 1,
          refetchOnWindowFocus: false,
        },
      },
    });
  }

  return globalThis.__glyphQueryClient;
}
