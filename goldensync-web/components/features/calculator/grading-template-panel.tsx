"use client";

/**
 * Grading System template — load/edit/save Subject.grading.
 * FLOW: fetchSubjectDetail → ensureSubjectGradingTemplate → edit → patchSubject.
 */

import * as React from "react";

import { Button } from "@/components/core";
import { CoAssessmentTable } from "@/components/features/calculator/co-assessment-table";
import { GradeEquivalentTable } from "@/components/features/calculator/grade-equivalent-table";
import { GradeStatusTable } from "@/components/features/calculator/grade-status-table";
import { ApiClientError } from "@/lib/api/client";
import {
  ensureSubjectGradingTemplate,
  fetchSubjectDetail,
  patchSubject,
} from "@/lib/api/subjects";
import {
  cloneGradingTemplate,
  DEFAULT_GRADING_TEMPLATE,
  serializeGradingTemplate,
  tryParseGradingTemplate,
  type GradingTemplateDoc,
} from "@/lib/domain/grading-template";

export type GradingTemplatePanelProps = {
  subjectId: string | null;
  live: boolean;
};

/** Full Part IV editor for the calculator Grading System view. */
export function GradingTemplatePanel({
  subjectId,
  live,
}: GradingTemplatePanelProps) {
  const [doc, setDoc] = React.useState<GradingTemplateDoc | null>(() =>
    live ? null : cloneGradingTemplate(DEFAULT_GRADING_TEMPLATE),
  );
  const [baseline, setBaseline] = React.useState(() =>
    live
      ? ""
      : JSON.stringify(serializeGradingTemplate(DEFAULT_GRADING_TEMPLATE)),
  );
  const [loading, setLoading] = React.useState(false);
  const [saving, setSaving] = React.useState(false);
  const [saved, setSaved] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);

  const dirty =
    doc != null &&
    baseline !== "" &&
    JSON.stringify(serializeGradingTemplate(doc)) !== baseline;

  React.useEffect(() => {
    if (!live || !subjectId) {
      const defaults = cloneGradingTemplate(DEFAULT_GRADING_TEMPLATE);
      const handle = window.setTimeout(() => {
        setDoc(defaults);
        setBaseline(JSON.stringify(serializeGradingTemplate(defaults)));
        setError(null);
        setLoading(false);
      }, 0);
      return () => window.clearTimeout(handle);
    }

    let cancelled = false;
    setLoading(true);
    setError(null);
    const handle = window.setTimeout(() => {
      void (async () => {
        try {
          const detail = await fetchSubjectDetail(subjectId);
          if (cancelled) return;
          const storedParsed = tryParseGradingTemplate(detail.grading);
          const next = await ensureSubjectGradingTemplate(
            subjectId,
            detail.grading,
          );
          if (cancelled) return;
          setDoc(next);
          /*
           * Baseline must reflect what is stored. Unpersisted parse fallbacks
           * must not look “already default” or Reset→Save stays disabled.
           */
          if (storedParsed) {
            setBaseline(JSON.stringify(serializeGradingTemplate(storedParsed)));
          } else {
            const missing =
              detail.grading == null ||
              detail.grading === "" ||
              (typeof detail.grading === "object" &&
                !Array.isArray(detail.grading) &&
                Object.keys(detail.grading as object).length === 0);
            setBaseline(
              missing
                ? JSON.stringify(serializeGradingTemplate(next))
                : `__raw__:${JSON.stringify(detail.grading)}`,
            );
          }
        } catch (err) {
          if (cancelled) return;
          setError(
            err instanceof ApiClientError
              ? err.message
              : "Could not load grading template.",
          );
          setDoc(null);
          setBaseline("");
        } finally {
          if (!cancelled) setLoading(false);
        }
      })();
    }, 0);

    return () => {
      cancelled = true;
      window.clearTimeout(handle);
    };
  }, [live, subjectId]);

  function applyDefaultTemplate() {
    const defaults = cloneGradingTemplate(DEFAULT_GRADING_TEMPLATE);
    setDoc(defaults);
    /* Keep loaded baseline so Save stays off when already at default. */
    setSaved(false);
    setError(null);
  }

  async function handleSave() {
    if (!live || !subjectId || !doc || saving) return;
    setSaving(true);
    setError(null);
    setSaved(false);
    try {
      const payload = serializeGradingTemplate(doc);
      await patchSubject(subjectId, { grading: payload });
      setDoc(payload);
      setBaseline(JSON.stringify(payload));
      setSaved(true);
    } catch (err) {
      setError(
        err instanceof ApiClientError
          ? err.message
          : "Could not save grading template.",
      );
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="flex w-full min-w-0 flex-col gap-space-6">
      <div className="flex flex-col gap-space-2 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="text-body-sm text-text-secondary">
            Grading System Breakdown
          </p>
          <p className="text-caption text-text-muted">
            {!live
              ? "Demo defaults — sign in and open a saved subject to persist"
              : dirty
                ? "Unsaved changes"
                : saved
                  ? "Saved"
                  : "Inline-edit tables, then save"}
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-space-2">
          {live && !loading ? (
            <Button
              variant="Secondary"
              size="md"
              onClick={applyDefaultTemplate}
            >
              Reset to default
            </Button>
          ) : null}
          <Button
            variant="Primary"
            size="md"
            disabled={!live || !subjectId || !doc || !dirty || saving || loading}
            onClick={() => void handleSave()}
          >
            {saving ? "Saving…" : "Save Template"}
          </Button>
        </div>
      </div>

      {error ? (
        <p className="text-caption text-status-error" role="alert">
          {error}
        </p>
      ) : null}

      {loading ? (
        <p className="text-body-sm text-text-muted">Loading template…</p>
      ) : doc == null ? (
        <p className="text-body-sm text-text-muted">
          Could not load a grading template. Retry or use Reset to default.
        </p>
      ) : (
        <>
          <GradeStatusTable
            rows={doc.statusRows}
            onChange={(statusRows) =>
              setDoc((prev) => (prev ? { ...prev, statusRows } : prev))
            }
          />
          <GradeEquivalentTable
            rows={doc.equivalentRows}
            onChange={(equivalentRows) =>
              setDoc((prev) => (prev ? { ...prev, equivalentRows } : prev))
            }
          />
          <CoAssessmentTable
            groups={doc.coGroups}
            domainNote={doc.domainNote}
            onChangeGroups={(coGroups) =>
              setDoc((prev) => (prev ? { ...prev, coGroups } : prev))
            }
            onChangeDomainNote={(domainNote) =>
              setDoc((prev) => (prev ? { ...prev, domainNote } : prev))
            }
          />
        </>
      )}
    </div>
  );
}
