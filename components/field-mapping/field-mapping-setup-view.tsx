"use client";

import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { SchemaUploadPanel } from "@/components/field-mapping/schema-upload-panel";
import { SCHEMA_UPLOAD_CARDS } from "@/data/field-mapping";
import { LATEST_FIELD_MAPPING_RUN_ID } from "@/data/field-mapping-workspace";

export function FieldMappingSetupView() {
  const router = useRouter();

  function handleStartMapping() {
    router.push(`/field-mapping/${LATEST_FIELD_MAPPING_RUN_ID}`);
  }

  return (
    <div className="flex min-h-[calc(100vh-4rem)] flex-col">
      <div className="flex flex-1 flex-col gap-6 overflow-auto p-4 md:p-8">
        <div className="grid h-full min-h-[480px] grid-cols-1 gap-6 lg:grid-cols-2 lg:gap-6">
          {SCHEMA_UPLOAD_CARDS.map((card) => (
            <SchemaUploadPanel key={card.id} card={card} />
          ))}
        </div>
      </div>

      <footer className="sticky bottom-0 z-40 flex items-center justify-end border-t border-outline-variant bg-surface/80 px-4 py-4 shadow-sm backdrop-blur-md md:px-8">
        <Button
          type="button"
          onClick={handleStartMapping}
          className="h-auto rounded bg-primary px-8 py-2 text-xs font-semibold uppercase tracking-[0.02em] text-on-primary shadow-none hover:bg-primary hover:opacity-90"
        >
          Start Mapping
        </Button>
      </footer>
    </div>
  );
}
