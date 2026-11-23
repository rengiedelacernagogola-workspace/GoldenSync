"use client";

/**
 * ErrorState — page/section load failure (Figma `25:760`, UI-031).
 * Flow: Dashboard LoadError Retry → Default. Edit copy in copy/.
 */

import { CircleAlert } from "lucide-react";
import * as React from "react";

import { Button } from "@/components/core/button";
import { cn } from "@/lib/utils";

export interface ErrorStateProps extends React.HTMLAttributes<HTMLDivElement> {
  title?: string;
  body?: string;
  primaryLabel?: string;
  secondaryLabel?: string;
  onPrimary?: () => void;
  onSecondary?: () => void;
}

/** Full error panel with Retry + optional secondary nav. */
export function ErrorState({
  className,
  title = "Could not load data",
  body = "The data did not load. Retry.",
  primaryLabel = "Retry",
  secondaryLabel = "Go to Dashboard",
  onPrimary,
  onSecondary,
  ...props
}: ErrorStateProps) {
  return (
    <div
      role="alert"
      data-slot="gs-error-state"
      className={cn(
        "flex w-full flex-col items-center justify-center gap-space-4 px-space-6 py-space-8 text-center",
        className,
      )}
      {...props}
    >
      <CircleAlert
        className="size-8 text-status-error"
        aria-hidden
        strokeWidth={2}
      />
      <div className="flex flex-col gap-space-2">
        <h3 className="text-heading-sm text-text-primary">{title}</h3>
        <p className="max-w-sm text-body-sm text-text-muted">{body}</p>
      </div>
      <div className="flex flex-wrap items-center justify-center gap-space-3">
        <Button variant="Primary" size="md" onClick={onPrimary}>
          {primaryLabel}
        </Button>
        <Button variant="Ghost" size="md" onClick={onSecondary}>
          {secondaryLabel}
        </Button>
      </div>
    </div>
  );
}
