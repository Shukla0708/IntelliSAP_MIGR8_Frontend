"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import apiClient from "@/lib/axios";
import {
  isJobResultPath,
  listTrackedJobs,
  resultPathForJob,
  statusUrlForJob,
  untrackJob,
  type TrackedJob,
} from "@/lib/job-tracker";

type ReadyToast = {
  job: TrackedJob;
  title: string;
  href: string;
  failed: boolean;
  detail?: string | null;
};

type JobStatusPayload = {
  status?: string;
  errorMessage?: string | null;
  error_message?: string | null;
  hasResultFile?: boolean;
  has_result_file?: boolean;
};

export function JobReadyBanner() {
  const pathname = usePathname();
  const [toast, setToast] = useState<ReadyToast | null>(null);

  useEffect(() => {
    let cancelled = false;

    async function poll() {
      const jobs = listTrackedJobs();
      for (const job of jobs) {
        if (isJobResultPath(pathname, job)) continue;
        try {
          const { data } = await apiClient.get<JobStatusPayload>(statusUrlForJob(job));
          const status = data.status;
          const mappingReady = job.kind === "mapping" && status === "awaiting_approval";
          if (status !== "completed" && status !== "failed" && !mappingReady) continue;
          untrackJob(job);
          if (cancelled) return;
          const labels = {
            validation: ["Validation failed", "Validation ready"],
            comparison: ["Comparison failed", "Comparison ready"],
            mapping: ["Field mapping failed", "Field mapping ready"],
          } as const;
          const [failedTitle, readyTitle] = labels[job.kind];
          setToast({
            job,
            href: resultPathForJob(job),
            failed: status === "failed",
            detail: data.errorMessage ?? data.error_message ?? null,
            title: status === "failed" ? failedTitle : readyTitle,
          });
          return;
        } catch {
          // Keep polling; a 404 means the job was deleted.
        }
      }
    }

    void poll();
    const timer = window.setInterval(() => {
      void poll();
    }, 5000);
    return () => {
      cancelled = true;
      window.clearInterval(timer);
    };
  }, [pathname]);

  if (!toast) return null;

  return (
    <div className="pointer-events-none fixed right-4 bottom-4 z-[60] w-[min(100%-2rem,24rem)]">
      <div className="pointer-events-auto rounded-xl border border-outline-variant bg-surface p-4 shadow-lg">
        <p className="text-sm font-semibold text-on-surface">{toast.title}</p>
        <p className="mt-1 text-xs text-on-surface-variant">
          {toast.failed
            ? toast.detail || "The run did not finish. Open it to see the error."
            : "Results are ready to display."}
        </p>
        <div className="mt-3 flex justify-end gap-2">
          <button
            type="button"
            className="rounded px-2 py-1 text-xs font-semibold text-on-surface-variant hover:bg-surface-container"
            onClick={() => setToast(null)}
          >
            Dismiss
          </button>
          <Link
            href={toast.href}
            className="rounded bg-primary-container px-3 py-1 text-xs font-semibold uppercase tracking-[0.02em] text-on-primary"
            onClick={() => setToast(null)}
          >
            View
          </Link>
        </div>
      </div>
    </div>
  );
}
