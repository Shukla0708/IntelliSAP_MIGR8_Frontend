"use client";

import { useProject } from "@/contexts/project-context";

/**
 * Validation screens use the currently selected project from ProjectProvider
 * (created/selected on /projects). Kept as a thin adapter so existing
 * validation components do not need a large refactor.
 */
export function useDefaultProject() {
  const { selectedProject, loading } = useProject();

  return {
    project: selectedProject
      ? {
          id: selectedProject.id,
          name: selectedProject.name,
          created_at: selectedProject.updated,
        }
      : null,
    loading,
  };
}
