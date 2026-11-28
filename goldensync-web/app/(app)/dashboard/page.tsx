"use client";

// WHAT: Main home screen — grid of subject cards after sign-in.
// SCREEN: Route /dashboard inside the app shell (sidebar + top bar).
// HOW: Client component — uses React hooks and browser APIs.

/**
 * Dashboard — subject grid (Figma P2/Dashboard `69:2019`+, UI-070).
 * FLOW: shell → cards → Overview · Add Subject modal · EmptySubjects / Loading.
 * Proto: hasSemester · subjectCount · subjectSelected.
 */

import { useUser } from "@clerk/nextjs";
import { BookOpen } from "lucide-react";
import { useRouter, useSearchParams } from "next/navigation";
import * as React from "react";

import { SessionModals } from "@/components/auth/session-modals";
import {
  AppShell,
  Banner,
  Button,
  EmptyState,
  MobileDrawer,
  Skeleton,
  SubjectCard,
  ToastHost,
  type SidebarActiveId,
  type ToastItem,
} from "@/components/core";
import { AddSubjectModal } from "@/components/features/add-subject/add-subject-modal";
import { openSemesterCreateDialog } from "@/components/features/semester/semester-switcher";
import {
  SubjectCardEditModal,
  cardEditValuesFromDetail,
} from "@/components/features/subject/subject-card-edit-modal";
import { DeleteSubjectDialog } from "@/components/features/subject/delete-subject-dialog";
import { goldenSyncSeed } from "@/data/seed";
import { getActiveSemester, useLiveData } from "@/hooks/use-live-data";
import {
  formatSemesterDisplayLabel,
} from "@/lib/domain/semester-year";
import { ApiClientError } from "@/lib/api/client";
import { pushActivity } from "@/lib/activity/activity-log";
import {
  archiveSubject,
  fetchSubjectDetail,
  type SubjectDetailDto,
} from "@/lib/api/subjects";
import { estimateSubjectGrade } from "@/lib/domain/estimated-subject-grade";
import {
  formatInstructorName,
  latestOngoingTask,
  parseFaculty,
  remainingContactHours,
} from "@/lib/domain/faculty";
import { performSoftLogout } from "@/lib/auth/soft-lock";
import { pathForNav } from "@/lib/nav";
import {
  useHasSemester,
  useProtoActions,
  useSubjectCount,
  useSubjectSelected,
} from "@/state";

