"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { SectionCard } from "@/components/dashboard/kpi-card";
import { ProjectPickerDialog } from "@/components/projects/project-picker-dialog";
import { AddIcon, RuleIcon } from "@/components/ui/icons";
import apiClient from "@/lib/axios";
import { useDefaultProject } from "@/lib/use-default-project";
import { validationRunHref } from "@/lib/validation-routes";
import type { ValidationRunStatus } from "@/data/validation";

const statusStyles: Record<ValidationRunStatus, { label: string; className: string }> = {
  draft: { label: "Draft", className: "bg-surface-container-high text-on-surface-variant" },
  rules_configured: {
    label: "Ready",
    className: "bg-secondary-container/10 text-secondary",
  },
  completed: { label: "Completed", className: "bg-success/10 text-success" },
  failed: { label: "Failed", className: "bg-error-container text-error" },
  running: { label: "Running", className: "bg-primary-container/10 text-primary" },
};

type RunListItem = {
  id: string;
  name: string;
  records: string;
  ranAt: string | null;
  status: ValidationRunStatus;
  errors: number;
};

const newButtonClassName =
  "inline-flex h-11 shrink-0 items-center justify-center gap-2 self-start rounded border border-transparent bg-primary-container px-4 text-base font-semibold leading-7 text-on-primary shadow-ambient transition-colors hover:bg-primary hover:shadow-md sm:self-auto";

export function ValidationRunsList() {
  const { project, loading: projectLoading } = useDefaultProject();
  const [runs, setRuns] = useState<RunListItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [pickerOpen, setPickerOpen] = useState(false);

  const projectId = project?.id ?? null;

  useEffect(() => {
    if (!projectId) {
      setRuns([]);
      setLoading(false);
      return;
    }

    let cancelled = false;
    setLoading(true);

    apiClient
      .get<RunListItem[]>(`/api/projects/${projectId}/runs`)
      .then((res) => {
        if (!cancelled) setRuns(res.data);
      })
      .catch(() => {
        if (!cancelled) setRuns([]);
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
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
            Validation
          </h2>
          <p className="max-w-2xl text-base leading-6 text-on-surface-variant">
            {project
              ? `Review previous validation runs for "${project.name}", or start a new validation.`
              : "Select a project to review its validation runs, or browse all validations."}
          </p>
          <p className="mt-2 text-sm">
            <Link
              href="/activity/validations"
              className="font-semibold text-primary hover:underline"
            >
              View all projects&apos; validations
            </Link>
          </p>
        </div>
        {project ? (
          <Link href="/validation/new" className={newButtonClassName}>
            <AddIcon className="h-4 w-4" />
            New Validation
          </Link>
        ) : (
          <button
            type="button"
            onClick={() => setPickerOpen(true)}
            className={newButtonClassName}
          >
            <AddIcon className="h-4 w-4" />
            New Validation
          </button>
        )}
      </div>

      <SectionCard className="overflow-hidden">
        <div className="border-b border-outline-variant bg-surface-container-lowest p-4">
          <h3 className="text-xl font-semibold leading-7 text-on-surface">
            Previous Validation Runs
          </h3>
        </div>

        <div className="divide-y divide-outline-variant">
          {!project && !projectLoading && (
            <p className="p-4 text-sm text-on-surface-variant">
              No project selected.{" "}
              <Link href="/projects" className="font-semibold text-primary hover:underline">
                Choose a project
              </Link>{" "}
              or{" "}
              <button
                type="button"
                onClick={() => setPickerOpen(true)}
                className="font-semibold text-primary hover:underline"
              >
                start a new validation
              </button>
              .
            </p>
          )}

          {(projectLoading || (project && loading)) && (
            <p className="p-4 text-sm text-on-surface-variant">Loading runs...</p>
          )}

          {project && !projectLoading && !loading && runs.length === 0 && (
            <p className="p-4 text-sm text-on-surface-variant">
              No validations in {project.name}.
            </p>
          )}

          {runs.map((run) => {
            const status = statusStyles[run.status] ?? statusStyles.draft;
            return (
              <Link
                key={run.id}
                href={validationRunHref(run)}
                className="flex flex-col gap-3 p-4 transition-colors hover:bg-surface-container-low sm:flex-row sm:items-center sm:justify-between"
              >
                <div className="flex items-center gap-4">
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded bg-primary-container/10 text-primary">
                    <RuleIcon className="h-5 w-5" />
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
                  <span className={`rounded px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide ${status.className}`}>
                    {status.label}
                  </span>
                  <span className={`font-mono text-xs font-medium ${run.errors > 0 ? "text-error" : "text-on-surface-variant"}`}>
                    {run.errors} errors
                  </span>
                </div>
              </Link>
            );
          })}
        </div>
      </SectionCard>

      <ProjectPickerDialog
        open={pickerOpen}
        onClose={() => setPickerOpen(false)}
        targetHref="/validation/new"
        title="New Validation — choose project"
        description="Pick the project this validation run belongs to."
      />
    </div>
  );
}
