import { CircularProgress, ProgressBar } from "@/components/ui/progress";
import { SectionCard } from "@/components/dashboard/kpi-card";
import { READINESS } from "@/data/dashboard";

type MigrationReadinessProps = {
  score?: number;
  breakdown?: typeof READINESS.breakdown;
};

export function MigrationReadiness({
  score = READINESS.score,
  breakdown = READINESS.breakdown,
}: MigrationReadinessProps) {
  return (
    <SectionCard className="flex flex-col items-center p-6 text-center">
      <h3 className="mb-8 w-full text-left text-xl font-semibold leading-7 text-on-surface">
        Migration Readiness
      </h3>

      <div className="mb-8">
        <CircularProgress value={score}>
          <span className="text-[48px] font-black leading-[56px] tracking-[-0.02em] text-primary">
            {score}
            <span className="text-2xl">%</span>
          </span>
          <span className="mt-1 text-xs font-semibold tracking-widest uppercase leading-4 text-on-surface-variant">
            Ready
          </span>
        </CircularProgress>
      </div>

      <div className="w-full space-y-4">
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
