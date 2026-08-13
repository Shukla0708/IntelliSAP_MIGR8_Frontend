"use client";

import { useState } from "react";
import { SectionCard } from "@/components/dashboard/kpi-card";
import { CreateProjectDialog } from "@/components/projects/create-project-dialog";
import { Button } from "@/components/ui/button";
import { AddIcon, DatasetIcon } from "@/components/ui/icons";
import { useProject } from "@/contexts/project-context";

export function ProjectsView() {
  const { projects, selectedProject, selectProject, loading } = useProject();
  const [createDialogOpen, setCreateDialogOpen] = useState(false);

  return (
    <>
      <div className="mx-auto w-full max-w-[1200px]">
        <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <h2 className="mb-2 text-[32px] font-semibold leading-10 tracking-[-0.01em] text-on-surface">
              Projects
            </h2>
            <p className="max-w-2xl text-base leading-6 text-on-surface-variant">
              Select an existing migration project or create a new one.
            </p>
          </div>
          <Button
            type="button"
            size="md"
            className="gap-2 self-start sm:self-auto"
            onClick={() => setCreateDialogOpen(true)}
          >
            <AddIcon className="h-4 w-4" />
            Create New Project
          </Button>
        </div>

        <SectionCard className="overflow-hidden">
          <div className="border-b border-outline-variant bg-surface-container-lowest p-4">
            <h3 className="text-xl font-semibold leading-7 text-on-surface">
              Existing Projects
            </h3>
          </div>

          <div className="divide-y divide-outline-variant">
            {loading ? (
              <p className="p-4 text-sm text-on-surface-variant">Loading projects...</p>
            ) : projects.length === 0 ? (
              <p className="p-4 text-sm text-on-surface-variant">
                No projects yet. Create one to start validation.
              </p>
            ) : (
              projects.map((project) => {
                const isSelected = project.id === selectedProject?.id;

                return (
                  <button
                    key={project.id}
                    type="button"
                    onClick={() => selectProject(project.id)}
                    className={[
                      "flex w-full flex-col gap-3 p-4 text-left transition-colors sm:flex-row sm:items-center sm:justify-between",
                      isSelected
                        ? "bg-primary-container/10"
                        : "hover:bg-surface-container-low",
                    ].join(" ")}
                  >
                    <div className="flex items-center gap-4">
                      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded bg-primary-container/10 text-primary">
                        <DatasetIcon className="h-5 w-5" />
                      </div>
                      <div>
                        <p className="text-base font-semibold leading-6 text-on-surface">
                          {project.name}
                        </p>
                        <p className="mt-1 font-mono text-xs font-medium leading-4 text-on-surface-variant">
                          {project.updated}
                        </p>
                      </div>
                    </div>

                    {isSelected ? (
                      <span className="rounded bg-primary-container/20 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide text-primary">
                        Selected
                      </span>
                    ) : null}
                  </button>
                );
              })
            )}
          </div>
        </SectionCard>
      </div>

      <CreateProjectDialog
        open={createDialogOpen}
        onClose={() => setCreateDialogOpen(false)}
      />
    </>
  );
}
