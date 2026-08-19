"use client";

import { useRef, useState, type ComponentType } from "react";
import { Button } from "@/components/ui/button";
import {
  CheckCircleIcon,
  DifferenceIcon,
  DownloadIcon,
  ErrorIcon,
  FilterListIcon,
  InfoIcon,
  WarningIcon,
} from "@/components/ui/icons";
import type {
  DiscrepancyStatus,
  ReconciliationDiscrepancy,
  ReconciliationReviewSummary,
} from "@/data/comparison-results";
import { getApiErrorMessage } from "@/lib/axios";
import { fetchComparisonDownloadUrl } from "@/lib/comparison-api";

type ReconciliationReviewViewProps = {
  review: ReconciliationReviewSummary;
};

function StatusIcon({ status }: { status: DiscrepancyStatus }) {
  if (status === "error") {
    return <ErrorIcon className="mx-auto h-4 w-4 text-error" />;
  }
  if (status === "info") {
    return <InfoIcon className="mx-auto h-4 w-4 text-surface-tint" />;
  }
  return <WarningIcon className="mx-auto h-4 w-4 text-tertiary-container" />;
}

function SummaryCard({
  label,
  value,
  hint,
  icon: Icon,
  accent,
}: {
  label: string;
  value: string;
  hint: string;
  icon: ComponentType<{ className?: string }>;
  accent?: "tertiary" | "error";
}) {
  return (
    <div className="relative overflow-hidden rounded-[20px] border border-outline-variant bg-surface p-4 shadow-sm transition-shadow hover:shadow-md">
      {accent ? (
        <div
          className={`absolute top-0 bottom-0 left-0 w-1 ${
            accent === "error" ? "bg-error" : "bg-tertiary-container"
          }`}
        />
      ) : null}
      <div className={`${accent ? "pl-2" : ""}`}>
        <div className="mb-4 flex items-start justify-between">
          <span className="text-xs font-semibold uppercase tracking-[0.02em] text-on-surface-variant">
            {label}
          </span>
          <Icon
            className={`h-5 w-5 ${
              accent === "error"
                ? "text-error"
                : accent === "tertiary"
                  ? "text-tertiary-container"
                  : "text-surface-tint"
            }`}
          />
        </div>
        <div className="text-2xl font-semibold leading-8 text-on-surface">
          {value}
        </div>
        <div
          className={`mt-1 text-[13px] leading-[18px] ${
            accent === "error"
              ? "text-error"
              : accent === "tertiary"
                ? "text-tertiary"
                : "text-surface-tint"
          }`}
        >
          {hint}
        </div>
      </div>
    </div>
  );
}

function DiscrepancyRow({ row }: { row: ReconciliationDiscrepancy }) {
  const postloadClasses =
    row.postloadHighlight === "error"
      ? "bg-error/10 font-bold text-error"
      : row.postloadHighlight === "tertiary"
        ? "bg-tertiary-container/10 font-bold text-tertiary"
        : "";

  return (
    <tr className="group border-b border-outline-variant/50 transition-colors hover:bg-primary/[0.04]">
      <td className="px-4 py-3 font-mono text-xs font-medium text-primary">
        {row.businessKey}
      </td>
      <td
        className={`px-4 py-3 font-mono text-xs font-medium ${
          row.fieldItalic ? "text-outline italic" : ""
        }`}
      >
        {row.field}
      </td>
      <td className="px-4 py-3 font-mono text-xs font-medium">
        {row.preloadValue}
      </td>
      <td className={`px-4 py-3 font-mono text-xs font-medium ${postloadClasses}`}>
        {row.postloadValue}
      </td>
      <td className="px-4 py-3">
        <span
          className={`rounded px-2 py-1 font-mono text-xs ${
            row.differenceType === "SEMANTIC_MATCH"
              ? "bg-primary/10 font-semibold text-primary"
              : "bg-surface-container text-on-surface-variant"
          }`}
        >
          {row.differenceType}
        </span>
      </td>
      <td className="px-4 py-3 text-center">
        <StatusIcon status={row.status} />
      </td>
      <td className="px-4 py-3 text-right">
        <button
          type="button"
          className="text-xs text-primary opacity-0 transition-opacity group-hover:opacity-100 hover:underline"
        >
          Investigate
        </button>
      </td>
    </tr>
  );
}

