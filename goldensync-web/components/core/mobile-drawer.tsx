"use client";

/**
 * MobileDrawer — full-height nav sheet (Figma Drawer M `101:10669`, UI-052).
 * FLOW: TopBar menu → Backdrop + Sidebar Drawer. Close X / Backdrop dismiss.
 */

import * as React from "react";

import { Backdrop } from "@/components/core/backdrop";
import {
  Sidebar,
  type SidebarActiveId,
} from "@/components/core/sidebar";
import { cn } from "@/lib/utils";

export interface MobileDrawerProps {
  open?: boolean;
  subjectSelected?: boolean;
  activeId?: SidebarActiveId;
  subjectCode?: string;
  subjectTitle?: string;
  switcherOpen?: boolean;
  onClose?: () => void;
  onNav?: (id: SidebarActiveId) => void;
  onSwitcherClick?: () => void;
  className?: string;
}

/**
 * Mobile/tablet nav overlay — render beside AppShell; open from TopBar menu.
 */
export function MobileDrawer({
  open = false,
  subjectSelected = true,
  activeId = "home",
  subjectCode,
  subjectTitle,
  switcherOpen,
  onClose,
  onNav,
  onSwitcherClick,
  className,
}: MobileDrawerProps) {
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
    </div>
  );
}
