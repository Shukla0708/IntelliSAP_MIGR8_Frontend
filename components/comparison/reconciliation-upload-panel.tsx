"use client";

import type { ChangeEvent } from "react";
import { useRef } from "react";
import { DescriptionIcon, UploadFileIcon } from "@/components/ui/icons";
import type { ReconciliationUploadCard } from "@/data/comparison";

type ReconciliationUploadPanelProps = {
  card: ReconciliationUploadCard;
  showMetadata: boolean;
  fileName?: string | null;
  onFileSelected?: (file: File) => void;
};

const accentStyles = {
  primary: {
    borderHover: "hover:border-primary",
    iconBg: "bg-primary-container/10 group-hover:bg-primary-container/20",
    iconText: "text-primary",
    button: "border-primary text-primary hover:bg-primary-container/10",
    metadataBorderHover: "hover:border-primary",
    metadataIcon: "text-primary",
  },
  secondary: {
    borderHover: "hover:border-secondary",
    iconBg: "bg-secondary/10 group-hover:bg-secondary/20",
    iconText: "text-secondary",
    button: "border-secondary text-secondary hover:bg-secondary/10",
    metadataBorderHover: "hover:border-secondary",
    metadataIcon: "text-secondary",
  },
};

export function ReconciliationUploadPanel({
  card,
  showMetadata,
  fileName,
  onFileSelected,
}: ReconciliationUploadPanelProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const metadataInputRef = useRef<HTMLInputElement>(null);
  const styles = accentStyles[card.accent];

  function handleFileSelect() {
    fileInputRef.current?.click();
  }

  function handleMetadataSelect() {
    metadataInputRef.current?.click();
  }

  function handleFileChange(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    if (!file) return;
    onFileSelected?.(file);
  }

  return (
    <div
      className={`group flex cursor-pointer flex-col items-center justify-center rounded-[20px] border-2 border-dashed border-outline-variant p-6 text-center transition-colors sm:p-8 ${styles.borderHover}`}
      onClick={handleFileSelect}
      onKeyDown={(event) => {
        if (event.key === "Enter" || event.key === " ") {
          event.preventDefault();
          handleFileSelect();
        }
      }}
      role="button"
      tabIndex={0}
    >
      <div
        className={`mb-4 flex h-12 w-12 items-center justify-center rounded-full transition-colors ${styles.iconBg}`}
      >
        <UploadFileIcon className={`h-6 w-6 ${styles.iconText}`} />
      </div>

      <h4 className="mb-1 text-xl font-semibold leading-7 text-on-surface">
        {card.title} <span className="text-error">*</span>
      </h4>
      <p className="mb-4 text-[13px] leading-[18px] text-on-surface-variant">
        {card.description}
      </p>
      <p className="mb-3 text-xs text-on-surface-variant">
        CSV and .xlsx. Files with 5 lakh+ rows may take several minutes.
      </p>

      <input
        ref={fileInputRef}
        type="file"
        accept=".csv,.xlsx,application/vnd.openxmlformats-officedocument.spreadsheetml.sheet,text/csv"
        className="hidden"
        onChange={handleFileChange}
        onClick={(event) => event.stopPropagation()}
      />

      <button
        type="button"
        onClick={(event) => {
          event.stopPropagation();
          handleFileSelect();
        }}
        className={`rounded-md border px-4 py-2 text-xs font-semibold uppercase tracking-[0.02em] transition-colors ${styles.button}`}
      >
        {card.buttonLabel}
      </button>

      {fileName ? (
        <p className="mt-3 font-mono text-xs text-on-surface-variant">
          Selected: {fileName}
        </p>
      ) : null}

      {showMetadata ? (
        <div
          className="metadata-section mt-6 w-full border-t border-outline-variant/50 pt-6"
          onClick={(event) => event.stopPropagation()}
        >
          <p className="mb-2 text-xs font-semibold uppercase tracking-[0.02em] text-on-surface-variant">
            {card.metadataLabel}
          </p>
          <p className="mb-2 text-[11px] text-on-surface-variant">
            Optional in this version — join keys come from confirmed mapping or
            the picker below.
          </p>
          <input
            ref={metadataInputRef}
            type="file"
            accept=".csv,.json,text/csv,application/json"
            className="hidden"
            onChange={handleMetadataSelect}
          />
          <button
            type="button"
            onClick={handleMetadataSelect}
            className={`flex w-full items-center justify-center gap-3 rounded-lg border border-outline-variant bg-surface-container-low px-4 py-2 transition-colors ${styles.metadataBorderHover}`}
          >
            <DescriptionIcon className={`h-4 w-4 ${styles.metadataIcon}`} />
            <span className="text-[13px] leading-[18px] text-on-surface-variant">
              {card.metadataPlaceholder}
            </span>
          </button>
        </div>
      ) : null}
    </div>
  );
}
