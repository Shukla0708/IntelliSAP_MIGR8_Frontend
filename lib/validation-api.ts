import {
  buildRuleTags,
  DEFAULT_FIELD_RULE_CONFIG,
  type CaseFormat,
  type FieldDataType,
  type ValidationFieldRule,
} from "@/data/validation";
import apiClient from "@/lib/axios";

export type ValidationRunDetail = {
  id: string;
  project_id: string;
  name: string;
  status: string;
  source_filename: string | null;
  has_source_file: boolean;
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
): Promise<string[]> {
  const formData = new FormData();
  formData.append("file", file);
  const { data } = await apiClient.post<{ fields: string[] }>(
    `/api/runs/${runId}/upload`,
    formData,
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
