"use client";

// WHAT: Load one subject's detail for module pages (overview, plan, etc.).
// HOW: Signed in → GET /api/subjects/:id; signed out or demo id → goldenSyncSeed card fields.
// SCREEN: Subject title, code, units line in shell and page headers.
// EDIT: isProtoSeedId rules if demo subject ids change. KEEP: resolvedId stays URL id when signed in (avoids wrong API calls). RISK: Medium.

/**
 * Load subject detail from API when signed in; seed fallback for proto demos.
 * FLOW: subjectId → GET /api/subjects/:id → map for module shells.
 * RULE: never flash seed ITE-14 onto a live subject URL while loading.
 */

import { useAuth } from "@clerk/nextjs";
import * as React from "react";

import { goldenSyncSeed } from "@/data/seed";
import { ApiClientError } from "@/lib/api/client";
import {
  fetchSubjectDetail,
  type SubjectDetailDto,
} from "@/lib/api/subjects";
import { isSemesterPast } from "@/lib/domain/semester-year";

// WHAT: Flat view model pages consume (strings ready for UI, plus refresh).
export type LiveSubjectView = {
  ready: boolean;
  live: boolean;
  error: string | null;
  id: string;
  code: string;
  title: string;
  units: string;
  prerequisite: string;
  effectivity: string;
  semesterLabel: string;
  /** Subject’s owning semester ended before today (Asia/Manila). */
  semesterPast: boolean;
  detail: SubjectDetailDto | null;
  refresh: () => void;
};

// WHAT: True for demo ids like ite-14 — may 404 on API but should still show seed copy.
function isProtoSeedId(subjectId: string): boolean {
  return subjectId === "ite-14" || subjectId.startsWith("ite-");
}

/** Hook — resolves live subject or seed card for module pages. */
// WHAT: Main hook — pass route param subjectId. HOW: tick state forces refetch on refresh().
export function useLiveSubject(subjectId: string): LiveSubjectView {
  const { isLoaded, isSignedIn } = useAuth();
  const [detail, setDetail] = React.useState<SubjectDetailDto | null>(null);
  const [error, setError] = React.useState<string | null>(null);
  const [ready, setReady] = React.useState(false);
  const [tick, setTick] = React.useState(0);

  const seedCard =
    goldenSyncSeed.subjects.find((s) => s.id === subjectId) ??
    goldenSyncSeed.subjects[0]!;
  const seedDetail = goldenSyncSeed.activeSubject;
  const allowSeed = !isSignedIn || isProtoSeedId(subjectId);

  React.useEffect(() => {
    if (!isLoaded) return;
    let cancelled = false;
    setReady(false);
    setDetail(null);
    const handle = window.setTimeout(() => {
      void (async () => {
        if (!isSignedIn) {
          if (!cancelled) {
            setDetail(null);
            setError(null);
            setReady(true);
          }
          return;
        }
        try {
          const row = await fetchSubjectDetail(subjectId);
          if (cancelled) return;
          setDetail(row);
          setError(null);
        } catch (err) {
          if (cancelled) return;
          /* Seed ids (ite-14) 404 when signed in — keep seed display. */
          setDetail(null);
          setError(
            err instanceof ApiClientError && err.status === 404
              ? null
              : err instanceof ApiClientError
                ? err.message
                : "Could not load subject.",
          );
        } finally {
          if (!cancelled) setReady(true);
        }
      })();
    }, 0);
    return () => {
      cancelled = true;
      window.clearTimeout(handle);
    };
  }, [isLoaded, isSignedIn, subjectId, tick]);

  const live = Boolean(detail);
  /**
   * When signed in, keep the URL subject id even if the detail fetch fails.
   * Falling back to seed `ite-14` caused API calls like manual-checklist to 404.
   */
  const resolvedId = detail?.id ?? (isSignedIn ? subjectId : seedCard.id);

  const semesterLabel =
    detail?.semesterLabel ??
    (allowSeed ? goldenSyncSeed.semester.label : "—");

  return {
    ready: ready && isLoaded,
    live,
    error,
    id: resolvedId,
    code: detail?.courseCode ?? (allowSeed ? seedCard.code : "…"),
    title: detail?.title ?? (allowSeed ? seedCard.title : "Loading…"),
    units: detail?.units ?? (allowSeed ? String(seedCard.units) : "—"),
    prerequisite:
      detail?.prerequisite ??
      (allowSeed ? seedDetail.prerequisite : ""),
    effectivity:
      detail?.effectivity ?? (allowSeed ? seedDetail.effectivity : ""),
    semesterLabel,
    semesterPast: isSemesterPast(detail?.semesterEndDate),
    detail,
    refresh: () => setTick((t) => t + 1),
  };
}
