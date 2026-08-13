"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { SectionCard } from "@/components/dashboard/kpi-card";
import { ProjectPickerDialog } from "@/components/projects/project-picker-dialog";
import { AddIcon, HubIcon } from "@/components/ui/icons";
import apiClient from "@/lib/axios";
import { useDefaultProject } from "@/lib/use-default-project";
import type { FieldMappingRunStatus } from "@/data/field-mapping";

const statusStyles: Record<
  FieldMappingRunStatus,
  { label: string; className: string }
> = {
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

type MappingRunApiItem = {
  mappingRunId: string;
  mappingName: string | null;
  status: string;
  sourceFilename: string | null;
  targetFilename: string | null;
  totalSourceFields: number;
  mappedFields: number;
  createdAt: string | null;
};

type RunListItem = {
  id: string;
  name: string;
  status: FieldMappingRunStatus;
  fields: string;
  unmapped: number;
  ranAt: string;
};

function toRunStatus(status: string): FieldMappingRunStatus {
  if (status === "completed" || status === "failed") return status;
  return "running";
}

function mapRun(run: MappingRunApiItem): RunListItem {
  const created = run.createdAt ? new Date(run.createdAt) : null;

  return {
    id: run.mappingRunId,
    name: run.mappingName || "New field mapping run",
    status: toRunStatus(run.status),
    fields: `${run.totalSourceFields} fields`,
    unmapped: Math.max(run.totalSourceFields - run.mappedFields, 0),
    ranAt:
      created && !Number.isNaN(created.getTime())
        ? created.toLocaleString()
        : "Not run yet",
  };
}

export function FieldMappingRunsList() {
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
      .get<MappingRunApiItem[]>(`/api/mappings/?project_id=${projectId}`)
      .then((res) => {
        if (!cancelled) setRuns(res.data.map(mapRun));
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
            Field Mapping
          </h2>
          <p className="max-w-2xl text-base leading-6 text-on-surface-variant">
            {project
              ? `Review previous field mapping runs for "${project.name}", or start a new mapping.`
              : "Select a project to review its field mapping runs, or browse all mappings."}
          </p>
          <p className="mt-2 text-sm">
            <Link
              href="/activity/mappings"
              className="font-semibold text-primary hover:underline"
            >
              View all projects&apos; field mappings
            </Link>
          </p>
        </div>
        <button
          type="button"
          onClick={() => setPickerOpen(true)}
          className="inline-flex h-11 shrink-0 items-center justify-center gap-2 self-start rounded border border-transparent bg-primary-container px-4 text-base font-semibold leading-7 text-on-primary shadow-ambient transition-colors hover:bg-primary hover:shadow-md sm:self-auto"
        >
          <AddIcon className="h-4 w-4" />
          New Field Mapping
        </button>
      </div>

      <SectionCard className="overflow-hidden">
        <div className="border-b border-outline-variant bg-surface-container-lowest p-4">
          <h3 className="text-xl font-semibold leading-7 text-on-surface">
            Previous Field Mapping Runs
          </h3>
        </div>

        <div className="divide-y divide-outline-variant">
          {!project && !projectLoading && (
            <p className="p-4 text-sm text-on-surface-variant">
              No project selected.{" "}
              <Link
                href="/projects"
                className="font-semibold text-primary hover:underline"
              >
                Choose a project
              </Link>{" "}
              or{" "}
              <button
                type="button"
                onClick={() => setPickerOpen(true)}
                className="font-semibold text-primary hover:underline"
              >
                start a new mapping
              </button>
              .
            </p>
          )}

          {(projectLoading || (project && loading)) && (
            <p className="p-4 text-sm text-on-surface-variant">
              Loading mapping runs...
            </p>
          )}

          {project && !projectLoading && !loading && runs.length === 0 && (
            <p className="p-4 text-sm text-on-surface-variant">
              No field mappings in {project.name}.
            </p>
          )}

          {runs.map((run) => {
            const status = statusStyles[run.status];

            return (
              <Link
                key={run.id}
                href={`/field-mapping/${run.id}`}
                className="flex flex-col gap-3 p-4 transition-colors hover:bg-surface-container-low sm:flex-row sm:items-center sm:justify-between"
              >
                <div className="flex items-center gap-4">
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded bg-primary-container/10 text-primary">
                    <HubIcon className="h-5 w-5" />
                  </div>
                  <div>
                    <p className="text-base font-semibold leading-6 text-on-surface">
                      {run.name}
                    </p>
                    <div className="mt-1 flex flex-wrap items-center gap-x-4 gap-y-1">
                      <span className="font-mono text-xs font-medium leading-4 text-on-surface-variant">
                        {run.fields}
                      </span>
                      <span className="text-xs text-outline">•</span>
                      <span className="font-mono text-xs font-medium leading-4 text-on-surface-variant">
                        {run.ranAt}
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
                      run.unmapped > 0
                        ? "text-tertiary"
                        : "text-on-surface-variant"
                    }`}
                  >
                    {run.unmapped} unmapped
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
        targetHref="/field-mapping/new"
        title="New Field Mapping — choose project"
        description="Pick the project this mapping belongs to."
      />
    </div>
  );
}
