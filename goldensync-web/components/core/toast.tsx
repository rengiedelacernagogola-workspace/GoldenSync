"use client";

// WHAT: One toast card (Info/Success/Error) with icon, message, and dismiss.
// SCREEN: Rendered in stack by ToastHost bottom-right of viewport.
// HOW: Presentational only — duration and queue live in ToastHost / sonner.
// KEEP: User-visible strings from copy/ or parent; variant picks icon + border.
// EDIT: Visual tokens here — not auto-dismiss timing.
// RISK: Low

/**
 * Toast — transient notice (Figma `25:545`, UI-027).
 * Info|Success|Error · solid bg-overlay + border-strong. Auto-dismiss in host (sonner later).
 * Edit message strings in copy/.
 */

import { Check, CircleAlert, Info, X } from "lucide-react";
import * as React from "react";

import { Button } from "@/components/core/button";
import { cn } from "@/lib/utils";

export type ToastVariant = "Info" | "Success" | "Error";

const TOAST_ICON: Record<
  ToastVariant,
  { Icon: React.ElementType; className: string }
> = {
  Info: { Icon: Info, className: "text-accent-primary" },
  Success: { Icon: Check, className: "text-status-success" },
  Error: { Icon: CircleAlert, className: "text-status-error" },
};

export interface ToastProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: ToastVariant;
  message?: string;
  hasClose?: boolean;
  onClose?: () => void;
}

/** Floating toast panel — host positions it; do not nest glass. */
export function Toast({
  className,
  variant = "Info",
  message = "You have been logged out.",
  hasClose = false,
  onClose,
  ...props
}: ToastProps) {
  const { Icon, className: iconClass } = TOAST_ICON[variant];

  return (
    <div
      role={variant === "Error" ? "alert" : "status"}
      data-slot="gs-toast"
      data-variant={variant}
      className={cn(
        "flex min-h-12 w-full max-w-[360px] items-center gap-space-3 rounded-lg",
        "border border-border-strong bg-bg-overlay px-space-4 py-space-3 shadow-hover",
        className,
      )}
      {...props}
    >
      <Icon
        className={cn("size-3.5 shrink-0", iconClass)}
        aria-hidden
        strokeWidth={2}
      />
      <p className="min-w-0 flex-1 text-body-sm text-text-primary">{message}</p>
      {(hasClose || variant === "Error") ? (
        <Button
          variant="IconOnly"
          size="md"
          aria-label="Dismiss notification"
          onClick={onClose}
        >
          <X className="size-4" aria-hidden />
        </Button>
      ) : null}
    </div>
  );
}
