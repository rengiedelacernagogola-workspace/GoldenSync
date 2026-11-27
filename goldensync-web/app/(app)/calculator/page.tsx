"use client";

/**
 * Grade Calculator — live CO score entry (sidebar Grade Calculator).
 * FLOW: sidebar grade-calculator → GradeCalculatorPanel.
 */

import { useRouter, useSearchParams } from "next/navigation";
import * as React from "react";

import {
  AppShell,
  EmptyState,
  MobileDrawer,
  type SidebarActiveId,
} from "@/components/core";
import { GradeCalculatorPanel } from "@/components/features/calculator/grade-calculator-panel";
import { appendixA } from "@/copy";
import { goldenSyncSeed } from "@/data/seed";
import { useLiveData } from "@/hooks/use-live-data";
import { pathForNav } from "@/lib/nav";
import { useProtoActions, useSubjectSelected } from "@/state";

/** Calculator page body — needs Suspense for useSearchParams. */
function CalculatorBody() {
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
  const active = useLive
    ? (liveSubjects.find((s) => s.id === liveSubjectId) ?? liveSubjects[0])
    : seedActive;

  const [collapsed, setCollapsed] = React.useState(false);
  const [drawerOpen, setDrawerOpen] = React.useState(false);

  React.useEffect(() => {
    if (useLive && liveSubjectId) {
      setSubjectSelected(true);
      router.replace(`/calculator?subject=${encodeURIComponent(liveSubjectId)}`);
    }
  }, [useLive, liveSubjectId, router, setSubjectSelected]);

  function handleNav(id: SidebarActiveId) {
    const path = pathForNav(id, active?.id ?? liveSubjectId ?? undefined);
    if (path) router.push(path);
  }

  return (
    <>
      <AppShell
        sidebarVariant={collapsed ? "Collapsed" : "Expanded"}
        subjectSelected={subjectSelected}
        activeId="grade-calculator"
        activeSubjectId={active?.id ?? liveSubjectId}
        subjectCode={active?.code ?? "No subject"}
        subjectTitle={active?.title ?? "Choose a subject."}
        onToggleCollapse={() => setCollapsed((c) => !c)}
        onNav={handleNav}
        topBar={{
          title: "Grade Calculator",
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
        {!subjectSelected ? (
          <EmptyState
            title="No subject selected"
            body={appendixA.calculator.empty}
            actionLabel="Add Subject"
            onAction={() => router.push("/dashboard")}
          />
        ) : (
          <div className="relative flex w-full min-w-0 flex-col gap-space-6">
            <p className="text-overline uppercase text-text-muted">
              {active?.code} ·{" "}
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

            <GradeCalculatorPanel
              subjectId={
                useLive ? liveSubjectId : (active?.id ?? null)
              }
              live={Boolean(useLive && liveSubjectId)}
              subjectCode={active?.code ?? ""}
              subjectTitle={active?.title ?? ""}
            />
          </div>
        )}
      </AppShell>

      <MobileDrawer
        open={drawerOpen}
        subjectSelected={subjectSelected}
        activeId="grade-calculator"
        activeSubjectId={active?.id ?? liveSubjectId}
        subjectCode={active?.code}
        subjectTitle={active?.title}
        onClose={() => setDrawerOpen(false)}
        onNav={handleNav}
      />
    </>
  );
}

/** Grade Calculator page. */
export default function CalculatorPage() {
  return (
    <React.Suspense
      fallback={
        <div className="flex min-h-screen items-center justify-center bg-bg-base text-text-muted">
          Loading grade calculator…
        </div>
      }
    >
      <CalculatorBody />
    </React.Suspense>
  );
}
