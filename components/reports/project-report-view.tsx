"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { KpiGrid, SectionCard } from "@/components/dashboard/kpi-card";
import { MigrationReadiness } from "@/components/dashboard/migration-readiness";
import { ComparisonReportSectionView } from "@/components/reports/comparison-report-section";
import { MappingReportSectionView } from "@/components/reports/mapping-report-section";
import { ValidationReportSection } from "@/components/reports/validation-report-section";
import type { KpiMetric } from "@/data/dashboard";
import type { ProjectReport } from "@/data/project-report";
import { getApiErrorMessage } from "@/lib/axios";
import { fetchProjectReport } from "@/lib/project-report-api";
import { useDefaultProject } from "@/lib/use-default-project";

function formatCompact(n: number): string {
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1).replace(/\.0$/, "")}M`;
  if (n >= 1_000) return `${(n / 1_000).toFixed(1).replace(/\.0$/, "")}k`;
  return String(n);
}

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

type NeedsAttentionProps = {
  failedRuns: number;
  criticalErrors: number;
  unmappedFields: number;
};

function NeedsAttentionCard({
  failedRuns,
  criticalErrors,
  unmappedFields,
}: NeedsAttentionProps) {
  const items: string[] = [];
  if (failedRuns > 0) {
    items.push(
      `${failedRuns} failed validation run${failedRuns === 1 ? "" : "s"}`,
    );
  }
  if (criticalErrors > 0) {
    items.push(
      `${criticalErrors} critical error${criticalErrors === 1 ? "" : "s"}`,
    );
  }
  if (unmappedFields > 0) {
    items.push(
      `${unmappedFields} unmapped field${unmappedFields === 1 ? "" : "s"}`,
    );
  }

  if (items.length === 0) {
    return (
      <SectionCard className="flex h-full flex-col p-6">
        <h3 className="text-xl font-semibold leading-7 text-on-surface">
          Needs Attention
        </h3>
        <p className="mt-4 flex-1 text-sm text-on-surface-variant">
          No critical issues detected for this project.
        </p>
      </SectionCard>
    );
  }

  return (
    <SectionCard className="flex h-full flex-col p-6">
      <h3 className="text-xl font-semibold leading-7 text-error">Needs Attention</h3>
      <ul className="mt-4 flex-1 space-y-2 text-sm text-on-surface-variant">
        {items.map((item) => (
          <li key={item} className="flex items-start gap-2">
            <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-error" />
            {item}
          </li>
        ))}
      </ul>
      <div className="mt-4 flex flex-wrap gap-2">
        {failedRuns > 0 ? (
          <Link
            href="/validation"
            className="text-xs font-semibold uppercase tracking-wide text-primary hover:underline"
          >
            Review validations
          </Link>
        ) : null}
        {unmappedFields > 0 ? (
          <Link
            href="/field-mapping"
            className="text-xs font-semibold uppercase tracking-wide text-primary hover:underline"
          >
            Review mapping
          </Link>
        ) : null}
      </div>
    </SectionCard>
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
    Boolean(projectId && project?.name) &&
    !activeReport &&
    !error;

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
        value: String(validation.totalErrors),
        tone: "error",
        icon: "warning",
      },
      {
        id: "comparison-mismatches",
        label: "Comparison Mismatches",
        value: String(comparison.totalMismatches),
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
            : `${mapping.totalFields - mapping.unmappedFields} of ${mapping.totalFields} fields confirmed`,
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

  const showEmptyCtas =
    activeReport &&
    activeReport.validation.totalRuns === 0 &&
    !reportLoading &&
    !projectLoading;

  return (
    <div className="mx-auto w-full max-w-[1200px]">
      <div className="mb-8">
        <h2 className="mb-2 text-[32px] font-semibold leading-10 tracking-[-0.01em] text-on-surface">
          Project Migration Report
        </h2>
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

      {(projectLoading || reportLoading) ? (
        <p className="text-sm text-on-surface-variant">Loading report…</p>
      ) : null}

      {displayError && projectId ? (
        <SectionCard className="mb-6 p-6">
          <p className="text-sm text-error">{displayError}</p>
        </SectionCard>
      ) : null}

      {activeReport ? (
        <>
          <div className="mb-8 grid grid-cols-1 gap-gutter lg:grid-cols-2">
            <MigrationReadiness
              score={Math.round(activeReport.readiness.score)}
              breakdown={readinessBreakdown}
            />
            <NeedsAttentionCard
              failedRuns={activeReport.validation.failedRuns}
              criticalErrors={activeReport.validation.criticalErrors}
              unmappedFields={activeReport.mapping.unmappedFields}
            />
          </div>

          <div className="mb-8">
            <KpiGrid metrics={metrics} />
          </div>

          {showEmptyCtas ? (
            <SectionCard className="mb-8 p-6">
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
            <ValidationReportSection validation={activeReport.validation} />
            <ComparisonReportSectionView comparison={activeReport.comparison} />
            <MappingReportSectionView mapping={activeReport.mapping} />
          </div>
        </>
      ) : null}
    </div>
  );
}