export function ReconciliationReviewView({
  review,
}: ReconciliationReviewViewProps) {
  const tableRef = useRef<HTMLDivElement>(null);
  const [downloadError, setDownloadError] = useState<string | null>(null);

  async function handleDownload() {
    setDownloadError(null);
    try {
      window.open(await fetchComparisonDownloadUrl(review.id));
    } catch (err) {
      setDownloadError(getApiErrorMessage(err, "Report is not ready yet"));
    }
  }

  function handleViewExceptions() {
    tableRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
  }

  return (
    <div className="mx-auto w-full max-w-[1440px] p-4 md:p-8">
      <div className="mb-6 flex flex-col gap-4 lg:mb-8 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <h2 className="mb-2 text-[32px] font-semibold leading-10 tracking-[-0.01em] text-on-surface">
            Preload vs Postload Reconciliation
          </h2>
          <p className="max-w-2xl text-base leading-6 text-on-surface-variant">
            Review structural and value discrepancies between source extraction
            and target load.
          </p>
          <p className="mt-1 text-sm text-on-surface-variant">{review.runName}</p>
        </div>

        <div className="flex flex-wrap gap-2">
          <Button
            type="button"
            variant="ghost"
            size="md"
            onClick={handleDownload}
            className="h-auto gap-2 px-4 py-2 text-xs font-semibold uppercase tracking-[0.02em]"
          >
            <DownloadIcon className="h-4 w-4" />
            Download Comparison Report
          </Button>
          <Button
            type="button"
            size="md"
            onClick={handleViewExceptions}
            className="h-auto gap-2 px-4 py-2 text-xs font-semibold uppercase tracking-[0.02em] shadow-sm hover:shadow-md"
          >
            <WarningIcon className="h-4 w-4" />
            View Exceptions
          </Button>
        </div>
      </div>

      {downloadError ? (
        <p className="mb-4 text-sm font-semibold text-error">{downloadError}</p>
      ) : null}

      <div className="mb-6 grid grid-cols-1 gap-5 sm:grid-cols-3 lg:mb-8">
        <SummaryCard
          label="Matched Records"
          value={review.matchedRecords.toLocaleString()}
          hint={review.matchRate}
          icon={CheckCircleIcon}
        />
        <SummaryCard
          label="Different"
          value={review.differentCount.toLocaleString()}
          hint={review.differentLabel}
          icon={DifferenceIcon}
          accent="tertiary"
        />
        <SummaryCard
          label="Missing"
          value={review.missingCount.toLocaleString()}
          hint={review.missingLabel}
          icon={WarningIcon}
          accent="error"
        />
      </div>

      <div
        ref={tableRef}
        className="flex flex-col overflow-hidden rounded-[20px] border border-outline-variant bg-surface shadow-sm"
      >
        <div className="sticky top-0 z-10 flex flex-col gap-3 border-b border-outline-variant bg-surface/90 p-4 backdrop-blur-sm sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h3 className="text-xl font-semibold leading-7 text-on-surface">
              Discrepancy Details
            </h3>
            <p className="mt-1 text-xs text-on-surface-variant">
              SEMANTIC_MATCH is a near-match (Inc vs Incorporated) — info, not a load failure.
            </p>
          </div>
          <span className="inline-flex items-center gap-1 rounded border border-outline-variant bg-surface-container px-2 py-1 font-mono text-xs text-on-surface-variant">
            <FilterListIcon className="h-3.5 w-3.5" />
            FILTER: Exceptions Only
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full min-w-[900px] border-collapse text-left">
            <thead>
              <tr className="border-b border-outline-variant bg-surface-container-low">
                {[
                  "Business Key",
                  "Field",
                  "Preload Value",
                  "Postload Value",
                  "Difference Type",
                  "Status",
                  "",
                ].map((header) => (
                  <th
                    key={header || "action"}
                    className={`px-4 py-2 text-xs font-semibold uppercase tracking-[0.02em] text-on-surface-variant ${
                      header === "Status" ? "text-center" : ""
                    }`}
                  >
                    {header}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="text-on-surface">
              {review.discrepancies.map((row) => (
                <DiscrepancyRow key={row.id} row={row} />
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
