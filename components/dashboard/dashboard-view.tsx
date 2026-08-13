import { KpiGrid } from "@/components/dashboard/kpi-card";
import { MigrationReadiness } from "@/components/dashboard/migration-readiness";
import { RecentProjects } from "@/components/dashboard/recent-projects";
import { KPI_METRICS, RECENT_PROJECTS } from "@/data/dashboard";

export function DashboardHeader() {
  return (
    <div className="mb-8">
      <h2 className="mb-2 text-[40px] font-bold tracking-[-0.02em] text-on-surface sm:text-[48px] sm:leading-[56px]">
        Migration Control Center
      </h2>
      <p className="max-w-3xl text-base leading-6 text-on-surface-variant">
        Monitor data quality, reconciliation and field mapping across your SAP
        migrations.
      </p>
    </div>
  );
}

export function DashboardView() {
  return (
    <>
      <DashboardHeader />

      <div className="mb-8 grid grid-cols-1 gap-gutter lg:grid-cols-4">
        <div className="space-y-gutter lg:col-span-3">
          <KpiGrid metrics={KPI_METRICS} />
          <RecentProjects projects={RECENT_PROJECTS} />
        </div>

        <div className="space-y-gutter">
          <MigrationReadiness />
        </div>
      </div>
    </>
  );
}
