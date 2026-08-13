import Image from "next/image";

type Migr8LogoProps = {
  className?: string;
  priority?: boolean;
};

export function Migr8Logo({ className = "", priority = false }: Migr8LogoProps) {
  return (
    <Image
      src="/brand/migr8-logo.png"
      alt="MIGR8 AI Logo"
      width={180}
      height={48}
      priority={priority}
      className={`h-12 w-auto object-contain ${className}`.trim()}
    />
  );
}
