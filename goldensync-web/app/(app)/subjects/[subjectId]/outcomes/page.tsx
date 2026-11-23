"use client";

/**
 * Outcomes — Outcome map card + CO hover (Figma `129:272` / Hover `129:446`, UI-091).
 * FLOW: Sidebar Outcomes → hover CO lights linked PO + I/E/D (150 ms).
 * Live subjects load outcomes + OutcomeLink from API; demo keeps seed defaults.
 */

import { useParams, useRouter, useSearchParams } from "next/navigation";
import * as React from "react";

import {
  AppShell,
  Card,
  MobileDrawer,
  OutcomeMap,
  type OutcomeMapHighlight,
  type OutcomeMapLink,
  type OutcomeMapNode,
  type SidebarActiveId,
} from "@/components/core";
import { EmptyModulePanel } from "@/components/features/modules/empty-module-panel";
import { useLiveSubject } from "@/hooks/use-live-subject";
import { fetchOutcomeLinks } from "@/lib/api/outcome-links";
import { pathForNav } from "@/lib/nav";

function Body() {
  const params = useParams();
  const router = useRouter();
  const searchParams = useSearchParams();
  const subjectId = String(params.subjectId ?? "ite-14");
  const subject = useLiveSubject(subjectId);
  const isEmpty = searchParams.get("empty") === "1";
  const [collapsed, setCollapsed] = React.useState(false);
  const [drawerOpen, setDrawerOpen] = React.useState(false);
  const [highlight, setHighlight] =
    React.useState<OutcomeMapHighlight>("None");
  const [peos, setPeos] = React.useState<OutcomeMapNode[] | undefined>();
  const [pos, setPos] = React.useState<OutcomeMapNode[] | undefined>();
  const [cos, setCos] = React.useState<OutcomeMapNode[] | undefined>();
  const [links, setLinks] = React.useState<OutcomeMapLink[] | undefined>();

  React.useEffect(() => {
    if (!subject.live || !subject.detail) {
      const handle = window.setTimeout(() => {
        setPeos(undefined);
        setPos(undefined);
        setCos(undefined);
        setLinks(undefined);
      }, 0);
      return () => window.clearTimeout(handle);
    }

    let cancelled = false;
    const detail = subject.detail;
    const handle = window.setTimeout(() => {
      void (async () => {
        const outcomes = detail.outcomes ?? [];
        const nextPeos = outcomes
          .filter((o) => o.kind === "PEO")
          .sort((a, b) => a.position - b.position)
          .map((o) => ({
            id: o.code,
            label: o.code,
            description: o.description,
          }));
        const nextPos = outcomes
          .filter((o) => o.kind === "PO")
          .sort((a, b) => a.position - b.position)
          .map((o) => ({
            id: o.code,
            label: o.code,
            description: o.description,
          }));
        const nextCos = outcomes
          .filter((o) => o.kind === "CO")
          .sort((a, b) => a.position - b.position)
          .map((o) => ({
            id: o.code,
            label: o.code,
            description: o.description,
          }));

        const byId = new Map(outcomes.map((o) => [o.id, o]));
        let nextLinks: OutcomeMapLink[] = [];
        try {
          const rows = await fetchOutcomeLinks(subject.id);
          nextLinks = rows
            .map((l) => {
              const co = byId.get(l.coId);
              const po = byId.get(l.poId);
              if (!co || !po) return null;
              return {
                from: co.code,
                to: po.code,
                level: l.level,
              } satisfies OutcomeMapLink;
            })
            .filter((x): x is OutcomeMapLink => x != null);
        } catch {
          nextLinks = [];
        }

        if (cancelled) return;
        setPeos(nextPeos.length > 0 ? nextPeos : undefined);
        setPos(nextPos.length > 0 ? nextPos : undefined);
        setCos(nextCos.length > 0 ? nextCos : undefined);
        setLinks(nextLinks.length > 0 ? nextLinks : undefined);
      })();
    }, 0);

    return () => {
      cancelled = true;
      window.clearTimeout(handle);
    };
  }, [subject.live, subject.id, subject.detail]);

  function handleNav(id: SidebarActiveId) {
    const path = pathForNav(id, subject.id);
    if (path) router.push(path);
  }

  return (
    <>
      <AppShell
        sidebarVariant={collapsed ? "Collapsed" : "Expanded"}
        subjectSelected
        activeId="outcomes"
        activeSubjectId={subject.id}
        subjectCode={subject.code}
        subjectTitle={subject.title}
        onToggleCollapse={() => setCollapsed((c) => !c)}
        onNav={handleNav}
        topBar={{
          title: "Outcomes",
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
          ) : (
            <Card
              title="Outcome map"
              hasHeader
              className="w-full max-w-full md:w-1/2 md:max-w-[50%]"
            >
              <OutcomeMap
                highlight={highlight}
                onHighlightChange={setHighlight}
                peos={peos}
                pos={pos}
                cos={cos}
                links={links}
              />
            </Card>
          )}
        </div>
      </AppShell>
      <MobileDrawer
        open={drawerOpen}
        subjectSelected
        activeId="outcomes"
        activeSubjectId={subject.id}
        subjectCode={subject.code}
        subjectTitle={subject.title}
        onClose={() => setDrawerOpen(false)}
        onNav={handleNav}
      />
    </>
  );
}

export default function OutcomesPage() {
  return (
    <React.Suspense
      fallback={
        <div className="flex min-h-screen items-center justify-center bg-bg-base text-text-muted">
          Loading…
        </div>
      }
    >
      <Body />
    </React.Suspense>
  );
}
