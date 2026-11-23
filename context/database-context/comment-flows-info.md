# GOLDENSYNC: COMMENT AND FLOW INFO STANDARDS

> Every function and every non-obvious block in `goldensync-web/` gets a **short, plain, straight-to-the-point** comment so the owner can open the code later, find the right place fast, and edit logic safely.
> Written for humans first. Agents must follow this on every piece they create or change.
> Companions: `stack-code-standards.md` (how to code) · `coding-name-standards.md` (how to name) · `goldensync-checker-code.md` (what to build).

| Field | Value |
| --- | --- |
| Version | 1.0 |
| Created | 2026-11-20 |
| Applies to | `goldensync-web/` |
| Audience | Owner (manual edits) + Cursor agents |

---

## 0. PURPOSE

The prototype is complex (auth, PDF, subject form, modules, calculator, Proto vars). Without comments, only the agent that wrote a file remembers where a rule lives. This file makes the codebase **self-explaining at a glance**:

1. What this function does (one line)
2. Where it sits in the product flow (which screen / Proto / rule)
3. Why a tricky bit exists (only when needed)

**Goal:** the owner can search or skim comments and jump straight to the logic they want to change.

---

## 1. THE RULES (NON-NEGOTIABLE)

1. **Every function and method** gets a short comment directly above it. 
2. **Every complicated block** (branching, timers, Proto reads, grade math, PDF outcomes, multi-step form) gets a short inline or block comment that names the flow.
3. **Comments are short.** Prefer 1 line. Max 3 lines for hard logic. No essays.
4. **Plain English.** No jargon unless it is a product word (`loginOutcome`, `INT_A`, `CapReached`).
5. **Straight to the point.** Say what to edit here — not a restatement of the next line of code.
6. **Point to the map.** When useful, cite Figma frame, Proto var, or tracker piece in the comment.
7. **No noise.** Do not comment obvious one-liners like `return x + 1` or `const n = items.length`.
8. **Keep comments true.** If you change the logic, update the comment in the same edit.
9. **No commented-out code.** Delete it. History is git.
10. **File headers for modules that own a flow.** One short block at the top of feature/domain files that says what flow lives here.

---

## 2. WHAT “SHORT AND INFORMATIVE” MEANS

### 2.1 Good

```ts
/** Checks password attempts; after 5 failures show Throttled (P1). */
function shouldThrottleLogin(failCount: number): boolean {
  return failCount >= MAX_LOGIN_FAILURES;
}
```

```ts
// FLOW: Add Subject PDF → branch on pdfOutcome (ok | invalid | tooLarge | …)
switch (pdfOutcome) {
  // ...
}
```

```ts
/**
 * Grade Calculator — picks the strategy for the active Proto `scenario`.
 * Edit scenario rules in domain/services/grade-calculator/, not in the page.
 */
export class GradeCalculator {
```

### 2.2 Bad

```ts
// This function takes a number and returns a boolean
// Increment the counter
// TODO: fix later
/* lots of history about a bug from last week … */
```

---

## 3. FUNCTION COMMENT TEMPLATE

Put this **above every exported function, every method, and every non-trivial local function**:

```ts
/** <What it does>. <Where it belongs / what to edit>. */
```

Or two short lines when needed:

```ts
/**
 * <What it does in plain English.>
 * Flow: <screen or machine>. Proto/Figma: <name or node if useful>.
 */
```

| Include | Skip |
| --- | --- |
| Purpose in one sentence | Restating parameters one by one when names are clear |
| Product place (`Login throttle`, `PDF step 2`, `This Week`) | Long architecture lectures |
| Where related logic lives if split across files | Copy-pasting the prototype paragraph |
| Non-obvious rule (`cap is 20`, `gate hides grade`) | “Returns the result” with no meaning |

### 3.1 React components

```tsx
/**
 * StatusChip — topic progress label (Figma StatusChip).
 * States: NotStarted | InProgress | Completed. Pulse only when InProgress.
 */
export function StatusChip(props: StatusChipProps) {
```

Feature screens:

```tsx
/**
 * Login screen — Default / Loading / Error / Throttled (P1/Login/*).
 * Logic: features/auth (fail count + loginOutcome). Do not put rules in the page shell.
 */
export function LoginPage() {
```

### 3.2 Hooks

```ts
/** Proto: subjectCount. Used for Add Subject cap (20). */
export function useSubjectCount() {
```

### 3.3 Reducers / machines

```ts
/**
 * Upload machine — idle → processing → prefilled | rejected | error.
 * Matches P2 Add Subject PDF frames. Edit transitions here, not in the DropZone UI.
 */
export function uploadReducer(state: UploadState, event: UploadEvent): UploadState {
```

---

## 4. COMPLICATED CODE — FLOW MARKERS

When logic is branching, timed, or multi-step, mark it with a **FLOW** line so the owner can scan the file.

### 4.1 Pattern

```ts
// FLOW: <Name> — <step or branch>
// RULE: <short rule if needed>
```

### 4.2 Required places

| Area | Marker example |
| --- | --- |
| Login fail / throttle | `// FLOW: Login — failCount; at 5 → Throttled` |
| Session warning / expired | `// FLOW: Session — warning at idle; expired → draft kept` |
| PDF outcomes | `// FLOW: PDF — pdfOutcome → Rejected* / Processing / ParseError` |
| Manual subject steps 1–5 | `// FLOW: SubjectForm Step3 — autosave draft` |
| Duplicate / replace | `// FLOW: Duplicate course code — Open existing | Replace` |
| Cap reached | `// RULE: subjectCount >= 20 → CapReached` |
| This Week states | `// FLOW: This Week — weekState (Normal, BeforeStart, …)` |
| Calculator scenarios | `// FLOW: Calculator — scenario → Result*; gradeScaleConfirmed gate` |
| Conflict on save score | `// FLOW: Edit score — conflict → Reload` |
| Motion timings | `// RULE: nav 300ms / overlay 250ms / state 150ms ease-out` |

