import type { Metadata } from "next";
import { FieldMappingRunsList } from "@/components/field-mapping/field-mapping-runs-list";
import { AppShell } from "@/components/layout/app-shell";

export const metadata: Metadata = {
  title: "Field Mapping | MIGR8 AI",
  description:
    "Review previous field mapping runs or start a new mapping for your migration project.",
};

export default function FieldMappingPage() {
  return (
    <AppShell topbarTitle="Field Mapping">
      <FieldMappingRunsList />
    </AppShell>
  );
}
