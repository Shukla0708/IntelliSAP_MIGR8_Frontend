"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { ReconciliationUploadPanel } from "@/components/comparison/reconciliation-upload-panel";
import { Button } from "@/components/ui/button";
import { PlayArrowIcon } from "@/components/ui/icons";
import { RECONCILIATION_UPLOAD_CARDS } from "@/data/comparison";
import { getApiErrorMessage } from "@/lib/axios";
import { fetchMappingOptions, runComparison, type MappingOption } from "@/lib/comparison-api";
import { useDefaultProject } from "@/lib/use-default-project";

export function ComparisonSetupView() {
  const router = useRouter();
  const { project, loading: projectLoading } = useDefaultProject();

  const [runName, setRunName] = useState("");
  const [preloadFile, setPreloadFile] = useState<File | null>(null);
  const [postloadFile, setPostloadFile] = useState<File | null>(null);
  const [hasFieldMapping, setHasFieldMapping] = useState(false);
  const [mappings, setMappings] = useState<MappingOption[]>([]);
  const [mappingId, setMappingId] = useState("");
  const [running, setRunning] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const projectId = project?.id ?? null;

  useEffect(() => {
    if (!hasFieldMapping || !projectId) return;

    let cancelled = false;
    fetchMappingOptions(projectId)
      .then((options) => {
        if (cancelled) return;
        setMappings(options);
        setMappingId((current) => current || options[0]?.id || "");
      })
      .catch(() => {
        if (!cancelled) setMappings([]);
      });

    return () => {
      cancelled = true;
    };
  }, [hasFieldMapping, projectId]);

  async function handleRunReconciliation() {
    if (!projectId) {
      setError("Pick a project before running a reconciliation.");
      return;
    }
    if (!runName.trim()) {
      setError("Give this reconciliation run a name.");
      return;
    }
    if (!preloadFile || !postloadFile) {
      setError("Upload both a preload and a postload file.");
      return;
    }

    setRunning(true);
    setError(null);
    try {
      const runId = await runComparison({
        projectId,
        name: runName,
        preloadFile,
        postloadFile,
        mappingId: hasFieldMapping ? mappingId || null : null,
      });
      router.push(`/compare/${runId}`);
    } catch (err) {
      setError(getApiErrorMessage(err, "Reconciliation failed"));
      setRunning(false);
    }
  }

  return (
    <div className="mx-auto w-full max-w-[1440px] p-4 md:p-8">
      <div className="mb-6 flex flex-col gap-4 lg:mb-8 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <h2 className="mb-2 text-[32px] font-semibold leading-10 tracking-[-0.01em] text-on-surface">
            Preload vs Postload Reconciliation
          </h2>
          <p className="max-w-2xl text-base leading-6 text-on-surface-variant">
            Upload your source extraction and target load files to begin the
            automated reconciliation process
            {project ? ` for "${project.name}"` : ""}.
          </p>
        </div>

        <Button
          type="button"
          size="md"
          onClick={handleRunReconciliation}
          disabled={running || projectLoading}
          className="h-auto shrink-0 gap-2 self-start px-4 py-2 text-xs font-semibold uppercase tracking-[0.02em] shadow-sm hover:shadow-md disabled:opacity-60 lg:self-auto"
        >
          <PlayArrowIcon className="h-4 w-4" />
          {running ? "Reconciling…" : "Run Reconciliation"}
        </Button>
      </div>

      <div className="mb-6 max-w-xl">
        <label
          htmlFor="comparison-run-name"
          className="mb-2 block text-xs font-semibold uppercase tracking-[0.02em] text-on-surface-variant"
        >
          Run name <span className="text-error">*</span>
        </label>
        <input
          id="comparison-run-name"
          type="text"
          value={runName}
          onChange={(event) => setRunName(event.target.value)}
          maxLength={120}
          placeholder="Customer Master — postload vs preload"
          className="h-11 w-full rounded border border-outline-variant bg-surface-container-lowest px-3 text-sm text-on-surface outline-none focus:border-primary focus:ring-1 focus:ring-primary"
        />
      </div>

      <div className="mb-6 grid grid-cols-1 gap-5 lg:mb-8 lg:grid-cols-2 lg:gap-5">
        {RECONCILIATION_UPLOAD_CARDS.map((card) => (
          <ReconciliationUploadPanel
            key={card.id}
            card={card}
            file={card.id === "preload" ? preloadFile : postloadFile}
            onFileSelected={(file) =>
              card.id === "preload" ? setPreloadFile(file) : setPostloadFile(file)
            }
          />
        ))}
      </div>

      <div className="flex items-center gap-3 px-1">
        <input
          id="toggle-metadata"
          type="checkbox"
          checked={hasFieldMapping}
          onChange={(event) => setHasFieldMapping(event.target.checked)}
          className="h-5 w-5 cursor-pointer rounded border-outline-variant text-primary focus:ring-primary"
        />
        <label
          htmlFor="toggle-metadata"
          className="cursor-pointer select-none text-sm leading-5 text-on-surface"
        >
          Have Field Mapping?
        </label>
      </div>

      {hasFieldMapping ? (
        <div className="mt-4 max-w-xl px-1">
          {mappings.length === 0 ? (
            <p className="text-sm text-on-surface-variant">
              No confirmed field mappings in this project yet. Without one, columns
              that share a name in both files are compared.
            </p>
          ) : (
            <>
              <label
                htmlFor="comparison-mapping"
                className="mb-2 block text-xs font-semibold uppercase tracking-[0.02em] text-on-surface-variant"
              >
                Field mapping
              </label>
              <select
                id="comparison-mapping"
                value={mappingId}
                onChange={(event) => setMappingId(event.target.value)}
                className="h-11 w-full rounded border border-outline-variant bg-surface-container-lowest px-3 text-sm font-semibold text-on-surface outline-none focus:border-primary focus:ring-1 focus:ring-primary"
              >
                {mappings.map((mapping) => (
                  <option key={mapping.id} value={mapping.id}>
                    {mapping.name} — {mapping.confirmedFieldCount} fields,{" "}
                    {mapping.keyFieldCount} key
                  </option>
                ))}
              </select>
              <p className="mt-2 text-xs text-on-surface-variant">
                Rows are matched on every field the mapping marks as a key.
              </p>
            </>
          )}
        </div>
      ) : null}

      {error ? (
        <p className="mt-4 px-1 text-sm font-semibold text-error">{error}</p>
      ) : null}
    </div>
  );
}
