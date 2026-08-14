import {
  buildComparisonReport,
  buildMappingReport,
  computeCompositeReadiness,
  type ProjectReport,
  type ProjectReportApiResponse,
} from "@/data/project-report";
import apiClient from "@/lib/axios";
import {
  fetchComparisonReview,
  fetchComparisonRuns,
} from "@/lib/comparison-api";
import { fetchMappingRunResult, fetchMappingRuns } from "@/lib/mapping-api";

async function fetchComparisonReviewsForRuns(
  runs: Awaited<ReturnType<typeof fetchComparisonRuns>>,
) {
  const completed = runs.filter((run) => run.status === "completed").slice(0, 10);
  const reviews = await Promise.all(
    completed.map(async (run) => {
      try {
        return await fetchComparisonReview(run.id);
      } catch {
        return null;
      }
    }),
  );
  return reviews.filter((review) => review != null);
}

async function fetchMappingConfidences(
  runs: Awaited<ReturnType<typeof fetchMappingRuns>>,
): Promise<number[]> {
  const candidates = runs
    .filter((run) => run.totalSourceFields > 0)
    .slice(0, 5);
  const results = await Promise.all(
    candidates.map(async (run) => {
      try {
        return await fetchMappingRunResult(run.mappingRunId);
      } catch {
        return null;
      }
    }),
  );

  const confidences: number[] = [];
  for (const result of results) {
    if (!result) continue;
    for (const row of result.rows) {
      const target =
        row.confirmedTargetField ?? row.prospects[0]?.targetField ?? null;
      const prospect = row.prospects.find((p) => p.targetField === target);
      if (prospect?.confidence != null) {
        confidences.push(Math.round(prospect.confidence));
      }
    }
  }
  return confidences;
}

export async function fetchProjectReport(
  projectId: string,
  _projectName: string,
): Promise<ProjectReport> {
  const [{ data }, comparisons, mappings] = await Promise.all([
    apiClient.get<ProjectReportApiResponse>(`/api/projects/${projectId}/report`),
    fetchComparisonRuns({ projectId, limit: 50 }),
    fetchMappingRuns({ projectId, limit: 50 }),
  ]);

  const [comparisonReviews, mappingConfidences] = await Promise.all([
    fetchComparisonReviewsForRuns(comparisons),
    fetchMappingConfidences(mappings),
  ]);

  const comparison = buildComparisonReport(comparisons, comparisonReviews);
  const mapping = buildMappingReport(mappings, mappingConfidences);

  const validationScore = data.validation.avgHealthScore;
  const comparisonScore = comparison.avgMatchRate;
  const mappingScore = mapping.approvalRate;
  const readiness = computeCompositeReadiness(
    validationScore,
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
