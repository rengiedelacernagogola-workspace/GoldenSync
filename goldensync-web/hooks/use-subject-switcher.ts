"use client";

// WHAT: Subject popover data + navigation when user picks another subject.
// HOW: useLiveData subjects when signed in with semesters; else goldenSyncSeed list.
// SCREEN: Subject switcher in sidebar / mobile drawer — same module, new subject.
// EDIT: pathForSubjectSwitch rules for which page to open. RISK: Medium — wrong path confuses navigation.

/**
 * Shared subject-switcher list + navigate-on-select for AppShell / MobileDrawer.
 */

import { useRouter } from "next/navigation";
import * as React from "react";

import type { SidebarActiveId } from "@/components/core/sidebar";
import type { SubjectSwitcherItem } from "@/components/core/subject-switcher-popover";
import { goldenSyncSeed } from "@/data/seed";
import { useLiveData } from "@/hooks/use-live-data";
import { pathForNav } from "@/lib/nav";

/** Resolve path when picking a subject from the switcher. */
// WHAT: URL to open after switch — keeps user on same module (plan, notes, etc.) when possible.
export function pathForSubjectSwitch(
  activeId: SidebarActiveId,
  subjectId: string,
): string {
  if (
    activeId === "home" ||
    activeId === "account" ||
    activeId === "logout" ||
    activeId === "my-schedule"
  ) {
    // WHAT: Global hubs stay put; subject switch only updates shell context.
    if (activeId === "my-schedule") return "/my-schedule";
    return `/subjects/${subjectId}/overview`;
  }
  return pathForNav(activeId, subjectId) ?? `/subjects/${subjectId}/overview`;
}

/** Live or seed items for the subject popover. */
// WHAT: Builds {id, code, title} rows for the popover list.
export function useSubjectSwitcherItems(): {
  items: SubjectSwitcherItem[];
  live: boolean;
} {
  const live = useLiveData();
  const useLiveSubjects = live.signedIn && live.semesters.length > 0;

  const items = React.useMemo<SubjectSwitcherItem[]>(() => {
    if (useLiveSubjects) {
      return live.subjects.map((s) => ({
        id: s.id,
        code: s.courseCode,
        title: s.title,
      }));
    }
    return goldenSyncSeed.subjects.map((s) => ({
      id: s.id,
      code: s.code,
      title: s.title,
    }));
  }, [useLiveSubjects, live.subjects]);

  return { items, live: useLiveSubjects };
}

/** Open state + select handler that navigates to the same module for the new subject. */
// WHAT: Wires open/close, click handler, and router.push on select. SCREEN: AppShell passes activeId (current sidebar module).
export function useSubjectSwitcherControls(opts: {
  activeId: SidebarActiveId;
  enabled?: boolean;
}) {
  const router = useRouter();
  const { items, live } = useSubjectSwitcherItems();
  const [switcherOpen, setSwitcherOpen] = React.useState(false);
  const enabled = opts.enabled !== false;

  const onSwitcherClick = React.useCallback(() => {
    if (!enabled) return;
    setSwitcherOpen((o) => !o);
  }, [enabled]);

  const onSubjectSelect = React.useCallback(
    (id: string) => {
      setSwitcherOpen(false);
      const path = pathForSubjectSwitch(opts.activeId, String(id));
      router.push(path);
    },
    [opts.activeId, router],
  );

  const closeSwitcher = React.useCallback(() => setSwitcherOpen(false), []);

  return {
    items,
    live,
    switcherOpen: enabled ? switcherOpen : false,
    onSwitcherClick: enabled ? onSwitcherClick : undefined,
    onSubjectSelect,
    closeSwitcher,
    setSwitcherOpen,
  };
}
