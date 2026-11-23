"use client";

/**
 * Assessment Map — CoverageMatrix screen (Figma P3 Assessments, C7).
 */

import { useParams, useRouter, useSearchParams } from "next/navigation";
import * as React from "react";

import {
  AppShell,
  CoverageMatrix,
  MobileDrawer,
  type SidebarActiveId,
} from "@/components/core";
import { EmptyModulePanel } from "@/components/features/modules/empty-module-panel";
import { useLiveSubject } from "@/hooks/use-live-subject";
import { pathForNav } from "@/lib/nav";

function AssessmentsBody() {
  const params = useParams();
  const router = useRouter();
  const searchParams = useSearchParams();
  const subjectId = String(params.subjectId ?? "ite-14");
  const subject = useLiveSubject(subjectId);
  const isEmpty = searchParams.get("empty") === "1";
  const liveAssessments = subject.detail?.assessments ?? [];

  const [collapsed, setCollapsed] = React.useState(false);
  const [drawerOpen, setDrawerOpen] = React.useState(false);

  function handleNav(id: SidebarActiveId) {
    const path = pathForNav(id, subject.id);
    if (path) router.push(path);
  }

  return (
    <>
      <AppShell
        sidebarVariant={collapsed ? "Collapsed" : "Expanded"}
        subjectSelected
        activeId="assessments"
        subjectCode={subject.code}
        subjectTitle={subject.title}
        onToggleCollapse={() => setCollapsed((c) => !c)}
        onNav={handleNav}
        topBar={{
          title: "Assessment Map",
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
          ) : liveAssessments.length > 0 ? (
            <ul className="flex w-full flex-col gap-space-3">
              {liveAssessments.map((a) => (
                <li
                  key={a.id}
                  className="text-body-sm text-text-primary"
                >
                  {a.label} · max {a.maxScore}
                </li>
              ))}
            </ul>
          ) : (
            <div className="w-full overflow-x-auto">
              <CoverageMatrix className="max-w-none" />
            </div>
          )}
        </div>
      </AppShell>
      <MobileDrawer
        open={drawerOpen}
        subjectSelected
        activeId="assessments"
        subjectCode={subject.code}
        subjectTitle={subject.title}
        onClose={() => setDrawerOpen(false)}
        onNav={handleNav}
      />
    </>
  );
}

export default function AssessmentsPage() {
  return (
    <React.Suspense
      fallback={
        <div className="flex min-h-screen items-center justify-center bg-bg-base text-body-sm text-text-muted">
          Loading…
        </div>
      }
    >
      <AssessmentsBody />
    </React.Suspense>
  );
}
