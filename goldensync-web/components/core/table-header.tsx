// WHAT: Column title bar for core Table (overline labels).
// SCREEN: Top of glass table on desktop.
// HOW: Optional prop overrides for each column label; fixed height per Figma.
// KEEP: Pair with TableRow children in Table wrapper.
// EDIT: Default placeholder labels only — pages pass real copy via props.
// RISK: Low

/**
 * TableHeader — Figma `TableHeader` `16:92`.
 * UI-019: h-40 · bg-subtle · overline text-muted · bottom border-default.
 * Column labels are placeholders; screens override via props.
 */

import * as React from "react";

import { cn } from "@/lib/utils";

export interface TableHeaderProps extends React.HTMLAttributes<HTMLDivElement> {
  itemLabel?: string;
  valueLabel?: string;
  noteLabel?: string;
  statusLabel?: string;
  actionsLabel?: string;
}

/**
 * Library table header row — sticky when screens set sticky top.
 */
export function TableHeader({
  className,
  itemLabel = "Item",
  valueLabel = "Value",
  noteLabel = "Note",
  statusLabel = "Status",
  actionsLabel = "Actions",
  ...props
}: TableHeaderProps) {
  return (
    <div
      data-slot="gs-table-header"
      className={cn(
        "flex h-8 w-full min-w-[720px] items-center border-b border-border-default bg-bg-subtle",
        className,
      )}
      {...props}
    >
      <div className="flex h-full min-w-0 flex-1 items-center px-space-4">
        <span className="text-overline uppercase text-text-muted">{itemLabel}</span>
      </div>
      <div className="flex h-full w-24 shrink-0 items-center justify-end px-space-4">
        <span className="text-overline uppercase text-text-muted">{valueLabel}</span>
      </div>
      <div className="flex h-full w-40 shrink-0 items-center px-space-4">
        <span className="text-overline uppercase text-text-muted">{noteLabel}</span>
      </div>
      <div className="flex h-full w-36 shrink-0 items-center justify-center px-space-4">
        <span className="text-overline uppercase text-text-muted">{statusLabel}</span>
      </div>
      <div className="flex h-full w-20 shrink-0 items-center justify-end px-space-4">
        <span className="text-overline uppercase text-text-muted">{actionsLabel}</span>
      </div>
    </div>
  );
}
