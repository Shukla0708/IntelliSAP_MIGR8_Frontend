import type { ReactNode } from "react";
import { AuthGuard } from "@/components/auth/auth-guard";

type AppLayoutProps = {
  children: ReactNode;
};

export default function AppLayout({ children }: AppLayoutProps) {
  return <AuthGuard>{children}</AuthGuard>;
}
