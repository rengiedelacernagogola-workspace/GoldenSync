"use client";

/**
 * MobileDrawer — full-height nav sheet (Figma Drawer M `101:10669`, UI-052).
 * FLOW: TopBar menu → Backdrop + Sidebar Drawer. Close X / Backdrop dismiss.
 * Subject switcher uses the same live list + navigate-on-select as AppShell.
 */

import * as React from "react";

import { Backdrop } from "@/components/core/backdrop";
import {
  Sidebar,
  type SidebarActiveId,
} from "@/components/core/sidebar";
import { SubjectSwitcherPopover } from "@/components/core/subject-switcher-popover";
import { useSubjectSwitcherControls } from "@/hooks/use-subject-switcher";
import { cn } from "@/lib/utils";

export interface MobileDrawerProps {
  open?: boolean;
  subjectSelected?: boolean;
  activeId?: SidebarActiveId;
  activeSubjectId?: string | null;
  subjectCode?: string;
  subjectTitle?: string;
  switcherOpen?: boolean;
  onClose?: () => void;
  onNav?: (id: SidebarActiveId) => void;
  onSwitcherClick?: () => void;
  switcherEnabled?: boolean;
  className?: string;
}

/**
 * Mobile/tablet nav overlay — render beside AppShell; open from TopBar menu.
 */
export function MobileDrawer({
  open = false,
  subjectSelected = true,
  activeId = "home",
  activeSubjectId = null,
  subjectCode,
  subjectTitle,
  switcherOpen: switcherOpenProp,
  onClose,
  onNav,
  onSwitcherClick: onSwitcherClickProp,
  switcherEnabled = true,
  className,
}: MobileDrawerProps) {
  const switcher = useSubjectSwitcherControls({
    activeId,
    enabled: switcherEnabled && subjectSelected,
  });

  const switcherOpen = switcherOpenProp ?? switcher.switcherOpen;
  const onSwitcherClick = onSwitcherClickProp ?? switcher.onSwitcherClick;

  if (!open) return null;

  return (
    <div
      data-slot="gs-mobile-drawer"
      className={cn("fixed inset-0 z-50 md:hidden", className)}
    >
      <Backdrop onDismiss={onClose} className="z-50" />
      <Sidebar
        variant="Drawer"
        subjectSelected={subjectSelected}
        activeId={activeId}
        subjectCode={subjectCode}
        subjectTitle={subjectTitle}
        switcherOpen={switcherOpen}
        onCloseDrawer={onClose}
        onNav={(id) => {
          /* Navigate first; defer close so soft nav is not cancelled by unmount. */
          onNav?.(id);
          window.setTimeout(() => onClose?.(), 0);
        }}
        onSwitcherClick={onSwitcherClick}
        className={cn(
          "absolute inset-y-0 left-0 z-50 h-full w-full max-w-[375px]",
          "gs-overlay-in",
        )}
      />
      {switcherOpen ? (
        <div className="absolute top-[120px] left-4 z-[60] max-w-[calc(100%-2rem)]">
          <SubjectSwitcherPopover
            items={switcher.items}
            activeId={activeSubjectId}
            empty={switcher.items.length === 0}
            onSubjectSelect={(id) => {
              switcher.onSubjectSelect(String(id));
              window.setTimeout(() => onClose?.(), 0);
            }}
          />
        </div>
      ) : null}
    </div>
  );
}
