import type { Metadata } from "next";
import { AppShell } from "@/components/layout/app-shell";
import { ActivityValidationsList } from "@/components/activity/activity-validations-list";

export const metadata: Metadata = {
  title: "All Validations | MIGR8 AI",
  description:
    "Browse validation runs across all of your migration projects.",
};

export default function ActivityValidationsPage() {
  return (
    <AppShell topbarTitle="All Validations">
      <ActivityValidationsList />
    </AppShell>
  );
}
