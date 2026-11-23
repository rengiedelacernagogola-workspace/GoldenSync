"use client";

/**
 * Checkbox — Figma `Checkbox` `12:100`.
 * UI-014: Hit 44×44 · Box 24 radius-md · Checked False|True × interactive states.
 * Unchecked: bg-subtle + border-strong. Checked: accent-primary + Check 16 text-inverse.
 * Error: status-error border + glow + optional error row (AlertCircle 14). DEC-011.
 */

import { Checkbox as CheckboxPrimitive } from "@base-ui/react/checkbox";
import { Check, CircleAlert } from "lucide-react";
import * as React from "react";

import { cn } from "@/lib/utils";

export interface CheckboxProps extends Omit<CheckboxPrimitive.Root.Props, "className"> {
  className?: string;
  /** Figma `label` — visible text beside the control. */
  label?: string;
  /** Figma `hasLabel` — hide label for checklist rows that name via row text. */
  hasLabel?: boolean;
  /** When set, Error state + message row (Figma `error`). */
  error?: string;
  /** Force invalid styling without a message. */
  invalid?: boolean;
}

/**
 * GoldenSync Checkbox — native Base UI checkbox inside a 44 hit target.
 */
export const Checkbox = React.forwardRef<HTMLButtonElement, CheckboxProps>(
  function Checkbox(
    {
      className,
      label = "Label",
      hasLabel = true,
      error,
      invalid = false,
      disabled,
      id: idProp,
      ...props
    },
    ref,
  ) {
    const reactId = React.useId();
    const controlId = idProp ?? `gs-checkbox-${reactId}`;
    const errorId = `${controlId}-error`;
    const isError = Boolean(error) || invalid;
    const showLabel = hasLabel && Boolean(label);

    return (
      <div
        data-slot="gs-checkbox"
        data-state={isError ? "Error" : undefined}
        className={cn(
          "relative flex",
          isError ? "flex-col items-start" : "items-center",
          disabled && "opacity-50",
          className,
        )}
      >
        <div className="flex items-center" data-slot="gs-checkbox-control">
          <span className="relative flex size-11 shrink-0 items-center justify-center">
            <CheckboxPrimitive.Root
              ref={ref}
              id={controlId}
              disabled={disabled}
              aria-invalid={isError || undefined}
              aria-describedby={error ? errorId : undefined}
              data-slot="gs-checkbox-root"
              className={cn(
                "peer flex size-6 shrink-0 items-center justify-center overflow-hidden rounded-md",
                "border border-border-strong bg-bg-subtle text-text-inverse",
                "transition-[background-color,border-color,box-shadow,opacity] duration-150 ease-out",
                "outline-none",
                "hover:bg-bg-muted",
                "active:border-border-focus",
                "focus-visible:shadow-[0_0_0_2px_var(--bg-base),0_0_0_4px_var(--border-focus)]",
                "data-checked:border-transparent data-checked:bg-accent-primary",
                "data-checked:hover:bg-[linear-gradient(0deg,rgba(255,255,255,0.1),rgba(255,255,255,0.1)),var(--accent-primary)]",
                "data-checked:active:border-border-focus data-checked:active:border",
                "aria-invalid:border-status-error",
                "aria-invalid:shadow-[0_0_0_3px_var(--error-ring-glow)]",
                "aria-invalid:data-checked:border-status-error",
                "disabled:pointer-events-none",
              )}
              {...props}
            >
              <CheckboxPrimitive.Indicator
                data-slot="gs-checkbox-indicator"
                className="flex items-center justify-center text-current"
              >
                <Check className="size-4" aria-hidden strokeWidth={2.5} />
              </CheckboxPrimitive.Indicator>
            </CheckboxPrimitive.Root>
          </span>
          {showLabel ? (
            <label
              htmlFor={controlId}
              className="cursor-pointer text-body-sm whitespace-nowrap text-text-secondary peer-disabled:cursor-not-allowed"
            >
              {label}
            </label>
          ) : null}
        </div>

        {error ? (
          <div
            id={errorId}
            role="alert"
            aria-live="polite"
            data-slot="gs-checkbox-error"
            className="flex items-center gap-space-2 pl-space-3"
          >
            <CircleAlert
              className="size-3.5 shrink-0 text-status-error"
              aria-hidden
              strokeWidth={2}
            />
            <p className="text-caption whitespace-nowrap text-status-error">{error}</p>
          </div>
        ) : null}
      </div>
    );
  },
);
