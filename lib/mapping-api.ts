import apiClient from "@/lib/axios";
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
};

export type MappingRowApi = {
  sourceField: string;
  keyField: boolean;
  prospects: MappingProspectApi[];
  confirmedTargetField: string | null;
};

export type MappingRunResult = {
  mappingRunId: string;
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
): Promise<MappingRunResult> {
  const formData = new FormData();
  formData.append("number_range_type", numberRangeType);
  formData.append("source_file", sourceFile);
  formData.append("target_file", targetFile);

  const { data } = await apiClient.post<MappingRunResult>(
    `/api/mappings/?project_id=${projectId}`,
    formData,
  );
  return data;
}

export async function listMappingRuns(projectId: string) {
  const { data } = await apiClient.get<
    Array<{
      mappingRunId: string;
      mappingName: string | null;
      status: string;
      sourceFilename: string | null;
      targetFilename: string | null;
    }>
  >(`/api/mappings/?project_id=${projectId}`);
  return data;
}

export async function fetchMappingRunResult(
  runId: string,
): Promise<MappingRunResult> {
  const { data } = await apiClient.get<MappingRunResult>(
    `/api/mappings/${runId}/result`,
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
    }));

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
      confirmed: confirmedProspect !== null,
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
      result.sourceFilename && result.targetFilename
        ? `${result.sourceFilename} → ${result.targetFilename}`
        : "Field mapping run",
    projectName,
    rows,
    defaultActiveRowId: rows[0]?.id ?? "",
  };
}
