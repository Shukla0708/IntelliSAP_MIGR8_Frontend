"use client";

import { useEffect, useState } from "react";
import { ProgressBar } from "@/components/ui/progress";

export const JOB_LEAVE_HINT_MS = 15_000;

export function JobWaitingScreen({
  title,
  preparingLabel = "Preparing file...",
  processed,
  total,
}: {
  title: string;
  preparingLabel?: string;
  processed?: number;
  total?: number;
}) {
  const [showLeaveHint, setShowLeaveHint] = useState(false);

  useEffect(() => {
    const timer = window.setTimeout(() => setShowLeaveHint(true), JOB_LEAVE_HINT_MS);
    return () => window.clearTimeout(timer);
  }, []);

  const percent = total && total > 0 ? Math.round(((processed ?? 0) / total) * 100) : 0;

  return (
    <div className="mx-auto max-w-xl py-16 text-center">
      <h2 className="text-2xl font-semibold text-on-surface">{title}</h2>
      <p className="mt-2 text-sm text-on-surface-variant">
        {showLeaveHint
          ? "You can leave this page — the run keeps going. We will notify you here when results are ready."
          : "Working on your file. This page will update when results are ready."}
      </p>
      <div className="mt-6">
        <ProgressBar value={total && total > 0 ? percent : 15} className="h-2" />
        <p className="mt-2 font-mono text-xs text-on-surface-variant">
          {total && total > 0
            ? `${(processed ?? 0).toLocaleString()} / ${total.toLocaleString()} rows`
            : preparingLabel}
        </p>
      </div>
    </div>
  );
}
