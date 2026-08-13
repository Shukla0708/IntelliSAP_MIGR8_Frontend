"use client";

import { useMemo } from "react";
import { useProject } from "@/contexts/project-context";

/**
 * Validation screens use the currently selected project from ProjectProvider
 * (created/selected on /projects). Kept as a thin adapter so existing
 * validation components do not need a large refactor.
 *
 * The returned `project` object is memoized by id/name so consumers can safely
 * depend on it in useEffect without refetch loops.
 */
export function useDefaultProject() {
  const { selectedProject, loading } = useProject();

  const project = useMemo(() => {
    if (!selectedProject) return null;
    return {
      id: selectedProject.id,
      name: selectedProject.name,
      created_at: selectedProject.updated,
    };
  }, [selectedProject?.id, selectedProject?.name, selectedProject?.updated]);

  return { project, loading };
}
