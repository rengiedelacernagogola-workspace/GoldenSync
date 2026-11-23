/**
 * Badge — Figma `Badge` `13:78`.
 * UI-015: Variant Default|Success|Warning|Error|Accent × Size sm 20 / md 24 / lg 28.
 * Static pill — meaning is in the words, not the color. Never truncate.
 */

import { cva, type VariantProps } from "class-variance-authority";
import * as React from "react";

import { cn } from "@/lib/utils";

const badgeVariants = cva(
  [
    "inline-flex shrink-0 items-center justify-center gap-space-1",
    "rounded-full border font-medium leading-[1.2] whitespace-nowrap",
  ].join(" "),
  {
    variants: {
      variant: {
        Default:
          "border-border-default bg-surface-glass-md text-text-secondary",
        Success:
          "border-tint-success-border bg-tint-success-bg text-status-success",
        Warning:
          "border-tint-warning-border bg-tint-warning-bg text-status-warning",
        Error: "border-tint-error-border bg-tint-error-bg text-status-error",
        Accent:
          "border-tint-accent-border bg-tint-accent-bg text-accent-primary",
      },
      size: {
        sm: "h-5 px-space-2 text-[11px]",
        md: "h-6 px-space-2 text-[12px]",
        lg: "h-7 px-space-3 text-[13px]",
      },
    },
    defaultVariants: {
      variant: "Default",
      size: "sm",
    },
  },
);

export type BadgeVariant = NonNullable<
  VariantProps<typeof badgeVariants>["variant"]
>;
export type BadgeSize = NonNullable<VariantProps<typeof badgeVariants>["size"]>;

export interface BadgeProps
  extends React.HTMLAttributes<HTMLSpanElement>,
    VariantProps<typeof badgeVariants> {
  /** Figma `label` text property. */
  label?: string;
}

/**
 * GoldenSync Badge — non-interactive status/label pill.
 */
export function Badge({
  className,
  variant = "Default",
  size = "sm",
  label,
  children,
  ...props
}: BadgeProps) {
  return (
    <span
      data-slot="gs-badge"
      data-variant={variant}
      data-size={size}
      className={cn(badgeVariants({ variant, size }), className)}
      {...props}
    >
      {label ?? children}
    </span>
  );
}

export { badgeVariants };
