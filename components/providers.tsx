"use client";

import type { ReactNode } from "react";
import { AuthProvider } from "@/contexts/auth-context";
import { ProjectProvider } from "@/contexts/project-context";

type AppProvidersProps = {
  children: ReactNode;
};

export function AppProviders({ children }: AppProvidersProps) {
  return (
    <AuthProvider>
      <ProjectProvider>{children}</ProjectProvider>
    </AuthProvider>
  );
}
