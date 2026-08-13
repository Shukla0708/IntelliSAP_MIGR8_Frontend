import {
  aggregateComparisonForProject,
  aggregateMappingForProject,
  computeCompositeReadiness,
  type ProjectReport,
  type ProjectReportApiResponse,
} from "@/data/project-report";
import apiClient from "@/lib/axios";

export async function fetchProjectReport(
  projectId: string,
  projectName: string,
): Promise<ProjectReport> {
  const { data } = await apiClient.get<ProjectReportApiResponse>(
    `/api/projects/${projectId}/report`,
  );

  const comparison = aggregateComparisonForProject(projectId, projectName);
  const mapping = aggregateMappingForProject(projectId, projectName);

  const comparisonScore = comparison.avgMatchRate;
  const mappingScore = mapping.approvalRate;
  const readiness = computeCompositeReadiness(
    data.readiness.validation,
    comparisonScore,
    mappingScore,
  );

  return {
    ...data,
    readiness,
    comparison,
    mapping,
  };
}
