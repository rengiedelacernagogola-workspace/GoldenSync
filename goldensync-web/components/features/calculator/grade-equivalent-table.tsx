"use client";

/**
 * Table 2 — Numerical Grade Equivalent and Descriptive Interpretation.
 */

import { Plus, Trash2 } from "lucide-react";
import * as React from "react";

import { Button, Card } from "@/components/core";
import {
  createEmptyEquivalentRow,
  DEFAULT_GRADING_TEMPLATE,
  type GradeEquivalentRow,
} from "@/lib/domain/grading-template";
import { cn } from "@/lib/utils";

const cellInput = cn(
  "box-border w-full min-w-0 max-w-full rounded-sm border border-transparent bg-transparent px-1 py-0.5",
  "text-[11px] font-medium leading-snug tracking-tight text-text-primary outline-none",
  "transition-[border-color,background-color] placeholder:text-text-muted",
  "hover:border-border-subtle focus:border-border-focus focus:bg-bg-subtle",
);

const cellTextarea = cn(
  cellInput,
  "min-h-[2.25rem] resize-y break-words px-1.5 py-1",
);

export type GradeEquivalentTableProps = {
  rows: GradeEquivalentRow[];
  onChange: (rows: GradeEquivalentRow[]) => void;
};

/** Editable 4-column grade equivalent table. */
export function GradeEquivalentTable({
  rows,
  onChange,
}: GradeEquivalentTableProps) {
  function updateRow(id: string, patch: Partial<GradeEquivalentRow>) {
    onChange(rows.map((r) => (r.id === id ? { ...r, ...patch } : r)));
  }

  function addRow() {
    onChange([...rows, createEmptyEquivalentRow()]);
  }

  function removeRow(id: string) {
    if (rows.length <= 1) return;
    onChange(rows.filter((r) => r.id !== id));
  }

  function reset() {
    onChange(
      DEFAULT_GRADING_TEMPLATE.equivalentRows.map((r) => ({ ...r })),
    );
  }

  return (
    <Card
      title="Numerical Grade Equivalent and Descriptive Interpretation"
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
        <table className="w-full min-w-[960px] table-fixed border-collapse text-left">
          <thead>
            <tr className="border-b border-border-subtle bg-bg-subtle">
              {(
                [
                  {
                    full: "Numerical Value",
                    short: "Value",
                    className: "w-[120px]",
                  },
                  {
                    full: "% Equivalent",
                    short: "% Eq.",
                    className: "w-[110px]",
                  },
                  {
                    full: "Letter Equivalent",
                    short: "Letter",
                    className: "w-[140px]",
                  },
                  {
                    full: "Description (The learner…)",
                    short: "Desc.",
                    className: "min-w-0",
                  },
                  {
                    full: "",
                    short: "",
                    className: "w-10 px-space-1",
                  },
                ] as const
              ).map((col, i) => (
                <th
                  key={col.full || `a-${i}`}
                  className={cn(
                    "overflow-hidden px-space-2 py-space-2 text-[10px] font-semibold uppercase tracking-wide whitespace-nowrap text-text-muted",
                    col.className,
                  )}
                  aria-label={col.full || "Actions"}
                  title={col.full || undefined}
                >
                  {col.full ? (
                    <>
                      <span className="md:hidden">{col.short}</span>
                      <span className="hidden md:inline">{col.full}</span>
                    </>
                  ) : null}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {rows.map((row) => (
              <tr
                key={row.id}
                className="border-b border-border-subtle align-top last:border-b-0"
              >
                <td className="w-[120px] p-space-1">
                  <input
                    aria-label="Numerical value"
                    className={cellInput}
                    value={row.numerical}
                    placeholder="(editable)"
                    onChange={(e) =>
                      updateRow(row.id, { numerical: e.target.value })
                    }
                  />
                </td>
                <td className="w-[110px] p-space-1">
                  <input
                    aria-label="Percent equivalent"
                    className={cellInput}
                    value={row.percent}
                    placeholder="(editable)"
                    onChange={(e) =>
                      updateRow(row.id, { percent: e.target.value })
                    }
                  />
                </td>
                <td className="w-[140px] p-space-1">
                  <input
                    aria-label="Letter equivalent"
                    className={cellInput}
                    value={row.letter}
                    placeholder="(editable)"
                    onChange={(e) =>
                      updateRow(row.id, { letter: e.target.value })
                    }
                  />
                </td>
                <td className="min-w-0 p-space-1">
                  <textarea
                    aria-label="Description"
                    className={cellTextarea}
                    value={row.description}
                    onChange={(e) =>
                      updateRow(row.id, { description: e.target.value })
                    }
                    rows={2}
                    placeholder="(editable)"
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
