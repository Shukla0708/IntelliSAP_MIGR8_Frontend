import type { ComponentType, ReactNode } from "react";
import {
  CheckCircleIcon,
  DifferenceIcon,
  TrendingUpIcon,
  WarningIcon,
} from "@/components/ui/icons";
import type { KpiMetric, KpiTone } from "@/data/dashboard";

const toneStyles: Record<
  KpiTone,
  { card: string; label: string; value: string; icon: string }
> = {
  default: {
    card: "border-outline-variant bg-surface",
    label: "text-on-surface-variant",
    value: "text-on-surface",
    icon: "text-outline",
  },
  primary: {
    card: "border-outline-variant bg-surface",
    label: "text-on-surface-variant",
    value: "text-primary",
    icon: "text-outline",
  },
  error: {
    card: "border-error/30 bg-error-container/10",
    label: "text-error",
    value: "text-error",
    icon: "text-error",
  },
  tertiary: {
    card: "border-tertiary-container/30 bg-tertiary-container/5",
    label: "text-tertiary",
    value: "text-tertiary",
    icon: "text-tertiary",
  },
};

const iconMap: Record<
  NonNullable<KpiMetric["icon"]>,
  ComponentType<{ className?: string }>
> = {
  trendingUp: TrendingUpIcon,
  check: CheckCircleIcon,
  warning: WarningIcon,
  difference: DifferenceIcon,
};

type KpiCardProps = {
  metric: KpiMetric;
};

export function KpiCard({ metric }: KpiCardProps) {
  const tone = metric.tone ?? "default";
  const styles = toneStyles[tone];
  const Icon = metric.icon ? iconMap[metric.icon] : null;

  return (
    <div
      className={`rounded-xl border p-4 shadow-sm transition-shadow hover:shadow-md ${styles.card}`}
    >
      <p
        className={`mb-2 text-xs font-semibold tracking-wider uppercase leading-4 ${styles.label}`}
      >
        {metric.label}
      </p>
      <div className="flex items-end gap-2">
        <span className={`text-[32px] font-semibold leading-10 tracking-[-0.01em] ${styles.value}`}>
          {metric.value}
        </span>
        {Icon ? <Icon className={`mb-1 h-4 w-4 ${styles.icon}`} /> : null}
        {metric.hint ? (
          <span className="mb-1 text-[13px] leading-[18px] text-outline">
            {metric.hint}
          </span>
        ) : null}
        {typeof metric.progress === "number" ? (
          <div className="mb-2 ml-2 h-1 w-16 overflow-hidden rounded-full bg-surface-container-high">
            <div
              className="h-full bg-primary"
              style={{ width: `${metric.progress}%` }}
            />
          </div>
        ) : null}
      </div>
    </div>
  );
}

type KpiGridProps = {
  metrics: KpiMetric[];
};

export function KpiGrid({ metrics }: KpiGridProps) {
  return (
    <div className="grid grid-cols-2 gap-gutter md:grid-cols-3">
      {metrics.map((metric) => (
        <KpiCard key={metric.id} metric={metric} />
      ))}
    </div>
  );
}

type SectionCardProps = {
  children: ReactNode;
  className?: string;
};

export function SectionCard({ children, className = "" }: SectionCardProps) {
  return (
    <div
      className={`rounded-xl border border-outline-variant bg-surface shadow-sm ${className}`.trim()}
    >
      {children}
    </div>
  );
}
