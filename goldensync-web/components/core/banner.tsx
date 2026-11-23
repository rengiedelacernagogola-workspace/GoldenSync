"use client";

/**
 * Banner — inline status strip (Figma `24:576`, UI-026).
 * Info|Warning|Error|Success. Meaning is in the message text, not color alone.
 * Edit copy in copy/; CapReached uses hasAction=false (DEC-051).
 */

import { AlertTriangle, Check, CircleAlert, Info } from "lucide-react";
import * as React from "react";

import { Button } from "@/components/core/button";
import { cn } from "@/lib/utils";

export type BannerVariant = "Info" | "Warning" | "Error" | "Success";

const VARIANT_STYLES: Record<
  BannerVariant,
  { shell: string; icon: string; Icon: React.ElementType; role: "status" | "alert" }
> = {
  Info: {
    shell: "border-tint-accent-border bg-tint-accent-bg",
    icon: "text-accent-primary",
    Icon: Info,
    role: "status",
  },
  Warning: {
    shell: "border-tint-warning-border bg-tint-warning-bg",
    icon: "text-status-warning",
    Icon: AlertTriangle,
    role: "alert",
  },
  Error: {
    shell: "border-tint-error-border bg-tint-error-bg",
    icon: "text-status-error",
    Icon: CircleAlert,
    role: "alert",
  },
  Success: {
    shell: "border-tint-success-border bg-tint-success-bg",
    icon: "text-status-success",
    Icon: Check,
    role: "status",
  },
};

export interface BannerProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: BannerVariant;
  message?: string;
  hasAction?: boolean;
  actionLabel?: string;
  onAction?: () => void;
}

/** Shows a page/section banner; pair action with Retry or return-to-dashboard. */
export function Banner({
  className,
  variant = "Info",
  message = "Banner message.",
  hasAction = true,
  actionLabel = "Retry",
  onAction,
  ...props
}: BannerProps) {
  const cfg = VARIANT_STYLES[variant];
  const Icon = cfg.Icon;

  return (
    <div
      role={cfg.role}
      data-slot="gs-banner"
      data-variant={variant}
      className={cn(
        "flex min-h-12 w-full items-center gap-space-3 rounded-md border px-space-4 py-space-3",
        cfg.shell,
        className,
      )}
      {...props}
    >
      <Icon
        className={cn("size-3.5 shrink-0", cfg.icon)}
        aria-hidden
        strokeWidth={2}
      />
      <p className="min-w-0 flex-1 text-body-sm text-text-primary">{message}</p>
      {hasAction ? (
        <Button variant="Secondary" size="sm" onClick={onAction}>
          {actionLabel}
        </Button>
      ) : null}
    </div>
  );
}
