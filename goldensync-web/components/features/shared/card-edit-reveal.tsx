"use client";

// WHAT: Header control — Eye reveals Edit; editing shows Save/Cancel.
// SCREEN: Faculty, policies, outcomes cards (headerBadge slot).
// HOW: Parent sets `editing`; this file handles reveal animation + focus traps.
// EDIT: Used by multiple panels — keep props generic (editAriaLabel, onSave).
// KEEP: Outside click + Escape collapse reveal without starting edit.

/**
 * Card header: Eye dissolves into Edit in the same slot.
 * FLOW: Eye → Edit (same spot) → Save/Cancel · Escape/outside collapses · Cancel/Save → Eye.
 */

import { Eye, Pencil } from "lucide-react";
import * as React from "react";

import { Button } from "@/components/core";
import { cn } from "@/lib/utils";

export type CardEditRevealProps = {
  editing: boolean;
  saving?: boolean;
  editAriaLabel: string;
  onBeginEdit: () => void;
  onCancel: () => void;
  onSave: () => void;
  saveLabel?: string;
  className?: string;
};

/** Eye ↔ Edit dissolve swap; Save/Cancel while editing. */
export function CardEditReveal({
  editing,
  saving = false,
  editAriaLabel,
  onBeginEdit,
  onCancel,
  onSave,
  saveLabel,
  className,
}: CardEditRevealProps) {
  const [revealed, setRevealed] = React.useState(false);
  const rootRef = React.useRef<HTMLDivElement>(null);
  const eyeRef = React.useRef<HTMLButtonElement>(null);
  const editRef = React.useRef<HTMLButtonElement>(null);
  const wasEditing = React.useRef(false);

  React.useEffect(() => {
    if (wasEditing.current && !editing) {
      setRevealed(false);
    }
    wasEditing.current = editing;
  }, [editing]);

  function collapseReveal(opts?: { restoreEye?: boolean }) {
    setRevealed(false);
    if (opts?.restoreEye) {
      window.setTimeout(() => eyeRef.current?.focus(), 0);
    }
  }

  React.useEffect(() => {
    if (!revealed || editing) return;

    function onPointerDown(e: PointerEvent) {
      const el = rootRef.current;
      if (!el) return;
      if (e.target instanceof Node && el.contains(e.target)) return;
      /* Outside click: leave focus on the clicked control. */
      collapseReveal();
    }

    function onKeyDown(e: KeyboardEvent) {
      if (e.key === "Escape") collapseReveal({ restoreEye: true });
    }

    document.addEventListener("pointerdown", onPointerDown);
    document.addEventListener("keydown", onKeyDown);
    return () => {
      document.removeEventListener("pointerdown", onPointerDown);
      document.removeEventListener("keydown", onKeyDown);
    };
  }, [revealed, editing]);

  React.useEffect(() => {
    if (!revealed || editing) return;
    window.setTimeout(() => editRef.current?.focus(), 0);
  }, [revealed, editing]);

  function handleCancel() {
    onCancel();
    collapseReveal({ restoreEye: true });
  }

  if (editing) {
    return (
      <div
        ref={rootRef}
        className={cn("flex items-center gap-space-2", className)}
      >
        <Button
          variant="Primary"
          size="sm"
          disabled={saving}
          onClick={onSave}
        >
          {saving ? "Saving…" : (saveLabel ?? "Save")}
        </Button>
        <Button
          variant="Ghost"
          size="sm"
          disabled={saving}
          onClick={handleCancel}
        >
          Cancel
        </Button>
      </div>
    );
  }

  return (
    <div ref={rootRef} className={cn("relative", className)}>
      {/* Fixed footprint ≈ Edit button so Eye↔Edit share the same spot */}
      <div className="relative inline-flex h-8 min-w-[4.75rem] items-center justify-end">
        <Button
          ref={eyeRef}
          variant="Ghost"
          size="sm"
          type="button"
          disabled={saving}
          tabIndex={revealed ? -1 : 0}
          aria-hidden={revealed}
          onClick={() => setRevealed(true)}
          aria-label="Show edit controls"
          title="Show edit"
          className={cn(
            "absolute inset-y-0 right-0 transition-opacity duration-150 ease-out",
            revealed
              ? "pointer-events-none opacity-0"
              : "opacity-100",
          )}
        >
          <Eye className="size-3.5" aria-hidden />
        </Button>

        <Button
          ref={editRef}
          variant="Secondary"
          size="sm"
          type="button"
          disabled={saving}
          tabIndex={revealed ? 0 : -1}
          aria-hidden={!revealed}
          onClick={onBeginEdit}
          aria-label={editAriaLabel}
          className={cn(
            "absolute inset-y-0 right-0 transition-opacity duration-150 ease-out",
            revealed
              ? "opacity-100"
              : "pointer-events-none opacity-0",
          )}
        >
          <Pencil className="size-3.5" aria-hidden />
          Edit
        </Button>
      </div>
    </div>
  );
}
