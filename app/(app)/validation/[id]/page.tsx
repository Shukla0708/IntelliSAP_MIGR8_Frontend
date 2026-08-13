import type { Metadata } from "next";
import { AppShell } from "@/components/layout/app-shell";
import { AdvancedValidationView } from "@/components/validation/advanced-validation-view";
import { VALIDATION_PROJECT_NAME } from "@/data/validation";

export const metadata: Metadata = {
  title: "Edit Validation Draft | MIGR8 AI",
  description:
    "Resume a saved validation draft, replace the source file, update rules, and run validation.",
};

type EditValidationPageProps = {
  params: Promise<{ id: string }>;
};

export default async function EditValidationPage({ params }: EditValidationPageProps) {
  const { id } = await params;

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
      <AdvancedValidationView editRunId={id} />
    </AppShell>
  );
}
