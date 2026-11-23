"use client";

/**
 * AppShell — authenticated layout (Figma P2 Dashboard shell, UI-051).
 * FLOW: Sidebar Expanded|Collapsed (md+) + TopBar + main. MobileDrawer is separate.
 * RULE: Expanded 240 / Collapsed 64 (Figma); ambient bg on outer.
 */

import * as React from "react";

import {
  Sidebar,
  type SidebarActiveId,
  type SidebarVariant,
} from "@/components/core/sidebar";
import { TopBar, type TopBarProps } from "@/components/core/top-bar";
import { cn } from "@/lib/utils";

export interface AppShellProps extends React.HTMLAttributes<HTMLDivElement> {
  sidebarVariant?: Exclude<SidebarVariant, "Drawer">;
  subjectSelected?: boolean;
  activeId?: SidebarActiveId;
  subjectCode?: string;
  subjectTitle?: string;
  switcherOpen?: boolean;
  topBar?: TopBarProps;
  onToggleCollapse?: () => void;
  onNav?: (id: SidebarActiveId) => void;
  onSwitcherClick?: () => void;
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
  subjectCode,
  subjectTitle,
  switcherOpen,
  topBar,
  onToggleCollapse,
  onNav,
  onSwitcherClick,
  ...props
}: AppShellProps) {
  return (
    <div
      data-slot="gs-app-shell"
      data-sidebar={sidebarVariant}
      className={cn(
        "bg-ambient relative flex min-h-screen w-full items-stretch bg-bg-base",
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
        className="sticky top-0 hidden h-screen shrink-0 md:flex"
      />

      <div className="flex min-h-screen min-w-0 flex-1 flex-col">
        <TopBar
          {...topBar}
          /* Menu button only below md — drawer owns nav on phone */
          showMenuButton
          className={cn(
            "[&_[data-slot=gs-top-bar-menu]]:md:hidden",
            topBar?.className,
          )}
        />
        <main
          data-slot="gs-app-shell-main"
          className="flex flex-1 flex-col gap-space-12 overflow-auto px-space-4 pt-space-6 pb-space-12 sm:px-space-8 sm:pt-space-6"
        >
          {children}
        </main>
      </div>
    </div>
  );
}
