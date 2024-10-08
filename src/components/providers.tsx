import { TRPCReactProvider } from "@/trpc/react";
import { ClerkProvider } from "@clerk/nextjs";
import React from "react";

export default function Providers({ children }: { children: React.ReactNode }) {
  return (
    <TRPCReactProvider>
      <ClerkProvider>{children}</ClerkProvider>
    </TRPCReactProvider>
  );
}
