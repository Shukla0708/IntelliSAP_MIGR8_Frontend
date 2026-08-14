"use client";

import Link from "next/link";
import { useState, type ComponentType, type ReactNode } from "react";
import { SectionCard } from "@/components/dashboard/kpi-card";
import { ExpandMoreIcon } from "@/components/ui/icons";

type CollapsiblePillarProps = {
  title: string;
  icon: ComponentType<{ className?: string }>;
  toolHref: string;
  toolLabel: string;
  summary: string;
  defaultOpen?: boolean;
  children: ReactNode;
};

export function CollapsiblePillar({
  title,
  icon: Icon,
  toolHref,
  toolLabel,
  summary,
  defaultOpen = false,
  children,
}: CollapsiblePillarProps) {
  const [open, setOpen] = useState(defaultOpen);

  return (
    <SectionCard className="overflow-hidden shadow-ambient">
      <div className="flex items-center gap-2 border-b border-outline-variant bg-surface-container-lowest px-4 py-3">
        <button
          type="button"
          onClick={() => setOpen((value) => !value)}
          className="flex min-w-0 flex-1 items-center gap-3 text-left"
          aria-expanded={open}
        >
          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded bg-primary-container/10 text-primary">
            <Icon className="h-5 w-5" />
          </div>
          <div className="min-w-0 flex-1">
            <div className="flex flex-wrap items-center gap-2">
              <h3 className="text-base font-semibold text-on-surface">{title}</h3>
              <span className="rounded-full bg-surface-container-high px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-on-surface-variant">
                {summary}
              </span>
            </div>
          </div>
          <ExpandMoreIcon
            className={`h-5 w-5 shrink-0 text-on-surface-variant transition-transform ${
              open ? "rotate-180" : ""
            }`}
          />
        </button>
        <Link
          href={toolHref}
          className="hidden shrink-0 rounded border border-outline-variant px-3 py-1.5 text-[10px] font-semibold uppercase tracking-wide text-primary transition-colors hover:bg-surface-container-high sm:inline-flex"
        >
          {toolLabel}
        </Link>
      </div>
      {open ? <div className="p-4">{children}</div> : null}
    </SectionCard>
  );
}
