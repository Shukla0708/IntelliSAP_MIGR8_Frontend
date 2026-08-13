"use client";

import { useEffect, type ReactNode } from "react";
import { CloseIcon } from "@/components/ui/icons";

type DialogProps = {
  open: boolean;
  title: string;
  onClose: () => void;
  children: ReactNode;
  footer?: ReactNode;
};

export function Dialog({ open, title, onClose, children, footer }: DialogProps) {
  useEffect(() => {
    if (!open) return;

    function onKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") onClose();
    }

    document.addEventListener("keydown", onKeyDown);
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    return () => {
      document.removeEventListener("keydown", onKeyDown);
      document.body.style.overflow = previousOverflow;
    };
  }, [open, onClose]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center bg-on-surface/40 p-4 backdrop-blur-sm">
      <button
        type="button"
        className="absolute inset-0 cursor-default"
        aria-label="Close dialog backdrop"
        onClick={onClose}
      />
      <div
        role="dialog"
        aria-modal="true"
        aria-label={title}
        className="relative z-10 w-full max-w-md overflow-hidden rounded-2xl border border-outline-variant bg-surface-container-lowest shadow-xl"
      >
        <div className="flex items-center justify-between border-b border-outline-variant bg-surface-container-low px-6 py-4">
          <h3 className="text-xl font-semibold leading-7 text-on-surface">
            {title}
          </h3>
          <button
            type="button"
            onClick={onClose}
            className="text-on-surface-variant transition-colors hover:text-error"
            aria-label="Close"
          >
            <CloseIcon className="h-5 w-5" />
          </button>
        </div>
        <div className="space-y-6 p-6">{children}</div>
        {footer ? (
          <div className="flex justify-end gap-3 border-t border-outline-variant bg-surface-container-low px-6 py-4">
            {footer}
          </div>
        ) : null}
      </div>
    </div>
  );
}
