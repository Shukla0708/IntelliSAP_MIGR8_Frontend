"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { AppShell } from "@/components/layout/app-shell";
import { FieldMappingWorkspaceView } from "@/components/field-mapping/field-mapping-workspace-view";
import { JobWaitingScreen } from "@/components/ui/job-waiting-screen";
import type { FieldMappingWorkspace } from "@/data/field-mapping-workspace";
import { getApiErrorMessage } from "@/lib/axios";
import { fetchMappingRunResult, toFieldMappingWorkspace } from "@/lib/mapping-api";
import { untrackJob } from "@/lib/job-tracker";
import { useDefaultProject } from "@/lib/use-default-project";

export default function FieldMappingWorkspacePage() {
  const params = useParams<{ id: string }>();
  const { project } = useDefaultProject();
  const [workspace, setWorkspace] = useState<FieldMappingWorkspace | null>(null);
  const [status, setStatus] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    let timer: number | undefined;

    async function load() {
      try {
        const result = await fetchMappingRunResult(params.id);
        if (cancelled) return;
        setStatus(result.status);
        setError(null);
        if (result.status === "processing") {
          timer = window.setTimeout(() => {
            void load();
          }, 2000);
          return;
        }
        untrackJob({ kind: "mapping", id: params.id });
        if (result.status === "failed") {
          setWorkspace(null);
          return;
        }
        setWorkspace(
          toFieldMappingWorkspace(result, project?.name ?? "Field Mapping"),
        );
      } catch (err) {
        if (!cancelled) setError(getApiErrorMessage(err, "Mapping run not found"));
      }
    }

    void load();
    return () => {
      cancelled = true;
      if (timer) window.clearTimeout(timer);
    };
  }, [params.id, project?.name]);

  if (error) {
    return (
      <AppShell topbarTitle="Field Mapping Results">
        <p className="p-6 text-sm text-error">{error}</p>
      </AppShell>
    );
  }

  if (status === "failed") {
    return (
      <AppShell topbarTitle="Field Mapping Results">
        <div className="mx-auto max-w-xl py-16">
          <h2 className="text-2xl font-semibold text-error">Field mapping failed</h2>
          <p className="mt-2 text-sm text-on-surface-variant">
            The mapping run did not complete. Try starting it again.
          </p>
        </div>
      </AppShell>
    );
  }

  if (!workspace || status === "processing" || status === null) {
    return (
      <AppShell topbarTitle="Field Mapping Results">
        <JobWaitingScreen
          title="Field mapping is running"
          preparingLabel="Matching source fields to SAP targets..."
        />
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
