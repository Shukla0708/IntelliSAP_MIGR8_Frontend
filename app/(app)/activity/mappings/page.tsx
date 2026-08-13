import type { Metadata } from "next";
import { AppShell } from "@/components/layout/app-shell";
import { ActivityMappingsList } from "@/components/activity/activity-mappings-list";

export const metadata: Metadata = {
  title: "All Field Mappings | MIGR8 AI",
  description: "Browse field mapping runs across all of your migration projects.",
};

export default function ActivityMappingsPage() {
  return (
    <AppShell topbarTitle="All Field Mappings">
      <ActivityMappingsList />
    </AppShell>
  );
}
