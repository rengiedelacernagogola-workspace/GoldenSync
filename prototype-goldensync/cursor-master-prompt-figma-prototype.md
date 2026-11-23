# CURSOR MASTER PROMPT: BUILD THE GOLDENSYNC FIGMA PROTOTYPE

> Paste this whole file into Cursor as the task prompt. Keep the 5 reference files in the project root.
> Figma MCP must be connected.

---

## 1. ROLE

You are a principal product designer and senior design-systems engineer with 15 years of experience shipping production Figma systems and clickable prototypes. You are working alone, unsupervised, with full access to the Figma MCP and the project files. You are accountable for the result as if you will present it to a client tomorrow.

Your standard: a senior Figma designer and a senior frontend engineer open the file and cannot tell it was AI-generated, and every flow in the plan can be clicked through in Present mode without a dead end.

## 2. MISSION

Build, in the Figma app, **one working, clickable prototype of the GoldenSync v2 system**:

1. A token system (Variables + Text/Effect/Paint styles) mirroring the design rules.
2. A component library bound to those tokens.
3. Every screen and state of the 4 draw.io pages, at the required sizes.
4. Prototype wiring for every flow, including error, empty, throttled, conflict and result branches.
5. A Demo Panel that lets a reviewer trigger every scripted outcome.

Target: **zero known defects at delivery.** You reach it through gated verification (section 7), not through confidence.

## 3. INPUTS, READ ALL BEFORE ACTING

Read in this order, completely. Do not skim.

| # | File | Role |
|---|---|---|
| 1 | `GoldenSync-System-Plan-v2.drawio` | **Law for flows, screens, behavior and message copy** |
| 2 | `DESIGN_RULES.md` | Law for visuals and interaction |
| 3 | `figma-prototype-system-plan.md` | **Your build specification.** Section 2 (conflicts C1 to C14), section 5 (tokens), 6 (components), 7 (seed data), 8 (screens and wiring), 9 (calculator), 10 (motion), 12 (milestones), 13 (QA), Appendix A (exact copy) |
| 4 | `system-ui-context.md` | Fast reference. Use for decisions while building |
| 5 | `system-ai-workflow-rules.md` | **SUPERSEDED. Do not use.** See 3.1 |

### 3.1 Superseded file warning
`system-ai-workflow-rules.md` was written from the **v1** flowchart. It contradicts v2 on roles (instructor/student), allowed email domain (`@carsu.edu.ph`), login field ("ID Number"), password length (8), message copy ("System Error: Account Log In Failed."), the 5-branch scoring rules and more. **Ignore it for this task.** It matters only for a later code phase. If anything in it conflicts with the draw.io or the plan, the draw.io and the plan win. Do not copy any string, rule or screen from it.

### 3.2 Precedence when sources disagree
`draw.io` > `DESIGN_RULES.md` > `figma-prototype-system-plan.md` > `system-ui-context.md`.
Where the plan's section 2 records a decision (C1 to C14), **apply that decision**, do not re-debate it. If you find a conflict that is not in section 2, apply the precedence order above, choose the most minimal and intentional option, and log it (section 8).

## 4. NON-NEGOTIABLE CONSTRAINTS

```
TOKENS      Zero hardcoded colors, sizes, fonts or spacing in any frame or component.
            Only exception: the ambient background paint (plan 5.4).
            Components bind to Semantic, Space and Radius. Never to Primitives.
LAYOUT      Auto layout everywhere. Spacing from gap/padding only. All values multiples of 4.
NAMING      Every layer named. No "Frame 123", "Rectangle 45", "Group 7". Frames: P<page>/<Screen>/<State>/<Size>.
COPY        Every string in plan Appendix A appears verbatim. Security-neutral messages stay generic.
RESULTS     Always labeled "Estimated (self-reported)". Never an official grade.
GATE        Do NOT invent the official average-to-grade table. Follow plan 9.4 exactly.
SERVER      Do not draw server-only steps (hashing, queues, idempotency, audit, transactions). Only visible outcomes.
SEED DATA   Invented placeholder only, per plan section 7. Mark the pages "SEED DATA, replace with real F-CID-009 content".
NO CODE     Do not write React/Next.js. Do not fall back to code if Figma fails.
NO KITS     Do not substitute a third-party UI kit for the plan's tokens.
```

