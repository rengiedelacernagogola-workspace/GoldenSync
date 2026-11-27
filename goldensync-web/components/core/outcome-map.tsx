"use client";

// WHAT: Matrix linking Course Outcomes (CO) to Program Outcomes (PO) with I/E/D level.
// SCREEN: Subject Outcomes page — hover a CO row highlights linked PO cells.
// HOW: Parent passes nodes + links arrays and optional highlight state.
// KEEP: Tabular layout for scanning; highlight driven by parent, not internal routing.
// EDIT: Cell colors and level legend here — seed data lives in page loaders.
// RISK: Low

/**
 * OutcomeMap — compact CO→PO table with I/E/D levels (Figma `39:1585`, UI-046).
 * FLOW: Outcomes page · hover/focus a CO row lights linked PO cells.
 * RULE: I/E/D on CO→PO links (seed plan §7). Tabular for scanability.
 */

import * as React from "react";

import { cn } from "@/lib/utils";

export type OutcomeMapHighlight = "None" | (string & {});

export interface OutcomeMapNode {
  id: string;
  label: string;
  description?: string;
}

export interface OutcomeMapLink {
  from: string;
  to: string;
  level: "I" | "E" | "D";
}

export interface OutcomeMapProps extends React.HTMLAttributes<HTMLDivElement> {
  highlight?: OutcomeMapHighlight;
  /** CO hover — parent owns highlight state (Figma While-hovering). */
  onHighlightChange?: (value: OutcomeMapHighlight) => void;
  peos?: readonly OutcomeMapNode[];
  pos?: readonly OutcomeMapNode[];
  cos?: readonly OutcomeMapNode[];
  links?: readonly OutcomeMapLink[];
}

const DEFAULT_PEOS: readonly OutcomeMapNode[] = [
  { id: "PEO1", label: "PEO1" },
  { id: "PEO2", label: "PEO2" },
  { id: "PEO3", label: "PEO3" },
];

const DEFAULT_POS: readonly OutcomeMapNode[] = [
  { id: "PO a", label: "PO a" },
  { id: "PO b", label: "PO b" },
  { id: "PO c", label: "PO c" },
  { id: "PO d", label: "PO d" },
];

const DEFAULT_COS: readonly OutcomeMapNode[] = [
  {
    id: "CO1",
    label: "CO1",
    description: "Describe integration concepts and data formats",
  },
  {
    id: "CO2",
    label: "CO2",
    description: "Validate and sanitize data between systems",
  },
  {
    id: "CO3",
    label: "CO3",
    description: "Implement secure session handling",
  },
  {
    id: "CO4",
    label: "CO4",
    description: "Deploy and test an integrated application",
  },
];

/** Seed CO→PO map (plan §7). */
const DEFAULT_LINKS: readonly OutcomeMapLink[] = [
  { from: "CO1", to: "PO a", level: "I" },
  { from: "CO1", to: "PO b", level: "I" },
  { from: "CO2", to: "PO b", level: "E" },
  { from: "CO3", to: "PO c", level: "E" },
  { from: "CO4", to: "PO c", level: "D" },
  { from: "CO4", to: "PO d", level: "D" },
];

const cell =
  "text-[11px] font-medium leading-snug tracking-tight antialiased";
const head =
  "text-[10px] font-semibold leading-snug tracking-tight antialiased uppercase text-text-muted";

/**
 * Assessment map — tabular CO / Level / PO rows; PEO strip above.
 */
