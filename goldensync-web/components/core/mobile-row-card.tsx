"use client";

// WHAT: Phone-friendly card layout for one table row worth of data.
// SCREEN: Replaces TableRow below sm breakpoint — stack with gap-space-3.
// HOW: Title row + label/value fields + optional delete IconOnly.
// KEEP: Do not nest inside another glass card (DEC-035).
// EDIT: Field layout here — data from parent lists.
// RISK: Low

/**
 * MobileRowCard — Figma `MobileRowCard` `17:153`.
 * UI-020: mobile TableRow (<640). glass-md · radius-lg · padding space-6 (DEC-035).
 * Top: item + StatusChip. Fields: overline + value pairs. Actions: Delete IconOnly.
 * Stack in a plain list gap-space-3; never nest inside another glass surface.
 */

import { Trash2 } from "lucide-react";
import * as React from "react";

import { Button } from "@/components/core/button";
import { StatusChip, type StatusChipStatus } from "@/components/core/status-chip";
import { cn } from "@/lib/utils";

export interface MobileRowCardProps extends React.HTMLAttributes<HTMLDivElement> {
  /** Figma `item` — title, truncates. */
  item?: string;
  /** Figma `value` — mono-md under Value label. */
  value?: string;
  note?: string;
  valueLabel?: string;
  noteLabel?: string;
  status?: React.ReactNode;
  statusChipStatus?: StatusChipStatus;
  /** Hide actions (e.g. Plan M per DEC-066). */
  hasActions?: boolean;
  actions?: React.ReactNode;
  onDelete?: () => void;
}

/**
 * Mobile list row card — use instead of TableRow below 640.
 */
export function MobileRowCard({
  className,
  item = "Row label",
  value = "40",
  note = "—",
  valueLabel = "Value",
  noteLabel = "Note",
  status,
  statusChipStatus = "Completed",
  hasActions = true,
  actions,
  onDelete,
  ...props
}: MobileRowCardProps) {
  return (
    <div
      data-slot="gs-mobile-row-card"
      className={cn(
        "glass-md relative flex w-full max-w-[343px] flex-col items-start gap-space-3 overflow-hidden rounded-lg p-space-6",
        className,
      )}
      {...props}
    >
      <div
        data-slot="gs-mobile-row-card-top"
        className="relative flex w-full items-center justify-between gap-space-3"
      >
        <p className="min-w-0 flex-1 truncate text-ui text-text-primary">
          {item}
        </p>
        {status ?? <StatusChip status={statusChipStatus} />}
      </div>

      <div
        data-slot="gs-mobile-row-card-fields"
        className="relative flex w-full flex-col items-start gap-space-3"
      >
        <div className="flex w-full flex-col items-start gap-space-1">
          <span className="text-overline uppercase text-text-muted">{valueLabel}</span>
          <p className="text-mono-md text-text-secondary tabular-nums">
            {value || "—"}
          </p>
        </div>
        <div className="flex w-full flex-col items-start gap-space-1">
          <span className="text-overline uppercase text-text-muted">{noteLabel}</span>
          <p className="text-ui-sm text-text-muted">{note || "—"}</p>
        </div>
      </div>

      {hasActions ? (
        <div
          data-slot="gs-mobile-row-card-actions"
          className="relative flex w-full items-center justify-end gap-space-3 border-t border-border-subtle pt-space-3"
        >
          {actions ?? (
            <Button
              variant="IconOnly"
              size="md"
              aria-label="Delete row"
              onClick={onDelete}
            >
              <Trash2 className="size-4" aria-hidden />
            </Button>
          )}
        </div>
      ) : null}
    </div>
  );
}
