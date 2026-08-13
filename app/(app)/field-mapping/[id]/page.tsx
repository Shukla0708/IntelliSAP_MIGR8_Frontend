"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { AppShell } from "@/components/layout/app-shell";
import { FieldMappingWorkspaceView } from "@/components/field-mapping/field-mapping-workspace-view";
import type { FieldMappingWorkspace } from "@/data/field-mapping-workspace";
import { getApiErrorMessage } from "@/lib/axios";
import { fetchMappingRunResult, toFieldMappingWorkspace } from "@/lib/mapping-api";
import { useDefaultProject } from "@/lib/use-default-project";

export default function FieldMappingWorkspacePage() {
  const params = useParams<{ id: string }>();
  const { project } = useDefaultProject();
  const [workspace, setWorkspace] = useState<FieldMappingWorkspace | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    fetchMappingRunResult(params.id)
      .then((result) => {
        if (cancelled) return;
        setWorkspace(
          toFieldMappingWorkspace(result, project?.name ?? "Field Mapping"),
        );
      })
      .catch((err) => {
        if (!cancelled) setError(getApiErrorMessage(err, "Mapping run not found"));
      });

    return () => {
      cancelled = true;
    };
  }, [params.id, project?.name]);

  if (error) {
    return (
      <AppShell topbarTitle="Field Mapping Results">
        <p className="p-6 text-sm text-error">{error}</p>
      </AppShell>
    );
  }

  if (!workspace) {
    return (
      <AppShell topbarTitle="Field Mapping Results">
        <p className="p-6 text-sm text-on-surface-variant">
          Loading mapping run...
        </p>
      </AppShell>
    );
  }

  return (
    <AppShell
      mainClassName="flex flex-1 flex-col bg-background p-0"
      topbarLeading={
        <div className="flex min-w-0 flex-wrap items-center gap-2">
          <span className="truncate text-xs font-semibold uppercase tracking-[0.02em] leading-4 text-primary">
            {workspace.projectName}
          </span>
        </div>
      }
    >
      <FieldMappingWorkspaceView workspace={workspace} />
    </AppShell>
  );
}
