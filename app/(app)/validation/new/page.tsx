import type { Metadata } from "next";
import { AppShell } from "@/components/layout/app-shell";
import { AdvancedValidationView } from "@/components/validation/advanced-validation-view";
import { VALIDATION_PROJECT_NAME } from "@/data/validation";

export const metadata: Metadata = {
  title: "Data Validation Rules | MIGR8 AI",
  description:
    "Name a validation run, configure validation logic, and upload source records to begin validation.",
};

export default function NewValidationPage() {
  return (
    <AppShell
      mainClassName="flex flex-1 flex-col bg-background p-0"
      topbarLeading={
        <div className="flex min-w-0 flex-wrap items-center gap-2">
          <span className="text-xs font-semibold uppercase tracking-[0.02em] leading-4 text-on-surface-variant">
            Migration Project:
          </span>
          <span className="truncate text-xs font-semibold uppercase tracking-[0.02em] leading-4 text-primary">
            {VALIDATION_PROJECT_NAME}
          </span>
        </div>
      }
    >
      <AdvancedValidationView />
    </AppShell>
  );
}
