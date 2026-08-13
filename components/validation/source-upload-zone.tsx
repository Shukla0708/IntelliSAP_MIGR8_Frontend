"use client";

import { useState, type DragEvent } from "react";
import { getApiErrorMessage } from "@/lib/axios";
import { parseSourceHeaders } from "@/lib/parse-source-headers";

type SourceUploadZoneProps = {
  /** Trimmed run name required before staging a file */
  runName: string;
  /** Saved filename when editing an existing draft */
  existingFileName?: string | null;
  onFileSelected: (file: File, fields: string[]) => void;
};

export function SourceUploadZone({
  runName,
  existingFileName,
  onFileSelected,
}: SourceUploadZoneProps) {
  const [fileName, setFileName] = useState<string | null>(null);
  const [parsing, setParsing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [dragActive, setDragActive] = useState(false);

  const nameReady = runName.trim().length > 0;
  const displayFileName = fileName ?? existingFileName;

  async function applyFile(file: File | undefined) {
    if (!file) return;

    if (!runName.trim()) {
      setError("Enter a validation run name before selecting a file.");
      return;
    }

    setError(null);
    setFileName(file.name);
    setParsing(true);

    try {
      const fields = await parseSourceHeaders(file);
      onFileSelected(file, fields);
    } catch (err) {
      setError(getApiErrorMessage(err, "Could not read column headers from this file."));
      setFileName(null);
    } finally {
      setParsing(false);
    }
  }

  function handleDrop(event: DragEvent<HTMLDivElement>) {
    event.preventDefault();
    setDragActive(false);
    if (!nameReady) {
      setError("Enter a validation run name before selecting a file.");
      return;
    }
    applyFile(event.dataTransfer.files?.[0]);
  }

  return (
    <div
      onDragOver={(e) => {
        e.preventDefault();
        if (nameReady) setDragActive(true);
      }}
      onDragLeave={() => setDragActive(false)}
      onDrop={handleDrop}
      className={`flex flex-col items-center justify-center gap-3 rounded-card border-2 border-dashed p-10 text-center transition-colors ${
        !nameReady
          ? "border-outline-variant opacity-60"
          : dragActive
            ? "border-primary bg-primary-container/5"
            : "border-outline-variant"
      }`}
    >
      {existingFileName && !fileName ? (
        <p className="text-sm text-on-surface-variant">
          Current file on server:{" "}
          <span className="font-mono text-on-surface">{existingFileName}</span>
        </p>
      ) : null}

      <p className="text-sm text-on-surface-variant">
        {nameReady
          ? existingFileName
            ? "Select a new file below to replace the saved source file, or"
            : "Drag and drop your source Excel/CSV file here, or"
          : "Enter a unique validation run name above, then select your source file."}
      </p>
      <label
        className={`rounded bg-primary-container px-4 py-2 text-sm font-semibold text-on-primary ${
          nameReady && !parsing
            ? "cursor-pointer hover:bg-primary"
            : "pointer-events-none cursor-not-allowed opacity-50"
        }`}
      >
        {existingFileName ? "Replace File" : "Browse Files"}
        <input
          type="file"
          accept=".xlsx,.xls,.csv"
          className="hidden"
          disabled={!nameReady || parsing}
          onChange={(e) => applyFile(e.target.files?.[0])}
        />
      </label>

      {parsing && (
        <p className="text-xs text-on-surface-variant">Reading column headers...</p>
      )}
      {displayFileName && !parsing && !error ? (
        <>
          <p className="font-mono text-xs text-on-surface-variant">{displayFileName}</p>
          <p className="text-xs text-on-surface-variant">
            {fileName
              ? "New file staged locally. Save or run when you are ready."
              : "Saved on server. Replace the file above or run validation."}
          </p>
        </>
      ) : null}
      {error && <p className="text-xs text-error">{error}</p>}
    </div>
  );
}
