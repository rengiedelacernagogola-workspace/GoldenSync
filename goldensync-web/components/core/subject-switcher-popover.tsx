"use client";

// WHAT: Popover panel listing subjects to switch active course context.
// SCREEN: Opens from SubjectSwitcher in sidebar/drawer — checkmark on active.
// HOW: subjects[] + activeId + onSelect from useSubjectSwitcherControls hook.
// KEEP: Max 20 subjects; empty copy "Add your first subject."
// EDIT: List row UI here — fetch/list logic in hook and AppShell.
// RISK: Low

/**
 * SubjectSwitcherPopover — subject list panel (Figma `97:9811` / Empty `97:9945`, UI-053).
 * FLOW: SubjectSwitcher Active → Popover SubjectList (check on active) or Empty copy.
 * RULE: max 20 subjects; empty = "Add your first subject." (plan 8.3).
 */

import { Check } from "lucide-react";
import * as React from "react";

import { Popover } from "@/components/core/menu";
import { cn } from "@/lib/utils";
import type { SubjectId } from "@/domain/types";

export interface SubjectSwitcherItem {
  id: SubjectId | string;
  code: string;
  title: string;
}

export interface SubjectSwitcherPopoverProps
  extends React.HTMLAttributes<HTMLDivElement> {
  items?: readonly SubjectSwitcherItem[];
  activeId?: SubjectId | string | null;
  empty?: boolean;
  emptyLabel?: string;
  /** Pick a subject — closes list in parent. */
  onSubjectSelect?: (id: SubjectId | string) => void;
}

/**
 * Floating subject list — parent positions under SubjectSwitcher (8 px gap).
 */
export function SubjectSwitcherPopover({
  className,
  items = [],
  activeId = null,
  empty = false,
  emptyLabel = "Add your first subject.",
  onSubjectSelect,
  ...props
}: SubjectSwitcherPopoverProps) {
  const isEmpty = empty || items.length === 0;

  return (
    <Popover
      aria-label="Subjects"
      data-slot="gs-subject-switcher-popover"
      className={cn("w-56", className)}
      {...props}
    >
      {isEmpty ? (
        <p className="px-space-3 py-space-2 text-body-sm text-text-muted">
          {emptyLabel}
        </p>
      ) : (
        items.map((item) => {
          const selected = item.id === activeId;
          return (
            <button
              key={String(item.id)}
              type="button"
              role="menuitem"
              data-slot="gs-subject-switcher-item"
              data-selected={selected ? "true" : undefined}
              onClick={() => onSubjectSelect?.(item.id)}
              className={cn(
                "relative flex w-full items-center gap-space-2 rounded-md px-space-3 py-space-2",
                "min-h-11 text-left outline-none transition-colors duration-150 ease-out",
                "hover:bg-surface-glass focus-visible:border-2 focus-visible:border-border-focus",
                selected && "bg-accent-glass-bg",
              )}
            >
              <span className="flex min-w-0 flex-1 flex-col items-start">
                <span className="text-body-sm font-medium text-text-primary">
                  {item.code}
                </span>
                <span className="w-full truncate text-caption text-text-muted">
                  {item.title}
                </span>
              </span>
              {selected ? (
                <Check
                  aria-hidden
                  className="size-4 shrink-0 text-accent-primary"
                  strokeWidth={2}
                />
              ) : (
                <span className="size-4 shrink-0" aria-hidden />
              )}
            </button>
          );
        })
      )}
    </Popover>
  );
}