/** Dashboard body — Suspense for useSearchParams. */
// WHAT: Holds all dashboard logic and UI (not the loading wrapper).
// HOW: Wrapped in Suspense because useSearchParams needs it in Next.js.
function DashboardBody() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const live = useLiveData();
  const hasSemester = useHasSemester();
  const subjectCount = useSubjectCount();
  const subjectSelected = useSubjectSelected();
  const { setSessionActive } = useProtoActions();
  const { isSignedIn } = useUser();

  // WHAT: Local UI state — drawers, modals, toasts, which subject is selected.
  // EDIT: Add new modals here with useState; wire onClose in JSX below.
  const [collapsed, setCollapsed] = React.useState(false);
  const [drawerOpen, setDrawerOpen] = React.useState(false);
  const [addOpen, setAddOpen] = React.useState(false);
  const [activeNav, setActiveNav] = React.useState<SidebarActiveId>("home");
  const [toasts, setToasts] = React.useState<ToastItem[]>([]);
  const [deleteSubjectId, setDeleteSubjectId] = React.useState<string | null>(
    null,
  );
  const [selectedLiveId, setSelectedLiveId] = React.useState<string | null>(
    null,
  );
  const [activityTick, setActivityTick] = React.useState(0);
  const [detailById, setDetailById] = React.useState<
    Record<string, SubjectDetailDto>
  >({});
  const [editSubjectId, setEditSubjectId] = React.useState<string | null>(null);
  /** Hide deleted cards immediately (seed grid + live refresh lag). */
  const [removedSubjectIds, setRemovedSubjectIds] = React.useState<string[]>(
    [],
  );
  /** Bump when calculator scores may have changed (focus / storage). */
  const [scoresTick, setScoresTick] = React.useState(0);

  React.useEffect(() => {
    function bumpScores() {
      setScoresTick((n) => n + 1);
    }
    window.addEventListener("focus", bumpScores);
    window.addEventListener("storage", bumpScores);
    window.addEventListener("gs-calculator-scores", bumpScores);
    return () => {
      window.removeEventListener("focus", bumpScores);
      window.removeEventListener("storage", bumpScores);
      window.removeEventListener("gs-calculator-scores", bumpScores);
    };
  }, []);

  function logActivity(
    entry: Parameters<typeof pushActivity>[0],
  ) {
    void pushActivity(entry).then(() => setActivityTick((n) => n + 1));
  }

  /** Real API subjects only — never fall back to seed while signed in. */
  // WHAT: Chooses live API data vs demo seed for the subject grid.
  // HOW: Signed in + at least one semester → fetch real subjects.
  // RISK: Medium — wrong branch shows demo data to signed-in users.
  const useLiveSubjects = live.signedIn && live.semesters.length > 0;
  const activeSemester = getActiveSemester(live);
  const showLiveShell = live.signedIn;
  const semesterReady = showLiveShell
    ? live.semesters.length > 0
    : hasSemester;
  const pastSemester = showLiveShell && live.isActiveSemesterPast;

  React.useEffect(() => {
    if (!useLiveSubjects) return;
    const liveIds = new Set(live.subjects.map((s) => s.id));
    setRemovedSubjectIds((prev) => prev.filter((id) => liveIds.has(id)));
  }, [useLiveSubjects, live.subjects]);

  function formatDateLabel(iso: string | null | undefined): string {
    if (!iso) return "—";
    const d = new Date(iso);
    if (Number.isNaN(d.getTime())) return "—";
    return d.toLocaleDateString("en-PH", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  }

  React.useEffect(() => {
    if (!useLiveSubjects || live.subjects.length === 0) {
      const handle = window.setTimeout(() => setDetailById({}), 0);
      return () => window.clearTimeout(handle);
    }
    let cancelled = false;
    const handle = window.setTimeout(() => {
      void (async () => {
        const entries = await Promise.all(
          live.subjects.map(async (s) => {
            try {
              const detail = await fetchSubjectDetail(s.id);
              return [s.id, detail] as const;
            } catch {
              return null;
            }
          }),
        );
        if (!cancelled) {
          const next: Record<string, SubjectDetailDto> = {};
          for (const entry of entries) {
            if (entry) next[entry[0]] = entry[1];
          }
          setDetailById(next);
        }
      })();
    }, 0);
    return () => {
      cancelled = true;
      window.clearTimeout(handle);
    };
  }, [useLiveSubjects, live.subjects]);

  const removedSet = React.useMemo(
    () => new Set(removedSubjectIds),
    [removedSubjectIds],
  );

  // WHAT: Normalized list for SubjectCard — one object per tile on the grid.
  // HOW: Maps API or seed rows and enriches with checklist, faculty, grade estimate.
  const gridSubjects = showLiveShell
    ? live.subjects
        .filter((s) => !removedSet.has(s.id))
        .map((s, i) => {
          const detail = detailById[s.id];
          const faculty = parseFaculty(detail?.faculty ?? s.faculty);
          /** Progress follows Learning Plan week numbers (not a fixed 18). */
          const planWeekNumbers = [
            ...new Set(
              (detail?.planWeeks ?? []).map((w) => w.weekNumber),
            ),
          ];
          const weeksTotal = planWeekNumbers.length;
          const doneWeekNumbers = new Set(
            (detail?.checklist ?? [])
              .filter((c) => c.done)
              .map((c) => c.weekNumber),
          );
          const weeksDone = planWeekNumbers.filter((n) =>
            doneWeekNumbers.has(n),
          ).length;
          const coCount =
            detail?.outcomes.filter((o) => o.kind === "CO").length ?? 0;
          const start =
            detail?.semesterStartDate ?? activeSemester?.startDate ?? null;
          const end =
            detail?.semesterEndDate ?? activeSemester?.endDate ?? null;
          return {
            id: s.id,
            code: s.courseCode,
            title: detail?.title ?? s.title,
            units: Number(detail?.units ?? s.units) || 0,
            prerequisite: detail?.prerequisite ?? s.prerequisite ?? "",
            effectivity: detail?.effectivity ?? s.effectivity ?? "",
            weeksDone,
            weeksTotal,
            latestTask: detail
              ? latestOngoingTask({
                  checklist: detail.checklist,
                  planWeeks: detail.planWeeks,
                })
              : "—",
            instructorLabel: formatInstructorName(faculty),
            college: faculty.college,
            consultation: faculty.consultation,
            courseOutcomeCount: coCount,
            contactHoursTotal: faculty.estimatedContactHours,
            contactHoursRemaining: remainingContactHours(
              faculty.estimatedContactHours,
              start,
              end,
            ),
            semesterStartLabel: formatDateLabel(start),
            semesterEndLabel: formatDateLabel(end),
            facultyRaw: detail?.faculty ?? s.faculty,
            estimatedGrade: estimateSubjectGrade(
              s.id,
              detail?.grading ?? s.grading ?? null,
            ),
            isActive:
              selectedLiveId != null ? s.id === selectedLiveId : i === 0,
          };
        })
    : goldenSyncSeed.subjects
        .filter((s) => !removedSet.has(s.id))
        .map((s, i) => ({
          id: s.id,
          code: s.code,
          title: s.title,
          units: s.units,
          prerequisite: goldenSyncSeed.activeSubject.prerequisite,
          effectivity: goldenSyncSeed.activeSubject.effectivity,
          weeksDone: s.weeksDone,
          weeksTotal: s.weeksTotal,
          latestTask: "Week 13 · Secure session handling",
          instructorLabel: goldenSyncSeed.activeSubject.facultyBlurb,
          college: "",
          consultation: "",
          courseOutcomeCount: goldenSyncSeed.activeSubject.outcomes.length,
          contactHoursTotal: 54,
          contactHoursRemaining: remainingContactHours(
            54,
            goldenSyncSeed.semester.startIso,
            goldenSyncSeed.semester.endIso,
          ),
          semesterStartLabel: formatDateLabel(goldenSyncSeed.semester.startIso),
          semesterEndLabel: formatDateLabel(goldenSyncSeed.semester.endIso),
          facultyRaw: {
            title: "" as const,
            name: goldenSyncSeed.activeSubject.facultyBlurb,
            college: "",
            consultation: "",
            estimatedContactHours: 54,
          },
          estimatedGrade: estimateSubjectGrade(s.id, null, {
            allowDefaultTemplate: true,
          }),
          isActive:
            selectedLiveId != null ? s.id === selectedLiveId : i === 0,
        }));
  // CHECK: scoresTick read here so grade estimates refresh after storage/focus events.
  void scoresTick;
  const active =
    gridSubjects.find((s) => s.isActive) ?? gridSubjects[0] ?? undefined;
  const semester = activeSemester
    ? formatSemesterDisplayLabel(
        activeSemester.label,
        activeSemester.yearLevel,
      )
    : goldenSyncSeed.semester.label;
  const editingCard = editSubjectId
    ? gridSubjects.find((s) => s.id === editSubjectId)
    : null;
  const deletingCard = deleteSubjectId
    ? gridSubjects.find((s) => s.id === deleteSubjectId)
    : null;
  const emptySubjects = showLiveShell
    ? live.ready && semesterReady && gridSubjects.length === 0
    : subjectCount === 0 || gridSubjects.length === 0;
  const hideAddInBar = emptySubjects || pastSemester;
  /* Loading skeleton via ?loading=1 — avoid setState-in-effect */
  const loading =
    searchParams.get("loading") === "1" || (showLiveShell && !live.ready);

  function pushToast(message: string) {
    const id = `t-${Date.now()}`;
    setToasts((prev) => [...prev, { id, message, variant: "Success" }]);
    window.setTimeout(
      () => setToasts((prev) => prev.filter((t) => t.id !== id)),
      4000,
    );
  }

  function openAdd() {
    if (pastSemester) {
      pushToast(
        "Past semesters are view-only. Archive or delete subjects instead.",
      );
      return;
    }
    setAddOpen(true);
  }

  // WHAT: Sidebar / drawer navigation and special actions (add, archive, delete, logout).
  // HOW: Some ids open modals; others call router.push via pathForNav.
  function handleNav(id: SidebarActiveId) {
    setActiveNav(id);
    if (id === "add-subject") {
      openAdd();
      return;
    }
    if (id === "logout") {
      // WHAT: Soft lock — keep Clerk session for 10 min; resume without password.
      setSessionActive(false);
      performSoftLogout((url) => router.push(url));
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
      setDeleteSubjectId(active.id);
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
        activeSubjectId={active?.id ?? selectedLiveId}
        subjectCode={emptySubjects ? "No subject" : active?.code}
        subjectTitle={
          emptySubjects ? "Add your first subject." : active?.title
        }
        switcherEnabled={!emptySubjects}
        onToggleCollapse={() => setCollapsed((c) => !c)}
        onNav={handleNav}
        topBar={{
          title: "Dashboard",
          hideAddSubject: hideAddInBar || !semesterReady,
          notificationsRefreshKey: activityTick,
          onMenuClick: () => setDrawerOpen(true),
          onAddSubject: openAdd,
        }}
        className="relative"
      >
        {/* T/M: Add moves into body (DEC-059 / UI-121) */}
        <div className="mb-space-6 flex w-full flex-col gap-space-3 sm:hidden">
          {!hideAddInBar && semesterReady ? (
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
        {pastSemester && semesterReady ? (
          <Banner
            variant="Info"
            message="Past semester — view only. You can archive (hide) or delete subjects."
            hasAction={false}
            className="mb-space-4 w-full"
          />
        ) : null}

        {live.error && showLiveShell ? (
          <EmptyState
            icon={<BookOpen />}
            title="Couldn’t load your subjects"
            body={live.error}
            actionLabel="Retry"
            onAction={() => live.refresh()}
          />
        ) : !semesterReady ? (
          <EmptyState
            icon={<BookOpen />}
            title="No semester yet"
            body="Create a semester to start adding subjects."
            actionLabel="New semester"
            onAction={() => openSemesterCreateDialog()}
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
            body={
              pastSemester
                ? "This past semester has no active subjects. Archive history is under Account."
                : "Sync a syllabus PDF or enter it manually."
            }
            hasAction={!pastSemester}
            actionLabel="Add Subject"
            onAction={openAdd}
          />
        ) : (
          <div
            data-slot="gs-subject-grid"
            className="gs-fade-up grid w-full min-w-0 grid-cols-1 gap-space-4 sm:gap-space-6 md:grid-cols-2 xl:grid-cols-3"
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
                prerequisite={s.prerequisite}
                semesterStartLabel={s.semesterStartLabel}
                semesterEndLabel={s.semesterEndLabel}
                latestTask={s.latestTask}
                instructorLabel={s.instructorLabel}
                college={s.college}
                consultation={s.consultation}
                courseOutcomeCount={s.courseOutcomeCount}
                contactHoursTotal={s.contactHoursTotal}
                contactHoursRemaining={s.contactHoursRemaining}
                estimatedGradePercent={s.estimatedGrade?.percent ?? null}
                estimatedGradeLabel={s.estimatedGrade?.percentLabel ?? null}
                estimatedGradeScale={s.estimatedGrade?.scaleLabel ?? null}
                estimatedGradeHasScores={
                  s.estimatedGrade?.hasScores ?? false
                }
                onEdit={
                  showLiveShell
                    ? () => {
                        setSelectedLiveId(s.id);
                        setEditSubjectId(s.id);
                      }
                    : undefined
                }
                onDelete={
                  showLiveShell
                    ? () => {
                        setSelectedLiveId(s.id);
                        setDeleteSubjectId(s.id);
                      }
                    : undefined
                }
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

      {editingCard && showLiveShell ? (
        <SubjectCardEditModal
          open={editSubjectId != null}
          subjectId={editingCard.id}
          courseCode={editingCard.code}
          initial={cardEditValuesFromDetail({
            title: editingCard.title,
            units: editingCard.units,
            prerequisite: editingCard.prerequisite,
            effectivity: editingCard.effectivity,
            faculty: editingCard.facultyRaw,
          })}
          onClose={() => setEditSubjectId(null)}
          onSaved={() => {
            live.refresh();
            pushToast("Subject card updated.");
            logActivity({
              kind: "subject",
              title: "Subject updated",
              detail: `${editingCard.code} · card details saved`,
            });
          }}
        />
      ) : null}

      <MobileDrawer
        open={drawerOpen}
        subjectSelected={subjectSelected && !emptySubjects}
        activeId={activeNav}
        activeSubjectId={active?.id ?? selectedLiveId}
        subjectCode={emptySubjects ? "No subject" : active?.code}
        subjectTitle={
          emptySubjects ? "Add your first subject." : active?.title
        }
        switcherEnabled={!emptySubjects}
        onClose={() => setDrawerOpen(false)}
        onNav={handleNav}
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

      <DeleteSubjectDialog
        open={deleteSubjectId != null}
        subjectCode={deletingCard?.code ?? active?.code}
        subjectId={
          showLiveShell
            ? (deletingCard?.id ?? deleteSubjectId ?? active?.id ?? null)
            : null
        }
        onClose={() => setDeleteSubjectId(null)}
        onDeleted={() => {
          const removedId = deleteSubjectId;
          const code = deletingCard?.code ?? active?.code;
          const title = deletingCard?.title ?? active?.title;
          if (removedId) {
            setRemovedSubjectIds((prev) =>
              prev.includes(removedId) ? prev : [...prev, removedId],
            );
            if (selectedLiveId === removedId) setSelectedLiveId(null);
            if (editSubjectId === removedId) setEditSubjectId(null);
          }
          live.refresh();
          pushToast("Subject deleted.");
          logActivity({
            kind: "subject",
            title: "Subject deleted",
            detail: code
              ? `${code} · ${title ?? ""}`.trim()
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
// WHAT: Page entry — shows Suspense fallback until search params are ready.
// KEEP: Do not put heavy logic here; use DashboardBody instead.
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
