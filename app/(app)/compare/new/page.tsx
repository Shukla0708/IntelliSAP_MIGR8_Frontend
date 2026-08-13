import type { Metadata } from "next";
import { ComparisonSetupView } from "@/components/comparison/comparison-setup-view";
import { AppShell } from "@/components/layout/app-shell";

export const metadata: Metadata = {
  title: "Preload vs Postload Reconciliation | MIGR8 AI",
  description:
    "Upload preload and postload files to begin automated reconciliation.",
};

export default function NewComparisonPage() {
  return (
    <AppShell mainClassName="flex flex-1 flex-col bg-surface-container-low p-0">
      <ComparisonSetupView />
    </AppShell>
  );
}
