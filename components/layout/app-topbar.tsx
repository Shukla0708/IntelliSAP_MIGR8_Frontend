"use client";

import type { ReactNode } from "react";
import { HelpOutlineIcon, MenuIcon } from "@/components/ui/icons";
import { ProfileMenu } from "@/components/layout/profile-menu";

type AppTopbarProps = {
  onMenuClick?: () => void;
  title?: string;
  leading?: ReactNode;
};

export function AppTopbar({ onMenuClick, title, leading }: AppTopbarProps) {
  return (
    <header className="sticky top-0 z-40 flex h-16 items-center justify-between border-b border-outline-variant bg-surface/80 px-4 shadow-sm backdrop-blur-md md:px-6">
      <div className="flex min-w-0 flex-1 items-center gap-3">
        {onMenuClick ? (
          <button
            type="button"
            onClick={onMenuClick}
            className="rounded-lg p-2 text-on-surface-variant transition-colors hover:bg-surface-container-high hover:text-primary md:hidden"
            aria-label="Open navigation"
          >
            <MenuIcon />
          </button>
        ) : null}

        {leading ? (
          leading
        ) : title ? (
          <h2 className="truncate text-lg font-semibold text-primary sm:text-xl sm:leading-7">
            {title}
          </h2>
        ) : null}
      </div>

      <div className="flex shrink-0 items-center gap-2">
        <div className="mx-2 hidden h-6 w-px bg-outline-variant sm:block" />
        <button
          type="button"
          className="p-1 text-on-surface-variant transition-all hover:text-primary"
          aria-label="Help"
        >
          <HelpOutlineIcon />
        </button>
        <ProfileMenu variant="topbar" />
      </div>
    </header>
  );
}
