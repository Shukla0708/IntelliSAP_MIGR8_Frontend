"use client";

import { useMemo, useState, type ComponentType } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import {
  ArrowForwardIcon,
  AutoAwesomeIcon,
  CheckIcon,
  FilterListIcon,
  HelpIcon,
  MailIcon,
  PhoneIcon,
  SearchIcon,
  TagIcon,
} from "@/components/ui/icons";
import { ProgressBar } from "@/components/ui/progress";
import { Dialog } from "@/components/ui/dialog";
import type {
  FieldMappingRow,
  FieldMappingRowIcon,
  FieldMappingWorkspace,
} from "@/data/field-mapping-workspace";
import { getApiErrorMessage } from "@/lib/axios";
import { confirmMapping, type ConfirmMappingField } from "@/lib/mapping-api";

type FieldMappingWorkspaceViewProps = {
  workspace: FieldMappingWorkspace;
};

const rowIconMap: Record<
  FieldMappingRowIcon,
  ComponentType<{ className?: string }>
> = {
  tag: TagIcon,
  mail: MailIcon,
  phone: PhoneIcon,
};

function RowIcon({
  icon,
  className = "h-4 w-4",
}: {
  icon: FieldMappingRowIcon;
  className?: string;
}) {
  const Icon = rowIconMap[icon];
  return <Icon className={`text-outline ${className}`} />;
}

function ConfidenceBadge({
  confidence,
  selected,
}: {
  confidence: number;
  selected: boolean;
}) {
  if (selected) {
    return (
      <span className="rounded border border-primary/20 bg-primary-container/10 px-1.5 text-[10px] font-bold text-primary">
        {confidence}%
      </span>
    );
  }

  return (
    <span className="text-[10px] font-bold text-on-surface-variant">
      {confidence}%
    </span>
  );
}

