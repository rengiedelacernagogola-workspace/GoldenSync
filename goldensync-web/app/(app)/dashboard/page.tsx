"use client";

/**
 * Dashboard — subject grid (Figma P2/Dashboard `69:2019`+, UI-070).
 * FLOW: shell → cards → Overview · Add Subject modal · EmptySubjects / Loading.
 * Proto: hasSemester · subjectCount · subjectSelected.
 */

import { useClerk, useUser } from "@clerk/nextjs";
import { BookOpen } from "lucide-react";
import { useRouter, useSearchParams } from "next/navigation";
import * as React from "react";

import { SessionModals } from "@/components/auth/session-modals";
import {
  AppShell,
  Button,
  EmptyState,
  MobileDrawer,
  SemesterPicker,
  Skeleton,
  SubjectCard,
  SubjectSwitcherPopover,
  ToastHost,
  type SidebarActiveId,
  type ToastItem,
} from "@/components/core";
import { AddSubjectModal } from "@/components/features/add-subject/add-subject-modal";
import { SemesterDialog } from "@/components/features/semester/semester-dialog";
import { DeleteSubjectDialog } from "@/components/features/subject/delete-subject-dialog";
import { goldenSyncSeed } from "@/data/seed";
import { useLiveData } from "@/hooks/use-live-data";
import { ApiClientError } from "@/lib/api/client";
import { pushActivity } from "@/lib/activity/activity-log";
import {
  archiveSubject,
  fetchSubjectDetail,
} from "@/lib/api/subjects";
import { pathForNav } from "@/lib/nav";
import {
  useHasSemester,
  useProtoActions,
  useSubjectCount,
  useSubjectSelected,
} from "@/state";

