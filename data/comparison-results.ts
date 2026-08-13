import {
  COMPARISON_PROJECT_NAME,
  PREVIOUS_COMPARISON_RUNS,
} from "@/data/comparison";

export const LATEST_COMPARISON_RUN_ID = "cmp-new";

export type DiscrepancyStatus = "warning" | "info" | "error";

export type ReconciliationDiscrepancy = {
  id: string;
  businessKey: string;
  field: string;
  fieldItalic?: boolean;
  preloadValue: string;
  postloadValue: string;
  postloadHighlight?: "tertiary" | "error";
  differenceType: string;
  status: DiscrepancyStatus;
};

export type ReconciliationReviewSummary = {
  id: string;
  projectName: string;
  runName: string;
  matchedRecords: number;
  matchRate: string;
  differentCount: number;
  differentLabel: string;
  missingCount: number;
  missingLabel: string;
  discrepancies: ReconciliationDiscrepancy[];
};

const sharedDiscrepancies: ReconciliationDiscrepancy[] = [
  {
    id: "disc-1",
    businessKey: "ID: 100045",
    field: "EMAIL",
    preloadValue: "john@old.com",
    postloadValue: "john@new.com",
    postloadHighlight: "tertiary",
    differenceType: "VALUE_MISMATCH",
    status: "warning",
  },
  {
    id: "disc-2",
    businessKey: "ID: 100082",
    field: "POSTAL_CODE",
    preloadValue: "90210",
    postloadValue: "90210-1234",
    postloadHighlight: "tertiary",
    differenceType: "FORMAT_CHANGE",
    status: "info",
  },
  {
    id: "disc-3",
    businessKey: "ID: 100119",
    field: "Entire Record",
    fieldItalic: true,
    preloadValue: "ACTIVE",
    postloadValue: "NULL (Not Found)",
    postloadHighlight: "error",
    differenceType: "DROPPED_RECORD",
    status: "error",
  },
  {
    id: "disc-4",
    businessKey: "ID: 100201",
    field: "PHONE",
    preloadValue: "+1-555-0100",
    postloadValue: "5550100",
    postloadHighlight: "tertiary",
    differenceType: "FORMAT_CHANGE",
    status: "info",
  },
];

function buildReview(
  id: string,
  overrides: Partial<ReconciliationReviewSummary>,
): ReconciliationReviewSummary {
  return {
    id,
    projectName: COMPARISON_PROJECT_NAME,
    runName: "Reconciliation run",
    matchedRecords: 12306,
    matchRate: "99.0% Match Rate",
    differentCount: 124,
    differentLabel: "Value Mismatches Detected",
    missingCount: 12,
    missingLabel: "Dropped during load",
    discrepancies: sharedDiscrepancies,
    ...overrides,
  };
}

export const RECONCILIATION_REVIEWS_BY_ID: Record<
  string,
  ReconciliationReviewSummary
> = {
  "cmp-001": buildReview("cmp-001", {
    runName: "Customer Master — postload vs preload",
    matchedRecords: 44876,
    matchRate: "99.7% Match Rate",
    differentCount: 124,
    missingCount: 12,
  }),
  "cmp-002": buildReview("cmp-002", {
    runName: "Material Master reconciliation",
    matchedRecords: 11982,
    matchRate: "99.8% Match Rate",
    differentCount: 18,
    missingCount: 2,
    discrepancies: sharedDiscrepancies.slice(0, 2),
  }),
  "cmp-003": buildReview("cmp-003", {
    runName: "Vendor Master delta check",
    matchedRecords: 7588,
    matchRate: "94.9% Match Rate",
    differentCount: 312,
    missingCount: 100,
    discrepancies: sharedDiscrepancies,
  }),
  [LATEST_COMPARISON_RUN_ID]: buildReview(LATEST_COMPARISON_RUN_ID, {
    runName: "New reconciliation run",
  }),
};

export function getReconciliationReview(id: string) {
  return RECONCILIATION_REVIEWS_BY_ID[id] ?? null;
}

export function getAllReconciliationReviewIds() {
  return Object.keys(RECONCILIATION_REVIEWS_BY_ID);
}

export function getComparisonRunLabel(id: string) {
  const fromReview = RECONCILIATION_REVIEWS_BY_ID[id]?.runName;
  if (fromReview) return fromReview;
  return PREVIOUS_COMPARISON_RUNS.find((run) => run.id === id)?.name ?? id;
}
