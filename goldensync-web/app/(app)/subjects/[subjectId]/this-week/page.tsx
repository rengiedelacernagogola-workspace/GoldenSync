"use client";

/**
 * This Week — weekState Proto branches (Figma `138:2736`+, UI-097).
 * FLOW: BEFORE_START / AFTER_END / NO_CLASS / NO_PLAN / normal card.
 */

import { differenceInCalendarDays, format, parseISO } from "date-fns";
import { useParams, useRouter } from "next/navigation";
import * as React from "react";

import {
  AppShell,
  Card,
  EmptyState,
  MobileDrawer,
  StatusChip,
  type SidebarActiveId,
} from "@/components/core";
import { appendixA } from "@/copy";
import { goldenSyncSeed } from "@/data/seed";
import { useLiveSubject } from "@/hooks/use-live-subject";
import { pathForNav } from "@/lib/nav";
import { useWeekState } from "@/state";

function SpecRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="grid grid-cols-[140px_1fr] gap-space-3">
      <span className="text-body-sm text-text-muted">{label}</span>
      <span className="text-body-sm text-text-primary">{value}</span>
    </div>
  );
}

function ThisWeekBody() {
  const params = useParams();
  const router = useRouter();
  const weekState = useWeekState();
  const subjectId = String(params.subjectId ?? "ite-14");
  const subject = useLiveSubject(subjectId);
  const card = {
    id: subject.id,
    code: subject.code,
    title: subject.title,
  };
  const semester = goldenSyncSeed.semester;
  const clock = goldenSyncSeed.clock;

  const [collapsed, setCollapsed] = React.useState(false);
  const [drawerOpen, setDrawerOpen] = React.useState(false);

  function handleNav(id: SidebarActiveId) {
    const path = pathForNav(id, card.id);
    if (path) router.push(path);
  }

  const today = React.useMemo(() => {
    try {
      return parseISO(clock.todayIso);
    } catch {
      return new Date();
    }
  }, [clock.todayIso]);

  const todayLabel = React.useMemo(
    () => format(today, "EEE d MMM yyyy"),
    [today],
  );

  const daysUntilStart = React.useMemo(() => {
    try {
      return differenceInCalendarDays(parseISO(semester.startIso), today);
    } catch {
      return 0;
    }
  }, [semester.startIso, today]);

  if (weekState !== "normal") {
    const empty = (() => {
      switch (weekState) {
        case "before_start":
          return {
            title: "Semester starts soon",
            body: `BEFORE_START: starts in ${Math.max(0, daysUntilStart)} days, Week 1 preview`,
            chip: "Not Started" as const,
          };
        case "after_end":
          return {
            title: "Semester ended",
            body: "AFTER_END: Semester ended",
            chip: "Completed" as const,
          };
        case "no_class":
          return {
            title: "No class this week",
            body: "NO_CLASS: show the next scheduled topic",
            chip: "Not Started" as const,
          };
        default:
          return {
            title: "No topic scheduled",
            body: "NO_PLAN_FOR_WEEK: No topic scheduled",
            chip: "Not Started" as const,
          };
      }
    })();

    return (
      <>
        <AppShell
          sidebarVariant={collapsed ? "Collapsed" : "Expanded"}
          subjectSelected
          activeId="this-week"
          subjectCode={card.code}
          subjectTitle={card.title}
          onToggleCollapse={() => setCollapsed((c) => !c)}
          onNav={handleNav}
          topBar={{
            title: "This Week",
            semesterLabel: semester.label,
            hideAddSubject: true,
          hideSemester: true,
            onMenuClick: () => setDrawerOpen(true),
          }}
        >
          <div className="gs-fade-up flex w-full max-w-xl flex-col gap-space-4">
            <p className="text-overline uppercase text-text-muted">
              {card.code} · {semester.label}
            </p>
            <StatusChip status={empty.chip} />
            <EmptyState
              title={empty.title}
              body={empty.body}
              hasAction={false}
            />
            <p className="text-caption text-text-muted">
              {appendixA.modules.thisWeek}
            </p>
          </div>
        </AppShell>
        <MobileDrawer
          open={drawerOpen}
          subjectSelected
          activeId="this-week"
          subjectCode={card.code}
          subjectTitle={card.title}
          onClose={() => setDrawerOpen(false)}
          onNav={handleNav}
        />
      </>
    );
  }

  return (
    <>
      <AppShell
        sidebarVariant={collapsed ? "Collapsed" : "Expanded"}
        subjectSelected
        activeId="this-week"
        subjectCode={card.code}
        subjectTitle={card.title}
        onToggleCollapse={() => setCollapsed((c) => !c)}
        onNav={handleNav}
        topBar={{
          title: "This Week",
          semesterLabel: semester.label,
          hideAddSubject: true,
          hideSemester: true,
          onMenuClick: () => setDrawerOpen(true),
        }}
      >
        <div className="gs-fade-up flex w-full max-w-xl flex-col gap-space-6">
          <p className="text-overline uppercase text-text-muted">
            {card.code} · {semester.label}
          </p>
          <p className="text-body-sm text-text-muted">
            Today: {todayLabel} · Week {semester.currentWeek}
          </p>
          <Card className="flex flex-col gap-space-4 p-space-6">
            <div className="flex items-center justify-between gap-space-3">
              <h2 className="text-heading-md text-text-primary">
                Week {semester.currentWeek}
              </h2>
              <StatusChip status="In Progress" />
            </div>
            <div className="flex flex-col gap-space-3">
              <SpecRow label="Topic" value="Secure session handling" />
              <SpecRow label="Outcome" value="CO3" />
              <SpecRow label="Activities" value="Lab 3" />
              <SpecRow
                label="Next assessment"
                value="Midterm Exam · Week 14"
              />
            </div>
          </Card>
        </div>
      </AppShell>
      <MobileDrawer
        open={drawerOpen}
        subjectSelected
        activeId="this-week"
        subjectCode={card.code}
        subjectTitle={card.title}
        onClose={() => setDrawerOpen(false)}
        onNav={handleNav}
      />
    </>
  );
}

export default function ThisWeekPage() {
  return (
    <React.Suspense
      fallback={
        <div className="flex min-h-screen items-center justify-center bg-bg-base text-body-sm text-text-muted">
          Loading…
        </div>
      }
    >
      <ThisWeekBody />
    </React.Suspense>
  );
}
