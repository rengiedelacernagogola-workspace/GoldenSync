"use client";

/**
 * WHAT: My Schedule page — weekly timetable CRUD for the signed-in user.
 * HOW: Load /api/schedule; Add/Edit modal; delete confirm; soft nav like Notes.
 * SCREEN: /my-schedule · sidebar “My Schedule”. RISK: Medium — user data.
 */

import { useUser } from "@clerk/nextjs";
import { useRouter } from "next/navigation";
import * as React from "react";
import { Suspense } from "react";

import {
  AppShell,
  MobileDrawer,
  ToastHost,
  type SidebarActiveId,
  type ToastItem,
} from "@/components/core";
import { DeleteScheduleClassDialog } from "@/components/features/schedule/delete-schedule-class-dialog";
import {
  ScheduleClassFormModal,
  type ScheduleFormValues,
} from "@/components/features/schedule/schedule-class-form-modal";
import { SchedulePanel } from "@/components/features/schedule/schedule-panel";
import { useLiveData } from "@/hooks/use-live-data";
import { ApiClientError } from "@/lib/api/client";
import {
  createScheduleClass,
  deleteScheduleClass,
  fetchScheduleClasses,
  updateScheduleClass,
  type ScheduleClassDto,
} from "@/lib/api/schedule";
import { performSoftLogout } from "@/lib/auth/soft-lock";
import { pathForNav } from "@/lib/nav";
import { useProtoActions } from "@/state";

