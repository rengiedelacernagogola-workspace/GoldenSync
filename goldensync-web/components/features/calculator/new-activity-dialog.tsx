"use client";

/**
 * NewActivityDialog — add calculator activity (Figma `180:3966`, UI-113).
 * FLOW: Label + Max + ≥1 outcome Chip → Save · unmapped note from Appendix A.
 */

import * as React from "react";

import { Backdrop } from "@/components/core/backdrop";
import { Banner } from "@/components/core/banner";
import { Button } from "@/components/core/button";
import { Chip } from "@/components/core/chip";
import { FormField } from "@/components/core/form-field";
import { Modal } from "@/components/core/modal";
import { appendixA } from "@/copy";

const OUTCOMES = ["CO1", "CO2", "CO3", "CO4"] as const;

export interface NewActivityValues {
  label: string;
  maxScore: string;
  outcomes: string[];
}

export interface NewActivityDialogProps {
  open?: boolean;
  onClose?: () => void;
  onSave?: (values: NewActivityValues) => void;
}

/** New activity form — Save disabled until label, max, and ≥1 outcome. */
export function NewActivityDialog({
  open = false,
  onClose,
  onSave,
}: NewActivityDialogProps) {
  const [label, setLabel] = React.useState("Lab 4");
  const [maxScore, setMaxScore] = React.useState("50");
  const [selected, setSelected] = React.useState<string[]>(["CO3"]);

  const canSave =
    Boolean(label.trim()) &&
    Boolean(maxScore.trim()) &&
    !Number.isNaN(Number(maxScore)) &&
    Number(maxScore) > 0 &&
    selected.length >= 1;

  if (!open) return null;

  function toggleOutcome(code: string) {
    setSelected((prev) =>
      prev.includes(code) ? prev.filter((c) => c !== code) : [...prev, code],
    );
  }

  function handleSave() {
    if (!canSave) return;
    onSave?.({ label: label.trim(), maxScore, outcomes: selected });
    onClose?.();
  }

  return (
    <div data-slot="gs-new-activity-dialog" className="fixed inset-0 z-50">
      <Backdrop onDismiss={onClose} />
      <div className="pointer-events-none absolute inset-0 flex items-center justify-center p-space-4">
        <div className="pointer-events-auto w-full max-w-md">
          <Modal
            title="New activity"
            hasDescription={false}
            onClose={onClose}
            footer={
              <>
                <Button variant="Secondary" size="md" onClick={onClose}>
                  Cancel
                </Button>
                <Button
                  variant="Primary"
                  size="md"
                  disabled={!canSave}
                  onClick={handleSave}
                >
                  Save
                </Button>
              </>
            }
          >
            <div className="flex w-full flex-col gap-space-4">
              <FormField
                label="Label"
                required
                inputProps={{
                  value: label,
                  onChange: (e) => setLabel(e.target.value),
                }}
              />
              <FormField
                label="Max score"
                required
                inputProps={{
                  value: maxScore,
                  inputMode: "decimal",
                  onChange: (e) => setMaxScore(e.target.value),
                }}
              />
              <div className="flex flex-col gap-space-2">
                <p className="text-body-sm font-medium text-text-secondary">
                  Outcomes <span className="text-status-error">*</span>
                </p>
                <div className="flex flex-wrap gap-space-2">
                  {OUTCOMES.map((code) => (
                    <Chip
                      key={code}
                      label={code}
                      selected={selected.includes(code)}
                      onClick={() => toggleOutcome(code)}
                    />
                  ))}
                </div>
                <p className="text-caption text-text-muted">
                  Map to at least 1 outcome.
                </p>
              </div>
              <Banner
                variant="Info"
                message={appendixA.calculator.unmapped}
                hasAction={false}
                className="w-full"
              />
            </div>
          </Modal>
        </div>
      </div>
    </div>
  );
}
