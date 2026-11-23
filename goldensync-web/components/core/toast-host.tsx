"use client";

/**
 * ToastHost — fixed stack for Toast messages (UI-027 companion).
 * FLOW: archive / save / created success toasts. Parent pushes items.
 */

import * as React from "react";

import { Toast, type ToastVariant } from "@/components/core/toast";
import { cn } from "@/lib/utils";

export interface ToastItem {
  id: string;
  message: string;
  variant?: ToastVariant;
}

export interface ToastHostProps {
  toasts: readonly ToastItem[];
  onDismiss?: (id: string) => void;
  className?: string;
}

/** Bottom-right toast stack. */
export function ToastHost({ toasts, onDismiss, className }: ToastHostProps) {
  if (toasts.length === 0) return null;

  return (
    <div
      data-slot="gs-toast-host"
      className={cn(
        "pointer-events-none fixed right-4 bottom-4 z-[80] flex w-full max-w-sm flex-col gap-space-2",
        className,
      )}
    >
      {toasts.map((t) => (
        <div key={t.id} className="pointer-events-auto gs-fade-up">
          <Toast
            variant={t.variant ?? "Success"}
            message={t.message}
            onClose={() => onDismiss?.(t.id)}
          />
        </div>
      ))}
    </div>
  );
}
