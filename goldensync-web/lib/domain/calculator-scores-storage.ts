// WHAT: Save/load grade calculator “your score” fields in the browser only.
// HOW: JSON in localStorage key gs-calculator-scores:{subjectId}; “seed” for demo.
// SCREEN: Grade Calculator tab — scores are not on server until other flows save them.
// EDIT: Key prefix and payload shape (CalculatorScoresPayload).
// KEEP: Returns null on server (SSR) — components must guard window.
// RISK: Low for privacy (local only); Medium — lost if user clears storage.

/**
 * On-device Grade Calculator scores — localStorage per subject.
 * Key: gs-calculator-scores:{subjectId} (use "seed" for demo).
 */

export type CalculatorScoresPayload = {
  yourScores: Record<string, string>;
  maxScores: Record<string, string>;
  savedAt: string;
};

function storageKey(subjectId: string): string {
  const id = subjectId.trim() || "seed";
  return `gs-calculator-scores:${id}`;
}

function asStringMap(raw: unknown): Record<string, string> | null {
  if (raw == null || typeof raw !== "object" || Array.isArray(raw)) return null;
  const out: Record<string, string> = {};
  for (const [k, v] of Object.entries(raw as Record<string, unknown>)) {
    if (typeof v === "string") out[k] = v;
    else if (typeof v === "number" && Number.isFinite(v)) out[k] = String(v);
  }
  return out;
}

/** Read saved scores for a subject (null if missing/corrupt). */
export function loadCalculatorScores(
  subjectId: string,
): CalculatorScoresPayload | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = window.localStorage.getItem(storageKey(subjectId));
    if (!raw) return null;
    const parsed = JSON.parse(raw) as unknown;
    if (parsed == null || typeof parsed !== "object" || Array.isArray(parsed)) {
      return null;
    }
    const obj = parsed as Record<string, unknown>;
    const yourScores = asStringMap(obj.yourScores);
    const maxScores = asStringMap(obj.maxScores);
    if (!yourScores || !maxScores) return null;
    const savedAt =
      typeof obj.savedAt === "string" && obj.savedAt.trim()
        ? obj.savedAt
        : new Date().toISOString();
    return { yourScores, maxScores, savedAt };
  } catch {
    return null;
  }
}

/** Persist current score maps for a subject. */
export function saveCalculatorScores(
  subjectId: string,
  maps: {
    yourScores: Record<string, string>;
    maxScores: Record<string, string>;
  },
): boolean {
  if (typeof window === "undefined") return false;
  try {
    const payload: CalculatorScoresPayload = {
      yourScores: { ...maps.yourScores },
      maxScores: { ...maps.maxScores },
      savedAt: new Date().toISOString(),
    };
    window.localStorage.setItem(storageKey(subjectId), JSON.stringify(payload));
    window.dispatchEvent(new Event("gs-calculator-scores"));
    return true;
  } catch {
    return false;
  }
}

/** Remove saved scores for a subject (Reset All). */
export function clearCalculatorScores(subjectId: string): void {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.removeItem(storageKey(subjectId));
    window.dispatchEvent(new Event("gs-calculator-scores"));
  } catch {
    /* ignore */
  }
}

/**
 * Merge saved maps onto template task ids (drop stale keys, fill missing).
 */
export function mergeScoresOntoTemplate(
  taskIds: string[],
  emptyYour: Record<string, string>,
  defaultMax: Record<string, string>,
  saved: CalculatorScoresPayload | null,
): { yourScores: Record<string, string>; maxScores: Record<string, string> } {
  const yourScores: Record<string, string> = { ...emptyYour };
  const maxScores: Record<string, string> = { ...defaultMax };
  if (!saved) return { yourScores, maxScores };

  for (const id of taskIds) {
    if (Object.prototype.hasOwnProperty.call(saved.yourScores, id)) {
      yourScores[id] = saved.yourScores[id] ?? "";
    }
    if (Object.prototype.hasOwnProperty.call(saved.maxScores, id)) {
      const m = saved.maxScores[id];
      if (m != null && m.trim() !== "") maxScores[id] = m;
    }
  }
  return { yourScores, maxScores };
}

/** Collect task ids from a grading template-like structure. */
export function templateTaskIds(
  template: { coGroups: Array<{ tasks: Array<{ id: string }> }> },
): string[] {
  const ids: string[] = [];
  for (const g of template.coGroups) {
    for (const t of g.tasks) ids.push(t.id);
  }
  return ids;
}
