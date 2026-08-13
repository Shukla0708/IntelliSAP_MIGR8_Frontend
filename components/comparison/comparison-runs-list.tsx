"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { SectionCard } from "@/components/dashboard/kpi-card";
import { ProjectPickerDialog } from "@/components/projects/project-picker-dialog";
import { AddIcon, CompareIcon } from "@/components/ui/icons";
import { useProject } from "@/contexts/project-context";
import type { ComparisonRunStatus } from "@/data/comparison";
import { fetchComparisonRuns, type ComparisonRunListItem } from "@/lib/comparison-api";
import { comparisonRunHref } from "@/lib/comparison-routes";

const statusStyles: Record<
  ComparisonRunStatus,
  { label: string; className: string }
> = {
  draft: {
    label: "Draft",
    className: "bg-surface-container-high text-on-surface-variant",
  },
  completed: {
    label: "Completed",
    className: "bg-success/10 text-success",
  },
  failed: {
    label: "Failed",
    className: "bg-error-container text-error",
  },
  running: {
    label: "Running",
    className: "bg-primary-container/10 text-primary",
  },
};

export function ComparisonRunsList() {
  const { selectedProject } = useProject();
  const [runs, setRuns] = useState<ComparisonRunListItem[] | null>(null);
  const [pickerOpen, setPickerOpen] = useState(false);

  const projectId = selectedProject?.id ?? null;
  const loading = projectId !== null && runs === null;

  useEffect(() => {
    if (!projectId) return;

    let cancelled = false;
    fetchComparisonRuns({ projectId })
      .then((data) => {
        if (!cancelled) setRuns(data);
      })
      .catch(() => {
        if (!cancelled) setRuns([]);
      });

    return () => {
      cancelled = true;
    };
  }, [projectId]);

  return (
    <div className="mx-auto w-full max-w-[1200px]">
      <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h2 className="mb-2 text-[32px] font-semibold leading-10 tracking-[-0.01em] text-on-surface">
            Comparison
          </h2>
          <p className="max-w-2xl text-base leading-6 text-on-surface-variant">
            Review previous postload vs preload comparison runs
            {selectedProject ? ` for "${selectedProject.name}"` : " for this migration project"}
            , or start a new comparison.
          </p>
          <p className="mt-2 text-sm">
            <Link
              href="/activity/comparisons"
              className="font-semibold text-primary hover:underline"
            >
              View all projects&apos; comparisons
            </Link>
          </p>
        </div>
        <button
          type="button"
          onClick={() => setPickerOpen(true)}
          className="inline-flex h-11 shrink-0 items-center justify-center gap-2 self-start rounded border border-transparent bg-primary-container px-4 text-base font-semibold leading-7 text-on-primary shadow-ambient transition-colors hover:bg-primary hover:shadow-md sm:self-auto"
        >
          <AddIcon className="h-4 w-4" />
          New Comparison
        </button>
      </div>

      <SectionCard className="overflow-hidden">
        <div className="border-b border-outline-variant bg-surface-container-lowest p-4">
          <h3 className="text-xl font-semibold leading-7 text-on-surface">
            Previous Comparison Runs
          </h3>
        </div>

        <div className="divide-y divide-outline-variant">
          {loading && (
            <p className="p-4 text-sm text-on-surface-variant">Loading runs…</p>
          )}

          {!loading && (runs?.length ?? 0) === 0 && (
            <p className="p-4 text-sm text-on-surface-variant">
              No comparison runs in this project yet.
            </p>
          )}

          {(runs ?? []).map((run) => {
            const status = statusStyles[run.status] ?? statusStyles.draft;
            const href = comparisonRunHref(run);
            const body = (
              <>
                <div className="flex items-center gap-4">
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded bg-primary-container/10 text-primary">
                    <CompareIcon className="h-5 w-5" />
                  </div>
                  <div>
                    <p className="text-base font-semibold leading-6 text-on-surface">
                      {run.name}
                    </p>
                    <div className="mt-1 flex flex-wrap items-center gap-x-4 gap-y-1">
                      <span className="font-mono text-xs font-medium leading-4 text-on-surface-variant">
                        {run.records}
                      </span>
                      <span className="text-xs text-outline">•</span>
                      <span className="font-mono text-xs font-medium leading-4 text-on-surface-variant">
                        {run.ranAt ?? "Not run yet"}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-3 pl-14 sm:pl-0">
                  <span
                    className={`rounded px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide ${status.className}`}
                  >
                    {status.label}
                  </span>
                  <span
                    className={`font-mono text-xs font-medium ${
                      run.mismatches > 0
                        ? "text-tertiary"
                        : "text-on-surface-variant"
                    }`}
                  >
                    {run.mismatches} mismatches
                  </span>
                </div>
              </>
            );

            return href ? (
              <Link
                key={run.id}
                href={href}
                className="flex flex-col gap-3 p-4 transition-colors hover:bg-surface-container-low sm:flex-row sm:items-center sm:justify-between"
              >
                {body}
              </Link>
            ) : (
              <div
                key={run.id}
                className="flex flex-col gap-3 p-4 sm:flex-row sm:items-center sm:justify-between"
              >
                {body}
              </div>
            );
          })}
        </div>
      </SectionCard>

      <ProjectPickerDialog
        open={pickerOpen}
        onClose={() => setPickerOpen(false)}
        targetHref="/compare/new"
        title="New Comparison — choose project"
        description="Pick the project this comparison belongs to."
      />
    </div>
  );
}
