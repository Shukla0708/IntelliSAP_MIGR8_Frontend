import type { Metadata } from "next";
import type { ReactNode } from "react";

export const metadata: Metadata = {
  title: "Project Report | MIGR8 AI",
  description:
    "Project-scoped migration report with validation, comparison, and field mapping KPIs.",
};

export default function ReportLayout({ children }: { children: ReactNode }) {
  return children;
}
