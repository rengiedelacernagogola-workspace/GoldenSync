"use client";

/**
 * Card — Figma `Card` `15:114`.
 * UI-018: Variant Default | Interactive | Active. Interactive states via CSS (Hover/Focus/Active/Disabled).
 * Content slot = children (never nest a Card). Footer/header optional. Active ≈ glass-accent + BorderBeam strip.
 */

import { cva, type VariantProps } from "class-variance-authority";
import * as React from "react";

import { Badge } from "@/components/core/badge";
import { Button } from "@/components/core/button";
import { cn } from "@/lib/utils";

const cardVariants = cva(
  [
    "relative flex w-full min-w-0 flex-col items-start gap-space-3 overflow-hidden sm:gap-space-4",
    "rounded-lg p-space-4 sm:p-space-6",
    "transition-[box-shadow,border-color,opacity,background-color] duration-150 ease-out",
  ].join(" "),
  {
    variants: {
      variant: {
        Default: "glass-md",
        Interactive: [
          "glass-md cursor-pointer outline-none",
          /* Hover = glass-md-hover (DEC-016): stronger border + shadow-hover */
          "hover:border-border-strong hover:shadow-[0_12px_48px_#00000059]",
          "active:border-border-strong active:bg-surface-glass-lg",
          "focus-visible:border-2 focus-visible:border-border-focus focus-visible:shadow-[0_4px_24px_#00000040]",
          "aria-disabled:pointer-events-none aria-disabled:cursor-not-allowed aria-disabled:opacity-40",
        ].join(" "),
        Active: "glass-accent",
      },
    },
    defaultVariants: {
      variant: "Default",
    },
  },
);

export type CardVariant = NonNullable<
  VariantProps<typeof cardVariants>["variant"]
>;

export interface CardProps
  extends Omit<React.HTMLAttributes<HTMLDivElement>, "title">,
    VariantProps<typeof cardVariants> {
  title?: string;
  hasHeader?: boolean;
  hasFooter?: boolean;
  hasHeaderBadge?: boolean;
  /** Header Badge label or custom node (Figma nested Badge). */
  headerBadge?: React.ReactNode;
  /** Footer actions; defaults to Secondary + Primary Button when hasFooter. */
  footer?: React.ReactNode;
  disabled?: boolean;
}

/**
 * GoldenSync Card shell — swap children for body (e.g. SubjectCard). Edit glass tokens in globals.
 */
export const Card = React.forwardRef<HTMLDivElement, CardProps>(
  function Card(
    {
      className,
      variant = "Default",
      title = "Card title",
      /* Content shells pass children only — opt into chrome via props */
      hasHeader = false,
      hasFooter = false,
      hasHeaderBadge = false,
      headerBadge,
      footer,
      disabled = false,
      children,
      onClick,
      ...props
    },
    ref,
  ) {
    const isInteractive = variant === "Interactive";
    const isActive = variant === "Active";
    /* Active dashboard tiles must stay clickable (Open Overview). */
    const clickable = Boolean(onClick) && !disabled && (isInteractive || isActive);

    return (
      <div
        ref={ref}
        data-slot="gs-card"
        data-variant={variant}
        role={clickable ? "button" : undefined}
        tabIndex={clickable ? 0 : undefined}
        aria-disabled={clickable && disabled ? true : undefined}
        onClick={clickable ? onClick : undefined}
        onKeyDown={
          clickable
            ? (e) => {
                if (e.key === "Enter" || e.key === " ") {
                  e.preventDefault();
                  onClick?.(e as unknown as React.MouseEvent<HTMLDivElement>);
                }
              }
            : undefined
        }
        className={cn(
          cardVariants({ variant }),
          clickable && isActive && "cursor-pointer outline-none",
          className,
        )}
        {...props}
      >
        {/* Active card BorderBeam approx (Figma 15:113 · UI-130) */}
        {isActive ? (
          <span
            aria-hidden
            data-slot="gs-card-border-beam"
            className="pointer-events-none absolute inset-x-0 top-0 h-px overflow-hidden"
          >
            <span className="gs-meteor absolute top-0 left-0 h-px w-[40%] bg-gradient-to-r from-transparent via-accent-primary to-transparent" />
          </span>
        ) : null}

        {hasHeader ? (
          <div
            data-slot="gs-card-header"
            className="relative flex w-full items-center justify-between gap-space-3 border-b border-border-subtle pb-space-4"
          >
            <h3 className="text-heading-lg whitespace-nowrap text-text-primary">
              {title}
            </h3>
            {hasHeaderBadge ? (
              <div className="shrink-0">
                {headerBadge ?? <Badge label="Badge" size="md" variant="Default" />}
              </div>
            ) : null}
          </div>
        ) : null}

        <div
          data-slot="gs-card-content"
          className="relative flex w-full flex-col items-start gap-space-4"
        >
          {children ?? (
            <div
              data-slot="gs-card-slot"
              className="flex h-space-24 w-full flex-col items-center justify-center rounded-md border border-dashed border-border-default"
            >
              <p className="text-caption text-text-muted">Content slot</p>
            </div>
          )}
        </div>

        {hasFooter ? (
          <div
            data-slot="gs-card-footer"
            className="relative flex w-full items-center justify-end gap-space-3 border-t border-border-subtle pt-space-4"
            onClick={(e) => e.stopPropagation()}
            onKeyDown={(e) => e.stopPropagation()}
          >
            {footer ?? (
              <>
                <Button variant="Secondary" size="md">
                  Button
                </Button>
                <Button variant="Primary" size="md">
                  Button
                </Button>
              </>
            )}
          </div>
        ) : null}
      </div>
    );
  },
);

export { cardVariants };
