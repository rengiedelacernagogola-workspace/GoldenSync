"use client";

// WHAT: Text field marked doubtful after PDF import — user can fix the value.
// SCREEN: Add Subject review rows with warning tint and "Check this value".
// HOW: Core Input + alert icon; caption always visible (never color alone).
// KEEP: Expose a real input; placeholder "(editable)" when empty.
// EDIT: Warning styles and flagCaption here — not in add-subject feature code.
// RISK: Medium — must keep visible text for the flag (a11y).

/**
 * FlaggedField — PDF-prefilled doubtful field (Figma `40:1411`, UI-048).
 * FLOW: Add Subject review → warning tint + "Check this value" (never color alone).
 * RULE: Input exposed; Empty placeholder "(editable)".
 */

import { TriangleAlert } from "lucide-react";
import * as React from "react";

import { Input } from "@/components/core/input";
import { cn } from "@/lib/utils";

export interface FlaggedFieldProps
  extends Omit<React.ComponentProps<"input">, "size" | "className"> {
  className?: string;
  label?: string;
  /** Caption under the control (Appendix A / Figma default). */
  flagCaption?: string;
}

/**
 * Warning FormField-like control — edit value; flag row always visible.
 */
export function FlaggedField({
  className,
  label = "Prerequisite",
  flagCaption = "Check this value",
  id: idProp,
  disabled,
  placeholder = "(editable)",
  ...props
}: FlaggedFieldProps) {
  const reactId = React.useId();
  const inputId = idProp ?? `gs-flagged-${reactId}`;
  const flagId = `${inputId}-flag`;

  return (
    <div
      data-slot="gs-flagged-field"
      className={cn(
        "flex w-full max-w-[320px] flex-col items-start gap-space-2",
        className,
      )}
    >
      <label
        htmlFor={inputId}
        className="text-body-sm font-medium text-text-secondary"
      >
        {label}
      </label>

      <Input
        id={inputId}
        disabled={disabled}
        placeholder={placeholder}
        aria-describedby={flagId}
        className={cn(
          /* Warning shell over Input default border */
          "border-status-warning bg-[linear-gradient(90deg,var(--tint-warning-bg),var(--tint-warning-bg)),linear-gradient(90deg,var(--bg-subtle),var(--bg-subtle))]",
          "hover:border-status-warning",
          "focus-within:border-2 focus-within:border-border-focus",
          disabled && "opacity-50",
        )}
        {...props}
      />

      <div
        id={flagId}
        data-slot="gs-flagged-field-flag"
        className={cn(
          "flex w-full items-center gap-space-2",
          disabled && "opacity-50",
        )}
      >
        <TriangleAlert
          aria-hidden
          className="size-3.5 shrink-0 text-status-warning"
          strokeWidth={1.75}
        />
        <span className="text-caption whitespace-nowrap text-status-warning">
          {flagCaption}
        </span>
      </div>
    </div>
  );
}
