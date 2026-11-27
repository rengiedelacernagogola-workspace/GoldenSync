"use client";

// WHAT: Donut chart made of tick marks — shows % progress through the term.
// SCREEN: SubjectCard on dashboard (center percent + optional label).
// HOW: value 0–100 maps to filled segment count; gradient across filled ticks.
// KEEP: Default 18 segments = weeks; parent supplies value only.
// EDIT: size, segments, and label prop — not card layout in subject-card.tsx.
// RISK: Low

/**
 * SegmentedRingProgress — circular segmented week progress (dashboard SubjectCard).
 * 18 ticks by default; filled segments use a cyan→mint gradient for appeal.
 */

import * as React from "react";

import { cn } from "@/lib/utils";

export interface SegmentedRingProgressProps {
  /** 0–100 progress. */
  value: number;
  /** Segment count (default 18 weeks). */
  segments?: number;
  /** Outer size in px. */
  size?: number;
  className?: string;
  /** Center caption under the percent. */
  label?: string;
}

function clampPercent(value: number) {
  if (!Number.isFinite(value)) return 0;
  return Math.max(0, Math.min(100, Math.round(value)));
}

/** Interpolate teal → mint across filled segments. */
function segmentColor(index: number, filled: number) {
  if (filled <= 1) return "var(--accent-tertiary)";
  const t = index / Math.max(1, filled - 1);
  /* accent-tertiary cyan → softer mint */
  const r = Math.round(0 + t * 34);
  const g = Math.round(229 - t * 40);
  const b = Math.round(255 - t * 80);
  return `rgb(${r} ${g} ${b})`;
}

/** Interactive circular progress — percent + label in the center. */
export function SegmentedRingProgress({
  value,
  segments = 18,
  size = 120,
  className,
  label = "progress",
}: SegmentedRingProgressProps) {
  const percent = clampPercent(value);
  const filled = Math.round((percent / 100) * segments);
  const stroke = Math.max(7, Math.round(size * 0.09));
  const r = (size - stroke) / 2;
  const cx = size / 2;
  const cy = size / 2;
  const circumference = 2 * Math.PI * r;
  const segLen = circumference / segments;
  const gap = segLen * 0.28;
  const dash = Math.max(1, segLen - gap);

  return (
    <div
      data-slot="gs-segmented-ring"
      className={cn(
        "relative inline-flex items-center justify-center",
        className,
      )}
      style={{ width: size, height: size }}
      role="img"
      aria-label={`${percent}% ${label}`}
    >
      <svg
        width={size}
        height={size}
        viewBox={`0 0 ${size} ${size}`}
        className="drop-shadow-[0_6px_10px_rgba(0,0,0,0.28)]"
        aria-hidden
      >
        {Array.from({ length: segments }, (_, i) => {
          const active = i < filled;
          return (
            <circle
              key={i}
              cx={cx}
              cy={cy}
              r={r}
              fill="none"
              stroke={active ? segmentColor(i, filled) : "var(--border-strong)"}
              strokeWidth={stroke}
              strokeLinecap="round"
              strokeDasharray={`${dash} ${circumference - dash}`}
              strokeDashoffset={-i * segLen}
              transform={`rotate(-90 ${cx} ${cy})`}
              className={cn(
                "transition-[stroke,opacity] duration-300 ease-out",
                !active && "opacity-45",
              )}
            />
          );
        })}
      </svg>
      <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center">
        <span className="text-[18px] font-semibold leading-none tracking-tight text-text-primary tabular-nums antialiased">
          {percent}%
        </span>
        <span className="mt-0.5 text-[10px] font-medium lowercase leading-none tracking-tight text-text-muted antialiased">
          {label}
        </span>
      </div>
    </div>
  );
}
