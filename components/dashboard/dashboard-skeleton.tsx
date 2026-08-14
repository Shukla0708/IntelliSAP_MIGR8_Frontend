import { SectionCard } from "@/components/dashboard/kpi-card";

function Pulse({ className = "" }: { className?: string }) {
  return <div className={`animate-pulse rounded bg-surface-container-high ${className}`} />;
}

type DashboardSkeletonProps = {
  /** Pillar accordion placeholders (report page). */
  showPillars?: boolean;
  /** Recent projects + activity placeholders (dashboard page). */
  showSections?: boolean;
};

export function DashboardSkeleton({
  showPillars = false,
  showSections = false,
}: DashboardSkeletonProps) {
  return (
    <div className="grid grid-cols-1 gap-gutter lg:grid-cols-4">
      <div className="space-y-gutter lg:col-span-3">
        <div className="grid grid-cols-2 gap-gutter md:grid-cols-3">
          {Array.from({ length: 6 }).map((_, index) => (
            <SectionCard key={index} className="p-4">
              <Pulse className="mb-3 h-3 w-20" />
              <Pulse className="h-8 w-24" />
            </SectionCard>
          ))}
        </div>
        {showPillars ? (
          <div className="space-y-gutter">
            {Array.from({ length: 3 }).map((_, index) => (
              <SectionCard key={index} className="p-4">
                <Pulse className="h-5 w-40" />
              </SectionCard>
            ))}
          </div>
        ) : null}
        {showSections ? (
          <div className="space-y-gutter">
            <SectionCard className="p-4">
              <Pulse className="mb-4 h-5 w-36" />
              <Pulse className="h-16 w-full" />
              <Pulse className="mt-3 h-16 w-full" />
            </SectionCard>
            <SectionCard className="p-4">
              <Pulse className="mb-4 h-5 w-32" />
              <Pulse className="h-14 w-full" />
              <Pulse className="mt-3 h-14 w-full" />
            </SectionCard>
          </div>
        ) : null}
      </div>
      <div className="space-y-gutter lg:col-span-1">
        <SectionCard className="p-6">
          <Pulse className="mb-6 h-5 w-36" />
          <div className="mx-auto mb-6 h-28 w-28 rounded-full">
            <Pulse className="h-full w-full rounded-full" />
          </div>
          <div className="space-y-3">
            <Pulse className="h-3 w-full" />
            <Pulse className="h-3 w-full" />
            <Pulse className="h-3 w-full" />
          </div>
        </SectionCard>
        <SectionCard className="p-4">
          <Pulse className="mb-3 h-4 w-32" />
          <Pulse className="h-12 w-full" />
        </SectionCard>
      </div>
    </div>
  );
}
