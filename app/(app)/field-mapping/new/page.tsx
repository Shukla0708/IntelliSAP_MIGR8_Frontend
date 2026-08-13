import type { Metadata } from "next";
import { FieldMappingSetupView } from "@/components/field-mapping/field-mapping-setup-view";
import { AppShell } from "@/components/layout/app-shell";
import { FIELD_MAPPING_TOPBAR_TITLE } from "@/data/field-mapping";

export const metadata: Metadata = {
  title: "AI Field Mapping Setup | MIGR8 AI",
  description:
    "Upload source and target schemas to begin AI-assisted field mapping.",
};

export default function NewFieldMappingPage() {
  return (
    <AppShell
      mainClassName="flex flex-1 flex-col bg-background p-0"
      topbarTitle={FIELD_MAPPING_TOPBAR_TITLE}
    >
      <FieldMappingSetupView />
    </AppShell>
  );
}