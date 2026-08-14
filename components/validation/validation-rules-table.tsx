"use client";

import { useEffect, useState } from "react";
import { AdvancedRulesDialog } from "@/components/validation/advanced-rules-dialog";
import { AutoAwesomeIcon, CloseIcon } from "@/components/ui/icons";
import {
  RULE_COLUMNS,
  buildRuleTags,
  DEFAULT_FIELD_RULE_CONFIG,
  type FieldRuleConfig,
  type RuleFlag,
  type ValidationFieldRule,
} from "@/data/validation";

type ValidationRulesTableProps = {
  fields: string[];
  initialRules?: ValidationFieldRule[];
  /** Bump when a new file is staged to reset rules from defaults */
  fieldsVersion?: number;
  onRulesChange: (rows: ValidationFieldRule[]) => void;
  onApplyAi?: () => void;
  suggesting?: boolean;
  aiWarning?: string | null;
  canApplyAi?: boolean;
};

function buildDefaultRows(fields: string[]): ValidationFieldRule[] {
  return fields.map((name, i) => ({
    id: `field-${i}-${name}`,
    fieldName: name,
    tags: [],
    config: { ...DEFAULT_FIELD_RULE_CONFIG },
    flags: {
      key: false,
      mandatory: false,
      null: false,
      email: false,
      mobile: false,
      date: false,
      specialChars: false,
    },
    ruleSource: "default",
  }));
}

function mergeRulesForFields(
  fields: string[],
  initialRules: ValidationFieldRule[] | undefined,
): ValidationFieldRule[] {
  if (!initialRules?.length) {
    return buildDefaultRows(fields);
  }

  const byName = new Map(initialRules.map((rule) => [rule.fieldName, rule]));
  return fields.map((name, i) => {
    const existing = byName.get(name);
    if (existing) {
      return { ...existing, id: `field-${i}-${name}` };
    }
    return buildDefaultRows([name])[0];
  });
}

