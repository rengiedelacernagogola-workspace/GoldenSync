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
import {
  activeSemesterStorageKey,
  isSemesterPast,
} from "@/lib/domain/semester-year";
import { useProtoActions } from "@/state";

export type LiveSemester = {
  id: string;
  label: string;
  yearLevel: number;
  startDate: string;
  endDate: string;
};

export type LiveDataState = {
  ready: boolean;
  signedIn: boolean;
  me: { id: string; email: string; name: string | null } | null;
  semesters: LiveSemester[];
  /** Active semester used for subject list / create. */
  activeSemesterId: string | null;
  /** True when the active semester’s endDate is before today (Asia/Manila). */
  isActiveSemesterPast: boolean;
  subjects: SubjectDto[];
  error: string | null;
  /** Reload me/semesters/subjects. Optional preferId selects that semester after refresh. */
  refresh: (preferSemesterId?: string) => void;
  /** Switch active semester and reload its subjects (persists per user). */
  selectSemester: (semesterId: string) => Promise<void>;
};

export const LiveDataContext = React.createContext<LiveDataState | null>(null);

function readStoredSemesterId(userId: string): string | null {
  try {
    return window.localStorage.getItem(activeSemesterStorageKey(userId));
  } catch {
    return null;
  }
}

function writeStoredSemesterId(userId: string, semesterId: string) {
  try {
    window.localStorage.setItem(activeSemesterStorageKey(userId), semesterId);
  } catch {
    /* ignore quota / private mode */
  }
}

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
  const activeSemesterIdRef = React.useRef<string | null>(null);
  /** Explicit semester to prefer on next refresh (beats current valid ref). */
  const preferSemesterIdRef = React.useRef<string | null>(null);
  /** Monotonic owner for in-flight subject loads (selection / refresh / sign-out). */
  const requestOwnerRef = React.useRef(0);

  React.useEffect(() => {
    activeSemesterIdRef.current = activeSemesterId;
  }, [activeSemesterId]);

  React.useEffect(() => {
    if (!isLoaded) return;

    let cancelled = false;
    const owner = ++requestOwnerRef.current;
    const handle = window.setTimeout(() => {
      void (async () => {
        if (!isSignedIn) {
          if (cancelled || owner !== requestOwnerRef.current) return;
          setMe(null);
          setSemesters([]);
          setActiveSemesterId(null);
          setSubjects([]);
          setSubjectCount(0);
          setReady(true);
          setError(null);
          return;
        }
        try {
          const [profile, list] = await Promise.all([
            fetchMe(),
            fetchSemesters(),
          ]);
          if (cancelled || owner !== requestOwnerRef.current) return;
          setMe({
            id: profile.id,
            email: profile.email,
            name: profile.name,
          });
          const mapped: LiveSemester[] = list.map((s) => ({
            id: s.id,
            label: s.label,
            yearLevel: typeof s.yearLevel === "number" ? s.yearLevel : 1,
            startDate: s.startDate,
            endDate: s.endDate,
          }));
          setSemesters(mapped);
          setSessionActive(true);
          setHasSemester(mapped.length > 0);

          const override = preferSemesterIdRef.current;
          preferSemesterIdRef.current = null;
          const stored = readStoredSemesterId(profile.id);
          const preferred =
            (override && mapped.some((s) => s.id === override)
              ? override
              : null) ??
            (activeSemesterIdRef.current &&
            mapped.some((s) => s.id === activeSemesterIdRef.current)
              ? activeSemesterIdRef.current
              : null) ??
            (stored && mapped.some((s) => s.id === stored) ? stored : null) ??
            mapped[0]?.id ??
            null;
          setActiveSemesterId(preferred);
          if (preferred) {
            writeStoredSemesterId(profile.id, preferred);
          }

          if (!preferred) {
            setSubjects([]);
            setSubjectCount(0);
          } else {
            const subjectList = await fetchSubjects(preferred);
            if (cancelled || owner !== requestOwnerRef.current) return;
            if (activeSemesterIdRef.current !== preferred) return;
            setSubjects(subjectList);
            setSubjectCount(subjectList.length);
          }
          setError(null);
        } catch (err) {
          if (cancelled || owner !== requestOwnerRef.current) return;
          setMe(null);
          setSemesters([]);
          setActiveSemesterId(null);
          setSubjects([]);
          setHasSemester(false);
          setSubjectCount(0);
          setError(
            err instanceof ApiClientError
              ? err.message
              : "Could not load account data.",
          );
        } finally {
          if (!cancelled && owner === requestOwnerRef.current) setReady(true);
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

  const refresh = React.useCallback((preferSemesterId?: string) => {
    if (preferSemesterId) preferSemesterIdRef.current = preferSemesterId;
    setTick((t) => t + 1);
  }, []);

  const selectSemester = React.useCallback(
    async (semesterId: string) => {
      const match = semesters.find((s) => s.id === semesterId);
      if (!match) return;
      const owner = ++requestOwnerRef.current;
      setActiveSemesterId(semesterId);
      setSubjects([]);
      setSubjectCount(0);
      if (me?.id) writeStoredSemesterId(me.id, semesterId);
      try {
        const subjectList = await fetchSubjects(semesterId);
        if (owner !== requestOwnerRef.current) return;
        if (activeSemesterIdRef.current !== semesterId) return;
        setSubjects(subjectList);
        setSubjectCount(subjectList.length);
        setError(null);
      } catch (err) {
        if (owner !== requestOwnerRef.current) return;
        if (activeSemesterIdRef.current !== semesterId) return;
        setSubjects([]);
        setSubjectCount(0);
        setError(
          err instanceof ApiClientError
            ? err.message
            : "Could not load subjects for that semester.",
        );
      }
    },
    [semesters, me?.id, setSubjectCount],
  );

  const active = semesters.find((s) => s.id === activeSemesterId) ?? null;
  const isActiveSemesterPast = active
    ? isSemesterPast(active.endDate)
    : false;

  return {
    ready: ready && isLoaded,
    signedIn: Boolean(isSignedIn),
    me,
    semesters,
    activeSemesterId,
    isActiveSemesterPast,
    subjects,
    error,
    refresh,
    selectSemester,
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

/** Resolve the active semester row from live data. */
export function getActiveSemester(
  live: Pick<LiveDataState, "semesters" | "activeSemesterId">,
): LiveSemester | null {
  if (!live.activeSemesterId) return null;
  return live.semesters.find((s) => s.id === live.activeSemesterId) ?? null;
}
