"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import apiClient, { getApiErrorMessage } from "@/lib/axios";
import type { MigrationProject } from "@/data/projects";

type ApiProject = {
  id: string;
  name: string;
  created_at: string;
};

type ProjectContextValue = {
  projects: MigrationProject[];
  selectedProject: MigrationProject | null;
  loading: boolean;
  selectProject: (projectId: string) => void;
  createProject: (name: string) => Promise<MigrationProject>;
  refreshProjects: () => Promise<void>;
};

const ProjectContext = createContext<ProjectContextValue | null>(null);
const SELECTED_PROJECT_KEY = "migr8_selected_project_id";

function mapProject(project: ApiProject): MigrationProject {
  const created = new Date(project.created_at);
  const updated = Number.isNaN(created.getTime())
    ? "Recently created"
    : `Created ${created.toLocaleString()}`;
  return {
    id: project.id,
    name: project.name,
    updated,
  };
}

type ProjectProviderProps = {
  children: ReactNode;
};

export function ProjectProvider({ children }: ProjectProviderProps) {
  const [projects, setProjects] = useState<MigrationProject[]>([]);
  const [selectedProjectId, setSelectedProjectId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  const refreshProjects = useCallback(async () => {
    const { data } = await apiClient.get<ApiProject[]>("/api/projects/");
    const mapped = data.map(mapProject);
    setProjects(mapped);

    setSelectedProjectId((current) => {
      const stored =
        typeof window !== "undefined"
          ? localStorage.getItem(SELECTED_PROJECT_KEY)
          : null;
      const preferred = current ?? stored;
      if (preferred && mapped.some((project) => project.id === preferred)) {
        return preferred;
      }
      return mapped[0]?.id ?? null;
    });
  }, []);

  useEffect(() => {
    let cancelled = false;

    async function load() {
      try {
        await refreshProjects();
      } catch {
        if (!cancelled) {
          setProjects([]);
          setSelectedProjectId(null);
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    load();
    return () => {
      cancelled = true;
    };
  }, [refreshProjects]);

  const selectProject = useCallback((projectId: string) => {
    setSelectedProjectId(projectId);
    if (typeof window !== "undefined") {
      localStorage.setItem(SELECTED_PROJECT_KEY, projectId);
    }
  }, []);

  const createProject = useCallback(
    async (name: string) => {
      try {
        const { data } = await apiClient.post<ApiProject>("/api/projects/", {
          name: name.trim(),
        });
        const created = mapProject(data);
        await refreshProjects();
        selectProject(created.id);
        return created;
      } catch (error) {
        throw new Error(getApiErrorMessage(error, "Could not create project"));
      }
    },
    [refreshProjects, selectProject],
  );

  const value = useMemo<ProjectContextValue>(() => {
    const selectedProject =
      projects.find((project) => project.id === selectedProjectId) ??
      projects[0] ??
      null;

    return {
      projects,
      selectedProject,
      loading,
      selectProject,
      createProject,
      refreshProjects,
    };
  }, [
    projects,
    selectedProjectId,
    loading,
    selectProject,
    createProject,
    refreshProjects,
  ]);

  return (
    <ProjectContext.Provider value={value}>{children}</ProjectContext.Provider>
  );
}

export function useProject() {
  const context = useContext(ProjectContext);
  if (!context) {
    throw new Error("useProject must be used within a ProjectProvider");
  }
  return context;
}
