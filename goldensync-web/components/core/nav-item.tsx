"use client";

/**
 * NavItem — one sidebar link (Figma `19:222`, UI-021).
 * Edit Active look here (glass-accent + right bar). Disable/enable from Sidebar via `disabled` + Proto `subjectSelected`.
 */

import { LayoutDashboard } from "lucide-react";
import * as React from "react";

import { cn } from "@/lib/utils";

export interface NavItemProps
  extends Omit<React.ButtonHTMLAttributes<HTMLButtonElement>, "children"> {
  label?: string;
  icon?: React.ReactNode;
  /** Figma Collapsed=True — icon only; label via aria-label / Tooltip later. */
  collapsed?: boolean;
  /** Current page (Active state). */
  active?: boolean;
}

/** Renders a nav button; collapsed shows icon only (Tooltip later). */
export const NavItem = React.forwardRef<HTMLButtonElement, NavItemProps>(
  function NavItem(
    {
      className,
      label = "Home",
      icon,
      collapsed = false,
      active = false,
      disabled = false,
      type = "button",
      ...props
    },
    ref,
  ) {
    const iconNode = icon ?? (
      <LayoutDashboard className="size-5" aria-hidden strokeWidth={2} />
    );

    return (
      <button
        ref={ref}
        type={type}
        data-slot="gs-nav-item"
        data-collapsed={collapsed ? "true" : undefined}
        data-active={active ? "true" : undefined}
        disabled={disabled}
        aria-current={active ? "page" : undefined}
        aria-label={collapsed ? label : undefined}
        aria-disabled={disabled || undefined}
        className={cn(
          "relative flex items-center gap-space-2 rounded-md px-space-2.5",
          "text-[11px] leading-snug font-medium tracking-tight antialiased",
          "transition-[background-color,border-color,color] duration-150 ease-out",
          "outline-none select-none",
          collapsed
            ? "size-11 shrink-0 justify-center px-0"
            : "w-full min-h-8 justify-start py-space-1",
          /* Default */
          !active &&
            !disabled &&
            "text-text-muted [&_svg]:text-text-secondary",
          /* Hover (not active) */
          !active &&
            !disabled &&
            "hover:border hover:border-border-subtle hover:bg-surface-glass hover:text-text-primary",
          /* Active — glass-accent colors, no blur (DEC-018 / C10) */
          active &&
            !disabled &&
            "border border-accent-glass-border bg-accent-glass-bg text-text-primary [&_svg]:text-accent-primary",
          /* Focus inset ring inside sidebar clip */
          "focus-visible:border-2 focus-visible:border-border-focus focus-visible:bg-surface-glass",
          /* Disabled */
          disabled &&
            "pointer-events-none text-text-disabled [&_svg]:text-text-disabled",
          className,
        )}
        {...props}
      >
        <span className="relative flex size-5 shrink-0 items-center justify-center [&_svg]:size-5">
          {iconNode}
        </span>
        {!collapsed ? (
          <span className="min-w-0 flex-1 overflow-hidden text-left text-[11px] leading-snug tracking-tight text-ellipsis [display:-webkit-box] [-webkit-box-orient:vertical] [-webkit-line-clamp:2]">
            {label}
          </span>
        ) : null}
        {active && !disabled ? (
          <span
            aria-hidden
            data-slot="gs-nav-item-active-indicator"
            className="absolute top-1/2 left-0 h-4 w-0.5 -translate-y-1/2 rounded-full bg-accent-primary"
          />
        ) : null}
      </button>
    );
  },
);
