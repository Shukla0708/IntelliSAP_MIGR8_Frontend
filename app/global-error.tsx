"use client";

import { BrandError } from "@/components/ui/brand-error";

export default function GlobalError({
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <html lang="en">
      <body>
        <BrandError
          title="MIGR8 is unavailable"
          message="The application failed to load. Retry, or check your connection and try again."
          onRetry={reset}
        />
      </body>
    </html>
  );
}
