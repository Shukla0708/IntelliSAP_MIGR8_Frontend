"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useCallback, useEffect, useState } from "react";
import { SourceUploadZone } from "@/components/validation/source-upload-zone";
import { ValidationRulesTable } from "@/components/validation/validation-rules-table";
import { PlayArrowIcon } from "@/components/ui/icons";
import { TextField } from "@/components/ui/text-field";
import { getApiErrorMessage } from "@/lib/axios";
import { useDefaultProject } from "@/lib/use-default-project";
import {
  apiFieldToRule,
  executeValidationRun,
  fetchValidationRun,
  mergeSuggestedRules,
  persistValidationRun,
  suggestValidationRules,
  updateValidationDraft,
} from "@/lib/validation-api";
import { parseSourceColumnSamples } from "@/lib/parse-source-headers";
import { isEditableValidationStatus } from "@/lib/validation-routes";
import type { ValidationFieldRule } from "@/data/validation";

type AdvancedValidationViewProps = {
  editRunId?: string;
};

export function AdvancedValidationView({ editRunId }: AdvancedValidationViewProps) {
  const router = useRouter();
  const { project, loading: projectLoading } = useDefaultProject();
  const isEditMode = Boolean(editRunId);

  const [loadingDraft, setLoadingDraft] = useState(isEditMode);
  const [runName, setRunName] = useState("");
  const [runId, setRunId] = useState<string | null>(editRunId ?? null);
  const [projectId, setProjectId] = useState<string | null>(null);
  const [sourceFile, setSourceFile] = useState<File | null>(null);
  const [serverSourceFilename, setServerSourceFilename] = useState<string | null>(null);
  const [hasServerSource, setHasServerSource] = useState(false);
  const [fields, setFields] = useState<string[]>([]);
  const [initialRules, setInitialRules] = useState<ValidationFieldRule[]>([]);
  const [rules, setRules] = useState<ValidationFieldRule[]>([]);
  const [fieldsVersion, setFieldsVersion] = useState(0);
  const [saving, setSaving] = useState(false);
  const [running, setRunning] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [suggesting, setSuggesting] = useState(false);
  const [aiWarning, setAiWarning] = useState<string | null>(null);

  useEffect(() => {
    if (!editRunId) return;

    let cancelled = false;
    setLoadingDraft(true);
    setError(null);

    fetchValidationRun(editRunId)
      .then((detail) => {
        if (cancelled) return;

        if (!isEditableValidationStatus(detail.status)) {
          router.replace(`/validation_result/${editRunId}`);
          return;
        }

        const loadedRules = detail.fields.map(apiFieldToRule);
        setRunId(detail.id);
        setProjectId(detail.project_id);
        setRunName(detail.name);
        setServerSourceFilename(detail.source_filename);
        setHasServerSource(detail.has_source_file);
        setFields(detail.fields.map((field) => field.field_name));
        setInitialRules(loadedRules);
        setRules(loadedRules);
      })
      .catch((err) => {
        if (!cancelled) {
          setError(getApiErrorMessage(err, "Could not load validation draft"));
        }
      })
      .finally(() => {
        if (!cancelled) setLoadingDraft(false);
      });

    return () => {
      cancelled = true;
    };
  }, [editRunId, router]);

  const handleFileSelected = useCallback((file: File, extractedFields: string[]) => {
    setSourceFile(file);
    setFields(extractedFields);
    setInitialRules([]);
    setFieldsVersion((current) => current + 1);
    setError(null);
    setSuccessMessage(null);
    setAiWarning(null);
  }, []);

  const handleRulesChange = useCallback((rows: ValidationFieldRule[]) => {
    setRules(rows);
  }, []);

  const activeProjectId = isEditMode ? projectId : project?.id ?? null;
  const sourceReady =
    fields.length > 0 && (Boolean(sourceFile) || hasServerSource);
  const nameLocked = Boolean(sourceFile) || hasServerSource || isEditMode;
  const busy = saving || running || loadingDraft || suggesting;
  const canSaveDraft = sourceReady && runName.trim().length > 0 && !busy;
  const canApplyAi = fields.length > 0 && !busy;

  async function handleApplyAi() {
    if (!canApplyAi) return;

    setSuggesting(true);
    setError(null);
    setAiWarning(null);
    setSuccessMessage(null);

    try {
      let samplesByField: Record<string, string[]> = {};
      if (sourceFile) {
        try {
          samplesByField = await parseSourceColumnSamples(sourceFile);
        } catch {
          samplesByField = {};
        }
      }
      const payload = fields.map((field_name) => ({
        field_name,
        samples: samplesByField[field_name] ?? [],
      }));
      const result = await suggestValidationRules(payload);
      const merged = mergeSuggestedRules(rules, result.suggestions);
      setRules(merged);
      setInitialRules(merged);
      setFieldsVersion((current) => current + 1);
      if (result.warning) {
        setAiWarning(result.warning);
      }
      if (result.suggestions.length === 0) {
        setAiWarning(
          result.warning ||
            "No additional rules suggested for these columns. You can still configure them manually.",
        );
      }
    } catch (err) {
      setError(getApiErrorMessage(err, "Could not apply AI rule suggestions"));
    } finally {
      setSuggesting(false);
    }
  }

  async function handleSaveDraft() {
    if (!activeProjectId || !sourceReady) return;

    setSaving(true);
    setError(null);
    setSuccessMessage(null);

    try {
      if (runId) {
        await updateValidationDraft(runId, rules, sourceFile);
      } else if (sourceFile) {
        const id = await persistValidationRun(activeProjectId, runName, rules, {
          file: sourceFile,
        });
        setRunId(id);
      } else {
        return;
      }

      setHasServerSource(true);
      if (sourceFile) {
        setServerSourceFilename(sourceFile.name);
        setSourceFile(null);
      }
      setSuccessMessage("Draft saved. You can continue configuring rules or run validation.");
    } catch (err) {
      setError(getApiErrorMessage(err, "Failed to save draft"));
    } finally {
      setSaving(false);
    }
  }

  async function handleRunValidation() {
    if (!activeProjectId || !sourceReady) return;

    setRunning(true);
    setError(null);
    setSuccessMessage(null);

    try {
      let id = runId;
      if (id) {
        await updateValidationDraft(id, rules, sourceFile);
      } else if (sourceFile) {
        id = await persistValidationRun(activeProjectId, runName, rules, {
          file: sourceFile,
        });
        setRunId(id);
      } else {
        return;
      }

      await executeValidationRun(id);
      router.push(`/validation_result/${id}`);
    } catch (err) {
      setError(getApiErrorMessage(err, "Validation run failed"));
      setRunning(false);
    }
  }

  const introCopy = isEditMode
    ? "Edit this saved draft, replace the source file if needed, then save or run validation."
    : "Name this run, configure validation logic, and stage your source file. Nothing is saved until you choose Save Draft or Run Validation.";

  if (isEditMode && loadingDraft) {
    return (
      <div className="mx-auto max-w-[1200px] px-4 py-6 md:px-8">
        <p className="text-sm text-on-surface-variant">Loading draft...</p>
      </div>
    );
  }

  if (isEditMode && error && !runName) {
    return (
      <div className="mx-auto max-w-[1200px] px-4 py-6 md:px-8">
        <p className="text-sm text-error">{error}</p>
        <Link href="/validation" className="mt-2 inline-block text-sm font-semibold text-primary hover:underline">
          Back to validations
        </Link>
      </div>
    );
  }

  return (
    <div className="flex min-h-[calc(100vh-4rem)] flex-col">
      <div className="flex-1 overflow-y-auto bg-background pb-28">
        <div className="mx-auto max-w-[1200px] px-4 py-6 md:px-8">
          <div className="mb-6">
            <h2 className="mb-2 text-[32px] font-semibold leading-10 tracking-[-0.01em] text-on-surface">
              Data Validation Rules
            </h2>
            <p className="text-base leading-6 text-on-surface-variant">{introCopy}</p>
          </div>

          {!isEditMode && (projectLoading || !project) ? (
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
                  {nameLocked ? " Locked while a source file is attached." : null}
                </p>
              </div>

              <SourceUploadZone
                runName={runName}
                existingFileName={serverSourceFilename}
                onFileSelected={handleFileSelected}
              />
              <div className="mt-6">
                <ValidationRulesTable
                  fields={fields}
                  initialRules={initialRules}
                  fieldsVersion={fieldsVersion}
                  onRulesChange={handleRulesChange}
                  onApplyAi={handleApplyAi}
                  suggesting={suggesting}
                  aiWarning={aiWarning}
                  canApplyAi={canApplyAi}
                />
              </div>
            </>
          )}

          {successMessage && (
            <p className="mt-4 text-sm text-success">{successMessage}</p>
          )}
          {error && <p className="mt-4 text-sm text-error">{error}</p>}
        </div>
      </div>

      <div className="sticky bottom-0 z-30 flex flex-col gap-3 border-t border-outline-variant bg-surface/90 px-4 py-4 shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.05)] backdrop-blur-md sm:flex-row sm:items-center sm:justify-between md:px-6">
        <div className="text-[13px] leading-[18px] text-on-surface-variant">
          {sourceReady ? (
            <>
              <span className="font-semibold text-primary">Source File</span>{" "}
              {sourceFile ? "staged locally" : "saved on server"}
              {runName.trim() ? (
                <>
                  {" "}
                  · <span className="font-semibold text-on-surface">{runName.trim()}</span>
                </>
              ) : null}
              {runId && !sourceFile ? (
                <>
                  {" "}
                  · <span className="font-semibold text-success">Draft saved</span>
                </>
              ) : null}
            </>
          ) : runName.trim() ? (
            "Select a source file to begin validation"
          ) : (
            "Enter a unique run name, then select a source file"
          )}
        </div>
        <div className="flex flex-wrap gap-3">
          <button
            type="button"
            onClick={handleSaveDraft}
            disabled={!canSaveDraft}
            className="rounded-lg border border-outline-variant bg-white px-6 py-2.5 text-xs font-semibold uppercase tracking-[0.02em] text-on-surface shadow-sm transition-colors hover:bg-surface-container-low disabled:opacity-50"
          >
            {saving ? "Saving..." : "Save Draft"}
          </button>
          <button
            type="button"
            onClick={handleRunValidation}
            disabled={!sourceReady || busy}
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
