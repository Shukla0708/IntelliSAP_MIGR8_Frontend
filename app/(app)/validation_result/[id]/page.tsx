"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { AppShell } from "@/components/layout/app-shell";
import { ValidationResultsView } from "@/components/validation/validation-results-view";
import { ProgressBar } from "@/components/ui/progress";
import apiClient, { getApiErrorMessage } from "@/lib/axios";
import { untrackJob } from "@/lib/job-tracker";
import { isEditableValidationStatus } from "@/lib/validation-routes";
import type { ValidationResultSummary } from "@/data/validation-results";

type ResultPayload = ValidationResultSummary & {
  status?: string;
  processedRows?: number;
  totalRows?: number;
  errorMessage?: string | null;
  hasResultFile?: boolean;
};

export default function ValidationResultPage() {
  const params = useParams<{ id: string }>();
  const router = useRouter();
  const [result, setResult] = useState<ResultPayload | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    let timer: number | undefined;

    async function load() {
      try {
        const { data } = await apiClient.get<ResultPayload>(
          `/api/runs/${params.id}/result`,
        );
        if (cancelled) return;
        if (data.status && isEditableValidationStatus(data.status)) {
          router.replace(`/validation/${params.id}`);
          return;
        }
        setResult(data);
        setError(null);
        if (data.status === "running") {
          timer = window.setTimeout(() => {
            void load();
          }, 2000);
          return;
        }
        untrackJob({ kind: "validation", id: params.id });
      } catch (err) {
        if (!cancelled) {
          setError(getApiErrorMessage(err, "Not found"));
        }
      }
    }

    void load();
    return () => {
      cancelled = true;
      if (timer) window.clearTimeout(timer);
    };
  }, [params.id, router]);

  if (error) {
    return (
      <AppShell topbarTitle="Validation Results">
        <p className="text-sm text-error">{error}</p>
      </AppShell>
    );
  }

  if (!result || result.status === "running") {
    const processed = result?.processedRows ?? 0;
    const total = result?.totalRows ?? 0;
    const percent = total > 0 ? Math.round((processed / total) * 100) : 0;
    return (
      <AppShell topbarTitle="Validation Results">
        <div className="mx-auto max-w-xl py-16 text-center">
          <h2 className="text-2xl font-semibold text-on-surface">
            Validation is running
          </h2>
          <p className="mt-2 text-sm text-on-surface-variant">
            You can leave this page — the run keeps going. We will notify you
            here when results are ready.
          </p>
          <div className="mt-6">
            <ProgressBar value={total > 0 ? percent : 15} className="h-2" />
            <p className="mt-2 font-mono text-xs text-on-surface-variant">
              {total > 0
                ? `${processed.toLocaleString()} / ${total.toLocaleString()} rows`
                : "Preparing file..."}
            </p>
          </div>
        </div>
      </AppShell>
    );
  }

  if (result.status === "failed") {
    return (
      <AppShell topbarTitle="Validation Results">
        <div className="mx-auto max-w-xl py-16">
          <h2 className="text-2xl font-semibold text-error">Validation failed</h2>
          <p className="mt-2 text-sm text-on-surface-variant">
            {result.errorMessage || "The run did not complete."}
          </p>
        </div>
      </AppShell>
    );
  }

  return (
    <AppShell
      topbarLeading={
        <div className="flex min-w-0 flex-wrap items-center gap-2">
          <span className="truncate text-xs font-semibold uppercase tracking-[0.02em] leading-4 text-primary">
            {result.projectLabel}
          </span>
        </div>
      }
    >
      <ValidationResultsView result={result} />
    </AppShell>
  );
}