function MappingTableRow({
  row,
  active,
  onSelect,
  onProspectChange,
}: {
  row: FieldMappingRow;
  active: boolean;
  onSelect: () => void;
  onProspectChange: (prospectId: string) => void;
}) {
  const selectedProspect = row.prospects.find(
    (prospect) => prospect.id === row.selectedProspectId,
  );

  return (
    <div
      role="button"
      tabIndex={0}
      onClick={onSelect}
      onKeyDown={(event) => {
        if (event.key === "Enter" || event.key === " ") {
          event.preventDefault();
          onSelect();
        }
      }}
      className={[
        "group grid cursor-pointer grid-cols-1 items-center gap-3 border-b border-outline-variant px-4 py-3 transition-colors sm:grid-cols-[1fr_40px_1fr_auto] sm:gap-4",
        active
          ? "border-l-4 border-l-secondary bg-surface-container-low"
          : "border-l-4 border-l-transparent hover:bg-primary/[0.04]",
      ].join(" ")}
    >
      <div className="flex items-center gap-2">
        <RowIcon icon={row.icon} />
        <span
          className={`font-mono text-xs font-medium leading-4 ${
            active ? "font-bold text-on-surface" : "text-on-surface"
          }`}
        >
          {row.sourceField}
        </span>
        {row.keyField ? (
          <span className="inline-flex items-center gap-1 rounded border border-tertiary/30 bg-tertiary/10 px-1.5 py-0.5 text-[10px] font-semibold uppercase tracking-[0.02em] text-tertiary">
            Key Field
          </span>
        ) : null}
        {row.confirmed ? (
          <span className="inline-flex items-center gap-1 rounded border border-success/30 bg-success/10 px-1.5 py-0.5 text-[10px] font-semibold uppercase tracking-[0.02em] text-success">
            <CheckIcon className="h-3 w-3" />
            Approved
          </span>
        ) : null}
      </div>

      <div
        className={`hidden justify-center sm:flex ${
          active
            ? "text-primary"
            : "text-outline-variant transition-colors group-hover:text-primary"
        }`}
      >
        <ArrowForwardIcon className="h-5 w-5" />
      </div>

      <div className="sm:hidden">
        <ArrowForwardIcon className="h-4 w-4 text-outline-variant" />
      </div>

      {row.requiresManualMapping ? (
        <div
          className="flex flex-col gap-1 py-1 sm:col-start-3"
          onClick={(event) => event.stopPropagation()}
        >
          <ManualTargetPicker row={row} onSelect={onProspectChange} />
        </div>
      ) : row.status === "unmapped" ? (
        <div className="flex items-center gap-2 text-outline sm:col-start-3">
          <HelpIcon className="h-4 w-4" />
          <span className="font-mono text-xs font-medium italic leading-4">
            Unmapped
          </span>
        </div>
      ) : (
        <div
          className="flex flex-col gap-2 py-1 sm:col-start-3"
          onClick={(event) => event.stopPropagation()}
        >
          {row.prospects.map((prospect) => {
            const selected = row.selectedProspectId === prospect.id;

            return (
              <label
                key={prospect.id}
                className={`group/item flex cursor-pointer items-center gap-2 ${
                  selected ? "" : "opacity-60 transition-opacity hover:opacity-100"
                }`}
              >
                <input
                  type="radio"
                  name={`${row.id}_target`}
                  checked={selected}
                  onChange={() => onProspectChange(prospect.id)}
                  className="h-4 w-4 border-outline-variant text-primary focus:ring-primary/20"
                />
                <div className="flex flex-1 items-center gap-2">
                  <RowIcon icon={row.icon} />
                  <span
                    className={`font-mono text-xs font-medium leading-4 ${
                      selected ? "font-bold" : ""
                    }`}
                  >
                    {prospect.targetField}
                  </span>
                </div>
                <ConfidenceBadge
                  confidence={prospect.confidence}
                  selected={selected}
                />
              </label>
            );
          })}
        </div>
      )}

      <div className="flex justify-end sm:col-start-4">
        {!row.requiresManualMapping ? (
          <button
            type="button"
            onClick={(event) => event.stopPropagation()}
            className="text-[10px] text-primary hover:underline"
          >
            Select Target
          </button>
        ) : null}
      </div>

      {selectedProspect ? (
        <p className="font-mono text-[10px] text-on-surface-variant sm:col-span-4 sm:hidden">
          → {selectedProspect.targetField}
          {row.requiresManualMapping ? "" : ` (${selectedProspect.confidence}%)`}
        </p>
      ) : null}
    </div>
  );
}

function ManualTargetPicker({
  row,
  onSelect,
}: {
  row: FieldMappingRow;
  onSelect: (prospectId: string) => void;
}) {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const selected = row.prospects.find(
    (prospect) => prospect.id === row.selectedProspectId,
  );

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return row.prospects;
    return row.prospects.filter(
      (prospect) =>
        prospect.targetField.toLowerCase().includes(q) ||
        (prospect.targetDescription ?? "").toLowerCase().includes(q),
    );
  }, [query, row.prospects]);

  function handlePick(prospectId: string) {
    onSelect(prospectId);
    setOpen(false);
    setQuery("");
  }

  return (
    <>
      <div className="flex items-center gap-2">
        {selected ? (
          <span className="font-mono text-xs font-bold leading-4 text-on-surface">
            {selected.targetField}
          </span>
        ) : (
          <span className="text-xs italic leading-4 text-on-surface-variant">
            Not selected
          </span>
        )}
        <button
          type="button"
          onClick={() => setOpen(true)}
          className="text-[10px] text-primary hover:underline"
        >
          {selected ? "Change" : "Select Target Field"}
        </button>
      </div>

      <Dialog
        open={open}
        title={`Select target field for ${row.sourceField}`}
        onClose={() => setOpen(false)}
      >
        <div className="flex flex-col gap-3">
          <input
            type="text"
            autoFocus
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Filter by SAP field or description..."
            className="w-full rounded border border-outline-variant bg-surface-bright px-3 py-2 text-sm text-on-surface placeholder:text-on-surface-variant focus:border-primary focus:outline-none"
          />
          <ul className="max-h-96 divide-y divide-outline-variant overflow-auto rounded border border-outline-variant">
            {filtered.length === 0 ? (
              <li className="px-3 py-3 text-sm text-on-surface-variant">
                No matching target fields
              </li>
            ) : (
              filtered.map((prospect) => (
                <li key={prospect.id}>
                  <button
                    type="button"
                    onClick={() => handlePick(prospect.id)}
                    className={`w-full px-3 py-2 text-left transition-colors hover:bg-surface-container-high ${
                      prospect.id === row.selectedProspectId
                        ? "bg-primary-container/10"
                        : ""
                    }`}
                  >
                    <div className="font-mono text-xs font-semibold text-on-surface">
                      {prospect.targetField}
                    </div>
                    {prospect.targetDescription ? (
                      <div className="text-[12px] leading-4 text-on-surface-variant">
                        {prospect.targetDescription}
                      </div>
                    ) : null}
                  </button>
                </li>
              ))
            )}
          </ul>
        </div>
      </Dialog>
    </>
  );
}

