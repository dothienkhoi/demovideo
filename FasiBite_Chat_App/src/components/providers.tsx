// app/providers.tsx
"use client";

import { ThemeProvider } from "next-themes";
import { QueryClientProvider, QueryClient } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/sonner";
import { VideoCallProvider } from "@/providers/VideoCallProvider";
import { useState } from "react";

export function Providers({ children }: { children: React.ReactNode }) {
  const [queryClient] = useState(() => new QueryClient());

  return (
    <ThemeProvider
      attribute="class"
      defaultTheme="system"
      enableSystem
      disableTransitionOnChange
    >
      <QueryClientProvider client={queryClient}>
        <VideoCallProvider>
          {children}
          <Toaster
            richColors
            closeButton
            position="top-right"
            visibleToasts={2}
            duration={3000}
            expand={false}
            gap={8}
          />
        </VideoCallProvider>
      </QueryClientProvider>
    </ThemeProvider>
  );
}
