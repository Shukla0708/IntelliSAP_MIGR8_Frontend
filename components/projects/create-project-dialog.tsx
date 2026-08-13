"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Dialog } from "@/components/ui/dialog";
import { TextField } from "@/components/ui/text-field";
import { useProject } from "@/contexts/project-context";

type CreateProjectDialogProps = {
  open: boolean;
  onClose: () => void;
};

export function CreateProjectDialog({ open, onClose }: CreateProjectDialogProps) {
  const { createProject } = useProject();
  const [projectName, setProjectName] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  function handleClose() {
    setProjectName("");
    setError(null);
    onClose();
  }

  async function handleCreate() {
    const name = projectName.trim();
    if (!name || submitting) return;
    setSubmitting(true);
    setError(null);
    try {
      await createProject(name);
      handleClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not create project");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <Dialog
      open={open}
      title="Create New Project"
      onClose={handleClose}
      footer={
        <>
          <Button type="button" variant="ghost" size="md" onClick={handleClose}>
            Cancel
          </Button>
          <Button
            type="button"
            size="md"
            onClick={handleCreate}
            disabled={!projectName.trim() || submitting}
          >
            {submitting ? "Creating..." : "Create"}
          </Button>
        </>
      }
    >
      {error ? (
        <p className="mb-3 rounded bg-error-container/20 px-3 py-2 text-sm text-error">
          {error}
        </p>
      ) : null}
      <TextField
        id="project-name"
        label="Project Name"
        placeholder="Enter project name"
        value={projectName}
        onChange={(event) => setProjectName(event.target.value)}
        autoFocus
      />
    </Dialog>
  );
}
