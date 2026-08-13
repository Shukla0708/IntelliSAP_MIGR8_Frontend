import type { Metadata } from "next";
import { AppShell } from "@/components/layout/app-shell";
import { ValidationRunsList } from "@/components/validation/validation-runs-list";

export const metadata: Metadata = {
  title: "Validation | MIGR8 AI",
  description:
    "Review previous validation runs or start a new validation for your migration project.",
};

export default function ValidationPage() {
  return (
    <AppShell topbarTitle="Validation">
      <ValidationRunsList />
    </AppShell>
  );
}