function MyScheduleBody() {
  const router = useRouter();
  const live = useLiveData();
  const { isSignedIn } = useUser();
  const { setSessionActive } = useProtoActions();

  const [collapsed, setCollapsed] = React.useState(false);
  const [drawerOpen, setDrawerOpen] = React.useState(false);
  const [classes, setClasses] = React.useState<ScheduleClassDto[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [loadError, setLoadError] = React.useState<string | null>(null);
  const [formOpen, setFormOpen] = React.useState(false);
  const [formMode, setFormMode] = React.useState<"add" | "edit">("add");
  const [editing, setEditing] = React.useState<ScheduleClassDto | null>(null);
  const [saving, setSaving] = React.useState(false);
  const [formError, setFormError] = React.useState<string | null>(null);
  const [deleteTarget, setDeleteTarget] =
    React.useState<ScheduleClassDto | null>(null);
  const [deleting, setDeleting] = React.useState(false);
  const [deleteError, setDeleteError] = React.useState<string | null>(null);
  const [toasts, setToasts] = React.useState<ToastItem[]>([]);

  const active = live.subjects[0]
    ? {
        id: live.subjects[0].id,
        code: live.subjects[0].courseCode,
        title: live.subjects[0].title,
      }
    : undefined;

  function pushToast(
    message: string,
    variant: ToastItem["variant"] = "Success",
  ) {
    const id = `toast-${Date.now()}`;
    setToasts((prev) => [...prev, { id, message, variant }]);
    window.setTimeout(
      () => setToasts((prev) => prev.filter((t) => t.id !== id)),
      4000,
    );
  }

  async function reload() {
    if (!isSignedIn) {
      setClasses([]);
      setLoadError(null);
      setLoading(false);
      return;
    }
    setLoading(true);
    try {
      const rows = await fetchScheduleClasses();
      setClasses(rows);
      setLoadError(null);
    } catch {
      // Keep current rows so a failed refresh does not wipe a successful write.
      setLoadError("Could not load schedule.");
      pushToast("Could not load schedule.", "Error");
    } finally {
      setLoading(false);
    }
  }

  React.useEffect(() => {
    if (!live.ready) return;
    const handle = window.setTimeout(() => {
      void reload();
    }, 0);
    return () => window.clearTimeout(handle);
    // eslint-disable-next-line react-hooks/exhaustive-deps -- reload on sign-in / live ready only
  }, [live.ready, isSignedIn]);

  function handleNav(id: SidebarActiveId) {
    if (id === "logout") {
      setSessionActive(false);
      performSoftLogout((url) => router.push(url));
      return;
    }
    // Archive / Delete need Overview confirmation flows — not wired on this page.
    if (id === "archive-subject" || id === "delete-subject") {
      if (active?.id) {
        router.push(`/subjects/${active.id}/overview`);
        pushToast("Open Overview to archive or delete a subject.", "Info");
      }
      return;
    }
    const path = pathForNav(id, active?.id);
    if (path) router.push(path);
  }

  function openAdd() {
    setFormMode("add");
    setEditing(null);
    setFormError(null);
    setFormOpen(true);
  }

  function openEdit(row: ScheduleClassDto) {
    setFormMode("edit");
    setEditing(row);
    setFormError(null);
    setFormOpen(true);
  }

  async function handleSave(values: ScheduleFormValues) {
    setSaving(true);
    setFormError(null);
    try {
      if (formMode === "edit" && editing) {
        const updated = await updateScheduleClass(editing.id, values);
        setClasses((prev) =>
          prev.map((row) => (row.id === updated.id ? updated : row)),
        );
        pushToast("Class updated.");
      } else {
        const created = await createScheduleClass(values);
        setClasses((prev) => [...prev, created]);
        pushToast("Class added.");
      }
      setFormOpen(false);
      void reload();
    } catch (err) {
      setFormError(
        err instanceof ApiClientError
          ? err.message
          : "Could not save class.",
      );
    } finally {
      setSaving(false);
    }
  }

  async function handleDeleteConfirm() {
    if (!deleteTarget) return;
    setDeleting(true);
    setDeleteError(null);
    try {
      const removedId = deleteTarget.id;
      await deleteScheduleClass(removedId);
      setClasses((prev) => prev.filter((row) => row.id !== removedId));
      pushToast("Class deleted.");
      setDeleteTarget(null);
      void reload();
    } catch (err) {
      setDeleteError(
        err instanceof ApiClientError
          ? err.message
          : "Could not delete class.",
      );
    } finally {
      setDeleting(false);
    }
  }

  return (
    <>
      <AppShell
        sidebarVariant={collapsed ? "Collapsed" : "Expanded"}
        subjectSelected={live.subjects.length > 0}
        activeId="my-schedule"
        subjectCode={active?.code ?? "—"}
        subjectTitle={active?.title ?? "My Schedule"}
        activeSubjectId={active?.id ?? null}
        onToggleCollapse={() => setCollapsed((c) => !c)}
        onNav={handleNav}
        topBar={{
          title: "My Schedule",
          hideAddSubject: true,
          hideSemester: true,
          onMenuClick: () => setDrawerOpen(true),
        }}
      >
        {/* WHAT: Full main-column width (shell already pads); no max-w so desktop uses the whole screen. */}
        <div className="gs-fade-up flex min-h-0 w-full min-w-0 flex-1 flex-col">
          {!isSignedIn ? (
            <p className="text-body-sm text-text-secondary">
              Sign in to manage your schedule.
            </p>
          ) : (
            <SchedulePanel
              classes={classes}
              loading={loading}
              loadError={loadError}
              onRetry={() => void reload()}
              onAdd={openAdd}
              onEdit={openEdit}
              onDelete={(row) => {
                setDeleteError(null);
                setDeleteTarget(row);
              }}
            />
          )}
        </div>
      </AppShell>

      <MobileDrawer
        open={drawerOpen}
        subjectSelected={live.subjects.length > 0}
        activeId="my-schedule"
        activeSubjectId={active?.id}
        subjectCode={active?.code}
        subjectTitle={active?.title}
        onClose={() => setDrawerOpen(false)}
        onNav={handleNav}
      />

      <ScheduleClassFormModal
        open={formOpen}
        mode={formMode}
        initial={editing}
        subjects={live.subjects.map((s) => ({
          id: s.id,
          courseCode: s.courseCode,
          title: s.title,
        }))}
        existing={classes}
        saving={saving}
        error={formError}
        onClose={() => {
          if (!saving) setFormOpen(false);
        }}
        onSave={handleSave}
      />

      <DeleteScheduleClassDialog
        open={deleteTarget != null}
        courseCode={deleteTarget?.courseCode}
        courseTitle={deleteTarget?.courseTitle}
        saving={deleting}
        error={deleteError}
        onClose={() => {
          if (!deleting) setDeleteTarget(null);
        }}
        onConfirm={handleDeleteConfirm}
      />

      <ToastHost
        toasts={toasts}
        onDismiss={(id) =>
          setToasts((prev) => prev.filter((t) => t.id !== id))
        }
      />
    </>
  );
}

export default function MySchedulePage() {
  return (
    <Suspense
      fallback={
        <p className="p-space-6 text-body-sm text-text-muted">
          Loading schedule…
        </p>
      }
    >
      <MyScheduleBody />
    </Suspense>
  );
}
