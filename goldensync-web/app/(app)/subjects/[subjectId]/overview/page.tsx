"use client";

/**
 * Overview — subject home (Figma `128:183`, UI-090).
 * FLOW: Dashboard SubjectCard → Overview · Course spec + subject Notes.
 * RULE: Signed-in live id → GET /api/subjects/:id; else seed.
 */

import { useParams, useRouter } from "next/navigation";
import * as React from "react";

import {
  AppShell,
  MobileDrawer,
  type SidebarActiveId,
} from "@/components/core";
import { CourseSpecCard } from "@/components/features/overview/course-spec-card";
import { SubjectNotesPanel } from "@/components/features/overview/subject-notes-panel";
import { useLiveSubject } from "@/hooks/use-live-subject";
import { pushActivity, type ActivityKind } from "@/lib/activity/activity-log";
import { pathForNav } from "@/lib/nav";

/** Inner overview — Suspense for useParams. */
function OverviewBody() {
  const params = useParams();
  const router = useRouter();
  const subjectId = String(params.subjectId ?? "ite-14");
  const subject = useLiveSubject(subjectId);

  const [collapsed, setCollapsed] = React.useState(false);
  const [drawerOpen, setDrawerOpen] = React.useState(false);
  const [activityTick, setActivityTick] = React.useState(0);

  function handleNav(id: SidebarActiveId) {
    const path = pathForNav(id, subject.id);
    if (path) router.push(path);
  }

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
          </p>

          <div className="grid w-full min-w-0 grid-cols-1 items-start gap-space-4 sm:gap-space-6 xl:grid-cols-[minmax(0,1fr)_minmax(240px,320px)]">
            <CourseSpecCard
              subjectId={subject.id}
              live={subject.live}
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
