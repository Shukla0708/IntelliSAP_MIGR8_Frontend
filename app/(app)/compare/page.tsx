import type { Metadata } from "next";
import { ComparisonRunsList } from "@/components/comparison/comparison-runs-list";
import { AppShell } from "@/components/layout/app-shell";

export const metadata: Metadata = {
  title: "Comparison | MIGR8 AI",
  description:
    "Review previous postload vs preload comparison runs or start a new comparison for your migration project.",
};

export default function ComparePage() {
  return (
    <AppShell topbarTitle="Comparison">
      <ComparisonRunsList />
    </AppShell>
  );
}
