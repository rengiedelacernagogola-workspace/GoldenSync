"use client";

/**
 * One CO card — task scores, live weighted scores, CO summary + progress.
 */

import { CircleHelp } from "lucide-react";
import * as React from "react";

import { Card } from "@/components/core";
import {
  formatPct,
  type CoScoreResult,
} from "@/lib/domain/co-grade-calculator";
import { cn } from "@/lib/utils";

const cellInput = cn(
  "box-border w-full min-w-0 max-w-full rounded-sm border border-transparent bg-transparent px-1 py-0.5",
  "text-[11px] font-medium leading-snug tracking-tight text-text-primary outline-none",
  "transition-[border-color,background-color] placeholder:text-text-muted",
  "hover:border-border-subtle focus:border-border-focus focus:bg-bg-subtle",
);

export type CoScoreCardProps = {
  result: CoScoreResult;
  yourScores: Record<string, string>;
  maxScores: Record<string, string>;
  onYourScoreChange: (taskId: string, value: string) => void;
  onMaxScoreChange: (taskId: string, value: string) => void;
};

/** Editable CO assessment score card. */
export function CoScoreCard({
  result,
  yourScores,
  maxScores,
  onYourScoreChange,
  onMaxScoreChange,
}: CoScoreCardProps) {
  const passed = result.status === "PASSED";
  const avgPct = Math.min(100, Math.max(0, result.average));
  const [tipOpen, setTipOpen] = React.useState(false);

  return (
    <Card
      title={`${result.code} — ${formatPct(result.coWeightPercent, result.coWeightPercent % 1 === 0 ? 0 : 2)}% of Final Grade`}
      hasHeader
      className="w-full min-w-0"
    >
      <div className="flex w-full min-w-0 flex-col gap-space-4">
        <div className="w-full min-w-0 overflow-x-auto">
          <table className="w-full min-w-[560px] table-fixed border-collapse text-left">
            <thead>
              <tr className="border-b border-border-subtle bg-bg-subtle">
                <th className="min-w-0 px-space-2 py-space-2 text-[10px] font-semibold uppercase tracking-wide text-text-muted">
                  Assessment Task
                </th>
                <th className="w-[88px] px-space-2 py-space-2 text-[10px] font-semibold uppercase tracking-wide text-text-muted">
                  Max Score
                </th>
                <th className="w-[88px] px-space-2 py-space-2 text-[10px] font-semibold uppercase tracking-wide text-text-muted">
                  Your Score
                </th>
                <th className="w-[88px] px-space-2 py-space-2 text-[10px] font-semibold uppercase tracking-wide text-text-muted">
                  Weight
                </th>
                <th className="w-[100px] px-space-2 py-space-2 text-[10px] font-semibold uppercase tracking-wide text-text-muted">
                  Weighted Score
                </th>
              </tr>
            </thead>
            <tbody>
              {result.tasks.map((task) => {
                const overMax = task.overMax;
                return (
                  <tr
                    key={task.taskId}
                    className="border-b border-border-subtle align-middle last:border-b-0"
                  >
                    <td className="min-w-0 px-space-2 py-space-2 text-[11px] font-medium text-text-primary">
                      {task.task || "—"}
                    </td>
                    <td className="min-w-0 p-space-1">
                      <input
                        type="number"
                        min={0}
                        step="any"
                        aria-label={`${task.task} max score`}
                        className={cellInput}
                        value={maxScores[task.taskId] ?? "100"}
                        onChange={(e) =>
                          onMaxScoreChange(task.taskId, e.target.value)
                        }
                      />
                    </td>
                    <td className="min-w-0 p-space-1">
                      <input
                        type="number"
                        min={0}
                        step="any"
                        aria-label={`${task.task} your score`}
                        aria-invalid={overMax || undefined}
                        className={cn(
                          cellInput,
                          overMax &&
                            "border-status-error focus:border-status-error",
                        )}
                        value={yourScores[task.taskId] ?? ""}
                        placeholder="0"
                        onChange={(e) =>
                          onYourScoreChange(task.taskId, e.target.value)
                        }
                      />
                      {overMax ? (
                        <p className="mt-0.5 text-[10px] text-status-error">
                          Max {task.maxScore}
                        </p>
                      ) : null}
                    </td>
                    <td className="px-space-2 py-space-2 text-[11px] text-text-secondary">
                      {formatPct(task.weightPercent, 2)}%
                    </td>
                    <td className="px-space-2 py-space-2 text-[11px] font-medium tabular-nums text-text-primary">
                      {formatPct(task.weightedScore)}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        <div className="flex w-full min-w-0 flex-col gap-space-3 rounded-md border border-border-subtle bg-bg-subtle/50 p-space-3">
          <div className="flex flex-wrap items-center gap-x-space-4 gap-y-space-2 text-[11px]">
            <p className="text-text-secondary">
              CO Average:{" "}
              <span className="font-semibold tabular-nums text-text-primary">
                {formatPct(result.average)}%
              </span>
            </p>
            <p className="relative flex items-center gap-1 text-text-secondary">
              CO Status:{" "}
              <span
                className={cn(
                  "font-semibold",
                  passed ? "text-status-success" : "text-status-error",
                )}
              >
                {result.status}
              </span>
              <button
                type="button"
                className="inline-flex text-text-muted hover:text-text-secondary"
                aria-label="About CO status"
                onClick={() => setTipOpen((v) => !v)}
              >
                <CircleHelp className="size-3.5" aria-hidden />
              </button>
              {tipOpen ? (
                <span
                  role="tooltip"
                  className="absolute top-full left-0 z-10 mt-1 max-w-[240px] rounded-md border border-border-strong bg-bg-overlay px-space-2 py-space-1 text-caption text-text-primary"
                >
                  A CO is passed if your weighted average within that CO is 60%
                  or above.
                </span>
              ) : null}
            </p>
            <p className="text-text-secondary">
              Contribution to Final Grade:{" "}
              <span className="font-semibold tabular-nums text-text-primary">
                {formatPct(result.contribution)}%
              </span>{" "}
              out of {formatPct(result.coWeightPercent, 0)}%
            </p>
          </div>

          <div
            className="relative h-2 w-full overflow-hidden rounded-full bg-bg-muted"
            role="progressbar"
            aria-valuenow={Math.round(avgPct)}
            aria-valuemin={0}
            aria-valuemax={100}
            aria-label={`${result.code} average`}
          >
            <div
              className={cn(
                "absolute inset-y-0 left-0 rounded-full transition-[width]",
                passed ? "bg-status-success" : "bg-status-error",
              )}
              style={{ width: `${avgPct}%` }}
            />
            <div
              className="pointer-events-none absolute inset-y-0 w-0 border-l border-dashed border-status-error"
              style={{ left: "60%" }}
              aria-hidden
            />
          </div>
        </div>
      </div>
    </Card>
  );
}
