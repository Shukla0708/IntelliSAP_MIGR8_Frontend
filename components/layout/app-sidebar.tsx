"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useRef, useState, type ComponentType } from "react";
import {
  AccountCircleIcon,
  AnalyticsIcon,
  CompareIcon,
  DashboardIcon,
  DatasetIcon,
  ExpandMoreIcon,
  HubIcon,
  RuleIcon,
  SettingsIcon,
} from "@/components/ui/icons";
import { ProfileMenu } from "@/components/layout/profile-menu";
import { useProject } from "@/contexts/project-context";
import {
  SIDEBAR_ACTIVITY,
  SIDEBAR_FOOTER_NAV,
  SIDEBAR_OVERVIEW,
  SIDEBAR_PROJECT_TOOLS,
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

  if (!item.href || item.href === "#") {
    return (
      <span
        className={[
          "flex items-center gap-4 rounded-lg px-4 py-2 text-on-surface-variant",
          nested ? "" : "",
        ].join(" ")}
      >
        <Icon className={nested ? "h-4 w-4" : "h-5 w-5"} />
        <span className="text-xs font-semibold uppercase tracking-[0.02em] leading-4">
          {item.label}
        </span>
      </span>
    );
  }

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

function SectionLabel({ children }: { children: string }) {
  return (
    <p className="mb-1 px-4 pt-3 text-[10px] font-bold uppercase tracking-[0.08em] text-outline">
      {children}
    </p>
  );
}

function ProjectSwitcher({ onNavigate }: { onNavigate?: () => void }) {
  const { projects, selectedProject, selectProject, loading } = useProject();
  const [open, setOpen] = useState(false);
  const rootRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    function onPointerDown(event: MouseEvent) {
      if (!rootRef.current?.contains(event.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", onPointerDown);
    return () => document.removeEventListener("mousedown", onPointerDown);
  }, [open]);

  return (
    <div ref={rootRef} className="relative mb-1 px-2">
      <button
        type="button"
        onClick={() => setOpen((value) => !value)}
        className="flex w-full items-center gap-2 rounded-lg border border-outline-variant bg-surface-container-lowest px-3 py-2 text-left transition-colors hover:bg-surface-container-high"
        aria-expanded={open}
        aria-haspopup="listbox"
      >
        <DatasetIcon className="h-4 w-4 shrink-0 text-primary" />
        <span className="min-w-0 flex-1 truncate text-xs font-semibold uppercase tracking-[0.02em] leading-4 text-on-surface">
          {loading
            ? "Loading…"
            : selectedProject?.name ?? "Select a project"}
        </span>
        <ExpandMoreIcon
          className={`h-4 w-4 shrink-0 text-on-surface-variant transition-transform ${open ? "rotate-180" : ""}`}
        />
      </button>

      {open ? (
        <div
          role="listbox"
          className="absolute left-2 right-2 z-20 mt-1 max-h-56 overflow-y-auto rounded-lg border border-outline-variant bg-surface-container-lowest py-1 shadow-lg"
        >
          {projects.length === 0 ? (
            <p className="px-3 py-2 text-xs text-on-surface-variant">
              No projects yet.{" "}
              <Link
                href="/projects"
                onClick={() => {
                  setOpen(false);
                  onNavigate?.();
                }}
                className="font-semibold text-primary hover:underline"
              >
                Create one
              </Link>
            </p>
          ) : (
            projects.map((project) => {
              const selected = project.id === selectedProject?.id;
              return (
                <button
                  key={project.id}
                  type="button"
                  role="option"
                  aria-selected={selected}
                  onClick={() => {
                    selectProject(project.id);
                    setOpen(false);
                  }}
                  className={[
                    "flex w-full items-center px-3 py-2 text-left text-xs font-semibold leading-4 transition-colors",
                    selected
                      ? "bg-primary-container/10 text-primary"
                      : "text-on-surface hover:bg-surface-container-high",
                  ].join(" ")}
                >
                  <span className="truncate">{project.name}</span>
                </button>
              );
            })
          )}
          <Link
            href="/projects"
            onClick={() => {
              setOpen(false);
              onNavigate?.();
            }}
            className="mt-1 flex w-full border-t border-outline-variant px-3 py-2 text-xs font-semibold text-primary hover:bg-surface-container-high"
          >
            Manage projects
          </Link>
        </div>
      ) : null}
    </div>
  );
}

export function AppSidebar({ className = "", onNavigate }: AppSidebarProps) {
  const pathname = usePathname();

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
          "mb-4 inline-flex h-11 w-full items-center justify-center gap-2 rounded border border-transparent bg-primary-container px-4 text-base font-semibold leading-7 text-on-primary shadow-ambient transition-colors hover:bg-primary hover:shadow-md",
          pathname === "/projects" || pathname.startsWith("/projects/")
            ? "ring-2 ring-primary/30"
            : "",
        ].join(" ")}
      >
        Projects
      </Link>

      <div className="flex-1 space-y-2 overflow-y-auto">
        <div>
          <SectionLabel>Overview</SectionLabel>
          {SIDEBAR_OVERVIEW.map((item) => (
            <NavLink
              key={item.href}
              item={item}
              active={isActivePath(pathname, item)}
              onNavigate={onNavigate}
            />
          ))}
        </div>

        <div>
          <SectionLabel>Activity</SectionLabel>
          <div className="space-y-1">
            {SIDEBAR_ACTIVITY.map((item) => (
              <NavLink
                key={item.href}
                item={item}
                nested
                active={isActivePath(pathname, item)}
                onNavigate={onNavigate}
              />
            ))}
          </div>
        </div>

        <div>
          <SectionLabel>Current project</SectionLabel>
          <ProjectSwitcher onNavigate={onNavigate} />
          <div className="ml-2 space-y-1 border-l border-outline-variant/30 pl-2">
            {SIDEBAR_PROJECT_TOOLS.map((item) => (
              <NavLink
                key={`${item.label}-${item.href}`}
                item={item}
                nested
                active={isActivePath(pathname, item)}
                onNavigate={onNavigate}
              />
            ))}
          </div>
        </div>
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
