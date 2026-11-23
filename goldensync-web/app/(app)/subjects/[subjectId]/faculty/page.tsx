"use client";

/**
 * College Faculty — read-only (Figma `133:1319` · Empty `134:1503`, UI-093).
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
import { goldenSyncSeed } from "@/data/seed";
import { useLiveSubject } from "@/hooks/use-live-subject";
import {
  formatInstructorName,
  parseFaculty,
} from "@/lib/domain/faculty";
import { pathForNav } from "@/lib/nav";

function FacultyBody() {
  const params = useParams();
  const router = useRouter();
  const searchParams = useSearchParams();
  const subjectId = String(params.subjectId ?? "ite-14");
  const subject = useLiveSubject(subjectId);
  const isEmpty = searchParams.get("empty") === "1";
  const faculty = parseFaculty(
    subject.detail?.faculty ?? {
      name: goldenSyncSeed.activeSubject.facultyBlurb,
    },
  );
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
              <Card title="Faculty" hasHeader className="w-full">
                <div className="flex flex-col gap-space-3 text-body-sm text-text-secondary">
                  <p>
                    <span className="text-text-muted">Instructor: </span>
                    {formatInstructorName(faculty)}
                  </p>
                  <p>
                    <span className="text-text-muted">College: </span>
                    {faculty.college.trim() || "—"}
                  </p>
                  <p>
                    <span className="text-text-muted">Consultation: </span>
                    {faculty.consultation.trim() || "—"}
                  </p>
                  <p>
                    <span className="text-text-muted">Contact hours: </span>
                    {faculty.estimatedContactHours != null
                      ? `${faculty.estimatedContactHours} hrs`
                      : "—"}
                  </p>
                </div>
              </Card>
            </>
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
