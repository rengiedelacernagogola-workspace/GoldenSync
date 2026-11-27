// WHAT: Public exports for Figma “Proto” demo state (types, store, React hooks).
// HOW: Re-exports from `proto-types`, `proto-store`, `proto-hooks`.
// SCREEN: Demo Panel, auth/add-subject/calculator branches driven by proto variables.
// EDIT: When new proto fields or hooks are added — export them here.
// KEEP: UI-003 — features import `@/state`, not zustand directly.
// RISK: Low
/**
 * State barrel — Proto store only for UI-003.
 */

export {
  MAX_LOGIN_FAILURES,
  MAX_SUBJECTS,
  PROTO_DEFAULTS,
  type LoginOutcome,
  type PdfOutcome,
  type ProtoActions,
  type ProtoState,
  type ProtoStore,
  type SaveOutcome,
  type ScenarioId,
  type WeekState,
} from "@/state/proto-types";
export { createProtoStore, protoStore } from "@/state/proto-store";
export {
  useConflict,
  useDuplicateCode,
  useGradeScaleConfirmed,
  useHasSemester,
  useLoginFailCount,
  useLoginOutcome,
  usePdfOutcome,
  useProtoActions,
  useProtoField,
  useProtoState,
  useSaveOutcome,
  useScenario,
  useSessionActive,
  useSubjectCount,
  useSubjectSelected,
  useWeekState,
} from "@/state/proto-hooks";
