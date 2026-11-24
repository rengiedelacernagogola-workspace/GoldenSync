"use client";

/**
 * Outcomes — syllabus Part II (Vision/Mission/GA/IOs/PEO/PO/CO).
 * FLOW: Sidebar Outcomes → edit syllabus → Save.
 */

import { useParams, useRouter, useSearchParams } from "next/navigation";
import * as React from "react";

import {
  AppShell,
  MobileDrawer,
  type SidebarActiveId,
} from "@/components/core";
import { EmptyModulePanel } from "@/components/features/modules/empty-module-panel";
import { OutcomesSyllabusPanel } from "@/components/features/outcomes/outcomes-syllabus-panel";
import { useLiveSubject } from "@/hooks/use-live-subject";
import { pushActivity, type ActivityKind } from "@/lib/activity/activity-log";
import { pathForNav } from "@/lib/nav";

function Body() {
  const params = useParams();
  const router = useRouter();
  const searchParams = useSearchParams();
  const subjectId = String(params.subjectId ?? "ite-14");
  const subject = useLiveSubject(subjectId);
  const isEmpty = searchParams.get("empty") === "1";
  const [collapsed, setCollapsed] = React.useState(false);
  const [drawerOpen, setDrawerOpen] = React.useState(false);
  const [activityTick, setActivityTick] = React.useState(0);

  const recordActivity = React.useCallback(
    (entry: { kind: ActivityKind; title: string; detail: string }) => {
      void pushActivity(entry).then(() => setActivityTick((n) => n + 1));
    },
    [],
  );

  function handleNav(id: SidebarActiveId) {
    const path = pathForNav(id, subject.id);
    if (path) router.push(path);
  }

  return (
    <>
      <AppShell
        sidebarVariant={collapsed ? "Collapsed" : "Expanded"}
        subjectSelected
        activeId="outcomes"
        activeSubjectId={subject.id}
        subjectCode={subject.code}
        subjectTitle={subject.title}
        onToggleCollapse={() => setCollapsed((c) => !c)}
        onNav={handleNav}
        topBar={{
          title: "Outcomes",
          semesterLabel: subject.semesterLabel,
          hideAddSubject: true,
          hideSemester: true,
          onMenuClick: () => setDrawerOpen(true),
          notificationsRefreshKey: activityTick,
        }}
      >
        <div className="gs-fade-up flex w-full flex-col gap-space-6">
          <p className="text-overline uppercase text-text-muted">
            {subject.code} · {subject.semesterLabel}
            {subject.live ? " · Live" : ""}
          </p>
          {isEmpty ? (
            <EmptyModulePanel subjectId={subject.id} />
          ) : (
            <OutcomesSyllabusPanel
              subjectId={subject.id}
              live={subject.live}
              policies={subject.detail?.policies}
              outcomes={subject.detail?.outcomes ?? []}
              onSaved={() => subject.refresh()}
              onActivity={recordActivity}
            />
          )}
        </div>
      </AppShell>
      <MobileDrawer
        open={drawerOpen}
        subjectSelected
        activeId="outcomes"
        activeSubjectId={subject.id}
        subjectCode={subject.code}
        subjectTitle={subject.title}
        onClose={() => setDrawerOpen(false)}
        onNav={handleNav}
      />
    </>
  );
}

export default function OutcomesPage() {
  return (
    <React.Suspense
      fallback={
        <div className="flex min-h-screen items-center justify-center bg-bg-base text-text-muted">
          Loading…
        </div>
      }
    >
      <Body />
    </React.Suspense>
  );
}
