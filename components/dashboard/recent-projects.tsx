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
};

export function RecentProjects({ projects }: RecentProjectsProps) {
  return (
    <SectionCard className="overflow-hidden">
      <div className="flex items-center justify-between border-b border-outline-variant bg-surface-container-lowest p-4">
        <h3 className="text-xl font-semibold leading-7 text-on-surface">
          Recent Projects
        </h3>
        <button
          type="button"
          className="flex items-center gap-1 text-xs font-semibold uppercase tracking-[0.02em] leading-4 text-primary hover:underline"
        >
          View All
          <ArrowForwardIcon className="h-4 w-4" />
        </button>
      </div>

      <div className="divide-y divide-outline-variant">
        {projects.map((project) => {
          const Icon = iconMap[project.icon];
          const accent = project.accent ?? "neutral";

          return (
            <div
              key={project.id}
              className="group flex items-center justify-between p-4 transition-colors hover:bg-surface-container-low"
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
            </div>
          );
        })}
      </div>
    </SectionCard>
  );
}
