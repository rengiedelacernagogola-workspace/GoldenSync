"use client";

// WHAT: Two-column page — faculty bio card + class policies card.
// SCREEN: /subjects/[subjectId]/faculty · stacks to one column on small screens.
// HOW: Non-live subjects fall back to goldenSyncSeed blurbs for demo.

/**
 * College Faculty — Faculty + Class policies side-by-side (50/50).
 * FLOW: Sidebar College Faculty → Edit either card → Save.
 */

import { useParams, useRouter, useSearchParams } from "next/navigation";
import * as React from "react";

import {
  AppShell,
  Banner,
  MobileDrawer,
  type SidebarActiveId,
} from "@/components/core";
import { FacultyPanel } from "@/components/features/faculty/faculty-panel";
import { EmptyModulePanel } from "@/components/features/modules/empty-module-panel";
import { ClassPoliciesPanel } from "@/components/features/policies/class-policies-panel";
import { goldenSyncSeed } from "@/data/seed";
import { useLiveSubject } from "@/hooks/use-live-subject";
import { pushActivity, type ActivityKind } from "@/lib/activity/activity-log";
import { parsePoliciesDoc } from "@/lib/domain/course-spec";
import { pathForNav } from "@/lib/nav";

// WHAT: Inner faculty page — resolves faculty/policies data and renders two panels.
// HOW: facultyRaw is null for live subjects with no saved faculty (no seed fill).
// SCREEN: Past-semester banner; ?empty=1 shows EmptyModulePanel instead of grid.
function FacultyBody() {
  const params = useParams();
  const router = useRouter();
  const searchParams = useSearchParams();
  const subjectId = String(params.subjectId ?? "ite-14");
  const subject = useLiveSubject(subjectId);
  const forceEmpty = searchParams.get("empty") === "1";

  const facultyRaw =
    subject.detail?.faculty ??
    (subject.live
      ? null
      : { name: goldenSyncSeed.activeSubject.facultyBlurb });

  // WHAT: policiesRaw — live uses API only; proto fills empty classPolicies from seed.
  const policiesRaw = React.useMemo(() => {
    const fromDetail = subject.detail?.policies ?? null;
    if (subject.live) return fromDetail;
    const parsed = parsePoliciesDoc(fromDetail);
    if (parsed.classPolicies.trim()) return fromDetail;
    return {
      ...parsed,
      classPolicies: goldenSyncSeed.activeSubject.policiesBlurb,
    };
  }, [subject.detail?.policies, subject.live]);

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
        activeId="faculty"
        activeSubjectId={subject.id}
        subjectCode={subject.code}
        subjectTitle={subject.title}
        onToggleCollapse={() => setCollapsed((c) => !c)}
        onNav={handleNav}
        topBar={{
          title: "College Faculty",
          semesterLabel: subject.semesterLabel,
          hideAddSubject: true,
          hideSemester: true,
          notificationsRefreshKey: activityTick,
          onMenuClick: () => setDrawerOpen(true),
        }}
      >
        <div className="gs-fade-up flex w-full min-w-0 flex-col gap-space-6">
          <p className="text-overline uppercase text-text-muted">
            {subject.code} · {subject.semesterLabel}
            {subject.live ? " · Live" : ""}
            {subject.semesterPast ? " · Past" : ""}
          </p>

          {subject.semesterPast ? (
            <Banner
              variant="Info"
              message="Past semester — view only. Archive or delete this subject from the sidebar if you want to hide it."
              hasAction={false}
              className="w-full"
            />
          ) : null}

          {forceEmpty ? (
            <EmptyModulePanel subjectId={subject.id} />
          ) : (
            <div
              // SCREEN: 50/50 grid — FacultyPanel left, ClassPoliciesPanel right (md+).
              className="grid w-full min-w-0 grid-cols-1 items-stretch gap-space-4 sm:gap-space-6 md:grid-cols-2"
            >
              <FacultyPanel
                subjectId={subject.id}
                live={subject.live}
                readOnly={subject.semesterPast}
                faculty={facultyRaw}
                onSaved={() => subject.refresh()}
                onActivity={notifyActivity}
              />
              <ClassPoliciesPanel
                subjectId={subject.id}
                live={subject.live}
                readOnly={subject.semesterPast}
                policies={policiesRaw}
                onSaved={() => subject.refresh()}
                onActivity={notifyActivity}
              />
            </div>
          )}
        </div>
      </AppShell>
      <MobileDrawer
        open={drawerOpen}
        subjectSelected
        activeId="faculty"
        activeSubjectId={subject.id}
        subjectCode={subject.code}
        subjectTitle={subject.title}
        onClose={() => setDrawerOpen(false)}
        onNav={handleNav}
      />
    </>
  );
}

// WHAT: Route entry for College Faculty under a subject.
// KEEP: Suspense required when FacultyBody (or children) use searchParams.
export default function FacultyPage() {
  return (
    <React.Suspense
      fallback={
        <div className="flex min-h-screen items-center justify-center bg-bg-base text-text-muted">
          Loading…
        </div>
      }
    >
      <FacultyBody />
    </React.Suspense>
  );
}
