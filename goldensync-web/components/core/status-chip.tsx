"use client";

/**
 * StatusChip — Figma `StatusChip` `14:58`.
 * UI-016: Not Started (gray dot) · In Progress (accent + pulse 2s, paused for reduced-motion) · Completed (check).
 * Static; status text always present. DEC-014 sparse Pulse on In Progress only.
 */

import { cva, type VariantProps } from "class-variance-authority";
import { Check } from "lucide-react";
import * as React from "react";

import { cn } from "@/lib/utils";

export type StatusChipStatus = "Not Started" | "In Progress" | "Completed";

const statusChipVariants = cva(
  [
    "inline-flex h-6 shrink-0 items-center justify-center gap-space-1",
    "rounded-full border px-space-2",
    "text-[12px] font-medium leading-[1.2] whitespace-nowrap",
  ].join(" "),
  {
    variants: {
      status: {
        "Not Started":
          "border-border-default bg-surface-glass-md text-text-secondary",
        "In Progress":
          "border-tint-accent-border bg-tint-accent-bg text-accent-primary",
        Completed:
          "border-tint-success-border bg-tint-success-bg text-status-success",
      } satisfies Record<StatusChipStatus, string>,
    },
    defaultVariants: {
      status: "Not Started",
    },
  },
);

export interface StatusChipProps
  extends Omit<React.HTMLAttributes<HTMLSpanElement>, "children">,
    VariantProps<typeof statusChipVariants> {
  status?: StatusChipStatus;
}

/**
 * GoldenSync StatusChip — week/topic status pill (derived, C7).
 */
export function StatusChip({
  className,
  status = "Not Started",
  ...props
}: StatusChipProps) {
  return (
    <span
      data-slot="gs-status-chip"
      data-status={status}
      className={cn(statusChipVariants({ status }), className)}
      {...props}
    >
      {status === "Completed" ? (
        <Check className="size-3.5 shrink-0" aria-hidden strokeWidth={2.5} />
      ) : (
        <span
          aria-hidden
          data-slot="gs-status-chip-dot"
          className={cn(
            "size-2 shrink-0 rounded-full",
            status === "In Progress"
              ? "bg-accent-primary motion-safe:animate-[gs-status-pulse_2s_ease-in-out_infinite]"
              : "bg-text-muted",
          )}
        />
      )}
      <span>{status}</span>
    </span>
  );
}

export { statusChipVariants };
