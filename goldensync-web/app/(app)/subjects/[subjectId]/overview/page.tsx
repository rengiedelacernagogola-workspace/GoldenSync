"use client";

/**
 * Overview — subject home (Figma `128:183`, UI-090).
 * FLOW: Dashboard SubjectCard → Overview · Course spec + Quick links.
 * RULE: Signed-in live id → GET /api/subjects/:id; else seed.
 */

import { Calculator, CalendarDays } from "lucide-react";
import { useParams, useRouter } from "next/navigation";
import * as React from "react";

import {
  AppShell,
  Button,
  Card,
  MobileDrawer,
  type SidebarActiveId,
} from "@/components/core";
import { useLiveSubject } from "@/hooks/use-live-subject";
import { pathForNav } from "@/lib/nav";

/** Spec row — muted label, primary value. */
function SpecRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="grid grid-cols-[120px_1fr] gap-space-3 sm:grid-cols-[140px_1fr]">
      <span className="text-body-sm text-text-muted">{label}</span>
      <span className="text-body-sm text-text-primary">{value}</span>
    </div>
  );
}

/** Inner overview — Suspense for useParams. */
function OverviewBody() {
  const params = useParams();
  const router = useRouter();
  const subjectId = String(params.subjectId ?? "ite-14");
  const subject = useLiveSubject(subjectId);

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
        activeId="overview"
        subjectCode={subject.code}
        subjectTitle={subject.title}
        onToggleCollapse={() => setCollapsed((c) => !c)}
        onNav={handleNav}
        topBar={{
          title: "Overview",
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

          <div className="grid w-full gap-space-6 lg:grid-cols-[1fr_280px]">
            <Card title="Course specification" hasHeader className="w-full">
              <div className="flex flex-col gap-space-3">
                <SpecRow label="Code" value={subject.code} />
                <SpecRow label="Title" value={subject.title} />
                <SpecRow label="Units" value={subject.units} />
                <SpecRow label="Prerequisite" value={subject.prerequisite || "—"} />
                <SpecRow label="Effectivity" value={subject.effectivity || "—"} />
                <SpecRow label="Semester" value={subject.semesterLabel} />
              </div>
            </Card>

            <Card title="Quick links" hasHeader className="w-full">
              <Button
                variant="Secondary"
                size="md"
                className="w-full justify-start"
                onClick={() => router.push(`/subjects/${subject.id}/this-week`)}
              >
                <CalendarDays className="size-4" aria-hidden />
                This Week
              </Button>
              <Button
                variant="Secondary"
                size="md"
                className="w-full justify-start"
                onClick={() => router.push("/calculator")}
              >
                <Calculator className="size-4" aria-hidden />
                Grade Calculator
              </Button>
            </Card>
          </div>
        </div>
      </AppShell>

      <MobileDrawer
        open={drawerOpen}
        subjectSelected
        activeId="overview"
        subjectCode={subject.code}
        subjectTitle={subject.title}
        onClose={() => setDrawerOpen(false)}
        onNav={handleNav}
      />
    </>
  );
}

/** Overview page — Suspense for dynamic subjectId. */
export default function OverviewPage() {
  return (
    <React.Suspense
      fallback={
        <div className="bg-ambient flex min-h-screen items-center justify-center bg-bg-base text-body-sm text-text-muted">
          Loading overview…
        </div>
      }
    >
      <OverviewBody />
    </React.Suspense>
  );
}
