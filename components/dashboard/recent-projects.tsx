"use client";

import Link from "next/link";
import type { ComponentType } from "react";
import {
  ArrowForwardIcon,
  DraftIcon,
  InventoryIcon,
  SyncIcon,
} from "@/components/ui/icons";
import { SectionCard } from "@/components/dashboard/kpi-card";
import type { RecentProject } from "@/data/dashboard";

const iconMap: Record<
  RecentProject["icon"],
  ComponentType<{ className?: string }>
> = {
  sync: SyncIcon,
  inventory: InventoryIcon,
  draft: DraftIcon,
};

const accentStyles: Record<
  NonNullable<RecentProject["accent"]>,
  string
> = {
  primary: "bg-primary-container/10 text-primary",
  neutral: "bg-surface-container-high text-on-surface",
  muted: "bg-surface-container-high text-outline",
};

type RecentProjectsProps = {
  projects: RecentProject[];
  onSelectProject?: (projectId: string) => void;
};

export function RecentProjects({
  projects,
  onSelectProject,
}: RecentProjectsProps) {
  return (
    <SectionCard className="overflow-hidden">
      <div className="flex items-center justify-between border-b border-outline-variant bg-surface-container-lowest p-4">
        <h3 className="text-xl font-semibold leading-7 text-on-surface">
          Recent Projects
        </h3>
        <Link
          href="/projects"
          className="flex items-center gap-1 text-xs font-semibold uppercase tracking-[0.02em] leading-4 text-primary hover:underline"
        >
          View All
          <ArrowForwardIcon className="h-4 w-4" />
        </Link>
      </div>

      <div className="divide-y divide-outline-variant">
        {projects.length === 0 ? (
          <p className="p-4 text-sm text-on-surface-variant">
            No projects yet.{" "}
            <Link href="/projects" className="font-semibold text-primary hover:underline">
              Create your first project
            </Link>
            .
          </p>
        ) : (
          projects.map((project) => {
            const Icon = iconMap[project.icon];
            const accent = project.accent ?? "neutral";

            return (
              <button
                key={project.id}
                type="button"
                onClick={() => onSelectProject?.(project.id)}
                className="group flex w-full items-center justify-between p-4 text-left transition-colors hover:bg-surface-container-low"
              >
                <div className="flex items-center gap-4">
                  <div
                    className={`flex h-10 w-10 items-center justify-center rounded ${accentStyles[accent]}`}
                  >
                    <Icon className="h-5 w-5" />
                  </div>
                  <div>
                    <p className="text-base font-semibold leading-6 text-on-surface transition-colors group-hover:text-primary">
                      {project.name}
                    </p>
                    <div className="mt-1 flex flex-wrap items-center gap-x-4 gap-y-1">
                      <span className="font-mono text-xs font-medium leading-4 text-on-surface-variant">
                        {project.records}
                      </span>
                      <span className="text-xs text-outline">•</span>
                      <span className="font-mono text-xs font-medium leading-4 text-on-surface-variant">
                        {project.updated}
                      </span>
                    </div>
                  </div>
                </div>
              </button>
            );
          })
        )}
      </div>
    </SectionCard>
  );
}
