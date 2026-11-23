"use client";

/**
 * SubjectSwitcher — opens the subject Popover (Figma `21:209`, UI-022).
 * Edit open/closed visuals here. Popover list + empty copy live with Popover wiring later.
 */

import { ChevronsUpDown } from "lucide-react";
import * as React from "react";

import { cn } from "@/lib/utils";

export interface SubjectSwitcherProps
  extends Omit<React.ButtonHTMLAttributes<HTMLButtonElement>, "children"> {
  code?: string;
  title?: string;
  collapsed?: boolean;
  /** Popover open → Active look. */
  open?: boolean;
}

/** Trigger button for subject list; set `open` when the Popover is showing. */
export const SubjectSwitcher = React.forwardRef<
  HTMLButtonElement,
  SubjectSwitcherProps
>(function SubjectSwitcher(
  {
    className,
    code = "ITE 14",
    title = "Integrative Programming",
    collapsed = false,
    open = false,
    disabled = false,
    type = "button",
    ...props
  },
  ref,
) {
  return (
    <button
      ref={ref}
      type={type}
      data-slot="gs-subject-switcher"
      data-collapsed={collapsed ? "true" : undefined}
      data-open={open ? "true" : undefined}
      disabled={disabled}
      aria-expanded={open}
      aria-haspopup="listbox"
      aria-label={collapsed ? `${code} · ${title}` : undefined}
      className={cn(
        "relative flex items-center rounded-md border border-border-default bg-bg-subtle",
        "transition-[background-color,border-color,opacity] duration-150 ease-out outline-none",
        collapsed
          ? "size-11 shrink-0 justify-center"
          : "h-10 min-h-9 w-full max-w-56 justify-start gap-space-2 px-space-2.5 py-space-1.5",
        !open &&
          !disabled &&
          "hover:border-border-strong hover:bg-bg-muted",
        open &&
          !disabled &&
          "border-accent-glass-border bg-accent-glass-bg",
        "focus-visible:border-2 focus-visible:border-border-focus",
        disabled && "pointer-events-none opacity-40",
        className,
      )}
      {...props}
    >
      {!collapsed ? (
        <span className="flex min-w-0 flex-1 flex-col items-start gap-0 text-left">
          <span className="text-[11px] leading-snug font-semibold tracking-tight antialiased whitespace-nowrap text-text-primary">
            {code}
          </span>
          <span className="w-full truncate text-[10px] leading-snug font-medium tracking-tight antialiased text-text-muted">
            {title}
          </span>
        </span>
      ) : null}
      <ChevronsUpDown
        className={cn(
          "shrink-0 text-text-secondary",
          collapsed ? "size-5" : "size-4",
        )}
        aria-hidden
        strokeWidth={2}
      />
    </button>
  );
});
