export type PasswordStrength = "empty" | "weak" | "fair" | "strong";

export function getPasswordStrength(password: string): PasswordStrength {
  if (password.length === 0) return "empty";
  if (password.length < 6) return "weak";
  if (password.length < 10) return "fair";
  return "strong";
}

const strengthMeta: Record<
  PasswordStrength,
  { label: string; filled: number; barClass: string; textClass: string }
> = {
  empty: {
    label: "Weak",
    filled: 1,
    barClass: "bg-error",
    textClass: "text-on-surface-variant",
  },
  weak: {
    label: "Weak",
    filled: 1,
    barClass: "bg-error",
    textClass: "text-error",
  },
  fair: {
    label: "Fair",
    filled: 2,
    barClass: "bg-tertiary",
    textClass: "text-tertiary",
  },
  strong: {
    label: "Strong",
    filled: 3,
    barClass: "bg-success",
    textClass: "text-success",
  },
};

type PasswordStrengthMeterProps = {
  password: string;
};

export function PasswordStrengthMeter({ password }: PasswordStrengthMeterProps) {
  const strength = getPasswordStrength(password);
  const meta = strengthMeta[strength];

  return (
    <div className="mt-1 flex flex-col gap-1">
      <div className="flex gap-1">
        {[0, 1, 2].map((index) => {
          const isFilled = index < meta.filled;
          // Empty state shows a partial first bar (matches Stitch default)
          const widthClass =
            strength === "empty" && index === 0 ? "w-1/3" : isFilled ? "w-full" : "w-0";

          return (
            <div
              key={index}
              className="h-1 flex-1 overflow-hidden rounded-full bg-surface-variant"
            >
              <div
                className={[
                  "h-full rounded-full transition-all duration-300",
                  isFilled || (strength === "empty" && index === 0)
                    ? meta.barClass
                    : "bg-transparent",
                  widthClass,
                ].join(" ")}
              />
            </div>
          );
        })}
      </div>
      <span className={`text-[13px] leading-[18px] ${meta.textClass}`}>
        {meta.label}
      </span>
    </div>
  );
}
