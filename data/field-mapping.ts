export type SchemaUploadCard = {
  id: "source" | "target";
  title: string;
  description: string;
  buttonLabel: string;
  supportedFormats: string;
  icon: "uploadFile" | "schema";
  sapFetch?: {
    label: string;
    placeholder: string;
    buttonLabel: string;
  };
};

export const FIELD_MAPPING_PROJECT_NAME =
  "Customer Master — Oracle → SAP";

export const FIELD_MAPPING_TOPBAR_TITLE =
  "AI Mapping: Upload Source & Target Schemas";

export type FieldMappingRunStatus = "completed" | "failed" | "running";

export type FieldMappingRun = {
  id: string;
  name: string;
  status: FieldMappingRunStatus;
  ranAt: string;
  fields: string;
  unmapped: number;
};

export const PREVIOUS_FIELD_MAPPING_RUNS: FieldMappingRun[] = [
  {
    id: "map-001",
    name: "Customer Master — full schema map",
    status: "completed",
    ranAt: "Last run 3h ago",
    fields: "48 fields",
    unmapped: 2,
  },
  {
    id: "map-002",
    name: "Address & contact fields",
    status: "completed",
    ranAt: "Last run 1d ago",
    fields: "22 fields",
    unmapped: 0,
  },
  {
    id: "map-003",
    name: "Payment terms mapping",
    status: "failed",
    ranAt: "Last run 2d ago",
    fields: "15 fields",
    unmapped: 8,
  },
];

export const SCHEMA_UPLOAD_CARDS: SchemaUploadCard[] = [
  {
    id: "source",
    title: "Source Field List",
    description: "Upload your source schema (CSV, XLSX) to begin mapping.",
    buttonLabel: "Select Source File",
    supportedFormats: "Supported: .csv, .xlsx",
    icon: "uploadFile",
  },
  {
    id: "target",
    title: "Target Field List",
    description: "Upload your source schema (CSV, XLSX) to begin mapping.",
    buttonLabel: "Select Target File",
    supportedFormats: "Supported: .csv, .xlsx",
    icon: "schema",
    sapFetch: {
      label: "Fetch from SAP",
      placeholder: "Enter SAP Table Name (e.g., MARA, KNA1)",
      buttonLabel: "Fetch",
    },
  },
];
