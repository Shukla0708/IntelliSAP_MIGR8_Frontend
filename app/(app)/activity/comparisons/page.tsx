import type { Metadata } from "next";
import { AppShell } from "@/components/layout/app-shell";
import { ActivityComparisonsList } from "@/components/activity/activity-comparisons-list";

export const metadata: Metadata = {
  title: "All Comparisons | MIGR8 AI",
  description: "Browse comparison runs across all of your migration projects.",
};

export default function ActivityComparisonsPage() {
  return (
    <AppShell topbarTitle="All Comparisons">
      <ActivityComparisonsList />
    </AppShell>
  );
}
