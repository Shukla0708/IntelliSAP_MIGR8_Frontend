"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { SectionCard } from "@/components/dashboard/kpi-card";
import { ProjectPickerDialog } from "@/components/projects/project-picker-dialog";
import { AddIcon, HubIcon, SearchIcon } from "@/components/ui/icons";
import { useProject } from "@/contexts/project-context";
import {
  FIELD_MAPPING_STATUS_STYLES,
  toFieldMappingRunStatus,
} from "@/data/field-mapping";
import { fetchMappingRuns, type MappingRunListItem } from "@/lib/mapping-api";

/** Compatibility stub for stale Next.js compiles of the dashboard. */
export const ACTIVITY_MAPPING_RUNS: MappingRunListItem[] = [];

export function ActivityMappingsList() {
  const { projects } = useProject();
  const [runs, setRuns] = useState<MappingRunListItem[] | null>(null);
  const [projectFilter, setProjectFilter] = useState("all");
  const [search, setSearch] = useState("");
  const [pickerOpen, setPickerOpen] = useState(false);

  const loading = runs === null;

  useEffect(() => {
    let cancelled = false;

    fetchMappingRuns({
      projectId: projectFilter !== "all" ? projectFilter : undefined,
      limit: 100,
    })
      .then((data) => {
        if (!cancelled) setRuns(data);
      })
      .catch(() => {
        if (!cancelled) setRuns([]);
      });

    return () => {
      cancelled = true;
    };
  }, [projectFilter]);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return runs ?? [];
    return (runs ?? []).filter((run) => {
      const name = (run.mappingName ?? "").toLowerCase();
      return name.includes(q) || run.projectName.toLowerCase().includes(q);
    });
  }, [runs, search]);

  return (
    <div className="mx-auto w-full max-w-[1200px]">
      <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h2 className="mb-2 text-[32px] font-semibold leading-10 tracking-[-0.01em] text-on-surface">
            All Field Mappings
          </h2>
          <p className="max-w-2xl text-base leading-6 text-on-surface-variant">
            Browse field mapping runs across your projects.
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

      <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center">
        <label className="relative min-w-0 flex-1">
          <span className="sr-only">Search mappings</span>
          <SearchIcon className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-on-surface-variant" />
          <input
            type="search"
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            placeholder="Search by run or project name"
            className="h-11 w-full rounded border border-outline-variant bg-surface-container-lowest pl-10 pr-3 text-sm text-on-surface outline-none focus:border-primary focus:ring-1 focus:ring-primary"
          />
        </label>
        <label className="shrink-0">
          <span className="sr-only">Filter by project</span>
          <select
            value={projectFilter}
            onChange={(event) => setProjectFilter(event.target.value)}
            className="h-11 w-full rounded border border-outline-variant bg-surface-container-lowest px-3 text-sm font-semibold text-on-surface outline-none focus:border-primary focus:ring-1 focus:ring-primary sm:min-w-[220px]"
          >
            <option value="all">All projects</option>
            {projects.map((project) => (
              <option key={project.id} value={project.id}>
                {project.name}
              </option>
            ))}
          </select>
        </label>
      </div>

      <SectionCard className="overflow-hidden">
        <div className="border-b border-outline-variant bg-surface-container-lowest p-4">
          <h3 className="text-xl font-semibold leading-7 text-on-surface">
            Field mapping runs
          </h3>
        </div>
        <div className="divide-y divide-outline-variant">
          {loading && (
            <p className="p-4 text-sm text-on-surface-variant">Loading runs…</p>
          )}

          {!loading && filtered.length === 0 && (
            <p className="p-4 text-sm text-on-surface-variant">
              No field mappings yet across your projects.
            </p>
          )}

          {filtered.map((run) => {
            const status = FIELD_MAPPING_STATUS_STYLES[toFieldMappingRunStatus(run.status)];
            const unmapped = Math.max(run.totalSourceFields - run.mappedFields, 0);
            const created = run.createdAt ? new Date(run.createdAt) : null;
            const ranAt =
              created && !Number.isNaN(created.getTime())
                ? created.toLocaleString()
                : "Not run yet";

            return (
              <Link
                key={run.mappingRunId}
                href={`/field-mapping/${run.mappingRunId}`}
                className="flex flex-col gap-3 p-4 transition-colors hover:bg-surface-container-low sm:flex-row sm:items-center sm:justify-between"
              >
                <div className="flex items-center gap-4">
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded bg-primary-container/10 text-primary">
                    <HubIcon className="h-5 w-5" />
                  </div>
                  <div>
                    <p className="text-base font-semibold leading-6 text-on-surface">
                      {run.mappingName || "New field mapping run"}
                    </p>
                    <div className="mt-1 flex flex-wrap items-center gap-x-4 gap-y-1">
                      <span className="rounded bg-surface-container-high px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide text-on-surface-variant">
                        {run.projectName}
                      </span>
                      <span className="font-mono text-xs font-medium leading-4 text-on-surface-variant">
                        {run.totalSourceFields} fields
                      </span>
                      <span className="text-xs text-outline">•</span>
                      <span className="font-mono text-xs font-medium leading-4 text-on-surface-variant">
                        {ranAt}
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
                      unmapped > 0 ? "text-tertiary" : "text-on-surface-variant"
                    }`}
                  >
                    {unmapped} unmapped
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
