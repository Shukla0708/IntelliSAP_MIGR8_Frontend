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
import { useAuth } from "@/contexts/auth-context";
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
const LEGACY_SELECTED_PROJECT_KEY = "migr8_selected_project_id";

function selectedProjectStorageKey(userId: string) {
  return `migr8_selected_project_id_${userId}`;
}

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
  const { user, token, isLoading: authLoading } = useAuth();
  const [projects, setProjects] = useState<MigrationProject[]>([]);
  const [selectedProjectId, setSelectedProjectId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  const refreshProjects = useCallback(async () => {
    if (!user) {
      setProjects([]);
      setSelectedProjectId(null);
      return;
    }

    const { data } = await apiClient.get<ApiProject[]>("/api/projects/");
    const mapped = data.map(mapProject);
    setProjects(mapped);

    const storageKey = selectedProjectStorageKey(user.id);
    setSelectedProjectId((current) => {
      const stored =
        typeof window !== "undefined"
          ? localStorage.getItem(storageKey) ??
            localStorage.getItem(LEGACY_SELECTED_PROJECT_KEY)
          : null;
      const preferred = current ?? stored;
      if (preferred && mapped.some((project) => project.id === preferred)) {
        return preferred;
      }
      return mapped[0]?.id ?? null;
    });
  }, [user]);

  useEffect(() => {
    if (authLoading) return;

    if (!token || !user) {
      setProjects([]);
      setSelectedProjectId(null);
      setLoading(false);
      return;
    }

    let cancelled = false;

    async function load() {
      setLoading(true);
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

    void load();
    return () => {
      cancelled = true;
    };
  }, [authLoading, token, user?.id, refreshProjects]);

  const selectProject = useCallback(
    (projectId: string) => {
      setSelectedProjectId(projectId);
      if (typeof window !== "undefined" && user?.id) {
        localStorage.setItem(selectedProjectStorageKey(user.id), projectId);
      }
    },
    [user?.id],
  );

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