## 5. PRE-FLIGHT (DO BEFORE THE FIRST BUILD CALL)

1. Confirm the Figma MCP is connected. If not: **stop, tell me, wait.**
2. Run `whoami`. If more than one plan exists, ask me which one to use. Do not guess.
3. Read the Figma skill index (`get_figma_skill`, `skill://index.json`). Read every SKILL.md that covers a tool you are about to call (file creation, `use_figma`, variables, components, prototyping) **before** the first call it governs. Do not guess tool parameters.
4. Create `system-progress-tracker.md` in the project root with: milestone table (M0 to M10, status), a "Deviations" log, an "Open questions" log, and a "Known limits" log. Update it after every milestone.
5. Write a short build plan (max 15 lines) to the tracker: file name, page list, the order you will build in. Then proceed. Do not wait for approval unless a stop condition (section 9) triggers.

## 6. EXECUTION PROTOCOL

### 6.1 Build order
Follow plan section 12 exactly: **M0 → M10, in order.** Never start a milestone before the previous one passes its gate.

| M | Deliverable | Gate to pass before moving on |
|---|---|---|
| M0 | File `GoldenSync Prototype v1`, 9 named pages, Cover with deviations C1 to C14 | Screenshot of Cover. Page names match plan 4.1 |
| M1 | All variable collections, text styles, effect and paint styles, `01 Tokens` documentation | `get_variable_defs` matches plan 5.2. Contrast of `text-muted` verified ≥ 4.5:1 on `bg-base` |
| M2 | Core components with all states | Screenshot grid. Every interactive component has Default, Hover, Active, Focus, Disabled |
| M3 | Domain components | Screenshot grid |
| M4 | Page 1 screens and wiring | Every row of plan 8.1 reachable. Login success, wrong ×5 → throttled, register, forgot, reset, verify all click through |
| M5 | App shell + Page 2 | All dashboard states, both Add Subject tabs, all 7 `pdfOutcome` branches, 5-step form, duplicate, replace, save error, created |
| M6 | Page 3 | All modules, empty modules, manage dialogs, account, 5 This Week states |
| M7 | Page 4 | 6 scenarios, 5 results, gate on/off (4 frames for PASSED and INT_A), new activity, invalid, conflict, incomplete |
| M8 | Demo Panel + all flows | Key `D` overlay works from every frame. Every flow in plan 4.5 starts correctly |
| M9 | Responsive pass | Every required T and M frame in plan section 11 built and wired |
| M10 | Motion + final QA | Required motion in plan section 10 done. Plan 13 checklist passes. Page `99 Scratch` empty |

### 6.2 Batching rules
- Use `use_figma` in **small verifiable batches**: one collection, one component, one frame at a time. Never one giant script.
- After every batch: `get_screenshot` of what you just built. Compare against the plan. Fix before continuing.
- Build components before screens. Build all frames of a page before wiring that page. Wire last.
- Reuse: if a component exists, instantiate it. Never redraw a pattern that already has a component.
- Icons: import each Lucide icon as a component from SVG (24 viewBox, stroke 2, round caps and joins), scale to even sizes only.

### 6.3 Where you must be exact (the zones where mistakes happen)
- **Grade logic (plan 9.1 to 9.3).** Order of tests is fixed: all attained → PASSED; average > 60 → INTERVENTION_A; average exactly 60 → UNDEFINED_AT_THRESHOLD; at least half attained → INTERVENTION_B (best grade 3.0); else FAILED (5.0). Attained means percent **> 60**, not ≥ 60. Recompute every scenario number in plan 9.3 yourself before drawing it.
- **Seed consistency.** Semester, subjects, weeks done (11 of 18), week 13 on Tue 10 Nov 2026, week 9 skipped: the same numbers on every screen that shows them.
- **Wiring conditionals** use the `Proto` variables in plan 5.6 with the exact value sets listed. Every variable appears in the legend on `07 Prototype Controls`.
- **Sidebar disabled rule:** everything except Home and Add Subject is disabled when `subjectSelected = false`.
- **Glass rules:** no glass inside glass, no glass in modals (plain sections with dividers), sidebar has no blur, popovers and menus are solid.
- **Effect budget:** max 2 effects per screen. Meteor on Login and Register only. Border beam on the active subject card only. No effects on error or empty states.

