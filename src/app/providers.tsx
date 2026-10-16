"use client";

import { useState, type ReactNode } from "react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { ReactQueryDevtools } from "@tanstack/react-query-devtools";
import { CartProvider } from "@/context/CartContext";

// The root layout is a Server Component, so all client-side providers
// live together in this one "use client" file.
export function Providers({ children }: { children: ReactNode }) {
  // useState makes sure each browser session gets exactly one QueryClient
  // (and the server never shares one between users).
  const [queryClient] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: { staleTime: 30_000 },
        },
      }),
  );

  return (
    <QueryClientProvider client={queryClient}>
      <CartProvider>{children}</CartProvider>
      <ReactQueryDevtools initialIsOpen={false} />
    </QueryClientProvider>
  );
}
