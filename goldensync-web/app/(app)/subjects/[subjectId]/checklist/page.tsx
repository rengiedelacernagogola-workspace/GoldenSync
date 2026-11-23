"use client";

/**
 * Checklist — week rows from PlanWeek + ChecklistItem (live), seed only for proto.
 * FLOW: tick Done → PUT /api/subjects/:id/checklist when live.
 * RULE: ticking weeks never feeds Calculator. Never show ITE seed for live subjects.
 * Duplicate week #s: each PlanWeek row toggles via planWeekId (not whole week).
 */

import { useParams, useRouter, useSearchParams } from "next/navigation";
import * as React from "react";

import {
  AppShell,
  MobileDrawer,
  ProgressBar,
  Table,
  WeekRow,
  WeekTableHeader,
  type SidebarActiveId,
  type WeekRowStatus,
} from "@/components/core";
import { ChecklistEmptyPanel } from "@/components/features/checklist/checklist-empty-panel";
import { ManualChecklistCard } from "@/components/features/checklist/manual-checklist-card";
import { EmptyModulePanel } from "@/components/features/modules/empty-module-panel";
import { ITE14_WEEKS, type SeedWeek } from "@/data/seed";
import { useLiveSubject } from "@/hooks/use-live-subject";
import { toggleChecklist } from "@/lib/api/subjects";
import { pathForNav } from "@/lib/nav";

type WeekItem = SeedWeek & { planWeekId?: string };

function rowsFromLive(
  plan: Array<{
    id: string;
    weekNumber: number;
    topic: string | null;
    outcome?: string | null;
    activities?: string | null;
    status?: WeekRowStatus;
  }>,
  checklist: Array<{ weekNumber: number; done: boolean }>,
): WeekItem[] {
  const byWeek = new Map(checklist.map((c) => [c.weekNumber, c.done]));
  return [...plan]
    .sort((a, b) => a.weekNumber - b.weekNumber || a.id.localeCompare(b.id))
    .map((planRow) => {
      const topic = (planRow.topic ?? "").trim();
      /* Prefer per-row PlanWeek status (multiple topics may share a week #). */
      let status = (planRow.status ?? "Not started") as WeekRowStatus;
      if (status !== "No class" && status !== "Done") {
        const done = byWeek.get(planRow.weekNumber) === true;
        if (done) status = "Done";
      }
      return {
        week: String(planRow.weekNumber),
        topic: topic || `Week ${planRow.weekNumber}`,
        outcome: (planRow.outcome ?? "").trim() || "—",
        activities: (planRow.activities ?? "").trim() || "—",
        status,
        planWeekId: planRow.id,
      };
    });
}

function ChecklistBody() {
  const params = useParams();
  const router = useRouter();
  const searchParams = useSearchParams();
  const subjectId = String(params.subjectId ?? "ite-14");
  const subject = useLiveSubject(subjectId);
  const isEmpty = searchParams.get("empty") === "1";

  const [weeks, setWeeks] = React.useState<WeekItem[]>([]);
  const [collapsed, setCollapsed] = React.useState(false);
  const [drawerOpen, setDrawerOpen] = React.useState(false);

  React.useEffect(() => {
    if (!subject.ready) return;
    const handle = window.setTimeout(() => {
      if (subject.live) {
        const plan = subject.detail?.planWeeks ?? [];
        const checklist = subject.detail?.checklist ?? [];
        setWeeks(plan.length > 0 ? rowsFromLive(plan, checklist) : []);
      } else {
        /* Proto / unsigned demo only */
        setWeeks([...ITE14_WEEKS]);
      }
    }, 0);
    return () => window.clearTimeout(handle);
  }, [subject.ready, subject.live, subject.detail, subjectId]);

  const showLiveEmpty =
    subject.ready && subject.live && weeks.length === 0 && !isEmpty;

  const doneCount = weeks.filter((w) => w.status === "Done").length;
  const totalWeeks = weeks.length;
  const progress =
    totalWeeks === 0 ? 0 : Math.round((doneCount / totalWeeks) * 100);

  function handleNav(id: SidebarActiveId) {
    const path = pathForNav(id, subject.id);
    if (path) router.push(path);
  }

  async function handleDoneChange(index: number, done: boolean) {
    const row = weeks[index];
    if (!row) return;
    const weekNumber = Number(row.week);
    setWeeks((prev) =>
      prev.map((r, i) =>
        i === index
          ? {
              ...r,
              status: (done
                ? "Done"
                : r.status === "No class"
                  ? "No class"
                  : "In progress") as WeekRowStatus,
            }
          : r,
      ),
    );
    if (subject.live && Number.isFinite(weekNumber)) {
      try {
        await toggleChecklist(
          subject.id,
          weekNumber,
          done,
          row.planWeekId,
        );
        subject.refresh();
      } catch {
        /* keep optimistic UI; refresh can reconcile */
      }
    }
  }

  return (
    <>
      <AppShell
        sidebarVariant={collapsed ? "Collapsed" : "Expanded"}
        subjectSelected
        activeId="checklist"
        subjectCode={subject.code}
        subjectTitle={subject.title}
        onToggleCollapse={() => setCollapsed((c) => !c)}
        onNav={handleNav}
        topBar={{
          title: "Checklist",
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
            <p className="text-body-sm text-text-muted">Loading checklist…</p>
          ) : showLiveEmpty ? (
            <>
              <ChecklistEmptyPanel
                subjectId={subject.id}
                onGenerated={() => subject.refresh()}
              />
              <ManualChecklistCard
                subjectId={subject.id}
                subjectCode={subject.code}
              />
            </>
          ) : (
            <>
              <div className="flex w-full flex-col gap-space-2">
                <p className="font-mono text-[11px] font-medium tracking-tight text-text-secondary">
                  {doneCount} of {totalWeeks || "—"} weeks done
                </p>
                <ProgressBar value={progress} size={4} className="w-full" />
                <p className="text-[11px] tracking-tight text-text-muted">
                  Ticking weeks never changes your results.
                </p>
              </div>
              {weeks.length > 0 ? (
                <div className="w-full overflow-x-auto">
                  <Table header={<WeekTableHeader showDone />}>
                    {weeks.map((w, index) => (
                      <WeekRow
                        key={w.planWeekId ?? `${w.week}-${index}`}
                        week={w.week}
                        topic={w.topic}
                        outcome={w.outcome}
                        activities={w.activities}
                        status={w.status}
                        done={w.status === "Done"}
                        onDoneChange={(done) => {
                          void handleDoneChange(index, done);
                        }}
                      />
                    ))}
                  </Table>
                </div>
              ) : null}
              {subject.live ? (
                <ManualChecklistCard
                  subjectId={subject.id}
                  subjectCode={subject.code}
                />
              ) : null}
            </>
          )}
        </div>
      </AppShell>

      <MobileDrawer
        open={drawerOpen}
        subjectSelected
        activeId="checklist"
        subjectCode={subject.code}
        subjectTitle={subject.title}
        onClose={() => setDrawerOpen(false)}
        onNav={handleNav}
      />
    </>
  );
}

export default function ChecklistPage() {
  return (
    <React.Suspense
      fallback={
        <div className="bg-ambient flex min-h-screen items-center justify-center bg-bg-base text-body-sm text-text-muted">
          Loading checklist…
        </div>
      }
    >
      <ChecklistBody />
    </React.Suspense>
  );
}
