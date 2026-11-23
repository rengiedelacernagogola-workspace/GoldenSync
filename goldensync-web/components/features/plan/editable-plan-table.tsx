"use client";

/**
 * Editable Learning Plan table — add/edit/duplicate week · topic · outcome · activities · status.
 * Status stays checklist-style; Done syncs ChecklistItem via PUT /plan.
 */

import { Check, Copy, Plus, Trash2 } from "lucide-react";
import * as React from "react";

import { Button } from "@/components/core/button";
import { WeekTableHeader } from "@/components/core/week-row";
import { Table } from "@/components/core/table";
import { replacePlan } from "@/lib/api/subjects";
import { cn } from "@/lib/utils";

export type PlanDraftStatus =
  | "Not started"
  | "In progress"
  | "Done"
  | "No class";

export type PlanDraftRow = {
  key: string;
  weekNumber: number;
  topic: string;
  outcome: string;
  activities: string;
  status: PlanDraftStatus;
};

const STATUSES: PlanDraftStatus[] = [
  "Not started",
  "In progress",
  "Done",
  "No class",
];

const cellInput =
  "w-full min-w-0 rounded-sm border border-transparent bg-transparent px-1 py-0.5 text-[11px] font-medium leading-snug tracking-tight text-text-primary outline-none transition-[border-color,background-color] placeholder:text-text-muted hover:border-border-subtle focus:border-border-focus focus:bg-bg-subtle";

type EditablePlanTableProps = {
  subjectId: string;
  initialRows: PlanDraftRow[];
  onSaved?: () => void;
};

const MAX_PLAN_ENTRIES = 90;

