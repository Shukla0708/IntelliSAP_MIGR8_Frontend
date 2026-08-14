import type { ProjectReport } from "@/data/project-report";
import apiClient from "@/lib/axios";

export async function fetchProjectReport(
  projectId: string,
  _projectName?: string,
): Promise<ProjectReport> {
  const { data } = await apiClient.get<ProjectReport>(
    `/api/projects/${projectId}/report`,
  );
  return data;
}
