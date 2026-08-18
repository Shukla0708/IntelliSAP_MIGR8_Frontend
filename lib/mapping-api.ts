import apiClient from "@/lib/axios";
import { trackJob } from "@/lib/job-tracker";
import type {
  FieldMappingRow,
  FieldMappingWorkspace,
  MappingProspect,
} from "@/data/field-mapping-workspace";

export type NumberRangeType = "internal" | "external";

export type MappingProspectApi = {
  targetField: string;
  sapTable: string;
  sapField: string;
  targetDescription: string | null;
  semanticSimilarity: number | null;
  datatypeMatchScore: number | null;
  confidence: number | null;
  reasoning: string | null;
  userSelected?: boolean;
};

export type MappingRowApi = {
  sourceField: string;
  keyField: boolean;
  prospects: MappingProspectApi[];
  confirmedTargetField: string | null;
};

export type MappingRunResult = {
  mappingRunId: string;
  mappingName: string | null;
  status: string;
  numberRangeType: NumberRangeType | null;
  sourceFilename: string | null;
  targetFilename: string | null;
  totalSourceFields: number;
  mappedFields: number;
  rows: MappingRowApi[];
};

export async function createMappingRun(
  projectId: string,
  sourceFile: File,
  targetFile: File,
  numberRangeType: NumberRangeType,
  mappingName?: string,
): Promise<MappingRunResult> {
  const formData = new FormData();
  formData.append("number_range_type", numberRangeType);
  if (mappingName?.trim()) {
    formData.append("mapping_name", mappingName.trim());
  }
  formData.append("source_file", sourceFile);
  formData.append("target_file", targetFile);

  const { data } = await apiClient.post<MappingRunResult>(
    `/api/mappings/?project_id=${projectId}`,
    formData,
    { timeout: 0 },
  );
  trackJob({ kind: "mapping", id: data.mappingRunId });
  return data;
}

export type MappingRunListItem = {
  mappingRunId: string;
  mappingName: string | null;
  status: string;
  projectId: string;
  projectName: string;
  sourceFilename: string | null;
  targetFilename: string | null;
  totalSourceFields: number;
  mappedFields: number;
  confirmedFieldCount: number;
  keyFieldCount: number;
  createdAt: string | null;
};

export type MappingStats = {
  approved: number;
  awaitingApproval: number;
  processing: number;
  failed: number;
  total: number;
};

export async function fetchMappingStats(): Promise<MappingStats> {
  const { data } = await apiClient.get<MappingStats>("/api/mappings/stats");
  return data;
}

export async function fetchMappingRuns(options?: {
  projectId?: string;
  limit?: number;
}): Promise<MappingRunListItem[]> {
  const params: Record<string, string | number> = { limit: options?.limit ?? 50 };
  if (options?.projectId) params.project_id = options.projectId;

  const { data } = await apiClient.get<MappingRunListItem[]>("/api/mappings/", {
    params,
  });
  return data;
}

export async function listMappingRuns(projectId: string) {
  return fetchMappingRuns({ projectId });
}

export async function fetchMappingRunResult(
  runId: string,
): Promise<MappingRunResult> {
  const { data } = await apiClient.get<MappingRunResult>(
    `/api/mappings/${runId}/result`,
  );
  return data;
}

export async function renameMappingRun(
  runId: string,
  mappingName: string,
): Promise<string> {
  const { data } = await apiClient.patch<{ mappingName: string }>(
    `/api/mappings/${runId}`,
    { mapping_name: mappingName.trim() },
  );
  return data.mappingName;
}

export type TargetFieldOption = {
  targetField: string;
  sapTable: string;
  sapField: string;
  targetDescription: string | null;
  datatype: string | null;
};

/** Every SAP field in the run's uploaded target list — not just the AI's top 3. */
export async function fetchMappingTargetFields(
  runId: string,
): Promise<TargetFieldOption[]> {
  const { data } = await apiClient.get<TargetFieldOption[]>(
    `/api/mappings/${runId}/target-fields`,
  );
  return data;
}

export type ConfirmMappingField = {
  sourceField: string;
  targetField: string;
};

export async function confirmMapping(
  runId: string,
  fields: ConfirmMappingField[],
): Promise<void> {
  await apiClient.post(`/api/mappings/${runId}/confirm`, {
    fields: fields.map((f) => ({
      source_field: f.sourceField,
      target_field: f.targetField,
    })),
  });
}

export function toFieldMappingWorkspace(
  result: MappingRunResult,
  projectName: string,
): FieldMappingWorkspace {
  const rows: FieldMappingRow[] = result.rows.map((row) => {
    const requiresManualMapping =
      row.keyField && result.numberRangeType === "internal";

    const prospects: MappingProspect[] = row.prospects.map((p) => ({
      id: `${row.sourceField}__${p.targetField}`,
      targetField: p.targetField,
      targetDescription: p.targetDescription ?? null,
      confidence: Math.round(p.confidence ?? 0),
      semanticSimilarity:
        p.semanticSimilarity != null ? Math.round(p.semanticSimilarity * 100) : null,
      datatypeMatch:
        p.datatypeMatchScore != null ? Math.round(p.datatypeMatchScore) : null,
      reasoning: p.reasoning ?? null,
      manual: Boolean(p.userSelected),
    }));

    if (
      row.confirmedTargetField &&
      !prospects.some((p) => p.targetField === row.confirmedTargetField)
    ) {
      prospects.push({
        id: `${row.sourceField}__${row.confirmedTargetField}`,
        targetField: row.confirmedTargetField,
        targetDescription: null,
        confidence: 0,
        semanticSimilarity: null,
        datatypeMatch: null,
        reasoning: "Selected by the user from the full target list.",
        manual: true,
      });
    }

    const topApiProspect = row.prospects[0] ?? null;

    const confirmedProspect = row.confirmedTargetField
      ? prospects.find((p) => p.targetField === row.confirmedTargetField) ?? null
      : null;

    return {
      id: `row-${row.sourceField}`,
      sourceField: row.sourceField,
      icon: "tag",
      keyField: row.keyField,
      requiresManualMapping,
      confirmed: Boolean(row.confirmedTargetField),
      status:
        !requiresManualMapping && prospects.length > 0 ? "mapped" : "unmapped",
      prospects,
      selectedProspectId:
        confirmedProspect?.id ??
        (requiresManualMapping ? null : prospects[0]?.id ?? null),
      aiReview:
        !requiresManualMapping && topApiProspect
          ? {
              confidence: Math.round(topApiProspect.confidence ?? 0),
              semanticSimilarity: Math.round(
                (topApiProspect.semanticSimilarity ?? 0) * 100,
              ),
              datatypeMatch: Math.round(topApiProspect.datatypeMatchScore ?? 0),
              reasoning: topApiProspect.reasoning ?? "",
            }
          : null,
    };
  });

  return {
    id: result.mappingRunId,
    runName:
      result.mappingName ||
      (result.sourceFilename && result.targetFilename
        ? `${result.sourceFilename} → ${result.targetFilename}`
        : "Field mapping run"),
    projectName,
    rows,
    defaultActiveRowId: rows[0]?.id ?? "",
  };
}

export type SapTableField = {
  sap_table?: string;
  sap_field?: string;
  description?: string;
  datatype?: string;
  length?: number | null;
};

export async function fetchSapTableFields(table: string): Promise<{
  table: string;
  fields: SapTableField[];
  source: string;
}> {
  const { data } = await apiClient.post<{
    table: string;
    fields: SapTableField[];
    source: string;
  }>("/api/mappings/sap-fields", { table: table.trim().toUpperCase() });
  return data;
}
