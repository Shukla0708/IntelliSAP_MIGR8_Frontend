import type { Metadata } from "next";
import { ComparisonSetupView } from "@/components/comparison/comparison-setup-view";
import { AppShell } from "@/components/layout/app-shell";
import { COMPARISON_PROJECT_NAME } from "@/data/comparison";

export const metadata: Metadata = {
  title: "Preload vs Postload Reconciliation | MIGR8 AI",
  description:
    "Upload preload and postload files to begin automated reconciliation.",
};

export default function NewComparisonPage() {
  return (
    <AppShell
      mainClassName="flex flex-1 flex-col bg-surface-container-low p-0"
      topbarLeading={
        <div className="flex min-w-0 flex-wrap items-center gap-2">
          <span className="truncate text-xs font-semibold uppercase tracking-[0.02em] leading-4 text-primary">
            {COMPARISON_PROJECT_NAME}
          </span>
        </div>
      }
    >
      <ComparisonSetupView />
    </AppShell>
  );
}
