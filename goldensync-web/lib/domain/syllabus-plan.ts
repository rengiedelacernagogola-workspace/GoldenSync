/**
 * Heuristic plan-week extraction from syllabus text — PURE.
 * Best-effort; users can edit topics on the Plan page after create.
 */

export type ExtractedPlanWeek = {
  weekNumber: number;
  topic: string;
};

/**
 * Pull "Week N … topic" lines from extracted PDF text.
 * Accepts: Week 1: Orientation · WEEK 02 - JSON · W3. APIs
 */
export function extractPlanWeeksFromText(text: string): ExtractedPlanWeek[] {
  if (!text.trim()) return [];

  const found = new Map<number, string>();
  const lineRe =
    /(?:^|\n)\s*(?:week|wk|w)\s*[#:]?\s*(\d{1,2})\s*(?:[:.\-–—|]|\s)+([^\n]{2,200})/gi;

  let match: RegExpExecArray | null;
  while ((match = lineRe.exec(text)) !== null) {
    const weekNumber = Number(match[1]);
    if (!Number.isFinite(weekNumber) || weekNumber < 1 || weekNumber > 30) {
      continue;
    }
    let topic = (match[2] ?? "").trim();
    topic = topic.replace(/\s{2,}/g, " ").replace(/[|;]+$/g, "").trim();
    if (topic.length < 2) continue;
    if (!found.has(weekNumber)) {
      found.set(weekNumber, topic.slice(0, 500));
    }
  }

  return [...found.entries()]
    .sort((a, b) => a[0] - b[0])
    .map(([weekNumber, topic]) => ({ weekNumber, topic }));
}
