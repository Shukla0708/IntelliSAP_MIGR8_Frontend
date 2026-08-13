import Link from "next/link";
import { ProgressBar } from "@/components/ui/progress";
import { HubIcon } from "@/components/ui/icons";
import { ReportPillarSection } from "@/components/reports/report-pillar-section";
import type { MappingReportSection } from "@/data/project-report";

type MappingReportSectionProps = {
  mapping: MappingReportSection;
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

export function MappingReportSectionView({ mapping }: MappingReportSectionProps) {
  const mappedFields = mapping.totalFields - mapping.unmappedFields;

  return (
    <ReportPillarSection
      title="Field Mapping"
      icon={HubIcon}
      toolHref="/field-mapping"
      toolLabel="Open Field Mapping"
      preview={mapping.isPreview}
    >
      <div className="mb-4 grid grid-cols-2 gap-3 sm:grid-cols-4">
        <MiniStat label="Total Fields" value={String(mapping.totalFields)} />
        <MiniStat label="Mapped" value={String(mappedFields)} />
        <MiniStat label="Unmapped" value={String(mapping.unmappedFields)} />
        <MiniStat label="Avg AI Confidence" value={`${mapping.avgConfidence}%`} />
      </div>

      <div className="mb-4">
        <div className="mb-1 flex justify-between text-xs font-semibold uppercase tracking-wide">
          <span className="text-on-surface-variant">Mapping approval</span>
          <span className="text-on-surface">{mapping.approvalRate}%</span>
        </div>
        <ProgressBar value={mapping.approvalRate} barClassName="bg-secondary-container" />
      </div>

      <div>
        <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-on-surface-variant">
          Recent runs
        </p>
        <div className="divide-y divide-outline-variant rounded-lg border border-outline-variant">
          {mapping.recentRuns.map((run) => (
            <Link
              key={run.id}
              href={`/field-mapping/${run.id}`}
              className="flex items-center justify-between px-3 py-2 text-sm transition-colors hover:bg-surface-container-low"
            >
              <span className="font-semibold text-on-surface">{run.name}</span>
              <span className="font-mono text-xs text-on-surface-variant">
                {run.unmapped} unmapped
              </span>
            </Link>
          ))}
        </div>
      </div>
    </ReportPillarSection>
  );
}
