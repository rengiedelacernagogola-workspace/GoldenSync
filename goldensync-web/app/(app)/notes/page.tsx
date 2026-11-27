"use client";

/**
 * Notes hub — cross-subject note-taker (sidebar Notes).
 * FLOW: pick subject → write/save · library lists notes from every subject.
 */

import { useRouter, useSearchParams } from "next/navigation";
import * as React from "react";

import {
  AppShell,
  Button,
  Card,
  Input,
  MobileDrawer,
  Textarea,
  type SidebarActiveId,
} from "@/components/core";
import {
  NotesLibraryCard,
  type PlanNoteItem,
} from "@/components/features/plan/notes-library-card";
import { useLiveData } from "@/hooks/use-live-data";
import { pushActivity } from "@/lib/activity/activity-log";
import { fetchAllPlanNotes } from "@/lib/api/notes";
import { isSemesterPast } from "@/lib/domain/semester-year";
import {
  appendSavedNote,
  archiveSavedNote,
  deleteSavedNote,
  restoreSavedNote,
  updateSavedNote,
} from "@/lib/notes/saved-notes";
import { pathForNav } from "@/lib/nav";
import { cn } from "@/lib/utils";

function NotesBody() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const live = useLiveData();
  const querySubject = searchParams.get("subject");

  const [collapsed, setCollapsed] = React.useState(false);
  const [drawerOpen, setDrawerOpen] = React.useState(false);
  const [activeSubjectId, setActiveSubjectId] = React.useState<string>("");
  const [notes, setNotes] = React.useState("");
  const [noteTitle, setNoteTitle] = React.useState("");
  const [topicName, setTopicName] = React.useState("");
  const [savingNotes, setSavingNotes] = React.useState(false);
  const [notesSaved, setNotesSaved] = React.useState(false);
  const [library, setLibrary] = React.useState<PlanNoteItem[]>([]);
  const [filterSubjectId, setFilterSubjectId] = React.useState<string>("all");
  const [editingNoteId, setEditingNoteId] = React.useState<string | null>(null);

  const subjects = live.subjects;
  const activeSubject =
    subjects.find((s) => s.id === activeSubjectId) ?? subjects[0] ?? null;

  React.useEffect(() => {
    if (!live.ready || subjects.length === 0) return;
    const preferred =
      (querySubject && subjects.some((s) => s.id === querySubject)
        ? querySubject
        : null) ??
      activeSubjectId ??
      subjects[0]!.id;
    if (preferred && preferred !== activeSubjectId) {
      const handle = window.setTimeout(() => setActiveSubjectId(preferred), 0);
      return () => window.clearTimeout(handle);
    }
  }, [live.ready, subjects, querySubject, activeSubjectId]);

  async function reloadLibrary() {
    try {
      const rows = await fetchAllPlanNotes({ includeShelved: true });
      setLibrary(
        rows.map((n) => ({
          id: n.id,
          subjectId: n.subjectId,
          subjectCode: n.courseCode,
          weekNumber: 13,
          title: n.title,
          topic: n.topic,
          body: n.body,
          savedAt: Date.parse(n.savedAt) || Date.now(),
          archived: n.archivedAt != null,
          deleted: n.deletedAt != null,
          archivedAt: n.archivedAt,
          deletedAt: n.deletedAt,
          importance: (n.importance ?? 1) as 1 | 2 | 3,
          pinned: n.pinned,
          readOnly: isSemesterPast(n.semesterEndDate),
        })),
      );
    } catch {
      setLibrary([]);
    }
  }

  React.useEffect(() => {
    if (!live.signedIn) return;
    const handle = window.setTimeout(() => {
      void reloadLibrary();
    }, 0);
    return () => window.clearTimeout(handle);
  }, [live.signedIn, live.subjects.length]);

  const visibleNotes = React.useMemo(() => {
    return library.filter((n) =>
      filterSubjectId === "all" ? true : n.subjectId === filterSubjectId,
    );
  }, [library, filterSubjectId]);

  function clearCanvas() {
    setNotes("");
    setNoteTitle("");
    setTopicName("");
    setEditingNoteId(null);
  }

  function handleNav(id: SidebarActiveId) {
    const path = pathForNav(id, activeSubject?.id);
    if (path) router.push(path);
  }

  async function saveNotes() {
    const body = notes.trim();
    const title = noteTitle.trim();
    const topic = topicName.trim();
    if (!body || !title || savingNotes || !activeSubject) return;

    setSavingNotes(true);
    try {
      if (editingNoteId) {
        await updateSavedNote(activeSubject.id, editingNoteId, {
          title,
          topic,
          body,
        });
      } else {
        await appendSavedNote(activeSubject.id, {
          weekNumber: 13,
          title,
          topic,
          body,
        });
      }
      await reloadLibrary();
      clearCanvas();
      setNotesSaved(true);
      void pushActivity({
        kind: "notes",
        title: editingNoteId ? "Note updated" : "Note saved",
        detail: `${title}${topic ? ` · ${topic}` : ""} (${activeSubject.courseCode})`,
      });
    } finally {
      setSavingNotes(false);
    }
  }

  async function handleEditNote(note: PlanNoteItem) {
    if (!note.subjectId || note.readOnly) return;
    setActiveSubjectId(note.subjectId);
    setEditingNoteId(note.id);
    setNoteTitle(note.title);
    setTopicName(note.topic);
    setNotes(note.body);
    setNotesSaved(false);
  }

  async function handleDeleteNote(note: PlanNoteItem) {
    if (!note.subjectId || note.readOnly) return;
    await deleteSavedNote(note.subjectId, note.id);
    await reloadLibrary();
  }

  async function handleArchiveNote(note: PlanNoteItem) {
    if (!note.subjectId || note.readOnly) return;
    await archiveSavedNote(note.subjectId, note.id);
    await reloadLibrary();
  }

  async function handleRestoreNote(note: PlanNoteItem) {
    if (!note.subjectId || note.readOnly) return;
    await restoreSavedNote(note.subjectId, note.id);
    await reloadLibrary();
  }

  async function handleUpdateMeta(
    note: PlanNoteItem,
    patch: { importance?: 1 | 2 | 3; pinned?: boolean },
  ) {
    if (!note.subjectId || note.readOnly) return;
    await updateSavedNote(note.subjectId, note.id, patch);
    await reloadLibrary();
  }

  const subjectSelected = subjects.length > 0;
  /* Composer is for the active semester’s subjects only. */
  const notesReadOnly = live.isActiveSemesterPast;

  return (
    <>
      <AppShell
        sidebarVariant={collapsed ? "Collapsed" : "Expanded"}
        subjectSelected={subjectSelected}
        activeId="notes"
        activeSubjectId={activeSubject?.id ?? (activeSubjectId || null)}
        subjectCode={activeSubject?.courseCode ?? "—"}
        subjectTitle={activeSubject?.title ?? "Notes"}
        onToggleCollapse={() => setCollapsed((c) => !c)}
        onNav={handleNav}
        topBar={{
          title: "Notes",
          semesterLabel:
            live.semesters.find((s) => s.id === live.activeSemesterId)?.label ??
            "",
          hideAddSubject: true,
          hideSemester: true,
          onMenuClick: () => setDrawerOpen(true),
        }}
      >
        <div className="gs-fade-up flex w-full flex-col gap-space-6">
          <p className="text-overline uppercase text-text-muted">
            All subjects · note-taker
            {live.signedIn ? " · Live" : ""}
            {notesReadOnly ? " · Past (view only)" : ""}
          </p>

          {!subjectSelected ? (
            <p className="text-body-sm text-text-muted">
              Add a subject first, then capture notes for any course here.
            </p>
          ) : (
            <div className="grid w-full items-stretch gap-space-4 lg:grid-cols-2">
              <Card className="h-full w-full">
                {notesReadOnly ? (
                  <p className="text-body-sm text-text-muted">
                    Past semester — notes are view only. Open the library to
                    read existing notes.
                  </p>
                ) : (
                  <>
                    <div className="flex w-full flex-col gap-space-2 border-b border-border-subtle pb-space-3">
                      <label className="flex flex-col gap-space-1">
                        <span className="text-[11px] font-medium tracking-tight text-text-secondary">
                          Subject
                        </span>
                        <select
                          className={cn(
                            "h-9 w-full rounded-md border border-border-default bg-bg-subtle px-space-2",
                            "text-[11px] font-medium tracking-tight text-text-primary outline-none",
                            "focus-visible:border-border-focus",
                          )}
                          value={activeSubject?.id ?? ""}
                          onChange={(e) => {
                            setActiveSubjectId(e.target.value);
                            setNotesSaved(false);
                          }}
                          aria-label="Note subject"
                        >
                          {subjects.map((s) => (
                            <option key={s.id} value={s.id}>
                              {s.courseCode} — {s.title}
                            </option>
                          ))}
                        </select>
                      </label>
                      <Input
                        size="Compact"
                        placeholder="(editable)"
                        value={noteTitle}
                        onChange={(e) => {
                          setNotesSaved(false);
                          setNoteTitle(e.target.value);
                        }}
                        aria-label="Notes title"
                      />
                      <Input
                        size="Compact"
                        placeholder="(editable)"
                        value={topicName}
                        onChange={(e) => {
                          setNotesSaved(false);
                          setTopicName(e.target.value);
                        }}
                        aria-label="Topic name"
                      />
                    </div>
                    <Textarea
                      value={notes}
                      onChange={(e) => {
                        setNotesSaved(false);
                        setNotes(e.target.value);
                      }}
                      placeholder="(editable)"
                      rows={6}
                      aria-label="Note body"
                    />
                    <div className="mt-space-3 flex flex-wrap items-center gap-space-3">
                      <Button
                        variant="Primary"
                        size="md"
                        disabled={
                          savingNotes ||
                          !notes.trim() ||
                          !noteTitle.trim() ||
                          !activeSubject
                        }
                        onClick={() => void saveNotes()}
                      >
                        {savingNotes
                          ? "Saving…"
                          : editingNoteId
                            ? "Update note"
                            : "Save note"}
                      </Button>
                      {notesSaved ? (
                        <span className="text-body-sm text-status-success">
                          Saved — canvas ready for another note.
                        </span>
                      ) : null}
                    </div>
                  </>
                )}
              </Card>

              <NotesLibraryCard
                subjectId={activeSubject?.id ?? "all"}
                notes={visibleNotes}
                subjects={subjects.map((s) => ({
                  id: s.id,
                  courseCode: s.courseCode,
                }))}
                filterSubjectId={filterSubjectId}
                onFilterSubjectChange={setFilterSubjectId}
                className="min-h-0 flex-1"
                onEditNote={(n) => void handleEditNote(n)}
                onDeleteNote={(id) => {
                  const note = library.find((n) => n.id === id);
                  if (note) void handleDeleteNote(note);
                }}
                onArchiveNote={(id) => {
                  const note = library.find((n) => n.id === id);
                  if (note) void handleArchiveNote(note);
                }}
                onRestoreNote={(id) => {
                  const note = library.find((n) => n.id === id);
                  if (note) void handleRestoreNote(note);
                }}
                onUpdateMeta={(id, patch) => {
                  const note = library.find((n) => n.id === id);
                  if (note) void handleUpdateMeta(note, patch);
                }}
              />
            </div>
          )}
        </div>
      </AppShell>

      <MobileDrawer
        open={drawerOpen}
        subjectSelected={subjectSelected}
        activeId="notes"
        activeSubjectId={activeSubject?.id ?? (activeSubjectId || null)}
        subjectCode={activeSubject?.courseCode ?? "—"}
        subjectTitle={activeSubject?.title ?? "Notes"}
        onClose={() => setDrawerOpen(false)}
        onNav={handleNav}
      />
    </>
  );
}

export default function NotesPage() {
  return (
    <React.Suspense
      fallback={
        <div className="flex min-h-screen items-center justify-center bg-bg-base text-text-muted">
          Loading notes…
        </div>
      }
    >
      <NotesBody />
    </React.Suspense>
  );
}
