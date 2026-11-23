"use client";

/**
 * Learning Plan — editable week table (notes live under sidebar Notes).
 * FLOW: Sidebar Plan → add/edit week · topic · outcome · activities · status.
 */

import { useParams, useRouter, useSearchParams } from "next/navigation";
import * as React from "react";

import {
  AppShell,
  MobileDrawer,
  Table,
  WeekRow,
  WeekTableHeader,
  type SidebarActiveId,
} from "@/components/core";
import { EmptyModulePanel } from "@/components/features/modules/empty-module-panel";
import {
  EditablePlanTable,
  type PlanDraftRow,
} from "@/components/features/plan/editable-plan-table";
import { ITE14_WEEKS } from "@/data/seed";
import { useLiveSubject } from "@/hooks/use-live-subject";
import { ensurePlanSkeleton } from "@/lib/api/subjects";
import { pathForNav } from "@/lib/nav";

function draftFromLive(
  plan: Array<{
    id: string;
    weekNumber: number;
    position?: number;
    topic: string | null;
    outcome: string | null;
    activities: string | null;
    status: PlanDraftRow["status"];
  }>,
): PlanDraftRow[] {
  return [...plan]
    .sort(
      (a, b) =>
        a.weekNumber - b.weekNumber ||
        (a.position ?? 0) - (b.position ?? 0),
    )
    .map((w) => ({
      key: w.id,
      weekNumber: w.weekNumber,
      topic: w.topic ?? "",
      outcome: w.outcome ?? "",
      activities: w.activities ?? "",
      status: w.status ?? "Not started",
    }));
}

function PlanBody() {
  const params = useParams();
  const router = useRouter();
  const searchParams = useSearchParams();
  const subjectId = String(params.subjectId ?? "ite-14");
  const subject = useLiveSubject(subjectId);
  const isEmpty = searchParams.get("empty") === "1";
  const [collapsed, setCollapsed] = React.useState(false);
  const [drawerOpen, setDrawerOpen] = React.useState(false);
  const [generating, setGenerating] = React.useState(false);

  const liveWeeks = subject.detail?.planWeeks ?? [];
  const draftRows = React.useMemo(
    () => draftFromLive(liveWeeks),
    [liveWeeks],
  );

  function handleNav(id: SidebarActiveId) {
    const path = pathForNav(id, subject.id);
    if (path) router.push(path);
  }

  async function generateWeeks() {
    if (!subject.live) return;
    setGenerating(true);
    try {
      await ensurePlanSkeleton(subject.id);
      subject.refresh();
    } finally {
      setGenerating(false);
    }
  }

  return (
    <>
      <AppShell
        sidebarVariant={collapsed ? "Collapsed" : "Expanded"}
        subjectSelected
        activeId="plan"
        activeSubjectId={subject.id}
        subjectCode={subject.code}
        subjectTitle={subject.title}
        onToggleCollapse={() => setCollapsed((c) => !c)}
        onNav={handleNav}
        topBar={{
          title: "Learning Plan",
          semesterLabel: subject.semesterLabel,
          hideAddSubject: true,
          hideSemester: true,
          onMenuClick: () => setDrawerOpen(true),
        }}
      >
        <div className="gs-fade-up flex w-full flex-col gap-space-6">
          <p className="text-overline uppercase text-text-muted">
            {subject.code} · {subject.semesterLabel}
            {subject.live ? " · Live" : ""}
          </p>
          {isEmpty ? (
            <EmptyModulePanel subjectId={subject.id} />
          ) : !subject.ready ? (
            <p className="text-body-sm text-text-muted">Loading plan…</p>
          ) : subject.live ? (
            liveWeeks.length === 0 ? (
              <div className="flex flex-col gap-space-3">
                <p className="text-body-sm text-text-muted">
                  No plan weeks yet. Generate a blank skeleton from the semester
                  dates, then edit topics and status here.
                </p>
                <button
                  type="button"
                  className="w-fit text-body-sm font-medium text-accent-primary underline-offset-2 hover:underline disabled:opacity-50"
                  disabled={generating}
                  onClick={() => void generateWeeks()}
                >
                  {generating ? "Generating…" : "Generate study weeks"}
                </button>
                <EditablePlanTable
                  subjectId={subject.id}
                  initialRows={[]}
                  onSaved={() => subject.refresh()}
                />
              </div>
            ) : (
              <EditablePlanTable
                subjectId={subject.id}
                initialRows={draftRows}
                onSaved={() => subject.refresh()}
              />
            )
          ) : (
            <div className="w-full overflow-x-auto">
              <Table header={<WeekTableHeader showDone={false} />}>
                {ITE14_WEEKS.map((w) => (
                  <WeekRow
                    key={w.week}
                    week={w.week}
                    topic={w.topic}
                    outcome={w.outcome}
                    activities={w.activities}
                    status={w.status}
                    showDone={false}
                  />
                ))}
              </Table>
            </div>
          )}
        </div>
      </AppShell>
      <MobileDrawer
        open={drawerOpen}
        subjectSelected
        activeId="plan"
        activeSubjectId={subject.id}
        subjectCode={subject.code}
        subjectTitle={subject.title}
        onClose={() => setDrawerOpen(false)}
        onNav={handleNav}
      />
    </>
  );
}

export default function PlanPage() {
  return (
    <React.Suspense
      fallback={
        <div className="flex min-h-screen items-center justify-center bg-bg-base text-text-muted">
          Loading…
        </div>
      }
    >
      <PlanBody />
    </React.Suspense>
  );
}
