"use client";

// WHAT: Toggleable filter pill — selected state shows checkmark on accent glass.
// SCREEN: Tag filters and multi-select chips (not the same as StatusChip/Badge).
// HOW: button role; parent controls selected + onSelectedChange.
// KEEP: Distinct from StatusChip — use Chip for multi-select filters only.
// EDIT: Selected/hover styles here.
// RISK: Low

/**
 * Chip — multi-select semester/tag pill (Figma `72:2428`, UI-036 / DEC-050b).
 * Selected adds Check 14 on accent-glass. Not StatusChip / Badge.
 */

import { Check } from "lucide-react";
import * as React from "react";

import { cn } from "@/lib/utils";

export interface ChipProps
  extends Omit<React.ButtonHTMLAttributes<HTMLButtonElement>, "children"> {
  label?: string;
  selected?: boolean;
}

/** Toggle chip for multi-select; parent owns selected set. */
export function Chip({
  className,
  label = "Chip",
  selected = false,
  type = "button",
  ...props
}: ChipProps) {
  return (
    <button
      type={type}
      aria-pressed={selected}
      data-slot="gs-chip"
      data-selected={selected ? "true" : undefined}
      className={cn(
        "inline-flex h-8 items-center gap-space-1 rounded-full border px-space-3",
        "text-body-sm font-medium outline-none transition-colors duration-150 ease-out",
        "focus-visible:focus-ring",
        selected
          ? "border-accent-glass-border bg-accent-glass-bg text-accent-primary"
          : "border-border-default bg-surface-glass-md text-text-secondary hover:border-border-strong",
        className,
      )}
      {...props}
    >
      {selected ? (
        <Check className="size-3.5 shrink-0" aria-hidden strokeWidth={2.5} />
      ) : null}
      <span className="whitespace-nowrap">{label}</span>
    </button>
  );
}