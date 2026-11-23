"use client";

/**
 * Overview subject notes — pin ≤3, edit, done/forget (archive), delete.
 * FLOW: fetchPlanNotes → local list · PATCH/POST/DELETE via notes API.
 */

import {
  Check,
  MoreHorizontal,
  Pencil,
  Pin,
  Plus,
  Trash2,
  X,
} from "lucide-react";
import Link from "next/link";
import * as React from "react";

import { Button, Card, Input, Textarea } from "@/components/core";
import { ApiClientError } from "@/lib/api/client";
import {
  createPlanNote,
  deletePlanNote,
  fetchPlanNotes,
  patchPlanNote,
  type PlanNoteDto,
} from "@/lib/api/notes";
import { cn } from "@/lib/utils";

export type SubjectNotesPanelProps = {
  subjectId: string;
  live: boolean;
  onActivity?: (entry: {
    kind: "notes";
    title: string;
    detail: string;
  }) => void;
};

function sortNotes(rows: PlanNoteDto[]): PlanNoteDto[] {
  return [...rows].sort((a, b) => {
    if (a.pinned !== b.pinned) return a.pinned ? -1 : 1;
    return b.savedAt.localeCompare(a.savedAt);
  });
}

/** Compact notes card for Overview sidebar. */
export function SubjectNotesPanel({
  subjectId,
  live,
  onActivity,
}: SubjectNotesPanelProps) {
  const [notes, setNotes] = React.useState<PlanNoteDto[]>([]);
  const [loading, setLoading] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);
  const [busyId, setBusyId] = React.useState<string | null>(null);
  const [openId, setOpenId] = React.useState<string | null>(null);
  const [editingId, setEditingId] = React.useState<string | null>(null);
  const [editTitle, setEditTitle] = React.useState("");
  const [editBody, setEditBody] = React.useState("");
  const [adding, setAdding] = React.useState(true);
  const [newTitle, setNewTitle] = React.useState("");
  const [newBody, setNewBody] = React.useState("");
  const [savingNew, setSavingNew] = React.useState(false);

  const pinnedCount = notes.filter((n) => n.pinned).length;

  const reload = React.useCallback(async () => {
    if (!live) {
      setNotes([]);
      setLoading(false);
      setError(null);
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const rows = await fetchPlanNotes(subjectId);
      setNotes(sortNotes(rows));
    } catch (err) {
      setError(
        err instanceof ApiClientError
          ? err.message
          : "Could not load notes.",
      );
    } finally {
      setLoading(false);
    }
  }, [live, subjectId]);

  React.useEffect(() => {
    let cancelled = false;
    void (async () => {
      if (cancelled) return;
      await reload();
    })();
    return () => {
      cancelled = true;
    };
  }, [reload]);

  function beginEdit(note: PlanNoteDto) {
    setEditingId(note.id);
    setEditTitle(note.title);
    setEditBody(note.body);
    setOpenId(null);
    setError(null);
  }

  function cancelEdit() {
    setEditingId(null);
    setEditTitle("");
    setEditBody("");
  }

  async function saveEdit() {
    if (!editingId || !live) return;
    const title = editTitle.trim();
    const body = editBody.trim();
    if (!title || !body) {
      setError("Title and body are required.");
      return;
    }
    setBusyId(editingId);
    setError(null);
    try {
      const updated = await patchPlanNote(subjectId, editingId, {
        title,
        body,
      });
      setNotes((prev) =>
        sortNotes(prev.map((n) => (n.id === updated.id ? updated : n))),
      );
      cancelEdit();
      onActivity?.({
        kind: "notes",
        title: "Note updated",
        detail: title,
      });
    } catch (err) {
      setError(
        err instanceof ApiClientError ? err.message : "Could not save note.",
      );
    } finally {
      setBusyId(null);
    }
  }

  async function togglePin(note: PlanNoteDto) {
    if (!live) return;
    if (!note.pinned && pinnedCount >= 3) {
      setError("At most 3 pinned notes per subject.");
      return;
    }
    setBusyId(note.id);
    setError(null);
    try {
      const updated = await patchPlanNote(subjectId, note.id, {
        pinned: !note.pinned,
      });
      setNotes((prev) =>
        sortNotes(prev.map((n) => (n.id === updated.id ? updated : n))),
      );
      onActivity?.({
        kind: "notes",
        title: updated.pinned ? "Note pinned" : "Note unpinned",
        detail: updated.title.trim() || "Untitled",
      });
    } catch (err) {
      setError(
        err instanceof ApiClientError ? err.message : "Could not update pin.",
      );
    } finally {
      setBusyId(null);
    }
  }

  async function markDone(note: PlanNoteDto) {
    if (!live) return;
    setBusyId(note.id);
    setError(null);
    try {
      await patchPlanNote(subjectId, note.id, { archived: true });
      setNotes((prev) => prev.filter((n) => n.id !== note.id));
      setOpenId(null);
      onActivity?.({
        kind: "notes",
        title: "Note marked done",
        detail: note.title.trim() || "Untitled",
      });
    } catch (err) {
      setError(
        err instanceof ApiClientError
          ? err.message
          : "Could not mark note done.",
      );
    } finally {
      setBusyId(null);
    }
  }

  async function removeNote(note: PlanNoteDto) {
    if (!live) return;
    setBusyId(note.id);
    setError(null);
    try {
      await deletePlanNote(subjectId, note.id);
      setNotes((prev) => prev.filter((n) => n.id !== note.id));
      setOpenId(null);
      if (editingId === note.id) cancelEdit();
      onActivity?.({
        kind: "notes",
        title: "Note deleted",
        detail: note.title.trim() || "Untitled",
      });
    } catch (err) {
      setError(
        err instanceof ApiClientError
          ? err.message
          : "Could not delete note.",
      );
    } finally {
      setBusyId(null);
    }
  }

  async function addNote() {
    if (!live) return;
    const title = newTitle.trim();
    const body = newBody.trim();
    if (!title || !body) {
      setError("Title and body are required.");
      return;
    }
    setSavingNew(true);
    setError(null);
    try {
      const created = await createPlanNote(subjectId, { title, body });
      setNotes((prev) => sortNotes([created, ...prev]));
      setNewTitle("");
      setNewBody("");
      setAdding(true);
      onActivity?.({
        kind: "notes",
        title: "Note created",
        detail: title,
      });
    } catch (err) {
      setError(
        err instanceof ApiClientError
          ? err.message
          : "Could not create note.",
      );
    } finally {
      setSavingNew(false);
    }
  }

  return (
    <Card title="Notes" hasHeader className="w-full">
      <div className="flex w-full flex-col gap-space-3">
        <div className="flex items-center justify-between gap-space-2">
          <p className="text-caption text-text-muted">
            {live ? `${pinnedCount}/3 pinned` : "Sign in to manage notes"}
          </p>
          {live ? (
            <Button
              variant="Secondary"
              size="sm"
              onClick={() => {
                setAdding((v) => !v);
                setError(null);
              }}
              aria-label={adding ? "Hide new note form" : "Add note"}
            >
              {adding ? (
                <X className="size-3.5" aria-hidden />
              ) : (
                <Plus className="size-3.5" aria-hidden />
              )}
              {adding ? "Hide" : "Add note"}
            </Button>
          ) : null}
        </div>

        {error ? (
          <p className="text-body-sm text-status-error" role="alert">
            {error}
          </p>
        ) : null}

        {adding && live ? (
          <div className="flex w-full flex-col gap-space-2 rounded-md border border-border-subtle bg-bg-subtle p-space-3">
            <Input
              size="Compact"
              value={newTitle}
              onChange={(e) => setNewTitle(e.target.value)}
              placeholder="Title"
              aria-label="New note title"
            />
            <Textarea
              rows={3}
              value={newBody}
              onChange={(e) => setNewBody(e.target.value)}
              placeholder="Note…"
              aria-label="New note body"
            />
            <div className="flex gap-space-2">
              <Button
                variant="Primary"
                size="sm"
                disabled={savingNew}
                onClick={() => void addNote()}
              >
                {savingNew ? "Saving…" : "Save"}
              </Button>
              <Button
                variant="Ghost"
                size="sm"
                disabled={savingNew}
                onClick={() => {
                  setAdding(false);
                  setNewTitle("");
                  setNewBody("");
                }}
              >
                Cancel
              </Button>
            </div>
          </div>
        ) : null}

        {!live ? (
          <p className="text-body-sm text-text-muted">
            No live notes for this subject.
          </p>
        ) : loading ? (
          <p className="text-body-sm text-text-muted">Loading notes…</p>
        ) : notes.length === 0 ? (
          <p className="text-body-sm text-text-muted">No notes yet.</p>
        ) : (
          <ul
            className="flex max-h-[28rem] w-full flex-col gap-space-2 overflow-y-auto"
            aria-label="Subject notes"
          >
            {notes.map((note) => {
              const editing = editingId === note.id;
              const open = openId === note.id;
              const pinDisabled = !note.pinned && pinnedCount >= 3;
              const busy = busyId === note.id;

              return (
                <li
                  key={note.id}
                  className={cn(
                    "flex w-full flex-col overflow-hidden rounded-md border border-border-subtle bg-bg-subtle",
                    note.pinned &&
                      "border-accent-glass-border border-l-2 border-l-accent-primary bg-accent-glass-bg",
                  )}
                >
                  {editing ? (
                    <div className="flex w-full flex-col gap-space-2 p-space-3">
                      <Input
                        size="Compact"
                        value={editTitle}
                        onChange={(e) => setEditTitle(e.target.value)}
                        aria-label="Edit note title"
                      />
                      <Textarea
                        rows={3}
                        value={editBody}
                        onChange={(e) => setEditBody(e.target.value)}
                        aria-label="Edit note body"
                      />
                      <div className="flex gap-space-2">
                        <Button
                          variant="Primary"
                          size="sm"
                          disabled={busy}
                          onClick={() => void saveEdit()}
                        >
                          {busy ? "Saving…" : "Save"}
                        </Button>
                        <Button
                          variant="Ghost"
                          size="sm"
                          disabled={busy}
                          onClick={cancelEdit}
                        >
                          Cancel
                        </Button>
                      </div>
                    </div>
                  ) : (
                    <div className="flex w-full items-start gap-space-2 p-space-3">
                      <div className="min-w-0 flex-1">
                        <p className="truncate text-[11px] font-semibold tracking-tight text-text-primary">
                          {note.title.trim() || "Untitled"}
                        </p>
                        <p className="mt-0.5 line-clamp-3 text-[11px] leading-snug tracking-tight text-text-secondary">
                          {note.body}
                        </p>
                      </div>
                      <div className="relative flex shrink-0 items-center gap-space-1">
                        <button
                          type="button"
                          disabled={busy || pinDisabled}
                          aria-label={
                            note.pinned
                              ? "Unpin note"
                              : pinDisabled
                                ? "Pin limit reached (3)"
                                : "Pin note"
                          }
                          className={cn(
                            "flex size-7 items-center justify-center rounded-sm outline-none",
                            "hover:bg-bg-muted focus-visible:border focus-visible:border-border-focus",
                            note.pinned
                              ? "text-accent-primary"
                              : "text-text-muted",
                            (busy || pinDisabled) &&
                              "pointer-events-none opacity-40",
                          )}
                          onClick={() => void togglePin(note)}
                        >
                          <Pin
                            className={cn(
                              "size-3.5",
                              note.pinned && "fill-accent-primary",
                            )}
                            aria-hidden
                          />
                        </button>

                        <div className="relative flex h-7 items-center">
                          <button
                            type="button"
                            aria-label="More note actions"
                            aria-expanded={open}
                            className={cn(
                              "flex size-7 items-center justify-center rounded-sm text-text-muted outline-none",
                              "hover:bg-bg-muted focus-visible:border focus-visible:border-border-focus",
                              open && "bg-bg-muted text-text-primary",
                            )}
                            onClick={() =>
                              setOpenId((id) =>
                                id === note.id ? null : note.id,
                              )
                            }
                          >
                            <MoreHorizontal className="size-3.5" aria-hidden />
                          </button>

                          {open ? (
                            <div
                              role="group"
                              aria-label="Note actions"
                              className="absolute top-full right-0 z-10 mt-1 flex items-center gap-space-1 rounded-md border border-border-subtle bg-bg-base p-space-1 shadow-md"
                            >
                              <button
                                type="button"
                                aria-label="Edit note"
                                title="Edit"
                                disabled={busy}
                                className="flex size-7 items-center justify-center rounded-sm text-accent-primary outline-none hover:bg-bg-muted"
                                onClick={() => beginEdit(note)}
                              >
                                <Pencil className="size-3.5" aria-hidden />
                              </button>
                              <button
                                type="button"
                                aria-label="Mark done and forget"
                                title="Done / forget"
                                disabled={busy}
                                className="flex size-7 items-center justify-center rounded-sm text-status-success outline-none hover:bg-bg-muted"
                                onClick={() => void markDone(note)}
                              >
                                <Check className="size-3.5" aria-hidden />
                              </button>
                              <button
                                type="button"
                                aria-label="Delete note"
                                title="Delete"
                                disabled={busy}
                                className="flex size-7 items-center justify-center rounded-sm text-status-error outline-none hover:bg-bg-muted"
                                onClick={() => void removeNote(note)}
                              >
                                <Trash2 className="size-3.5" aria-hidden />
                              </button>
                            </div>
                          ) : null}
                        </div>
                      </div>
                    </div>
                  )}
                </li>
              );
            })}
          </ul>
        )}

        {live ? (
          <Link
            href={`/notes?subject=${encodeURIComponent(subjectId)}`}
            className="text-caption text-accent-primary hover:underline"
          >
            Open Notes hub
          </Link>
        ) : null}
      </div>
    </Card>
  );
}
