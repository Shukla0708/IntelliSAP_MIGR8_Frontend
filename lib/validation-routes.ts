import type { ValidationRunStatus } from "@/data/validation";

export function validationRunHref(run: {
  id: string;
  status: ValidationRunStatus | string;
}): string {
  if (run.status === "draft" || run.status === "rules_configured") {
    return `/validation/${run.id}`;
  }
  return `/validation_result/${run.id}`;
}

export function isEditableValidationStatus(status: string): boolean {
  return status === "draft" || status === "rules_configured";
}
