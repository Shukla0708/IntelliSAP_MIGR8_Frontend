"use client";

import Link from "next/link";

export function BrandError({
  title,
  message,
  onRetry,
}: {
  title: string;
  message: string;
  onRetry?: () => void;
}) {
  return (
    <div className="relative flex min-h-screen items-center justify-center overflow-hidden bg-background p-6 text-on-background">
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute -top-[300px] -right-[200px] h-[600px] w-[600px] rounded-full bg-primary/5 blur-[100px]" />
      </div>
      <div className="relative z-10 max-w-md rounded-2xl border border-outline-variant bg-surface-container-lowest p-8 text-center shadow-ambient">
        <p className="text-xs font-bold uppercase tracking-[0.08em] text-primary">MIGR8 AI</p>
        <h1 className="mt-3 text-2xl font-bold text-on-surface">{title}</h1>
        <p className="mt-2 text-sm leading-6 text-on-surface-variant">{message}</p>
        <div className="mt-6 flex flex-wrap items-center justify-center gap-3">
          {onRetry ? (
            <button
              type="button"
              onClick={onRetry}
              className="inline-flex h-10 items-center rounded bg-primary-container px-4 text-sm font-semibold text-on-primary hover:bg-primary"
            >
              Try again
            </button>
          ) : null}
          <Link
            href="/dashboard"
            className="inline-flex h-10 items-center rounded border border-outline-variant px-4 text-sm font-semibold text-primary hover:bg-surface-container-high"
          >
            Go to dashboard
          </Link>
        </div>
      </div>
    </div>
  );
}
