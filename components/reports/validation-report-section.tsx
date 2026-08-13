import Link from "next/link";
import { ProgressBar } from "@/components/ui/progress";
import { RuleIcon } from "@/components/ui/icons";
import { ReportPillarSection } from "@/components/reports/report-pillar-section";
import type { ReportValidationSection } from "@/data/project-report";

type ValidationReportSectionProps = {
  validation: ReportValidationSection;
};

function MiniStat({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-lg border border-outline-variant bg-surface-container-lowest p-3">
      <p className="text-[10px] font-bold uppercase tracking-wide text-on-surface-variant">
        {label}
      </p>
      <p className="mt-1 text-lg font-semibold text-on-surface">{value}</p>
    </div>
  );
}

export function ValidationReportSection({ validation }: ValidationReportSectionProps) {
  const topErrors = validation.errorsByType.slice(0, 3);
  const maxError = topErrors[0]?.value ?? 1;

  return (
    <ReportPillarSection
      title="Validation"
      icon={RuleIcon}
      toolHref="/validation"
      toolLabel="Open Validation"
    >
      <div className="mb-4 grid grid-cols-2 gap-3 sm:grid-cols-4">
        <MiniStat
          label="Completed / Total"
          value={`${validation.completedRuns} / ${validation.totalRuns}`}
        />
        <MiniStat label="Avg Health" value={`${validation.avgHealthScore}%`} />
        <MiniStat label="Pass Rate" value={`${validation.passRate}%`} />
        <MiniStat label="Critical Errors" value={String(validation.criticalErrors)} />
      </div>

      {topErrors.length > 0 ? (
        <div className="mb-4">
          <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-on-surface-variant">
            Top error types
          </p>
          <div className="space-y-2">
            {topErrors.map((item) => (
              <div key={item.label}>
                <div className="mb-1 flex justify-between text-xs">
                  <span className="text-on-surface-variant">{item.label}</span>
                  <span className="font-mono text-on-surface">{item.value}</span>
                </div>
                <ProgressBar
                  value={Math.round((item.value / maxError) * 100)}
                  barClassName="bg-primary"
                />
              </div>
            ))}
          </div>
        </div>
      ) : null}

      <div>
        <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-on-surface-variant">
          Recent runs
        </p>
        {validation.recentRuns.length === 0 ? (
          <p className="text-sm text-on-surface-variant">No validation runs yet.</p>
        ) : (
          <div className="divide-y divide-outline-variant rounded-lg border border-outline-variant">
            {validation.recentRuns.slice(0, 5).map((run) => (
              <Link
                key={run.id}
                href={`/validation_result/${run.id}`}
                className="flex items-center justify-between px-3 py-2 text-sm transition-colors hover:bg-surface-container-low"
              >
                <span className="font-semibold text-on-surface">{run.name}</span>
                <span className="font-mono text-xs text-on-surface-variant">
                  {run.healthScore}% · {run.totalErrors} errors
                </span>
              </Link>
            ))}
          </div>
        )}
      </div>
    </ReportPillarSection>
  );
}
