import { PREVIOUS_COMPARISON_RUNS } from "@/data/comparison";
import { RECONCILIATION_REVIEWS_BY_ID } from "@/data/comparison-results";
import { PREVIOUS_FIELD_MAPPING_RUNS } from "@/data/field-mapping";
import { FIELD_MAPPING_WORKSPACES } from "@/data/field-mapping-workspace";

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
  isPreview: true;
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
  isPreview: true;
};

export type ProjectReport = ProjectReportApiResponse & {
  comparison: ComparisonReportSection;
  mapping: MappingReportSection;
  readiness: ReportReadiness;
};

function parseFieldsCount(fields: string): number {
  const match = fields.match(/(\d+)/);
  return match ? Number(match[1]) : 0;
}

function parseMatchRate(rate: string): number {
  const match = rate.match(/([\d.]+)/);
  return match ? Number(match[1]) : 0;
}

/** Mock comparison aggregates — uses all mock runs when project has no name match */
export function aggregateComparisonForProject(
  _projectId: string,
  _projectName: string,
): ComparisonReportSection {
  const runs = PREVIOUS_COMPARISON_RUNS;
  const reviews = runs
    .map((run) => RECONCILIATION_REVIEWS_BY_ID[run.id])
    .filter(Boolean);

  const totalMismatches = runs.reduce((sum, r) => sum + r.mismatches, 0);
  const matchRates = reviews.map((r) => parseMatchRate(r.matchRate));
  const avgMatchRate =
    matchRates.length > 0
      ? Math.round(matchRates.reduce((a, b) => a + b, 0) / matchRates.length)
      : 0;

  return {
    totalRuns: runs.length,
    completedRuns: runs.filter((r) => r.status === "completed").length,
    totalMismatches,
    avgMatchRate,
    matchedRecords: reviews.reduce((sum, r) => sum + r.matchedRecords, 0),
    differentCount: reviews.reduce((sum, r) => sum + r.differentCount, 0),
    missingCount: reviews.reduce((sum, r) => sum + r.missingCount, 0),
    recentRuns: runs.map((r) => ({
      id: r.id,
      name: r.name,
      status: r.status,
      mismatches: r.mismatches,
      records: r.records,
      ranAt: r.ranAt,
    })),
    isPreview: true,
  };
}

/** Mock mapping aggregates */
export function aggregateMappingForProject(
  _projectId: string,
  _projectName: string,
): MappingReportSection {
  const runs = PREVIOUS_FIELD_MAPPING_RUNS;
  const totalFields = runs.reduce((sum, r) => sum + parseFieldsCount(r.fields), 0);
  const unmappedFields = runs.reduce((sum, r) => sum + r.unmapped, 0);
  const approvalRate =
    totalFields > 0
      ? Math.round(((totalFields - unmappedFields) / totalFields) * 100)
      : 0;

  const confidences: number[] = [];
  for (const run of runs) {
    const workspace = FIELD_MAPPING_WORKSPACES[run.id];
    if (!workspace) continue;
    for (const row of workspace.rows) {
      const prospect = row.prospects.find((p) => p.id === row.selectedProspectId);
      if (prospect) confidences.push(prospect.confidence);
      else if (row.aiReview) confidences.push(row.aiReview.confidence);
    }
  }
  const avgConfidence =
    confidences.length > 0
      ? Math.round(confidences.reduce((a, b) => a + b, 0) / confidences.length)
      : 0;

  return {
    totalRuns: runs.length,
    completedRuns: runs.filter((r) => r.status === "completed").length,
    totalFields,
    unmappedFields,
    approvalRate,
    avgConfidence,
    recentRuns: runs.map((r) => ({
      id: r.id,
      name: r.name,
      status: r.status,
      unmapped: r.unmapped,
      fields: r.fields,
      ranAt: r.ranAt,
    })),
    isPreview: true,
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
