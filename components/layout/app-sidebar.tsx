"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import type { ComponentType } from "react";
import {
  AccountCircleIcon,
  AnalyticsIcon,
  CompareIcon,
  DashboardIcon,
  DatasetIcon,
  HubIcon,
  RuleIcon,
  SettingsIcon,
} from "@/components/ui/icons";
import { ProfileMenu } from "@/components/layout/profile-menu";
import { useProject } from "@/contexts/project-context";
import {
  SIDEBAR_FOOTER_NAV,
  SIDEBAR_NAV,
  type NavItem,
} from "@/data/dashboard";

const iconMap: Record<NavItem["icon"], ComponentType<{ className?: string }>> = {
  dashboard: DashboardIcon,
  dataset: DatasetIcon,
  rule: RuleIcon,
  compare: CompareIcon,
  hub: HubIcon,
  analytics: AnalyticsIcon,
  account: AccountCircleIcon,
  settings: SettingsIcon,
};

type AppSidebarProps = {
  className?: string;
  onNavigate?: () => void;
};

function isActivePath(pathname: string, item: NavItem) {
  const prefixes = item.matchPrefixes ?? [];
  if (prefixes.some((prefix) => pathname === prefix || pathname.startsWith(`${prefix}/`))) {
    return true;
  }
  if (!item.href || item.href === "#") return false;
  return pathname === item.href || pathname.startsWith(`${item.href}/`);
}

function NavLink({
  item,
  nested = false,
  active,
  onNavigate,
}: {
  item: NavItem;
  nested?: boolean;
  active: boolean;
  onNavigate?: () => void;
}) {
  const Icon = iconMap[item.icon];
  const activeClasses = active
    ? "border-r-4 border-primary bg-primary-container/10 font-bold text-primary opacity-80"
    : "text-on-surface-variant hover:bg-surface-container-high";

  return (
    <Link
      href={item.href}
      onClick={onNavigate}
      className={[
        "flex items-center gap-4 rounded-lg px-4 py-2 transition-colors duration-150",
        activeClasses,
      ].join(" ")}
      aria-current={active ? "page" : undefined}
    >
      <Icon className={nested ? "h-4 w-4" : "h-5 w-5"} />
      <span className="text-xs font-semibold uppercase tracking-[0.02em] leading-4">
        {item.label}
      </span>
    </Link>
  );
}

function withSelectedProjectLabel(items: NavItem[], projectName: string) {
  return items.map((item) =>
    item.children
      ? { ...item, label: projectName }
      : item,
  );
}

export function AppSidebar({ className = "", onNavigate }: AppSidebarProps) {
  const pathname = usePathname();
  const { selectedProject } = useProject();
  const navItems = withSelectedProjectLabel(
    SIDEBAR_NAV,
    selectedProject?.name ?? "Migration Projects",
  );

  return (
    <nav
      className={[
        "flex h-full w-64 flex-col border-r border-outline-variant bg-surface px-4 py-6 shadow-sm",
        className,
      ]
        .filter(Boolean)
        .join(" ")}
    >
      <div className="mb-8 flex items-center gap-4">
        <div className="flex h-10 w-10 items-center justify-center rounded bg-primary-container text-on-primary-container">
          <DatasetIcon className="h-6 w-6" />
        </div>
        <div>
          <h1 className="text-2xl font-black tracking-tighter text-primary">
            MIGR8 AI
          </h1>
          <p className="text-xs font-semibold uppercase tracking-wide leading-4 text-on-surface-variant">
            Enterprise Migration
          </p>
        </div>
      </div>

      <Link
        href="/projects"
        onClick={onNavigate}
        className={[
          "mb-6 inline-flex h-11 w-full items-center justify-center gap-2 rounded border border-transparent bg-primary-container px-4 text-base font-semibold leading-7 text-on-primary shadow-ambient transition-colors hover:bg-primary hover:shadow-md",
          pathname === "/projects" || pathname.startsWith("/projects/")
            ? "ring-2 ring-primary/30"
            : "",
        ].join(" ")}
      >
        Projects
      </Link>

      <div className="flex-1 space-y-1 overflow-y-auto">
        {navItems.map((item) => (
          <div key={item.label} className="space-y-1">
            <NavLink
              item={item}
              active={isActivePath(pathname, item)}
              onNavigate={onNavigate}
            />
            {item.children ? (
              <div className="ml-4 space-y-1 border-l border-outline-variant/30 pl-2">
                {item.children.map((child) => (
                  <NavLink
                    key={child.label}
                    item={child}
                    nested
                    active={isActivePath(pathname, child)}
                    onNavigate={onNavigate}
                  />
                ))}
              </div>
            ) : null}
          </div>
        ))}
      </div>

      <div className="mt-auto space-y-1 overflow-visible border-t border-outline-variant pt-6">
        <ProfileMenu variant="sidebar" onNavigate={onNavigate} />
        {SIDEBAR_FOOTER_NAV.filter((item) => item.label !== "Profile").map(
          (item) => (
            <NavLink
              key={item.label}
              item={item}
              active={isActivePath(pathname, item)}
              onNavigate={onNavigate}
            />
          ),
        )}
      </div>
    </nav>
  );
}
