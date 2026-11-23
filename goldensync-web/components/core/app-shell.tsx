"use client";

/**
 * AppShell — authenticated layout (Figma P2 Dashboard shell, UI-051).
 * FLOW: Sidebar Expanded|Collapsed (md+) + TopBar + main. MobileDrawer is separate.
 * RULE: Expanded 240 / Collapsed 64 (Figma); ambient bg on outer.
 * Subject switcher lists live subjects and navigates to the same module on select.
 */

import * as React from "react";

import {
  Sidebar,
  type SidebarActiveId,
  type SidebarVariant,
} from "@/components/core/sidebar";
import { SubjectSwitcherPopover } from "@/components/core/subject-switcher-popover";
import { TopBar, type TopBarProps } from "@/components/core/top-bar";
import { useSubjectSwitcherControls } from "@/hooks/use-subject-switcher";
import { cn } from "@/lib/utils";

export interface AppShellProps extends React.HTMLAttributes<HTMLDivElement> {
  sidebarVariant?: Exclude<SidebarVariant, "Drawer">;
  subjectSelected?: boolean;
  activeId?: SidebarActiveId;
  /** Current subject id for the switcher checkmark. */
  activeSubjectId?: string | null;
  subjectCode?: string;
  subjectTitle?: string;
  /** Override internal open state (rare). Prefer leaving unset. */
  switcherOpen?: boolean;
  topBar?: TopBarProps;
  onToggleCollapse?: () => void;
  onNav?: (id: SidebarActiveId) => void;
  onSwitcherClick?: () => void;
  /** When false, switcher trigger stays disabled (e.g. empty dashboard). */
  switcherEnabled?: boolean;
}

/**
 * Desktop shell — wrap page body as children; pair MobileDrawer on small screens.
 */
export function AppShell({
  className,
  children,
  sidebarVariant = "Expanded",
  subjectSelected = true,
  activeId = "home",
  activeSubjectId = null,
  subjectCode,
  subjectTitle,
  switcherOpen: switcherOpenProp,
  topBar,
  onToggleCollapse,
  onNav,
  onSwitcherClick: onSwitcherClickProp,
  switcherEnabled = true,
  ...props
}: AppShellProps) {
  const switcher = useSubjectSwitcherControls({
    activeId,
    enabled: switcherEnabled && subjectSelected,
  });

  const switcherOpen = switcherOpenProp ?? switcher.switcherOpen;
  const onSwitcherClick = onSwitcherClickProp ?? switcher.onSwitcherClick;

  return (
    <div
      data-slot="gs-app-shell"
      data-sidebar={sidebarVariant}
      className={cn(
        "bg-ambient relative flex min-h-dvh w-full min-w-0 items-stretch overflow-x-hidden bg-bg-base",
        className,
      )}
      {...props}
    >
      <Sidebar
        variant={sidebarVariant}
        subjectSelected={subjectSelected}
        activeId={activeId}
        subjectCode={subjectCode}
        subjectTitle={subjectTitle}
        switcherOpen={switcherOpen}
        onToggleCollapse={onToggleCollapse}
        onNav={onNav}
        onSwitcherClick={onSwitcherClick}
        className="sticky top-0 hidden h-dvh shrink-0 md:flex"
      />

      {switcherOpen ? (
        <div className="absolute top-[120px] left-4 z-30 hidden md:block">
          <SubjectSwitcherPopover
            items={switcher.items}
            activeId={activeSubjectId}
            empty={switcher.items.length === 0}
            onSubjectSelect={(id) => switcher.onSubjectSelect(String(id))}
          />
        </div>
      ) : null}

      <div className="flex min-h-dvh min-w-0 flex-1 flex-col overflow-x-hidden">
        <TopBar
          {...topBar}
          /* Menu button only below md — drawer owns nav on phone */
          showMenuButton
          className={cn(
            "sticky top-0 z-20 bg-bg-base/80 backdrop-blur-md [&_[data-slot=gs-top-bar-menu]]:md:hidden",
            topBar?.className,
          )}
        />
        <main
          data-slot="gs-app-shell-main"
          className="flex min-w-0 flex-1 flex-col gap-space-8 overflow-x-hidden overflow-y-auto px-space-3 pt-space-4 pb-space-10 sm:gap-space-10 sm:px-space-6 sm:pt-space-6 sm:pb-space-12 lg:gap-space-12 lg:px-space-8"
        >
          {children}
        </main>
      </div>
    </div>
  );
}
