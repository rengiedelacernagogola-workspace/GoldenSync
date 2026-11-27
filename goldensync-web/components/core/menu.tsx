// WHAT: Container panel for a vertical list of MenuItem rows.
// SCREEN: Dropdown lists, popover content shells (notifications, semester list).
// HOW: Solid overlay surface; children are MenuItem components.
// KEEP: Positioning handled by parent popover — Menu is layout only.
// EDIT: Padding and border tokens here.
// RISK: Low

/**
 * Menu — floating list shell (Figma `26:238`, UI-032).
 * Solid overlay surface; put MenuItem children inside. Popover uses the same shell.
 */

import * as React from "react";

import { cn } from "@/lib/utils";

export interface MenuProps extends React.HTMLAttributes<HTMLDivElement> {
  /** Accessible name for the menu. */
  "aria-label"?: string;
}

/** Menu panel — host positions under the trigger. */
export function Menu({
  className,
  children,
  "aria-label": ariaLabel = "Menu",
  ...props
}: MenuProps) {
  return (
    <div
      role="menu"
      aria-label={ariaLabel}
      data-slot="gs-menu"
      className={cn(
        "flex min-w-[200px] flex-col gap-space-1 rounded-lg border border-border-strong",
        "bg-bg-overlay p-space-1 shadow-hover",
        className,
      )}
      {...props}
    >
      {children}
    </div>
  );
}

/** Alias for subject-switcher / floating panels that share Menu chrome. */
export function Popover(props: MenuProps) {
  return <Menu data-slot="gs-popover" {...props} />;
}
