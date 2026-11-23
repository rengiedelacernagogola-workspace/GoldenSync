"use client";

/**
 * TopBar — page chrome above content (Figma Dashboard Top bar `69:2025`, UI-050).
 * FLOW: title left · notifications · theme · SemesterPicker · Add Subject.
 * RULE: EmptySubjects hides Add Subject in top bar (DEC-049 — CTA only in EmptyState).
 */

import { Menu, Plus } from "lucide-react";
import * as React from "react";

import { Button } from "@/components/core/button";
import { NotificationsMenu } from "@/components/core/notifications-menu";
import { SemesterPicker } from "@/components/core/semester-picker";
import { StreakBadge } from "@/components/core/streak-badge";
import { ThemeToggle } from "@/components/core/theme-toggle";
import { cn } from "@/lib/utils";

export interface TopBarProps extends React.HTMLAttributes<HTMLElement> {
  title?: string;
  semesterLabel?: string;
  semesterOpen?: boolean;
  /** Hide Add Subject (EmptySubjects). */
  hideAddSubject?: boolean;
  /** Module pages keep semester in overline only (DEC-067). */
  hideSemester?: boolean;
  /** Show menu IconOnly for tablet/mobile drawer. */
  showMenuButton?: boolean;
  /** Refresh notifications list after an activity is logged. */
  notificationsRefreshKey?: number;
  onSemesterClick?: () => void;
  onAddSubject?: () => void;
  onMenuClick?: () => void;
}

/**
 * Shell top bar — edit title/actions per page; parent owns semester popover.
 */
export function TopBar({
  className,
  title = "Dashboard",
  semesterLabel = "1st Semester AY 2026–2027",
  semesterOpen = false,
  hideAddSubject = false,
  hideSemester = false,
  showMenuButton = false,
  notificationsRefreshKey = 0,
  onSemesterClick,
  onAddSubject,
  onMenuClick,
  ...props
}: TopBarProps) {
  return (
    <header
      data-slot="gs-top-bar"
      className={cn(
        "relative flex h-14 w-full min-w-0 shrink-0 items-center justify-between gap-space-2",
        "px-space-3 sm:h-16 sm:gap-space-4 sm:px-space-6 lg:px-space-8",
        className,
      )}
      {...props}
    >
      <div className="flex min-w-0 flex-1 items-center gap-space-2 sm:gap-space-3">
        {showMenuButton ? (
          <Button
            variant="IconOnly"
            size="md"
            aria-label="Open navigation"
            data-slot="gs-top-bar-menu"
            onClick={onMenuClick}
            className="shrink-0"
          >
            <Menu className="size-4" />
          </Button>
        ) : null}
        <h1 className="truncate text-heading-xl text-text-primary sm:text-display-sm md:text-display-md">
          {title}
        </h1>
      </div>

      <div className="flex shrink-0 items-center gap-space-1.5 sm:gap-space-3">
        <NotificationsMenu refreshKey={notificationsRefreshKey} />
        <div className="hidden sm:contents">
          <StreakBadge />
        </div>
        <ThemeToggle />
        {!hideSemester ? (
          <SemesterPicker
            label={semesterLabel}
            open={semesterOpen}
            onClick={onSemesterClick}
            className="hidden md:inline-flex"
          />
        ) : null}
        {!hideAddSubject ? (
          <Button
            variant="Primary"
            size="md"
            onClick={onAddSubject}
            className="hidden md:inline-flex"
          >
            <Plus className="size-4" aria-hidden />
            Add Subject
          </Button>
        ) : null}
      </div>
    </header>
  );
}
