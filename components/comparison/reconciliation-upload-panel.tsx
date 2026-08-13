"use client";

import type { ChangeEvent } from "react";
import { useRef } from "react";
import { UploadFileIcon } from "@/components/ui/icons";
import type { ReconciliationUploadCard } from "@/data/comparison";

type ReconciliationUploadPanelProps = {
  card: ReconciliationUploadCard;
  file: File | null;
  onFileSelected: (file: File) => void;
};

const accentStyles = {
  primary: {
    borderHover: "hover:border-primary",
    iconBg: "bg-primary-container/10 group-hover:bg-primary-container/20",
    iconText: "text-primary",
    button: "border-primary text-primary hover:bg-primary-container/10",
  },
  secondary: {
    borderHover: "hover:border-secondary",
    iconBg: "bg-secondary/10 group-hover:bg-secondary/20",
    iconText: "text-secondary",
    button: "border-secondary text-secondary hover:bg-secondary/10",
  },
};

export function ReconciliationUploadPanel({
  card,
  file,
  onFileSelected,
}: ReconciliationUploadPanelProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const styles = accentStyles[card.accent];

  function handleFileSelect() {
    fileInputRef.current?.click();
  }

  function handleFileChange(event: ChangeEvent<HTMLInputElement>) {
    const selected = event.target.files?.[0];
    if (selected) onFileSelected(selected);
    event.target.value = "";
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

      <input
        ref={fileInputRef}
        type="file"
        accept=".xlsx,application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
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

      {file ? (
        <p className="mt-3 font-mono text-xs text-on-surface-variant">
          Selected: {file.name}
        </p>
      ) : null}
    </div>
  );
}
