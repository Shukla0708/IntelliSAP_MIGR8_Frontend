"use client";

import { useMemo, useState } from "react";
import { ProgressBar } from "@/components/ui/progress";
import {
  CheckCircleIcon,
  DescriptionIcon,
  DownloadIcon,
  ErrorIcon,
  FilterListIcon,
  ListAltIcon,
  SearchIcon,
  TrendingUpIcon,
  WarningIcon,
} from "@/components/ui/icons";
import apiClient from "@/lib/axios";
import type {
  ExceptionSeverity,
  ValidationException,
  ValidationResultSummary,
  DuplicateGroupsPayload,
} from "@/data/validation-results";

type ValidationResultsViewProps = {
  result: ValidationResultSummary;
};

function HealthScoreCard({
  score,
  processedRecords,
}: {
  score: number;
  processedRecords: number;
}) {
  const whole = Math.floor(score);
  const fraction = (score % 1).toFixed(1).slice(1);

  return (
    <div className="relative col-span-12 flex h-auto flex-col items-center justify-center overflow-hidden rounded-xl border border-outline-variant bg-surface p-6 shadow-ambient lg:col-span-4 lg:h-64">
      <div className="absolute inset-0 bg-gradient-to-br from-surface to-surface-container-low opacity-50" />
      <div className="relative z-10 flex flex-col items-center">
        <h3 className="mb-2 text-xl font-semibold leading-7 text-on-surface">
          Data Health Score
        </h3>
        <div className="relative mt-2 flex h-32 w-32 items-center justify-center">
          <svg
            className="absolute inset-0 h-full w-full -rotate-90 transform"
            viewBox="0 0 36 36"
            aria-hidden="true"
          >
            <path
              className="text-surface-container-highest"
              d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
              fill="none"
              stroke="currentColor"
              strokeWidth="3"
            />
            <path
              className="text-primary"
              d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
              fill="none"
              stroke="currentColor"
              strokeDasharray={`${score}, 100`}
              strokeWidth="3"
            />
          </svg>
          <span className="text-[40px] font-bold leading-none tracking-[-0.02em] text-primary sm:text-[48px]">
            {whole}
            <span className="text-2xl font-semibold">{fraction}%</span>
          </span>
        </div>
        <p className="mt-4 text-center text-[13px] leading-[18px] text-on-surface-variant">
          Score calculated across {processedRecords.toLocaleString()} processed
          records.
        </p>
      </div>
    </div>
  );
}

