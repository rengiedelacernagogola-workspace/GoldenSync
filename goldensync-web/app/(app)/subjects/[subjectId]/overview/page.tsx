"use client";

// WHAT: Subject home — course spec card + notes panel for one subject.
// SCREEN: Route /subjects/[subjectId]/overview with sidebar on "Overview".
// HOW: Client page; loads subject via useLiveSubject(subjectId from URL).

/**
 * Overview — subject home (Figma `128:183`, UI-090).
 * FLOW: Dashboard SubjectCard → Overview · Course spec + subject Notes.
 * RULE: Signed-in live id → GET /api/subjects/:id; else seed.
 */

import { useParams, useRouter } from "next/navigation";
import * as React from "react";

import {
  AppShell,
  Banner,
  MobileDrawer,
  type SidebarActiveId,
} from "@/components/core";
import { CourseSpecCard } from "@/components/features/overview/course-spec-card";
import { SubjectNotesPanel } from "@/components/features/overview/subject-notes-panel";
import { useLiveSubject } from "@/hooks/use-live-subject";
import { pushActivity, type ActivityKind } from "@/lib/activity/activity-log";
import { pathForNav } from "@/lib/nav";

/** Inner overview — Suspense for useParams. */
// WHAT: Main overview UI — shell, banners, CourseSpecCard, SubjectNotesPanel.
// HOW: useParams reads [subjectId]; defaults to "ite-14" if missing (demo).
function OverviewBody() {
  const params = useParams();
  const router = useRouter();
  const subjectId = String(params.subjectId ?? "ite-14");
  const subject = useLiveSubject(subjectId);

  const [collapsed, setCollapsed] = React.useState(false);
  const [drawerOpen, setDrawerOpen] = React.useState(false);
  const [activityTick, setActivityTick] = React.useState(0);
  // WHAT: activityTick bumps top-bar notifications after saves in child cards.

  function handleNav(id: SidebarActiveId) {
    const path = pathForNav(id, subject.id);
    if (path) router.push(path);
  }

  // WHAT: Writes activity log entry then bumps notificationsRefreshKey on top bar.
  function notifyActivity(entry: {
    kind: ActivityKind;
    title: string;
    detail: string;
  }) {
    void pushActivity(entry).then(() => setActivityTick((n) => n + 1));
  }

  return (
    <>
      <AppShell
        sidebarVariant={collapsed ? "Collapsed" : "Expanded"}
        subjectSelected
        activeId="overview"
        activeSubjectId={subject.id}
        subjectCode={subject.code}
        subjectTitle={subject.title}
        onToggleCollapse={() => setCollapsed((c) => !c)}
        onNav={handleNav}
        topBar={{
          title: "Overview",
          semesterLabel: subject.semesterLabel,
          hideAddSubject: true,
          hideSemester: true,
          notificationsRefreshKey: activityTick,
          onMenuClick: () => setDrawerOpen(true),
        }}
      >
        <div className="gs-fade-up flex w-full flex-col gap-space-6">
          <p className="text-overline uppercase text-text-muted">
            {subject.code} · {subject.semesterLabel}
            {subject.live ? " · Live" : ""}
            {subject.semesterPast ? " · Past" : ""}
          </p>

          {/* SCREEN: Past semester banner — read-only mode for all edits below. */}
          {subject.semesterPast ? (
            <Banner
              variant="Info"
              message="Past semester — view only. Archive or delete this subject from the sidebar if you want to hide it."
              hasAction={false}
              className="w-full"
            />
          ) : null}

          <div className="flex w-full min-w-0 flex-col gap-space-4 sm:gap-space-6">
            <CourseSpecCard
              subjectId={subject.id}
              live={subject.live}
              readOnly={subject.semesterPast}
              code={subject.code}
              title={subject.title}
              units={subject.units}
              prerequisite={subject.prerequisite}
              effectivity={subject.effectivity}
              semesterLabel={subject.semesterLabel}
              policies={subject.detail?.policies ?? null}
              faculty={subject.detail?.faculty ?? null}
              onSaved={() => subject.refresh()}
              onActivity={notifyActivity}
            />

            <SubjectNotesPanel
              subjectId={subject.id}
              live={subject.live}
              readOnly={subject.semesterPast}
              ready={subject.ready}
              onActivity={notifyActivity}
            />
          </div>
        </div>
      </AppShell>

      <MobileDrawer
        open={drawerOpen}
        subjectSelected
        activeId="overview"
        activeSubjectId={subject.id}
        subjectCode={subject.code}
        subjectTitle={subject.title}
        onClose={() => setDrawerOpen(false)}
        onNav={handleNav}
      />
    </>
  );
}

/** Overview page — Suspense for dynamic subjectId. */
// KEEP: Thin wrapper — put logic in OverviewBody, not here.
export default function OverviewPage() {
  return (
    <React.Suspense
      fallback={
        <div className="bg-ambient flex min-h-screen items-center justify-center bg-bg-base text-body-sm text-text-muted">
          Loading overview…
        </div>
      }
    >
      <OverviewBody />
    </React.Suspense>
  );
}
