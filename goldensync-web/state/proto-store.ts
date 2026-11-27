// WHAT: In-memory store mirroring 13 Figma Proto variables + actions for Demo Panel.
// HOW: Vanilla zustand inside; `createProtoStore` caches snapshots for stable `getState`.
// SCREEN: Toggles login/pdf/week/scenario flags across prototype flows.
// EDIT: New setters in zustand slice + facade + `proto-types` defaults together.
// KEEP: `recordFailedLogin` enforces 5 failures → throttled (P1); export `protoStore` singleton.
// RISK: Medium — prototype only; production must use real auth/API state instead.
/**
 * Proto store — zustand implementation (Q-001 APPROVED).
 * Figma: Proto collection `1:122` · legend `198:195`.
 * Hooks keep the ProtoStore facade so screens stay library-agnostic.
 */

import { createStore } from "zustand/vanilla";

import {
  MAX_LOGIN_FAILURES,
  PROTO_DEFAULTS,
  type LoginOutcome,
  type PdfOutcome,
  type ProtoState,
  type ProtoStore,
  type SaveOutcome,
  type ScenarioId,
  type WeekState,
} from "@/state/proto-types";

type ProtoZustandState = ProtoState & {
  resetToDefaults: () => void;
  setSessionActive: (value: boolean) => void;
  setHasSemester: (value: boolean) => void;
  setSubjectCount: (value: number) => void;
  setSubjectSelected: (value: boolean) => void;
  setLoginOutcome: (value: LoginOutcome) => void;
  setLoginFailCount: (value: number) => void;
  recordFailedLogin: () => void;
  setPdfOutcome: (value: PdfOutcome) => void;
  setDuplicateCode: (value: boolean) => void;
  setSaveOutcome: (value: SaveOutcome) => void;
  setWeekState: (value: WeekState) => void;
  setScenario: (value: ScenarioId) => void;
  setGradeScaleConfirmed: (value: boolean) => void;
  setConflict: (value: boolean) => void;
};

const PROTO_KEYS = Object.keys(PROTO_DEFAULTS) as (keyof ProtoState)[];

/** Snapshot Proto fields only (no action methods). */
function toProtoState(s: ProtoZustandState): ProtoState {
  const out = {} as Record<keyof ProtoState, ProtoState[keyof ProtoState]>;
  for (const key of PROTO_KEYS) {
    out[key] = s[key];
  }
  return out as ProtoState;
}

/** Vanilla zustand store — shared by SSR-safe hooks. */
const zustandStore = createStore<ProtoZustandState>((set, get) => ({
  ...PROTO_DEFAULTS,
  resetToDefaults: () => set({ ...PROTO_DEFAULTS }),
  setSessionActive: (value) => set({ sessionActive: value }),
  setHasSemester: (value) => set({ hasSemester: value }),
  setSubjectCount: (value) => set({ subjectCount: value }),
  setSubjectSelected: (value) => set({ subjectSelected: value }),
  setLoginOutcome: (value) => set({ loginOutcome: value }),
  setLoginFailCount: (value) => set({ loginFailCount: value }),
  recordFailedLogin: () => {
    const next = get().loginFailCount + 1;
    if (next >= MAX_LOGIN_FAILURES) {
      set({ loginFailCount: next, loginOutcome: "throttled" });
      return;
    }
    set({ loginFailCount: next, loginOutcome: "wrong" });
  },
  setPdfOutcome: (value) => set({ pdfOutcome: value }),
  setDuplicateCode: (value) => set({ duplicateCode: value }),
  setSaveOutcome: (value) => set({ saveOutcome: value }),
  setWeekState: (value) => set({ weekState: value }),
  setScenario: (value) => set({ scenario: value }),
  setGradeScaleConfirmed: (value) => set({ gradeScaleConfirmed: value }),
  setConflict: (value) => set({ conflict: value }),
}));

/**
 * ProtoStore facade over zustand — same surface as UI-003 in-memory store.
 * FLOW: Demo Panel + screens call actions; React binds via proto-hooks.
 * RULE: Cache Proto snapshot — useSyncExternalStore needs stable getSnapshot refs.
 */
export function createProtoStore(): ProtoStore {
  let cached = toProtoState(zustandStore.getState());
  zustandStore.subscribe((s) => {
    cached = toProtoState(s);
  });

  return {
    getState: () => cached,
    subscribe: (listener) => zustandStore.subscribe(() => listener()),
    resetToDefaults: () => zustandStore.getState().resetToDefaults(),
    setSessionActive: (v) => zustandStore.getState().setSessionActive(v),
    setHasSemester: (v) => zustandStore.getState().setHasSemester(v),
    setSubjectCount: (v) => zustandStore.getState().setSubjectCount(v),
    setSubjectSelected: (v) => zustandStore.getState().setSubjectSelected(v),
    setLoginOutcome: (v) => zustandStore.getState().setLoginOutcome(v),
    setLoginFailCount: (v) => zustandStore.getState().setLoginFailCount(v),
    recordFailedLogin: () => zustandStore.getState().recordFailedLogin(),
    setPdfOutcome: (v) => zustandStore.getState().setPdfOutcome(v),
    setDuplicateCode: (v) => zustandStore.getState().setDuplicateCode(v),
    setSaveOutcome: (v) => zustandStore.getState().setSaveOutcome(v),
    setWeekState: (v) => zustandStore.getState().setWeekState(v),
    setScenario: (v) => zustandStore.getState().setScenario(v),
    setGradeScaleConfirmed: (v) =>
      zustandStore.getState().setGradeScaleConfirmed(v),
    setConflict: (v) => zustandStore.getState().setConflict(v),
  };
}

/** App-wide Proto store instance. */
export const protoStore: ProtoStore = createProtoStore();

/** Raw zustand API for tests / advanced selectors. */
export { zustandStore };