function nextKey() {
  return `draft-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
}

function statusPillClass(status: PlanDraftStatus) {
  if (status === "Done") {
    return "border-tint-success-border bg-tint-success-bg text-status-success";
  }
  if (status === "In progress") {
    return "border-tint-accent-border bg-tint-accent-bg text-accent-primary";
  }
  if (status === "No class") {
    return "border-border-subtle bg-bg-subtle text-text-muted";
  }
  return "border-border-default bg-surface-glass-md text-text-secondary";
}

function StatusIndicator({ status }: { status: PlanDraftStatus }) {
  if (status === "Done") {
    return <Check className="size-3 shrink-0" aria-hidden strokeWidth={2.5} />;
  }
  if (status === "No class") {
    return (
      <span
        aria-hidden
        className="block size-1.5 shrink-0 rounded-full bg-text-muted/60"
      />
    );
  }
  return (
    <span
      aria-hidden
      className={cn(
        "block size-1.5 shrink-0 rounded-full",
        status === "In progress" ? "bg-accent-primary" : "bg-text-muted",
      )}
    />
  );
}

function StatusPicker({
  value,
  weekNumber,
  onChange,
  disabled,
}: {
  value: PlanDraftStatus;
  weekNumber: number;
  onChange: (status: PlanDraftStatus) => void;
  disabled?: boolean;
}) {
  const [open, setOpen] = React.useState(false);
  const rootRef = React.useRef<HTMLDivElement>(null);

  React.useEffect(() => {
    if (!open) return;
    function onDoc(e: MouseEvent) {
      if (!rootRef.current?.contains(e.target as Node)) setOpen(false);
    }
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") setOpen(false);
    }
    document.addEventListener("mousedown", onDoc);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onDoc);
      document.removeEventListener("keydown", onKey);
    };
  }, [open]);

  return (
    <div ref={rootRef} className="relative shrink-0">
      <button
        type="button"
        disabled={disabled}
        aria-label={`Week ${weekNumber} status`}
        aria-haspopup="listbox"
        aria-expanded={open}
        className={cn(
          "inline-flex h-5 items-center gap-1 rounded-full border px-space-1.5",
          "text-[11px] font-medium leading-none tracking-tight antialiased",
          "outline-none focus-visible:ring-1 focus-visible:ring-border-focus",
          statusPillClass(value),
        )}
        onClick={() => setOpen((o) => !o)}
      >
        <StatusIndicator status={value} />
        <span className="leading-none">
          {value === "No class" ? "No class" : value}
        </span>
      </button>
      {open ? (
        <ul
          role="listbox"
          className="absolute right-0 z-20 mt-1 min-w-[9.5rem] overflow-hidden rounded-md border border-border-default bg-bg-elevated py-1 shadow-md"
        >
          {STATUSES.map((s) => (
            <li key={s} role="option" aria-selected={s === value}>
              <button
                type="button"
                className={cn(
                  "flex w-full items-center gap-1.5 px-space-2 py-1.5 text-left text-[11px] font-medium leading-none tracking-tight",
                  s === value
                    ? "bg-bg-subtle text-text-primary"
                    : "text-text-secondary hover:bg-bg-subtle hover:text-text-primary",
                )}
                onClick={() => {
                  onChange(s);
                  setOpen(false);
                }}
              >
                <StatusIndicator status={s} />
                <span className="leading-none">{s}</span>
              </button>
            </li>
          ))}
        </ul>
      ) : null}
    </div>
  );
}

export function EditablePlanTable({
  subjectId,
  initialRows,
  onSaved,
}: EditablePlanTableProps) {
  const [rows, setRows] = React.useState<PlanDraftRow[]>(initialRows);
  const [baseline, setBaseline] = React.useState(() =>
    JSON.stringify(initialRows),
  );
  const [saving, setSaving] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);
  const [okMsg, setOkMsg] = React.useState<string | null>(null);

  React.useEffect(() => {
    setRows(initialRows);
    setBaseline(JSON.stringify(initialRows));
    setError(null);
    setOkMsg(null);
  }, [initialRows]);

  const dirty = JSON.stringify(rows) !== baseline;

  function updateRow(key: string, patch: Partial<PlanDraftRow>) {
    setRows((prev) =>
      prev.map((r) => (r.key === key ? { ...r, ...patch } : r)),
    );
    setOkMsg(null);
  }

  function addTemplate() {
    setRows((prev) => {
      if (prev.length >= MAX_PLAN_ENTRIES) return prev;
      const last = prev[prev.length - 1];
      return [
        ...prev,
        {
          key: nextKey(),
          weekNumber: last?.weekNumber ?? 1,
          topic: "",
          outcome: "",
          activities: "",
          status: "Not started",
        },
      ];
    });
    setError(null);
    setOkMsg(null);
  }

  /** Duplicate row — same week #, copies topic/outcome/activities/status. */
  function duplicateWeek(key: string) {
    setRows((prev) => {
      const source = prev.find((r) => r.key === key);
      if (!source || prev.length >= MAX_PLAN_ENTRIES) return prev;
      const copy: PlanDraftRow = {
        key: nextKey(),
        weekNumber: source.weekNumber,
        topic: source.topic,
        outcome: source.outcome,
        activities: source.activities,
        status: source.status === "Done" ? "Not started" : source.status,
      };
      const idx = prev.findIndex((r) => r.key === key);
      const next = prev.slice();
      next.splice(idx + 1, 0, copy);
      return next;
    });
    setError(null);
    setOkMsg(null);
  }

  function removeWeek(key: string) {
    setRows((prev) => prev.filter((r) => r.key !== key));
    setOkMsg(null);
  }

  async function save() {
    for (const r of rows) {
      if (!Number.isFinite(r.weekNumber) || r.weekNumber < 1 || r.weekNumber > 30) {
        setError("Each week needs a number from 1–30.");
        return;
      }
    }
    setSaving(true);
    setError(null);
    try {
      const saved = await replacePlan(
        subjectId,
        rows.map((r, index) => ({
          weekNumber: r.weekNumber,
          position: index,
          topic: r.topic.trim() || null,
          outcome: r.outcome.trim() || null,
          activities: r.activities.trim() || null,
          status: r.status,
        })),
      );
      const next: PlanDraftRow[] = saved.map((w) => ({
        key: w.id,
        weekNumber: w.weekNumber,
        topic: w.topic ?? "",
        outcome: w.outcome ?? "",
        activities: w.activities ?? "",
        status: w.status,
      }));
      setRows(next);
      setBaseline(JSON.stringify(next));
      setOkMsg("Saved.");
      onSaved?.();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not save plan.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="flex w-full flex-col gap-space-3">
      <div className="flex flex-wrap items-center justify-between gap-space-2">
        <p className="text-body-sm text-text-muted">
          Same week number can have many rows (topics, outcomes, activities).
          Duplicate keeps the week #. Done ticks Checklist too.
        </p>
        <div className="flex flex-wrap items-center gap-space-2">
          {error ? (
            <span className="text-[11px] text-status-error">{error}</span>
          ) : okMsg ? (
            <span className="text-[11px] text-status-success">{okMsg}</span>
          ) : dirty ? (
            <span className="text-[11px] text-text-muted">Unsaved changes</span>
          ) : null}
          <Button
            type="button"
            variant="Secondary"
            size="sm"
            onClick={addTemplate}
            disabled={saving || rows.length >= MAX_PLAN_ENTRIES}
          >
            <Plus className="size-3.5" aria-hidden />
            Add Templates
          </Button>
          <Button
            type="button"
            variant="Primary"
            size="sm"
            onClick={() => void save()}
            disabled={saving || !dirty}
          >
            {saving ? "Saving…" : "Save plan"}
          </Button>
        </div>
      </div>

      <div className="w-full overflow-x-auto">
        <Table header={<WeekTableHeader showDone={false} />}>
          {rows.length === 0 ? (
            <div className="px-space-3 py-space-6 text-center text-body-sm text-text-muted">
              No weeks yet. Use Add Templates to start your learning plan.
            </div>
          ) : (
            rows.map((row) => {
              const isNoClass = row.status === "No class";
              return (
                <div
                  key={row.key}
                  role="row"
                  className="grid w-full min-w-[760px] grid-cols-[minmax(3rem,0.7fr)_minmax(0,2.2fr)_minmax(0,1.1fr)_minmax(0,1.2fr)_minmax(0,1.15fr)] items-center gap-x-space-3 border-b border-border-subtle px-space-3 py-space-1"
                >
                  <div className="min-w-0">
                    <input
                      type="number"
                      min={1}
                      max={30}
                      aria-label="Week number"
                      className={cn(
                        cellInput,
                        "font-mono tabular-nums text-text-secondary",
                      )}
                      value={row.weekNumber}
                      onChange={(e) =>
                        updateRow(row.key, {
                          weekNumber: Number(e.target.value) || 1,
                        })
                      }
                    />
                  </div>
                  <div className="min-w-0">
                    <input
                      type="text"
                      aria-label={`Week ${row.weekNumber} topic`}
                      placeholder="Topic"
                      disabled={isNoClass}
                      className={cn(
                        cellInput,
                        "font-semibold",
                        isNoClass && "text-text-muted",
                      )}
                      value={isNoClass ? "No class" : row.topic}
                      onChange={(e) =>
                        updateRow(row.key, { topic: e.target.value })
                      }
                    />
                  </div>
                  <div className="min-w-0">
                    <input
                      type="text"
                      aria-label={`Week ${row.weekNumber} outcome`}
                      placeholder="Outcome"
                      disabled={isNoClass}
                      className={cn(
                        cellInput,
                        "font-mono tabular-nums text-text-secondary",
                      )}
                      value={isNoClass ? "" : row.outcome}
                      onChange={(e) =>
                        updateRow(row.key, { outcome: e.target.value })
                      }
                    />
                  </div>
                  <div className="min-w-0">
                    <input
                      type="text"
                      aria-label={`Week ${row.weekNumber} activities`}
                      placeholder="Activities"
                      disabled={isNoClass}
                      className={cn(cellInput, "text-text-secondary")}
                      value={isNoClass ? "" : row.activities}
                      onChange={(e) =>
                        updateRow(row.key, { activities: e.target.value })
                      }
                    />
                  </div>
                  <div className="flex min-w-0 items-center justify-end gap-1">
                    <StatusPicker
                      value={row.status}
                      weekNumber={row.weekNumber}
                      disabled={saving}
                      onChange={(status) => updateRow(row.key, { status })}
                    />
                    <button
                      type="button"
                      aria-label={`Duplicate week ${row.weekNumber}`}
                      title="Duplicate week"
                      className="inline-flex size-6 shrink-0 items-center justify-center rounded-sm text-text-muted transition-colors hover:bg-bg-subtle hover:text-text-primary"
                      onClick={() => duplicateWeek(row.key)}
                      disabled={saving || rows.length >= MAX_PLAN_ENTRIES}
                    >
                      <Copy className="size-3.5" aria-hidden />
                    </button>
                    <button
                      type="button"
                      aria-label={`Remove week ${row.weekNumber}`}
                      className="inline-flex size-6 shrink-0 items-center justify-center rounded-sm text-text-muted transition-colors hover:bg-bg-subtle hover:text-status-error"
                      onClick={() => removeWeek(row.key)}
                      disabled={saving}
                    >
                      <Trash2 className="size-3.5" aria-hidden />
                    </button>
                  </div>
                </div>
              );
            })
          )}
        </Table>
      </div>
    </div>
  );
}
