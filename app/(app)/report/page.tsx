"use client";

import { AppShell } from "@/components/layout/app-shell";
import { ProjectReportView } from "@/components/reports/project-report-view";
import { useDefaultProject } from "@/lib/use-default-project";

export default function ReportPage() {
  const { project } = useDefaultProject();

  return (
    <AppShell
      topbarTitle="Project Report"
      topbarLeading={
        project ? (
          <div className="flex min-w-0 flex-wrap items-center gap-2">
            <span className="text-xs font-semibold uppercase tracking-[0.02em] leading-4 text-on-surface-variant">
              Migration Project:
            </span>
            <span className="truncate text-xs font-semibold uppercase tracking-[0.02em] leading-4 text-primary">
              {project.name}
            </span>
          </div>
        ) : undefined
      }
    >
      <ProjectReportView />
    </AppShell>
  );
}
