"use client";

/**
 * NotesLibraryCard — filter icon · search / sort / pin + shelf (Archived · Deleted · History).
 * Soft-deleted notes stay 30 days before system purge.
 */

import {
  Archive,
  Check,
  Clock3,
  Filter,
  History,
  MoreHorizontal,
  Pencil,
  Pin,
  RotateCcw,
  Search,
  Star,
  Trash2,
} from "lucide-react";
import * as React from "react";
import { createPortal } from "react-dom";

import { Badge } from "@/components/core/badge";
import { Card } from "@/components/core/card";
import { MenuItem } from "@/components/core/menu-item";
import { Popover } from "@/components/core/menu";
import { limits } from "@/lib/config/limits";
import { cn } from "@/lib/utils";

export interface PlanNoteItem {
  id: string;
  weekNumber: number;
  title: string;
  topic: string;
  body: string;
  /** Epoch ms — used for Time sort when present. */
  savedAt?: number;
  importance?: 1 | 2 | 3;
  pinned?: boolean;
  archived?: boolean;
  deleted?: boolean;
  archivedAt?: string | null;
  deletedAt?: string | null;
  /** Set on the global Notes hub. */
  subjectId?: string;
  subjectCode?: string;
  /** When true, hide mutation controls for this note. */
  readOnly?: boolean;
}

type SortMode = "time" | "importance";
type ShelfView = "active" | "archived" | "deleted" | "history";

export interface NotesLibraryFilterSubject {
  id: string;
  courseCode: string;
}

export interface NotesLibraryCardProps {
  subjectId: string;
  notes: PlanNoteItem[];
  className?: string;
  /** Subject options for the header filter icon menu. */
  subjects?: NotesLibraryFilterSubject[];
  filterSubjectId?: string;
  onFilterSubjectChange?: (subjectId: string) => void;
  onEditNote?: (note: PlanNoteItem) => void;
  onDeleteNote?: (noteId: string) => void;
  onArchiveNote?: (noteId: string) => void;
  onRestoreNote?: (noteId: string) => void;
  onUpdateMeta?: (
    noteId: string,
    patch: { importance?: 1 | 2 | 3; pinned?: boolean },
  ) => void;
}

function daysLeftUntilPurge(deletedAt: string | null | undefined): number | null {
  if (!deletedAt) return null;
  const when = Date.parse(deletedAt);
  if (!Number.isFinite(when)) return null;
  const expires =
    when + limits.NOTE_SOFT_DELETE_DAYS * 24 * 60 * 60 * 1000;
  return Math.max(0, Math.ceil((expires - Date.now()) / (24 * 60 * 60 * 1000)));
}

