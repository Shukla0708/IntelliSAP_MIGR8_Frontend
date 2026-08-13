"use client";

import Image from "next/image";
import { useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { AccountCircleIcon, LogoutIcon } from "@/components/ui/icons";
import { useAuth } from "@/contexts/auth-context";

type ProfileMenuProps = {
  variant?: "sidebar" | "topbar";
  onNavigate?: () => void;
};

export function ProfileMenu({
  variant = "sidebar",
  onNavigate,
}: ProfileMenuProps) {
  const { user, logout } = useAuth();
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [pending, setPending] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;

    function handlePointerDown(event: MouseEvent) {
      if (!menuRef.current?.contains(event.target as Node)) {
        setOpen(false);
      }
    }

    function handleEscape(event: KeyboardEvent) {
      if (event.key === "Escape") setOpen(false);
    }

    document.addEventListener("mousedown", handlePointerDown);
    document.addEventListener("keydown", handleEscape);
    return () => {
      document.removeEventListener("mousedown", handlePointerDown);
      document.removeEventListener("keydown", handleEscape);
    };
  }, [open]);

  async function handleLogout() {
    setPending(true);
    try {
      await logout();
      onNavigate?.();
      router.replace("/sign-in");
    } finally {
      setPending(false);
      setOpen(false);
    }
  }

  const menuPanel = open ? (
    <div
      role="menu"
      className={[
        "absolute z-[60] w-56 overflow-hidden rounded-lg border border-outline-variant bg-surface-container-lowest shadow-ambient",
        variant === "topbar"
          ? "top-full right-0 mt-2"
          : "bottom-full left-0 mb-2 w-full",
      ].join(" ")}
    >
      <div className="border-b border-outline-variant px-4 py-2.5">
        <p className="truncate text-sm font-semibold text-on-surface">
          {user?.fullName || "Profile"}
        </p>
        {user?.email ? (
          <p className="mt-0.5 truncate text-[11px] text-on-surface-variant">
            {user.email}
          </p>
        ) : null}
      </div>
      <button
        type="button"
        role="menuitem"
        disabled={pending}
        onClick={() => void handleLogout()}
        className="flex w-full items-center gap-3 px-4 py-2.5 text-left text-xs font-semibold uppercase tracking-[0.02em] text-error transition-colors hover:bg-error/5 disabled:cursor-not-allowed disabled:opacity-60"
      >
        <LogoutIcon className="h-4 w-4" />
        {pending ? "Signing out…" : "Logout"}
      </button>
    </div>
  ) : null;

  if (variant === "topbar") {
    return (
      <div ref={menuRef} className="relative ml-2">
        <button
          type="button"
          onClick={() => setOpen((prev) => !prev)}
          className={[
            "h-8 w-8 overflow-hidden rounded-full border border-outline-variant bg-surface-container-high transition-shadow",
            open ? "ring-2 ring-primary/40" : "hover:ring-2 hover:ring-primary/20",
          ].join(" ")}
          aria-label="Open profile menu"
          aria-expanded={open}
          aria-haspopup="menu"
        >
          <Image
            src="/avatars/user.png"
            alt=""
            width={32}
            height={32}
            className="h-full w-full object-cover"
          />
        </button>
        {menuPanel}
      </div>
    );
  }

  return (
    <div ref={menuRef} className="relative">
      <button
        type="button"
        onClick={() => setOpen((prev) => !prev)}
        className={[
          "flex w-full items-center gap-4 rounded-lg px-4 py-2 text-left transition-colors duration-150",
          open
            ? "border-r-4 border-primary bg-primary-container/10 font-bold text-primary opacity-80"
            : "text-on-surface-variant hover:bg-surface-container-high",
        ].join(" ")}
        aria-expanded={open}
        aria-haspopup="menu"
      >
        <AccountCircleIcon className="h-5 w-5" />
        <span className="min-w-0 flex-1 truncate text-xs font-semibold uppercase tracking-[0.02em] leading-4">
          {user?.fullName || "Profile"}
        </span>
      </button>
      {menuPanel}
    </div>
  );
}