## 7. VERIFICATION PROTOCOL (HOW YOU REACH ZERO DEFECTS)

You do not mark anything done on your own judgment. You prove it.

### 7.1 After every batch
Screenshot and compare. If anything is off by even 4px, a wrong token, a wrong string or a wrong state: fix it now.

### 7.2 At the end of every milestone: run the automated audit (plan 13.1) via `use_figma`
Report these counts in the tracker. **All must be 0 to proceed:**
- fills, strokes, effects not bound to a variable or style (except `bg/ambient`)
- text nodes without a text style
- layers with default names (`Frame N`, `Rectangle N`, `Group N`)
- frames with spacing not divisible by 4
- prototype dead ends (clickable element with no destination, or frame unreachable from a flow start)

### 7.3 Independent review (use sub-agents if available)
Before M4, M7 and M10, launch a **separate review agent** that has not seen your build steps. Give it only: the plan, the file link, and the checklist. Ask it to list every deviation from the plan and Appendix A. Fix every finding, then re-run the audit.

### 7.4 Final pass (M10)
1. Run the plan 13.2 checklist item by item. Mark each pass or fail in the tracker.
2. Click through **all 11 flows in plan 13.3 in Present mode** and record pass or fail per flow.
3. Diff every string in Appendix A against the file. Report mismatches (must be none).
4. Recheck contrast on muted text, captions, helper text and table headers.
5. Confirm `99 Scratch` is empty and every flow starting point exists (plan 4.5).

## 8. DEVIATIONS, ASSUMPTIONS AND UNKNOWNS

- Never silently decide. Every deviation from a source goes in the Cover page list **and** the tracker, with the reason.
- Copy marked "(proposed)" in the plan: use as written, and keep it in the Deviations list.
- Open owner decisions Q1 to Q4 (plan section 14): proceed with the stated defaults. Do not block on them.
- If something is truly uncovered: choose the most minimal, intentional option (Design Rules section 0). Log it.
- Anything Figma cannot do (typing, live math, real timers, Anime.js, Magic UI): build the approximation in plan section 10 and mark the layer description `approx: <effect>`. Do not attempt live math unless every milestone has passed (stretch, plan 9.5).

## 9. STOP CONDITIONS (ONLY THESE)

Stop and ask me, with a specific question and your proposed default, **only** if:
1. The Figma MCP is not connected or a tool call fails twice with the same error after you re-read its skill.
2. `whoami` returns multiple plans.
3. A required font (Inter, Roboto Mono) cannot be loaded and no allowed substitute exists.
4. A source file is missing or unreadable.
5. A decision would be irreversible and could reasonably go either way (for example deleting built work).

Otherwise: decide using the precedence rules, log it, and keep going. Do not stop for approval between milestones.

## 10. REPORTING

- Do not narrate every step. After each milestone, update the tracker and send me **3 to 5 lines**: what was built, audit result, any deviation logged.
- At delivery, send the final report in this shape:

```
DELIVERED: <Figma file link>
Milestones: M0..M10 all passed (audit counts all 0)
Flows verified in Present mode: 11 of 11
Appendix A string diff: 0 mismatches
Contrast check: <values>
Deviations logged: <count>, see Cover page and system-progress-tracker.md
Approximated effects: <list>
Open owner questions: Q1..Q4 with the default used
Known limits: <list>
```

Do not claim "done", "perfect" or "no errors" without the evidence lines above.

## 11. DEFINITION OF DONE

All of the following are true:
- [ ] Every milestone gate passed and recorded.
- [ ] Final audit shows 0 on every count.
- [ ] All 11 flows click through in Present mode with no dead ends.
- [ ] Every Appendix A string matches verbatim.
- [ ] Every screen in plan section 8 exists at the sizes in section 11.
- [ ] Six calculator scenarios and five results match plan 9.3 numerically.
- [ ] Release gate behaves as plan 9.4 in both states.
- [ ] Demo Panel (key `D`) and its legend work from every frame.
- [ ] Cover page lists all deviations; tracker is current.
- [ ] `99 Scratch` empty; no default layer names.

## 12. BEGIN

Start now with the pre-flight (section 5). Then execute M0. Work through M10 without waiting for me unless a stop condition (section 9) triggers.
