"use client";

// WHAT: Label + control slot + helper or error message for form inputs.
// SCREEN: Any labeled field — wraps Input, Textarea, or custom control.
// HOW: Clones child to wire id/htmlFor; shows error row when message + invalid.
// KEEP: Error message uses aria-live; helper hidden when error shown.
// EDIT: Compact (default) uses text-ui labels + tighter gap. RISK: Medium.

/**
 * FormField — Figma `FormField` `10:50`.
 * UI-012: Label + Input + helper (Default) or error row (Error). Required asterisk + aria-required.
 * Error: Input invalid + AlertCircle 14 + caption; helper hidden; aria-live polite on message.
 */

import { CircleAlert } from "lucide-react";
import * as React from "react";

import { cn } from "@/lib/utils";

import { Input, type InputProps, type InputSize } from "@/components/core/input";

export interface FormFieldProps {
  className?: string;
  label: string;
  /** Helper caption when not in error (Figma `helper`). */
  helper?: string;
  /** When set, Error state: invalid Input + error row (Figma `error`). */
  error?: string;
  required?: boolean;
  /** Figma `hasHelper` — show helper on Default when helper text exists. Default true. */
  hasHelper?: boolean;
  size?: InputSize;
  id?: string;
  /** Props forwarded to the nested Input (Figma exposed instance). */
  inputProps?: Omit<
    InputProps,
    "id" | "invalid" | "aria-describedby" | "aria-invalid" | "aria-required" | "size"
  >;
}

/**
 * GoldenSync FormField — always pair label with Input; never use placeholder as the label.
 */
export const FormField = React.forwardRef<HTMLInputElement, FormFieldProps>(
  function FormField(
    {
      className,
      label,
      helper,
      error,
      required = false,
      hasHelper = true,
      size = "Compact",
      id: idProp,
      inputProps,
    },
    ref,
  ) {
    const reactId = React.useId();
    const fieldId = idProp ?? `gs-field-${reactId}`;
    const helperId = `${fieldId}-helper`;
    const errorId = `${fieldId}-error`;
    const isError = Boolean(error);
    const showHelper = hasHelper && !isError && Boolean(helper);
    const describedBy = isError ? errorId : showHelper ? helperId : undefined;
    const isCompact = size === "Compact";

    return (
      <div
        data-slot="gs-form-field"
        data-state={isError ? "Error" : "Default"}
        data-size={size}
        className={cn(
          "flex w-full min-w-0 flex-col items-start",
          isCompact ? "gap-space-1" : "gap-space-2",
          className,
        )}
      >
        <div
          className={cn(
            "flex w-full items-start gap-space-1 font-medium whitespace-nowrap",
            isCompact ? "text-ui" : "text-body-sm",
          )}
          data-slot="gs-form-field-label-row"
        >
          <label htmlFor={fieldId} className="text-text-secondary">
            {label}
          </label>
          {required ? (
            <span className="text-status-error" aria-hidden>
              *
            </span>
          ) : null}
        </div>

        <Input
          ref={ref}
          id={fieldId}
          size={size}
          invalid={isError}
          required={required}
          aria-required={required || undefined}
          aria-describedby={describedBy}
          {...inputProps}
        />

        {showHelper ? (
          <p
            id={helperId}
            data-slot="gs-form-field-helper"
            className={cn(
              "w-full text-text-muted",
              isCompact ? "text-ui-sm" : "text-caption",
            )}
          >
            {helper}
          </p>
        ) : null}

        {isError ? (
          <div
            id={errorId}
            role="alert"
            aria-live="polite"
            data-slot="gs-form-field-error"
            className="flex w-full items-center gap-space-2"
          >
            <CircleAlert
              className="size-3.5 shrink-0 text-status-error"
              aria-hidden
              strokeWidth={2}
            />
            <p
              className={cn(
                "min-w-0 flex-1 text-status-error",
                isCompact ? "text-ui-sm" : "text-caption",
              )}
            >
              {error}
            </p>
          </div>
        ) : null}
      </div>
    );
  },
);
