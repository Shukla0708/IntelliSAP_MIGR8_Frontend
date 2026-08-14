export type NavItem = {
  label: string;
  href: string;
  icon:
    | "dashboard"
    | "dataset"
    | "rule"
    | "compare"
    | "hub"
    | "analytics"
    | "account"
    | "settings";
  active?: boolean;
  matchPrefixes?: string[];
  children?: NavItem[];
};

export type NavSection = {
  id: "overview" | "activity" | "project";
  label: string;
  items: NavItem[];
};

/** Global overview — not tied to a selected project */
export const SIDEBAR_OVERVIEW: NavItem[] = [
  {
    label: "Dashboard",
    href: "/dashboard",
    icon: "dashboard",
  },
];

/** Cross-project activity (current user's runs across all projects) */
export const SIDEBAR_ACTIVITY: NavItem[] = [
  {
    label: "Validations",
    href: "/activity/validations",
    icon: "rule",
    matchPrefixes: ["/activity/validations"],
  },
  {
    label: "Comparisons",
    href: "/activity/comparisons",
    icon: "compare",
    matchPrefixes: ["/activity/comparisons"],
  },
  {
    label: "Field Mapping",
    href: "/activity/mappings",
    icon: "hub",
    matchPrefixes: ["/activity/mappings"],
  },
];

/** Tools scoped to the currently selected project */
export const SIDEBAR_PROJECT_TOOLS: NavItem[] = [
  {
    label: "Validation",
    href: "/validation",
    icon: "rule",
    matchPrefixes: ["/validation", "/validation_result"],
  },
  {
    label: "Comparison",
    href: "/compare",
    icon: "compare",
    matchPrefixes: ["/compare"],
  },
  {
    label: "Field Mapping",
    href: "/field-mapping",
    icon: "hub",
    matchPrefixes: ["/field-mapping"],
  },
  {
    label: "Reports",
    href: "/report",
    icon: "analytics",
    matchPrefixes: ["/report"],
  },
];

/** @deprecated Prefer SIDEBAR_OVERVIEW / SIDEBAR_ACTIVITY / SIDEBAR_PROJECT_TOOLS */
export const SIDEBAR_NAV: NavItem[] = [
  ...SIDEBAR_OVERVIEW,
  {
    label: "Activity",
    href: "#",
    icon: "analytics",
    children: SIDEBAR_ACTIVITY,
  },
  {
    label: "Project 1",
    href: "#",
    icon: "dataset",
    children: SIDEBAR_PROJECT_TOOLS,
  },
];

export const SIDEBAR_FOOTER_NAV: NavItem[] = [
  { label: "Profile", href: "#", icon: "account" },
];

export type KpiTone = "default" | "primary" | "error" | "tertiary";

export type KpiMetric = {
  id: string;
  label: string;
  value: string;
  tone?: KpiTone;
  hint?: string;
  icon?: "trendingUp" | "check" | "warning" | "difference";
  progress?: number;
};

export type ReadinessBreakdownItem = {
  label: string;
  value: number;
  barClassName: string;
};

export type RecentProject = {
  id: string;
  name: string;
  records: string;
  updated: string;
  icon: "sync" | "inventory" | "draft";
  accent?: "primary" | "neutral" | "muted";
};
