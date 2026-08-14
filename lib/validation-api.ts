import {
  buildRuleTags,
  DEFAULT_FIELD_RULE_CONFIG,
  type CaseFormat,
  type FieldDataType,
  type ValidationFieldRule,
} from "@/data/validation";
import { sapCharLength, sapFieldKey } from "@/lib/sap-field-types";
import { trackJob } from "@/lib/job-tracker";

export type ValidationRunDetail = {
  id: string;
  project_id: string;
  name: string;
  status: string;
  source_filename: string | null;
  has_source_file: boolean;
  processed_rows?: number;
  total_rows?: number;
  error_message?: string | null;
  has_result_file?: boolean;
  fields: Array<{
    field_name: string;
    flag_key: boolean;
    flag_mandatory: boolean;
    flag_null: boolean;
    flag_email: boolean;
    flag_mobile: boolean;
    flag_date: boolean;
    flag_special_chars: boolean;
    case_format: CaseFormat | null;
    data_type: FieldDataType;
    max_length: number | null;
    decimal_length: number | null;
    regex: string | null;
    regex_prompt: string | null;
    rule_source?: "user" | "ai" | "default";
  }>;
};

export function rulesToPayload(rules: ValidationFieldRule[]) {
  return rules.map((rule) => ({
    field_name: rule.fieldName,
    flag_key: rule.flags.key,
    flag_mandatory: rule.flags.mandatory,
    flag_null: rule.flags.null,
    flag_email: rule.flags.email,
    flag_mobile: rule.flags.mobile,
    flag_date: rule.flags.date,
    flag_special_chars: rule.flags.specialChars,
    case_format: rule.config.caseFormat,
    data_type: rule.config.dataType,
    max_length: rule.config.length,
    decimal_length: rule.config.decimalLength,
    regex: rule.config.regex || null,
    regex_prompt: rule.config.regexPrompt || null,
    rule_source: rule.ruleSource ?? "default",
  }));
}

export function apiFieldToRule(
  field: ValidationRunDetail["fields"][number],
  index: number,
): ValidationFieldRule {
  const config = {
    caseFormat: field.case_format,
    dataType: field.data_type,
    length: field.max_length,
    decimalLength: field.decimal_length,
    regex: field.regex ?? "",
    regexPrompt: field.regex_prompt ?? "",
  };

  return {
    id: `field-${index}-${field.field_name}`,
    fieldName: field.field_name,
    tags: buildRuleTags(config),
    config,
    flags: {
      key: field.flag_key,
      mandatory: field.flag_mandatory,
      null: field.flag_null,
      email: field.flag_email,
      mobile: field.flag_mobile,
      date: field.flag_date,
      specialChars: field.flag_special_chars,
    },
    ruleSource: field.rule_source ?? "default",
  };
}

export async function fetchValidationRun(runId: string): Promise<ValidationRunDetail> {
  const { data } = await apiClient.get<ValidationRunDetail>(`/api/runs/${runId}`);
  return data;
}

export async function createValidationRun(
  projectId: string,
  name: string,
): Promise<string> {
  const { data } = await apiClient.post<{ run_id: string }>(
    `/api/runs/?project_id=${projectId}`,
    { name: name.trim() },
  );
  return data.run_id;
}

export async function uploadSourceFile(
  runId: string,
  file: File,
  onProgress?: (ratio: number) => void,
): Promise<string[]> {
  const formData = new FormData();
  formData.append("file", file);
  const { data } = await apiClient.post<{ fields: string[] }>(
    `/api/runs/${runId}/upload`,
    formData,
    {
      timeout: 0,
      onUploadProgress: (event) => {
        if (onProgress && event.total) {
          onProgress(event.loaded / event.total);
        }
      },
    },
  );
  return data.fields;
}

export async function saveValidationRules(
  runId: string,
  rules: ValidationFieldRule[],
): Promise<void> {
  await apiClient.put(`/api/runs/${runId}/rules`, rulesToPayload(rules));
}

export async function executeValidationRun(runId: string): Promise<void> {
  await apiClient.post(`/api/runs/${runId}/execute`);
  trackJob({ kind: "validation", id: runId });
}

export async function updateValidationDraft(
  runId: string,
  rules: ValidationFieldRule[],
  file?: File | null,
): Promise<string[]> {
  let fields: string[] = [];
  if (file) {
    fields = await uploadSourceFile(runId, file);
  }
  await saveValidationRules(runId, rules);
  return fields;
}

export async function persistValidationRun(
  projectId: string,
  name: string,
  rules: ValidationFieldRule[],
  options?: {
    existingRunId?: string | null;
    file?: File | null;
  },
): Promise<string> {
  const runId =
    options?.existingRunId ?? (await createValidationRun(projectId, name));

  if (options?.file) {
    await uploadSourceFile(runId, options.file);
  }

  await saveValidationRules(runId, rules);
  return runId;
}

export type SuggestedField = {
  field_name: string;
  flag_key: boolean;
  flag_mandatory: boolean;
  flag_null: boolean;
  flag_email: boolean;
  flag_mobile: boolean;
  flag_date: boolean;
  flag_special_chars: boolean;
  case_format: CaseFormat | null;
  data_type: FieldDataType;
  max_length: number | null;
  decimal_length: number | null;
  regex: string | null;
  regex_prompt: string | null;
  rule_source?: string;
  suggestion_source?: string;
  template_name?: string | null;
};

export type SuggestRulesResponse = {
  suggestions: SuggestedField[];
  warning: string | null;
};

export function mergeSuggestedRules(
  current: ValidationFieldRule[],
  suggestions: SuggestedField[],
): ValidationFieldRule[] {
  const byName = new Map(suggestions.map((item) => [item.field_name, item]));
  const byKey = new Map(suggestions.map((item) => [sapFieldKey(item.field_name), item]));
  return current.map((row) => {
    if (row.ruleSource === "user") {
      return row;
    }
    const suggestion =
      byName.get(row.fieldName) ?? byKey.get(sapFieldKey(row.fieldName));
    if (!suggestion) {
      return row;
    }
    const sapLength = sapCharLength(row.fieldName);
    let dataType: FieldDataType = suggestion.data_type || "string";
    let length = suggestion.max_length;
    if (sapLength != null) {
      dataType = "char";
      length = sapLength;
    } else if (dataType === "int") {
      dataType = "char";
    }
    const config = {
      caseFormat: suggestion.case_format ?? null,
      dataType,
      length,
      decimalLength: dataType === "decimal" ? suggestion.decimal_length : null,
      regex: suggestion.regex ?? "",
      regexPrompt: suggestion.regex_prompt ?? "",
    };
    return {
      ...row,
      config,
      tags: buildRuleTags(config),
      flags: {
        key: row.flags.key,
        mandatory: suggestion.flag_mandatory,
        null: suggestion.flag_null,
        email: suggestion.flag_email,
        mobile: suggestion.flag_mobile,
        date: suggestion.flag_date,
        specialChars: suggestion.flag_special_chars,
      },
      ruleSource: "ai" as const,
    };
  });
}

export async function suggestValidationRules(
  fields: Array<{ field_name: string; samples: string[] }>,
): Promise<SuggestRulesResponse> {
  const { data } = await apiClient.post<SuggestRulesResponse>(
    "/api/runs/suggest-rules",
    { fields },
    { timeout: 90_000 },
  );
  return data;
}
