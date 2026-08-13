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
  {
    label: "Reports",
    href: "/activity/reports",
    icon: "analytics",
    matchPrefixes: ["/activity/reports"],
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
    href: "#",
    icon: "analytics",
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
  { label: "Settings", href: "#", icon: "settings" },
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

export const KPI_METRICS: KpiMetric[] = [
  {
    id: "active-projects",
    label: "Active Projects",
    value: "12",
    tone: "primary",
    icon: "trendingUp",
  },
  {
    id: "files-processed",
    label: "Files Processed",
    value: "248",
    hint: "This week",
  },
  {
    id: "records-validated",
    label: "Records Validated",
    value: "124k",
    icon: "check",
  },
  {
    id: "validation-errors",
    label: "Validation Errors",
    value: "37",
    tone: "error",
    icon: "warning",
  },
  {
    id: "comparison-mismatches",
    label: "Comparison Mismatches",
    value: "124",
    tone: "tertiary",
    icon: "difference",
  },
  {
    id: "mapping-approval",
    label: "Mapping Approval",
    value: "82%",
    progress: 82,
  },
];

export type RecentProject = {
  id: string;
  name: string;
  records: string;
  updated: string;
  icon: "sync" | "inventory" | "draft";
  accent?: "primary" | "neutral" | "muted";
};

export const RECENT_PROJECTS: RecentProject[] = [
  {
    id: "customer-master",
    name: "Customer Master — Oracle → SAP",
    records: "45k Records",
    updated: "Last updated 2h ago",
    icon: "sync",
    accent: "primary",
  },
  {
    id: "material-master",
    name: "Material Master",
    records: "12k Records",
    updated: "Last updated 1d ago",
    icon: "inventory",
    accent: "neutral",
  },
  {
    id: "vendor-master",
    name: "Vendor Master",
    records: "0 Records",
    updated: "Just created",
    icon: "draft",
    accent: "muted",
  },
];

export const READINESS = {
  score: 87,
  breakdown: [
    { label: "Validation", value: 94, barClassName: "bg-primary" },
    { label: "Comparison", value: 91, barClassName: "bg-primary" },
    { label: "Mapping", value: 76, barClassName: "bg-secondary-container" },
  ],
};
