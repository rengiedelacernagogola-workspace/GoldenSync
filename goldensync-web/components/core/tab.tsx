"use client";

// WHAT: Single tab button (icon + label) with active underline for tablists.
// SCREEN: Used inside core Tabs — Upload PDF / Enter manually.
// HOW: role="tab", aria-selected; parent Tabs owns which tab is selected.
// KEEP: Do not use alone on pages — prefer Tabs wrapper for a11y.
// EDIT: Active underline and typography here.
// RISK: Low

/**
 * Tab — one Add Subject mode tab (Figma `22:453`, UI-023).
 * Active = text-primary + 2px accent underline. Used inside Tabs for Upload PDF / Enter manually.
 */

import * as React from "react";

import { cn } from "@/lib/utils";

export interface TabProps
  extends Omit<React.ButtonHTMLAttributes<HTMLButtonElement>, "children"> {
  label: string;
  icon?: React.ReactNode;
  hasIcon?: boolean;
  selected?: boolean;
}

/** Single tab button; parent Tabs owns selection state. */
export const Tab = React.forwardRef<HTMLButtonElement, TabProps>(
  function Tab(
    {
      className,
      label,
      icon,
      hasIcon = true,
      selected = false,
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
        role="tab"
        aria-selected={selected}
        disabled={disabled}
        data-slot="gs-tab"
        data-state={selected ? "Active" : "Default"}
        className={cn(
          "relative flex h-11 shrink-0 items-center gap-space-2 overflow-hidden rounded-md px-space-4",
          "text-body-sm font-medium whitespace-nowrap outline-none",
          "transition-[color,background-color] duration-150 ease-out",
          "focus-visible:focus-ring",
          selected
            ? "text-text-primary [&_svg]:text-accent-primary"
            : "text-text-muted [&_svg]:text-text-muted hover:text-text-secondary",
          disabled && "pointer-events-none text-text-disabled [&_svg]:text-text-disabled",
          className,
        )}
        {...props}
      >
        {hasIcon && icon ? (
          <span className="relative flex size-4 shrink-0 items-center justify-center [&_svg]:size-4">
            {icon}
          </span>
        ) : null}
        <span>{label}</span>
        {selected && !disabled ? (
          <span
            aria-hidden
            data-slot="gs-tab-underline"
            className="absolute right-0 bottom-0 left-0 h-0.5 bg-accent-primary"
          />
        ) : null}
      </button>
    );
  },
);
