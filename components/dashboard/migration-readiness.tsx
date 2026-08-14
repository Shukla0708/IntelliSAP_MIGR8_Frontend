import { CircularProgress, ProgressBar } from "@/components/ui/progress";
import { SectionCard } from "@/components/dashboard/kpi-card";
import type { ReadinessBreakdownItem } from "@/data/dashboard";

const EMPTY_BREAKDOWN: ReadinessBreakdownItem[] = [
  { label: "Validation", value: 0, barClassName: "bg-primary" },
  { label: "Comparison", value: 0, barClassName: "bg-primary" },
  { label: "Mapping", value: 0, barClassName: "bg-secondary-container" },
];

type MigrationReadinessProps = {
  score?: number;
  breakdown?: ReadinessBreakdownItem[];
  compact?: boolean;
};

export function MigrationReadiness({
  score = 0,
  breakdown = EMPTY_BREAKDOWN,
  compact = false,
}: MigrationReadinessProps) {
  return (
    <SectionCard
      className={`flex flex-col items-center shadow-ambient ${
        compact ? "p-4 text-center" : "p-6 text-center"
      }`}
    >
      <h3
        className={`w-full text-left font-semibold text-on-surface ${
          compact ? "mb-4 text-base leading-6" : "mb-8 text-xl leading-7"
        }`}
      >
        Migration Readiness
      </h3>

      <div className={compact ? "mb-4" : "mb-8"}>
        <CircularProgress value={score} size={compact ? 112 : undefined}>
          <span
            className={`font-black tracking-[-0.02em] text-primary ${
              compact
                ? "text-[36px] leading-[40px]"
                : "text-[48px] leading-[56px]"
            }`}
          >
            {score}
            <span className={compact ? "text-xl" : "text-2xl"}>%</span>
          </span>
          <span className="mt-1 text-[10px] font-semibold tracking-widest uppercase leading-4 text-on-surface-variant">
            Ready
          </span>
        </CircularProgress>
      </div>

      <div className={`w-full ${compact ? "space-y-3" : "space-y-4"}`}>
        {breakdown.map((item) => (
          <div key={item.label}>
            <div className="mb-1 flex justify-between text-xs font-semibold uppercase tracking-[0.02em] leading-4">
              <span className="text-on-surface-variant">{item.label}</span>
              <span className="text-on-surface">{item.value}%</span>
            </div>
            <ProgressBar value={item.value} barClassName={item.barClassName} />
          </div>
        ))}
      </div>
    </SectionCard>
  );
}
