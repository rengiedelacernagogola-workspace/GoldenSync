"use client";

// WHAT: Shimmer placeholder while real content is loading.
// SCREEN: Dashboard cards, table rows, lines of text — type prop picks shape.
// HOW: CSS shimmer animation; respects prefers-reduced-motion (paused).
// KEEP: Match skeleton type to final layout (SubjectCard, TableRow, etc.).
// EDIT: Shimmer keyframes and dimensions per type here.
// RISK: Low

/**
 * Skeleton — loading placeholders (Figma `25:651`, UI-029 · SubjectCard DEC-049).
 * Type Line|Block|Card|TableRow|SubjectCard. Shimmer; paused for prefers-reduced-motion.
 */

import * as React from "react";

import { cn } from "@/lib/utils";

export type SkeletonType =
  | "Line"
  | "Block"
  | "Card"
  | "TableRow"
  | "SubjectCard";

export interface SkeletonProps extends React.HTMLAttributes<HTMLDivElement> {
  type?: SkeletonType;
}

/** Loading stand-in — match real element radii (Line/Block 8, Card/SubjectCard 12). */
export function Skeleton({
  className,
  type = "Line",
  ...props
}: SkeletonProps) {
  /* Mirrors SubjectCard — centered ring layout */
  if (type === "SubjectCard") {
    return (
      <div
        data-slot="gs-skeleton"
        data-type={type}
        aria-hidden
        className={cn(
          "glass-md flex h-[280px] w-full flex-col items-center gap-space-3 rounded-lg p-space-6",
          className,
        )}
        {...props}
      >
        <span className="gs-shimmer h-[14px] w-24 rounded-md" />
        <span className="gs-shimmer h-[28px] w-40 rounded-md" />
        <span className="gs-shimmer h-[14px] w-36 rounded-md" />
        <span className="gs-shimmer size-[112px] rounded-full" />
        <span className="gs-shimmer h-[12px] w-28 rounded-md" />
      </div>
    );
  }

  if (type === "TableRow") {
    return (
      <div
        data-slot="gs-skeleton"
        data-type={type}
        aria-hidden
        className={cn(
          "flex h-[52px] w-full min-w-[720px] items-center border-b border-border-subtle",
          className,
        )}
        {...props}
      >
        <span className="mx-space-4 h-3 w-40 rounded-md bg-bg-subtle motion-safe:animate-pulse" />
        <span className="mx-space-4 h-3 w-8 rounded-md bg-bg-subtle motion-safe:animate-pulse" />
        <span className="mx-space-4 h-3 w-16 rounded-md bg-bg-subtle motion-safe:animate-pulse" />
        <span className="mx-space-4 h-6 w-24 rounded-full bg-bg-subtle motion-safe:animate-pulse" />
        <span className="mx-space-4 size-8 rounded-md bg-bg-subtle motion-safe:animate-pulse" />
      </div>
    );
  }

  if (type === "Card") {
    return (
      <div
        data-slot="gs-skeleton"
        data-type={type}
        aria-hidden
        className={cn(
          "glass-md flex w-full max-w-[320px] flex-col gap-space-3 rounded-lg p-space-6",
          className,
        )}
        {...props}
      >
        <span className="h-4 w-40 rounded-md bg-bg-subtle motion-safe:animate-pulse" />
        <span className="h-3 w-full rounded-md bg-bg-subtle motion-safe:animate-pulse" />
        <span className="h-3 w-5/6 rounded-md bg-bg-subtle motion-safe:animate-pulse" />
        <span className="h-3 w-2/3 rounded-md bg-bg-subtle motion-safe:animate-pulse" />
        <span className="h-24 w-full rounded-md bg-bg-subtle motion-safe:animate-pulse" />
      </div>
    );
  }

  if (type === "Block") {
    return (
      <div
        data-slot="gs-skeleton"
        data-type={type}
        aria-hidden
        className={cn(
          "h-24 w-60 rounded-md bg-bg-subtle motion-safe:animate-pulse",
          className,
        )}
        {...props}
      />
    );
  }

  return (
    <div
      data-slot="gs-skeleton"
      data-type="Line"
      aria-hidden
      className={cn(
        "h-3 w-60 rounded-md bg-bg-subtle motion-safe:animate-pulse",
        className,
      )}
      {...props}
    />
  );
}
