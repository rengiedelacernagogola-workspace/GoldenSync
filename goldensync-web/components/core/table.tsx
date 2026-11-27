/**
 * Table — Figma `Table` `16:177`.
 * UI-019: glass-sm container · radius-lg · clips. Header + TableRow children.
 * Library-only (DEC-084); screen tables use domain rows.
 */

import * as React from "react";

import { TableHeader } from "@/components/core/table-header";
import { cn } from "@/lib/utils";

export interface TableProps extends React.HTMLAttributes<HTMLDivElement> {
  /** Optional header; pass false to omit. Default renders TableHeader. */
  header?: React.ReactNode | false;
}

/**
 * Glass table shell — put TableHeader + TableRow (or domain rows) as children.
 */
export function Table({ className, header, children, ...props }: TableProps) {
  return (
    <div
      data-slot="gs-table"
      role="table"
      className={cn(
        "glass-sm relative flex w-full flex-col items-start overflow-x-auto rounded-lg",
        className,
      )}
      {...props}
    >
      {header === false ? null : (header ?? <TableHeader />)}
      <div data-slot="gs-table-body" role="rowgroup" className="w-full">
        {children}
      </div>
    </div>
  );
}
