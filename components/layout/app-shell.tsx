"use client";

import { useState, type ReactNode } from "react";
import { ResultsChatDrawer } from "@/components/chat/results-chat-drawer";
import { AppSidebar } from "@/components/layout/app-sidebar";
import { AppTopbar } from "@/components/layout/app-topbar";
import { CloseIcon } from "@/components/ui/icons";

type AppShellProps = {
  children: ReactNode;
  topbarTitle?: string;
  topbarLeading?: ReactNode;
  mainClassName?: string;
};

export function AppShell({
  children,
  topbarTitle,
  topbarLeading,
  mainClassName = "flex-1 bg-background p-4 md:p-6",
}: AppShellProps) {
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <div className="flex min-h-screen bg-background text-on-background">
        <div className="fixed inset-y-0 left-0 z-50 hidden md:flex">
          <AppSidebar />
        </div>

        {mobileOpen ? (
          <div className="fixed inset-0 z-50 md:hidden">
            <button
              type="button"
              className="absolute inset-0 bg-on-surface/30"
              aria-label="Close navigation overlay"
              onClick={() => setMobileOpen(false)}
            />
            <div className="relative h-full w-64 shadow-lg">
              <button
                type="button"
                onClick={() => setMobileOpen(false)}
                className="absolute top-4 right-4 z-10 rounded-lg p-1 text-on-surface-variant hover:bg-surface-container-high"
                aria-label="Close navigation"
              >
                <CloseIcon />
              </button>
              <AppSidebar onNavigate={() => setMobileOpen(false)} />
            </div>
          </div>
        ) : null}

        <div className="flex min-h-screen flex-1 flex-col md:ml-64">
          <AppTopbar
            title={topbarTitle}
            leading={topbarLeading}
            onMenuClick={() => setMobileOpen(true)}
          />
          <main className={mainClassName}>{children}</main>
          <ResultsChatDrawer />
        </div>
    </div>
  );
}
