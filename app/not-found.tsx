import { BrandError } from "@/components/ui/brand-error";

export default function NotFound() {
  return (
    <BrandError
      title="Page not found"
      message="That route does not exist in MIGR8. Head back to the dashboard to continue your migration."
    />
  );
}
