"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { AppShell } from "@/components/layout/app-shell";
import { ValidationResultsView } from "@/components/validation/validation-results-view";
import apiClient, { getApiErrorMessage } from "@/lib/axios";
import type { ValidationResultSummary } from "@/data/validation-results";

// This page can no longer be statically generated (generateStaticParams/
// generateMetadata against the mock data file) because results now come
// from a per-user, JWT-authenticated API call that only resolves in the
// browser (the auth token lives in localStorage, not a server session).
// If you want this rendered on the server instead, switch auth to an
// httpOnly cookie and fetch with that cookie forwarded server-side.

export default function ValidationResultPage() {
  const params = useParams<{ id: string }>();
  const [result, setResult] = useState<ValidationResultSummary | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    apiClient
      .get<ValidationResultSummary>(`/api/runs/${params.id}/result`)
      .then((res) => setResult(res.data))
      .catch((err) => setError(getApiErrorMessage(err, "Not found")));
  }, [params.id]);

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
