"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { ReconciliationUploadPanel } from "@/components/comparison/reconciliation-upload-panel";
import { PlayArrowIcon } from "@/components/ui/icons";
import { RECONCILIATION_UPLOAD_CARDS } from "@/data/comparison";
import { LATEST_COMPARISON_RUN_ID } from "@/data/comparison-results";

export function ComparisonSetupView() {
  const router = useRouter();
  const [hasFieldMapping, setHasFieldMapping] = useState(false);

  function handleRunReconciliation() {
    router.push(`/compare/${LATEST_COMPARISON_RUN_ID}`);
  }

  return (
    <div className="mx-auto w-full max-w-[1440px] p-4 md:p-8">
      <div className="mb-6 flex flex-col gap-4 lg:mb-8 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <h2 className="mb-2 text-[32px] font-semibold leading-10 tracking-[-0.01em] text-on-surface">
            Preload vs Postload Reconciliation
          </h2>
          <p className="max-w-2xl text-base leading-6 text-on-surface-variant">
            Upload your source extraction and target load files to begin the
            automated reconciliation process.
          </p>
        </div>

        <Button
          type="button"
          size="md"
          onClick={handleRunReconciliation}
          className="h-auto shrink-0 gap-2 self-start px-4 py-2 text-xs font-semibold uppercase tracking-[0.02em] shadow-sm hover:shadow-md lg:self-auto"
        >
          <PlayArrowIcon className="h-4 w-4" />
          Run Reconciliation
        </Button>
      </div>

      <div className="mb-6 grid grid-cols-1 gap-5 lg:mb-8 lg:grid-cols-2 lg:gap-5">
        {RECONCILIATION_UPLOAD_CARDS.map((card) => (
          <ReconciliationUploadPanel
            key={card.id}
            card={card}
            showMetadata={hasFieldMapping}
          />
        ))}
      </div>

      <div className="flex items-center gap-3 px-1">
        <input
          id="toggle-metadata"
          type="checkbox"
          checked={hasFieldMapping}
          onChange={(event) => setHasFieldMapping(event.target.checked)}
          className="h-5 w-5 cursor-pointer rounded border-outline-variant text-primary focus:ring-primary"
        />
        <label
          htmlFor="toggle-metadata"
          className="cursor-pointer select-none text-sm leading-5 text-on-surface"
        >
          Have Field Mapping?
        </label>
      </div>
    </div>
  );
}
