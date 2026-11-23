"use client";

/**
 * Sync Proto UI flags from live APIs when Clerk session is active.
 * FLOW: signed-in → GET /api/me + /api/semesters → subjects → setHasSemester / setSubjectCount.
 * Shared via LiveDataProvider so switcher + pages share one subject list.
 */

import { useAuth } from "@clerk/nextjs";
import * as React from "react";

import { ApiClientError } from "@/lib/api/client";
import {
  fetchMe,
  fetchSemesters,
  fetchSubjects,
  type SubjectDto,
} from "@/lib/api/semesters";
import { useProtoActions } from "@/state";

export type LiveSemester = {
  id: string;
  label: string;
  startDate: string;
  endDate: string;
};

export type LiveDataState = {
  ready: boolean;
  signedIn: boolean;
  me: { id: string; email: string; name: string | null } | null;
  semesters: LiveSemester[];
  /** Active semester used for subject list / create (first by default). */
  activeSemesterId: string | null;
  subjects: SubjectDto[];
  error: string | null;
  refresh: () => void;
};

export const LiveDataContext = React.createContext<LiveDataState | null>(null);

/** Internal state hook used by LiveDataProvider. */
export function useLiveDataState(): LiveDataState {
  const { isLoaded, isSignedIn } = useAuth();
  const { setSessionActive, setHasSemester, setSubjectCount } =
    useProtoActions();
  const [ready, setReady] = React.useState(false);
  const [me, setMe] = React.useState<LiveDataState["me"]>(null);
  const [semesters, setSemesters] = React.useState<LiveSemester[]>([]);
  const [activeSemesterId, setActiveSemesterId] = React.useState<string | null>(
    null,
  );
  const [subjects, setSubjects] = React.useState<SubjectDto[]>([]);
  const [error, setError] = React.useState<string | null>(null);
  const [tick, setTick] = React.useState(0);

  React.useEffect(() => {
    if (!isLoaded) return;

    let cancelled = false;
    const handle = window.setTimeout(() => {
      void (async () => {
        if (!isSignedIn) {
          if (cancelled) return;
          setMe(null);
          setSemesters([]);
          setActiveSemesterId(null);
          setSubjects([]);
          setReady(true);
          setError(null);
          return;
        }
        try {
          const [profile, list] = await Promise.all([
            fetchMe(),
            fetchSemesters(),
          ]);
          if (cancelled) return;
          setMe({
            id: profile.id,
            email: profile.email,
            name: profile.name,
          });
          setSemesters(
            list.map((s) => ({
              id: s.id,
              label: s.label,
              startDate: s.startDate,
              endDate: s.endDate,
            })),
          );
          setSessionActive(true);
          setHasSemester(list.length > 0);

          const semesterId = list[0]?.id ?? null;
          setActiveSemesterId(semesterId);

          if (!semesterId) {
            setSubjects([]);
            setSubjectCount(0);
          } else {
            const subjectList = await fetchSubjects(semesterId);
            if (cancelled) return;
            setSubjects(subjectList);
            setSubjectCount(subjectList.length);
          }
          setError(null);
        } catch (err) {
          if (cancelled) return;
          setError(
            err instanceof ApiClientError
              ? err.message
              : "Could not load account data.",
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
  }, [
    isLoaded,
    isSignedIn,
    tick,
    setHasSemester,
    setSessionActive,
    setSubjectCount,
  ]);

  const refresh = React.useCallback(() => setTick((t) => t + 1), []);

  return {
    ready: ready && isLoaded,
    signedIn: Boolean(isSignedIn),
    me,
    semesters,
    activeSemesterId,
    subjects,
    error,
    refresh,
  };
}

/**
 * Hook — bridges Clerk auth to dashboard Proto counts / subject switcher.
 * Must be used under LiveDataProvider (app/(app) layout).
 */
export function useLiveData(): LiveDataState {
  const ctx = React.useContext(LiveDataContext);
  if (!ctx) {
    throw new Error("useLiveData must be used within LiveDataProvider");
  }
  return ctx;
}
