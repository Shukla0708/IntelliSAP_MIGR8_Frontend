export const VALIDATION_PROJECT_NAME =
  "Customer Master — Oracle → SAP";

export type ValidationRunStatus =
  | "draft"
  | "rules_configured"
  | "completed"
  | "failed"
  | "running";

export type ValidationRun = {
  id: string;
  name: string;
  status: ValidationRunStatus;
  ranAt: string;
  records: string;
  errors: number;
};

export const PREVIOUS_VALIDATION_RUNS: ValidationRun[] = [
  {
    id: "run-001",
    name: "Full source validation",
    status: "completed",
    ranAt: "Last run 2h ago",
    records: "45k Records",
    errors: 37,
  },
  {
    id: "run-002",
    name: "Email & mandatory fields check",
    status: "failed",
    ranAt: "Last run 1d ago",
    records: "45k Records",
    errors: 124,
  },
  {
    id: "run-003",
    name: "Key uniqueness sweep",
    status: "completed",
    ranAt: "Last run 3d ago",
    records: "45k Records",
    errors: 0,
  },
];

export type RuleFlag =
  | "key"
  | "mandatory"
  | "null"
  | "email"
  | "mobile"
  | "date"
  | "specialChars";

export type CaseFormat = "uppercase" | "lowercase" | "camelCase";

export type FieldDataType = "char" | "int" | "decimal" | "string" | "boolean";

export const FIELD_DATA_TYPES: FieldDataType[] = [
  "char",
  "int",
  "decimal",
  "string",
  "boolean",
];

export const MAX_FIELD_LENGTH = 255;

export type FieldRuleConfig = {
  caseFormat: CaseFormat | null;
  dataType: FieldDataType;
  length: number | null;
  decimalLength: number | null;
  regex: string;
  regexPrompt: string; // plain-English rule; Groq generates regex
};

export type ValidationFieldRule = {
  id: string;
  fieldName: string;
  tags: string[];
  config: FieldRuleConfig;
  flags: Record<RuleFlag, boolean>;
};

export function isLengthEnabled(dataType: FieldDataType) {
  // Length is disabled when string is selected (Stitch + product rule)
  return dataType !== "string";
}

export function isDecimalLengthVisible(dataType: FieldDataType) {
  return dataType === "decimal";
}

export function buildRuleTags(config: FieldRuleConfig): string[] {
  const tags: string[] = [];

  if (config.caseFormat === "uppercase") tags.push("UPPERCASE");
  if (config.caseFormat === "lowercase") tags.push("LOWERCASE");
  if (config.caseFormat === "camelCase") tags.push("CAMEL CASE");

  tags.push(config.dataType.toUpperCase());

  if (
    isLengthEnabled(config.dataType) &&
    config.length !== null &&
    !Number.isNaN(config.length)
  ) {
    tags.push(`LENGTH: ${config.length}`);
  }

  if (
    isDecimalLengthVisible(config.dataType) &&
    config.decimalLength !== null &&
    !Number.isNaN(config.decimalLength)
  ) {
    tags.push(`DECIMAL: ${config.decimalLength}`);
  }

  if (config.regex.trim()) {
    tags.push("REGEX");
  }

  return tags;
}

export const DEFAULT_FIELD_RULE_CONFIG: FieldRuleConfig = {
  caseFormat: null,
  dataType: "string",
  length: null,
  decimalLength: null,
  regex: "",
  regexPrompt: "",
};

const customerIdConfig: FieldRuleConfig = {
  caseFormat: "uppercase",
  dataType: "char",
  length: 10,
  decimalLength: null,
  regex: "^[A-Z0-9]+$",
  regexPrompt: "",
};

export const VALIDATION_FIELD_RULES: ValidationFieldRule[] = [
  {
    id: "customer-id",
    fieldName: "CUSTOMER_ID",
    tags: buildRuleTags(customerIdConfig),
    config: customerIdConfig,
    flags: {
      key: true,
      mandatory: true,
      null: false,
      email: false,
      mobile: false,
      date: false,
      specialChars: false,
    },
  },
  {
    id: "email-addr",
    fieldName: "EMAIL_ADDR",
    tags: [],
    config: { ...DEFAULT_FIELD_RULE_CONFIG },
    flags: {
      key: false,
      mandatory: true,
      null: false,
      email: true,
      mobile: false,
      date: false,
      specialChars: false,
    },
  },
];

export const RULE_COLUMNS: { key: RuleFlag; label: string }[] = [
  { key: "key", label: "Key" },
  { key: "mandatory", label: "Mandatory" },
  { key: "null", label: "Null" },
  { key: "email", label: "Email" },
  { key: "mobile", label: "Mobile" },
  { key: "date", label: "Date" },
  { key: "specialChars", label: "Special Chars" },
];
