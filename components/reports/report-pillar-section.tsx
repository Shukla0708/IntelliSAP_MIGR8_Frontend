import type { ComponentType, ReactNode } from "react";
import { SectionCard } from "@/components/dashboard/kpi-card";
import Link from "next/link";

type ReportPillarSectionProps = {
  title: string;
  icon: ComponentType<{ className?: string }>;
  toolHref: string;
  toolLabel: string;
  preview?: boolean;
  children: ReactNode;
};

export function ReportPillarSection({
  title,
  icon: Icon,
  toolHref,
  toolLabel,
  preview = false,
  children,
}: ReportPillarSectionProps) {
  return (
    <SectionCard className="overflow-hidden">
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-outline-variant bg-surface-container-lowest p-4">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded bg-primary-container/10 text-primary">
            <Icon className="h-5 w-5" />
          </div>
          <h3 className="text-xl font-semibold leading-7 text-on-surface">{title}</h3>
          {preview ? (
            <span className="rounded bg-tertiary-container/10 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide text-tertiary">
              Preview data
            </span>
          ) : null}
        </div>
        <Link
          href={toolHref}
          className="inline-flex h-9 items-center justify-center rounded border border-outline-variant px-3 text-xs font-semibold uppercase tracking-wide text-primary transition-colors hover:bg-surface-container-high"
        >
          {toolLabel}
        </Link>
      </div>
      <div className="p-4">{children}</div>
    </SectionCard>
  );
}
