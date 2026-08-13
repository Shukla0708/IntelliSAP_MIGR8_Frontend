"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { ReconciliationReviewView } from "@/components/comparison/reconciliation-review-view";
import { AppShell } from "@/components/layout/app-shell";
import { ProgressBar } from "@/components/ui/progress";
import { getApiErrorMessage } from "@/lib/axios";
import {
  fetchComparisonDownloadUrl,
  fetchComparisonResult,
  type ComparisonResultPayload,
} from "@/lib/comparison-api";
import { untrackJob } from "@/lib/job-tracker";

export default function ComparisonReviewPage() {
  const params = useParams<{ id: string }>();
  const [result, setResult] = useState<ComparisonResultPayload | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    let timer: number | undefined;

    async function load() {
      try {
        const data = await fetchComparisonResult(params.id);
        if (cancelled) return;
        setResult(data);
        setError(null);
        if (data.status === "running" || data.status === "draft") {
          timer = window.setTimeout(() => {
            void load();
          }, 2000);
          return;
        }
        untrackJob({ kind: "comparison", id: params.id });
      } catch (err) {
        if (!cancelled) setError(getApiErrorMessage(err, "Comparison not found"));
      }
    }

    void load();
    return () => {
      cancelled = true;
      if (timer) window.clearTimeout(timer);
    };
  }, [params.id]);

  async function handleDownload() {
    const url = await fetchComparisonDownloadUrl(params.id);
    window.open(url, "_blank", "noopener,noreferrer");
  }

  if (error) {
    return (
      <AppShell topbarTitle="Comparison">
        <p className="p-8 text-sm text-error">{error}</p>
      </AppShell>
    );
  }

  if (!result || result.status === "running" || result.status === "draft") {
    const processed = result?.processedRows ?? 0;
    const total = result?.totalRows ?? 0;
    const percent = total > 0 ? Math.round((processed / total) * 100) : 0;
    return (
      <AppShell
        mainClassName="flex flex-1 flex-col bg-surface-container-low p-0"
        topbarTitle="Comparison"
      >
        <div className="mx-auto max-w-xl py-16 text-center">
          <h2 className="text-2xl font-semibold text-on-surface">
            Reconciliation is running
          </h2>
          <p className="mt-2 text-sm text-on-surface-variant">
            You can leave this page — the run keeps going. We will notify you
            here when results are ready.
          </p>
          <div className="mt-6 px-8">
            <ProgressBar value={total > 0 ? percent : 15} className="h-2" />
            <p className="mt-2 font-mono text-xs text-on-surface-variant">
              {total > 0
                ? `${processed.toLocaleString()} / ${total.toLocaleString()} rows`
                : "Preparing files..."}
            </p>
          </div>
        </div>
      </AppShell>
    );
  }

  if (result.status === "failed") {
    return (
      <AppShell topbarTitle="Comparison">
        <div className="mx-auto max-w-xl p-8">
          <h2 className="text-2xl font-semibold text-error">Comparison failed</h2>
          <p className="mt-2 text-sm text-on-surface-variant">
            {result.errorMessage || "The run did not complete."}
          </p>
        </div>
      </AppShell>
    );
  }

  return (
    <AppShell mainClassName="flex flex-1 flex-col bg-surface-container-low p-0">
      <ReconciliationReviewView review={result} onDownload={handleDownload} />
    </AppShell>
  );
}
