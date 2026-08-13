import type { InputHTMLAttributes, ReactNode } from "react";

type TextFieldProps = InputHTMLAttributes<HTMLInputElement> & {
  label: string;
  id: string;
  leadingIcon?: ReactNode;
  trailingLabel?: ReactNode;
  trailingAction?: ReactNode;
};

export function TextField({
  label,
  id,
  leadingIcon,
  trailingLabel,
  trailingAction,
  className = "",
  ...props
}: TextFieldProps) {
  return (
    <div className="space-y-1">
      <div className="flex items-center justify-between">
        <label
          htmlFor={id}
          className="block text-xs font-semibold uppercase tracking-[0.02em] leading-4 text-on-surface"
        >
          {label}
        </label>
        {trailingLabel}
      </div>
      <div className="relative">
        {leadingIcon ? (
          <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-4 text-outline">
            {leadingIcon}
          </div>
        ) : null}
        <input
          id={id}
          className={[
            "block w-full border border-outline-variant bg-surface-bright text-sm leading-5 text-on-surface",
            "placeholder:text-outline",
            "transition-all focus:border-primary focus:ring-2 focus:ring-primary/20 focus:outline-none",
            leadingIcon ? "pr-4 pl-10" : trailingAction ? "py-2 pr-10 pl-4" : "px-4 py-2",
            trailingAction && leadingIcon ? "pr-10" : "",
            "rounded-lg",
            className,
          ]
            .filter(Boolean)
            .join(" ")}
          {...props}
        />
        {trailingAction ? (
          <div className="absolute inset-y-0 right-0 flex items-center pr-3">
            {trailingAction}
          </div>
        ) : null}
      </div>
    </div>
  );
}