function AiMappingReviewPanel({
  row,
}: {
  row: FieldMappingRow | null;
}) {
  const selectedProspect = row?.prospects.find(
    (prospect) => prospect.id === row.selectedProspectId,
  );

  if (!row || !selectedProspect) {
    return (
      <aside className="flex w-full flex-col overflow-hidden rounded-[20px] border border-outline-variant bg-surface shadow-ambient lg:w-[400px] lg:shrink-0">
        <div className="border-b border-outline-variant bg-secondary-container/10 p-6">
          <div className="mb-2 flex items-center gap-2 text-outline">
            <AutoAwesomeIcon className="h-4 w-4" />
            <span className="text-xs font-semibold uppercase tracking-[0.05em] leading-4">
              AI Mapping Review
            </span>
          </div>
          <p className="text-sm leading-5 text-on-surface-variant">
            Select a mapped source field to review AI suggestions and confidence
            breakdown.
          </p>
        </div>
        <div className="flex flex-1 items-center justify-center p-6 text-center text-sm text-on-surface-variant">
          No mapping selected for review.
        </div>
      </aside>
    );
  }

  if (row.requiresManualMapping) {
    return (
      <aside className="flex w-full flex-col overflow-hidden rounded-[20px] border border-outline-variant bg-surface shadow-ambient lg:w-[400px] lg:shrink-0">
        <div className="border-b border-outline-variant bg-secondary-container/10 p-6">
          <div className="mb-2 flex items-center gap-2 text-outline">
            <AutoAwesomeIcon className="h-4 w-4" />
            <span className="text-xs font-semibold uppercase tracking-[0.05em] leading-4">
              AI Mapping Review
            </span>
          </div>
          <div className="flex flex-wrap items-center gap-3">
            <span className="rounded border border-outline-variant bg-surface px-2 py-1 font-mono text-xs font-medium leading-4">
              {row.sourceField}
            </span>
            <ArrowForwardIcon className="h-4 w-4 text-outline" />
            <span className="rounded border border-outline-variant bg-surface px-2 py-1 font-mono text-xs font-medium leading-4">
              {selectedProspect.targetField}
            </span>
          </div>
        </div>
        <div className="flex flex-1 items-center justify-center p-6 text-center text-sm text-on-surface-variant">
          Manually selected target field — no AI confidence data is available
          for key fields under an internal number range.
        </div>
      </aside>
    );
  }

  return (
    <aside className="flex w-full flex-col overflow-hidden rounded-[20px] border border-outline-variant bg-surface shadow-ambient lg:w-[400px] lg:shrink-0">
      <div className="border-b border-outline-variant bg-secondary-container/10 p-6">
        <div className="mb-2 flex items-center gap-2 text-outline">
          <AutoAwesomeIcon className="h-4 w-4" />
          <span className="text-xs font-semibold uppercase tracking-[0.05em] leading-4">
            AI Mapping Review
          </span>
        </div>
        <div className="flex flex-wrap items-center gap-3">
          <span className="rounded border border-outline-variant bg-surface px-2 py-1 font-mono text-xs font-medium leading-4">
            {row.sourceField}
          </span>
          <ArrowForwardIcon className="h-4 w-4 text-outline" />
          <span className="rounded border border-outline-variant bg-surface px-2 py-1 font-mono text-xs font-medium leading-4">
            {selectedProspect.targetField}
          </span>
        </div>
      </div>

      <div className="flex flex-1 flex-col gap-6 overflow-auto p-6">
        <div>
          <div className="mb-2 flex items-end justify-between">
            <h3 className="text-xs font-semibold uppercase tracking-[0.05em] leading-4 text-outline">
              Confidence Breakdown
            </h3>
            <div className="text-2xl font-bold leading-8 text-secondary">
              {selectedProspect.confidence}%
            </div>
          </div>
          <div className="flex flex-col gap-3">
            <div className="rounded border border-outline-variant bg-surface-bright p-3">
              <div className="mb-1 flex justify-between">
                <span className="text-[13px] leading-[18px] text-on-surface-variant">
                  Semantic Similarity
                </span>
                <span className="text-[13px] font-medium leading-[18px]">
                  {selectedProspect.semanticSimilarity ?? 0}%
                </span>
              </div>
              <ProgressBar
                value={selectedProspect.semanticSimilarity ?? 0}
                barClassName="bg-secondary"
              />
            </div>
            <div className="rounded border border-outline-variant bg-surface-bright p-3">
              <div className="mb-1 flex justify-between">
                <span className="text-[13px] leading-[18px] text-on-surface-variant">
                  Datatype Match
                </span>
                <span className="text-[13px] font-medium leading-[18px] text-success">
                  {selectedProspect.datatypeMatch ?? 0}%
                </span>
              </div>
              <ProgressBar
                value={selectedProspect.datatypeMatch ?? 0}
                barClassName="bg-success"
              />
            </div>
          </div>
        </div>

        <div>
          <h3 className="mb-2 text-xs font-semibold uppercase tracking-[0.05em] leading-4 text-outline">
            AI Reasoning
          </h3>
          <div className="rounded border border-outline-variant bg-surface-bright p-4 text-[13px] leading-relaxed text-on-surface-variant">
            &ldquo;{selectedProspect.reasoning ?? "No reasoning available."}&rdquo;
          </div>
        </div>
      </div>
    </aside>
  );
}

