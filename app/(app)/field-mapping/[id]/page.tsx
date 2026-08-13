import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { FieldMappingWorkspaceView } from "@/components/field-mapping/field-mapping-workspace-view";
import { AppShell } from "@/components/layout/app-shell";
import {
  getAllFieldMappingWorkspaceIds,
  getFieldMappingRunLabel,
  getFieldMappingWorkspace,
} from "@/data/field-mapping-workspace";

type FieldMappingWorkspacePageProps = {
  params: Promise<{ id: string }>;
};

export function generateStaticParams() {
  return getAllFieldMappingWorkspaceIds().map((id) => ({ id }));
}

export async function generateMetadata({
  params,
}: FieldMappingWorkspacePageProps): Promise<Metadata> {
  const { id } = await params;
  const runName = getFieldMappingRunLabel(id);

  return {
    title: `${runName} | Field Mapping | MIGR8 AI`,
    description:
      "Review AI-suggested field mappings between source and SAP target schemas.",
  };
}

export default async function FieldMappingWorkspacePage({
  params,
}: FieldMappingWorkspacePageProps) {
  const { id } = await params;
  const workspace = getFieldMappingWorkspace(id);

  if (!workspace) notFound();

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
