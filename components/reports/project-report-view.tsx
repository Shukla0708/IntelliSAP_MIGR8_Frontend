"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { DashboardSkeleton } from "@/components/dashboard/dashboard-skeleton";
import { KpiGrid, SectionCard } from "@/components/dashboard/kpi-card";
import { MigrationReadiness } from "@/components/dashboard/migration-readiness";
import {
  buildReportAttentionIssues,
  NeedsAttentionPanel,
} from "@/components/dashboard/needs-attention-panel";
import { CollapsiblePillar } from "@/components/reports/collapsible-pillar";
import { ComparisonReportContent } from "@/components/reports/comparison-report-section";
import { MappingReportContent } from "@/components/reports/mapping-report-section";
import { ValidationReportContent } from "@/components/reports/validation-report-section";
import { CompareIcon, HubIcon, RuleIcon } from "@/components/ui/icons";
import type { KpiMetric } from "@/data/dashboard";
import type { ProjectReport } from "@/data/project-report";
import { getApiErrorMessage } from "@/lib/axios";
import { formatCompact } from "@/lib/format-metrics";
import { fetchProjectReport } from "@/lib/project-report-api";
import { useDefaultProject } from "@/lib/use-default-project";

function formatUpdatedAt(iso: string | undefined): string {
  if (!iso) return "Updated just now";
  const date = new Date(iso);
  const diffMs = Date.now() - date.getTime();
  if (diffMs < 60_000) return "Updated just now";
  const minutes = Math.floor(diffMs / 60_000);
  if (minutes < 60) return `Updated ${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `Updated ${hours}h ago`;
  return `Updated ${date.toLocaleDateString()}`;
}

type ProjectStatus = "healthy" | "attention" | "getting-started";

function projectStatus(report: ProjectReport): ProjectStatus {
  const issues = buildReportAttentionIssues({
    failedRuns: report.validation.failedRuns,
    criticalErrors: report.validation.criticalErrors,
    comparisonMismatches: report.comparison.totalMismatches,
    unmappedFields: report.mapping.unmappedFields,
  });
  if (issues.length > 0) return "attention";
  if (
    report.validation.totalRuns === 0 &&
    report.comparison.totalRuns === 0 &&
    report.mapping.totalRuns === 0
  ) {
    return "getting-started";
  }
  return "healthy";
}

function StatusBadge({ status }: { status: ProjectStatus }) {
  const styles: Record<ProjectStatus, string> = {
    healthy: "bg-primary-container/15 text-primary",
    attention: "bg-error-container/20 text-error",
    "getting-started": "bg-surface-container-high text-on-surface-variant",
  };
  const labels: Record<ProjectStatus, string> = {
    healthy: "Healthy",
    attention: "Needs attention",
    "getting-started": "Getting started",
  };
  return (
    <span
      className={`inline-flex items-center rounded-full px-2.5 py-1 text-xs font-semibold uppercase tracking-wide ${styles[status]}`}
    >
      {labels[status]}
    </span>
  );
}

export function ProjectReportView() {
  const { project, loading: projectLoading } = useDefaultProject();
  const [report, setReport] = useState<ProjectReport | null>(null);
  const [error, setError] = useState<string | null>(null);

  const projectId = project?.id ?? null;

  useEffect(() => {
    if (!projectId || !project?.name) {
      return;
    }

    let cancelled = false;

    fetchProjectReport(projectId, project.name)
      .then((data) => {
        if (!cancelled) {
          setReport(data);
          setError(null);
        }
      })
      .catch((err) => {
        if (!cancelled) {
          setReport(null);
          setError(getApiErrorMessage(err, "Failed to load project report"));
        }
      });

    return () => {
      cancelled = true;
    };
  }, [projectId, project?.name]);

  const activeReport =
    projectId && report?.project.id === projectId ? report : null;

  const reportLoading =
    Boolean(projectId && project?.name) && !activeReport && !error;

  const displayError =
    error && (!projectId || !report || report.project.id === projectId)
      ? error
      : null;

  const metrics: KpiMetric[] = useMemo(() => {
    if (!activeReport) return [];
    const { validation, comparison, mapping } = activeReport;
    return [
      {
        id: "validation-runs",
        label: "Validation Runs",
        value: String(validation.totalRuns),
        hint: `${validation.completedRuns} completed`,
        tone: "primary",
        icon: "trendingUp",
      },
      {
        id: "records-validated",
        label: "Records Validated",
        value: formatCompact(validation.totalRecords),
        icon: "check",
      },
      {
        id: "pass-rate",
        label: "Validation Pass Rate",
        value: `${validation.passRate}%`,
        tone: "primary",
      },
      {
        id: "validation-errors",
        label: "Validation Errors",
        value: formatCompact(validation.totalErrors),
        tone: "error",
        icon: "warning",
      },
      {
        id: "comparison-mismatches",
        label: "Comparison Mismatches",
        value: formatCompact(comparison.totalMismatches),
        tone: "tertiary",
        icon: "difference",
        hint: `${comparison.completedRuns} completed runs`,
      },
      {
        id: "mapping-approval",
        label: "Mapping Approval",
        value: `${mapping.approvalRate}%`,
        progress: mapping.approvalRate,
        hint:
          mapping.totalFields === 0
            ? "No mapping runs yet"
            : `${mapping.totalFields - mapping.unmappedFields} of ${mapping.totalFields} confirmed`,
      },
    ];
  }, [activeReport]);

  const readinessBreakdown = useMemo(() => {
    if (!activeReport) return [];
    return [
      {
        label: "Validation",
        value: Math.round(activeReport.readiness.validation),
        barClassName: "bg-primary",
      },
      {
        label: "Comparison",
        value: Math.round(activeReport.readiness.comparison),
        barClassName: "bg-primary",
      },
      {
        label: "Mapping",
        value: Math.round(activeReport.readiness.mapping),
        barClassName: "bg-secondary-container",
      },
    ];
  }, [activeReport]);

  const attentionIssues = useMemo(() => {
    if (!activeReport) return [];
    return buildReportAttentionIssues({
      failedRuns: activeReport.validation.failedRuns,
      criticalErrors: activeReport.validation.criticalErrors,
      comparisonMismatches: activeReport.comparison.totalMismatches,
      unmappedFields: activeReport.mapping.unmappedFields,
    });
  }, [activeReport]);

  const showEmptyCtas =
    activeReport &&
    activeReport.validation.totalRuns === 0 &&
    !reportLoading &&
    !projectLoading;

  const status = activeReport ? projectStatus(activeReport) : null;

  return (
    <div className="mx-auto w-full max-w-[1200px]">
      <div className="mb-8">
        <div className="mb-2 flex flex-wrap items-center gap-3">
          <h2 className="text-[32px] font-semibold leading-10 tracking-[-0.01em] text-on-surface">
            Project Migration Report
          </h2>
          {status ? <StatusBadge status={status} /> : null}
        </div>
        <p className="max-w-2xl text-base leading-6 text-on-surface-variant">
          {project ? (
            <>
              Snapshot for &ldquo;{project.name}&rdquo; ·{" "}
              {formatUpdatedAt(activeReport?.generatedAt)}
            </>
          ) : (
            "Select a project to view its migration report."
          )}
        </p>
      </div>

      {!project && !projectLoading ? (
        <SectionCard className="p-6">
          <p className="text-sm text-on-surface-variant">
            No project selected.{" "}
            <Link href="/projects" className="font-semibold text-primary hover:underline">
              Choose a project
            </Link>{" "}
            from the sidebar switcher or projects page.
          </p>
        </SectionCard>
      ) : null}

      {projectLoading || reportLoading ? <DashboardSkeleton showPillars /> : null}

      {displayError && projectId ? (
        <SectionCard className="mb-6 p-6">
          <p className="text-sm text-error">{displayError}</p>
        </SectionCard>
      ) : null}

      {activeReport ? (
        <div className="grid grid-cols-1 gap-gutter lg:grid-cols-4">
          <div className="space-y-gutter lg:col-span-3">
            <KpiGrid metrics={metrics} />

            {showEmptyCtas ? (
              <SectionCard className="p-6 shadow-ambient">
                <h3 className="text-lg font-semibold text-on-surface">
                  Get started with this project
                </h3>
                <p className="mt-2 text-sm text-on-surface-variant">
                  No validation runs yet. Start with any migration tool below.
                </p>
                <div className="mt-4 flex flex-wrap gap-3">
                  <Link
                    href="/validation/new"
                    className="inline-flex h-11 items-center justify-center rounded bg-primary-container px-4 text-base font-semibold text-on-primary shadow-sm transition-colors hover:bg-primary"
                  >
                    Start Validation
                  </Link>
                  <Link
                    href="/compare/new"
                    className="inline-flex h-11 items-center justify-center rounded border border-outline-variant px-4 text-base font-semibold text-primary transition-colors hover:bg-surface-container-high"
                  >
                    Start Comparison
                  </Link>
                  <Link
                    href="/field-mapping/new"
                    className="inline-flex h-11 items-center justify-center rounded border border-outline-variant px-4 text-base font-semibold text-primary transition-colors hover:bg-surface-container-high"
                  >
                    Start Mapping
                  </Link>
                </div>
              </SectionCard>
            ) : null}

            <div className="space-y-gutter">
              <CollapsiblePillar
                title="Validation"
                icon={RuleIcon}
                toolHref="/validation"
                toolLabel="Open Validation"
                summary={`${activeReport.validation.passRate}% pass`}
                defaultOpen
              >
                <ValidationReportContent validation={activeReport.validation} />
              </CollapsiblePillar>

              <CollapsiblePillar
                title="Comparison"
                icon={CompareIcon}
                toolHref="/compare"
                toolLabel="Open Comparison"
                summary={`${formatCompact(activeReport.comparison.totalMismatches)} mismatches`}
              >
                <ComparisonReportContent comparison={activeReport.comparison} />
              </CollapsiblePillar>

              <CollapsiblePillar
                title="Field Mapping"
                icon={HubIcon}
                toolHref="/field-mapping"
                toolLabel="Open Field Mapping"
                summary={`${activeReport.mapping.approvalRate}% mapped`}
              >
                <MappingReportContent mapping={activeReport.mapping} />
              </CollapsiblePillar>
            </div>
          </div>

          <div className="space-y-gutter lg:col-span-1">
            <MigrationReadiness
              compact
              score={Math.round(activeReport.readiness.score)}
              breakdown={readinessBreakdown}
            />
            <NeedsAttentionPanel issues={attentionIssues} />
          </div>
        </div>
      ) : null}
    </div>
  );
}