export function FieldMappingWorkspaceView({
  workspace,
}: FieldMappingWorkspaceViewProps) {
  const router = useRouter();
  const [rows, setRows] = useState(workspace.rows);
  const [activeRowId, setActiveRowId] = useState(workspace.defaultActiveRowId);
  const [search, setSearch] = useState("");
  const [approving, setApproving] = useState(false);
  const [approveError, setApproveError] = useState<string | null>(null);

  const filteredRows = useMemo(() => {
    const query = search.trim().toLowerCase();
    if (!query) return rows;

    return rows.filter((row) => {
      const sourceMatch = row.sourceField.toLowerCase().includes(query);
      const targetMatch = row.prospects.some((prospect) =>
        prospect.targetField.toLowerCase().includes(query),
      );
      return sourceMatch || targetMatch;
    });
  }, [rows, search]);

  const activeRow = rows.find((row) => row.id === activeRowId) ?? null;

  const hasUnmappedFields = rows.some((row) => !row.selectedProspectId);

  const fieldsReadyToConfirm: ConfirmMappingField[] = rows.flatMap((row) => {
    const selectedProspect = row.prospects.find(
      (prospect) => prospect.id === row.selectedProspectId,
    );
    return selectedProspect
      ? [{ sourceField: row.sourceField, targetField: selectedProspect.targetField }]
      : [];
  });

  function handleProspectChange(rowId: string, prospectId: string) {
    setRows((current) =>
      current.map((row) =>
        row.id === rowId ? { ...row, selectedProspectId: prospectId } : row,
      ),
    );
    setActiveRowId(rowId);
  }

  async function handleApprove() {
    if (rows.length === 0 || hasUnmappedFields) {
      setApproveError("All fields must be mapped before approving.");
      return;
    }

    setApproveError(null);
    setApproving(true);
    try {
      await confirmMapping(workspace.id, fieldsReadyToConfirm);
      router.push("/field-mapping");
    } catch (err) {
      setApproveError(getApiErrorMessage(err, "Failed to confirm mappings"));
      setApproving(false);
    }
  }

  return (
    <div className="flex h-[calc(100vh-4rem)] flex-col gap-5 overflow-hidden p-4 md:p-6 xl:flex-row xl:gap-5">
      <section className="flex min-h-0 flex-1 flex-col overflow-hidden rounded-[20px] border border-outline-variant bg-surface shadow-ambient">
        <div className="flex flex-col gap-3 border-b border-outline-variant bg-surface/50 p-4 backdrop-blur sm:flex-row sm:items-center sm:justify-between">
          <h2 className="text-xl font-semibold leading-7 text-on-surface">
            Source → SAP Field Mapping
          </h2>
          <div className="flex flex-wrap gap-2">
            <div className="relative min-w-[180px] flex-1 sm:flex-none">
              <SearchIcon className="pointer-events-none absolute top-1/2 left-2 h-4 w-4 -translate-y-1/2 text-outline" />
              <input
                type="search"
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                placeholder="Search fields..."
                className="w-full rounded border border-outline-variant bg-surface-bright py-1.5 pr-3 pl-8 text-[13px] leading-[18px] text-on-surface placeholder:text-on-surface-variant focus:border-primary focus:ring-2 focus:ring-primary/20 focus:outline-none sm:w-52"
              />
            </div>
            <button
              type="button"
              className="inline-flex items-center gap-1 rounded border border-outline-variant px-3 py-1.5 text-[13px] leading-[18px] transition-colors hover:bg-surface-variant/50"
            >
              <FilterListIcon className="h-4 w-4" />
              Filter
            </button>
            <Button
              type="button"
              size="md"
              onClick={handleApprove}
              disabled={approving || hasUnmappedFields || rows.length === 0}
              className="h-auto gap-2 bg-secondary px-3 py-1.5 text-[13px] font-semibold uppercase tracking-[0.02em] shadow-none hover:bg-secondary-container"
            >
              <CheckIcon className="h-4 w-4" />
              {approving ? "Approving..." : "Approve Mapping"}
            </Button>
          </div>
        </div>
        {approveError ? (
          <p className="border-b border-outline-variant bg-error-container/10 px-4 py-2 text-xs text-error" role="alert">
            {approveError}
          </p>
        ) : null}

        <div className="min-h-0 flex-1 overflow-auto p-4">
          <div className="sticky top-0 z-10 mb-2 hidden border-b border-outline-variant bg-surface px-4 py-2 sm:grid sm:grid-cols-[1fr_40px_1fr_auto] sm:gap-4">
            <div className="text-xs font-semibold uppercase tracking-wider text-outline">
              Source Field
            </div>
            <div />
            <div className="text-xs font-semibold uppercase tracking-wider text-outline">
              Target SAP Fields
            </div>
            <div className="w-24 text-right text-xs font-semibold uppercase tracking-wider text-outline">
              Change mapping
            </div>
          </div>

          <div>
            {filteredRows.map((row) => (
              <MappingTableRow
                key={row.id}
                row={row}
                active={row.id === activeRowId}
                onSelect={() => setActiveRowId(row.id)}
                onProspectChange={(prospectId) =>
                  handleProspectChange(row.id, prospectId)
                }
              />
            ))}
          </div>
        </div>
      </section>

      <AiMappingReviewPanel row={activeRow} />
    </div>
  );
}
