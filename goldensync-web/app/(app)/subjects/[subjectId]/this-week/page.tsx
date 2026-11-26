"use client";

/**
 * This Week — live plan week for current calendar week, or empty.
 * Proto (unsigned) keeps seed semester/clock demo card.
 */

import { format } from "date-fns";
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
import { EmptyModulePanel } from "@/components/features/modules/empty-module-panel";
import { appendixA } from "@/copy";
import { goldenSyncSeed } from "@/data/seed";
import { useLiveSubject } from "@/hooks/use-live-subject";
import { weekNumberFromStart } from "@/lib/domain/planner";
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

function statusChip(
  status: string | undefined,
): "Not Started" | "In Progress" | "Completed" {
  if (status === "Done") return "Completed";
  if (status === "In progress") return "In Progress";
  return "Not Started";
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

  const [collapsed, setCollapsed] = React.useState(false);
  const [drawerOpen, setDrawerOpen] = React.useState(false);

  function handleNav(id: SidebarActiveId) {
    const path = pathForNav(id, card.id);
    if (path) router.push(path);
  }

  const todayIso = format(new Date(), "yyyy-MM-dd");
  const todayLabel = format(new Date(), "EEE d MMM yyyy");

  if (subject.live) {
    const start =
      subject.detail?.semesterStartDate?.slice(0, 10) ??
      null;
    const end = subject.detail?.semesterEndDate?.slice(0, 10) ?? null;
    const planWeeks = subject.detail?.planWeeks ?? [];
    const weekNumber =
      start != null ? weekNumberFromStart(start, todayIso) : null;

    let emptyTitle = "No topic scheduled";
    let emptyBody = "Add weeks in Learning Plan or Sync a syllabus.";
    let chip: "Not Started" | "In Progress" | "Completed" = "Not Started";

    if (start && end && todayIso < start) {
      emptyTitle = "Semester starts soon";
      emptyBody = `Starts ${start}. Week 1 will appear here when the term begins.`;
    } else if (start && end && todayIso > end) {
      emptyTitle = "Semester ended";
      emptyBody = "This term is over. Review Learning Plan for the full archive.";
      chip = "Completed";
    } else if (planWeeks.length === 0) {
      emptyTitle = "No plan weeks yet";
      emptyBody = "Generate study weeks in Learning Plan or Sync a syllabus.";
    }

    const current =
      weekNumber != null
        ? planWeeks.find((w) => w.weekNumber === weekNumber)
        : undefined;
    const hasTopic = Boolean(current?.topic?.trim());
    const showCard =
      current != null &&
      start != null &&
      end != null &&
      todayIso >= start &&
      todayIso <= end;

    return (
      <>
        <AppShell
          sidebarVariant={collapsed ? "Collapsed" : "Expanded"}
          subjectSelected
          activeId="this-week"
          activeSubjectId={card.id}
          subjectCode={card.code}
          subjectTitle={card.title}
          onToggleCollapse={() => setCollapsed((c) => !c)}
          onNav={handleNav}
          topBar={{
            title: "This Week",
            semesterLabel: subject.semesterLabel,
            hideAddSubject: true,
            hideSemester: true,
            onMenuClick: () => setDrawerOpen(true),
          }}
        >
          <div className="gs-fade-up flex w-full max-w-xl flex-col gap-space-6">
            <p className="text-overline uppercase text-text-muted">
              {card.code} · {subject.semesterLabel} · Live
            </p>
            {showCard && hasTopic ? (
              <>
                <p className="text-body-sm text-text-muted">
                  Today: {todayLabel}
                  {weekNumber != null ? ` · Week ${weekNumber}` : ""}
                </p>
                <Card className="flex flex-col gap-space-4 p-space-6">
                  <div className="flex items-center justify-between gap-space-3">
                    <h2 className="text-heading-md text-text-primary">
                      Week {current.weekNumber}
                    </h2>
                    <StatusChip status={statusChip(current.status)} />
                  </div>
                  <div className="flex flex-col gap-space-3">
                    <SpecRow
                      label="Topic"
                      value={current.topic?.trim() || "—"}
                    />
                    <SpecRow
                      label="Outcome"
                      value={current.outcome?.trim() || "—"}
                    />
                    <SpecRow
                      label="Activities"
                      value={current.activities?.trim() || "—"}
                    />
                  </div>
                </Card>
              </>
            ) : showCard && !hasTopic ? (
              <>
                <StatusChip status={statusChip(current?.status)} />
                <EmptyState
                  title="No topic for this week"
                  body={`Week ${current?.weekNumber ?? weekNumber} has no topic yet. Edit Learning Plan or Sync a syllabus.`}
                  hasAction={false}
                />
              </>
            ) : planWeeks.length === 0 &&
              !(start && end && (todayIso < start || todayIso > end)) ? (
              <EmptyModulePanel subjectId={subject.id} />
            ) : (
              <>
                <StatusChip status={chip} />
                <EmptyState
                  title={emptyTitle}
                  body={emptyBody}
                  hasAction={false}
                />
              </>
            )}
          </div>
        </AppShell>
        <MobileDrawer
          open={drawerOpen}
          subjectSelected
          activeId="this-week"
          activeSubjectId={card.id}
          subjectCode={card.code}
          subjectTitle={card.title}
          onClose={() => setDrawerOpen(false)}
          onNav={handleNav}
        />
      </>
    );
  }

  /* Proto / unsigned — seed demo branches. */
  const semester = goldenSyncSeed.semester;
  const clock = goldenSyncSeed.clock;
  const todayLabelProto = (() => {
    try {
      return format(new Date(clock.todayIso), "EEE d MMM yyyy");
    } catch {
      return clock.todayIso;
    }
  })();

  if (weekState !== "normal") {
    const empty = (() => {
      switch (weekState) {
        case "before_start":
          return {
            title: "Semester starts soon",
            body: "BEFORE_START: Week 1 preview",
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
          activeSubjectId={card.id}
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
          activeSubjectId={card.id}
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
        activeSubjectId={card.id}
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
            Today: {todayLabelProto} · Week {semester.currentWeek}
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
        activeSubjectId={card.id}
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
