"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { AppShell } from "@/components/layout/app-shell";
import { ValidationResultsView } from "@/components/validation/validation-results-view";
import apiClient, { getApiErrorMessage } from "@/lib/axios";
import { isEditableValidationStatus } from "@/lib/validation-routes";
import type { ValidationResultSummary } from "@/data/validation-results";

export default function ValidationResultPage() {
  const params = useParams<{ id: string }>();
  const router = useRouter();
  const [result, setResult] = useState<ValidationResultSummary | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    apiClient
      .get<ValidationResultSummary & { status?: string }>(`/api/runs/${params.id}/result`)
      .then((res) => {
        if (res.data.status && isEditableValidationStatus(res.data.status)) {
          router.replace(`/validation/${params.id}`);
          return;
        }
        setResult(res.data);
      })
      .catch((err) => setError(getApiErrorMessage(err, "Not found")));
  }, [params.id, router]);

  if (error) {
    return (
      <AppShell topbarTitle="Validation Results">
        <p className="text-sm text-error">{error}</p>
      </AppShell>
    );
  }

  if (!result) {
    return (
      <AppShell topbarTitle="Validation Results">
        <p className="text-sm text-on-surface-variant">Loading results...</p>
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
