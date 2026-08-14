import Link from "next/link";
import type { ComponentType } from "react";
import {
  CheckCircleIcon,
  CompareIcon,
  DifferenceIcon,
  WarningIcon,
} from "@/components/ui/icons";
import { ReportPillarSection } from "@/components/reports/report-pillar-section";
import type { ComparisonReportSection } from "@/data/project-report";

type ComparisonReportSectionProps = {
  comparison: ComparisonReportSection;
};

function SummaryCard({
  label,
  value,
  hint,
  icon: Icon,
  accent,
}: {
  label: string;
  value: string;
  hint: string;
  icon: ComponentType<{ className?: string }>;
  accent?: "tertiary" | "error";
}) {
  return (
    <div className="relative overflow-hidden rounded-xl border border-outline-variant bg-surface p-3 shadow-sm">
      {accent ? (
        <div
          className={`absolute top-0 bottom-0 left-0 w-1 ${
            accent === "error" ? "bg-error" : "bg-tertiary-container"
          }`}
        />
      ) : null}
      <div className={accent ? "pl-2" : ""}>
        <div className="mb-2 flex items-start justify-between">
          <span className="text-[10px] font-semibold uppercase tracking-wide text-on-surface-variant">
            {label}
          </span>
          <Icon className="h-4 w-4 text-primary" />
        </div>
        <div className="text-xl font-semibold text-on-surface">{value}</div>
        <div className="mt-0.5 text-xs text-on-surface-variant">{hint}</div>
      </div>
    </div>
  );
}

export function ComparisonReportSectionView({
  comparison,
}: ComparisonReportSectionProps) {
  return (
    <ReportPillarSection
      title="Comparison"
      icon={CompareIcon}
      toolHref="/compare"
      toolLabel="Open Comparison"
    >
      <div className="mb-4 grid grid-cols-1 gap-3 sm:grid-cols-3">
        <SummaryCard
          label="Matched"
          value={comparison.matchedRecords.toLocaleString()}
          hint={`${comparison.avgMatchRate}% avg match rate`}
          icon={CheckCircleIcon}
        />
        <SummaryCard
          label="Different"
          value={String(comparison.differentCount)}
          hint={`${comparison.totalMismatches} total mismatches`}
          icon={DifferenceIcon}
          accent="tertiary"
        />
        <SummaryCard
          label="Missing"
          value={String(comparison.missingCount)}
          hint="Dropped during load"
          icon={WarningIcon}
          accent="error"
        />
      </div>

      <div>
        <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-on-surface-variant">
          Recent runs
        </p>
        <div className="divide-y divide-outline-variant rounded-lg border border-outline-variant">
          {comparison.recentRuns.length === 0 ? (
            <p className="px-3 py-4 text-sm text-on-surface-variant">
              No comparison runs yet for this project.
            </p>
          ) : (
            comparison.recentRuns.map((run) => (
            <Link
              key={run.id}
              href={`/compare/${run.id}`}
              className="flex items-center justify-between px-3 py-2 text-sm transition-colors hover:bg-surface-container-low"
            >
              <span className="font-semibold text-on-surface">{run.name}</span>
              <span className="font-mono text-xs text-tertiary">
                {run.mismatches} mismatches
              </span>
            </Link>
            ))
          )}
        </div>
      </div>
    </ReportPillarSection>
  );
}
