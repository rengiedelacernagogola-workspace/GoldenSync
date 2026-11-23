/**
 * Proto types — 13 Figma Proto variables (collection `VariableCollectionId:1:122`).
 * UI-003: types + defaults only. Allowed values match plan 5.6 / Variable legend `198:195`.
 */

/** Login branch for P1 (Demo Panel + fail counter). */
export type LoginOutcome = "success" | "wrong" | "throttled";

/** PDF upload / parse branch for Add Subject. */
export type PdfOutcome =
  | "ok"
  | "invalid"
  | "toolarge"
  | "encrypted"
  | "ratelimited"
  | "scanned"
  | "timeout";

/** Save result after confirm. */
export type SaveOutcome = "ok" | "error";

/** This Week module state. */
export type WeekState =
  | "normal"
  | "before_start"
  | "after_end"
  | "no_class"
  | "no_plan";

/** Grade Calculator scenario id (Proto string). */
export type ScenarioId =
  | "PASSED"
  | "INT_A"
  | "UNDEFINED"
  | "INT_B"
  | "FAILED"
  | "INCOMPLETE";

/**
 * Snapshot of all 13 Proto fields (camelCase = Figma name without `proto/`).
 * Read-only shape; mutations go through ProtoActions.
 */
export interface ProtoState {
  readonly sessionActive: boolean;
  readonly hasSemester: boolean;
  readonly subjectCount: number;
  readonly subjectSelected: boolean;
  readonly loginOutcome: LoginOutcome;
  readonly loginFailCount: number;
  readonly pdfOutcome: PdfOutcome;
  readonly duplicateCode: boolean;
  readonly saveOutcome: SaveOutcome;
  readonly weekState: WeekState;
  readonly scenario: ScenarioId;
  readonly gradeScaleConfirmed: boolean;
  readonly conflict: boolean;
}

/**
 * Named intents — screens and Demo Panel call these; never raw field writes.
 * Implemented with zustand (Q-001 APPROVED); callers stay on this facade.
 */
export interface ProtoActions {
  /** Resets all fields to Figma Proto defaults (legend). */
  resetToDefaults: () => void;
  setSessionActive: (value: boolean) => void;
  setHasSemester: (value: boolean) => void;
  setSubjectCount: (value: number) => void;
  setSubjectSelected: (value: boolean) => void;
  setLoginOutcome: (value: LoginOutcome) => void;
  setLoginFailCount: (value: number) => void;
  /** Bumps fail count; at 5 sets loginOutcome to throttled (P1 throttle rule). */
  recordFailedLogin: () => void;
  setPdfOutcome: (value: PdfOutcome) => void;
  setDuplicateCode: (value: boolean) => void;
  setSaveOutcome: (value: SaveOutcome) => void;
  setWeekState: (value: WeekState) => void;
  setScenario: (value: ScenarioId) => void;
  setGradeScaleConfirmed: (value: boolean) => void;
  setConflict: (value: boolean) => void;
}

/** Full store contract used by hooks. */
export interface ProtoStore extends ProtoActions {
  getState: () => ProtoState;
  subscribe: (listener: () => void) => () => void;
}

/** Figma Proto defaults (piece 1.7 / plan 5.6). */
export const PROTO_DEFAULTS: ProtoState = {
  sessionActive: true,
  hasSemester: true,
  subjectCount: 3,
  subjectSelected: true,
  loginOutcome: "success",
  loginFailCount: 0,
  pdfOutcome: "ok",
  duplicateCode: false,
  saveOutcome: "ok",
  weekState: "normal",
  scenario: "PASSED",
  gradeScaleConfirmed: false,
  conflict: false,
};

/** Cap for active subjects in a semester (prototype). */
export const MAX_SUBJECTS = 20;

/** Wrong-password attempts before Throttled. */
export const MAX_LOGIN_FAILURES = 5;
