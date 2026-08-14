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
    ranAt: string | null;
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
    ranAt: string | null;
  }[];
};

export type ProjectReportApiResponse = {
  project: { id: string; name: string; created_at: string };
  generatedAt: string;
  readiness: ReportReadiness;
  validation: ReportValidationSection;
  comparison: ComparisonReportSection;
  mapping: MappingReportSection;
};

export type ProjectReport = ProjectReportApiResponse;
