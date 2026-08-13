"use client";

import { useParams } from "next/navigation";
import { useEffect, useState } from "react";
import { ReconciliationReviewView } from "@/components/comparison/reconciliation-review-view";
import { AppShell } from "@/components/layout/app-shell";
import { getApiErrorMessage } from "@/lib/axios";
import { fetchComparisonReview, type ComparisonReview } from "@/lib/comparison-api";

export default function ComparisonReviewPage() {
  const params = useParams<{ id: string }>();
  const [review, setReview] = useState<ComparisonReview | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchComparisonReview(params.id)
      .then(setReview)
      .catch((err) => setError(getApiErrorMessage(err, "Comparison run not found")));
  }, [params.id]);

  if (error) {
    return (
      <AppShell mainClassName="flex flex-1 flex-col bg-surface-container-low p-0">
        <p className="p-8 text-sm font-semibold text-error">{error}</p>
      </AppShell>
    );
  }

  if (!review) {
    return (
      <AppShell mainClassName="flex flex-1 flex-col bg-surface-container-low p-0">
        <p className="p-8 text-sm text-on-surface-variant">Loading comparison…</p>
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
