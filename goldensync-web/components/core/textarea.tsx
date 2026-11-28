"use client";

// WHAT: Multi-line text control with same border/focus tokens as Input.
// SCREEN: Long answers in forms (notes, descriptions).
// HOW: Native textarea + invalid prop maps to aria-invalid for error glow.
// KEEP: Min height and grow behavior; wrap in FormField for labels.
// EDIT: size Compact (default) = text-ui + light float. RISK: Low

/**
 * Textarea — Figma `Textarea` `11:50`.
 * UI-013: Compact (default) denser shell; Desktop keeps min-height 96 (space-24).
 */

import * as React from "react";

import { compactFloatShellClass } from "@/lib/ui/compact-field";
import { cn } from "@/lib/utils";

export type TextareaSize = "Desktop" | "Compact";

export interface TextareaProps
  extends Omit<React.ComponentProps<"textarea">, "className" | "size"> {
  className?: string;
  /** Sets aria-invalid for Error state styling. */
  invalid?: boolean;
  /** Compact (default) = 11px + light float; Desktop = larger solid shell. */
  size?: TextareaSize;
}

/**
 * GoldenSync Textarea — use under FormField for label / helper / error.
 */
export const Textarea = React.forwardRef<HTMLTextAreaElement, TextareaProps>(
  function Textarea(
    {
      className,
      invalid = false,
      disabled,
      rows = 3,
      size = "Compact",
      ...props
    },
    ref,
  ) {
    const isCompact = size === "Compact";

    return (
      <textarea
        ref={ref}
        data-slot="gs-textarea"
        data-size={size}
        disabled={disabled}
        rows={rows}
        aria-invalid={invalid || undefined}
        className={cn(
          "w-full min-w-0 resize-y overflow-auto rounded-md text-text-primary",
          "placeholder:text-text-muted",
          "transition-[border-color,box-shadow,opacity] duration-150 ease-out",
          "outline-none",
          "focus:border-2 focus:border-border-focus",
          "focus:shadow-[0_0_0_3px_var(--focus-ring-glow)]",
          "aria-invalid:border-status-error",
          "aria-invalid:shadow-[0_0_0_3px_var(--error-ring-glow)]",
          "aria-invalid:focus:border-status-error",
          "disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-50",
          isCompact
            ? cn(
                "min-h-16 border px-space-2 py-space-1.5 text-ui antialiased placeholder:text-ui",
                compactFloatShellClass,
              )
            : cn(
                "min-h-space-24 border border-border-default bg-bg-subtle px-space-3 py-space-2 text-body-md",
                "hover:border-border-strong",
              ),
          className,
        )}
        {...props}
      />
    );
  },
);
