import type { Metadata } from "next";
import { AppShell } from "@/components/layout/app-shell";
import { ProjectsView } from "@/components/projects/projects-view";

export const metadata: Metadata = {
  title: "Projects | MIGR8 AI",
  description: "Select or create a migration project.",
};

export default function ProjectsPage() {
  return (
    <AppShell>
      <ProjectsView />
    </AppShell>
  );
}
