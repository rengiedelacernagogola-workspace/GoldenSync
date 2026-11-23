"use client";

/**
 * ModuleStub — empty / blurb module pages (Grading, Policies, Faculty, Plan, Export).
 * FLOW: Sidebar → module. Empty uses appendixA.modules.emptyModule when no content.
 */

import { useParams, useRouter } from "next/navigation";
import * as React from "react";

import {
  AppShell,
  EmptyState,
  MobileDrawer,
  type SidebarActiveId,
} from "@/components/core";
import { appendixA } from "@/copy";
import { goldenSyncSeed } from "@/data/seed";
import { pathForNav } from "@/lib/nav";

export interface ModuleStubProps {
  activeId: SidebarActiveId;
  title: string;
  /** When set, show blurb instead of empty module copy. */
  blurb?: string;
}

/** Shared shell for thin module screens. */
export function ModuleStub({ activeId, title, blurb }: ModuleStubProps) {
  const params = useParams();
  const router = useRouter();
  const subjectId = String(params.subjectId ?? "ite-14");
  const card =
    goldenSyncSeed.subjects.find((s) => s.id === subjectId) ??
    goldenSyncSeed.subjects[0]!;
  const [collapsed, setCollapsed] = React.useState(false);
  const [drawerOpen, setDrawerOpen] = React.useState(false);

  function handleNav(id: SidebarActiveId) {
    const path = pathForNav(id, card.id);
    if (path) router.push(path);
  }

  return (
    <>
      <AppShell
        sidebarVariant={collapsed ? "Collapsed" : "Expanded"}
        subjectSelected
        activeId={activeId}
        subjectCode={card.code}
        subjectTitle={card.title}
        onToggleCollapse={() => setCollapsed((c) => !c)}
        onNav={handleNav}
        topBar={{
          title,
          semesterLabel: goldenSyncSeed.semester.label,
          hideAddSubject: true,
          onMenuClick: () => setDrawerOpen(true),
        }}
      >
        {blurb ? (
          <p className="max-w-2xl text-body-sm text-text-secondary">{blurb}</p>
        ) : (
          <EmptyState
            title={appendixA.modules.emptyModule}
            body="Edit subject to add it."
            actionLabel="Edit subject"
            hasAction={false}
          />
        )}
      </AppShell>
      <MobileDrawer
        open={drawerOpen}
        subjectSelected
        activeId={activeId}
        subjectCode={card.code}
        subjectTitle={card.title}
        onClose={() => setDrawerOpen(false)}
        onNav={handleNav}
      />
    </>
  );
}

/** Suspense wrapper for ModuleStub pages. */
export function ModuleStubPage(props: ModuleStubProps) {
  return (
    <React.Suspense
      fallback={
        <div className="flex min-h-screen items-center justify-center bg-bg-base text-text-muted">
          Loading…
        </div>
      }
    >
      <ModuleStub {...props} />
    </React.Suspense>
  );
}
