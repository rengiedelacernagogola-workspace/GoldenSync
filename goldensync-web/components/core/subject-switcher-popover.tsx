"use client";

// WHAT: Popover panel listing subjects to switch active course context.
// SCREEN: Opens from SubjectSwitcher in sidebar/drawer — checkmark on active.
// HOW: subjects[] + activeId + onSelect from useSubjectSwitcherControls hook.
// KEEP: Max 20 subjects; empty copy "Add your first subject."
// EDIT: Compact 11px rows + light float shell (this popover only).
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
 * Compact 11px density + light float shell (scoped to this popover only).
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
      className={cn(
        "w-56 gap-0.5 border-border-subtle bg-bg-elevated/95 p-1 shadow-[0_1px_2px_rgba(0,0,0,0.12),0_8px_24px_rgba(0,0,0,0.18)]",
        className,
      )}
      {...props}
    >
      {isEmpty ? (
        <p className="px-space-2 py-space-1.5 text-ui text-text-muted">
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
                "relative flex w-full items-center gap-space-1.5 rounded-md px-space-2 py-1.5",
                "min-h-8 text-left outline-none transition-colors duration-150 ease-out",
                "hover:bg-surface-glass focus-visible:border-2 focus-visible:border-border-focus",
                selected && "bg-accent-glass-bg",
              )}
            >
              <span className="flex min-w-0 flex-1 flex-col items-start gap-0">
                <span className="text-ui font-semibold antialiased text-text-primary">
                  {item.code}
                </span>
                <span className="w-full truncate text-ui-sm antialiased text-text-muted">
                  {item.title}
                </span>
              </span>
              {selected ? (
                <Check
                  aria-hidden
                  className="size-3.5 shrink-0 text-accent-primary"
                  strokeWidth={2}
                />
              ) : (
                <span className="size-3.5 shrink-0" aria-hidden />
              )}
            </button>
          );
        })
      )}
    </Popover>
  );
}
