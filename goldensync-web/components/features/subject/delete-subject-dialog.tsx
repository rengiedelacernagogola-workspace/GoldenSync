"use client";

/**
 * DeleteSubjectDialog — confirm delete (Figma `142:3935`, UI-099).
 * FLOW: type subject code → DELETE /api/subjects/:id (live) or Proto count − 1.
 */

import * as React from "react";

import { useAuth } from "@clerk/nextjs";

import { Backdrop } from "@/components/core/backdrop";
import { Banner } from "@/components/core/banner";
import { Button } from "@/components/core/button";
import { FormField } from "@/components/core/form-field";
import { Modal } from "@/components/core/modal";
import { ApiClientError } from "@/lib/api/client";
import { deleteSubject } from "@/lib/api/subjects";
import { useProtoActions, useSubjectCount } from "@/state";

export interface DeleteSubjectDialogProps {
  open?: boolean;
  subjectCode?: string;
  /** Live subject id — when set + signed-in, calls DELETE API. */
  subjectId?: string | null;
  onClose?: () => void;
  onDeleted?: () => void;
}

/** Destructive confirm — Confirm stays disabled until code matches. */
export function DeleteSubjectDialog({
  open = false,
  subjectCode = "ITE 14",
  subjectId = null,
  onClose,
  onDeleted,
}: DeleteSubjectDialogProps) {
  const { isSignedIn } = useAuth();
  const count = useSubjectCount();
  const { setSubjectCount, setSubjectSelected } = useProtoActions();
  const [typed, setTyped] = React.useState("");
  const [saving, setSaving] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);

  const matches = typed.trim() === subjectCode;
  const live = Boolean(isSignedIn && subjectId);

  if (!open) return null;

  async function handleDelete() {
    if (!matches) return;
    setError(null);

    if (live && subjectId) {
      setSaving(true);
      try {
        await deleteSubject(subjectId, typed.trim());
        const next = Math.max(0, count - 1);
        setSubjectCount(next);
        if (next === 0) setSubjectSelected(false);
        onDeleted?.();
        onClose?.();
      } catch (err) {
        setError(
          err instanceof ApiClientError
            ? err.message
            : "Could not delete subject.",
        );
      } finally {
        setSaving(false);
      }
      return;
    }

    const next = Math.max(0, count - 1);
    setSubjectCount(next);
    if (next === 0) setSubjectSelected(false);
    onDeleted?.();
    onClose?.();
  }

  return (
    <div data-slot="gs-delete-subject-dialog" className="fixed inset-0 z-50">
      <Backdrop onDismiss={onClose} />
      <div className="pointer-events-none absolute inset-0 flex items-center justify-center p-space-4">
        <div className="pointer-events-auto w-full max-w-md">
          <Modal
            title="Delete subject"
            description={`Type ${subjectCode} to confirm. This cannot be undone.`}
            onClose={onClose}
            footer={
              <>
                <Button variant="Secondary" size="md" onClick={onClose}>
                  Cancel
                </Button>
                <Button
                  variant="Destructive"
                  size="md"
                  disabled={!matches || saving}
                  onClick={() => void handleDelete()}
                >
                  {saving ? "Deleting…" : "Delete"}
                </Button>
              </>
            }
          >
            {error ? (
              <Banner
                variant="Error"
                message={error}
                hasAction={false}
                className="mb-space-4 w-full"
              />
            ) : null}
            <FormField
              label="Subject code"
              required
              inputProps={{
                value: typed,
                placeholder: subjectCode,
                onChange: (e) => setTyped(e.target.value),
                autoComplete: "off",
              }}
            />
          </Modal>
        </div>
      </div>
    </div>
  );
}
