"use client";

/**
 * Input — Figma `Input` `8:84`.
 * UI-011: Size Desktop 44 / Mobile 48 · states via CSS + aria-invalid + disabled.
 * Resting border = border-default (KL-02). Hover = border-strong. Focus/Active = border-focus + glow.
 * Error = status-error + error glow (pair with FormField message). Never show error before first interaction.
 */

import { Input as InputPrimitive } from "@base-ui/react/input";
import { cva, type VariantProps } from "class-variance-authority";
import * as React from "react";

import { cn } from "@/lib/utils";

const inputShellVariants = cva(
  [
    "flex w-full min-w-0 items-center gap-space-2 overflow-hidden rounded-md",
    "bg-bg-subtle px-space-3",
    "border border-border-default",
    "transition-[border-color,box-shadow,opacity] duration-150 ease-out",
    "hover:border-border-strong",
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
        Desktop: "min-h-11",
        Mobile: "min-h-12",
        Compact: "min-h-8 px-space-2",
      },
    },
    defaultVariants: {
      size: "Desktop",
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
      size = "Desktop",
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
            "file:border-0 file:bg-transparent file:text-body-sm file:font-medium file:text-text-primary",
            size === "Compact"
              ? "text-[11px] leading-snug font-medium tracking-tight antialiased placeholder:text-[11px] placeholder:tracking-tight"
              : "text-body-md",
          )}
          {...props}
        />
        {hasTrailingIcon && trailingIcon ? (
          <span
            className="flex size-4 shrink-0 items-center justify-center text-text-muted [&_svg]:size-4"
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
