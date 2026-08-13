"use client";

import type { ChangeEvent, ComponentType } from "react";
import { useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { DownloadIcon, SchemaIcon, UploadFileIcon } from "@/components/ui/icons";
import type { SchemaUploadCard } from "@/data/field-mapping";

const iconMap: Record<
  SchemaUploadCard["icon"],
  ComponentType<{ className?: string }>
> = {
  uploadFile: UploadFileIcon,
  schema: SchemaIcon,
};

type SchemaUploadPanelProps = {
  card: SchemaUploadCard;
  file?: File | null;
  onFileSelected: (file: File) => void;
};

export function SchemaUploadPanel({
  card,
  file,
  onFileSelected,
}: SchemaUploadPanelProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [sapTableName, setSapTableName] = useState("");
  const Icon = iconMap[card.icon];

  function handleSelectClick() {
    inputRef.current?.click();
  }

  function handleFileChange(event: ChangeEvent<HTMLInputElement>) {
    const selected = event.target.files?.[0];
    if (!selected) return;
    onFileSelected(selected);
  }

  function handleSapFetch() {
    if (!sapTableName.trim()) return;
    console.info("SAP table fetch clicked (mock)", { table: sapTableName });
  }

  return (
    <div className="flex h-full flex-col rounded-[20px] border border-outline-variant bg-surface p-6 text-center shadow-sm sm:p-8">
      <div className="flex flex-1 flex-col items-center justify-center gap-4">
        <div className="mb-2 flex h-16 w-16 items-center justify-center rounded-full bg-primary-container/10 text-primary">
          <Icon className="h-10 w-10" />
        </div>
        <h3 className="text-xl font-semibold leading-7 text-on-surface">
          {card.title}
        </h3>
        <p className="max-w-xs text-sm leading-5 text-on-surface-variant sm:text-base sm:leading-6">
          {card.description}
        </p>

        <input
          ref={inputRef}
          type="file"
          accept=".csv,.xlsx,application/vnd.openxmlformats-officedocument.spreadsheetml.sheet,text/csv"
          className="hidden"
          onChange={handleFileChange}
        />

        <Button
          type="button"
          onClick={handleSelectClick}
          className="mt-2 h-auto rounded bg-primary px-6 py-2 text-xs font-semibold uppercase tracking-[0.02em] text-on-primary shadow-none hover:bg-primary hover:opacity-90"
        >
          {card.buttonLabel}
        </Button>

        <p className="text-[13px] leading-[18px] text-outline">
          {file ? `Selected: ${file.name}` : card.supportedFormats}
        </p>
      </div>

      {card.sapFetch ? (
        <div className="mt-6 w-full border-t border-outline-variant pt-6">
          <div className="mb-4 flex items-center gap-4">
            <div className="h-px flex-1 bg-outline-variant" />
            <span className="text-xs font-semibold uppercase tracking-wider text-outline">
              OR
            </span>
            <div className="h-px flex-1 bg-outline-variant" />
          </div>

          <div className="flex flex-col gap-2 text-left">
            <label
              htmlFor={`sap-table-${card.id}`}
              className="text-xs font-semibold uppercase tracking-[0.02em] leading-4 text-on-surface-variant"
            >
              {card.sapFetch.label}
            </label>
            <div className="flex flex-col gap-2 sm:flex-row">
              <input
                id={`sap-table-${card.id}`}
                type="text"
                value={sapTableName}
                onChange={(event) => setSapTableName(event.target.value)}
                placeholder={card.sapFetch.placeholder}
                className="flex-1 rounded border border-outline-variant bg-surface px-4 py-2 text-sm leading-5 text-on-surface placeholder:text-on-surface-variant focus:border-primary focus:ring-1 focus:ring-primary focus:outline-none"
              />
              <Button
                type="button"
                onClick={handleSapFetch}
                className="h-auto shrink-0 gap-2 rounded bg-primary px-4 py-2 text-xs font-semibold uppercase tracking-[0.02em] text-on-primary shadow-none hover:bg-primary hover:opacity-90"
              >
                <DownloadIcon className="h-4 w-4" />
                {card.sapFetch.buttonLabel}
              </Button>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
}
