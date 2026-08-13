"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Dialog } from "@/components/ui/dialog";
import { useProject } from "@/contexts/project-context";

type ProjectPickerDialogProps = {
  open: boolean;
  onClose: () => void;
  /** Path to navigate after a project is confirmed, e.g. `/validation/new` */
  targetHref: string;
  title?: string;
  description?: string;
};

/**
 * Confirms which project a create-flow should use when none is selected yet
 * (Activity lists, or Current project with no sidebar selection).
 * If a project is already selected, Current project New buttons skip this dialog.
 */
export function ProjectPickerDialog({
  open,
  onClose,
  targetHref,
  title = "Choose a project",
  description = "New work is always created under a specific project.",
}: ProjectPickerDialogProps) {
  const router = useRouter();
  const { projects, selectedProject, selectProject, loading } = useProject();
  const [pickedId, setPickedId] = useState<string | null>(null);

  useEffect(() => {
    if (!open) return;
    setPickedId(selectedProject?.id ?? projects[0]?.id ?? null);
  }, [open, selectedProject?.id, projects]);

  function handleContinue() {
    if (!pickedId) return;
    selectProject(pickedId);
    onClose();
    const separator = targetHref.includes("?") ? "&" : "?";
    router.push(`${targetHref}${separator}project=${pickedId}`);
  }

  return (
    <Dialog
      open={open}
      title={title}
      onClose={onClose}
      footer={
        <>
          <Button type="button" variant="ghost" size="md" onClick={onClose}>
            Cancel
          </Button>
          <Button
            type="button"
            size="md"
            onClick={handleContinue}
            disabled={!pickedId || loading}
          >
            Continue
          </Button>
        </>
      }
    >
      <p className="text-sm leading-6 text-on-surface-variant">{description}</p>

      {loading ? (
        <p className="text-sm text-on-surface-variant">Loading projects…</p>
      ) : projects.length === 0 ? (
        <p className="rounded bg-error-container/20 px-3 py-2 text-sm text-error">
          You don&apos;t have any projects yet. Create one from Projects first.
        </p>
      ) : (
        <div className="max-h-56 space-y-1 overflow-y-auto rounded-lg border border-outline-variant">
          {projects.map((project) => {
            const selected = project.id === pickedId;
            return (
              <button
                key={project.id}
                type="button"
                onClick={() => setPickedId(project.id)}
                className={[
                  "flex w-full items-center px-4 py-3 text-left text-sm font-semibold transition-colors",
                  selected
                    ? "bg-primary-container/10 text-primary"
                    : "text-on-surface hover:bg-surface-container-high",
                ].join(" ")}
              >
                {project.name}
              </button>
            );
          })}
        </div>
      )}
    </Dialog>
  );
}
