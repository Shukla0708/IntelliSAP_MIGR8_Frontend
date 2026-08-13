"use client";

import type { ReactNode } from "react";
import { HelpOutlineIcon, MenuIcon, SearchIcon } from "@/components/ui/icons";
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
        ) : (
          <div className="relative">
            <SearchIcon className="pointer-events-none absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-on-surface-variant" />
            <input
              type="search"
              placeholder="Search migrations..."
              className="w-44 rounded-md border border-outline-variant bg-surface-container-low py-1.5 pr-4 pl-10 text-sm text-on-surface placeholder:text-on-surface-variant focus:ring-2 focus:ring-primary/20 focus:outline-none sm:w-64"
              defaultValue=""
            />
          </div>
        )}
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
