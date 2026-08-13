"use client";

import Link from "next/link";
import { SectionCard } from "@/components/dashboard/kpi-card";
import { AnalyticsIcon } from "@/components/ui/icons";

export function ActivityReportsList() {
  return (
    <div className="mx-auto w-full max-w-[1200px]">
      <div className="mb-8">
        <h2 className="mb-2 text-[32px] font-semibold leading-10 tracking-[-0.01em] text-on-surface">
          All Reports
        </h2>
        <p className="max-w-2xl text-base leading-6 text-on-surface-variant">
          Cross-project reports will appear here once reporting is wired. Until
          then, open a project tool to download run-level result files.
        </p>
      </div>

      <SectionCard className="overflow-hidden">
        <div className="flex flex-col items-start gap-4 p-8 sm:flex-row sm:items-center">
          <div className="flex h-12 w-12 items-center justify-center rounded bg-primary-container/10 text-primary">
            <AnalyticsIcon className="h-6 w-6" />
          </div>
          <div className="flex-1">
            <h3 className="text-xl font-semibold leading-7 text-on-surface">
              Reports coming soon
            </h3>
            <p className="mt-1 text-sm leading-6 text-on-surface-variant">
              Browse recent validation activity while reports are under
              construction.
            </p>
          </div>
          <Link
            href="/activity/validations"
            className="inline-flex h-11 items-center justify-center rounded border border-outline-variant px-4 text-sm font-semibold text-primary transition-colors hover:bg-surface-container-high"
          >
            View validations
          </Link>
        </div>
      </SectionCard>
    </div>
  );
}
