import type { ComparisonRunStatus } from "@/data/comparison";
import type { ReconciliationReviewSummary } from "@/data/comparison-results";
import apiClient from "@/lib/axios";
import { trackJob } from "@/lib/job-tracker";

export type ComparisonRunListItem = {
  id: string;
  name: string;
  status: ComparisonRunStatus;
  ranAt: string | null;
  records: string;
  mismatches: number;
  projectId: string;
  projectName: string;
};

export type MappingOption = {
  id: string;
  name: string;
  status: string;
  confirmedFieldCount: number;
  keyFieldCount: number;
};

type MappingRunListItem = {
  mappingRunId: string;
  mappingName: string | null;
  status: string;
  confirmedFieldCount: number;
  keyFieldCount: number;
};

export type ComparisonReview = ReconciliationReviewSummary & {
  status: ComparisonRunStatus;
};

export async function fetchComparisonRuns(options?: {
  projectId?: string;
  limit?: number;
}): Promise<ComparisonRunListItem[]> {
  const params: Record<string, string | number> = { limit: options?.limit ?? 50 };
  if (options?.projectId) params.project_id = options.projectId;

  const { data } = await apiClient.get<ComparisonRunListItem[]>("/api/comparisons/", {
    params,
  });
  return data;
}

/** Confirmed mappings in a project that can drive a comparison. */
export async function fetchMappingOptions(projectId: string): Promise<MappingOption[]> {
  const { data } = await apiClient.get<MappingRunListItem[]>("/api/mappings/", {
    params: { project_id: projectId },
  });
  return data
    .filter((mapping) => mapping.status === "completed" && mapping.confirmedFieldCount > 0)
    .map((mapping) => ({
      id: mapping.mappingRunId,
      name: mapping.mappingName ?? "Field mapping run",
      status: mapping.status,
      confirmedFieldCount: mapping.confirmedFieldCount,
      keyFieldCount: mapping.keyFieldCount,
    }));
}

export async function createComparisonRun(
  projectId: string,
  name: string,
): Promise<string> {
  const { data } = await apiClient.post<{ run_id: string }>(
    `/api/comparisons/?project_id=${projectId}`,
    { name: name.trim() },
  );
  return data.run_id;
}

export async function uploadComparisonFiles(
  runId: string,
  preloadFile: File,
  postloadFile: File,
): Promise<{ preload_fields: string[]; postload_fields: string[] }> {
  const formData = new FormData();
  formData.append("preload_file", preloadFile);
  formData.append("postload_file", postloadFile);

  const { data } = await apiClient.post<{
    preload_fields: string[];
    postload_fields: string[];
  }>(`/api/comparisons/${runId}/upload`, formData, { timeout: 0 });
  return data;
}

export async function executeComparisonRun(
  runId: string,
  mappingId?: string | null,
): Promise<void> {
  await apiClient.post(
    `/api/comparisons/${runId}/execute`,
    { mapping_id: mappingId ?? null },
  );
  trackJob({ kind: "comparison", id: runId });
}

export async function fetchComparisonReview(runId: string): Promise<ComparisonReview> {
  const { data } = await apiClient.get<ComparisonReview>(
    `/api/comparisons/${runId}/result`,
  );
  return data;
}

export async function fetchComparisonDownloadUrl(runId: string): Promise<string> {
  const { data } = await apiClient.get<{ url: string }>(
    `/api/comparisons/${runId}/download-url`,
  );
  return data.url;
}

export async function runComparison(input: {
  projectId: string;
  name: string;
  preloadFile: File;
  postloadFile: File;
  mappingId?: string | null;
}): Promise<string> {
  const runId = await createComparisonRun(input.projectId, input.name);
  await uploadComparisonFiles(runId, input.preloadFile, input.postloadFile);
  await executeComparisonRun(runId, input.mappingId);
  return runId;
}