/** Dashboard body — Suspense for useSearchParams. */
function DashboardBody() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const live = useLiveData();
  const hasSemester = useHasSemester();
  const subjectCount = useSubjectCount();
  const subjectSelected = useSubjectSelected();
  const { setSessionActive } = useProtoActions();
  const { isSignedIn } = useUser();
  const { signOut } = useClerk();

  const [collapsed, setCollapsed] = React.useState(false);
  const [drawerOpen, setDrawerOpen] = React.useState(false);
  const [switcherOpen, setSwitcherOpen] = React.useState(false);
  const [addOpen, setAddOpen] = React.useState(false);
  const [semesterOpen, setSemesterOpen] = React.useState(false);
  const [activeNav, setActiveNav] = React.useState<SidebarActiveId>("home");
  const [toasts, setToasts] = React.useState<ToastItem[]>([]);
  const [deleteOpen, setDeleteOpen] = React.useState(false);
  const [selectedLiveId, setSelectedLiveId] = React.useState<string | null>(
    null,
  );
  const [activityTick, setActivityTick] = React.useState(0);
  const [progressById, setProgressById] = React.useState<
    Record<string, { weeksDone: number; weeksTotal: number }>
  >({});

  function logActivity(
    entry: Parameters<typeof pushActivity>[0],
  ) {
    void pushActivity(entry).then(() => setActivityTick((n) => n + 1));
  }

  const useLiveSubjects = live.signedIn && live.semesters.length > 0;

  React.useEffect(() => {
    if (!useLiveSubjects || live.subjects.length === 0) {
      const handle = window.setTimeout(() => setProgressById({}), 0);
      return () => window.clearTimeout(handle);
    }
    let cancelled = false;
    const handle = window.setTimeout(() => {
      void (async () => {
        const entries = await Promise.all(
          live.subjects.map(async (s) => {
            try {
              const detail = await fetchSubjectDetail(s.id);
              const weeksTotal = Math.max(
                18,
                detail.planWeeks.length || 18,
                detail.checklist.length || 0,
              );
              const weeksDone = detail.checklist.filter((c) => c.done).length;
              return [s.id, { weeksDone, weeksTotal }] as const;
            } catch {
              return [s.id, { weeksDone: 0, weeksTotal: 18 }] as const;
            }
          }),
        );
        if (!cancelled) {
          setProgressById(Object.fromEntries(entries));
        }
      })();
    }, 0);
    return () => {
      cancelled = true;
      window.clearTimeout(handle);
    };
  }, [useLiveSubjects, live.subjects]);

  const gridSubjects = useLiveSubjects
    ? live.subjects.map((s, i) => {
        const progress = progressById[s.id];
        return {
          id: s.id,
          code: s.courseCode,
          title: s.title,
          units: Number(s.units) || 0,
          weeksDone: progress?.weeksDone ?? 0,
          weeksTotal: progress?.weeksTotal ?? 18,
          isActive:
            selectedLiveId != null
              ? s.id === selectedLiveId
              : i === 0,
        };
      })
    : goldenSyncSeed.subjects;
  const active =
    gridSubjects.find((s) => s.isActive) ?? gridSubjects[0] ?? undefined;
  const semester =
    live.semesters[0]?.label ?? goldenSyncSeed.semester.label;
  const emptySubjects = subjectCount === 0;
  const hideAddInBar = emptySubjects;
  /* Loading skeleton via ?loading=1 — avoid setState-in-effect */
  const loading = searchParams.get("loading") === "1";

  function openAdd() {
    setAddOpen(true);
  }

  function pushToast(message: string) {
    const id = `t-${Date.now()}`;
    setToasts((prev) => [...prev, { id, message, variant: "Success" }]);
    window.setTimeout(
      () => setToasts((prev) => prev.filter((t) => t.id !== id)),
      4000,
    );
  }

  function handleNav(id: SidebarActiveId) {
    setActiveNav(id);
    if (id === "add-subject") {
      openAdd();
      return;
    }
    if (id === "logout") {
      setSessionActive(false);
      if (isSignedIn) {
        void signOut({ redirectUrl: "/sign-in" });
        return;
      }
      router.push("/sign-in");
      return;
    }
    if (id === "archive-subject" && active) {
      if (isSignedIn && useLiveSubjects) {
        void archiveSubject(active.id)
          .then(() => {
            live.refresh();
            pushToast("Subject archived.");
            logActivity({
              kind: "subject",
              title: "Subject archived",
              detail: `${active.code} · ${active.title}`,
            });
          })
          .catch((err: unknown) => {
            pushToast(
              err instanceof ApiClientError
                ? err.message
                : "Could not archive subject.",
            );
          });
        return;
      }
      pushToast("Subject archived.");
      logActivity({
        kind: "subject",
        title: "Subject archived",
        detail: `${active.code} · ${active.title}`,
      });
      return;
    }
    if (id === "delete-subject" && active) {
      setDeleteOpen(true);
      return;
    }
    const subjectId =
      active?.id ??
      selectedLiveId ??
      (useLiveSubjects ? live.subjects[0]?.id : undefined);
    const path = pathForNav(id, subjectId);
    if (path) router.push(path);
  }

  return (
    <>
      <AppShell
        sidebarVariant={collapsed ? "Collapsed" : "Expanded"}
        subjectSelected={subjectSelected && !emptySubjects}
        activeId={activeNav}
        subjectCode={emptySubjects ? "No subject" : active?.code}
        subjectTitle={
          emptySubjects ? "Add your first subject." : active?.title
        }
        switcherOpen={switcherOpen}
        onToggleCollapse={() => setCollapsed((c) => !c)}
        onNav={handleNav}
        onSwitcherClick={() => setSwitcherOpen((o) => !o)}
        topBar={{
          title: "Dashboard",
          semesterLabel: hasSemester ? semester : "No semester",
          hideAddSubject: hideAddInBar || !hasSemester,
          notificationsRefreshKey: activityTick,
          onMenuClick: () => setDrawerOpen(true),
          onAddSubject: openAdd,
          onSemesterClick: () => setSemesterOpen(true),
        }}
        className="relative"
      >
        {switcherOpen ? (
          <div className="absolute top-[120px] left-4 z-30 hidden md:block">
            <SubjectSwitcherPopover
              empty={emptySubjects}
              items={gridSubjects.map((s) => ({
                id: s.id,
                code: s.code,
                title: s.title,
              }))}
              activeId={active?.id}
              onSubjectSelect={(id) => {
                setSelectedLiveId(id);
                setSwitcherOpen(false);
              }}
            />
          </div>
        ) : null}

        {/* T/M: semester + Add move into body (DEC-059 / UI-121) */}
        <div className="mb-space-6 flex w-full flex-col gap-space-3 sm:hidden">
          {hasSemester ? (
            <SemesterPicker
              label={semester}
              open={semesterOpen}
              onClick={() => setSemesterOpen(true)}
              className="w-full justify-between"
            />
          ) : null}
          {!hideAddInBar && hasSemester ? (
            <Button
              variant="Primary"
              size="md"
              className="w-full"
              onClick={openAdd}
            >
              + Add Subject
            </Button>
          ) : null}
        </div>

        {/* Subject cards navigate to Overview */}
        {!hasSemester ? (
          <EmptyState
            icon={<BookOpen />}
            title="No semester yet"
            body="Create a semester to start adding subjects."
            actionLabel="New semester"
            onAction={() => setSemesterOpen(true)}
          />
        ) : loading ? (
          <div className="grid w-full grid-cols-1 gap-space-6 md:grid-cols-2 xl:grid-cols-3">
            <Skeleton type="SubjectCard" />
            <Skeleton type="SubjectCard" />
            <Skeleton type="SubjectCard" />
          </div>
        ) : emptySubjects ? (
          <EmptyState
            icon={<BookOpen />}
            title="No subjects yet"
            body="Sync a syllabus PDF or enter it manually."
            actionLabel="Add Subject"
            onAction={openAdd}
          />
        ) : (
          <div
            data-slot="gs-subject-grid"
            className="gs-fade-up grid w-full grid-cols-1 gap-space-6 md:grid-cols-2 xl:grid-cols-3"
          >
            {gridSubjects.map((s, i) => (
              <SubjectCard
                key={s.id}
                code={s.code}
                title={s.title}
                semester={semester}
                units={s.units}
                weeksDone={s.weeksDone}
                weeksTotal={s.weeksTotal}
                active={s.isActive}
                className={
                  i === 0
                    ? "gs-stagger-1"
                    : i === 1
                      ? "gs-stagger-2"
                      : "gs-stagger-3"
                }
                onClick={() => {
                  setSelectedLiveId(s.id);
                  router.push(`/subjects/${s.id}/overview`);
                }}
              />
            ))}
          </div>
        )}
      </AppShell>

      <MobileDrawer
        open={drawerOpen}
        subjectSelected={subjectSelected && !emptySubjects}
        activeId={activeNav}
        subjectCode={emptySubjects ? "No subject" : active?.code}
        subjectTitle={
          emptySubjects ? "Add your first subject." : active?.title
        }
        switcherOpen={switcherOpen}
        onClose={() => setDrawerOpen(false)}
        onNav={handleNav}
        onSwitcherClick={() => setSwitcherOpen((o) => !o)}
      />

      <AddSubjectModal
        open={addOpen}
        semesterId={live.activeSemesterId}
        onClose={() => setAddOpen(false)}
        onCreated={(subjectId) => {
          live.refresh();
          if (subjectId) setSelectedLiveId(subjectId);
          const id = `t-${Date.now()}`;
          setToasts((prev) => [
            ...prev,
            {
              id,
              message: "Subject created. Open its Overview.",
              variant: "Success",
            },
          ]);
          window.setTimeout(
            () => setToasts((prev) => prev.filter((t) => t.id !== id)),
            4000,
          );
          logActivity({
            kind: "subject",
            title: "Subject added",
            detail: "A new subject was created from Add Subject.",
          });
        }}
      />

      <SemesterDialog
        open={semesterOpen}
        onClose={() => setSemesterOpen(false)}
        onCreated={() => {
          live.refresh();
          logActivity({
            kind: "semester",
            title: "Semester created",
            detail: "A new semester is ready for subjects.",
          });
        }}
      />

      <DeleteSubjectDialog
        open={deleteOpen}
        subjectCode={active?.code}
        subjectId={useLiveSubjects ? active?.id : null}
        onClose={() => setDeleteOpen(false)}
        onDeleted={() => {
          live.refresh();
          pushToast("Subject deleted.");
          logActivity({
            kind: "subject",
            title: "Subject deleted",
            detail: active
              ? `${active.code} · ${active.title}`
              : "A subject was removed.",
          });
        }}
      />

      <ToastHost
        toasts={toasts}
        onDismiss={(id) =>
          setToasts((prev) => prev.filter((t) => t.id !== id))
        }
      />

      <SessionModals />
    </>
  );
}

/** Dashboard — Default / Loading / EmptySubjects / NoSemester. */
export default function DashboardPage() {
  return (
    <React.Suspense
      fallback={
        <div className="flex min-h-screen items-center justify-center bg-bg-base text-text-muted">
          Loading…
        </div>
      }
    >
      <DashboardBody />
    </React.Suspense>
  );
}
