import type { Metadata } from "next";
import { AppShell } from "@/components/layout/app-shell";
import { ActivityReportsList } from "@/components/activity/activity-reports-list";

export const metadata: Metadata = {
  title: "All Reports | MIGR8 AI",
  description: "Cross-project reports for your SAP migrations.",
};

export default function ActivityReportsPage() {
  return (
    <AppShell topbarTitle="All Reports">
      <ActivityReportsList />
    </AppShell>
  );
}
