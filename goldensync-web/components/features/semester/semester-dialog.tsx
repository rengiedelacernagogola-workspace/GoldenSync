"use client";

/**
 * SemesterDialog — New semester (Figma `72:2721`+, UI-071).
 * FLOW: Dashboard NoSemester / SemesterPicker → create label · Max30 error.
 */

import * as React from "react";

import { useAuth } from "@clerk/nextjs";

import { Backdrop } from "@/components/core/backdrop";
import { Banner } from "@/components/core/banner";
import { Button } from "@/components/core/button";
import { Chip } from "@/components/core/chip";
import { FormField } from "@/components/core/form-field";
import { Modal } from "@/components/core/modal";
import { ApiClientError } from "@/lib/api/client";
import { createSemester } from "@/lib/api/semesters";
import { useProtoActions } from "@/state";

export interface SemesterDialogProps {
  open?: boolean;
  onClose?: () => void;
  onCreated?: (label: string) => void;
}

/** New semester form — skipped weeks via Chip multi-select. */
export function SemesterDialog({
  open = false,
  onClose,
  onCreated,
}: SemesterDialogProps) {
  const { isSignedIn } = useAuth();
  const { setHasSemester } = useProtoActions();
  const [label, setLabel] = React.useState("1st Semester AY 2026–2027");
  const [error, setError] = React.useState(false);
  const [apiError, setApiError] = React.useState<string | null>(null);
  const [saving, setSaving] = React.useState(false);
  const [skipped, setSkipped] = React.useState<number[]>([9]);

  if (!open) return null;

  function toggleWeek(w: number) {
    setSkipped((prev) =>
      prev.includes(w) ? prev.filter((x) => x !== w) : [...prev, w].sort(),
    );
  }

  async function handleCreate() {
    if (!label.trim() || label.length > 30) {
      setError(true);
      return;
    }
    setError(false);
    setApiError(null);

    if (isSignedIn) {
      setSaving(true);
      try {
        const start = new Date();
        const end = new Date(start);
        end.setMonth(end.getMonth() + 4);
        await createSemester({
          label: label.trim(),
          startDate: start.toISOString().slice(0, 10),
          endDate: end.toISOString().slice(0, 10),
          skippedWeeks: skipped,
        });
        setHasSemester(true);
        onCreated?.(label);
        onClose?.();
      } catch (err) {
        setApiError(
          err instanceof ApiClientError
            ? err.message
            : "Could not create semester.",
        );
      } finally {
        setSaving(false);
      }
      return;
    }

    setHasSemester(true);
    onCreated?.(label);
    onClose?.();
  }

  return (
    <div data-slot="gs-semester-dialog" className="fixed inset-0 z-50">
      <Backdrop onDismiss={onClose} />
      <div className="pointer-events-none absolute inset-0 flex items-center justify-center p-space-4">
        <div className="pointer-events-auto w-full max-w-lg">
          <Modal
            title="New semester"
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
                  onClick={() => void handleCreate()}
                  disabled={saving}
                >
                  {saving ? "Creating…" : "Create semester"}
                </Button>
              </>
            }
          >
            <div className="flex w-full flex-col gap-space-4">
              {error ? (
                <Banner
                  variant="Error"
                  message="Label is required (max 30 characters)."
                  hasAction={false}
                  className="w-full"
                />
              ) : null}
              {apiError ? (
                <Banner
                  variant="Error"
                  message={apiError}
                  hasAction={false}
                  className="w-full"
                />
              ) : null}
              <FormField
                label="Semester label"
                required
                error={
                  error && (!label.trim() || label.length > 30)
                    ? "Max 30 characters"
                    : undefined
                }
                inputProps={{
                  value: label,
                  maxLength: 40,
                  onChange: (e) => setLabel(e.target.value),
                }}
              />
              <div className="flex flex-col gap-space-2">
                <p className="text-body-sm font-medium text-text-secondary">
                  Skipped weeks
                </p>
                <div className="flex flex-wrap gap-space-2">
                  {[8, 9, 10, 11, 12].map((w) => (
                    <Chip
                      key={w}
                      label={`Week ${w}`}
                      selected={skipped.includes(w)}
                      onClick={() => toggleWeek(w)}
                    />
                  ))}
                </div>
              </div>
            </div>
          </Modal>
        </div>
      </div>
    </div>
  );
}
