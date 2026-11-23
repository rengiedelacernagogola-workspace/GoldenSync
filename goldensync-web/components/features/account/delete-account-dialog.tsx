"use client";

/**
 * DeleteAccountDialog — confirm account wipe (Figma `144:4409`, UI-100).
 * FLOW: type DELETE → sessionActive false → Login.
 */

import * as React from "react";

import { Backdrop } from "@/components/core/backdrop";
import { Button } from "@/components/core/button";
import { FormField } from "@/components/core/form-field";
import { Modal } from "@/components/core/modal";

export interface DeleteAccountDialogProps {
  open?: boolean;
  onClose?: () => void;
  onDeleted?: () => void;
}

/** Destructive confirm — Confirm stays disabled until typed DELETE. */
export function DeleteAccountDialog({
  open = false,
  onClose,
  onDeleted,
}: DeleteAccountDialogProps) {
  const [typed, setTyped] = React.useState("");
  const matches = typed.trim() === "DELETE";

  if (!open) return null;

  return (
    <div data-slot="gs-delete-account-dialog" className="fixed inset-0 z-50">
      <Backdrop onDismiss={onClose} />
      <div className="pointer-events-none absolute inset-0 flex items-center justify-center p-space-4">
        <div className="pointer-events-auto w-full max-w-md">
          <Modal
            title="Delete account"
            description="Deletes your account and every subject you own. Type DELETE to confirm."
            onClose={onClose}
            footer={
              <>
                <Button variant="Secondary" size="md" onClick={onClose}>
                  Cancel
                </Button>
                <Button
                  variant="Destructive"
                  size="md"
                  disabled={!matches}
                  onClick={() => {
                    if (!matches) return;
                    onDeleted?.();
                    onClose?.();
                  }}
                >
                  Delete account
                </Button>
              </>
            }
          >
            <FormField
              label="Confirmation"
              required
              inputProps={{
                value: typed,
                placeholder: "DELETE",
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
