"use client";

/**
 * Grading — read-only syllabus grading system (Figma `133:1076` · Empty `134:1287`, UI-093).
 * FLOW: Sidebar Grading → Card with live grading text or seed · ?empty=1 → EmptyModule.
 */

import { useParams, useRouter, useSearchParams } from "next/navigation";
import * as React from "react";

import {
  AppShell,
  Card,
  MobileDrawer,
  type SidebarActiveId,
} from "@/components/core";
import { EmptyModulePanel } from "@/components/features/modules/empty-module-panel";
import { useLiveSubject } from "@/hooks/use-live-subject";
import { pathForNav } from "@/lib/nav";

function GradingBody() {
  const params = useParams();
  const router = useRouter();
  const searchParams = useSearchParams();
  const subjectId = String(params.subjectId ?? "ite-14");
  const subject = useLiveSubject(subjectId);
  const isEmpty = searchParams.get("empty") === "1";
  const liveText =
    typeof subject.detail?.grading === "string" ? subject.detail.grading : null;
  const lines = liveText
    ? liveText.split(/\n+/).map((l) => l.trim()).filter(Boolean)
    : [
        "Outcome-based. An outcome is attained above 60 percent.",
        "Quizzes, labs, project parts and exams are mapped to outcomes.",
        "Each outcome has two activities worth 50 points each.",
        "Your average is the unweighted mean of the outcome percents.",
      ];

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
        activeId="grading"
        subjectCode={subject.code}
        subjectTitle={subject.title}
        onToggleCollapse={() => setCollapsed((c) => !c)}
        onNav={handleNav}
        topBar={{
          title: "Grading",
          semesterLabel: subject.semesterLabel,
          hideAddSubject: true,
          hideSemester: true,
          onMenuClick: () => setDrawerOpen(true),
        }}
      >
        <div className="gs-fade-up flex w-full max-w-3xl flex-col gap-space-6">
          <p className="text-overline uppercase text-text-muted">
            {subject.code} · {subject.semesterLabel}
            {subject.live ? " · Live" : ""}
          </p>
          {isEmpty ? (
            <EmptyModulePanel subjectId={subject.id} />
          ) : (
            <>
              <p className="text-caption text-text-muted">
                Read-only (from your saved syllabus)
              </p>
              <Card title="Grading system" hasHeader className="w-full">
                <ul className="flex flex-col gap-space-3">
                  {lines.map((line) => (
                    <li
                      key={line}
                      className="text-body-sm text-text-secondary"
                    >
                      {line}
                    </li>
                  ))}
                </ul>
              </Card>
            </>
          )}
        </div>
      </AppShell>
      <MobileDrawer
        open={drawerOpen}
        subjectSelected
        activeId="grading"
        subjectCode={subject.code}
        subjectTitle={subject.title}
        onClose={() => setDrawerOpen(false)}
        onNav={handleNav}
      />
    </>
  );
}

export default function GradingPage() {
  return (
    <React.Suspense
      fallback={
        <div className="flex min-h-screen items-center justify-center bg-bg-base text-text-muted">
          Loading…
        </div>
      }
    >
      <GradingBody />
    </React.Suspense>
  );
}
