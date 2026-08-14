import type { ComparisonReview } from "@/lib/comparison-api";
import type { ComparisonRunListItem } from "@/lib/comparison-api";
import type { MappingRunListItem } from "@/lib/mapping-api";

export type ReportErrorByType = { label: string; value: number };
export type ReportErrorByField = { field: string; count: number };

export type ReportRecentValidationRun = {
  id: string;
  name: string;
  status: string;
  healthScore: number;
  totalErrors: number;
  totalRecords: number;
  ranAt: string | null;
};

export type ReportValidationSection = {
  totalRuns: number;
  completedRuns: number;
  failedRuns: number;
  inProgressRuns: number;
  totalRecords: number;
  validRows: number;
  invalidRows: number;
  totalErrors: number;
  criticalErrors: number;
  avgHealthScore: number;
  passRate: number;
  errorsByType: ReportErrorByType[];
  errorsByField: ReportErrorByField[];
  recentRuns: ReportRecentValidationRun[];
};

export type ReportReadiness = {
  score: number;
  validation: number;
  comparison: number;
  mapping: number;
};

export type ProjectReportApiResponse = {
  project: { id: string; name: string; created_at: string };
  generatedAt: string;
  readiness: ReportReadiness;
  validation: ReportValidationSection;
};

export type ComparisonReportSection = {
  totalRuns: number;
  completedRuns: number;
  totalMismatches: number;
  avgMatchRate: number;
  matchedRecords: number;
  differentCount: number;
  missingCount: number;
  recentRuns: {
    id: string;
    name: string;
    status: string;
    mismatches: number;
    records: string;
    ranAt: string;
  }[];
};

export type MappingReportSection = {
  totalRuns: number;
  completedRuns: number;
  totalFields: number;
  unmappedFields: number;
  approvalRate: number;
  avgConfidence: number;
  recentRuns: {
    id: string;
    name: string;
    status: string;
    unmapped: number;
    fields: string;
    ranAt: string;
  }[];
};

export type ProjectReport = ProjectReportApiResponse & {
  comparison: ComparisonReportSection;
  mapping: MappingReportSection;
  readiness: ReportReadiness;
};

function parseMatchRate(rate: string): number {
  const match = rate.match(/([\d.]+)/);
  return match ? Number(match[1]) : 0;
}

function formatRanAt(iso: string | null | undefined): string {
  if (!iso) return "Not run yet";
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return "Not run yet";
  const diffMs = Date.now() - date.getTime();
  if (diffMs < 60_000) return "Just now";
  const minutes = Math.floor(diffMs / 60_000);
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  return date.toLocaleDateString();
}

export function buildComparisonReport(
  runs: ComparisonRunListItem[],
  reviews: ComparisonReview[],
): ComparisonReportSection {
  const completed = runs.filter((run) => run.status === "completed");
  const totalMismatches = runs.reduce((sum, run) => sum + run.mismatches, 0);
  const matchRates = reviews.map((review) => parseMatchRate(review.matchRate));
  const avgMatchRate =
    matchRates.length > 0
      ? Math.round(matchRates.reduce((a, b) => a + b, 0) / matchRates.length)
      : 0;

  return {
    totalRuns: runs.length,
    completedRuns: completed.length,
    totalMismatches,
    avgMatchRate,
    matchedRecords: reviews.reduce((sum, review) => sum + review.matchedRecords, 0),
    differentCount: reviews.reduce((sum, review) => sum + review.differentCount, 0),
    missingCount: reviews.reduce((sum, review) => sum + review.missingCount, 0),
    recentRuns: runs.slice(0, 8).map((run) => ({
      id: run.id,
      name: run.name,
      status: run.status,
      mismatches: run.mismatches,
      records: run.records,
      ranAt: formatRanAt(run.ranAt),
    })),
  };
}

export function buildMappingReport(
  runs: MappingRunListItem[],
  confidences: number[],
): MappingReportSection {
  const totalFields = runs.reduce((sum, run) => sum + run.totalSourceFields, 0);
  const confirmedFields = runs.reduce((sum, run) => sum + run.confirmedFieldCount, 0);
  const unmappedFields = Math.max(totalFields - confirmedFields, 0);
  const approvalRate =
    totalFields > 0 ? Math.round((confirmedFields / totalFields) * 100) : 0;
  const avgConfidence =
    confidences.length > 0
      ? Math.round(confidences.reduce((a, b) => a + b, 0) / confidences.length)
      : 0;

  return {
    totalRuns: runs.length,
    completedRuns: runs.filter((run) => run.status === "completed").length,
    totalFields,
    unmappedFields,
    approvalRate,
    avgConfidence,
    recentRuns: runs.slice(0, 8).map((run) => ({
      id: run.mappingRunId,
      name: run.mappingName || "Field mapping run",
      status: run.status,
      unmapped: Math.max(run.totalSourceFields - run.confirmedFieldCount, 0),
      fields: `${run.totalSourceFields} fields`,
      ranAt: formatRanAt(run.createdAt),
    })),
  };
}

export function computeCompositeReadiness(
  validation: number,
  comparison: number,
  mapping: number,
): ReportReadiness {
  const score = Math.round(validation * 0.5 + comparison * 0.25 + mapping * 0.25);
  return {
    score,
    validation,
    comparison,
    mapping,
  };
}
