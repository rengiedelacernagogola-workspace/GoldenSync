"use client";

// WHAT: Single-line text field shell matching Figma Input (border, focus glow).
// SCREEN: Forms app-wide — pair with FormField for label/error.
// HOW: Base UI Input inside cva shell; aria-invalid triggers error border.
// KEEP: Focus/error rings; Compact is the system default (11px + light float).
// EDIT: inputShellVariants tokens here — screens pass size + className only.
// RISK: Medium — error border must not show before user interaction (see FormField).

/**
 * Input — Figma `Input` `8:84`.
 * UI-011: Size Desktop 44 / Mobile 48 / Compact 32 · states via CSS + aria-invalid.
 * Compact (default): light-float shell + text-ui. Desktop/Mobile keep solid bg-bg-subtle.
 */

import { Input as InputPrimitive } from "@base-ui/react/input";
import { cva, type VariantProps } from "class-variance-authority";
import * as React from "react";

import { compactFloatShellClass } from "@/lib/ui/compact-field";
import { cn } from "@/lib/utils";

const inputShellVariants = cva(
  [
    "flex w-full min-w-0 items-center gap-space-2 overflow-hidden rounded-md",
    "px-space-3",
    "border",
    "transition-[border-color,box-shadow,opacity] duration-150 ease-out",
    /* Focus / Active (DEC-028: Active = Focus while typing) */
    "focus-within:border-2 focus-within:border-border-focus",
    "focus-within:shadow-[0_0_0_3px_var(--focus-ring-glow)]",
    /* Error wins over hover/focus border color */
    "has-[[data-slot=gs-input][aria-invalid=true]]:border-status-error",
    "has-[[data-slot=gs-input][aria-invalid=true]]:shadow-[0_0_0_3px_var(--error-ring-glow)]",
    "has-[[data-slot=gs-input][aria-invalid=true]]:focus-within:border-status-error",
    "has-[[data-slot=gs-input]:disabled]:pointer-events-none",
    "has-[[data-slot=gs-input]:disabled]:opacity-50",
  ].join(" "),
  {
    variants: {
      size: {
        /* Solid shell — larger touch targets when explicitly requested */
        Desktop:
          "min-h-11 border-border-default bg-bg-subtle hover:border-border-strong",
        Mobile:
          "min-h-12 border-border-default bg-bg-subtle hover:border-border-strong",
        /* WHAT: System default — 11px + light float (soft fill + subtle shadow). */
        Compact: cn(
          "min-h-8 px-space-2",
          compactFloatShellClass,
        ),
      },
    },
    defaultVariants: {
      size: "Compact",
    },
  },
);

export type InputSize = NonNullable<
  VariantProps<typeof inputShellVariants>["size"]
>;

export interface InputProps
  extends Omit<React.ComponentProps<"input">, "size" | "className">,
    VariantProps<typeof inputShellVariants> {
  className?: string;
  /** Figma bool — show leading icon slot (decorative, pointer-events none). */
  hasLeadingIcon?: boolean;
  /** Figma bool — show trailing slot (e.g. password Eye toggle with its own aria-label). */
  hasTrailingIcon?: boolean;
  leadingIcon?: React.ReactNode;
  trailingIcon?: React.ReactNode;
  /** Sets aria-invalid for Error state styling. */
  invalid?: boolean;
}

/**
 * GoldenSync Input shell + native field. Label/helper/error live on FormField.
 */
export const Input = React.forwardRef<HTMLInputElement, InputProps>(
  function Input(
    {
      className,
      size = "Compact",
      hasLeadingIcon = false,
      hasTrailingIcon = false,
      leadingIcon,
      trailingIcon,
      invalid = false,
      disabled,
      ...props
    },
    ref,
  ) {
    return (
      <div
        data-slot="gs-input-shell"
        data-size={size}
        className={cn(inputShellVariants({ size }), className)}
      >
        {hasLeadingIcon && leadingIcon ? (
          <span
            className="pointer-events-none size-4 shrink-0 text-text-muted [&_svg]:size-4"
            aria-hidden
            data-slot="gs-input-leading"
          >
            {leadingIcon}
          </span>
        ) : null}
        <InputPrimitive
          ref={ref}
          data-slot="gs-input"
          data-size={size}
          disabled={disabled}
          aria-invalid={invalid || undefined}
          className={cn(
            "min-w-0 flex-1 bg-transparent text-text-primary outline-none",
            "placeholder:text-text-muted",
            "disabled:cursor-not-allowed",
            "file:border-0 file:bg-transparent file:text-ui file:font-medium file:text-text-primary",
            size === "Compact"
              ? "text-ui antialiased placeholder:text-ui"
              : "text-body-md",
          )}
          {...props}
        />
        {hasTrailingIcon && trailingIcon ? (
          <span
            /* size-auto so text FieldHints fit; icons still sized via [&_svg] */
            className="flex shrink-0 items-center justify-center text-text-muted [&_svg]:size-4"
            data-slot="gs-input-trailing"
          >
            {trailingIcon}
          </span>
        ) : null}
      </div>
    );
  },
);

export { inputShellVariants };
