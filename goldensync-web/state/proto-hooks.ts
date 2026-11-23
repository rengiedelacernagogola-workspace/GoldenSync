"use client";

/**
 * Proto hooks — narrow selectors over protoStore (zustand under the hood, Q-001).
 * Features import these; do not import zustand directly from screens.
 */

import { useCallback, useSyncExternalStore } from "react";

import { protoStore } from "@/state/proto-store";
import type { ProtoState } from "@/state/proto-types";

/** Subscribes to the full Proto snapshot (prefer narrow hooks below). */
export function useProtoState(): ProtoState {
  return useSyncExternalStore(
    protoStore.subscribe,
    protoStore.getState,
    protoStore.getState,
  );
}

/** Selects one Proto field; re-renders only when that field changes. */
export function useProtoField<K extends keyof ProtoState>(
  key: K,
): ProtoState[K] {
  const select = useCallback(() => protoStore.getState()[key], [key]);
  return useSyncExternalStore(protoStore.subscribe, select, select);
}

/** Proto: sessionActive — session warning / expired. */
export function useSessionActive(): boolean {
  return useProtoField("sessionActive");
}

/** Proto: hasSemester — Dashboard empty-semester branch. */
export function useHasSemester(): boolean {
  return useProtoField("hasSemester");
}

/** Proto: subjectCount — cap at MAX_SUBJECTS (20). */
export function useSubjectCount(): number {
  return useProtoField("subjectCount");
}

/** Proto: subjectSelected — shell + calculator guard. */
export function useSubjectSelected(): boolean {
  return useProtoField("subjectSelected");
}

/** Proto: loginOutcome. */
export function useLoginOutcome(): ProtoState["loginOutcome"] {
  return useProtoField("loginOutcome");
}

/** Proto: loginFailCount. */
export function useLoginFailCount(): number {
  return useProtoField("loginFailCount");
}

/** Proto: pdfOutcome. */
export function usePdfOutcome(): ProtoState["pdfOutcome"] {
  return useProtoField("pdfOutcome");
}

/** Proto: duplicateCode. */
export function useDuplicateCode(): boolean {
  return useProtoField("duplicateCode");
}

/** Proto: saveOutcome. */
export function useSaveOutcome(): ProtoState["saveOutcome"] {
  return useProtoField("saveOutcome");
}

/** Proto: weekState. */
export function useWeekState(): ProtoState["weekState"] {
  return useProtoField("weekState");
}

/** Proto: scenario. */
export function useScenario(): ProtoState["scenario"] {
  return useProtoField("scenario");
}

/** Proto: gradeScaleConfirmed. */
export function useGradeScaleConfirmed(): boolean {
  return useProtoField("gradeScaleConfirmed");
}

/** Proto: conflict. */
export function useConflict(): boolean {
  return useProtoField("conflict");
}

/** Actions for Demo Panel and flow wiring (stable reference). */
export function useProtoActions() {
  return protoStore;
}
