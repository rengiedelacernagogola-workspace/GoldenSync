"use client";

// WHAT: Edit weighting template (quizzes, exams, etc.) for grade math.
// SCREEN: /grading-system · same subject picker pattern as /calculator.
// EDIT: GradingTemplatePanel holds the actual form fields.

/**
 * Grading System — Subject.grading template editor (sidebar Grading System).
 * FLOW: sidebar calculator → GradingTemplatePanel only.
 */

import { useRouter, useSearchParams } from "next/navigation";
import * as React from "react";

import {
  AppShell,
  EmptyState,
  MobileDrawer,
  type SidebarActiveId,
} from "@/components/core";
import { GradingTemplatePanel } from "@/components/features/calculator/grading-template-panel";
import { appendixA } from "@/copy";
import { goldenSyncSeed } from "@/data/seed";
import { useLiveData } from "@/hooks/use-live-data";
import { pathForNav } from "@/lib/nav";
import { useProtoActions, useSubjectSelected } from "@/state";

/** Grading System page body — needs Suspense for useSearchParams. */
// KEEP: Nearly mirrors calculator/page.tsx — change both if subject selection changes.
function GradingSystemBody() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const live = useLiveData();
  const subjectSelected = useSubjectSelected();
  const { setSubjectSelected } = useProtoActions();
  const seedActive = goldenSyncSeed.subjects.find((s) => s.isActive);
  const querySubject = searchParams.get("subject");

  const liveSubjects = live.subjects.map((s) => ({
    id: s.id,
    code: s.courseCode,
    title: s.title,
  }));
  const useLive = live.signedIn && liveSubjects.length > 0;
  const liveSubjectId =
    (querySubject && liveSubjects.some((s) => s.id === querySubject)
      ? querySubject
      : null) ??
    liveSubjects[0]?.id ??
    null;
  /* Seed only for unsigned demo — never under a signed-in empty semester. */
  const active = useLive
    ? (liveSubjects.find((s) => s.id === liveSubjectId) ?? liveSubjects[0])
    : live.signedIn
      ? null
      : seedActive;

  const [collapsed, setCollapsed] = React.useState(false);
  const [drawerOpen, setDrawerOpen] = React.useState(false);

  React.useEffect(() => {
    if (useLive && liveSubjectId) {
      setSubjectSelected(true);
      router.replace(
        `/grading-system?subject=${encodeURIComponent(liveSubjectId)}`,
      );
    }
  }, [useLive, liveSubjectId, router, setSubjectSelected]);

  function handleNav(id: SidebarActiveId) {
    const path = pathForNav(id, active?.id ?? liveSubjectId ?? undefined);
    if (path) router.push(path);
  }

  return (
    <>
      {/* CHECK: AppShell activeId "calculator" — sidebar highlight may match Grade Calculator group. */}
      <AppShell
        sidebarVariant={collapsed ? "Collapsed" : "Expanded"}
        subjectSelected={subjectSelected}
        activeId="calculator"
        activeSubjectId={active?.id ?? liveSubjectId}
        subjectCode={active?.code ?? "No subject"}
        subjectTitle={active?.title ?? "Choose a subject."}
        onToggleCollapse={() => setCollapsed((c) => !c)}
        onNav={handleNav}
        topBar={{
          title: "Grading System",
          semesterLabel: (() => {
            const s = live.semesters.find(
              (x) => x.id === live.activeSemesterId,
            );
            return s
              ? `Year ${s.yearLevel} · ${s.label}`
              : goldenSyncSeed.semester.label;
          })(),
          hideAddSubject: true,
          onMenuClick: () => setDrawerOpen(true),
        }}
      >
        {live.signedIn && !live.ready ? (
          <p className="text-body-sm text-text-muted">Loading subjects…</p>
        ) : live.signedIn && liveSubjects.length === 0 ? (
          <EmptyState
            title="No subjects in this semester"
            body="Add a subject from the dashboard, or switch to a semester that has subjects."
            actionLabel="Open dashboard"
            onAction={() => router.push("/dashboard")}
          />
        ) : !subjectSelected || !active ? (
          <EmptyState
            title="No subject selected"
            body={appendixA.calculator.empty}
            actionLabel="Add Subject"
            onAction={() => router.push("/dashboard")}
          />
        ) : (
          <div className="relative flex w-full min-w-0 flex-col gap-space-6">
            <p className="text-overline uppercase text-text-muted">
              {active.code} ·{" "}
              {(() => {
                const s = live.semesters.find(
                  (x) => x.id === live.activeSemesterId,
                );
                return s
                  ? `Year ${s.yearLevel} · ${s.label}`
                  : goldenSyncSeed.semester.label;
              })()}
              {useLive ? " · Live" : ""}
            </p>

            <GradingTemplatePanel
              key={useLive ? (liveSubjectId ?? "none") : (active.id ?? "seed")}
              subjectId={useLive ? liveSubjectId : null}
              live={Boolean(useLive && liveSubjectId)}
            />
          </div>
        )}
      </AppShell>

      <MobileDrawer
        open={drawerOpen}
        subjectSelected={subjectSelected}
        activeId="calculator"
        activeSubjectId={active?.id ?? liveSubjectId}
        subjectCode={active?.code}
        subjectTitle={active?.title}
        onClose={() => setDrawerOpen(false)}
        onNav={handleNav}
      />
    </>
  );
}

/** Grading System template page. */
export default function GradingSystemPage() {
  return (
    <React.Suspense
      fallback={
        <div className="flex min-h-screen items-center justify-center bg-bg-base text-text-muted">
          Loading grading system…
        </div>
      }
    >
      <GradingSystemBody />
    </React.Suspense>
  );
}
