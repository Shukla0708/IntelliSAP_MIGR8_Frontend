import type { ButtonHTMLAttributes, ReactNode } from "react";

type ButtonVariant = "primary" | "ghost";
type ButtonSize = "md" | "lg";

type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  children: ReactNode;
  variant?: ButtonVariant;
  size?: ButtonSize;
  fullWidth?: boolean;
};

const variantClasses: Record<ButtonVariant, string> = {
  primary:
    "border-transparent bg-primary-container text-on-primary shadow-sm hover:bg-primary focus-visible:ring-primary",
  ghost:
    "border-outline-variant bg-transparent text-on-surface hover:bg-surface-bright focus-visible:ring-primary/30",
};

const sizeClasses: Record<ButtonSize, string> = {
  md: "h-11 rounded text-base font-semibold leading-7 shadow-ambient hover:shadow-md",
  lg: "h-12 rounded-lg text-xl font-semibold leading-7",
};

export function Button({
  children,
  variant = "primary",
  size = "lg",
  fullWidth = false,
  className = "",
  type = "button",
  ...props
}: ButtonProps) {
  return (
    <button
      type={type}
      className={[
        "inline-flex items-center justify-center border px-4 transition-colors",
        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2",
        "disabled:cursor-not-allowed disabled:opacity-60",
        variantClasses[variant],
        sizeClasses[size],
        fullWidth ? "w-full" : "",
        className,
      ]
        .filter(Boolean)
        .join(" ")}
      {...props}
    >
      {children}
    </button>
  );
}
