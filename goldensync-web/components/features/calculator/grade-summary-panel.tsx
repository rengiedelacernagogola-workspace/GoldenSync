"use client";

/**
 * Overall grade summary — breakdown table, status banner, lookup table.
 */

import * as React from "react";

import { Banner, Card } from "@/components/core";
import {
  formatPct,
  NUMERICAL_GRADE_BANDS,
  type CalculatorSnapshot,
} from "@/lib/domain/co-grade-calculator";
import { cn } from "@/lib/utils";

export type GradeSummaryPanelProps = {
  snapshot: CalculatorSnapshot;
};

/** Section 3 — final grade breakdown + status + lookup. */
export function GradeSummaryPanel({ snapshot }: GradeSummaryPanelProps) {
  const bannerVariant =
    snapshot.status.kind === "PASSED"
      ? "Success"
      : snapshot.status.kind === "FAILED"
        ? "Error"
        : snapshot.status.kind === "CONDITIONAL"
          ? "Warning"
          : "Info";

  const highlightIndex =
    snapshot.anyScoreEntered && snapshot.grade
      ? snapshot.grade.bandIndex
      : -1;

  return (
    <Card title="Overall Grade Summary" hasHeader className="w-full min-w-0">
      <div className="flex w-full min-w-0 flex-col gap-space-6">
        <div className="w-full min-w-0 overflow-x-auto">
          <table className="w-full min-w-[420px] table-fixed border-collapse text-left">
            <thead>
              <tr className="border-b border-border-subtle bg-bg-subtle">
                {(
                  [
                    "Course Outcome",
                    "CO Average",
                    "CO Weight",
                    "Weighted Contribution",
                  ] as const
                ).map((h) => (
                  <th
                    key={h}
                    className="px-space-2 py-space-2 text-[10px] font-semibold uppercase tracking-wide text-text-muted"
                  >
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {snapshot.cos.map((co) => (
                <tr
                  key={co.groupId}
                  className="border-b border-border-subtle"
                >
                  <td className="px-space-2 py-space-2 text-[11px] font-medium text-text-primary">
                    {co.code}
                  </td>
                  <td className="px-space-2 py-space-2 text-[11px] tabular-nums text-text-secondary">
                    {formatPct(co.average)}%
                  </td>
                  <td className="px-space-2 py-space-2 text-[11px] tabular-nums text-text-secondary">
                    {formatPct(co.coWeightPercent, 0)}%
                  </td>
                  <td className="px-space-2 py-space-2 text-[11px] tabular-nums text-text-primary">
                    {formatPct(co.contribution)}%
                  </td>
                </tr>
              ))}
              <tr className="bg-bg-subtle/80">
                <td className="px-space-2 py-space-2 text-[11px] font-semibold text-text-primary">
                  TOTAL
                </td>
                <td className="px-space-2 py-space-2 text-[11px] text-text-muted">
                  —
                </td>
                <td className="px-space-2 py-space-2 text-[11px] font-semibold tabular-nums text-text-primary">
                  100%
                </td>
                <td className="px-space-2 py-space-2 text-[11px] font-semibold tabular-nums text-text-primary">
                  {formatPct(snapshot.finalAverage)}%
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        <Banner
          variant={bannerVariant}
          message={`${snapshot.status.label}. ${snapshot.status.message}`}
          className="w-full"
        />

        {snapshot.grade ? (
          <p className="text-body-sm text-text-secondary">
            Numerical grade:{" "}
            <span className="font-semibold text-text-primary">
              {snapshot.grade.numerical} ({snapshot.grade.letter})
            </span>
            {" — "}
            {snapshot.grade.description}
          </p>
        ) : null}

        <div className="flex w-full min-w-0 flex-col gap-space-2">
          <p className="text-caption font-medium uppercase tracking-wide text-text-muted">
            Numerical grade lookup
          </p>
          <div className="w-full min-w-0 overflow-x-auto">
            <table className="w-full min-w-[520px] table-fixed border-collapse text-left">
              <thead>
                <tr className="border-b border-border-subtle bg-bg-subtle">
                  {(
                    ["Numerical", "% Range", "Letter", "Description"] as const
                  ).map((h) => (
                    <th
                      key={h}
                      className="px-space-2 py-space-2 text-[10px] font-semibold uppercase tracking-wide text-text-muted"
                    >
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {NUMERICAL_GRADE_BANDS.map((band, i) => {
                  const active = i === highlightIndex;
                  const numerical = Number.isInteger(band.grade)
                    ? band.grade.toFixed(1)
                    : String(band.grade);
                  return (
                    <tr
                      key={`${band.grade}-${band.letter}`}
                      className={cn(
                        "border-b border-border-subtle last:border-b-0",
                        active &&
                          "bg-tint-accent-bg ring-1 ring-inset ring-tint-accent-border",
                      )}
                    >
                      <td className="px-space-2 py-space-2 text-[11px] font-medium tabular-nums text-text-primary">
                        {numerical}
                      </td>
                      <td className="px-space-2 py-space-2 text-[11px] text-text-secondary">
                        {band.percentLabel}
                      </td>
                      <td className="px-space-2 py-space-2 text-[11px] font-medium text-text-primary">
                        {band.letter}
                      </td>
                      <td className="min-w-0 px-space-2 py-space-2 text-[11px] text-text-secondary">
                        {band.description}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </Card>
  );
}
