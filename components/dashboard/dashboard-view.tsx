"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import { ACTIVITY_MAPPING_RUNS } from "@/components/activity/activity-mappings-list";
import type { ActivityValidationRun } from "@/components/activity/activity-validations-list";
import { KpiGrid, SectionCard } from "@/components/dashboard/kpi-card";
import { MigrationReadiness } from "@/components/dashboard/migration-readiness";
import { RecentProjects } from "@/components/dashboard/recent-projects";
import {
  CompareIcon,
  HubIcon,
  RuleIcon,
} from "@/components/ui/icons";
import { useProject } from "@/contexts/project-context";
import apiClient from "@/lib/axios";
import {
  fetchComparisonRuns,
  type ComparisonRunListItem,
} from "@/lib/comparison-api";
import type { KpiMetric, RecentProject } from "@/data/dashboard";

type ActivityFeedItem = {
  id: string;
  type: "validation" | "comparison" | "mapping";
  name: string;
  projectName: string;
  href: string;
  meta: string;
};

function formatCompact(n: number): string {
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1).replace(/\.0$/, "")}M`;
  if (n >= 1_000) return `${(n / 1_000).toFixed(1).replace(/\.0$/, "")}k`;
  return String(n);
}

function parseRecordCount(records: string): number {
  const match = records.match(/([\d.]+)\s*([kKmM])?/);
  if (!match) return 0;
  const value = Number(match[1]);
  if (Number.isNaN(value)) return 0;
  const suffix = (match[2] ?? "").toLowerCase();
  if (suffix === "k") return Math.round(value * 1000);
  if (suffix === "m") return Math.round(value * 1_000_000);
  return Math.round(value);
}

export function DashboardHeader() {
  return (
    <div className="mb-8">
      <h2 className="mb-2 text-[40px] font-bold tracking-[-0.02em] text-on-surface sm:text-[48px] sm:leading-[56px]">
        Migration Control Center
      </h2>
      <p className="max-w-3xl text-base leading-6 text-on-surface-variant">
        Monitor data quality, reconciliation and field mapping across all of
        your SAP migrations.
      </p>
    </div>
  );
}

export function DashboardView() {
  const router = useRouter();
  const { projects, selectProject, loading: projectsLoading } = useProject();
  const [runs, setRuns] = useState<ActivityValidationRun[]>([]);
  const [comparisons, setComparisons] = useState<ComparisonRunListItem[]>([]);
  const [runsLoading, setRunsLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    apiClient
      .get<ActivityValidationRun[]>("/api/runs/", { params: { limit: 100 } })
      .then((res) => {
        if (!cancelled) setRuns(res.data);
      })
      .catch(() => {
        if (!cancelled) setRuns([]);
      })
      .finally(() => {
        if (!cancelled) setRunsLoading(false);
      });
    fetchComparisonRuns({ limit: 100 })
      .then((rows) => {
        if (!cancelled) setComparisons(rows);
      })
      .catch(() => {
        if (!cancelled) setComparisons([]);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  const metrics: KpiMetric[] = useMemo(() => {
    const totalRecords = runs.reduce(
      (sum, run) => sum + parseRecordCount(run.records),
      0,
    );
    const totalErrors = runs.reduce((sum, run) => sum + (run.errors || 0), 0);
    const completedRuns = runs.filter((run) => run.status === "completed").length;
    const comparisonMismatches = comparisons.reduce(
      (sum, run) => sum + run.mismatches,
      0,
    );
    const mappingUnmapped = ACTIVITY_MAPPING_RUNS.reduce(
      (sum, run) => sum + run.unmapped,
      0,
    );
    const mappingFields = ACTIVITY_MAPPING_RUNS.reduce(
      (sum, run) => sum + parseRecordCount(run.fields.replace(/fields?/i, "")),
      0,
    );
    const mappingApproval =
      mappingFields > 0
        ? Math.round(((mappingFields - mappingUnmapped) / mappingFields) * 100)
        : 0;

    return [
      {
        id: "active-projects",
        label: "Active Projects",
        value: String(projects.length),
        tone: "primary",
        icon: "trendingUp",
      },
      {
        id: "files-processed",
        label: "Validation Runs",
        value: String(runs.length),
        hint: `${completedRuns} completed`,
      },
      {
        id: "records-validated",
        label: "Records Validated",
        value: formatCompact(totalRecords),
        icon: "check",
      },
      {
        id: "validation-errors",
        label: "Validation Errors",
        value: String(totalErrors),
        tone: "error",
        icon: "warning",
      },
      {
        id: "comparison-mismatches",
        label: "Comparison Mismatches",
        value: String(comparisonMismatches),
        tone: "tertiary",
        icon: "difference",
        hint: "From comparison runs",
      },
      {
        id: "mapping-approval",
        label: "Mapping Approval",
        value: `${mappingApproval}%`,
        progress: mappingApproval,
        hint: "From activity (mock until API)",
      },
    ];
  }, [comparisons, projects.length, runs]);

  const recentProjects: RecentProject[] = useMemo(() => {
    const runCounts = new Map<string, number>();
    for (const run of runs) {
      runCounts.set(
        run.project_id,
        (runCounts.get(run.project_id) ?? 0) + parseRecordCount(run.records),
      );
    }
    return projects.slice(0, 5).map((project, index) => {
      const records = runCounts.get(project.id) ?? 0;
      return {
        id: project.id,
        name: project.name,
        records: records > 0 ? `${formatCompact(records)} Records` : "0 Records",
        updated: project.updated,
        icon: (index === 0 ? "sync" : index === 1 ? "inventory" : "draft") as RecentProject["icon"],
        accent: (index === 0 ? "primary" : index === 1 ? "neutral" : "muted") as RecentProject["accent"],
      };
    });
  }, [projects, runs]);

  const activityFeed: ActivityFeedItem[] = useMemo(() => {
    const validationItems: ActivityFeedItem[] = runs.slice(0, 5).map((run) => ({
      id: `val-${run.id}`,
      type: "validation",
      name: run.name,
      projectName: run.project_name,
      href: `/validation_result/${run.id}`,
      meta: `${run.errors} errors · ${run.status}`,
    }));

    const comparisonItems: ActivityFeedItem[] = comparisons.slice(0, 2).map((run) => ({
      id: `cmp-${run.id}`,
      type: "comparison",
      name: run.name,
      projectName: run.projectName,
      href: `/compare/${run.id}`,
      meta: `${run.mismatches} mismatches`,
    }));

    const mappingItems: ActivityFeedItem[] = ACTIVITY_MAPPING_RUNS.slice(0, 2).map(
      (run) => ({
        id: `map-${run.id}`,
        type: "mapping",
        name: run.name,
        projectName: run.projectName,
        href: `/field-mapping/${run.id}`,
        meta: `${run.unmapped} unmapped`,
      }),
    );

    return [...validationItems, ...comparisonItems, ...mappingItems].slice(0, 8);
  }, [comparisons, runs]);

  const readiness = useMemo(() => {
    const completed = runs.filter((r) => r.status === "completed").length;
    const failed = runs.filter((r) => r.status === "failed").length;
    const validationScore =
      runs.length === 0
        ? 0
        : Math.round((completed / Math.max(runs.length, 1)) * 100);
    const comparisonScore =
      comparisons.length === 0
        ? 0
        : Math.round(
            (comparisons.filter((r) => r.status === "completed").length /
              comparisons.length) *
              100,
          );
    const mappingScore =
      ACTIVITY_MAPPING_RUNS.length === 0
        ? 0
        : Math.round(
            (ACTIVITY_MAPPING_RUNS.filter((r) => r.status === "completed").length /
              ACTIVITY_MAPPING_RUNS.length) *
              100,
          );
    const score = Math.round(
      (validationScore + comparisonScore + mappingScore) / 3,
    );
    return {
      score: Number.isFinite(score) ? score : 0,
      breakdown: [
        { label: "Validation", value: validationScore, barClassName: "bg-primary" },
        { label: "Comparison", value: comparisonScore, barClassName: "bg-primary" },
        {
          label: "Mapping",
          value: mappingScore,
          barClassName: "bg-secondary-container",
        },
      ],
      failed,
    };
  }, [comparisons, runs]);

  const loading = projectsLoading || runsLoading;

  return (
    <>
      <DashboardHeader />

      <div className="mb-8 grid grid-cols-1 gap-gutter lg:grid-cols-4">
        <div className="space-y-gutter lg:col-span-3">
          {loading ? (
            <p className="text-sm text-on-surface-variant">Loading dashboard…</p>
          ) : (
            <KpiGrid metrics={metrics} />
          )}
          <RecentProjects
            projects={recentProjects}
            onSelectProject={(projectId) => {
              selectProject(projectId);
              router.push("/validation");
            }}
          />

          <SectionCard className="overflow-hidden">
            <div className="flex items-center justify-between border-b border-outline-variant bg-surface-container-lowest p-4">
              <h3 className="text-xl font-semibold leading-7 text-on-surface">
                Recent Activity
              </h3>
              <Link
                href="/activity/validations"
                className="text-xs font-semibold uppercase tracking-[0.02em] text-primary hover:underline"
              >
                View all
              </Link>
            </div>
            <div className="divide-y divide-outline-variant">
              {activityFeed.length === 0 ? (
                <p className="p-4 text-sm text-on-surface-variant">
                  No recent activity yet.
                </p>
              ) : (
                activityFeed.map((item) => {
                  const Icon =
                    item.type === "validation"
                      ? RuleIcon
                      : item.type === "comparison"
                        ? CompareIcon
                        : HubIcon;
                  return (
                    <Link
                      key={item.id}
                      href={item.href}
                      className="flex items-center gap-4 p-4 transition-colors hover:bg-surface-container-low"
                    >
                      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded bg-primary-container/10 text-primary">
                        <Icon className="h-5 w-5" />
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="truncate text-base font-semibold text-on-surface">
                          {item.name}
                        </p>
                        <p className="mt-1 truncate text-xs text-on-surface-variant">
                          <span className="font-bold uppercase tracking-wide">
                            {item.projectName}
                          </span>
                          {" · "}
                          {item.meta}
                        </p>
                      </div>
                    </Link>
                  );
                })
              )}
            </div>
          </SectionCard>
        </div>

        <div className="space-y-gutter">
          <MigrationReadiness
            score={readiness.score}
            breakdown={readiness.breakdown}
          />
          {readiness.failed > 0 ? (
            <SectionCard className="p-4">
              <h3 className="text-sm font-bold uppercase tracking-wide text-error">
                Needs attention
              </h3>
              <p className="mt-2 text-sm text-on-surface-variant">
                {readiness.failed} validation run
                {readiness.failed === 1 ? "" : "s"} failed across your projects.
              </p>
              <Link
                href="/activity/validations"
                className="mt-3 inline-block text-sm font-semibold text-primary hover:underline"
              >
                Review validations
              </Link>
            </SectionCard>
          ) : null}
        </div>
      </div>
    </>
  );
}
