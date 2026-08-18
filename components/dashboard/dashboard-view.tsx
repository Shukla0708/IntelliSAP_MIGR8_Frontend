"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useCallback, useEffect, useMemo, useState } from "react";
import { DashboardSkeleton } from "@/components/dashboard/dashboard-skeleton";
import { KpiGrid, SectionCard } from "@/components/dashboard/kpi-card";
import { MigrationReadiness } from "@/components/dashboard/migration-readiness";
import {
  buildDashboardAttentionIssues,
  NeedsAttentionPanel,
} from "@/components/dashboard/needs-attention-panel";
import { RecentProjects } from "@/components/dashboard/recent-projects";
import { CompareIcon, HubIcon, RuleIcon } from "@/components/ui/icons";
import { useProject } from "@/contexts/project-context";
import type { KpiMetric, RecentProject } from "@/data/dashboard";
import apiClient from "@/lib/axios";
import { formatCompact } from "@/lib/format-metrics";

type DashboardPayload = {
  kpis: {
    activeProjects: number;
    validationRuns: number;
    completedRuns: number;
    recordsValidated: number;
    validationErrors: number;
    comparisonMismatches: number;
    failedRuns: number;
    unmappedFields: number;
  };
  mappingStats: {
    approved: number;
    awaitingApproval: number;
    processing: number;
    failed: number;
    total: number;
  };
  readiness: {
    score: number;
    validation: number;
    comparison: number;
    mapping: number;
    failed: number;
  };
  recentProjects: Array<{
    id: string;
    name: string;
    runCount: number;
    records: number;
    createdAt: string | null;
  }>;
  activity: Array<{
    id: string;
    type: "validation" | "comparison" | "mapping";
    name: string;
    projectName: string;
    href: string;
    meta: string;
  }>;
};

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
  const { selectProject, loading: projectsLoading } = useProject();
  const [data, setData] = useState<DashboardPayload | null>(null);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
        const { data: payload } = await apiClient.get<DashboardPayload>("/api/dashboard/");
    setData(payload);
  }, []);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    load()
      .catch(() => {
        if (!cancelled) setData(null);
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [load]);

  const metrics: KpiMetric[] = useMemo(() => {
    if (!data) return [];
    const mappingReviewable =
      data.mappingStats.approved + data.mappingStats.awaitingApproval;
    const mappingApproval =
      mappingReviewable === 0
        ? 0
        : Math.round((data.mappingStats.approved / mappingReviewable) * 100);
    return [
      {
        id: "active-projects",
        label: "Active Projects",
        value: String(data.kpis.activeProjects),
        tone: "primary",
        icon: "trendingUp",
      },
      {
        id: "files-processed",
        label: "Validation Runs",
        value: String(data.kpis.validationRuns),
        hint: `${data.kpis.completedRuns} completed`,
      },
      {
        id: "records-validated",
        label: "Records Validated",
        value: formatCompact(data.kpis.recordsValidated),
        icon: "check",
      },
      {
        id: "validation-errors",
        label: "Validation Errors",
        value: formatCompact(data.kpis.validationErrors),
        tone: "error",
        icon: "warning",
      },
      {
        id: "comparison-mismatches",
        label: "Comparison Mismatches",
        value: formatCompact(data.kpis.comparisonMismatches),
        tone: "tertiary",
        icon: "difference",
        hint: "From comparison runs",
      },
      {
        id: "mapping-approval",
        label: "Mapping Approval",
        value: `${mappingApproval}%`,
        progress: mappingApproval,
        hint:
          mappingReviewable === 0
            ? "No mappings yet"
            : `${data.mappingStats.approved} of ${mappingReviewable} approved`,
      },
    ];
  }, [data]);

  const recentProjects: RecentProject[] = useMemo(() => {
    if (!data) return [];
    return data.recentProjects.map((project) => ({
      id: project.id,
      name: project.name,
      records:
        project.runCount > 0
          ? `${project.runCount} run${project.runCount === 1 ? "" : "s"} · ${formatCompact(project.records)} records`
          : "No runs yet",
      updated: project.createdAt
        ? `Created ${new Date(project.createdAt).toLocaleString()}`
        : "Recently created",
      icon: (project.runCount > 0 ? "sync" : "draft") as RecentProject["icon"],
      accent: (project.runCount > 0 ? "primary" : "muted") as RecentProject["accent"],
    }));
  }, [data]);

  const attentionIssues = useMemo(() => {
    if (!data) return [];
    return buildDashboardAttentionIssues({
      failedRuns: data.readiness.failed,
      totalErrors: data.kpis.validationErrors,
      comparisonMismatches: data.kpis.comparisonMismatches,
      awaitingApproval: data.mappingStats.awaitingApproval,
      unmappedFields: data.kpis.unmappedFields,
    });
  }, [data]);

  const showSkeleton = projectsLoading || loading || !data;

  return (
    <div className="mx-auto w-full max-w-[1200px]">
      <DashboardHeader />

      {showSkeleton ? (
        <DashboardSkeleton showSections />
      ) : (
        <div className="grid grid-cols-1 gap-gutter lg:grid-cols-4">
          <div className="space-y-gutter lg:col-span-3">
            <KpiGrid metrics={metrics} />
            <RecentProjects
              projects={recentProjects}
              onSelectProject={(projectId) => {
                selectProject(projectId);
                router.push("/validation");
              }}
            />
            <SectionCard className="overflow-hidden shadow-ambient">
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
                {data.activity.length === 0 ? (
                  <p className="p-4 text-sm text-on-surface-variant">
                    No recent activity yet.
                  </p>
                ) : (
                  data.activity.map((item) => {
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
          <div className="space-y-gutter lg:col-span-1">
            <MigrationReadiness
              compact
              score={data.readiness.score}
              breakdown={[
                { label: "Validation", value: data.readiness.validation, barClassName: "bg-primary" },
                { label: "Comparison", value: data.readiness.comparison, barClassName: "bg-primary" },
                { label: "Mapping", value: data.readiness.mapping, barClassName: "bg-secondary-container" },
              ]}
            />
            <NeedsAttentionPanel issues={attentionIssues} />
          </div>
        </div>
      )}
    </div>
  );
}
