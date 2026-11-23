/**
 * Tooltip — collapsed NavItem label helper (Figma `25:585`, UI-028).
 * Solid bg-overlay + border-strong · caption · max 240. No glass.
 */

import * as React from "react";

import { cn } from "@/lib/utils";

export interface TooltipProps extends React.HTMLAttributes<HTMLDivElement> {
  text?: string;
}

/** Plain tooltip bubble — host positions next to the trigger. */
export function Tooltip({
  className,
  text = "Learning Plan",
  ...props
}: TooltipProps) {
  return (
    <div
      role="tooltip"
      data-slot="gs-tooltip"
      className={cn(
        "max-w-[240px] rounded-md border border-border-strong bg-bg-overlay px-space-2 py-space-1",
        "text-caption text-text-primary",
        className,
      )}
      {...props}
    >
      {text}
    </div>
  );
}
