"use client";

/**
 * Backdrop — dim layer under Modal / Drawer (Figma `24:509`, UI-025).
 * RULE: bg-base via layer opacity (DEC-041) — never paint-opacity on a bound color.
 * 75% keeps floating panels readable above dashboard content.
 */

import * as React from "react";

import { cn } from "@/lib/utils";

export interface BackdropProps extends React.HTMLAttributes<HTMLDivElement> {
  /** Click outside closes overlays (plan motion). */
  onDismiss?: () => void;
}

/** Full-viewport dim; pair with Modal. Escape handled by Modal host. */
export function Backdrop({ className, onDismiss, onClick, ...props }: BackdropProps) {
  return (
    <div
      data-slot="gs-backdrop"
      aria-hidden
      className={cn("fixed inset-0 z-40", className)}
      /* DEC-041: layer opacity via color-mix — never paint-opacity on a bound token */
      style={{
        backgroundColor:
          "color-mix(in srgb, var(--bg-base) 80%, transparent)",
      }}
      onClick={(e) => {
        onClick?.(e);
        onDismiss?.();
      }}
      {...props}
    />
  );
}
