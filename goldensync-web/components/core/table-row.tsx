"use client";

// WHAT: Desktop table data row with hover/selected/skeleton states.
// SCREEN: Inside core Table on md+ breakpoints.
// HOW: Slots for cells + optional delete IconOnly; numbers use mono font (KL-01).
// KEEP: Row is not focusable — actions use Button (DEC-028).
// EDIT: Row height and selected left bar here.
// RISK: Low

/**
 * TableRow — Figma `TableRow` `16:166`.
 * UI-019: h-52 · Default/Hover/Selected/Skeleton. Hover = surface-glass (DEC-017).
 * Selected = accent-glass-bg + 2px left accent bar. Numbers = mono-md (KL-01). Empty = "—".
 * Row itself is not focusable (DEC-028); actions use Button IconOnly.
 */

import { Trash2 } from "lucide-react";
import * as React from "react";

import { Button } from "@/components/core/button";
import { StatusChip, type StatusChipStatus } from "@/components/core/status-chip";
import { cn } from "@/lib/utils";

export type TableRowState = "Default" | "Hover" | "Selected" | "Skeleton";

export interface TableRowProps extends React.HTMLAttributes<HTMLDivElement> {
  /** Figma `item` TEXT. */
  item?: string;
  /** Figma `value` TEXT — numeric cell, mono-md. */
  value?: string;
  /** Note cell; defaults to em dash. Never pass null. */
  note?: string;
  /** Selected state (accent fill + left bar). */
  selected?: boolean;
  /** Skeleton bars instead of content. */
  skeleton?: boolean;
  /** Exposed StatusChip; omit to use default Completed demo chip. */
  status?: React.ReactNode;
  statusChipStatus?: StatusChipStatus;
  /** Actions cell; default Trash IconOnly aria-label "Delete row". */
  actions?: React.ReactNode;
  onDelete?: () => void;
  /** Force a Figma state for docs (Hover is normally CSS). */
  state?: TableRowState;
}

/**
 * Library table data row — screens prefer domain rows (WeekRow, ActivityRow); this set stays library-only (DEC-084).
 */
export const TableRow = React.forwardRef<HTMLDivElement, TableRowProps>(
  function TableRow(
    {
      className,
      item = "Row label",
      value = "40",
      note = "—",
      selected = false,
      skeleton = false,
      status,
      statusChipStatus = "Completed",
      actions,
      onDelete,
      state,
      ...props
    },
    ref,
  ) {
    const isSkeleton = skeleton || state === "Skeleton";
    const isSelected = selected || state === "Selected";
    const forceHover = state === "Hover";

    return (
      <div
        ref={ref}
        data-slot="gs-table-row"
        data-state={
          isSkeleton
            ? "Skeleton"
            : isSelected
              ? "Selected"
              : forceHover
                ? "Hover"
                : "Default"
        }
        className={cn(
          "relative flex h-[52px] w-full min-w-[720px] items-center border-b border-border-subtle",
          !isSkeleton && !isSelected && "hover:bg-surface-glass",
          forceHover && !isSelected && "bg-surface-glass",
          isSelected && "bg-accent-glass-bg",
          className,
        )}
        {...props}
      >
        {isSelected ? (
          <span
            aria-hidden
            data-slot="gs-table-row-selected-accent"
            className="absolute top-0 bottom-[-1px] left-0 w-0.5 bg-accent-primary"
          />
        ) : null}

        {/* Cell/Item — fill */}
        <div className="flex h-full min-w-0 flex-1 items-center px-space-4">
          {isSkeleton ? (
            <span className="h-3 w-40 rounded-md bg-bg-subtle" />
          ) : (
            <p className="truncate text-body-sm whitespace-nowrap text-text-secondary">
              {item}
            </p>
          )}
        </div>

        {/* Cell/Value — 96 */}
        <div className="flex h-full w-24 shrink-0 items-center justify-end px-space-4">
          {isSkeleton ? (
            <span className="h-3 w-8 rounded-md bg-bg-subtle" />
          ) : (
            <p className="text-mono-md whitespace-nowrap text-text-secondary tabular-nums">
              {value || "—"}
            </p>
          )}
        </div>

        {/* Cell/Note — 160 */}
        <div className="flex h-full w-40 shrink-0 items-center px-space-4">
          {isSkeleton ? (
            <span className="h-3 w-16 rounded-md bg-bg-subtle" />
          ) : (
            <p className="text-body-sm whitespace-nowrap text-text-muted">
              {note || "—"}
            </p>
          )}
        </div>

        {/* Cell/Status — 144 */}
        <div className="flex h-full w-36 shrink-0 items-center justify-center px-space-4">
          {isSkeleton ? (
            <span className="h-6 w-24 rounded-full bg-bg-subtle" />
          ) : (
            (status ?? <StatusChip status={statusChipStatus} />)
          )}
        </div>

        {/* Cell/Actions — 80 */}
        <div className="flex h-full w-20 shrink-0 items-center justify-end px-space-4">
          {isSkeleton ? (
            <span className="size-8 rounded-md bg-bg-subtle" />
          ) : (
            (actions ?? (
              <Button
                variant="IconOnly"
                size="md"
                aria-label="Delete row"
                onClick={onDelete}
              >
                <Trash2 className="size-4" aria-hidden />
              </Button>
            ))
          )}
        </div>
      </div>
    );
  },
);