### 4.3 Section banners inside long files

For files over ~80 lines that own several concerns:

```ts
// ─── Proto selectors (read-only) ───
// ─── Login throttle logic ───
// ─── Map errors → Figma states ───
```

Use a light banner (as above). Do not draw ASCII art boxes.

---

## 5. FILE HEADER (FLOW MAP AT THE TOP)

Required on:

- Every file under `features/`
- Every file under `domain/services/`
- State machines / Proto store
- Any `page.tsx` that wires a product screen

Optional but encouraged on large `components/domain/` files.

```ts
/**
 * Feature: Add Subject (PDF + manual)
 * Flows: T-04 PDF ok · T-05 PDF failures · T-06 manual · T-07 cap
 * Proto: pdfOutcome, duplicateCode, saveOutcome, subjectCount
 * Figma: P2/AddSubject/*, P2/SubjectForm/*
 * Edit: parsing behind SyllabusParser; UI states in the machine below.
 */
```

Keep it to **5–7 lines max**.

---

## 6. LOGIC VS UI — SAY WHERE TO EDIT

Comments must help the owner avoid editing the wrong layer:

| If the change is… | Comment should point to… |
| --- | --- |
| Grade math / scenario rules | `domain/services/grade-calculator/` |
| Proto defaults / Demo Panel | `state/` + Demo Panel actions |
| Copy text | `copy/` — never hardcode in the component comment as if it lived there |
| Visual layout / tokens | Figma node + `components/…` |
| Validation messages | zod schema + `copy/` keys |
| Reachable screen state | state machine / Proto, not a random `useState` |

Example:

```ts
/** Maps repository errors to prototype banners. Edit copy in copy/, not here. */
function toUploadUiError(error: AppError): UploadRejection {
```

---

## 7. WHAT NOT TO COMMENT

- Imports
- Single-property getters that only return a field
- Types that are already clear from the name (`type SubjectId = …`) unless branded meaning is non-obvious
- JSX that only lays out prototype structure — prefer a file/component header instead of a comment on every `<div>`
- “Closing” comments (`// end if`)

---

## 8. LANGUAGE AND STYLE

- Use present tense: “Checks…”, “Maps…”, “Shows…”
- Prefer product words from Figma: `Throttled`, `CapReached`, `GateShown`
- Prefer Proto field names when the logic reads them: `loginOutcome`, `weekState`
- English only
- No emojis in comments
- No AI filler (“This comprehensive helper ensures…”)

---

## 9. AGENT CHECKLIST (EVERY PIECE)

Before marking a piece `BUILT`:

- [ ] Every new/changed function has a short comment
- [ ] Every complicated branch has a `FLOW` / `RULE` marker
- [ ] Feature / service / page files have a file header flow map
- [ ] Comments say **where to edit** when logic is split
- [ ] Figma frame or Proto name cited where it helps navigation
- [ ] No outdated comments left after logic changes
- [ ] No commented-out code

---

## 10. AUDIT (WITH MILESTONE GATES)

Run a quick pass with the name / fidelity gate:

| ID | Check | Pass |
| --- | --- | --- |
| CF-1 | Exported functions in the piece’s files have a leading comment | 100% |
| CF-2 | State machines / reducers have a FLOW header | yes |
| CF-3 | Proto reads/writes in the piece are marked | yes |
| CF-4 | No stale comments that contradict the code | 0 |
| CF-5 | Feature `page` / main module has file header | yes |

Report in the tracker as `CF-1…CF-5` when closing a milestone that shipped logic-heavy pieces (C5–C10 always; C1–C4 when functions exist).

---

## 11. EXAMPLES BY LAYER

### Domain

```ts
/**
 * Percentage 0–100. Invalid numbers cannot be constructed.
 * Used by scores and outcome averages — edit bounds here only.
 */
export class Percentage {
  /** Builds a Percentage or throws InvalidPercentageError. */
  static of(value: number): Percentage { /* … */ }
}
```

### Feature action

```ts
/**
 * Confirm Add Subject — duplicate → Open existing | Replace; else save.
 * FLOW: T-06 / T-04 end. Proto: duplicateCode, saveOutcome.
 */
export async function confirmAddSubject(draft: SubjectDraft) {
  // FLOW: Duplicate gate
  if (await subjects.existsActiveCode(draft.code)) { /* … */ }

  // FLOW: Save — saveOutcome ok | error
  return subjects.create(draft);
}
```

### UI handler

```ts
/** Submits login; bumps failCount on wrong password (Demo / Proto). */
function handleSubmit(values: LoginValues) {
  // FLOW: Login — loading then branch on loginOutcome
}
```

---

## 12. RELATION TO OTHER DOCS

| Topic | Doc |
| --- | --- |
| Comment **content and flow maps** | **This file** |
| “Why” for non-obvious engineering decisions | Also this file + `CDEC` in the tracker |
| Naming | `coding-name-standards.md` |
| Architecture / banned practices | `stack-code-standards.md` |
| Piece order / Figma nodes | `goldensync-checker-code.md` |

If `stack-code-standards.md` says comments explain **why**, this file adds: every function also gets a short **what + where in the flow**. Both apply. This file wins when the question is “did we leave a navigable comment for the owner?”

---

_GoldenSync Comment and Flow Info Standards v1.0 · keeps_ `goldensync-web/` _editable by the owner without guessing_
