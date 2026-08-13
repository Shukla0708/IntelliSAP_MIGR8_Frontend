"use client";

import { useMemo, useState, type ComponentType } from "react";
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
import type {
  FieldMappingRow,
  FieldMappingRowIcon,
  FieldMappingWorkspace,
} from "@/data/field-mapping-workspace";

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

      {row.status === "unmapped" ? (
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
        <button
          type="button"
          onClick={(event) => event.stopPropagation()}
          className="text-[10px] text-primary hover:underline"
        >
          Select Target
        </button>
      </div>

      {selectedProspect ? (
        <p className="font-mono text-[10px] text-on-surface-variant sm:col-span-4 sm:hidden">
          → {selectedProspect.targetField} ({selectedProspect.confidence}%)
        </p>
      ) : null}
    </div>
  );
}

function AiMappingReviewPanel({
  row,
  onApprove,
  onReject,
}: {
  row: FieldMappingRow | null;
  onApprove: () => void;
  onReject: () => void;
}) {
  const selectedProspect = row?.prospects.find(
    (prospect) => prospect.id === row.selectedProspectId,
  );

  if (!row || row.status === "unmapped" || !selectedProspect || !row.aiReview) {
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
              {row.aiReview.confidence}%
            </div>
          </div>
          <div className="flex flex-col gap-3">
            <div className="rounded border border-outline-variant bg-surface-bright p-3">
              <div className="mb-1 flex justify-between">
                <span className="text-[13px] leading-[18px] text-on-surface-variant">
                  Semantic Similarity
                </span>
                <span className="text-[13px] font-medium leading-[18px]">
                  {row.aiReview.semanticSimilarity}%
                </span>
              </div>
              <ProgressBar
                value={row.aiReview.semanticSimilarity}
                barClassName="bg-secondary"
              />
            </div>
            <div className="rounded border border-outline-variant bg-surface-bright p-3">
              <div className="mb-1 flex justify-between">
                <span className="text-[13px] leading-[18px] text-on-surface-variant">
                  Datatype Match
                </span>
                <span className="text-[13px] font-medium leading-[18px] text-success">
                  {row.aiReview.datatypeMatch}%
                </span>
              </div>
              <ProgressBar
                value={row.aiReview.datatypeMatch}
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
            &ldquo;{row.aiReview.reasoning}&rdquo;
          </div>
        </div>
      </div>

      <div className="flex flex-col gap-2 border-t border-outline-variant bg-surface p-6">
        <Button
          type="button"
          size="md"
          fullWidth
          onClick={onApprove}
          className="h-auto gap-2 bg-secondary py-2 text-xs font-semibold uppercase tracking-[0.02em] shadow-none hover:bg-secondary-container"
        >
          <CheckIcon className="h-4 w-4" />
          Approve Mapping
        </Button>
        <div className="grid grid-cols-2 gap-2">
          <Button
            type="button"
            variant="ghost"
            size="md"
            className="h-auto py-2 text-xs font-semibold uppercase tracking-[0.02em]"
          >
            Edit Target
          </Button>
          <Button
            type="button"
            variant="ghost"
            size="md"
            onClick={onReject}
            className="h-auto border-error-container py-2 text-xs font-semibold uppercase tracking-[0.02em] text-error hover:bg-error-container/20"
          >
            Reject
          </Button>
        </div>
      </div>
    </aside>
  );
}

export function FieldMappingWorkspaceView({
  workspace,
}: FieldMappingWorkspaceViewProps) {
  const [rows, setRows] = useState(workspace.rows);
  const [activeRowId, setActiveRowId] = useState(workspace.defaultActiveRowId);
  const [search, setSearch] = useState("");

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

  function handleProspectChange(rowId: string, prospectId: string) {
    setRows((current) =>
      current.map((row) =>
        row.id === rowId ? { ...row, selectedProspectId: prospectId } : row,
      ),
    );
    setActiveRowId(rowId);
  }

  function handleApprove() {
    console.info("Approve mapping clicked (mock)");
  }

  function handleReject() {
    console.info("Reject mapping clicked (mock)");
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
          </div>
        </div>

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

      <AiMappingReviewPanel
        row={activeRow}
        onApprove={handleApprove}
        onReject={handleReject}
      />
    </div>
  );
}
