// WHAT: Horizontal bar showing 0–100% completion.
// SCREEN: Checklist headers and anywhere a thin/thick bar is needed.
// HOW: Inner fill width = value%; track uses flex (DEC-034).
// KEEP: Pass value from parent; sizes 4px or 8px height only.
// EDIT: Track/fill colors here.
// RISK: Low

/**
 * ProgressBar — determinate bar (Figma `27:27`, UI-033).
 * Size 4|8. Value 0–100. Fill uses flex track (DEC-034). Checklist uses Size 8.
 */

import * as React from "react";

import { cn } from "@/lib/utils";

export type ProgressBarSize = 4 | 8;

export interface ProgressBarProps extends React.HTMLAttributes<HTMLDivElement> {
  value?: number;
  size?: ProgressBarSize;
}

/** Clamps value 0–100 and paints the accent fill. */
export function ProgressBar({
  className,
  value = 0,
  size = 8,
  ...props
}: ProgressBarProps) {
  const clamped = Math.max(0, Math.min(100, value));

  return (
    <div
      role="progressbar"
      aria-valuenow={clamped}
      aria-valuemin={0}
      aria-valuemax={100}
      data-slot="gs-progress-bar"
      data-size={size}
      className={cn(
        "flex w-full overflow-hidden rounded-full bg-bg-subtle",
        size === 4 ? "h-1" : "h-2",
        className,
      )}
      {...props}
    >
      <div
        data-slot="gs-progress-bar-fill"
        className="gs-progress-fill h-full rounded-full bg-accent-primary"
        style={{ width: `${clamped}%` }}
      />
    </div>
  );
}
