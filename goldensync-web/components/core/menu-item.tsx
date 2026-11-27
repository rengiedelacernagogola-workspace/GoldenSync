"use client";

// WHAT: One clickable row inside Menu — default, hover, active, disabled looks.
// SCREEN: Notification actions, semester list entries, context menus.
// HOW: button element with focus ring inset per DEC-028.
// KEEP: Use inside Menu for consistent hit area and focus style.
// EDIT: Row height and state colors here.
// RISK: Low

/**
 * MenuItem — one row in Menu / Popover lists (Figma `26:166`, UI-032).
 * Default|Hover|Active|Disabled. Focus uses inset border-focus (DEC-028).
 */

import * as React from "react";

import { cn } from "@/lib/utils";

export interface MenuItemProps
  extends Omit<React.ButtonHTMLAttributes<HTMLButtonElement>, "children"> {
  label: string;
  icon?: React.ReactNode;
  selected?: boolean;
  destructive?: boolean;
}

/** List row action — used by subject switcher Popover and overflow menus. */
export const MenuItem = React.forwardRef<HTMLButtonElement, MenuItemProps>(
  function MenuItem(
    {
      className,
      label,
      icon,
      selected = false,
      destructive = false,
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
        role="menuitem"
        disabled={disabled}
        data-slot="gs-menu-item"
        data-selected={selected ? "true" : undefined}
        className={cn(
          "relative flex w-full items-center gap-space-2 rounded-md px-space-3 py-space-2",
          "text-left text-body-sm outline-none transition-colors duration-150 ease-out",
          "hover:bg-surface-glass focus-visible:border-2 focus-visible:border-border-focus",
          selected && "bg-accent-glass-bg text-text-primary",
          !selected && !destructive && "text-text-secondary",
          destructive && "text-status-error",
          disabled && "pointer-events-none opacity-40",
          className,
        )}
        {...props}
      >
        {icon ? (
          <span className="flex size-4 shrink-0 items-center justify-center [&_svg]:size-4">
            {icon}
          </span>
        ) : null}
        <span className="min-w-0 flex-1 truncate">{label}</span>
      </button>
    );
  },
);
