"use client";

import { useParams } from "next/navigation";
import { useEffect, useState } from "react";
import { ReconciliationReviewView } from "@/components/comparison/reconciliation-review-view";
import { AppShell } from "@/components/layout/app-shell";
import { JobWaitingScreen } from "@/components/ui/job-waiting-screen";
import { getApiErrorMessage } from "@/lib/axios";
import { fetchComparisonReview, type ComparisonReview } from "@/lib/comparison-api";
import { untrackJob } from "@/lib/job-tracker";

export default function ComparisonReviewPage() {
  const params = useParams<{ id: string }>();
  const [review, setReview] = useState<ComparisonReview | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    let timer: number | undefined;

    async function load() {
      try {
        const data = await fetchComparisonReview(params.id);
        if (cancelled) return;
        setReview(data);
        setError(null);
        if (data.status === "running") {
          timer = window.setTimeout(() => {
            void load();
          }, 2000);
          return;
        }
        untrackJob({ kind: "comparison", id: params.id });
      } catch (err) {
        if (!cancelled) {
          setError(getApiErrorMessage(err, "Comparison run not found"));
        }
      }
    }

    void load();
    return () => {
      cancelled = true;
      if (timer) window.clearTimeout(timer);
    };
  }, [params.id]);

  if (error) {
    return (
      <AppShell mainClassName="flex flex-1 flex-col bg-surface-container-low p-0">
        <p className="p-8 text-sm font-semibold text-error">{error}</p>
      </AppShell>
    );
  }

  if (!review || review.status === "running" || review.status === "draft") {
    return (
      <AppShell mainClassName="flex flex-1 flex-col bg-surface-container-low p-0">
        <JobWaitingScreen
          title="Comparison is running"
          preparingLabel="Reconciling preload and postload files..."
        />
      </AppShell>
    );
  }

  if (review.status === "failed") {
    return (
      <AppShell mainClassName="flex flex-1 flex-col bg-surface-container-low p-0">
        <div className="mx-auto max-w-xl p-8">
          <h2 className="text-2xl font-semibold text-error">Comparison failed</h2>
          <p className="mt-2 text-sm text-on-surface-variant">
            The reconciliation did not complete. Try running it again.
          </p>
        </div>
      </AppShell>
    );
  }

  return (
    <AppShell
      mainClassName="flex flex-1 flex-col bg-surface-container-low p-0"
      topbarLeading={
        <div className="flex min-w-0 flex-wrap items-center gap-2">
          <span className="truncate text-xs font-semibold uppercase tracking-[0.02em] leading-4 text-primary">
            {review.projectName}
          </span>
        </div>
      }
    >
      <ReconciliationReviewView review={review} />
    </AppShell>
  );
}
