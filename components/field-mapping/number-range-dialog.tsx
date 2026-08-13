"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Dialog } from "@/components/ui/dialog";
import { TextField } from "@/components/ui/text-field";
import type { NumberRangeType } from "@/lib/mapping-api";

type NumberRangeOption = {
  value: NumberRangeType;
  label: string;
  description: string;
};

const OPTIONS: NumberRangeOption[] = [
  {
    value: "internal",
    label: "Internal Number Range",
    description:
      "SAP assigns the key value itself. The AI will not map the source key field — you'll map it to the correct target field yourself.",
  },
  {
    value: "external",
    label: "External Number Range",
    description:
      "The source system's key value is carried over into SAP. The AI will map the source key field like any other field.",
  },
];

type NumberRangeDialogProps = {
  open: boolean;
  onClose: () => void;
  onConfirm: (numberRangeType: NumberRangeType, mappingName: string) => void;
};

export function NumberRangeDialog({
  open,
  onClose,
  onConfirm,
}: NumberRangeDialogProps) {
  const [selected, setSelected] = useState<NumberRangeType | null>(null);
  const [mappingName, setMappingName] = useState("");

  function handleClose() {
    setSelected(null);
    setMappingName("");
    onClose();
  }

  function handleConfirm() {
    if (!selected) return;
    onConfirm(selected, mappingName.trim());
    setSelected(null);
    setMappingName("");
  }

  return (
    <Dialog
      open={open}
      title="Name & Number Range"
      onClose={handleClose}
      footer={
        <>
          <Button type="button" variant="ghost" size="md" onClick={handleClose}>
            Cancel
          </Button>
          <Button
            type="button"
            size="md"
            onClick={handleConfirm}
            disabled={!selected}
          >
            Continue
          </Button>
        </>
      }
    >
      <TextField
        id="mapping-name"
        label="Mapping Name"
        placeholder="New field mapping run"
        value={mappingName}
        maxLength={120}
        onChange={(event) => setMappingName(event.target.value)}
        autoFocus
        trailingLabel={
          <span className="text-[10px] uppercase tracking-[0.02em] text-on-surface-variant">
            Optional
          </span>
        }
      />

      <p className="text-sm leading-6 text-on-surface-variant">
        Does this mapping follow an internal or external number range for its
        key field?
      </p>

      <div className="space-y-2">
        {OPTIONS.map((option) => {
          const isSelected = option.value === selected;
          return (
            <button
              key={option.value}
              type="button"
              onClick={() => setSelected(option.value)}
              className={[
                "flex w-full flex-col gap-1 rounded-lg border px-4 py-3 text-left transition-colors",
                isSelected
                  ? "border-primary bg-primary-container/10"
                  : "border-outline-variant hover:bg-surface-container-high",
              ].join(" ")}
            >
              <span
                className={`text-sm font-semibold ${
                  isSelected ? "text-primary" : "text-on-surface"
                }`}
              >
                {option.label}
              </span>
              <span className="text-xs leading-5 text-on-surface-variant">
                {option.description}
              </span>
            </button>
          );
        })}
      </div>
    </Dialog>
  );
}
