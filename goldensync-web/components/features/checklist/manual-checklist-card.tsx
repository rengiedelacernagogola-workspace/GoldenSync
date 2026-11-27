"use client";

/**
 * ManualChecklistCard — user-added checklist items beside week ticks.
 * FLOW: add item · tick done · ⋯ toggles Edit/Delete (fade like notes).
 */

import { Check, MoreHorizontal, Pencil, Plus, Trash2, X } from "lucide-react";
import * as React from "react";

import { Button } from "@/components/core/button";
import { Card } from "@/components/core/card";
import { Input } from "@/components/core/input";
import { pushActivity } from "@/lib/activity/activity-log";
import {
  addManualChecklistItem,
  deleteManualChecklistItem,
  loadManualChecklist,
  updateManualChecklistItem,
  type ManualChecklistItem,
} from "@/lib/checklist/manual-items";
import { cn } from "@/lib/utils";

export interface ManualChecklistCardProps {
  subjectId: string;
  subjectCode?: string;
  /** Past semester: show items, hide mutation controls. */
  readOnly?: boolean;
  className?: string;
}

/** Manual checklist with add + per-row ⋯ Edit/Delete. */
export function ManualChecklistCard({
  subjectId,
  subjectCode,
  readOnly = false,
  className,
}: ManualChecklistCardProps) {
  const [items, setItems] = React.useState<ManualChecklistItem[]>([]);
  const [title, setTitle] = React.useState("");
  const [detail, setDetail] = React.useState("");
  const [openId, setOpenId] = React.useState<string | null>(null);
  const [editingId, setEditingId] = React.useState<string | null>(null);
  const [editTitle, setEditTitle] = React.useState("");
  const [editDetail, setEditDetail] = React.useState("");
  const [busy, setBusy] = React.useState(false);

  React.useEffect(() => {
    let cancelled = false;
    const handle = window.setTimeout(() => {
      void loadManualChecklist(subjectId).then((next) => {
        if (!cancelled) setItems(next);
      });
    }, 0);
    return () => {
      cancelled = true;
      window.clearTimeout(handle);
    };
  }, [subjectId]);

  async function handleAdd() {
    if (readOnly || busy || !title.trim()) return;
    setBusy(true);
    try {
      const next = await addManualChecklistItem(subjectId, { title, detail });
      if (next.length === items.length) return;
      setItems(next);
      const savedTitle = title.trim();
      setTitle("");
      setDetail("");
      void pushActivity({
        kind: "system",
        title: "Checklist item added",
        detail: `${savedTitle}${subjectCode ? ` (${subjectCode})` : ""}`,
      });
    } finally {
      setBusy(false);
    }
  }

  async function toggleDone(id: string, done: boolean) {
    if (readOnly) return;
    setItems(await updateManualChecklistItem(subjectId, id, { done }));
  }

  function startEdit(item: ManualChecklistItem) {
    if (readOnly) return;
    setEditingId(item.id);
    setEditTitle(item.title);
    setEditDetail(item.detail);
    setOpenId(null);
  }

  async function saveEdit() {
    if (!editingId || !editTitle.trim()) return;
    setItems(
      await updateManualChecklistItem(subjectId, editingId, {
        title: editTitle,
        detail: editDetail,
      }),
    );
    void pushActivity({
      kind: "system",
      title: "Checklist item updated",
      detail: editTitle.trim(),
    });
    setEditingId(null);
  }

  function cancelEdit() {
    setEditingId(null);
  }

  async function handleDelete(id: string) {
    if (readOnly) return;
    const removed = items.find((i) => i.id === id);
    setItems(await deleteManualChecklistItem(subjectId, id));
    setOpenId(null);
    if (editingId === id) setEditingId(null);
    void pushActivity({
      kind: "system",
      title: "Checklist item deleted",
      detail: removed?.title ?? "Item removed",
    });
  }

  const doneCount = items.filter((i) => i.done).length;

  return (
    <Card
      title="My checklist"
      hasHeader
      className={cn("w-full", className)}
    >
      <div className="flex w-full flex-col gap-space-4">
        <p className="text-[11px] tracking-tight text-text-muted">
          {readOnly
            ? "Personal tasks (view only for past semesters)."
            : "Add your own tasks. Separate from week ticks — never affects grades."}
          {items.length > 0 ? ` · ${doneCount}/${items.length} done` : ""}
        </p>

        {readOnly ? null : (
          <div className="flex w-full flex-col gap-space-2 sm:flex-row sm:items-end">
            <div className="flex min-w-0 flex-1 flex-col gap-space-2">
              <Input
                size="Compact"
                placeholder="(editable)"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                aria-label="Checklist item title"
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    e.preventDefault();
                    void handleAdd();
                  }
                }}
              />
              <Input
                size="Compact"
                placeholder="(editable)"
                value={detail}
                onChange={(e) => setDetail(e.target.value)}
                aria-label="Checklist item detail"
              />
            </div>
            <Button
              variant="Secondary"
              size="sm"
              disabled={busy || !title.trim()}
              onClick={() => void handleAdd()}
              className="shrink-0"
            >
              <Plus className="size-3.5" aria-hidden />
              Add
            </Button>
          </div>
        )}

        <ul className="flex w-full flex-col gap-space-2" aria-label="Manual checklist">
          {items.length === 0 ? (
            <li className="rounded-md border border-border-subtle bg-bg-subtle px-space-3 py-space-4 text-[11px] tracking-tight text-text-muted">
              No personal tasks yet.
            </li>
          ) : (
            items.map((item) => {
              const open = openId === item.id;
              const editing = editingId === item.id;
              return (
                <li
                  key={item.id}
                  className={cn(
                    "flex w-full flex-col overflow-hidden rounded-md border border-border-subtle bg-bg-subtle",
                    item.done && "opacity-70",
                  )}
                >
                  {editing ? (
                    <div className="flex w-full flex-col gap-space-2 p-space-3">
                      <Input
                        size="Compact"
                        value={editTitle}
                        onChange={(e) => setEditTitle(e.target.value)}
                        aria-label="Edit title"
                        placeholder="(editable)"
                      />
                      <Input
                        size="Compact"
                        value={editDetail}
                        onChange={(e) => setEditDetail(e.target.value)}
                        aria-label="Edit detail"
                        placeholder="(editable)"
                      />
                      <div className="flex gap-space-2">
                        <Button
                          variant="Primary"
                          size="sm"
                          onClick={() => void saveEdit()}
                        >
                          Save
                        </Button>
                        <Button
                          variant="Ghost"
                          size="sm"
                          onClick={cancelEdit}
                        >
                          Cancel
                        </Button>
                      </div>
                    </div>
                  ) : (
                    <div className="flex w-full items-start gap-space-2 p-space-3">
                      <button
                        type="button"
                        disabled={readOnly}
                        aria-label={
                          item.done ? "Mark not done" : "Mark done"
                        }
                        aria-pressed={item.done}
                        className={cn(
                          "mt-0.5 flex size-5 shrink-0 items-center justify-center rounded-sm border outline-none",
                          item.done
                            ? "border-accent-primary bg-accent-primary text-white"
                            : "border-border-default bg-bg-base text-transparent",
                          readOnly && "pointer-events-none opacity-60",
                        )}
                        onClick={() => void toggleDone(item.id, !item.done)}
                      >
                        <Check className="size-3" aria-hidden />
                      </button>
                      <div className="min-w-0 flex-1">
                        <p
                          className={cn(
                            "text-[11px] font-semibold tracking-tight text-text-primary",
                            item.done && "line-through",
                          )}
                        >
                          {item.title}
                        </p>
                        {item.detail ? (
                          <p className="text-[10px] tracking-tight text-text-muted">
                            {item.detail}
                          </p>
                        ) : null}
                      </div>
                      {readOnly ? null : (
                        <div className="relative flex h-7 items-center">
                          <div
                            className={cn(
                              "absolute right-8 flex items-center gap-space-1 transition-[opacity,transform] duration-300 ease-out",
                              open
                                ? "pointer-events-none scale-95 opacity-0"
                                : "scale-100 opacity-100",
                            )}
                            aria-hidden={open}
                          />
                          <div
                            className={cn(
                              "absolute right-8 flex items-center gap-0.5 transition-[opacity,transform] duration-300 ease-out",
                              open
                                ? "scale-100 opacity-100"
                                : "pointer-events-none scale-95 opacity-0",
                            )}
                            aria-hidden={!open}
                          >
                            <button
                              type="button"
                              tabIndex={open ? 0 : -1}
                              aria-label="Edit item"
                              className="flex size-7 items-center justify-center rounded-sm text-text-muted outline-none hover:bg-bg-muted hover:text-text-primary focus-visible:border focus-visible:border-border-focus"
                              onClick={() => startEdit(item)}
                            >
                              <Pencil className="size-3.5" aria-hidden />
                            </button>
                            <button
                              type="button"
                              tabIndex={open ? 0 : -1}
                              aria-label="Delete item"
                              className="flex size-7 items-center justify-center rounded-sm text-text-muted outline-none hover:bg-bg-muted hover:text-status-error focus-visible:border focus-visible:border-border-focus"
                              onClick={() => void handleDelete(item.id)}
                            >
                              <Trash2 className="size-3.5" aria-hidden />
                            </button>
                          </div>
                          <button
                            type="button"
                            aria-label={open ? "Close actions" : "More actions"}
                            aria-expanded={open}
                            className="relative z-10 flex size-7 items-center justify-center rounded-sm text-text-muted outline-none hover:bg-bg-muted hover:text-text-primary focus-visible:border focus-visible:border-border-focus"
                            onClick={() =>
                              setOpenId((cur) =>
                                cur === item.id ? null : item.id,
                              )
                            }
                          >
                            {open ? (
                              <X className="size-3.5" aria-hidden />
                            ) : (
                              <MoreHorizontal
                                className="size-3.5"
                                aria-hidden
                              />
                            )}
                          </button>
                        </div>
                      )}
                    </div>
                  )}
                </li>
              );
            })
          )}
        </ul>
      </div>
    </Card>
  );
}
