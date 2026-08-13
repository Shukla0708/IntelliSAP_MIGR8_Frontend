import type { ComparisonRunStatus } from "@/data/comparison";

/** Only a finished run has a review page; anything else is not linkable yet. */
export function comparisonRunHref(run: {
  id: string;
  status: ComparisonRunStatus | string;
}): string | null {
  return run.status === "completed" ? `/compare/${run.id}` : null;
}
