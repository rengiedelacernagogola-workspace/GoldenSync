"use client";

/**
 * SemesterSwitcher — list + select past/current semesters;
 * New semester opens an anchored create panel under the trigger.
 */

import { Plus, Trash2 } from "lucide-react";
import * as React from "react";
import { createPortal } from "react-dom";

import { Button } from "@/components/core/button";
import { SemesterPicker } from "@/components/core/semester-picker";
import { SemesterCreatePanel } from "@/components/features/semester/semester-dialog";
import { getActiveSemester, useLiveData } from "@/hooks/use-live-data";
import { ApiClientError } from "@/lib/api/client";
import { deleteSemester } from "@/lib/api/semesters";
import { pushActivity } from "@/lib/activity/activity-log";
import {
  formatSemesterDisplayLabel,
  isSemesterPast,
  yearLevelName,
} from "@/lib/domain/semester-year";
import { cn } from "@/lib/utils";

/** Empty-state / CTA → open New semester on the shell switcher. */
export const OPEN_SEMESTER_CREATE_EVENT = "gs:open-semester-create";

export function openSemesterCreateDialog() {
  window.dispatchEvent(new Event(OPEN_SEMESTER_CREATE_EVENT));
}

export interface SemesterSwitcherProps {
  className?: string;
  triggerClassName?: string;
  /** Open the create dialog from outside (e.g. empty state). */
  createOpen?: boolean;
  onCreateOpenChange?: (open: boolean) => void;
  onActivity?: () => void;
  /** When false, do not mount create panel (use a sibling that manages it). */
  manageDialog?: boolean;
  /** List opens below (default) or above the trigger. */
  listPlacement?: "bottom" | "top";
}

type PanelPos = { top: number; left: number; width: number };

