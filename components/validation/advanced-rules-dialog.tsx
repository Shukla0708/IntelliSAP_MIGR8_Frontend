"use client";

import { useEffect, useState } from "react";
import { Dialog } from "@/components/ui/dialog";
import { AutoAwesomeIcon } from "@/components/ui/icons";
import apiClient, { getApiErrorMessage } from "@/lib/axios";
import {
  FIELD_DATA_TYPES,
  MAX_FIELD_LENGTH,
  isDecimalLengthVisible,
  isLengthEnabled,
  type CaseFormat,
  type FieldDataType,
  type FieldRuleConfig,
} from "@/data/validation";

type AdvancedRulesDialogProps = {
  open: boolean;
  fieldName: string;
  initialConfig: FieldRuleConfig;
  onClose: () => void;
  onApply: (config: FieldRuleConfig) => void;
};

const CASE_OPTIONS: { value: CaseFormat; label: string }[] = [
  { value: "uppercase", label: "Uppercase" },
  { value: "lowercase", label: "Lowercase" },
  { value: "camelCase", label: "Camel Case" },
];

function clampLength(value: number | null): number | null {
  if (value === null || Number.isNaN(value)) return null;
  return Math.min(MAX_FIELD_LENGTH, Math.max(0, value));
}

export function AdvancedRulesDialog({
  open,
  fieldName,
  initialConfig,
  onClose,
  onApply,
}: AdvancedRulesDialogProps) {
  const [config, setConfig] = useState<FieldRuleConfig>(initialConfig);
  const [generating, setGenerating] = useState(false);
  const [genError, setGenError] = useState<string | null>(null);

  useEffect(() => {
    if (open) {
      setConfig(initialConfig);
      setGenError(null);
    }
  }, [open, initialConfig]);

  const lengthEnabled = isLengthEnabled(config.dataType);
  const showDecimalLength = isDecimalLengthVisible(config.dataType);

  function updateDataType(dataType: FieldDataType) {
    setConfig((current) => ({
      ...current,
      dataType,
      length: isLengthEnabled(dataType) ? current.length : current.length,
      decimalLength: isDecimalLengthVisible(dataType) ? current.decimalLength : null,
    }));
  }

  function handleApply() {
    const next: FieldRuleConfig = {
      ...config,
      length: lengthEnabled ? clampLength(config.length) : null,
      decimalLength: showDecimalLength ? clampLength(config.decimalLength) : null,
    };
    onApply(next);
  }

  // Rule 5 is no longer a raw regex field. The user describes the rule in
  // plain English, Groq (via the backend) turns it into the actual pattern
  // that gets stored and applied at validation time.
  async function handleGenerateRegex() {
    if (!config.regexPrompt.trim()) return;
    setGenerating(true);
    setGenError(null);
    try {
      const { data } = await apiClient.post<{ regex: string }>("/api/runs/generate-regex", {
        field_name: fieldName,
        prompt: config.regexPrompt,
      });
      console.log(data);
      setConfig((current) => ({ ...current, regex: data.regex }));
    } catch (err) {
      setGenError(getApiErrorMessage(err, "Could not generate a rule"));
    } finally {
      setGenerating(false);
    }
  }

  return (
    <Dialog
      open={open}
      title={`Rules for ${fieldName}`}
      onClose={onClose}
      footer={
        <>
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg px-4 py-2 text-xs font-semibold uppercase tracking-[0.02em] text-on-surface-variant transition-colors hover:bg-surface-container-high"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleApply}
            className="rounded-lg bg-primary px-6 py-2 text-xs font-semibold uppercase tracking-[0.02em] text-on-primary shadow-sm transition-all hover:bg-primary/90"
          >
            Apply Rules
          </button>
        </>
      }
    >
      <div>
        <label className="mb-2 block text-xs font-semibold uppercase tracking-[0.02em] leading-4 text-on-surface-variant">
          Rule 1: Case Formatting
        </label>
        <div className="flex flex-wrap gap-4">
          {CASE_OPTIONS.map((option) => (
            <label key={option.value} className="flex cursor-pointer items-center gap-2">
              <input
                type="radio"
                name={`case-${fieldName}`}
                checked={config.caseFormat === option.value}
                onChange={() => setConfig((current) => ({ ...current, caseFormat: option.value }))}
                className="accent-primary focus:ring-primary"
              />
              <span className="text-[13px] leading-[18px] text-on-surface">{option.label}</span>
            </label>
          ))}
        </div>
      </div>

      <div>
        <label
          htmlFor="rule-data-type"
          className="mb-2 block text-xs font-semibold uppercase tracking-[0.02em] leading-4 text-on-surface-variant"
        >
          Rule 2: Data Type
        </label>
        <select
          id="rule-data-type"
          value={config.dataType}
          onChange={(event) => updateDataType(event.target.value as FieldDataType)}
          className="w-full rounded-lg border border-outline-variant bg-surface-container-lowest px-3 py-2 text-sm text-on-surface focus:border-primary focus:ring-2 focus:ring-primary/20 focus:outline-none"
        >
          {FIELD_DATA_TYPES.map((type) => (
            <option key={type} value={type}>
              {type}
            </option>
          ))}
        </select>
      </div>

      <div className={showDecimalLength ? "grid grid-cols-1 gap-4 sm:grid-cols-2" : "grid grid-cols-1"}>
        <div>
          <label
            htmlFor="rule-length"
            className="mb-2 block text-xs font-semibold uppercase tracking-[0.02em] leading-4 text-on-surface-variant"
          >
            Rule 3: Length
          </label>
          <input
            id="rule-length"
            type="number"
            min={0}
            max={MAX_FIELD_LENGTH}
            disabled={!lengthEnabled}
            value={config.length ?? ""}
            onChange={(event) => {
              const raw = event.target.value;
              setConfig((current) => ({ ...current, length: raw === "" ? null : Number(raw) }));
            }}
            className={[
              "w-full rounded-lg border border-outline-variant px-3 py-2 text-sm text-on-surface focus:border-primary focus:ring-2 focus:ring-primary/20 focus:outline-none",
              lengthEnabled ? "bg-surface-container-lowest" : "bg-surface-container-low opacity-50",
            ].join(" ")}
          />
          {lengthEnabled ? (
            <p className="mt-1 text-[11px] text-outline">Max {MAX_FIELD_LENGTH}</p>
          ) : (
            <p className="mt-1 text-[11px] text-outline">Disabled when data type is string</p>
          )}
        </div>

        {showDecimalLength ? (
          <div>
            <label
              htmlFor="rule-decimal-length"
              className="mb-2 block text-xs font-semibold uppercase tracking-[0.02em] leading-4 text-on-surface-variant"
            >
              Rule 4: Decimal Length
            </label>
            <input
              id="rule-decimal-length"
              type="number"
              min={0}
              max={MAX_FIELD_LENGTH}
              value={config.decimalLength ?? ""}
              onChange={(event) => {
                const raw = event.target.value;
                setConfig((current) => ({
                  ...current,
                  decimalLength: raw === "" ? null : Number(raw),
                }));
              }}
              className="w-full rounded-lg border border-outline-variant bg-surface-container-lowest px-3 py-2 text-sm text-on-surface focus:border-primary focus:ring-2 focus:ring-primary/20 focus:outline-none"
            />
          </div>
        ) : null}
      </div>

      <div>
        <label
          htmlFor="rule-regex-prompt"
          className="mb-2 block text-xs font-semibold uppercase tracking-[0.02em] leading-4 text-on-surface-variant"
        >
          Rule 5: Custom Rule (describe it in plain English)
        </label>
        <div className="relative">
          <textarea
            id="rule-regex-prompt"
            rows={2}
            value={config.regexPrompt}
            onChange={(event) =>
              setConfig((current) => ({ ...current, regexPrompt: event.target.value }))
            }
            placeholder="e.g. Must be a 10-digit code starting with 9"
            className="w-full resize-none rounded-lg border border-outline-variant bg-surface-container-lowest py-2 pr-10 pl-3 text-sm text-on-surface focus:border-primary focus:ring-2 focus:ring-primary/20 focus:outline-none"
          />
          <button
            type="button"
            onClick={handleGenerateRegex}
            disabled={generating || !config.regexPrompt.trim()}
            className="absolute top-2 right-2 text-primary transition-transform hover:scale-110 disabled:opacity-40"
            aria-label="Generate rule with AI"
          >
            <AutoAwesomeIcon className="h-5 w-5" />
          </button>
        </div>

        {generating && <p className="mt-1 text-[11px] text-outline">Generating rule...</p>}
        {genError && <p className="mt-1 text-[11px] text-error">{genError}</p>}
        {config.regex && !generating && (
          <p className="mt-1 truncate text-[11px] text-outline" title={config.regex}>
            Applied pattern: <code>{config.regex}</code>
          </p>
        )}
      </div>
    </Dialog>
  );
}
