/**
 * Heuristic plan-week extraction from syllabus text — PURE.
 * Supports classic "Week N: topic" and CSU F-CID-010 "N Week(s)" teaching-plan blocks.
 */

export type ExtractedPlanWeek = {
  weekNumber: number;
  topic: string;
};

function cleanTopic(raw: string): string {
  return raw
    .replace(/\s{2,}/g, " ")
    .replace(/[|;]+$/g, "")
    .replace(/^●\s*/, "")
    .trim();
}

/**
 * Classic: Week 1: Orientation · WEEK 02 - JSON · W3. APIs
 */
function extractClassicWeekLines(text: string): ExtractedPlanWeek[] {
  const found = new Map<number, string>();
  const lineRe =
    /(?:^|\n)\s*(?:week|wk|w)\s*[#:]?\s*(\d{1,2})\s*(?:[:.\-–—|]|\s)+([^\n]{2,200})/gi;

  let match: RegExpExecArray | null;
  while ((match = lineRe.exec(text)) !== null) {
    const weekNumber = Number(match[1]);
    if (!Number.isFinite(weekNumber) || weekNumber < 1 || weekNumber > 30) {
      continue;
    }
    let topic = cleanTopic(match[2] ?? "");
    if (topic.length < 2) continue;
    if (!found.has(weekNumber)) {
      found.set(weekNumber, topic.slice(0, 500));
    }
  }

  return [...found.entries()]
    .sort((a, b) => a[0] - b[0])
    .map(([weekNumber, topic]) => ({ weekNumber, topic }));
}

/**
 * Pick a topic title from a CSU "N Week(s)" teaching-plan block.
 */
function topicFromCsuWeekBlock(block: string): string | null {
  const lines = block
    .split(/\r?\n/)
    .map((l) => l.trim())
    .filter(Boolean);
  if (lines.length === 0) return null;

  /* Prefer titled topic after a lone CO digit (1–9) line. */
  for (let i = 0; i < lines.length - 1; i++) {
    if (/^[1-9]$/.test(lines[i]!)) {
      const next = cleanTopic(lines[i + 1]!);
      if (
        next.length >= 4 &&
        !/^TLO\d/i.test(next) &&
        !/^Discussion/i.test(next) &&
        !/^Output/i.test(next) &&
        !/^Laboratory/i.test(next)
      ) {
        return next.slice(0, 500);
      }
    }
  }

  /* TLO line as topic when no title line. */
  const tlo = lines.find((l) => /^TLO\d+\s*:/i.test(l));
  if (tlo) {
    const topic = cleanTopic(tlo.replace(/^TLO\d+\s*:\s*/i, ""));
    if (topic.length >= 8) return topic.slice(0, 500);
  }

  /* First substantial prose line (orientation week). */
  for (const line of lines) {
    if (/^TLO\d/i.test(line)) continue;
    if (/^[1-9]$/.test(line)) continue;
    if (/^●/.test(line)) continue;
    if (/^(Discussion|Output|Laboratory|Midterm|Software\s*Project)/i.test(line)) {
      continue;
    }
    const topic = cleanTopic(line);
    if (topic.length >= 8) return topic.slice(0, 500);
  }

  return null;
}

/**
 * CSU PART III teaching plan: "N Week(s)" duration rows → sequential week numbers.
 * Expands 2/3-week blocks (and same-line summative rows) into multiple plan weeks.
 */
export function extractCsuOneWeekBlocks(text: string): ExtractedPlanWeek[] {
  const part3 = text.search(/PART\s*III/i);
  const part4 = text.search(/PART\s*IV/i);
  const section =
    part3 >= 0
      ? text.slice(part3, part4 > part3 ? part4 : undefined)
      : text;

  if (!/\d+\s*Weeks?/i.test(section)) return [];

  const all = [
    ...section.matchAll(/(?:^|\n)\s*(\d{1,2})\s*Weeks?\b[ \t]*([^\n]*)/gi),
  ];
  const ranges: Array<{ duration: number; sameLine: string; body: string }> =
    [];
  for (let i = 0; i < all.length; i++) {
    const cur = all[i]!;
    const duration = Number(cur[1]);
    if (!Number.isFinite(duration) || duration < 1 || duration > 8) continue;
    const matchStart = cur.index ?? 0;
    const afterMarker = matchStart + cur[0].length;
    const nextStart =
      i + 1 < all.length ? (all[i + 1]!.index ?? section.length) : section.length;
    ranges.push({
      duration,
      sameLine: cleanTopic(cur[2] ?? ""),
      body: section.slice(afterMarker, nextStart),
    });
  }

  const weeks: ExtractedPlanWeek[] = [];
  for (const range of ranges) {
    if (weeks.length >= 30) break;
    let topic: string | null = null;
    if (range.sameLine.length >= 8) {
      topic = range.sameLine.slice(0, 500);
    } else {
      topic = topicFromCsuWeekBlock(range.body);
    }
    if (!topic) continue;
    const count = Math.min(range.duration, 30 - weeks.length);
    for (let i = 0; i < count; i++) {
      weeks.push({ weekNumber: weeks.length + 1, topic });
    }
  }
  return weeks;
}

/**
 * Pull plan weeks from extracted PDF text (classic labels, then CSU N-Week blocks).
 */
export function extractPlanWeeksFromText(text: string): ExtractedPlanWeek[] {
  if (!text.trim()) return [];

  const classic = extractClassicWeekLines(text);
  if (classic.length > 0) return classic;

  return extractCsuOneWeekBlocks(text);
}
