"use client";

// WHAT: Shared click control — Primary (positive), Secondary (neutral), Destructive (negative), Ghost, IconOnly.
// KEEP: Change look via buttonVariants here; screens pass variant/size props only.
// HOW: Base UI primitive + class-variance-authority for variant classes.
// EDIT: Contrast + padding for unmistakably clickable CTAs; labels stay centered.
// RISK: Low — visual tokens only.

/**
 * Button — Figma `Button` `5:161`.
 * UI-010: Variant Primary|Secondary|Ghost|Destructive|IconOnly · Size sm 36 / md 44 / lg 52.
 * Hierarchy: Primary = highest contrast fill; Secondary = clear outline; Destructive = red outline.
 * IconOnly is md only (Figma omits sm/lg). Loading keeps width; spinner replaces label.
 */

import { Button as ButtonPrimitive } from "@base-ui/react/button";
import { cva, type VariantProps } from "class-variance-authority";
import { Loader2 } from "lucide-react";
import * as React from "react";

import { cn } from "@/lib/utils";

const buttonVariants = cva(
  [
    "inline-flex shrink-0 items-center justify-center gap-space-1.5 text-center",
    "rounded-md font-medium whitespace-nowrap",
    "transition-[background-color,border-color,opacity,box-shadow] duration-150 ease-out",
    "outline-none select-none",
    "focus-visible:focus-ring",
    "disabled:pointer-events-none disabled:opacity-40",
    "[&_svg]:pointer-events-none [&_svg]:shrink-0",
  ].join(" "),
  {
    variants: {
      variant: {
        /* Positive — solid fill, highest contrast */
        Primary:
          "border border-accent-primary bg-accent-primary text-text-inverse shadow-[0_1px_2px_rgba(0,0,0,0.2)] hover:bg-accent-primary/90 hover:border-accent-primary/90 active:bg-accent-primary/80",
        /* Neutral — clear outline + elevated fill so it reads as a control */
        Secondary:
          "border border-border-strong bg-bg-elevated text-text-primary shadow-[0_1px_2px_rgba(0,0,0,0.12)] hover:bg-bg-muted hover:border-border-strong active:bg-bg-subtle",
        /* Low-emphasis chrome — still shows hover/focus as clickable */
        Ghost:
          "border border-transparent bg-transparent text-text-secondary hover:border-border-subtle hover:bg-surface-glass hover:text-text-primary active:bg-surface-glass-md",
        /* Negative — red outline, transparent fill */
        Destructive:
          "border border-status-error bg-transparent text-status-error hover:bg-tint-error-bg active:bg-tint-error-hover",
        IconOnly:
          "border border-transparent bg-transparent text-text-secondary hover:border-border-subtle hover:bg-surface-glass hover:text-text-primary",
      },
      size: {
        /* sm: comfortable 36px + extra-small horizontal pad around centered label */
        sm: "h-9 min-h-9 px-space-3 text-ui [&_svg:not([class*='size-'])]:size-3.5",
        md: "h-11 min-h-11 px-space-4 text-body-sm [&_svg:not([class*='size-'])]:size-4",
        lg: "h-[52px] min-h-[52px] px-space-6 text-body-md [&_svg:not([class*='size-'])]:size-5",
      },
    },
    compoundVariants: [
      {
        variant: "IconOnly",
        size: "md",
        className: "size-11 min-h-11 min-w-11 px-0",
      },
    ],
    defaultVariants: {
      variant: "Primary",
      size: "md",
    },
  },
);

export type ButtonVariant = NonNullable<
  VariantProps<typeof buttonVariants>["variant"]
>;
export type ButtonSize = NonNullable<VariantProps<typeof buttonVariants>["size"]>;

export interface ButtonProps
  extends Omit<ButtonPrimitive.Props, "className">,
    VariantProps<typeof buttonVariants> {
  className?: string;
  /** Figma bool hasLeadingIcon — reserves leading icon slot spacing when true. */
  hasLeadingIcon?: boolean;
  /** Shows spinner; keeps control width (Figma Loading state). */
  loading?: boolean;
  /** Required for IconOnly (aria-label from Figma). */
  "aria-label"?: string;
}

/**
 * GoldenSync Button — use from features; wraps Base UI for a11y.
 * Edit variants here for contrast/size; do not restyle in screens.
 */
export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  function Button(
    {
      className,
      variant = "Primary",
      size = "md",
      hasLeadingIcon = false,
      loading = false,
      disabled,
      children,
      ...props
    },
    ref,
  ) {
    const resolvedSize = variant === "IconOnly" ? "md" : size;
    // HOW: loading disables click and swaps children for spinner (width stays stable).
    const isDisabled = disabled || loading;

    return (
      <ButtonPrimitive
        ref={ref}
        data-slot="gs-button"
        data-variant={variant}
        data-size={resolvedSize}
        data-loading={loading ? "true" : undefined}
        data-has-leading-icon={hasLeadingIcon ? "true" : undefined}
        disabled={isDisabled}
        className={cn(
          buttonVariants({ variant, size: resolvedSize }),
          className,
        )}
        {...props}
      >
        {loading ? (
          <Loader2
            className="size-4 animate-spin"
            aria-hidden
            data-testid="button-spinner"
          />
        ) : (
          children
        )}
      </ButtonPrimitive>
    );
  },
);

export { buttonVariants };