export function SemesterSwitcher({
  className,
  triggerClassName,
  createOpen: createOpenProp,
  onCreateOpenChange,
  onActivity,
  manageDialog = true,
  listPlacement = "bottom",
}: SemesterSwitcherProps) {
  const live = useLiveData();
  const [listOpen, setListOpen] = React.useState(false);
  const [internalCreateOpen, setInternalCreateOpen] = React.useState(false);
  const [deletingId, setDeletingId] = React.useState<string | null>(null);
  const [error, setError] = React.useState<string | null>(null);
  const [createPos, setCreatePos] = React.useState<PanelPos | null>(null);
  const [mounted, setMounted] = React.useState(false);
  const rootRef = React.useRef<HTMLDivElement>(null);

  const createOpen = createOpenProp ?? internalCreateOpen;
  function setCreateOpen(open: boolean) {
    if (onCreateOpenChange) onCreateOpenChange(open);
    else setInternalCreateOpen(open);
  }

  React.useEffect(() => {
    setMounted(true);
  }, []);

  React.useEffect(() => {
    if (createOpenProp !== undefined) return;
    function onOpen() {
      setInternalCreateOpen(true);
    }
    window.addEventListener(OPEN_SEMESTER_CREATE_EVENT, onOpen);
    return () =>
      window.removeEventListener(OPEN_SEMESTER_CREATE_EVENT, onOpen);
  }, [createOpenProp]);

  const active = getActiveSemester(live);
  const label = active
    ? formatSemesterDisplayLabel(active.label, active.yearLevel)
    : "No semester";

  /* Create open → dismiss list. */
  React.useEffect(() => {
    if (createOpen) setListOpen(false);
  }, [createOpen]);

  /** Measure trigger for fixed create panel (avoids TopBar/shell overflow clip). */
  const updateCreatePos = React.useCallback(() => {
    const el = rootRef.current;
    if (!el) return;
    const rect = el.getBoundingClientRect();
    const width = Math.min(360, Math.max(rect.width, 280), window.innerWidth - 16);
    let left = rect.right - width;
    left = Math.max(8, Math.min(left, window.innerWidth - width - 8));
    const gap = 8;
    let top = rect.bottom + gap;
    const maxH = Math.min(window.innerHeight * 0.7, 560);
    if (top + maxH > window.innerHeight - 8 && rect.top > maxH + gap) {
      top = rect.top - gap - Math.min(maxH, rect.top - 8);
    }
    setCreatePos({ top, left, width });
  }, []);

  React.useEffect(() => {
    if (!createOpen) {
      setCreatePos(null);
      return;
    }
    updateCreatePos();
    window.addEventListener("resize", updateCreatePos);
    window.addEventListener("scroll", updateCreatePos, true);
    return () => {
      window.removeEventListener("resize", updateCreatePos);
      window.removeEventListener("scroll", updateCreatePos, true);
    };
  }, [createOpen, updateCreatePos]);

  React.useEffect(() => {
    if (!listOpen && !createOpen) return;
    function onDoc(e: MouseEvent) {
      const target = e.target as Node;
      if (rootRef.current?.contains(target)) return;
      const panel = document.querySelector(
        '[data-slot="gs-semester-create-panel"]',
      );
      if (panel?.contains(target)) return;
      setListOpen(false);
      setCreateOpen(false);
    }
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") {
        setListOpen(false);
        setCreateOpen(false);
      }
    }
    document.addEventListener("mousedown", onDoc);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onDoc);
      document.removeEventListener("keydown", onKey);
    };
    // setCreateOpen is stable enough via props; omit to avoid re-bind loops
    // eslint-disable-next-line react-hooks/exhaustive-deps -- intentional
  }, [listOpen, createOpen]);

  async function handleSelect(id: string) {
    setError(null);
    await live.selectSemester(id);
    setListOpen(false);
  }

  async function handleDelete(id: string, semesterLabel: string) {
    const ok = window.confirm(
      `Delete semester “${semesterLabel}” and all of its subjects? This cannot be undone.`,
    );
    if (!ok) return;
    setDeletingId(id);
    setError(null);
    try {
      await deleteSemester(id);
      void pushActivity({
        kind: "semester",
        title: "Semester deleted",
        detail: semesterLabel,
      });
      onActivity?.();
      live.refresh();
      setListOpen(false);
    } catch (err) {
      setError(
        err instanceof ApiClientError
          ? err.message
          : "Could not delete semester.",
      );
    } finally {
      setDeletingId(null);
    }
  }

  const createPanel =
    manageDialog && createOpen && createPos && mounted
      ? createPortal(
          <div
            style={{
              position: "fixed",
              top: createPos.top,
              left: createPos.left,
              width: createPos.width,
              zIndex: 80,
            }}
          >
            <SemesterCreatePanel
              open
              className="w-full max-w-none"
              onClose={() => setCreateOpen(false)}
              onCreated={(created) => {
                onActivity?.();
                setCreateOpen(false);
                if (created.id) {
                  live.refresh(created.id);
                } else {
                  live.refresh();
                }
              }}
            />
          </div>,
          document.body,
        )
      : null;

  return (
    <div
      ref={rootRef}
      data-slot="gs-semester-switcher"
      className={cn("relative", className)}
    >
      <SemesterPicker
        label={label}
        open={listOpen || createOpen}
        onClick={() => {
          if (createOpen) {
            setCreateOpen(false);
            return;
          }
          if (live.semesters.length === 0) {
            setCreateOpen(true);
            return;
          }
          setListOpen((o) => !o);
        }}
        className={triggerClassName}
      />

      {listOpen && !createOpen ? (
        <div
          role="listbox"
          aria-label="Semesters"
          className={cn(
            "absolute right-0 z-40 flex w-[min(100vw-2rem,320px)] flex-col",
            "rounded-md border border-border-default bg-bg-elevated shadow-md",
            "overflow-hidden",
            listPlacement === "top"
              ? "bottom-full mb-space-2"
              : "top-full mt-space-2",
          )}
        >
          <ul className="max-h-64 overflow-y-auto py-space-1">
            {live.semesters.map((s) => {
              const past = isSemesterPast(s.endDate);
              const selected = s.id === live.activeSemesterId;
              const display = formatSemesterDisplayLabel(s.label, s.yearLevel);
              return (
                <li key={s.id} className="flex items-stretch gap-0">
                  <button
                    type="button"
                    role="option"
                    aria-selected={selected}
                    className={cn(
                      "flex min-w-0 flex-1 flex-col items-start gap-0.5 px-space-3 py-space-2 text-left",
                      "hover:bg-bg-muted",
                      selected && "bg-accent-glass-bg",
                    )}
                    onClick={() => void handleSelect(s.id)}
                  >
                    <span className="w-full truncate text-body-sm font-medium text-text-primary">
                      {display}
                    </span>
                    <span className="flex flex-wrap items-center gap-space-2 text-[11px] text-text-muted">
                      <span>{yearLevelName(s.yearLevel)}</span>
                      {past ? (
                        <span className="rounded-full border border-border-default px-space-2 py-0.5 text-[10px] text-text-secondary">
                          Past
                        </span>
                      ) : null}
                    </span>
                  </button>
                  <button
                    type="button"
                    aria-label={`Delete ${display}`}
                    disabled={deletingId === s.id}
                    className="shrink-0 px-space-2 text-text-muted hover:text-status-error"
                    onClick={(e) => {
                      e.stopPropagation();
                      void handleDelete(s.id, display);
                    }}
                  >
                    <Trash2 className="size-3.5" aria-hidden />
                  </button>
                </li>
              );
            })}
          </ul>
          {error ? (
            <p className="border-t border-border-default px-space-3 py-space-2 text-[11px] text-status-error">
              {error}
            </p>
          ) : null}
          <div className="border-t border-border-default p-space-2">
            <Button
              variant="Secondary"
              size="sm"
              className="w-full justify-center"
              onClick={() => {
                setListOpen(false);
                setCreateOpen(true);
              }}
            >
              <Plus className="size-3.5" aria-hidden />
              New semester…
            </Button>
          </div>
        </div>
      ) : null}

      {createPanel}
    </div>
  );
}
