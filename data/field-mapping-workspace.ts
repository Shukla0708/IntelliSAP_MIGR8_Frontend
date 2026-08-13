import { FIELD_MAPPING_PROJECT_NAME } from "@/data/field-mapping";
import { PREVIOUS_FIELD_MAPPING_RUNS } from "@/data/field-mapping";

export const LATEST_FIELD_MAPPING_RUN_ID = "map-new";

export type FieldMappingRowIcon = "tag" | "mail" | "phone";

export type MappingProspect = {
  id: string;
  targetField: string;
  targetDescription?: string | null;
  confidence: number;
  semanticSimilarity?: number | null;
  datatypeMatch?: number | null;
  reasoning?: string | null;
  /** Picked by the user from the full target list instead of suggested by the AI. */
  manual?: boolean;
};

export type FieldMappingRow = {
  id: string;
  sourceField: string;
  icon: FieldMappingRowIcon;
  status: "mapped" | "unmapped";
  prospects: MappingProspect[];
  selectedProspectId: string | null;
  /** Source field was flagged as a key field in the uploaded source file. */
  keyField?: boolean;
  /** Internal number range was chosen for a key field — AI won't pre-map it. */
  requiresManualMapping?: boolean;
  /** This row's mapping has already been confirmed in a prior "Approve Mapping". */
  confirmed?: boolean;
  aiReview: {
    confidence: number;
    semanticSimilarity: number;
    datatypeMatch: number;
    reasoning: string;
  } | null;
};

export type FieldMappingWorkspace = {
  id: string;
  runName: string;
  projectName: string;
  rows: FieldMappingRow[];
  defaultActiveRowId: string;
};

const baseRows: FieldMappingRow[] = [
  {
    id: "row-customer-id",
    sourceField: "CUSTOMER_ID",
    icon: "tag",
    status: "mapped",
    selectedProspectId: "prospect-kunnr",
    prospects: [
      { id: "prospect-kunnr", targetField: "KUNNR", confidence: 98 },
      { id: "prospect-partner", targetField: "PARTNER", confidence: 82 },
      { id: "prospect-lifnr", targetField: "LIFNR", confidence: 45 },
    ],
    aiReview: {
      confidence: 98,
      semanticSimilarity: 96,
      datatypeMatch: 100,
      reasoning:
        'Oracle CUSTOMER_ID (VARCHAR2) aligns with SAP KUNNR as the primary customer number key in the Business Partner model.',
    },
  },
  {
    id: "row-email",
    sourceField: "EMAIL",
    icon: "mail",
    status: "mapped",
    selectedProspectId: "prospect-smtp",
    prospects: [
      { id: "prospect-smtp", targetField: "SMTP_ADDR", confidence: 94 },
      { id: "prospect-ad-smtp", targetField: "AD_SMTPADR", confidence: 88 },
      { id: "prospect-email", targetField: "E_MAIL", confidence: 71 },
    ],
    aiReview: {
      confidence: 94,
      semanticSimilarity: 92,
      datatypeMatch: 100,
      reasoning:
        'Both fields represent the primary electronic mail contact method for the customer entity. Oracle\'s EMAIL (VARCHAR2) safely maps to SAP\'s SMTP_ADDR (CHAR) standard structure AD_SMTPADR.',
    },
  },
  {
    id: "row-phone",
    sourceField: "PHONE",
    icon: "phone",
    status: "unmapped",
    selectedProspectId: null,
    prospects: [],
    aiReview: null,
  },
];

function buildWorkspace(
  id: string,
  overrides: Partial<FieldMappingWorkspace>,
): FieldMappingWorkspace {
  return {
    id,
    runName: "Field mapping run",
    projectName: FIELD_MAPPING_PROJECT_NAME,
    rows: baseRows,
    defaultActiveRowId: "row-email",
    ...overrides,
  };
}

export const FIELD_MAPPING_WORKSPACES: Record<string, FieldMappingWorkspace> = {
  "map-001": buildWorkspace("map-001", {
    runName: "Customer Master — full schema map",
    defaultActiveRowId: "row-email",
  }),
  "map-002": buildWorkspace("map-002", {
    runName: "Address & contact fields",
    defaultActiveRowId: "row-customer-id",
  }),
  "map-003": buildWorkspace("map-003", {
    runName: "Payment terms mapping",
    defaultActiveRowId: "row-phone",
    rows: baseRows.map((row) =>
      row.id === "row-phone"
        ? {
            ...row,
            status: "unmapped" as const,
            selectedProspectId: null,
            prospects: [],
            aiReview: null,
          }
        : row,
    ),
  }),
  [LATEST_FIELD_MAPPING_RUN_ID]: buildWorkspace(LATEST_FIELD_MAPPING_RUN_ID, {
    runName: "New field mapping run",
    defaultActiveRowId: "row-email",
  }),
};

export function getFieldMappingWorkspace(id: string) {
  return FIELD_MAPPING_WORKSPACES[id] ?? null;
}

export function getAllFieldMappingWorkspaceIds() {
  return Object.keys(FIELD_MAPPING_WORKSPACES);
}

export function getFieldMappingRunLabel(id: string) {
  const fromWorkspace = FIELD_MAPPING_WORKSPACES[id]?.runName;
  if (fromWorkspace) return fromWorkspace;
  return PREVIOUS_FIELD_MAPPING_RUNS.find((run) => run.id === id)?.name ?? id;
}
