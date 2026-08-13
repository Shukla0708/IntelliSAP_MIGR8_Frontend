import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { ReconciliationReviewView } from "@/components/comparison/reconciliation-review-view";
import { AppShell } from "@/components/layout/app-shell";
import {
  getAllReconciliationReviewIds,
  getComparisonRunLabel,
  getReconciliationReview,
} from "@/data/comparison-results";

type ComparisonReviewPageProps = {
  params: Promise<{ id: string }>;
};

export function generateStaticParams() {
  return getAllReconciliationReviewIds().map((id) => ({ id }));
}

export async function generateMetadata({
  params,
}: ComparisonReviewPageProps): Promise<Metadata> {
  const { id } = await params;
  const runName = getComparisonRunLabel(id);

  return {
    title: `${runName} | Comparison | MIGR8 AI`,
    description:
      "Review preload vs postload reconciliation discrepancies and exceptions.",
  };
}

export default async function ComparisonReviewPage({
  params,
}: ComparisonReviewPageProps) {
  const { id } = await params;
  const review = getReconciliationReview(id);

  if (!review) notFound();

  return (
    <AppShell mainClassName="flex flex-1 flex-col bg-surface-container-low p-0">
      <ReconciliationReviewView review={review} />
    </AppShell>
  );
}
