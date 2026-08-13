export type ComparisonRunStatus = "draft" | "completed" | "failed" | "running";

export type ComparisonRun = {
  id: string;
  name: string;
  status: ComparisonRunStatus;
  ranAt: string;
  records: string;
  mismatches: number;
};

export const COMPARISON_PROJECT_NAME =
  "Customer Master — Oracle → SAP";

export type ReconciliationUploadCard = {
  id: "preload" | "postload";
  title: string;
  description: string;
  buttonLabel: string;
  accent: "primary" | "secondary";
};

export const RECONCILIATION_UPLOAD_CARDS: ReconciliationUploadCard[] = [
  {
    id: "preload",
    title: "Upload Preload File",
    description: "Drag and drop or click to select source extraction (XLSX)",
    buttonLabel: "Select File",
    accent: "primary",
  },
  {
    id: "postload",
    title: "Upload Postload File",
    description: "Drag and drop or click to select target load (XLSX)",
    buttonLabel: "Select File",
    accent: "secondary",
  },
];

export const PREVIOUS_COMPARISON_RUNS: ComparisonRun[] = [
  {
    id: "cmp-001",
    name: "Customer Master — postload vs preload",
    status: "completed",
    ranAt: "Last run 4h ago",
    records: "45k Records",
    mismatches: 124,
  },
  {
    id: "cmp-002",
    name: "Material Master reconciliation",
    status: "completed",
    ranAt: "Last run 1d ago",
    records: "12k Records",
    mismatches: 18,
  },
  {
    id: "cmp-003",
    name: "Vendor Master delta check",
    status: "failed",
    ranAt: "Last run 2d ago",
    records: "8k Records",
    mismatches: 412,
  },
];
