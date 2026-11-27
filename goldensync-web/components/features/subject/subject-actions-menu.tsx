"use client";

// WHAT: Overflow menu — Edit, Archive, Delete for the active subject.
// SCREEN: Core Menu with three MenuItems; Delete is styled destructive.
// HOW: Archive calls archiveSubject when signed in; Delete only invokes parent callback.
// EDIT: Proto path uses afterRemove to sync sidebar subject count without API.

/**
 * SubjectActionsMenu — Edit / Archive / Delete (Figma Menu Content=Menu, UI-053 related).
 * FLOW: Edit → navigate · Archive → POST archive (live) · Delete → parent opens confirm.
 */

import * as React from "react";

import { useAuth } from "@clerk/nextjs";

import { Menu } from "@/components/core/menu";
import { MenuItem } from "@/components/core/menu-item";
import { ApiClientError } from "@/lib/api/client";
import { archiveSubject } from "@/lib/api/subjects";
import { useProtoActions, useSubjectCount } from "@/state";

export interface SubjectActionsMenuProps {
  /** Live subject id for archive API. */
  subjectId?: string | null;
  onEdit?: () => void;
  onArchived?: () => void;
  onDeleted?: () => void;
  onError?: (message: string) => void;
  className?: string;
}

/** Overflow actions for the active subject. */
export function SubjectActionsMenu({
  subjectId = null,
  onEdit,
  onArchived,
  onDeleted,
  onError,
  className,
}: SubjectActionsMenuProps) {
  const { isSignedIn } = useAuth();
  const count = useSubjectCount();
  const { setSubjectCount, setSubjectSelected } = useProtoActions();
  const [archiving, setArchiving] = React.useState(false);

  // WHAT: Shared post-archive cleanup — decrements count and clears selection at zero.
  function afterRemove(cb?: () => void) {
    const next = Math.max(0, count - 1);
    setSubjectCount(next);
    if (next === 0) setSubjectSelected(false);
    cb?.();
  }

  async function handleArchive() {
    if (isSignedIn && subjectId) {
      setArchiving(true);
      try {
        await archiveSubject(subjectId);
        afterRemove(onArchived);
      } catch (err) {
        onError?.(
          err instanceof ApiClientError
            ? err.message
            : "Could not archive subject.",
        );
      } finally {
        setArchiving(false);
      }
      return;
    }
    afterRemove(onArchived);
  }

  return (
    <Menu aria-label="Subject actions" className={className}>
      <MenuItem label="Edit subject" onClick={onEdit} />
      <MenuItem
        label={archiving ? "Archiving…" : "Archive subject"}
        onClick={() => void handleArchive()}
      />
      <MenuItem label="Delete subject" destructive onClick={onDeleted} />
    </Menu>
  );
}
