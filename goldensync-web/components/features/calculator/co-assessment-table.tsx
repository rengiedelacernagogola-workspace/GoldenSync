"use client";

/**
 * Table 3 — Course Outcome Assessment Tasks (grouped by CO, rowspan).
 */

import { Plus, Trash2 } from "lucide-react";
import * as React from "react";

import { Button, Card } from "@/components/core";
import {
  coWeightTotal,
  createEmptyCoGroup,
  createEmptyTask,
  DEFAULT_GRADING_TEMPLATE,
  type CoAssessmentGroup,
} from "@/lib/domain/grading-template";
import { cn } from "@/lib/utils";

const cellInput = cn(
  "box-border w-full min-w-0 max-w-full rounded-sm border border-transparent bg-transparent px-1 py-0.5",
  "text-[11px] font-medium leading-snug tracking-tight text-text-primary outline-none",
  "transition-[border-color,background-color] placeholder:text-text-muted",
  "hover:border-border-subtle focus:border-border-focus focus:bg-bg-subtle",
);

export type CoAssessmentTableProps = {
  groups: CoAssessmentGroup[];
  domainNote: string;
  onChangeGroups: (groups: CoAssessmentGroup[]) => void;
  onChangeDomainNote: (note: string) => void;
};

/** Editable CO assessment matrix with weight total + domain note. */
export function CoAssessmentTable({
  groups,
  domainNote,
  onChangeGroups,
  onChangeDomainNote,
}: CoAssessmentTableProps) {
  const total = coWeightTotal(groups);
  const totalOk = Math.abs(total - 100) < 0.05;

  function updateGroup(id: string, patch: Partial<CoAssessmentGroup>) {
    onChangeGroups(
      groups.map((g) => (g.id === id ? { ...g, ...patch } : g)),
    );
  }

  function updateTask(
    groupId: string,
    taskId: string,
    patch: Partial<CoAssessmentGroup["tasks"][number]>,
  ) {
    onChangeGroups(
      groups.map((g) =>
        g.id !== groupId
          ? g
          : {
              ...g,
              tasks: g.tasks.map((t) =>
                t.id === taskId ? { ...t, ...patch } : t,
              ),
            },
      ),
    );
  }

  function addGroup() {
    onChangeGroups([
      ...groups,
      createEmptyCoGroup(groups.length + 1),
    ]);
  }

  function removeGroup(id: string) {
    if (groups.length <= 1) return;
    onChangeGroups(groups.filter((g) => g.id !== id));
  }

  function addTask(groupId: string) {
    onChangeGroups(
      groups.map((g) =>
        g.id === groupId
          ? { ...g, tasks: [...g.tasks, createEmptyTask()] }
          : g,
      ),
    );
  }

  function removeTask(groupId: string, taskId: string) {
    onChangeGroups(
      groups.map((g) => {
        if (g.id !== groupId) return g;
        if (g.tasks.length <= 1) return g;
        return { ...g, tasks: g.tasks.filter((t) => t.id !== taskId) };
      }),
    );
  }

  function reset() {
    onChangeGroups(
      DEFAULT_GRADING_TEMPLATE.coGroups.map((g) => ({
        ...g,
        tasks: g.tasks.map((t) => ({ ...t })),
      })),
    );
    onChangeDomainNote(DEFAULT_GRADING_TEMPLATE.domainNote);
  }

  return (
    <Card
      title="Course Outcome (CO) Assessment Tasks"
      hasHeader
      hasHeaderBadge
      className="w-full min-w-0"
      headerBadge={
        <div className="flex flex-wrap items-center justify-end gap-space-2">
          <span
            className={cn(
              "text-caption font-medium",
              totalOk ? "text-status-success" : "text-status-error",
            )}
          >
            CO Weight % total: {total.toFixed(total % 1 === 0 ? 0 : 2)}%
            {totalOk ? "" : " (must be 100%)"}
          </span>
          <Button variant="Ghost" size="sm" onClick={reset}>
            Reset to Default
          </Button>
          <Button variant="Secondary" size="sm" onClick={addGroup}>
            <Plus className="size-3.5" aria-hidden />
            Add CO
          </Button>
        </div>
      }
    >
      <div className="flex w-full min-w-0 flex-col gap-space-4">
        <div className="w-full min-w-0 overflow-x-auto">
          <table className="w-full min-w-[720px] table-fixed border-collapse text-left">
            <thead>
              <tr className="border-b border-border-subtle bg-bg-subtle">
                {(
                  [
                    { full: "CO", short: "CO" },
                    { full: "Weight %", short: "Wt %" },
                    { full: "Assessment Task", short: "Task" },
                    { full: "Weight", short: "Wt" },
                    { full: "Final Weight", short: "Final" },
                    { full: "C/P/A", short: "C/P/A" },
                    { full: "", short: "" },
                  ] as const
                ).map((col, i) => (
                  <th
                    key={col.full || `a-${i}`}
                    className={cn(
                      "px-space-2 py-space-2 text-[10px] font-semibold uppercase tracking-wide whitespace-nowrap text-text-muted",
                      (i === 0 || i === 1) &&
                        "w-[72px] px-space-1 text-center",
                      i === 2 && "min-w-0",
                      (i === 3 || i === 4) && "w-[88px]",
                      i === 5 && "w-[64px]",
                      i === 6 && "w-10 px-space-1",
                    )}
                    aria-label={col.full || "Actions"}
                    title={col.full || undefined}
                  >
                    <span className="md:hidden">{col.short}</span>
                    <span className="hidden md:inline">{col.full}</span>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {groups.map((group) =>
                group.tasks.map((task, ti) => (
                  <tr
                    key={task.id}
                    className={cn(
                      "border-b border-border-subtle align-top",
                      ti === 0 && "border-t-2 border-t-border-default",
                    )}
                  >
                    {ti === 0 ? (
                      <>
                        <td
                          rowSpan={group.tasks.length}
                          className="w-[72px] whitespace-nowrap border-r border-border-subtle bg-bg-subtle/60 p-space-1 align-middle"
                        >
                          <div className="mx-auto flex w-fit max-w-full flex-col items-center gap-space-1">
                            <input
                              aria-label="Course outcome code"
                              className={cn(
                                cellInput,
                                "w-14 text-center font-semibold",
                              )}
                              value={group.code}
                              onChange={(e) =>
                                updateGroup(group.id, { code: e.target.value })
                              }
                            />
                            <Button
                              variant="Ghost"
                              size="sm"
                              onClick={() => addTask(group.id)}
                            >
                              <Plus className="size-3" aria-hidden />
                              Task
                            </Button>
                            <Button
                              variant="Ghost"
                              size="sm"
                              disabled={groups.length <= 1}
                              onClick={() => removeGroup(group.id)}
                            >
                              <Trash2 className="size-3" aria-hidden />
                              CO
                            </Button>
                          </div>
                        </td>
                        <td
                          rowSpan={group.tasks.length}
                          className="w-[72px] whitespace-nowrap border-r border-border-subtle bg-bg-subtle/60 p-space-1 align-middle"
                        >
                          <input
                            aria-label={`${group.code} weight percent`}
                            className={cn(
                              cellInput,
                              "mx-auto block w-14 text-center",
                            )}
                            value={group.weightPercent}
                            onChange={(e) =>
                              updateGroup(group.id, {
                                weightPercent: e.target.value,
                              })
                            }
                          />
                        </td>
                      </>
                    ) : null}
                    <td className="min-w-0 p-space-1">
                      <input
                        aria-label="Assessment task"
                        className={cellInput}
                        value={task.task}
                        onChange={(e) =>
                          updateTask(group.id, task.id, {
                            task: e.target.value,
                          })
                        }
                      />
                    </td>
                    <td className="w-[88px] min-w-0 p-space-1">
                      <input
                        aria-label="Task weight"
                        className={cellInput}
                        value={task.weight}
                        onChange={(e) =>
                          updateTask(group.id, task.id, {
                            weight: e.target.value,
                          })
                        }
                      />
                    </td>
                    <td className="w-[88px] min-w-0 p-space-1">
                      <input
                        aria-label="Final weight"
                        className={cellInput}
                        value={task.finalWeight}
                        onChange={(e) =>
                          updateTask(group.id, task.id, {
                            finalWeight: e.target.value,
                          })
                        }
                      />
                    </td>
                    <td className="w-[64px] min-w-0 p-space-1">
                      <input
                        aria-label="Domain C/P/A"
                        className={cn(cellInput, "text-center")}
                        value={task.domain}
                        onChange={(e) =>
                          updateTask(group.id, task.id, {
                            domain: e.target.value,
                          })
                        }
                      />
                    </td>
                    <td className="w-10 p-space-1 align-middle">
                      <Button
                        variant="Ghost"
                        size="sm"
                        aria-label="Remove task"
                        disabled={group.tasks.length <= 1}
                        onClick={() => removeTask(group.id, task.id)}
                      >
                        <Trash2 className="size-3.5" aria-hidden />
                      </Button>
                    </td>
                  </tr>
                )),
              )}
            </tbody>
          </table>
        </div>

        <label className="flex w-full min-w-0 flex-col gap-space-1">
          <span className="text-caption text-text-muted">Domain note</span>
          <input
            className={cn(
              cellInput,
              "rounded-md border border-border-subtle px-space-2 py-space-2 italic",
            )}
            value={domainNote}
            onChange={(e) => onChangeDomainNote(e.target.value)}
            aria-label="Domain evaluation note"
          />
        </label>
      </div>
    </Card>
  );
}