/** Browse saved notes: compact search+sort, pin ≤3, shelf bar for trash/archive. */
export function NotesLibraryCard({
  notes,
  className,
  subjects = [],
  filterSubjectId = "all",
  onFilterSubjectChange,
  onEditNote,
  onDeleteNote,
  onArchiveNote,
  onRestoreNote,
  onUpdateMeta,
}: NotesLibraryCardProps) {
  const [query, setQuery] = React.useState("");
  const [sort, setSort] = React.useState<SortMode>("time");
  const [openId, setOpenId] = React.useState<string | null>(null);
  const [view, setView] = React.useState<ShelfView>("active");
  const [filterOpen, setFilterOpen] = React.useState(false);
  const [filterMenuPos, setFilterMenuPos] = React.useState<{
    top: number;
    left: number;
  } | null>(null);
  const filterBtnRef = React.useRef<HTMLButtonElement>(null);

  const showFilter = typeof onFilterSubjectChange === "function";

  React.useEffect(() => {
    if (!filterOpen) return;
    function place() {
      const el = filterBtnRef.current;
      if (!el) return;
      const r = el.getBoundingClientRect();
      setFilterMenuPos({ top: r.bottom + 6, left: r.left });
    }
    place();
    function onDoc(e: MouseEvent) {
      const t = e.target as Node;
      if (filterBtnRef.current?.contains(t)) return;
      const menu = document.querySelector('[data-slot="gs-notes-filter-menu"]');
      if (menu?.contains(t)) return;
      setFilterOpen(false);
    }
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") setFilterOpen(false);
    }
    window.addEventListener("resize", place);
    window.addEventListener("scroll", place, true);
    document.addEventListener("mousedown", onDoc);
    document.addEventListener("keydown", onKey);
    return () => {
      window.removeEventListener("resize", place);
      window.removeEventListener("scroll", place, true);
      document.removeEventListener("mousedown", onDoc);
      document.removeEventListener("keydown", onKey);
    };
  }, [filterOpen]);

  function toggleActions(id: string) {
    setOpenId((cur) => (cur === id ? null : id));
  }

  function noteMeta(note: PlanNoteItem) {
    return {
      importance: (note.importance ?? 1) as 1 | 2 | 3,
      pinned: note.pinned ?? false,
    };
  }

  const activeNotes = notes.filter((n) => !n.archived && !n.deleted);
  const archivedNotes = notes.filter((n) => n.archived && !n.deleted);
  const deletedNotes = notes.filter((n) => n.deleted);
  const historyNotes = [...archivedNotes, ...deletedNotes].sort(
    (a, b) => (b.savedAt ?? 0) - (a.savedAt ?? 0),
  );

  const shelfNotes =
    view === "active"
      ? activeNotes
      : view === "archived"
        ? archivedNotes
        : view === "deleted"
          ? deletedNotes
          : historyNotes;

  const pinnedCount = activeNotes.filter((n) => n.pinned).length;

  function togglePin(id: string) {
    const note = activeNotes.find((n) => n.id === id);
    if (!note) return;
    const current = noteMeta(note);
    if (!current.pinned && pinnedCount >= 3) return;
    onUpdateMeta?.(id, { pinned: !current.pinned });
  }

  function cycleImportance(id: string) {
    const note = activeNotes.find((n) => n.id === id);
    if (!note) return;
    const current = noteMeta(note);
    const next = ((current.importance % 3) + 1) as 1 | 2 | 3;
    onUpdateMeta?.(id, { importance: next });
  }

  const filtered = React.useMemo(() => {
    const q = query.trim().toLowerCase();
    let list = shelfNotes.filter((n) => {
      if (!q) return true;
      return (
        n.body.toLowerCase().includes(q) ||
        n.title.toLowerCase().includes(q) ||
        n.topic.toLowerCase().includes(q) ||
        (n.subjectCode?.toLowerCase().includes(q) ?? false) ||
        `week ${n.weekNumber}`.includes(q)
      );
    });

    list = [...list].sort((a, b) => {
      const ma = {
        importance: a.importance ?? 1,
        pinned: a.pinned ?? false,
      };
      const mb = {
        importance: b.importance ?? 1,
        pinned: b.pinned ?? false,
      };
      if (view === "active" && ma.pinned !== mb.pinned) {
        return ma.pinned ? -1 : 1;
      }
      if (sort === "importance") {
        if (mb.importance !== ma.importance) {
          return mb.importance - ma.importance;
        }
      }
      const ta = a.savedAt ?? a.weekNumber;
      const tb = b.savedAt ?? b.weekNumber;
      return tb - ta;
    });

    return list;
  }, [shelfNotes, query, sort, view]);

  const title =
    view === "active"
      ? "All notes"
      : view === "archived"
        ? "Archived notes"
        : view === "deleted"
          ? "Deleted notes"
          : "Note history";

  const emptyCopy =
    view === "active"
      ? notes.length === 0 || activeNotes.length === 0
        ? "No notes yet. Save a note to see it here."
        : "No notes match your search."
      : view === "archived"
        ? "No archived notes."
        : view === "deleted"
          ? "No deleted notes in the 30-day trash."
          : "No archive or trash history yet.";

  return (
    <Card
      title={title}
      hasHeader={false}
      hasFooter
      footer={
        <div
          data-slot="gs-notes-shelf"
          className="flex w-full flex-col gap-space-2"
        >
          <div
            role="tablist"
            aria-label="Note shelves"
            className="flex w-full items-stretch gap-space-1"
          >
            {(
              [
                {
                  id: "archived" as const,
                  label: "Archived",
                  icon: <Archive className="size-3.5" aria-hidden />,
                  count: archivedNotes.length,
                },
                {
                  id: "deleted" as const,
                  label: "Deleted",
                  icon: <Trash2 className="size-3.5" aria-hidden />,
                  count: deletedNotes.length,
                },
                {
                  id: "history" as const,
                  label: "History",
                  icon: <History className="size-3.5" aria-hidden />,
                  count: historyNotes.length,
                },
              ] as const
            ).map((tab) => {
              const selected = view === tab.id;
              return (
                <button
                  key={tab.id}
                  type="button"
                  role="tab"
                  aria-selected={selected}
                  className={cn(
                    "flex min-w-0 flex-1 items-center justify-center gap-space-1 rounded-md px-space-2 py-space-2",
                    "text-[10px] font-medium tracking-tight outline-none transition-colors",
                    "hover:bg-bg-muted focus-visible:border focus-visible:border-border-focus",
                    selected
                      ? "bg-bg-muted text-accent-primary"
                      : "text-text-muted",
                  )}
                  onClick={() =>
                    setView((cur) => (cur === tab.id ? "active" : tab.id))
                  }
                >
                  {tab.icon}
                  <span className="truncate">{tab.label}</span>
                  <span className="tabular-nums text-text-disabled">
                    {tab.count}
                  </span>
                </button>
              );
            })}
          </div>
          {view !== "active" ? (
            <div className="flex items-center justify-between gap-space-2">
              <p className="text-[10px] tracking-tight text-text-muted">
                {view === "deleted"
                  ? `Deleted notes are kept ${limits.NOTE_SOFT_DELETE_DAYS} days, then permanently removed.`
                  : view === "history"
                    ? `Archive + trash · deleted items purge after ${limits.NOTE_SOFT_DELETE_DAYS} days.`
                    : "Archived notes stay until you restore or delete them."}
              </p>
              <button
                type="button"
                className="shrink-0 text-[10px] font-medium tracking-tight text-accent-primary outline-none hover:underline focus-visible:underline"
                onClick={() => setView("active")}
              >
                Back to all
              </button>
            </div>
          ) : (
            <p className="text-[10px] tracking-tight text-text-muted">
              Trash keeps notes {limits.NOTE_SOFT_DELETE_DAYS} days before
              permanent delete.
            </p>
          )}
        </div>
      }
      className={cn("flex h-full min-h-0 w-full flex-col", className)}
    >
      <div className="flex w-full flex-col gap-space-3">
        <div
          data-slot="gs-notes-library-header"
          className="relative flex w-full items-center gap-space-2 border-b border-border-subtle pb-space-4"
        >
          {showFilter ? (
            <button
              ref={filterBtnRef}
              type="button"
              aria-label="Filter notes by subject"
              aria-expanded={filterOpen}
              aria-haspopup="menu"
              title="Filter by subject"
              className={cn(
                "flex size-8 shrink-0 items-center justify-center rounded-md outline-none",
                "hover:bg-bg-muted focus-visible:border focus-visible:border-border-focus",
                filterOpen || filterSubjectId !== "all"
                  ? "text-accent-primary"
                  : "text-text-muted",
              )}
              onClick={() => setFilterOpen((o) => !o)}
            >
              <Filter className="size-4" aria-hidden strokeWidth={2} />
            </button>
          ) : null}
          <h3 className="min-w-0 flex-1 truncate text-heading-lg text-text-primary">
            {title}
          </h3>
        </div>

        {showFilter &&
        filterOpen &&
        filterMenuPos &&
        typeof document !== "undefined"
          ? createPortal(
              <div
                data-slot="gs-notes-filter-menu"
                className="fixed z-50"
                style={{
                  top: filterMenuPos.top,
                  left: filterMenuPos.left,
                }}
              >
                <Popover aria-label="Filter notes by subject" className="w-56">
                  <MenuItem
                    label="All subjects"
                    selected={filterSubjectId === "all"}
                    icon={
                      filterSubjectId === "all" ? (
                        <Check className="size-4" aria-hidden />
                      ) : (
                        <span className="size-4" aria-hidden />
                      )
                    }
                    onClick={() => {
                      onFilterSubjectChange?.("all");
                      setFilterOpen(false);
                    }}
                  />
                  {subjects.map((s) => (
                    <MenuItem
                      key={s.id}
                      label={s.courseCode}
                      selected={filterSubjectId === s.id}
                      icon={
                        filterSubjectId === s.id ? (
                          <Check className="size-4" aria-hidden />
                        ) : (
                          <span className="size-4" aria-hidden />
                        )
                      }
                      onClick={() => {
                        onFilterSubjectChange?.(s.id);
                        setFilterOpen(false);
                      }}
                    />
                  ))}
                </Popover>
              </div>,
              document.body,
            )
          : null}

        <div className="flex w-full items-center gap-space-2">
          <div
            data-slot="gs-notes-search"
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
              placeholder="Search…"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              aria-label="Search notes"
              className="min-w-0 flex-1 bg-transparent text-[11px] font-medium leading-snug tracking-tight text-text-primary outline-none placeholder:text-[11px] placeholder:tracking-tight placeholder:text-text-muted"
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
                className={cn(
                  "flex size-6 items-center justify-center rounded-sm outline-none",
                  "hover:bg-bg-muted focus-visible:border focus-visible:border-border-focus",
                  sort === "time" ? "text-accent-primary" : "text-text-muted",
                )}
                onClick={() => setSort("time")}
              >
                <Clock3 className="size-3.5" aria-hidden />
              </button>
              <button
                type="button"
                aria-label="Sort by importance"
                aria-pressed={sort === "importance"}
                title="Sort by importance"
                className={cn(
                  "flex size-6 items-center justify-center rounded-sm outline-none",
                  "hover:bg-bg-muted focus-visible:border focus-visible:border-border-focus",
                  sort === "importance"
                    ? "text-accent-primary"
                    : "text-text-muted",
                )}
                onClick={() => setSort("importance")}
              >
                <Star
                  className={cn(
                    "size-3.5",
                    sort === "importance" && "fill-accent-primary",
                  )}
                  aria-hidden
                />
              </button>
            </div>
          </div>
          {view === "active" ? (
            <span className="shrink-0 text-[10px] font-medium tracking-tight text-text-muted">
              {pinnedCount}/3
            </span>
          ) : null}
        </div>

        <ul
          className="flex max-h-56 min-h-32 w-full flex-col gap-space-2 overflow-y-auto"
          aria-label={title}
        >
          {filtered.length === 0 ? (
            <li className="rounded-md border border-border-subtle bg-bg-subtle px-space-3 py-space-4 text-[11px] tracking-tight text-text-muted">
              {emptyCopy}
            </li>
          ) : (
            filtered.map((note) => {
              const m = noteMeta(note);
              const pinDisabled = !m.pinned && pinnedCount >= 3;
              const open = openId === note.id;
              const left = daysLeftUntilPurge(note.deletedAt);
              const shelved = note.archived || note.deleted;

              return (
                <li
                  key={note.id}
                  className={cn(
                    "flex w-full flex-col overflow-hidden rounded-md border border-border-subtle bg-bg-subtle",
                    m.pinned &&
                      view === "active" &&
                      "border-accent-glass-border border-l-2 border-l-accent-primary bg-accent-glass-bg",
                  )}
                >
                  <div className="flex w-full items-start gap-space-2 p-space-3">
                    <div className="flex min-w-0 flex-1 flex-col gap-0.5">
                      <div className="flex flex-wrap items-center gap-space-2">
                        <span className="text-[11px] font-semibold tracking-tight text-text-primary">
                          {note.title.trim() || `Week ${note.weekNumber}`}
                        </span>
                        {note.subjectCode ? (
                          <span className="truncate text-[10px] font-medium tracking-tight text-accent-primary">
                            {note.subjectCode}
                          </span>
                        ) : null}
                        {note.topic ? (
                          <span className="truncate text-[10px] tracking-tight text-text-muted">
                            {note.topic}
                          </span>
                        ) : null}
                        {note.deleted ? (
                          <Badge variant="Default" size="sm">
                            Deleted
                            {left != null ? ` · ${left}d` : ""}
                          </Badge>
                        ) : note.archived ? (
                          <Badge variant="Default" size="sm">
                            Archived
                          </Badge>
                        ) : m.pinned ? (
                          <Badge variant="Accent" size="sm">
                            Pinned
                          </Badge>
                        ) : null}
                      </div>
                      <p className="line-clamp-2 text-[11px] leading-snug tracking-tight text-text-secondary">
                        {note.body}
                      </p>
                    </div>
                    <div className="flex shrink-0 items-center gap-space-1">
                      {note.readOnly ? (
                        <span className="text-[10px] tracking-tight text-text-muted">
                          View only
                        </span>
                      ) : shelved ? (
                        <button
                          type="button"
                          aria-label="Restore note"
                          title="Restore"
                          className="flex size-7 items-center justify-center rounded-sm text-accent-primary outline-none hover:bg-bg-muted focus-visible:border focus-visible:border-border-focus"
                          onClick={() => onRestoreNote?.(note.id)}
                        >
                          <RotateCcw className="size-3.5" aria-hidden />
                        </button>
                      ) : (
                        <>
                          <div className="relative flex h-7 items-center">
                            <div
                              className={cn(
                                "flex items-center gap-space-1 transition-[opacity,transform] duration-300 ease-out",
                                open
                                  ? "pointer-events-none scale-95 opacity-0"
                                  : "scale-100 opacity-100",
                              )}
                              aria-hidden={open}
                            >
                              <button
                                type="button"
                                tabIndex={open ? -1 : 0}
                                aria-label={`Importance ${m.importance} of 3. Click to change.`}
                                className="flex items-center gap-0.5 rounded-sm px-space-1 py-0.5 text-text-muted outline-none hover:text-status-warning focus-visible:border focus-visible:border-border-focus"
                                onClick={() => cycleImportance(note.id)}
                              >
                                {Array.from({ length: 3 }, (_, i) => (
                                  <Star
                                    key={i}
                                    className={cn(
                                      "size-3.5",
                                      i < m.importance
                                        ? "fill-status-warning text-status-warning"
                                        : "text-text-disabled",
                                    )}
                                    aria-hidden
                                  />
                                ))}
                              </button>
                              <button
                                type="button"
                                tabIndex={open ? -1 : 0}
                                aria-label={
                                  m.pinned
                                    ? "Unpin note"
                                    : pinDisabled
                                      ? "Pin limit reached (3)"
                                      : "Pin note"
                                }
                                disabled={pinDisabled}
                                className={cn(
                                  "flex size-7 items-center justify-center rounded-sm outline-none",
                                  "hover:bg-bg-muted focus-visible:border focus-visible:border-border-focus",
                                  m.pinned
                                    ? "text-accent-primary"
                                    : "text-text-muted",
                                  pinDisabled &&
                                    "pointer-events-none opacity-40",
                                )}
                                onClick={() => togglePin(note.id)}
                              >
                                <Pin
                                  className={cn(
                                    "size-3.5",
                                    m.pinned && "fill-accent-primary",
                                  )}
                                  aria-hidden
                                />
                              </button>
                            </div>

                            <div
                              id={`note-actions-${note.id}`}
                              role="group"
                              aria-label="Note actions"
                              className={cn(
                                "absolute inset-y-0 right-0 flex items-center gap-space-1 transition-[opacity,transform] duration-300 ease-out",
                                open
                                  ? "scale-100 opacity-100"
                                  : "pointer-events-none scale-95 opacity-0",
                              )}
                              aria-hidden={!open}
                            >
                              <button
                                type="button"
                                tabIndex={open ? 0 : -1}
                                aria-label="Edit note"
                                title="Edit"
                                className="flex size-7 items-center justify-center rounded-sm text-accent-primary outline-none hover:bg-bg-muted focus-visible:border focus-visible:border-border-focus"
                                onClick={() => onEditNote?.(note)}
                              >
                                <Pencil className="size-3.5" aria-hidden />
                              </button>
                              <button
                                type="button"
                                tabIndex={open ? 0 : -1}
                                aria-label="Archive note"
                                title="Archive"
                                className="flex size-7 items-center justify-center rounded-sm text-text-muted outline-none hover:bg-bg-muted focus-visible:border focus-visible:border-border-focus"
                                onClick={() => onArchiveNote?.(note.id)}
                              >
                                <Archive className="size-3.5" aria-hidden />
                              </button>
                              <button
                                type="button"
                                tabIndex={open ? 0 : -1}
                                aria-label="Delete note"
                                title="Delete"
                                className="flex size-7 items-center justify-center rounded-sm text-status-error outline-none hover:bg-bg-muted focus-visible:border focus-visible:border-border-focus"
                                onClick={() => onDeleteNote?.(note.id)}
                              >
                                <Trash2 className="size-3.5" aria-hidden />
                              </button>
                            </div>
                          </div>

                          <button
                            type="button"
                            aria-label={
                              open ? "Hide note actions" : "Show note actions"
                            }
                            aria-expanded={open}
                            aria-controls={`note-actions-${note.id}`}
                            className={cn(
                              "flex size-7 shrink-0 items-center justify-center rounded-sm outline-none",
                              "hover:bg-bg-muted focus-visible:border focus-visible:border-border-focus",
                              open
                                ? "bg-bg-muted text-accent-primary"
                                : "text-text-muted",
                            )}
                            onClick={() => toggleActions(note.id)}
                          >
                            <MoreHorizontal className="size-3.5" aria-hidden />
                          </button>
                        </>
                      )}
                    </div>
                  </div>
                </li>
              );
            })
          )}
        </ul>
      </div>
    </Card>
  );
}
