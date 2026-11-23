"use client";

/**
 * SemesterPicker — top-bar semester trigger (Figma `33:80`, UI-041).
 * FLOW: Dashboard/Top bar → opens Popover Content=SemesterList. Active = open.
 */

import { CalendarDays, ChevronsUpDown } from "lucide-react";
import * as React from "react";

import { cn } from "@/lib/utils";

export interface SemesterPickerProps
  extends Omit<React.ButtonHTMLAttributes<HTMLButtonElement>, "children"> {
  label?: string;
  /** Open popover state (Figma Active). */
  open?: boolean;
}

/**
 * Semester select trigger — parent owns open + list (Menu/Popover).
 * Disabled uses opacity-40 + bg-subtle (plan EmptySubjects).
 */
export function SemesterPicker({
  className,
  label = "1st Semester AY 2026–2027",
  open = false,
  disabled = false,
  type = "button",
  ...props
}: SemesterPickerProps) {
  return (
    <button
      type={type}
      disabled={disabled}
      aria-haspopup="listbox"
      aria-expanded={open}
      data-slot="gs-semester-picker"
      data-state={open ? "open" : "closed"}
      className={cn(
        "inline-flex min-h-11 w-[280px] max-w-full items-center gap-space-2",
        "rounded-md border px-space-3 py-space-2 outline-none",
        "transition-[background-color,border-color,opacity] duration-150 ease-out",
        "text-body-sm font-medium text-text-primary",
        "focus-visible:border-2 focus-visible:border-border-focus",
        disabled
          ? "cursor-not-allowed border-border-default bg-bg-subtle opacity-40"
          : open
            ? "border-accent-glass-border bg-accent-glass-bg"
            : "border-border-default bg-bg-subtle hover:border-border-strong hover:bg-bg-muted",
        className,
      )}
      {...props}
    >
      <CalendarDays
        aria-hidden
        className="size-4 shrink-0 text-text-secondary"
        strokeWidth={1.75}
      />
      <span className="min-w-0 flex-1 truncate text-left">{label}</span>
      <ChevronsUpDown
        aria-hidden
        className="size-4 shrink-0 text-text-muted"
        strokeWidth={1.75}
      />
    </button>
  );
}
