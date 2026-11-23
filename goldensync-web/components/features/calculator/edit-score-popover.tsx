"use client";

/**
 * EditScorePopover — score editor (Figma `180:4693` · invalid `181:14`, UI-114).
 * FLOW: ActivityRow score click → popover · empty = not taken · Proto conflict banner.
 */

import { Minus, Plus } from "lucide-react";
import * as React from "react";

import { Banner } from "@/components/core/banner";
import { Button } from "@/components/core/button";
import { Input } from "@/components/core/input";
import { Popover } from "@/components/core/menu";
import { appendixA } from "@/copy";
import { cn } from "@/lib/utils";

export interface EditScorePopoverProps {
  open?: boolean;
  activity?: string;
  max?: number;
  value?: string;
  invalid?: boolean;
  conflict?: boolean;
  className?: string;
  onClose?: () => void;
  onSave?: (score: string) => void;
  onReloadConflict?: () => void;
}

/** Score out of max — step ±1; Save blocked when invalid. */
export function EditScorePopover({
  open = false,
  activity = "Quiz 1",
  max = 50,
  value = "45",
  invalid = false,
  conflict = false,
  className,
  onClose,
  onSave,
  onReloadConflict,
}: EditScorePopoverProps) {
  /* Parent remounts via key when opening a row — avoid setState-in-effect */
  const [score, setScore] = React.useState(value);

  if (!open) return null;

  const numeric = score.trim() === "" ? null : Number(score);
  const isInvalid =
    invalid ||
    (numeric !== null &&
      (Number.isNaN(numeric) || numeric < 0 || numeric > max));

  function bump(delta: number) {
    const base = score.trim() === "" || Number.isNaN(Number(score)) ? 0 : Number(score);
    const next = Math.min(max, Math.max(0, base + delta));
    setScore(String(next));
  }

  function handleSave() {
    if (isInvalid) return;
    onSave?.(score.trim());
    onClose?.();
  }

  return (
    <Popover
      data-slot="gs-edit-score-popover"
      aria-label={`Edit score for ${activity}`}
      className={cn("w-72 p-space-4", className)}
    >
      <div className="flex flex-col gap-space-3">
        <div>
          <p className="text-body-md font-medium text-text-primary">{activity}</p>
          <p className="text-caption text-text-muted">Score out of {max}</p>
        </div>

        {conflict ? (
          <Banner
            variant="Warning"
            message={appendixA.calculator.conflict}
            hasAction
            actionLabel="Reload"
            onAction={onReloadConflict}
            className="w-full"
          />
        ) : null}

        {isInvalid ? (
          <Banner
            variant="Error"
            message={appendixA.calculator.invalid}
            hasAction={false}
            className="w-full"
          />
        ) : null}

        <div className="flex items-center gap-space-2">
          <Button
            variant="Secondary"
            size="sm"
            aria-label="Decrease score"
            onClick={() => bump(-1)}
          >
            <Minus className="size-4" aria-hidden />
          </Button>
          <Input
            value={score}
            invalid={isInvalid}
            inputMode="decimal"
            placeholder="—"
            className="flex-1 text-center font-mono"
            onChange={(e) => setScore(e.target.value)}
          />
          <Button
            variant="Secondary"
            size="sm"
            aria-label="Increase score"
            onClick={() => bump(1)}
          >
            <Plus className="size-4" aria-hidden />
          </Button>
        </div>

        <p className="text-caption text-text-muted">
          Leave it empty if not taken yet.
        </p>

        <div className="flex justify-end gap-space-2">
          <Button variant="Ghost" size="sm" onClick={onClose}>
            Cancel
          </Button>
          <Button
            variant="Primary"
            size="sm"
            disabled={isInvalid}
            onClick={handleSave}
          >
            Save
          </Button>
        </div>
      </div>
    </Popover>
  );
}
