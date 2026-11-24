"use client";

/**
 * Overview subject notes — search, view, edit, delete, pin ≤3, sort time/size.
 * FLOW: fetchPlanNotes → filter/sort client-side · PATCH/POST/DELETE via notes API.
 */

import {
  Check,
  Clock3,
  Eye,
  EyeOff,
  MoreHorizontal,
  Pencil,
  Pin,
  Plus,
  Search,
  Trash2,
  WholeWord,
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

type SortMode = "time" | "size";

export type SubjectNotesPanelProps = {
  subjectId: string;
  live: boolean;
  onActivity?: (entry: {
    kind: "notes";
    title: string;
    detail: string;
  }) => void;
};

function noteSize(note: PlanNoteDto): number {
  return (note.body ?? "").length;
}

/** Pinned first, then time (newest) or size (largest). */
function filterAndSort(
  rows: PlanNoteDto[],
  query: string,
  sort: SortMode,
): PlanNoteDto[] {
  const q = query.trim().toLowerCase();
  let list = rows;
  if (q) {
    list = list.filter((n) => {
      const title = n.title.toLowerCase();
      const body = n.body.toLowerCase();
      const topic = (n.topic ?? "").toLowerCase();
      return title.includes(q) || body.includes(q) || topic.includes(q);
    });
  }

  return [...list].sort((a, b) => {
    if (a.pinned !== b.pinned) return a.pinned ? -1 : 1;
    if (sort === "size") {
      const diff = noteSize(b) - noteSize(a);
      if (diff !== 0) return diff;
    }
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
  const [menuId, setMenuId] = React.useState<string | null>(null);
  const [viewingId, setViewingId] = React.useState<string | null>(null);
  const [editingId, setEditingId] = React.useState<string | null>(null);
  const [editTitle, setEditTitle] = React.useState("");
  const [editBody, setEditBody] = React.useState("");
  const [adding, setAdding] = React.useState(false);
  const [newTitle, setNewTitle] = React.useState("");
  const [newBody, setNewBody] = React.useState("");
  const [savingNew, setSavingNew] = React.useState(false);
  const [query, setQuery] = React.useState("");
  const [sort, setSort] = React.useState<SortMode>("time");

  const pinnedCount = notes.filter((n) => n.pinned).length;
  const visible = React.useMemo(
    () => filterAndSort(notes, query, sort),
    [notes, query, sort],
  );

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
      setNotes(rows);
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
    setMenuId(null);
    setViewingId(null);
    setError(null);
  }

  function cancelEdit() {
    setEditingId(null);
    setEditTitle("");
    setEditBody("");
  }

  function toggleView(noteId: string) {
    setViewingId((id) => (id === noteId ? null : noteId));
    setMenuId(null);
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
        prev.map((n) => (n.id === updated.id ? updated : n)),
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
        prev.map((n) => (n.id === updated.id ? updated : n)),
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
      setMenuId(null);
      if (viewingId === note.id) setViewingId(null);
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
      setMenuId(null);
      if (editingId === note.id) cancelEdit();
      if (viewingId === note.id) setViewingId(null);
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
      setNotes((prev) => [created, ...prev]);
      setNewTitle("");
      setNewBody("");
      setAdding(false);
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

  const emptyCopy = !live
    ? "Sign in to manage notes."
    : loading
      ? "Loading notes…"
      : notes.length === 0
        ? "No notes yet."
        : query.trim()
          ? "No notes match your search."
          : "No notes yet.";

  return (
    <Card title="Notes" hasHeader className="w-full min-w-0">
      <div className="flex w-full min-w-0 flex-col gap-space-3">
        <div className="flex w-full items-center gap-space-2">
          <div
            data-slot="gs-overview-notes-search"
            className={cn(
              "flex min-h-8 min-w-0 flex-1 items-center gap-space-2 overflow-hidden rounded-md",
              "border border-border-default bg-bg-subtle px-space-2",
              "transition-[border-color,box-shadow] duration-150 ease-out",
              "hover:border-border-strong",
              "focus-within:border-2 focus-within:border-border-focus",
              "focus-within:shadow-[0_0_0_3px_var(--focus-ring-glow)]",
            )}
          >
            <Search
              className="size-3.5 shrink-0 text-text-muted"
              aria-hidden
            />
            <input
              type="search"
              placeholder="Search notes…"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              disabled={!live}
              aria-label="Search notes"
              className="min-w-0 flex-1 bg-transparent text-[11px] font-medium leading-snug tracking-tight text-text-primary outline-none placeholder:text-[11px] placeholder:tracking-tight placeholder:text-text-muted disabled:opacity-50"
            />
            <div
              className="flex shrink-0 items-center gap-0.5 border-l border-border-subtle pl-space-1"
              role="group"
              aria-label="Sort notes"
            >
              <button
                type="button"
                aria-label="Sort by time"
                aria-pressed={sort === "time"}
                title="Sort by time"
                disabled={!live}
                className={cn(
                  "flex size-6 items-center justify-center rounded-sm outline-none",
                  "hover:bg-bg-muted focus-visible:border focus-visible:border-border-focus",
                  sort === "time" ? "text-accent-primary" : "text-text-muted",
                  !live && "pointer-events-none opacity-40",
                )}
                onClick={() => setSort("time")}
              >
                <Clock3 className="size-3.5" aria-hidden />
              </button>
              <button
                type="button"
                aria-label="Sort by size"
                aria-pressed={sort === "size"}
                title="Sort by size (longest first)"
                disabled={!live}
                className={cn(
                  "flex size-6 items-center justify-center rounded-sm outline-none",
                  "hover:bg-bg-muted focus-visible:border focus-visible:border-border-focus",
                  sort === "size" ? "text-accent-primary" : "text-text-muted",
                  !live && "pointer-events-none opacity-40",
                )}
                onClick={() => setSort("size")}
              >
                <WholeWord className="size-3.5" aria-hidden />
              </button>
            </div>
          </div>
          <span className="shrink-0 text-[10px] font-medium tracking-tight text-text-muted">
            {live ? `${pinnedCount}/3` : "—"}
          </span>
        </div>

        <div className="flex items-center justify-between gap-space-2">
          <p className="text-caption text-text-muted">
            {live ? "Pin up to 3 · view, edit, delete" : "Sign in to manage notes"}
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
              {adding ? "Hide" : "Add"}
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

        {!live || loading || visible.length === 0 ? (
          <p className="rounded-md border border-border-subtle bg-bg-subtle px-space-3 py-space-4 text-[11px] tracking-tight text-text-muted">
            {emptyCopy}
          </p>
        ) : (
          <ul
            className="flex max-h-[28rem] w-full flex-col gap-space-2 overflow-y-auto"
            aria-label="Subject notes"
          >
            {visible.map((note) => {
              const editing = editingId === note.id;
              const menuOpen = menuId === note.id;
              const viewing = viewingId === note.id;
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
                        rows={4}
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
                        <p
                          className={cn(
                            "mt-0.5 text-[11px] leading-snug tracking-tight text-text-secondary",
                            viewing
                              ? "whitespace-pre-wrap"
                              : "line-clamp-2",
                          )}
                        >
                          {note.body}
                        </p>
                        {viewing ? (
                          <p className="mt-1 text-[10px] text-text-muted">
                            {noteSize(note)} characters
                          </p>
                        ) : null}
                      </div>
                      <div className="relative flex shrink-0 items-center gap-space-1">
                        <button
                          type="button"
                          aria-label={viewing ? "Collapse note" : "View note"}
                          title={viewing ? "Collapse" : "View"}
                          className={cn(
                            "flex size-7 items-center justify-center rounded-sm outline-none",
                            "hover:bg-bg-muted focus-visible:border focus-visible:border-border-focus",
                            viewing
                              ? "text-accent-primary"
                              : "text-text-muted",
                          )}
                          onClick={() => toggleView(note.id)}
                        >
                          {viewing ? (
                            <EyeOff className="size-3.5" aria-hidden />
                          ) : (
                            <Eye className="size-3.5" aria-hidden />
                          )}
                        </button>
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
                            aria-expanded={menuOpen}
                            className={cn(
                              "flex size-7 items-center justify-center rounded-sm text-text-muted outline-none",
                              "hover:bg-bg-muted focus-visible:border focus-visible:border-border-focus",
                              menuOpen && "bg-bg-muted text-text-primary",
                            )}
                            onClick={() =>
                              setMenuId((id) =>
                                id === note.id ? null : note.id,
                              )
                            }
                          >
                            <MoreHorizontal className="size-3.5" aria-hidden />
                          </button>

                          {menuOpen ? (
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
