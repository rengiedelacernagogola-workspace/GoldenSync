"use client";

// WHAT: Friendly panel when a list or module has nothing to show yet.
// SCREEN: Center of tables, outcomes, syllabus sections with no rows.
// HOW: Title + body + optional primary Button CTA from props.
// KEEP: Module empties use copy "Not in this syllabus." (DEC-084).
// EDIT: Layout only — product strings from copy/.
// RISK: Low

/**
 * EmptyState — no-data panel (Figma `25:671`, UI-030).
 * Title + body + optional CTA. Module empties use "Not in this syllabus." (DEC-084).
 * Edit strings in copy/.
 */

import * as React from "react";

import { Button } from "@/components/core/button";
import { cn } from "@/lib/utils";

export interface EmptyStateProps extends React.HTMLAttributes<HTMLDivElement> {
  title?: string;
  body?: string;
  actionLabel?: string;
  hasAction?: boolean;
  onAction?: () => void;
  /** Optional 64px muted icon (Figma EmptyState). */
  icon?: React.ReactNode;
}

/** Centered empty panel for tables/modules. */
export function EmptyState({
  className,
  title = "Not in this syllabus.",
  body = "Edit subject to add it.",
  actionLabel = "Edit subject",
  hasAction = true,
  onAction,
  icon,
  ...props
}: EmptyStateProps) {
  return (
    <div
      data-slot="gs-empty-state"
      className={cn(
        "flex w-full flex-col items-center justify-center gap-space-3 px-space-6 py-space-8 text-center",
        className,
      )}
      {...props}
    >
      {icon ? (
        <div
          aria-hidden
          className="flex size-16 items-center justify-center text-text-muted [&_svg]:size-16"
        >
          {icon}
        </div>
      ) : null}
      <h3 className="text-heading-sm text-text-primary">{title}</h3>
      <p className="max-w-sm text-body-sm text-text-muted">{body}</p>
      {hasAction ? (
        <Button variant="Secondary" size="md" onClick={onAction}>
          {actionLabel}
        </Button>
      ) : null}
    </div>
  );
}
