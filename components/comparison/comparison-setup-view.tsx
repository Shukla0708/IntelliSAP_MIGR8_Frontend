"use client";

import { useRouter } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import { TextField } from "@/components/ui/text-field";
import { ReconciliationUploadPanel } from "@/components/comparison/reconciliation-upload-panel";
import { PlayArrowIcon } from "@/components/ui/icons";
import { RECONCILIATION_UPLOAD_CARDS } from "@/data/comparison";
import { getApiErrorMessage } from "@/lib/axios";
import {
  createComparisonRun,
  executeComparisonRun,
  uploadComparisonFiles,
} from "@/lib/comparison-api";
import { listMappingRuns } from "@/lib/mapping-api";
import { parseSourceHeaders } from "@/lib/parse-source-headers";
import { useDefaultProject } from "@/lib/use-default-project";

export function ComparisonSetupView() {
  const router = useRouter();
  const { project, loading: projectLoading } = useDefaultProject();
  const [runName, setRunName] = useState("");
  const [hasFieldMapping, setHasFieldMapping] = useState(false);
  const [mappingId, setMappingId] = useState("");
  const [mappings, setMappings] = useState<
    Array<{ mappingRunId: string; mappingName: string | null; status: string }>
  >([]);
  const [preloadFile, setPreloadFile] = useState<File | null>(null);
  const [postloadFile, setPostloadFile] = useState<File | null>(null);
  const [sharedHeaders, setSharedHeaders] = useState<string[]>([]);
  const [joinKeys, setJoinKeys] = useState<string[]>([]);
  const [busy, setBusy] = useState(false);
  const [uploadRatio, setUploadRatio] = useState<number | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!project?.id || !hasFieldMapping) return;
    listMappingRuns(project.id)
      .then((rows) => setMappings(rows.filter((row) => row.status === "completed")))
      .catch(() => setMappings([]));
  }, [project?.id, hasFieldMapping]);

  const canRun = useMemo(() => {
    if (!project?.id || !runName.trim() || !preloadFile || !postloadFile || busy) {
      return false;
    }
    if (hasFieldMapping) return Boolean(mappingId);
    return joinKeys.length > 0;
  }, [
    busy,
    hasFieldMapping,
    joinKeys.length,
    mappingId,
    postloadFile,
    preloadFile,
    project?.id,
    runName,
  ]);

  async function handleRunReconciliation() {
    if (!project?.id || !preloadFile || !postloadFile) return;
    if (!hasFieldMapping && joinKeys.length === 0) {
      setError("Select at least one join key that exists in both files.");
      return;
    }
    setBusy(true);
    setError(null);
    try {
      const id = await createComparisonRun(project.id, runName, {
        mappingId: hasFieldMapping ? mappingId : null,
        joinKeys: hasFieldMapping ? [] : joinKeys,
      });
      const uploaded = await uploadComparisonFiles(id, preloadFile, postloadFile, {
        mappingId: hasFieldMapping ? mappingId : null,
        joinKeys: hasFieldMapping ? [] : joinKeys,
        onProgress: setUploadRatio,
      });
      const keys = hasFieldMapping
        ? []
        : joinKeys.length
          ? joinKeys
          : uploaded.shared_headers.slice(0, 1);
      await executeComparisonRun(id, {
        mappingId: hasFieldMapping ? mappingId : null,
        joinKeys: hasFieldMapping ? [] : keys,
      });
      router.push(`/compare/${id}`);
    } catch (err) {
      setError(getApiErrorMessage(err, "Comparison run failed"));
      setBusy(false);
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
            automated reconciliation process.
          </p>
        </div>

        <Button
          type="button"
          size="md"
          onClick={handleRunReconciliation}
          disabled={!canRun}
          className="h-auto shrink-0 gap-2 self-start px-4 py-2 text-xs font-semibold uppercase tracking-[0.02em] shadow-sm hover:shadow-md lg:self-auto"
        >
          <PlayArrowIcon className="h-4 w-4" />
          {busy ? "Starting..." : "Run Reconciliation"}
        </Button>
      </div>

      {projectLoading || !project ? (
        <p className="text-sm text-on-surface-variant">Loading project...</p>
      ) : (
        <>
          <div className="mb-6 max-w-xl">
            <TextField
              id="comparison-run-name"
              name="comparisonRunName"
              label="Comparison Run Name"
              placeholder="e.g. Customer master — postload vs preload"
              value={runName}
              onChange={(event) => setRunName(event.target.value)}
              required
              maxLength={120}
              autoComplete="off"
            />
          </div>

          <div className="mb-6 grid grid-cols-1 gap-5 lg:mb-8 lg:grid-cols-2 lg:gap-5">
            {RECONCILIATION_UPLOAD_CARDS.map((card) => (
              <ReconciliationUploadPanel
                key={card.id}
                card={card}
                showMetadata={hasFieldMapping}
                fileName={
                  card.id === "preload" ? preloadFile?.name : postloadFile?.name
                }
                onFileSelected={async (file) => {
                  if (card.id === "preload") setPreloadFile(file);
                  else setPostloadFile(file);
                  try {
                    const nextPreload = card.id === "preload" ? file : preloadFile;
                    const nextPostload = card.id === "postload" ? file : postloadFile;
                    if (nextPreload && nextPostload) {
                      const [preHeaders, postHeaders] = await Promise.all([
                        parseSourceHeaders(nextPreload),
                        parseSourceHeaders(nextPostload),
                      ]);
                      const postSet = new Set(postHeaders.map((h) => h.toLowerCase()));
                      const shared = preHeaders.filter((h) => postSet.has(h.toLowerCase()));
                      setSharedHeaders(shared);
                      setJoinKeys(shared.slice(0, 1));
                    }
                  } catch {
                    setSharedHeaders([]);
                  }
                }}
              />
            ))}
          </div>

          <div className="mb-4 flex items-center gap-3 px-1">
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
            <div className="mb-6 max-w-xl">
              <label className="mb-1 block text-xs font-semibold uppercase tracking-[0.02em] text-on-surface">
                Confirmed mapping
              </label>
              <select
                value={mappingId}
                onChange={(event) => setMappingId(event.target.value)}
                className="h-11 w-full rounded border border-outline-variant bg-surface-bright px-3 text-sm text-on-surface"
              >
                <option value="">Select a completed mapping run</option>
                {mappings.map((row) => (
                  <option key={row.mappingRunId} value={row.mappingRunId}>
                    {row.mappingName || row.mappingRunId}
                  </option>
                ))}
              </select>
            </div>
          ) : sharedHeaders.length > 0 ? (
            <div className="mb-6">
              <p className="mb-2 text-sm font-semibold text-on-surface">
                Join keys (must exist in both files)
              </p>
              <div className="flex flex-wrap gap-3">
                {sharedHeaders.map((header) => {
                  const checked = joinKeys.includes(header);
                  return (
                    <label
                      key={header}
                      className="inline-flex items-center gap-2 rounded border border-outline-variant px-3 py-1.5 text-sm"
                    >
                      <input
                        type="checkbox"
                        checked={checked}
                        onChange={() =>
                          setJoinKeys((current) =>
                            checked
                              ? current.filter((item) => item !== header)
                              : [...current, header],
                          )
                        }
                      />
                      {header}
                    </label>
                  );
                })}
              </div>
            </div>
          ) : (
            <p className="mb-6 text-sm text-on-surface-variant">
              Without a field mapping, columns with the same name in both files
              are used as join keys. Pick them after the first upload if needed.
            </p>
          )}
        </>
      )}

      {uploadRatio != null && busy ? (
        <p className="text-xs text-on-surface-variant">
          Uploading {Math.round(uploadRatio * 100)}%
        </p>
      ) : null}
      {error ? <p className="mt-4 text-sm text-error">{error}</p> : null}
    </div>
  );
}
