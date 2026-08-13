import Link from "next/link";
import { SectionCard } from "@/components/dashboard/kpi-card";
import { AddIcon, HubIcon } from "@/components/ui/icons";
import type {
  FieldMappingRun,
  FieldMappingRunStatus,
} from "@/data/field-mapping";
import { PREVIOUS_FIELD_MAPPING_RUNS } from "@/data/field-mapping";
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

type FieldMappingRunsListProps = {
  runs?: FieldMappingRun[];
};

export function FieldMappingRunsList({
  runs = PREVIOUS_FIELD_MAPPING_RUNS,
}: FieldMappingRunsListProps) {
  return (
    <div className="mx-auto w-full max-w-[1200px]">
      <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h2 className="mb-2 text-[32px] font-semibold leading-10 tracking-[-0.01em] text-on-surface">
            Field Mapping
          </h2>
          <p className="max-w-2xl text-base leading-6 text-on-surface-variant">
            Review previous field mapping runs for this migration project, or
            start a new mapping.
          </p>
        </div>
        <Link
          href="/field-mapping/new"
          className="inline-flex h-11 shrink-0 items-center justify-center gap-2 self-start rounded border border-transparent bg-primary-container px-4 text-base font-semibold leading-7 text-on-primary shadow-ambient transition-colors hover:bg-primary hover:shadow-md sm:self-auto"
        >
          <AddIcon className="h-4 w-4" />
          New Field Mapping
        </Link>
      </div>

      <SectionCard className="overflow-hidden">
        <div className="border-b border-outline-variant bg-surface-container-lowest p-4">
          <h3 className="text-xl font-semibold leading-7 text-on-surface">
            Previous Field Mapping Runs
          </h3>
        </div>

        <div className="divide-y divide-outline-variant">
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
    </div>
  );
}