export function OutcomeMap({
  className,
  highlight = "None",
  onHighlightChange,
  peos = DEFAULT_PEOS,
  pos = DEFAULT_POS,
  cos = DEFAULT_COS,
  links = DEFAULT_LINKS,
  ...props
}: OutcomeMapProps) {
  const coById = React.useMemo(() => {
    const map = new Map<string, OutcomeMapNode>();
    for (const c of cos) map.set(c.id, c);
    return map;
  }, [cos]);

  const linkedPoIds = new Set(
    highlight === "None"
      ? []
      : links.filter((l) => l.from === highlight).map((l) => l.to),
  );

  return (
    <div
      data-slot="gs-outcome-map"
      data-highlight={highlight}
      className={cn("flex w-full flex-col gap-space-3", className)}
      onMouseLeave={() => onHighlightChange?.("None")}
      {...props}
    >
      {/* PEO strip */}
      <div className="flex flex-wrap items-center gap-space-2">
        <span className={cn(head, "shrink-0")}>PEO</span>
        {peos.map((n) => (
          <span
            key={n.id}
            className={cn(
              cell,
              "rounded-sm border border-border-subtle bg-bg-subtle px-space-2 py-0.5 font-mono text-text-secondary",
            )}
          >
            {n.label}
          </span>
        ))}
      </div>

      {/* Compact link table */}
      <div
        role="table"
        aria-label="Course outcome to program outcome map"
        className="w-full overflow-hidden rounded-md border border-border-subtle"
      >
        <div
          role="row"
          className="grid grid-cols-[3.25rem_minmax(0,1fr)_2.25rem_3.5rem] gap-x-space-2 border-b border-border-default bg-bg-subtle px-space-2 py-space-1.5"
        >
          <span role="columnheader" className={head}>
            CO
          </span>
          <span role="columnheader" className={head}>
            Course outcome
          </span>
          <span role="columnheader" className={cn(head, "text-center")}>
            Level
          </span>
          <span role="columnheader" className={cn(head, "text-right")}>
            PO
          </span>
        </div>

        <div role="rowgroup" className="flex flex-col">
          {links.map((link) => {
            const co = coById.get(link.from);
            const rowLit = highlight === "None" || highlight === link.from;
            const rowStrong = highlight === link.from;
            const poLit = linkedPoIds.has(link.to);
            return (
              <div
                key={`${link.from}-${link.to}-${link.level}`}
                role="row"
                tabIndex={onHighlightChange ? 0 : undefined}
                className={cn(
                  "grid grid-cols-[3.25rem_minmax(0,1fr)_2.25rem_3.5rem] gap-x-space-2 border-b border-border-subtle px-space-2 py-space-1.5 outline-none last:border-b-0",
                  "transition-colors duration-150 ease-out",
                  rowStrong && "bg-accent-glass-bg",
                  !rowLit && highlight !== "None" && "opacity-45",
                  onHighlightChange &&
                    "cursor-pointer hover:bg-bg-muted focus-visible:bg-bg-muted",
                )}
                onMouseEnter={() =>
                  onHighlightChange?.(link.from as OutcomeMapHighlight)
                }
                onFocus={() =>
                  onHighlightChange?.(link.from as OutcomeMapHighlight)
                }
              >
                <span
                  role="cell"
                  className={cn(
                    cell,
                    "font-mono tabular-nums",
                    rowStrong ? "text-accent-primary" : "text-text-primary",
                  )}
                >
                  {co?.label ?? link.from}
                </span>
                <span
                  role="cell"
                  className={cn(
                    cell,
                    "min-w-0 truncate text-text-secondary",
                  )}
                  title={co?.description}
                >
                  {co?.description ?? "—"}
                </span>
                <span role="cell" className="flex items-center justify-center">
                  <span
                    className={cn(
                      cell,
                      "inline-flex size-5 items-center justify-center rounded-full border font-mono",
                      rowStrong
                        ? "border-accent-primary text-accent-primary"
                        : "border-border-default text-text-secondary",
                    )}
                  >
                    {link.level}
                  </span>
                </span>
                <span
                  role="cell"
                  className={cn(
                    cell,
                    "text-right font-mono",
                    poLit || rowStrong
                      ? "text-accent-primary"
                      : "text-text-secondary",
                  )}
                >
                  {link.to}
                </span>
              </div>
            );
          })}
        </div>
      </div>

      {/* PO reference chips */}
      <div className="flex flex-wrap items-center gap-space-2">
        <span className={cn(head, "shrink-0")}>PO</span>
        {pos.map((n) => (
          <span
            key={n.id}
            className={cn(
              cell,
              "rounded-sm border px-space-2 py-0.5 font-mono",
              linkedPoIds.has(n.id)
                ? "border-accent-primary bg-accent-glass-bg text-accent-primary"
                : "border-border-subtle bg-bg-subtle text-text-secondary",
            )}
          >
            {n.label}
          </span>
        ))}
      </div>

      <p className={cn(cell, "text-text-muted")}>
        I = Introduced · E = Enabled · D = Demonstrated
      </p>
    </div>
  );
}
