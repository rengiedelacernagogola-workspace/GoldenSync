"use client";

// WHAT: Pill-style single-select among a few options (like iOS segmented control).
// SCREEN: Export format CSV|JSON and similar binary/ small choice UIs.
// HOW: Controlled value + onValueChange; keyboard-focusable segments.
// KEEP: Parent owns selected value; labels from props/copy.
// EDIT: Track dimensions and active glass style here.
// RISK: Low

/**
 * SegmentedControl — exclusive options (Figma `22:538`, UI-024).
 * Track 44 / segment 36. Active = accent-glass. Export uses CSV|JSON.
 * Edit selection in the parent; labels come from props (copy/ for product strings).
 */

import * as React from "react";

import { cn } from "@/lib/utils";

export interface SegmentOption {
  value: string;
  label: string;
}

export interface SegmentedControlProps
  extends Omit<React.HTMLAttributes<HTMLDivElement>, "onChange"> {
  options: SegmentOption[];
  value: string;
  onValueChange?: (value: string) => void;
  /** Accessible name for the radiogroup. */
  "aria-label"?: string;
}

/**
 * One segment button inside the track.
 * FLOW: keyboard arrows move selection when focused in the group.
 */
function SegmentButton({
  option,
  selected,
  onSelect,
}: {
  option: SegmentOption;
  selected: boolean;
  onSelect: () => void;
}) {
  return (
    <button
      type="button"
      role="radio"
      aria-checked={selected}
      data-slot="gs-segment"
      data-state={selected ? "Active" : "Default"}
      onClick={onSelect}
      className={cn(
        "flex h-9 items-center justify-center overflow-hidden rounded-md px-space-3",
        "text-body-sm font-medium whitespace-nowrap outline-none",
        "transition-[background-color,border-color,color] duration-150 ease-out",
        "focus-visible:focus-ring",
        selected
          ? "border border-accent-glass-border bg-accent-glass-bg text-text-primary"
          : "border border-transparent text-text-muted hover:text-text-secondary",
      )}
    >
      {option.label}
    </button>
  );
}

/** Radiogroup of 2–4 segments; parent owns the selected value. */
export function SegmentedControl({
  className,
  options,
  value,
  onValueChange,
  "aria-label": ariaLabel = "Options",
  ...props
}: SegmentedControlProps) {
  return (
    <div
      role="radiogroup"
      aria-label={ariaLabel}
      data-slot="gs-segmented-control"
      className={cn(
        "inline-flex items-center gap-space-1 rounded-lg border border-border-default bg-bg-subtle p-space-1",
        className,
      )}
      {...props}
    >
      {options.map((option) => (
        <SegmentButton
          key={option.value}
          option={option}
          selected={option.value === value}
          onSelect={() => onValueChange?.(option.value)}
        />
      ))}
    </div>
  );
}
