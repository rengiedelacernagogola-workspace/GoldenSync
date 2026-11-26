"use client";

/**
 * Class Policies — read-only (Figma `133:1202` · Empty `134:1396`, UI-093).
 * Live empty subjects show EmptyModulePanel (no seed policies blurb).
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
import { parsePoliciesDoc } from "@/lib/domain/course-spec";
import { pathForNav } from "@/lib/nav";

function PoliciesBody() {
  const params = useParams();
  const router = useRouter();
  const searchParams = useSearchParams();
  const subjectId = String(params.subjectId ?? "ite-14");
  const subject = useLiveSubject(subjectId);
  const forceEmpty = searchParams.get("empty") === "1";
  const classPolicies = parsePoliciesDoc(subject.detail?.policies).classPolicies;
  const saved = classPolicies.trim();
  const body = subject.live
    ? saved
    : saved || goldenSyncSeed.activeSubject.policiesBlurb;
  const showEmpty = forceEmpty || (subject.live && !body);
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
        activeId="policies"
        activeSubjectId={subject.id}
        subjectCode={subject.code}
        subjectTitle={subject.title}
        onToggleCollapse={() => setCollapsed((c) => !c)}
        onNav={handleNav}
        topBar={{
          title: "Class Policies",
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
          {showEmpty ? (
            <EmptyModulePanel subjectId={subject.id} />
          ) : (
            <>
              <p className="text-caption text-text-muted">
                Read-only (from your saved syllabus)
              </p>
              <Card title="Class policies" hasHeader className="w-full">
                <p className="text-body-sm text-text-secondary">{body}</p>
              </Card>
            </>
          )}
        </div>
      </AppShell>
      <MobileDrawer
        open={drawerOpen}
        subjectSelected
        activeId="policies"
        activeSubjectId={subject.id}
        subjectCode={subject.code}
        subjectTitle={subject.title}
        onClose={() => setDrawerOpen(false)}
        onNav={handleNav}
      />
    </>
  );
}

export default function PoliciesPage() {
  return (
    <React.Suspense
      fallback={
        <div className="flex min-h-screen items-center justify-center bg-bg-base text-text-muted">
          Loading…
        </div>
      }
    >
      <PoliciesBody />
    </React.Suspense>
  );
}
