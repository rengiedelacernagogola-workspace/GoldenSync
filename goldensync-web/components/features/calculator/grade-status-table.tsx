"use client";

/**
 * Table 1 — Grade Status & Disposition (editable).
 */

import { Plus, Trash2 } from "lucide-react";
import * as React from "react";

import { Button, Card } from "@/components/core";
import {
  createEmptyStatusRow,
  DEFAULT_GRADING_TEMPLATE,
  type GradeStatusRow,
} from "@/lib/domain/grading-template";
import { cn } from "@/lib/utils";

const cellTextarea = cn(
  "box-border w-full min-w-0 max-w-full min-h-[2.5rem] resize-y rounded-sm border border-transparent bg-transparent px-1.5 py-1",
  "text-[11px] font-medium leading-snug tracking-tight break-words text-text-primary outline-none",
  "transition-[border-color,background-color] placeholder:text-text-muted",
  "hover:border-border-subtle focus:border-border-focus focus:bg-bg-subtle",
);

export type GradeStatusTableProps = {
  rows: GradeStatusRow[];
  onChange: (rows: GradeStatusRow[]) => void;
};

/** Editable 2-column status / disposition table. */
export function GradeStatusTable({ rows, onChange }: GradeStatusTableProps) {
  function updateRow(id: string, patch: Partial<GradeStatusRow>) {
    onChange(rows.map((r) => (r.id === id ? { ...r, ...patch } : r)));
  }

  function addRow() {
    onChange([...rows, createEmptyStatusRow()]);
  }

  function removeRow(id: string) {
    if (rows.length <= 1) return;
    onChange(rows.filter((r) => r.id !== id));
  }

  function reset() {
    onChange(
      DEFAULT_GRADING_TEMPLATE.statusRows.map((r) => ({ ...r, id: r.id })),
    );
  }

  return (
    <Card
      title="Grade Status & Disposition"
      hasHeader
      hasHeaderBadge
      className="w-full min-w-0"
      headerBadge={
        <div className="flex flex-wrap items-center justify-end gap-space-2">
          <Button variant="Ghost" size="sm" onClick={reset}>
            Reset to Default
          </Button>
          <Button variant="Secondary" size="sm" onClick={addRow}>
            <Plus className="size-3.5" aria-hidden />
            Add row
          </Button>
        </div>
      }
    >
      <div className="w-full min-w-0 overflow-x-auto">
        <table className="w-full table-fixed border-collapse text-left">
          <thead>
            <tr className="border-b border-border-subtle bg-bg-subtle">
              <th className="w-[42%] px-space-2 py-space-2 text-[10px] font-semibold uppercase tracking-wide text-text-muted">
                Grade Status
              </th>
              <th className="w-[42%] px-space-2 py-space-2 text-[10px] font-semibold uppercase tracking-wide text-text-muted">
                Disposition
              </th>
              <th className="w-10 px-space-1 py-space-2" aria-label="Actions" />
            </tr>
          </thead>
          <tbody>
            {rows.map((row) => (
              <tr
                key={row.id}
                className="border-b border-border-subtle align-top last:border-b-0"
              >
                <td className="min-w-0 p-space-1">
                  <textarea
                    aria-label="Grade status"
                    className={cellTextarea}
                    value={row.status}
                    placeholder="(editable)"
                    onChange={(e) =>
                      updateRow(row.id, { status: e.target.value })
                    }
                    rows={3}
                  />
                </td>
                <td className="min-w-0 p-space-1">
                  <textarea
                    aria-label="Disposition"
                    className={cellTextarea}
                    value={row.disposition}
                    placeholder="(editable)"
                    onChange={(e) =>
                      updateRow(row.id, { disposition: e.target.value })
                    }
                    rows={3}
                  />
                </td>
                <td className="w-10 p-space-1 align-middle">
                  <Button
                    variant="Ghost"
                    size="sm"
                    aria-label="Remove row"
                    disabled={rows.length <= 1}
                    onClick={() => removeRow(row.id)}
                  >
                    <Trash2 className="size-3.5" aria-hidden />
                  </Button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </Card>
  );
}