export function ValidationRulesTable({
  fields,
  initialRules,
  fieldsVersion = 0,
  onRulesChange,
  onApplyAi,
  suggesting = false,
  aiWarning = null,
  canApplyAi = false,
}: ValidationRulesTableProps) {
  const [rows, setRows] = useState<ValidationFieldRule[]>(() =>
    mergeRulesForFields(fields, initialRules),
  );
  const [activeFieldId, setActiveFieldId] = useState<string | null>(null);

  useEffect(() => {
    setRows(mergeRulesForFields(fields, initialRules));
  }, [fields, fieldsVersion, initialRules]);

  useEffect(() => {
    onRulesChange(rows);
  }, [rows, onRulesChange]);

  const activeRow = rows.find((row) => row.id === activeFieldId) ?? null;

  function toggleFlag(rowId: string, flag: RuleFlag) {
    setRows((current) =>
      current.map((row) =>
        row.id === rowId
          ? { ...row, flags: { ...row.flags, [flag]: !row.flags[flag] }, ruleSource: "user" }
          : row,
      ),
    );
  }

  function removeTag(rowId: string, tag: string) {
    setRows((current) =>
      current.map((row) =>
        row.id === rowId
          ? { ...row, tags: row.tags.filter((item) => item !== tag), ruleSource: "user" }
          : row,
      ),
    );
  }

  function handleApplyRules(config: FieldRuleConfig) {
    if (!activeFieldId) return;
    setRows((current) =>
      current.map((row) =>
            row.id === activeFieldId
              ? { ...row, config: { ...config }, tags: buildRuleTags(config), ruleSource: "user" }
              : row,
      ),
    );
    setActiveFieldId(null);
  }

  if (fields.length === 0) {
    return (
      <div className="mb-8 rounded-2xl border border-dashed border-outline-variant p-6 text-center text-sm text-on-surface-variant">
        Upload a source file above to see its columns here.
      </div>
    );
  }

  return (
    <>
      <div className="mb-8 rounded-2xl border border-outline-variant bg-surface-container-lowest p-4 shadow-sm sm:p-6">
        <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <h3 className="text-xl font-semibold leading-7 text-on-surface">
            Validation Rules Configuration
          </h3>
          <div className="flex flex-wrap items-center gap-3">
            <span className="text-xs text-on-surface-variant">
              {fields.length} columns detected
            </span>
            {onApplyAi ? (
              <button
                type="button"
                onClick={onApplyAi}
                disabled={!canApplyAi || suggesting}
                className="inline-flex items-center gap-1.5 rounded-lg bg-primary-container px-3 py-1.5 text-xs font-semibold uppercase tracking-[0.02em] text-on-primary shadow-sm transition-colors hover:bg-primary disabled:opacity-50"
              >
                <AutoAwesomeIcon className="h-3.5 w-3.5" />
                {suggesting ? "Applying..." : "Apply rules with AI"}
              </button>
            ) : null}
          </div>
        </div>

        {aiWarning ? (
          <p className="mb-3 text-xs text-on-surface-variant">{aiWarning}</p>
        ) : null}
        {rows.some((row) => row.ruleSource === "ai") ? (
          <p className="mb-3 rounded-lg bg-primary-container/10 px-3 py-2 text-xs leading-5 text-on-surface-variant">
            Rules came from AI analysis of column names and sample values. They
            are not executed until you click Run. You can change any suggestion.
          </p>
        ) : null}

        <div className="-mx-4 sm:-mx-6">
          <div className="max-h-[min(70vh,36rem)] overflow-auto rounded-lg border border-outline-variant/40">
            <table className="w-full min-w-[900px] border-collapse text-left">
              <thead>
                <tr className="border-b border-outline-variant">
                  <th className="sticky top-0 z-20 bg-surface-container-low px-4 py-3 font-mono text-xs font-medium tracking-wider text-on-surface-variant uppercase shadow-sm">
                    Field Name
                  </th>
                  {RULE_COLUMNS.map((column) => (
                    <th
                      key={column.key}
                      className="sticky top-0 z-20 bg-surface-container-low px-4 py-3 text-center font-mono text-xs font-medium tracking-wider text-on-surface-variant uppercase shadow-sm"
                    >
                      {column.label}
                    </th>
                  ))}
                  <th className="sticky top-0 z-20 bg-surface-container-low px-4 py-3 font-mono text-xs font-medium tracking-wider text-on-surface-variant uppercase shadow-sm">
                    Configure Rules
                  </th>
                </tr>
              </thead>
            <tbody className="divide-y divide-outline-variant/30 text-[13px] leading-[18px] text-on-surface">
              {rows.map((row) => (
                <tr key={row.id} className="transition-colors hover:bg-surface-container-low/50">
                  <td className="px-4 py-3">
                    <div className="font-medium">{row.fieldName}</div>
                    {row.ruleSource === "ai" ? (
                      <span className="mt-1 inline-flex items-center gap-1 rounded bg-primary-container/15 px-1.5 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-primary">
                        <AutoAwesomeIcon className="h-2.5 w-2.5" />
                        AI suggested — you can change this
                      </span>
                    ) : null}
                    {row.tags.length > 0 ? (
                      <div className="mt-1 flex flex-wrap gap-1">
                        {row.tags.map((tag) => (
                          <span
                            key={tag}
                            className="inline-flex items-center gap-1 rounded bg-primary-container/10 px-1.5 py-0.5 text-[10px] font-bold text-primary"
                          >
                            {tag}
                            <button
                              type="button"
                              aria-label={`Remove ${tag}`}
                              onClick={() => removeTag(row.id, tag)}
                              className="cursor-pointer"
                            >
                              <CloseIcon className="h-2.5 w-2.5" />
                            </button>
                          </span>
                        ))}
                      </div>
                    ) : null}
                  </td>
                  {RULE_COLUMNS.map((column) => (
                    <td key={column.key} className="px-4 py-3 text-center">
                      <input
                        type="checkbox"
                        checked={row.flags[column.key]}
                        onChange={() => toggleFlag(row.id, column.key)}
                        className="h-4 w-4 rounded border-outline-variant text-primary accent-primary focus:ring-primary"
                      />
                    </td>
                  ))}
                  <td className="px-4 py-3">
                    <button
                      type="button"
                      onClick={() => setActiveFieldId(row.id)}
                      className="rounded bg-surface-container-high px-3 py-1 text-xs font-semibold uppercase tracking-[0.02em] text-primary transition-all hover:bg-primary hover:text-on-primary"
                    >
                      Define Rules
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          </div>
        </div>
      </div>

      {activeRow ? (
        <AdvancedRulesDialog
          open
          fieldName={activeRow.fieldName}
          initialConfig={activeRow.config}
          onClose={() => setActiveFieldId(null)}
          onApply={handleApplyRules}
        />
      ) : null}
    </>
  );
}
