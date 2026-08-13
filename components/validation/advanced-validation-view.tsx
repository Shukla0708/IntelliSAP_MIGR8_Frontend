"use client";

import { useRouter } from "next/navigation";
import { useCallback, useState } from "react";
import { SourceUploadZone } from "@/components/validation/source-upload-zone";
import { ValidationRulesTable } from "@/components/validation/validation-rules-table";
import { PlayArrowIcon } from "@/components/ui/icons";
import { TextField } from "@/components/ui/text-field";
import apiClient, { getApiErrorMessage } from "@/lib/axios";
import { useDefaultProject } from "@/lib/use-default-project";
import type { ValidationFieldRule } from "@/data/validation";

export function AdvancedValidationView() {
  const router = useRouter();
  const { project, loading: projectLoading } = useDefaultProject();

  const [runName, setRunName] = useState("");
  const [runId, setRunId] = useState<string | null>(null);
  const [fields, setFields] = useState<string[]>([]);
  const [rules, setRules] = useState<ValidationFieldRule[]>([]);
  const [running, setRunning] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleUploaded = useCallback((id: string, extractedFields: string[]) => {
    setRunId(id);
    setFields(extractedFields);
  }, []);

  const handleRulesChange = useCallback((rows: ValidationFieldRule[]) => {
    setRules(rows);
  }, []);

  async function handleRunValidation() {
    if (!runId) return;
    setRunning(true);
    setError(null);

    try {
      await apiClient.put(
        `/api/runs/${runId}/rules`,
        rules.map((r) => ({
          field_name: r.fieldName,
          flag_key: r.flags.key,
          flag_mandatory: r.flags.mandatory,
          flag_null: r.flags.null,
          flag_email: r.flags.email,
          flag_mobile: r.flags.mobile,
          flag_date: r.flags.date,
          flag_special_chars: r.flags.specialChars,
          case_format: r.config.caseFormat,
          data_type: r.config.dataType,
          max_length: r.config.length,
          decimal_length: r.config.decimalLength,
          regex: r.config.regex || null,
          regex_prompt: r.config.regexPrompt || null,
        })),
      );

      await apiClient.post(`/api/runs/${runId}/execute`);
      router.push(`/validation_result/${runId}`);
    } catch (err) {
      setError(getApiErrorMessage(err, "Validation run failed"));
      setRunning(false);
    }
  }

  const sourceReady = fields.length > 0;
  const nameLocked = Boolean(runId);

  return (
    <div className="flex min-h-[calc(100vh-4rem)] flex-col">
      <div className="flex-1 overflow-y-auto bg-background pb-28">
        <div className="mx-auto max-w-[1200px] px-4 py-6 md:px-8">
          <div className="mb-6">
            <h2 className="mb-2 text-[32px] font-semibold leading-10 tracking-[-0.01em] text-on-surface">
              Data Validation Rules
            </h2>
            <p className="text-base leading-6 text-on-surface-variant">
              Name this run, then configure validation logic and upload your source records.
            </p>
          </div>

          {projectLoading || !project ? (
            <p className="text-sm text-on-surface-variant">Loading project...</p>
          ) : (
            <>
              <div className="mb-6 max-w-xl">
                <TextField
                  id="validation-run-name"
                  name="validationRunName"
                  label="Validation Run Name"
                  placeholder="e.g. Customer master — full source check"
                  value={runName}
                  onChange={(event) => setRunName(event.target.value)}
                  required
                  disabled={nameLocked}
                  maxLength={120}
                  autoComplete="off"
                />
                <p className="mt-1.5 text-xs leading-4 text-on-surface-variant">
                  Must be unique within this project.
                  {nameLocked ? " Locked after the source file is uploaded." : null}
                </p>
              </div>

              <SourceUploadZone
                projectId={project.id}
                runName={runName}
                onUploaded={handleUploaded}
              />
              <div className="mt-6">
                <ValidationRulesTable fields={fields} onRulesChange={handleRulesChange} />
              </div>
            </>
          )}

          {error && <p className="mt-4 text-sm text-error">{error}</p>}
        </div>
      </div>

      <div className="sticky bottom-0 z-30 flex flex-col gap-3 border-t border-outline-variant bg-surface/90 px-4 py-4 shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.05)] backdrop-blur-md sm:flex-row sm:items-center sm:justify-between md:px-6">
        <div className="text-[13px] leading-[18px] text-on-surface-variant">
          {sourceReady ? (
            <>
              <span className="font-semibold text-primary">Source File</span> ready for validation
              {runName.trim() ? (
                <>
                  {" "}
                  · <span className="font-semibold text-on-surface">{runName.trim()}</span>
                </>
              ) : null}
            </>
          ) : runName.trim() ? (
            "Upload a source file to begin validation"
          ) : (
            "Enter a unique run name, then upload a source file"
          )}
        </div>
        <div className="flex flex-wrap gap-3">
          <button
            type="button"
            disabled
            title="Draft saving happens automatically once rules are configured"
            className="rounded-lg border border-outline-variant bg-white px-6 py-2.5 text-xs font-semibold uppercase tracking-[0.02em] text-on-surface opacity-60 shadow-sm"
          >
            Save Draft
          </button>
          <button
            type="button"
            onClick={handleRunValidation}
            disabled={!sourceReady || running}
            className="inline-flex items-center gap-2 rounded-lg bg-primary-container px-6 py-2.5 text-xs font-semibold uppercase tracking-[0.02em] text-on-primary shadow-sm transition-colors hover:bg-primary disabled:opacity-50"
          >
            {running ? "Running..." : "Run Validation Rules"}
            <PlayArrowIcon className="h-[18px] w-[18px]" />
          </button>
        </div>
      </div>
    </div>
  );
}
