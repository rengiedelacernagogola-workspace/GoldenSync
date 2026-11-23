/**
 * ResultStatusBadge — Figma `ResultStatusBadge` `14:95`.
 * UI-017: wraps Badge md; label = status code verbatim (DEC-015). Never color-only.
 * Mapping: PASSED→Success · INTERVENTION_A→Accent · INTERVENTION_B|UNDEFINED_AT_THRESHOLD→Warning · FAILED→Error · INCOMPLETE→Default.
 */

import * as React from "react";

import {
  Badge,
  type BadgeSize,
  type BadgeVariant,
} from "@/components/core/badge";
import { cn } from "@/lib/utils";

/** Figma Status property — exact codes from draw.io / plan 9. */
export type ResultStatus =
  | "PASSED"
  | "INTERVENTION_A"
  | "INTERVENTION_B"
  | "FAILED"
  | "UNDEFINED_AT_THRESHOLD"
  | "INCOMPLETE";

const RESULT_STATUS_VARIANT: Record<ResultStatus, BadgeVariant> = {
  PASSED: "Success",
  INTERVENTION_A: "Accent",
  INTERVENTION_B: "Warning",
  FAILED: "Error",
  UNDEFINED_AT_THRESHOLD: "Warning",
  INCOMPLETE: "Default",
};

export interface ResultStatusBadgeProps
  extends Omit<React.HTMLAttributes<HTMLSpanElement>, "children"> {
  status?: ResultStatus;
  /** Exposed Badge size (Figma nested instance). Default md. */
  size?: BadgeSize;
}

/**
 * Calculator / ResultCard status pill — edit mapping in RESULT_STATUS_VARIANT only.
 */
export function ResultStatusBadge({
  className,
  status = "PASSED",
  size = "md",
  ...props
}: ResultStatusBadgeProps) {
  return (
    <Badge
      variant={RESULT_STATUS_VARIANT[status]}
      size={size}
      label={status}
      data-slot="gs-result-status-badge"
      data-status={status}
      className={cn(className)}
      {...props}
    />
  );
}

export { RESULT_STATUS_VARIANT };
