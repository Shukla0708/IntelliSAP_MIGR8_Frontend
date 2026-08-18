"use client";

import { BrandError } from "@/components/ui/brand-error";

export default function ErrorPage({
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <BrandError
      title="Something went wrong"
      message="MIGR8 hit an unexpected error. You can retry this page or return to the dashboard."
      onRetry={reset}
    />
  );
}
