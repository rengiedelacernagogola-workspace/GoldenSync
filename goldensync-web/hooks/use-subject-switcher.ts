"use client";

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
export function pathForSubjectSwitch(
  activeId: SidebarActiveId,
  subjectId: string,
): string {
  if (activeId === "home" || activeId === "account" || activeId === "logout") {
    return `/subjects/${subjectId}/overview`;
  }
  return pathForNav(activeId, subjectId) ?? `/subjects/${subjectId}/overview`;
}

/** Live or seed items for the subject popover. */
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
