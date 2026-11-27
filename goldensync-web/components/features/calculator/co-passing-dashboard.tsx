"use client";

// WHAT: Read-only CO passing bars (60% marker) + overall pass rate summary.
// SCREEN: Bottom of Grade Calculator, after score cards and grade summary.
// HOW: Uses precomputed CalculatorSnapshot from grade-calculator-panel.
// KEEP: Pure display — no edit/save; snapshot math lives in lib/domain.

/**
 * CO Passing Rate dashboard — bars with 60% marker + course status line.
 */

import * as React from "react";

import { Card } from "@/components/core";
import {
  courseStatusSentence,
  formatPct,
  type CalculatorSnapshot,
} from "@/lib/domain/co-grade-calculator";
import { cn } from "@/lib/utils";

export type CoPassingDashboardProps = {
  snapshot: CalculatorSnapshot;
};

/** Section 4 — per-CO bars and overall passing rate. */
export function CoPassingDashboard({ snapshot }: CoPassingDashboardProps) {
  const total = snapshot.cos.length || 4;
  const rate =
    total > 0 ? (snapshot.passedCount / total) * 100 : 0;

  return (
    <Card title="CO Passing Rate" hasHeader className="w-full min-w-0">
      <div className="flex w-full min-w-0 flex-col gap-space-4">
        <div className="flex flex-col gap-space-3">
          {snapshot.cos.map((co) => {
            // HOW: Bar width = CO average %; dashed line at 60% is pass threshold.
            const passed = co.status === "PASSED";
            const pct = Math.min(100, Math.max(0, co.average));
            return (
              <div key={co.groupId} className="flex w-full flex-col gap-space-1">
                <div className="flex flex-wrap items-center justify-between gap-space-2 text-[11px]">
                  <span className="font-medium text-text-primary">
                    {co.code} — {formatPct(co.average)}%
                  </span>
                  <span
                    className={cn(
                      "font-semibold",
                      passed ? "text-status-success" : "text-status-error",
                    )}
                  >
                    {co.status}
                  </span>
                </div>
                <div
                  className="relative h-2.5 w-full overflow-hidden rounded-full bg-bg-muted"
                  role="progressbar"
                  aria-valuenow={Math.round(pct)}
                  aria-valuemin={0}
                  aria-valuemax={100}
                  aria-label={`${co.code} passing bar`}
                >
                  <div
                    className={cn(
                      "absolute inset-y-0 left-0 rounded-full transition-[width]",
                      passed ? "bg-status-success" : "bg-status-error",
                    )}
                    style={{ width: `${pct}%` }}
                  />
                  <div
                    className="pointer-events-none absolute inset-y-0 w-0 border-l border-dashed border-status-error"
                    style={{ left: "60%" }}
                    aria-hidden
                  />
                </div>
              </div>
            );
          })}
        </div>

        <p className="rounded-md border border-border-subtle bg-bg-subtle px-space-3 py-space-2 text-[11px] font-medium text-text-secondary">
          {snapshot.passedCount} out of {total} COs Passed —{" "}
          <span className="text-text-primary">
            {formatPct(rate, 0)}% CO Passing Rate
          </span>
        </p>

        <p className="text-body-sm text-text-secondary">
          {courseStatusSentence(snapshot)}
        </p>
      </div>
    </Card>
  );
}