function ErrorsByTypeChart({
  items,
}: {
  items: ValidationResultSummary["errorsByType"];
}) {
  const radius = 36;
  const circumference = 2 * Math.PI * radius;
  let offset = 0;

  return (
    <div className="col-span-12 rounded-xl border border-outline-variant bg-surface p-6 shadow-ambient lg:col-span-6">
      <h3 className="mb-4 text-xl font-semibold leading-7 text-on-surface">
        Errors by Type
      </h3>
      <div className="flex h-48 flex-col items-center justify-center gap-4 sm:flex-row">
        <svg viewBox="0 0 100 100" className="h-36 w-36" aria-hidden="true">
          {items.map((item) => {
            const length = (item.value / 100) * circumference;
            const segment = (
              <circle
                key={item.label}
                cx="50"
                cy="50"
                r={radius}
                fill="none"
                stroke={item.color}
                strokeWidth="14"
                strokeDasharray={`${length} ${circumference - length}`}
                strokeDashoffset={-offset}
                transform="rotate(-90 50 50)"
              />
            );
            offset += length;
            return segment;
          })}
          <circle cx="50" cy="50" r="22" fill="white" />
        </svg>
        <ul className="space-y-2 text-[13px] text-on-surface-variant">
          {items.map((item) => (
            <li key={item.label} className="flex items-center gap-2">
              <span
                className="h-2.5 w-2.5 rounded-full"
                style={{ backgroundColor: item.color }}
              />
              {item.label} ({item.value}%)
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}

function ErrorsByFieldChart({
  items,
}: {
  items: ValidationResultSummary["errorsByField"];
}) {
  const max = Math.max(...items.map((item) => item.count), 1);

  return (
    <div className="col-span-12 rounded-xl border border-outline-variant bg-surface p-6 shadow-ambient lg:col-span-6">
      <h3 className="mb-4 text-xl font-semibold leading-7 text-on-surface">
        Errors by Field
      </h3>
      <div className="flex h-48 flex-col justify-center gap-3">
        {items.map((item) => (
          <div key={item.field}>
            <div className="mb-1 flex justify-between font-mono text-xs text-on-surface-variant">
              <span>{item.field}</span>
              <span>{item.count}</span>
            </div>
            <ProgressBar value={(item.count / max) * 100} />
          </div>
        ))}
      </div>
    </div>
  );
}

function SeverityBadge({ severity }: { severity: ExceptionSeverity }) {
  if (severity === "error") {
    return (
      <span className="inline-flex items-center gap-1 rounded bg-error-container px-2 py-1 text-[10px] font-bold tracking-wider text-on-error-container uppercase">
        <span className="h-1.5 w-1.5 rounded-full bg-error" /> Error
      </span>
    );
  }

  return (
    <span className="inline-flex items-center gap-1 rounded bg-tertiary-container/20 px-2 py-1 text-[10px] font-bold tracking-wider text-tertiary uppercase">
      <span className="h-1.5 w-1.5 rounded-full bg-tertiary" /> Warning
    </span>
  );
}

export function ValidationResultsView({ result }: ValidationResultsViewProps) {
  const [query, setQuery] = useState("");
  const [downloading, setDownloading] = useState(false);

  const filteredExceptions = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return result.exceptions;
    return result.exceptions.filter((row) =>
      [row.rowId, row.field, row.actualValue, row.expected, row.errorType]
        .join(" ")
        .toLowerCase()
        .includes(q),
    );
  }, [query, result.exceptions]);

  // Fetches a presigned S3 URL for the annotated workbook (same format as the
  // uploaded file, failed cells highlighted red, extra reason column at the end)
  // and opens it directly — no file passes through our own server.
  async function handleDownload() {
    setDownloading(true);
    try {
      const { data } = await apiClient.get<{ url: string }>(
        `/api/runs/${result.id}/download-url`,
      );
      window.open(data.url, "_blank");
    } catch (err) {
      console.error("Download failed", err);
    } finally {
      setDownloading(false);
    }
  }

  return (
    <div className="mx-auto w-full max-w-[1200px]">
      <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="mb-1 text-xs font-semibold uppercase tracking-[0.02em] leading-4 text-on-surface-variant">
            {result.projectLabel}
          </p>
          <h2 className="text-[32px] font-semibold leading-10 tracking-[-0.01em] text-on-background">
            Validation Results
          </h2>
          <p className="mt-1 text-sm text-on-surface-variant">{result.runName}</p>
        </div>
        <button
          type="button"
          onClick={handleDownload}
          disabled={downloading}
          className="inline-flex items-center justify-center gap-2 rounded-lg bg-primary px-4 py-2 text-xs font-semibold uppercase tracking-[0.02em] text-on-primary shadow-ambient transition-colors hover:bg-surface-tint disabled:opacity-60"
        >
          <DownloadIcon className="h-[18px] w-[18px]" />
          {downloading ? "Preparing..." : "Download Exception Report"}
        </button>
      </div>

      <div className="mb-8 grid grid-cols-12 gap-gutter">
        <HealthScoreCard
          score={result.healthScore}
          processedRecords={result.processedRecords}
        />

        <div className="col-span-12 grid grid-cols-1 gap-gutter sm:grid-cols-2 lg:col-span-8 lg:h-64">
          <div className="flex flex-col justify-between rounded-xl border border-outline-variant bg-surface p-4 shadow-ambient">
            <div className="flex items-start justify-between">
              <span className="text-xs font-semibold tracking-wide text-on-surface-variant uppercase">
                Valid Rows
              </span>
              <CheckCircleIcon className="h-5 w-5 text-outline" />
            </div>
            <div>
              <div className="text-[32px] font-semibold leading-10 text-on-background">
                {result.validRows.toLocaleString()}
              </div>
              <div className="mt-1 flex items-center gap-1 text-[13px] text-primary">
                <TrendingUpIcon className="h-3.5 w-3.5" />
                {result.validRowsDelta}
              </div>
            </div>
          </div>

          <div className="flex flex-col justify-between rounded-xl border border-outline-variant bg-surface p-4 shadow-ambient">
            <div className="flex items-start justify-between">
              <span className="text-xs font-semibold tracking-wide text-on-surface-variant uppercase">
                Invalid Rows
              </span>
              <WarningIcon className="h-5 w-5 text-outline" />
            </div>
            <div>
              <div className="text-[32px] font-semibold leading-10 text-on-background">
                {result.invalidRows.toLocaleString()}
              </div>
              <div className="mt-1 text-[13px] text-on-surface-variant">
                {result.invalidRowsShare}
              </div>
            </div>
          </div>

          <div className="flex flex-col justify-between rounded-xl border border-outline-variant bg-surface p-4 shadow-ambient">
            <div className="flex items-start justify-between">
              <span className="text-xs font-semibold tracking-wide text-on-surface-variant uppercase">
                Total Errors
              </span>
              <ListAltIcon className="h-5 w-5 text-outline" />
            </div>
            <div>
              <div className="text-[32px] font-semibold leading-10 text-on-background">
                {result.totalErrors.toLocaleString()}
              </div>
              <div className="mt-1 text-[13px] text-on-surface-variant">
                {result.avgErrorsPerInvalid}
              </div>
            </div>
          </div>

          <div className="relative flex flex-col justify-between overflow-hidden rounded-xl border border-error bg-surface p-4 shadow-ambient">
            <div className="absolute top-0 right-0 -mt-8 -mr-8 h-16 w-16 rounded-bl-full bg-error-container opacity-50" />
            <div className="relative z-10 flex items-start justify-between">
              <span className="text-xs font-semibold tracking-wide text-error uppercase">
                Critical Errors
              </span>
              <ErrorIcon className="h-5 w-5 text-error" />
            </div>
            <div className="relative z-10">
              <div className="text-[32px] font-semibold leading-10 text-error">
                {result.criticalErrors.toLocaleString()}
              </div>
              <div className="mt-1 text-[13px] font-semibold text-error">
                Requires immediate action
              </div>
            </div>
          </div>
        </div>

        <ErrorsByTypeChart items={result.errorsByType} />
        <ErrorsByFieldChart items={result.errorsByField} />
      </div>

      <DuplicateGroupsPanel groups={result.duplicateGroups} />

      <div className="mb-8 overflow-hidden rounded-xl border border-outline-variant bg-surface shadow-ambient">
        <div className="flex flex-col gap-3 border-b border-outline-variant p-4 sm:flex-row sm:items-center sm:justify-between">
          <h3 className="text-xl font-semibold leading-7 text-on-surface">
            Exception Report
          </h3>
          <div className="flex gap-2">
            <div className="relative">
              <SearchIcon className="pointer-events-none absolute top-1/2 left-2 h-[18px] w-[18px] -translate-y-1/2 text-outline" />
              <input
                type="search"
                value={query}
                onChange={(event) => setQuery(event.target.value)}
                placeholder="Search exceptions..."
                className="rounded-md border border-outline-variant bg-surface py-1.5 pr-3 pl-9 text-[13px] text-on-surface outline-none focus:border-primary focus:ring-2 focus:ring-primary/20"
              />
            </div>
            <button
              type="button"
              className="rounded-md border border-outline-variant p-1.5 text-on-surface-variant transition-colors hover:bg-surface-container-high"
              aria-label="Filter exceptions"
            >
              <FilterListIcon className="h-[18px] w-[18px]" />
            </button>
          </div>
        </div>

        <div className="max-h-[400px] overflow-auto">
          <table className="w-full min-w-[900px] border-collapse text-left">
            <thead className="sticky top-0 z-10">
              <tr className="border-b border-outline-variant bg-surface-container-low">
                {[
                  "Severity",
                  "Row ID",
                  "Field",
                  "Actual Value",
                  "Expected",
                  "Error Type",
                ].map((header) => (
                  <th
                    key={header}
                    className="px-4 py-2 text-xs font-semibold text-on-surface-variant"
                  >
                    {header}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-outline-variant text-[13px] leading-[18px] text-on-background">
              {filteredExceptions.map((row) => (
                <ExceptionRow key={row.id} row={row} />
              ))}
            </tbody>
          </table>
        </div>

        <div className="flex flex-col gap-3 border-t border-outline-variant bg-surface-container-lowest p-2 sm:flex-row sm:items-center sm:justify-between sm:p-3">
          <span className="text-[13px] text-on-surface-variant">
            Showing top {filteredExceptions.length} identified exceptions
          </span>
          <button
            type="button"
            onClick={handleDownload}
            disabled={downloading}
            className="inline-flex items-center gap-1 rounded-lg border border-outline-variant px-4 py-2 text-xs font-semibold uppercase tracking-[0.02em] text-on-surface transition-colors hover:bg-surface-container-high disabled:opacity-60"
          >
            <DescriptionIcon className="h-[18px] w-[18px]" />
            Download Full Report (.xlsx)
          </button>
        </div>
      </div>
    </div>
  );
}

function DuplicateGroupsPanel({
  groups,
}: {
  groups?: DuplicateGroupsPayload | null;
}) {
  if (!groups) return null;
  if (groups.skippedReason && groups.groupCount === 0) {
    return (
      <div className="mb-8 rounded-xl border border-outline-variant bg-surface p-6 shadow-ambient">
        <h3 className="text-xl font-semibold leading-7 text-on-surface">
          Possible duplicates before load
        </h3>
        <p className="mt-2 text-sm text-on-surface-variant">{groups.skippedReason}</p>
      </div>
    );
  }
  if (groups.groupCount === 0) {
    return (
      <div className="mb-8 rounded-xl border border-outline-variant bg-surface p-6 shadow-ambient">
        <h3 className="text-xl font-semibold leading-7 text-on-surface">
          Possible duplicates before load
        </h3>
        <p className="mt-2 text-sm text-on-surface-variant">
          No likely KNA1 duplicates on name, city, or tax id
          {groups.scannedRows ? ` in ${groups.scannedRows.toLocaleString()} scanned rows` : ""}.
        </p>
      </div>
    );
  }

  return (
    <div className="mb-8 overflow-hidden rounded-xl border border-outline-variant bg-surface shadow-ambient">
      <div className="border-b border-outline-variant p-4">
        <h3 className="text-xl font-semibold leading-7 text-on-surface">
          Possible duplicates before load
        </h3>
        <p className="mt-1 text-sm text-on-surface-variant">
          These {groups.groupCount} groups look like they would create duplicate
          customers in KNA1.
        </p>
      </div>
      <div className="divide-y divide-outline-variant">
        {groups.groups.map((group, index) => (
          <div key={`${group.reason}-${index}`} className="px-4 py-3">
            <div className="mb-2 flex flex-wrap items-center gap-2">
              <span
                className={`rounded px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider ${
                  group.confidence === "high"
                    ? "bg-error-container text-on-error-container"
                    : "bg-tertiary-container/20 text-tertiary"
                }`}
              >
                {group.confidence}
              </span>
              <span className="text-xs text-on-surface-variant">{group.reason}</span>
            </div>
            <ul className="space-y-1 font-mono text-xs text-on-surface">
              {group.rows.map((row) => (
                <li key={`${row.row}-${row.name}`}>
                  Row {row.row}: {row.name || "—"}
                  {row.city ? ` · ${row.city}` : ""}
                  {row.taxId ? ` · ${row.taxId}` : ""}
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>
    </div>
  );
}

function ExceptionRow({ row }: { row: ValidationException }) {
  return (
    <tr className="transition-colors hover:bg-[#F0F7FF]">
      <td className="px-4 py-2">
        <SeverityBadge severity={row.severity} />
      </td>
      <td className="px-4 py-2 font-mono text-xs font-medium">{row.rowId}</td>
      <td className="px-4 py-2 font-mono text-xs font-medium">{row.field}</td>
      <td
        className={`px-4 py-2 ${
          row.severity === "error" ? "text-error" : "text-on-background"
        }`}
      >
        {row.actualValue}
      </td>
      <td className="px-4 py-2 text-on-surface-variant italic">{row.expected}</td>
      <td className="px-4 py-2">{row.errorType}</td>
    </tr>
  );
}
