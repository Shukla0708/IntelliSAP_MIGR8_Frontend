import type { ReactNode } from "react";

type ProgressBarProps = {
  value: number;
  className?: string;
  trackClassName?: string;
  barClassName?: string;
};

export function ProgressBar({
  value,
  className = "",
  trackClassName = "bg-surface-container-high",
  barClassName = "bg-primary",
}: ProgressBarProps) {
  const clamped = Math.max(0, Math.min(100, value));

  return (
    <div
      className={`h-1.5 w-full overflow-hidden rounded-full ${trackClassName} ${className}`.trim()}
      role="progressbar"
      aria-valuenow={clamped}
      aria-valuemin={0}
      aria-valuemax={100}
    >
      <div
        className={`h-full rounded-full transition-all ${barClassName}`}
        style={{ width: `${clamped}%` }}
      />
    </div>
  );
}

type CircularProgressProps = {
  value: number;
  size?: number;
  strokeWidth?: number;
  children?: ReactNode;
};

export function CircularProgress({
  value,
  size = 192,
  strokeWidth = 8,
  children,
}: CircularProgressProps) {
  const radius = 45;
  const circumference = 2 * Math.PI * radius;
  const clamped = Math.max(0, Math.min(100, value));
  const offset = circumference - (clamped / 100) * circumference;

  return (
    <div className="relative" style={{ width: size, height: size }}>
      <svg
        className="h-full w-full -rotate-90 transform"
        viewBox="0 0 100 100"
        aria-hidden="true"
      >
        <circle
          cx="50"
          cy="50"
          r={radius}
          fill="none"
          stroke="currentColor"
          className="text-surface-container-high"
          strokeWidth={strokeWidth}
        />
        <circle
          cx="50"
          cy="50"
          r={radius}
          fill="none"
          stroke="currentColor"
          className="text-primary transition-all duration-1000 ease-out"
          strokeWidth={strokeWidth}
          strokeDasharray={circumference}
          strokeDashoffset={offset}
        />
      </svg>
      {children ? (
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          {children}
        </div>
      ) : null}
    </div>
  );
}
