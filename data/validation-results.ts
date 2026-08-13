import {
  PREVIOUS_VALIDATION_RUNS,
  VALIDATION_PROJECT_NAME,
} from "@/data/validation";

export const LATEST_VALIDATION_RUN_ID = "run-new";

export type ExceptionSeverity = "error" | "warning";

export type ValidationException = {
  id: string;
  severity: ExceptionSeverity;
  rowId: string;
  field: string;
  actualValue: string;
  expected: string;
  errorType: string;
  actionLabel: "Fix" | "View";
};

export type ValidationResultSummary = {
  id: string;
  projectLabel: string;
  projectName: string;
  runName: string;
  healthScore: number;
  processedRecords: number;
  validRows: number;
  validRowsDelta: string;
  invalidRows: number;
  invalidRowsShare: string;
  totalErrors: number;
  avgErrorsPerInvalid: string;
  criticalErrors: number;
  errorsByType: { label: string; value: number; color: string }[];
  errorsByField: { field: string; count: number }[];
  exceptions: ValidationException[];
};

const sharedExceptions: ValidationException[] = [
  {
    id: "ex-1",
    severity: "error",
    rowId: "ROW_9482",
    field: "CUSTOMER_ID",
    actualValue: "null",
    expected: "Alphanumeric (10 chars)",
    errorType: "Missing Required Field",
    actionLabel: "Fix",
  },
  {
    id: "ex-2",
    severity: "warning",
    rowId: "ROW_9483",
    field: "EMAIL",
    actualValue: "john.doe@",
    expected: "Valid Email Format",
    errorType: "Format Mismatch",
    actionLabel: "View",
  },
  {
    id: "ex-3",
    severity: "error",
    rowId: "ROW_10244",
    field: "CUSTOMER_ID",
    actualValue: "CUST-882-A",
    expected: "Unique ID",
    errorType: "Duplicate Record",
    actionLabel: "Fix",
  },
  {
    id: "ex-4",
    severity: "warning",
    rowId: "ROW_11005",
    field: "REGION_CODE",
    actualValue: "NA-WEST-1",
    expected: "Mapped Value (US-W)",
    errorType: "Unmapped Value",
    actionLabel: "View",
  },
];

const baseCharts = {
  errorsByType: [
    { label: "Blank", value: 45, color: "#004da4" },
    { label: "Duplicate", value: 20, color: "#6063ee" },
    { label: "Email Format", value: 15, color: "#8a3500" },
    { label: "Others", value: 20, color: "#c2c6d5" },
  ],
  errorsByField: [
    { field: "CUSTOMER_ID", count: 420 },
    { field: "EMAIL", count: 310 },
    { field: "PHONE", count: 180 },
    { field: "ADDRESS_LINE_1", count: 120 },
  ],
};

function buildResult(
  id: string,
  overrides: Partial<ValidationResultSummary>,
): ValidationResultSummary {
  return {
    id,
    projectLabel: "Project Alpha",
    projectName: VALIDATION_PROJECT_NAME,
    runName: "Validation run",
    healthScore: 94.8,
    processedRecords: 12430,
    validRows: 11784,
    validRowsDelta: "+2.4% vs last run",
    invalidRows: 646,
    invalidRowsShare: "5.2% of total dataset",
    totalErrors: 1284,
    avgErrorsPerInvalid: "Avg 1.9 errors per invalid row",
    criticalErrors: 42,
    ...baseCharts,
    exceptions: sharedExceptions,
    ...overrides,
  };
}

export const VALIDATION_RESULTS_BY_ID: Record<string, ValidationResultSummary> =
  {
    "run-001": buildResult("run-001", {
      runName: "Full source validation",
      healthScore: 94.8,
      criticalErrors: 42,
      totalErrors: 1284,
    }),
    "run-002": buildResult("run-002", {
      runName: "Email & mandatory fields check",
      healthScore: 88.2,
      validRows: 11210,
      invalidRows: 1220,
      invalidRowsShare: "9.8% of total dataset",
      totalErrors: 2104,
      avgErrorsPerInvalid: "Avg 1.7 errors per invalid row",
      criticalErrors: 96,
      validRowsDelta: "-1.1% vs last run",
    }),
    "run-003": buildResult("run-003", {
      runName: "Key uniqueness sweep",
      healthScore: 99.1,
      validRows: 12400,
      invalidRows: 30,
      invalidRowsShare: "0.2% of total dataset",
      totalErrors: 30,
      avgErrorsPerInvalid: "Avg 1.0 errors per invalid row",
      criticalErrors: 0,
      validRowsDelta: "+0.4% vs last run",
      exceptions: [
        {
          id: "ex-ok-1",
          severity: "warning",
          rowId: "ROW_2201",
          field: "CUSTOMER_ID",
          actualValue: "CUST-001",
          expected: "Unique ID",
          errorType: "Near Duplicate",
          actionLabel: "View",
        },
      ],
    }),
    [LATEST_VALIDATION_RUN_ID]: buildResult(LATEST_VALIDATION_RUN_ID, {
      runName: "New validation run",
      healthScore: 94.8,
    }),
  };

export function getValidationResult(id: string) {
  return VALIDATION_RESULTS_BY_ID[id] ?? null;
}

export function getAllValidationResultIds() {
  return Object.keys(VALIDATION_RESULTS_BY_ID);
}

export function getValidationRunLabel(id: string) {
  const fromResults = VALIDATION_RESULTS_BY_ID[id]?.runName;
  if (fromResults) return fromResults;
  return PREVIOUS_VALIDATION_RUNS.find((run) => run.id === id)?.name ?? id;
}
