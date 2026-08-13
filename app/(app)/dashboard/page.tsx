import type { Metadata } from "next";
import { DashboardView } from "@/components/dashboard/dashboard-view";
import { AppShell } from "@/components/layout/app-shell";

export const metadata: Metadata = {
  title: "Migration Control Center | MIGR8 AI",
  description:
    "Monitor data quality, reconciliation and field mapping across your SAP migrations.",
};

export default function DashboardPage() {
  return (
    <AppShell>
      <DashboardView />
    </AppShell>
  );
}
