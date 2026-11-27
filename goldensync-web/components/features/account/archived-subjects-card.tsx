"use client";

// WHAT: Read-only list of subjects the user archived (code, title, date).
// SCREEN: Account page section "Old subjects history".
// HOW: Fetches when `enabled` (signed in); no restore action here.
// KEEP: ArchivedSubjectsCard alias at bottom for old imports — prefer ArchivedSubjectsSection.
// RISK: None — display only; archive/restore happens elsewhere.

/**
 * Account — archived subjects history section (read-only, no outer Card).
 */

import * as React from "react";

import {
  fetchArchivedSubjects,
  type ArchivedSubjectDto,
} from "@/lib/api/account";
import { ApiClientError } from "@/lib/api/client";

function formatArchivedAt(iso: string | null): string {
  if (!iso) return "—";
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return "—";
  return d.toLocaleDateString(undefined, {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}

export type ArchivedSubjectsSectionProps = {
  enabled: boolean;
};

/** Lists archived subjects for the signed-in user. */
export function ArchivedSubjectsSection({
  enabled,
}: ArchivedSubjectsSectionProps) {
  const [items, setItems] = React.useState<ArchivedSubjectDto[]>([]);
  const [loading, setLoading] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);

  // HOW: `enabled` gates fetch — false when logged out clears list without calling API.
  React.useEffect(() => {
    if (!enabled) {
      setItems([]);
      setError(null);
      setLoading(false);
      return;
    }
    let cancelled = false;
    setLoading(true);
    setError(null);
    void (async () => {
      try {
        const rows = await fetchArchivedSubjects();
        if (!cancelled) setItems(rows);
      } catch (err) {
        if (!cancelled) {
          setError(
            err instanceof ApiClientError
              ? err.message
              : "Could not load archived subjects.",
          );
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [enabled]);

  return (
    <section className="flex w-full flex-col gap-space-3">
      <div className="flex w-full flex-col gap-space-1">
        <h3 className="text-heading-md text-text-primary">
          Old subjects history
        </h3>
        <p className="text-body-sm text-text-muted">
          Subjects you have archived.
        </p>
      </div>

      {!enabled ? (
        <p className="text-body-sm text-text-muted">
          Sign in to see your archived subjects.
        </p>
      ) : loading ? (
        <p className="text-body-sm text-text-muted">Loading history…</p>
      ) : error ? (
        <p className="text-body-sm text-status-error" role="alert">
          {error}
        </p>
      ) : items.length === 0 ? (
        <p className="text-body-sm text-text-muted">
          No archived subjects yet.
        </p>
      ) : (
        <ul
          className="flex w-full flex-col gap-space-2"
          aria-label="Archived subjects"
        >
          {items.map((row) => (
            <li
              key={row.id}
              className="flex w-full flex-col gap-space-1 rounded-md border border-border-subtle bg-bg-subtle px-space-4 py-space-3 sm:flex-row sm:items-center sm:justify-between"
            >
              <div className="min-w-0">
                <p className="truncate text-body-sm text-text-primary">
                  {row.courseCode}
                  <span className="text-text-muted"> · </span>
                  {row.title}
                </p>
                <p className="text-caption text-text-muted">
                  {row.semesterLabel}
                </p>
              </div>
              <p className="shrink-0 text-caption text-text-muted">
                Archived {formatArchivedAt(row.archivedAt)}
              </p>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}

/** @deprecated Prefer ArchivedSubjectsSection — kept for import compatibility. */
export const ArchivedSubjectsCard = ArchivedSubjectsSection;
