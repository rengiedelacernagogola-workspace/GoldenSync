"use client";

// WHAT: Multi-line text control with same border/focus tokens as Input.
// SCREEN: Long answers in forms (notes, descriptions).
// HOW: Native textarea + invalid prop maps to aria-invalid for error glow.
// KEEP: Min height and grow behavior; wrap in FormField for labels.
// EDIT: Row default and className hooks here.
// RISK: Low

/**
 * Textarea — Figma `Textarea` `11:50`.
 * UI-013: min-height 96 (space-24); grows with content. Same border/glow tokens as Input (KL-02).
 * Active = Focus while typing (DEC-028). Pair Error with FormField message.
 */

import * as React from "react";

import { cn } from "@/lib/utils";

export interface TextareaProps
  extends Omit<React.ComponentProps<"textarea">, "className"> {
  className?: string;
  /** Sets aria-invalid for Error state styling. */
  invalid?: boolean;
}

/**
 * GoldenSync Textarea — use under FormField for label / helper / error.
 */
export const Textarea = React.forwardRef<HTMLTextAreaElement, TextareaProps>(
  function Textarea(
    { className, invalid = false, disabled, rows = 3, ...props },
    ref,
  ) {
    return (
      <textarea
        ref={ref}
        data-slot="gs-textarea"
        disabled={disabled}
        rows={rows}
        aria-invalid={invalid || undefined}
        className={cn(
          "w-full min-w-0 min-h-space-24 resize-y overflow-auto",
          "rounded-md bg-bg-subtle px-space-3 py-space-2",
          "border border-border-default text-body-md text-text-primary",
          "placeholder:text-text-muted",
          "transition-[border-color,box-shadow,opacity] duration-150 ease-out",
          "outline-none",
          "hover:border-border-strong",
          "focus:border-2 focus:border-border-focus",
          "focus:shadow-[0_0_0_3px_var(--focus-ring-glow)]",
          "aria-invalid:border-status-error",
          "aria-invalid:shadow-[0_0_0_3px_var(--error-ring-glow)]",
          "aria-invalid:focus:border-status-error",
          "disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-50",
          className,
        )}
        {...props}
      />
    );
  },
);
