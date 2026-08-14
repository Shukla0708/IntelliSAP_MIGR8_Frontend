import Link from "next/link";
import type { ComponentType } from "react";
import { SectionCard } from "@/components/dashboard/kpi-card";
import {
  CheckCircleIcon,
  CompareIcon,
  ErrorIcon,
  HubIcon,
  RuleIcon,
  WarningIcon,
} from "@/components/ui/icons";
import { formatCompact } from "@/lib/format-metrics";

export type AttentionIssue = {
  id: string;
  title: string;
  detail: string;
  href: string;
  ctaLabel: string;
  icon?: "validation" | "comparison" | "mapping" | "error";
};

const issueIconMap: Record<
  NonNullable<AttentionIssue["icon"]>,
  ComponentType<{ className?: string }>
> = {
  validation: RuleIcon,
  comparison: CompareIcon,
  mapping: HubIcon,
  error: ErrorIcon,
};

type NeedsAttentionPanelProps = {
  issues: AttentionIssue[];
};

export function NeedsAttentionPanel({ issues }: NeedsAttentionPanelProps) {
  if (issues.length === 0) {
    return (
      <SectionCard className="border-primary/20 bg-primary-container/5 p-4 shadow-ambient">
        <div className="flex items-start gap-3">
          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-primary-container/20 text-primary">
            <CheckCircleIcon className="h-5 w-5" />
          </div>
          <div>
            <h3 className="text-sm font-semibold text-on-surface">All clear</h3>
            <p className="mt-1 text-xs leading-5 text-on-surface-variant">
              No blocking issues detected right now.
            </p>
          </div>
        </div>
      </SectionCard>
    );
  }

  return (
    <SectionCard className="overflow-hidden border-error/25 shadow-ambient">
      <div className="flex items-center justify-between border-b border-error/15 bg-error-container/10 px-4 py-3">
        <div className="flex items-center gap-2">
          <WarningIcon className="h-4 w-4 text-error" />
          <h3 className="text-sm font-semibold text-error">Needs Attention</h3>
        </div>
        <span className="rounded-full bg-error px-2 py-0.5 text-[10px] font-bold text-on-error">
          {issues.length}
        </span>
      </div>

      <ul className="divide-y divide-outline-variant/60">
        {issues.map((issue) => {
          const Icon = issueIconMap[issue.icon ?? "error"];
          return (
            <li key={issue.id} className="px-4 py-3">
              <div className="flex items-start gap-3">
                <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded bg-error-container/15 text-error">
                  <Icon className="h-4 w-4" />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-semibold text-on-surface">{issue.title}</p>
                  <p className="mt-0.5 text-xs text-on-surface-variant">{issue.detail}</p>
                  <Link
                    href={issue.href}
                    className="mt-2 inline-flex items-center text-xs font-semibold uppercase tracking-wide text-primary hover:underline"
                  >
                    {issue.ctaLabel}
                  </Link>
                </div>
              </div>
            </li>
          );
        })}
      </ul>
    </SectionCard>
  );
}

export function buildReportAttentionIssues(input: {
  failedRuns: number;
  criticalErrors: number;
  comparisonMismatches: number;
  unmappedFields: number;
}): AttentionIssue[] {
  const issues: AttentionIssue[] = [];

  if (input.failedRuns > 0) {
    issues.push({
      id: "failed-runs",
      title: "Failed validation runs",
      detail: `${input.failedRuns} run${input.failedRuns === 1 ? "" : "s"} need review`,
      href: "/validation",
      ctaLabel: "Review validations",
      icon: "validation",
    });
  }

  if (input.criticalErrors > 0) {
    issues.push({
      id: "critical-errors",
      title: "Critical errors",
      detail: `${formatCompact(input.criticalErrors)} across completed runs`,
      href: "/validation",
      ctaLabel: "Review validations",
      icon: "error",
    });
  }

  if (input.comparisonMismatches > 0) {
    issues.push({
      id: "comparison-mismatches",
      title: "Comparison mismatches",
      detail: `${formatCompact(input.comparisonMismatches)} records differ`,
      href: "/compare",
      ctaLabel: "Review comparisons",
      icon: "comparison",
    });
  }

  if (input.unmappedFields > 0) {
    issues.push({
      id: "unmapped-fields",
      title: "Unmapped fields",
      detail: `${input.unmappedFields} field${input.unmappedFields === 1 ? "" : "s"} pending confirmation`,
      href: "/field-mapping",
      ctaLabel: "Review mapping",
      icon: "mapping",
    });
  }

  return issues;
}

export function buildDashboardAttentionIssues(input: {
  failedRuns: number;
  totalErrors: number;
  comparisonMismatches: number;
  awaitingApproval: number;
  unmappedFields: number;
}): AttentionIssue[] {
  const issues: AttentionIssue[] = [];

  if (input.failedRuns > 0) {
    issues.push({
      id: "failed-runs",
      title: "Failed validation runs",
      detail: `${input.failedRuns} run${input.failedRuns === 1 ? "" : "s"} across projects`,
      href: "/activity/validations",
      ctaLabel: "Review validations",
      icon: "validation",
    });
  }

  if (input.totalErrors > 0) {
    issues.push({
      id: "validation-errors",
      title: "Validation errors",
      detail: `${formatCompact(input.totalErrors)} total errors detected`,
      href: "/activity/validations",
      ctaLabel: "View activity",
      icon: "error",
    });
  }

  if (input.comparisonMismatches > 0) {
    issues.push({
      id: "comparison-mismatches",
      title: "Comparison mismatches",
      detail: `${formatCompact(input.comparisonMismatches)} mismatches found`,
      href: "/activity/comparisons",
      ctaLabel: "Review comparisons",
      icon: "comparison",
    });
  }

  if (input.awaitingApproval > 0) {
    issues.push({
      id: "awaiting-approval",
      title: "Mappings awaiting approval",
      detail: `${input.awaitingApproval} mapping run${input.awaitingApproval === 1 ? "" : "s"} need sign-off`,
      href: "/activity/mappings",
      ctaLabel: "Review mappings",
      icon: "mapping",
    });
  }

  if (input.unmappedFields > 0) {
    issues.push({
      id: "unmapped-fields",
      title: "Unmapped fields",
      detail: `${input.unmappedFields} fields still unmapped`,
      href: "/activity/mappings",
      ctaLabel: "Open mappings",
      icon: "mapping",
    });
  }

  return issues;
}
