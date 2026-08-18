"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { NumberRangeDialog } from "@/components/field-mapping/number-range-dialog";
import { SchemaUploadPanel } from "@/components/field-mapping/schema-upload-panel";
import { SCHEMA_UPLOAD_CARDS } from "@/data/field-mapping";
import { getApiErrorMessage } from "@/lib/axios";
import { createMappingRun, fetchSapTableFields, type NumberRangeType } from "@/lib/mapping-api";
import { useDefaultProject } from "@/lib/use-default-project";

export function FieldMappingSetupView() {
  const router = useRouter();
  const { project } = useDefaultProject();
  const [sourceFile, setSourceFile] = useState<File | null>(null);
  const [targetFile, setTargetFile] = useState<File | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [sapBusy, setSapBusy] = useState(false);
  const [sapError, setSapError] = useState<string | null>(null);
  const [numberRangeDialogOpen, setNumberRangeDialogOpen] = useState(false);

  const files: Record<"source" | "target", File | null> = {
    source: sourceFile,
    target: targetFile,
  };

  function handleFileSelected(cardId: "source" | "target", file: File) {
    if (cardId === "source") setSourceFile(file);
    else setTargetFile(file);
  }

  async function handleSapFetch(table: string) {
    setSapError(null);
    setSapBusy(true);
    try {
      const result = await fetchSapTableFields(table);
      const header = "SAP Table,SAP Field,Description,Datatype,Length";
      const lines = result.fields.map((field) => {
        const sapTable = field.sap_table || result.table;
        const sapField = field.sap_field || "";
        const desc = String(field.description || "").replaceAll(",", " ");
        return `${sapTable},${sapField},${desc},${field.datatype || ""},${field.length ?? ""}`;
      });
      const csv = [header, ...lines].join("\n");
      const file = new File([csv], `${result.table}-ddic.csv`, { type: "text/csv" });
      setTargetFile(file);
    } catch (err) {
      setSapError(getApiErrorMessage(err, "Could not fetch SAP fields. Upload a target file instead."));
    } finally {
      setSapBusy(false);
    }
  }

  function handleStartMapping() {
    if (!project) {
      setError("Select a project before starting a field mapping run.");
      return;
    }
    if (!sourceFile || !targetFile) {
      setError("Upload both a source and target field list to continue.");
      return;
    }

    setError(null);
    setNumberRangeDialogOpen(true);
  }

  async function handleNumberRangeConfirm(
    numberRangeType: NumberRangeType,
    mappingName: string,
  ) {
    setNumberRangeDialogOpen(false);

    if (!project || !sourceFile || !targetFile) return;

    setSubmitting(true);
    try {
      const result = await createMappingRun(
        project.id,
        sourceFile,
        targetFile,
        numberRangeType,
        mappingName,
      );
      router.push(`/field-mapping/${result.mappingRunId}`);
    } catch (err) {
      setError(getApiErrorMessage(err, "Failed to start field mapping run"));
      setSubmitting(false);
    }
  }

  return (
    <div className="flex min-h-[calc(100vh-4rem)] flex-col">
      <div className="flex flex-1 flex-col gap-6 overflow-auto p-4 md:p-8">
        <div className="grid h-full min-h-[480px] grid-cols-1 gap-6 lg:grid-cols-2 lg:gap-6">
          {SCHEMA_UPLOAD_CARDS.map((card) => (
            <SchemaUploadPanel
              key={card.id}
              card={card}
              file={files[card.id]}
              onFileSelected={(file) => handleFileSelected(card.id, file)}
              sapBusy={card.id === "target" ? sapBusy : undefined}
              sapError={card.id === "target" ? sapError : undefined}
              onSapFetch={card.id === "target" ? handleSapFetch : undefined}
            />
          ))}
        </div>
        {error ? (
          <p className="text-sm text-error" role="alert">
            {error}
          </p>
        ) : null}
      </div>

      <footer className="sticky bottom-0 z-40 flex items-center justify-end border-t border-outline-variant bg-surface/80 px-4 py-4 shadow-sm backdrop-blur-md md:px-8">
        <Button
          type="button"
          onClick={handleStartMapping}
          disabled={submitting || !sourceFile || !targetFile}
          className="h-auto rounded bg-primary px-8 py-2 text-xs font-semibold uppercase tracking-[0.02em] text-on-primary shadow-none hover:bg-primary hover:opacity-90"
        >
          {submitting ? "Starting mapping..." : "Start Mapping"}
        </Button>
      </footer>

      <NumberRangeDialog
        open={numberRangeDialogOpen}
        onClose={() => setNumberRangeDialogOpen(false)}
        onConfirm={handleNumberRangeConfirm}
      />
    </div>
  );
}
