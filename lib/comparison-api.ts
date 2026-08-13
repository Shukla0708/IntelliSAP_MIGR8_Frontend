import apiClient from "@/lib/axios";
import { trackJob } from "@/lib/job-tracker";
import type { ReconciliationReviewSummary } from "@/data/comparison-results";

export type ComparisonListItem = {
  id: string;
  name: string;
  status: "draft" | "running" | "completed" | "failed";
  ranAt: string | null;
  records: string;
  mismatches: number;
  project_id: string;
  project_name: string;
};

export type ComparisonDetail = {
  id: string;
  project_id: string;
  name: string;
  status: string;
  preload_filename: string | null;
  postload_filename: string | null;
  has_preload_file: boolean;
  has_postload_file: boolean;
  mapping_id: string | null;
  join_keys: string[];
  processed_rows: number;
  total_rows: number;
  error_message: string | null;
  has_result_file: boolean;
};

export type ComparisonUploadResult = {
  preload_headers: string[];
  postload_headers: string[];
  shared_headers: string[];
};

export type ComparisonResultPayload = ReconciliationReviewSummary & {
  status?: string;
  processedRows?: number;
  totalRows?: number;
  errorMessage?: string | null;
  hasResultFile?: boolean;
  extraCount?: number;
};

export async function listComparisons(projectId?: string): Promise<ComparisonListItem[]> {
  const { data } = await apiClient.get<ComparisonListItem[]>(
    projectId ? `/api/comparisons/?project_id=${projectId}` : "/api/comparisons/",
  );
  return data;
}

export async function createComparisonRun(
  projectId: string,
  name: string,
  options?: { mappingId?: string | null; joinKeys?: string[] },
): Promise<string> {
  const { data } = await apiClient.post<{ comparison_id: string }>(
    `/api/comparisons/?project_id=${projectId}`,
    {
      name: name.trim(),
      mapping_id: options?.mappingId || null,
      join_keys: options?.joinKeys ?? [],
    },
  );
  return data.comparison_id;
}

export async function uploadComparisonFiles(
  comparisonId: string,
  preloadFile: File,
  postloadFile: File,
  options?: {
    mappingId?: string | null;
    joinKeys?: string[];
    onProgress?: (ratio: number) => void;
  },
): Promise<ComparisonUploadResult> {
  const formData = new FormData();
  formData.append("preload_file", preloadFile);
  formData.append("postload_file", postloadFile);
  if (options?.mappingId) formData.append("mapping_id", options.mappingId);
  if (options?.joinKeys?.length) {
    formData.append("join_keys", options.joinKeys.join(","));
  }
  const { data } = await apiClient.post<ComparisonUploadResult>(
    `/api/comparisons/${comparisonId}/upload`,
    formData,
    {
      timeout: 0,
      onUploadProgress: (event) => {
        if (options?.onProgress && event.total) {
          options.onProgress(event.loaded / event.total);
        }
      },
    },
  );
  return data;
}

export async function executeComparisonRun(
  comparisonId: string,
  options?: { mappingId?: string | null; joinKeys?: string[] },
): Promise<void> {
  await apiClient.post(`/api/comparisons/${comparisonId}/execute`, {
    mapping_id: options?.mappingId || null,
    join_keys: options?.joinKeys ?? [],
  });
  trackJob({ kind: "comparison", id: comparisonId });
}

export async function fetchComparisonResult(
  comparisonId: string,
): Promise<ComparisonResultPayload> {
  const { data } = await apiClient.get<ComparisonResultPayload>(
    `/api/comparisons/${comparisonId}/result`,
  );
  return data;
}

export async function fetchComparisonDownloadUrl(
  comparisonId: string,
): Promise<string> {
  const { data } = await apiClient.get<{ url: string }>(
    `/api/comparisons/${comparisonId}/download-url`,
  );
  return data.url;
}
