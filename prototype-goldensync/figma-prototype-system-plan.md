# GOLDENSYNC: FIGMA PROTOTYPE SYSTEM PLAN

> Instruction file for Cursor. Build a **working, clickable prototype in the Figma app** of the GoldenSync v2 system.
> Version 1.0 · written 2026-11-10 · Inputs: `GoldenSync-System-Plan-v2.drawio` (flows) + `DESIGN_RULES.md` (visuals)

---

## 0. READ THIS FIRST

### 0.1 Goal

Produce one Figma **Design** file containing:

1. A token system (Figma Variables + Text/Effect/Paint styles) that mirrors `DESIGN_RULES.md`.
2. A component library built on those tokens.
3. Every screen and state implied by the 4 pages of the draw.io plan, at desktop and mobile sizes.
4. Prototype wiring so a reviewer can click through every flow in Figma's Present mode, including the error, empty, throttled and result branches.

### 0.2 Non-goals

- No React/Next.js code. No backend. No real parsing, hashing, queues, or timers.
- Do **not** draw server-only steps (argon2id, dummy hash, idempotency key, audit log, worker sandbox, unique index, transactions). Only their **visible outcomes** (messages, states, banners) become screens.

### 0.3 Source-of-truth order

| Priority | Source                             | Governs                                                                             |
| -------- | ---------------------------------- | ----------------------------------------------------------------------------------- |
| 1        | `GoldenSync-System-Plan-v2.drawio` | What screens exist, flow order, branches, limits, exact message copy                |
| 2        | `DESIGN_RULES.md`                  | Colors, glass, type, spacing, components, motion intent, accessibility              |
| 3        | This file                          | How to translate 1 and 2 into Figma, plus decisions where they disagree (section 2) |

If something is not covered anywhere: choose the most minimal, intentional option (Design Rules section 0). Never the default.

### 0.4 Working rules

- Work in **milestones** (section 12). After each milestone, take a screenshot of every new frame and compare it to this file before moving on.
- **Zero hardcoded colors, sizes or fonts** in frames or components. Everything binds to a variable or style. One documented exception: the ambient background paint (section 5.4).
- Use **auto layout everywhere**. Spacing comes from `gap`/`padding`, never from nudged positions (Design Rules 5.2).
- Name every layer. No `Frame 123` or `Rectangle 45` left in the file.
- All seed data is **invented placeholder content**. Mark it with the page-level note `SEED DATA, replace with real F-CID-009 content`.

---

## 1. WHAT A FIGMA PROTOTYPE CAN AND CANNOT DO

Design around these limits instead of fighting them.

| Need in the system                                                  | Figma reality                                        | What to build                                                                                                                                       |
| ------------------------------------------------------------------- | ---------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------- |
| Typing in email, password, scores                                   | Design prototypes have **no native text entry**      | Pre-filled text layers styled as inputs. Fields show Default/Focus/Error/Filled via variants. Demo outcomes are chosen by prototype variables (5.6) |
| Server decisions (valid token, throttled, version conflict)         | No backend                                           | Branch with **variables + conditionals**, or via the Demo Panel (8.6)                                                                               |
| Math (outcome percent, average, status)                             | Number variables and expressions exist but are heavy | **Scenario-driven** calculator (section 9). Six scripted scenarios cover every status. Live math is stretch only                                    |
| Polling every 2 s up to 60 s                                        | None                                                 | A 3-step chained animation of about 3 s                                                                                                             |
| Anime.js, Magic UI (BorderBeam, Meteor, NumberTicker, AnimatedBeam) | Not available                                        | Static or Smart Animate approximations (section 10). Mark each as `approx` in the layer description                                                 |
| `prefers-reduced-motion`                                            | Not detectable                                       | Keep motion short and purposeful. Note in the file's cover: "Reduced-motion behavior specified in DESIGN_RULES 13, applies in code"                 |
| Real file picker / PDF                                              | None                                                 | Drop zone with a "Select file" click that jumps to the Selected state                                                                               |
| Real time (session minute 28, planner "today")                      | None                                                 | Static "today" = **Tuesday 10 Nov 2026 (Asia/Manila)**. Session warning triggered from the Demo Panel                                               |

If the team later needs genuine typing and live math, that is a separate **Figma Make / code** task. Do not attempt it here.

---

## 2. CONFLICTS FOUND AND DECISIONS TAKEN

These were found by cross-reading the two input files. Apply the **Decision** column. Record every deviation on the Cover page under "Deviations from DESIGN_RULES".

| ID  | Conflict                                                                                                                                                                                | Decision                                                                                                                                                                               |
| --- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| C1  | `color-text-muted` (white at 40%) measures **3.77:1** on `bg-base`, but Design Rules 13 and 16 require 4.5:1 for normal text, and captions, helper text and table headers all use muted | Override: set `color-text-muted` to **white at 50%** (about 5:1, verify with a contrast check). Keep `text-disabled` at 25% (disabled text is exempt). **Needs owner confirmation**    |
| C2  | Placeholder color is `text-muted` in 7.2 but `text-disabled` in 4.3                                                                                                                     | Use `text-muted` (after C1). `text-disabled` at 25% is about 2.1:1 and would make placeholders unreadable                                                                              |
| C3  | Principle 3 bans gradients on text, but 8.2 allows `AnimatedGradientText` on the dashboard heading                                                                                      | Follow the prohibition. Dashboard title is solid `text-primary`. Gradient text is not built                                                                                            |
| C4  | Legend says Add Subject opens "the same **dialog**"; Routes page lists `/subjects/new` as a route                                                                                       | Build a **modal dialog** (`glass-lg`, max width 960, internal scroll) over the current screen. Full-screen on mobile (Design Rules 9.2). Keep `/subjects/new` as the frame-name suffix |
| C5  | Design Rules name the CTA "Sync Syllabus"; draw.io names the action "Add Subject"                                                                                                       | Navigation, dashboard button and calculator button say **Add Subject**. The submit button on the Upload tab says **Sync Syllabus**                                                     |
| C6  | Grid margin 48px at 1280 (6.1) vs page padding 32px (5.2)                                                                                                                               | Layout grid with 48px margin on full-viewport frames (auth). Inside the app shell, the content area uses 32px padding and a 12-column subgrid with 24px gutters                        |
| C7  | Design Rules have 3 topic statuses (Not Started / In Progress / Completed); the Checklist only toggles "week done"                                                                      | Status is **derived**: done = Completed; not done and the current week = In Progress; otherwise Not Started. Toggling still only flips done                                            |
| C8  | "Never stack glass on glass" vs a modal (glass-lg) containing a multi-section form                                                                                                      | Inside modals use **plain sections separated by `border-subtle` dividers**. No cards, no glass inside modals                                                                           |
| C9  | Calculator validation text in the draw.io lost its symbols ("0 0, up to 2 decimals, max 10000")                                                                                         | Interpret as: `0 ≤ score ≤ max`, `max > 0`, up to 2 decimals, `max ≤ 10000`. Error copy stays "Fix the value. Nothing is saved."                                                       |
| C10 | Sidebar is `glass-sm` (3.1 table) but "no backdrop-filter on sidebar" (3.2)                                                                                                             | Sidebar: fill `bg-elevated`, right border `border-subtle`, **no background blur**                                                                                                      |
| C11 | Design Rules say "Sign Out"; draw.io says "Logout"                                                                                                                                      | Use **Log out** (draw.io wins on copy)                                                                                                                                                 |
| C12 | Design Rules list four breakpoints (1920/1280/768/375)                                                                                                                                  | Build **1280 desktop (master)**, **768 tablet** and **375 mobile**. 1920 is a stretch (one dashboard frame to prove the 3-column grid and 1400 max width)                              |
| C13 | Design Rules cap Magic UI at 2 effects per screen and meteor on auth only                                                                                                               | Meteor shower (static) on **Login and Register only**. No other effects elsewhere except BorderBeam on the active subject card                                                         |
| C14 | Modal radius not specified                                                                                                                                                              | Use 16px (`radius-xl`). Flag as an assumption                                                                                                                                          |

---

## 3. WORKFLOW AND TOOLING FOR CURSOR

Use the **Figma MCP** server if connected. Do not guess tool parameters. Load the relevant skill first.

1. `whoami`. Get the plan key. If the user has more than one plan, ask which one.
2. `get_figma_skill` with `skill://index.json`. Read the skills for creating files and for `use_figma`, plus any about variables, components or design systems. Read each SKILL.md **before** the first call that it covers.
3. `create_new_file` (`editorType: "design"`, name `GoldenSync Prototype v1`).
4. Build with `use_figma` (Plugin API operations) in **small, verifiable batches**: one collection, one component, one frame at a time. Never one giant script.
5. After each batch: `get_screenshot` of the affected frame. Fix before continuing.
6. Use `get_variable_defs` to confirm variables exist and are bound.
7. Use `search_design_system` / `get_libraries` only to check for an existing library. **Do not** substitute a third-party UI kit for the tokens in section 5.
8. Icons: Lucide is not native to Figma. Create each icon as a component from its Lucide SVG (24px viewBox, stroke 2, round caps and joins) via SVG import in `use_figma`, then scale to 14/16/20/24/64px sizes (Design Rules 10). Icon list in 6.3.
9. Wire prototype interactions **last** for each page, after all frames exist.
10. End of each milestone: run the audit script (section 13.1) and paste its result into the Cover page.

If the MCP is not connected, tell the user, stop, and ask them to connect it. Do not fall back to producing code.

---

## 4. FILE STRUCTURE

### 4.1 Pages

| Page                         | Contents                                                                                                            |
| ---------------------------- | ------------------------------------------------------------------------------------------------------------------- |
| `00 Cover`                   | Title, version, purpose, how to present, deviations list (section 2), seed-data warning, link to the draw.io source |
| `01 Tokens`                  | Visual documentation of all variables and styles (swatches, type specimens, glass samples, spacing ruler)           |
| `02 Components`              | All components with every variant, labeled on a grid                                                                |
| `03 Auth`                    | Page 1 screens                                                                                                      |
| `04 Dashboard + Add Subject` | Page 2 screens                                                                                                      |
| `05 Subject Modules`         | Page 3 screens                                                                                                      |
| `06 Grade Calculator`        | Page 4 screens                                                                                                      |
| `07 Prototype Controls`      | Demo Panel frame and the variable legend (8.6)                                                                      |
| `99 Scratch`                 | Throwaway. Must be empty at delivery                                                                                |

### 4.2 Frame naming

`P<page>/<Screen>/<State>/<Size>` with sizes `D` (1280), `T` (768), `M` (375).
Examples: `P1/Login/Default/D`, `P3/ThisWeek/NoClass/D`, `P4/Result/IntB/M`.

### 4.3 Frame sizes and grids

| Size | Frame                                           | Layout grid                                |
| ---- | ----------------------------------------------- | ------------------------------------------ |
| D    | 1280 × 800 viewport, content scrolls vertically | 12 col, gutter 24, margin 48 (full frames) |
| T    | 768 × 1024                                      | 8 col, gutter 16, margin 24                |
| M    | 375 × 812                                       | 4 col, gutter 16, margin 16                |

Scroll setup: root frame clips content, content frame is taller and scrolls vertically in prototype, and the **sidebar and top bar layers are set to Fixed**.

### 4.4 Sections

Group frames of the same screen in one Figma Section named after the screen (for example `Login`). Order states left to right: Default → Loading → Error variants → Success.

### 4.5 Flow starting points (Figma "Flows")

Create one flow per entry:

- `Main journey`: `P1/Login/Default/D`
- `Registration`: `P1/Register/Default/D`
- `Verify link (valid)`, `Verify link (expired)`
- `Forgot password`, `Reset link (valid)`, `Reset link (invalid)`
- `Add Subject via PDF`, `Add Subject manual`
- `This Week states`
- `Grade Calculator`
- `Mobile journey`: `P1/Login/Default/M`

---

## 5. TOKENS (FIGMA VARIABLES AND STYLES)

### 5.1 Collections

| Collection   | Mode(s) | Contents                                                                         |
| ------------ | ------- | -------------------------------------------------------------------------------- |
| `Primitives` | `Value` | All `--primitive-*` colors (5.2)                                                 |
| `Semantic`   | `Dark`  | All `--color-*` tokens, each an **alias** to a primitive or an alpha value (5.2) |
| `Space`      | `Value` | `space-1…space-24` (number)                                                      |
| `Radius`     | `Value` | `radius-md` 8, `radius-lg` 12, `radius-xl` 16, `radius-full` 999                 |
| `Proto`      | `Value` | Prototype-only state variables (5.6)                                             |

Components bind to `Semantic`, `Space` and `Radius` only. **Never bind a component to `Primitives`** (Design Rules 2.1).
Set variable **scopes**: colors for fills/strokes/text as appropriate; `Space` for gap and padding; `Radius` for corner radius.

### 5.2 Color values

**Primitives**

| Name                             | Value                                           |
| -------------------------------- | ----------------------------------------------- |
| black / white                    | #000000 / #FFFFFF                               |
| blue-400                         | #4F8EF7                                         |
| purple-400                       | #9B6DFF                                         |
| cyan-400                         | #00E5FF                                         |
| dark-950 / 900 / 800 / 700 / 600 | #0A0A0F / #0D0D1A / #12121F / #1A1A2E / #22223B |
| gray-500 / 400 / 300             | #6B7280 / #9CA3AF / #D1D5DB                     |
| green-400 / yellow-400 / red-400 | #22C55E / #FBBF24 / #F87171                     |

**Semantic** (name → value)

| Token                                                 | Value                                              |
| ----------------------------------------------------- | -------------------------------------------------- |
| bg-base, bg-elevated, bg-overlay, bg-subtle, bg-muted | dark-950, 900, 800, 700, 600                       |
| surface-glass, glass-md, glass-lg                     | white 4%, 7%, 10%                                  |
| border-subtle, default, strong                        | white 6%, 10%, 18%                                 |
| border-focus                                          | blue-400                                           |
| text-primary                                          | white 95%                                          |
| text-secondary                                        | white 65%                                          |
| text-muted                                            | **white 50%** (deviation C1; Design Rules say 40%) |
| text-disabled                                         | white 25%                                          |
| text-inverse                                          | dark-950                                           |
| accent-primary / secondary / tertiary                 | blue-400 / purple-400 / cyan-400                   |
| status-success / warning / error / info               | green-400 / yellow-400 / red-400 / blue-400        |

**Component tints** (create as Semantic variables so badges, destructive buttons and focus rings stay token-bound):
`tint-success-bg` green 12%, `tint-success-border` green 25%, same pattern for warning, error and accent; `focus-ring-glow` blue 15%; `error-ring-glow` red 15%; `accent-glass-bg` blue 8%; `accent-glass-border` blue 25%.

### 5.3 Text styles

Create one Figma Text Style per row. Font **Inter** only. Letter spacing in Figma is a percent: `-0.03em` = `-3%`. Line height as a percent. No weight 300.

| Style       | Size | Weight | LH   | Tracking      |
| ----------- | ---- | ------ | ---- | ------------- |
| display-2xl | 72   | 700    | 100% | -3%           |
| display-xl  | 60   | 700    | 105% | -2.5%         |
| display-lg  | 48   | 700    | 110% | -2%           |
| display-md  | 36   | 700    | 115% | -1.5%         |
| display-sm  | 30   | 600    | 120% | -1%           |
| heading-xl  | 24   | 600    | 125% | -0.8%         |
| heading-lg  | 20   | 600    | 130% | -0.5%         |
| heading-md  | 18   | 600    | 135% | 0             |
| heading-sm  | 16   | 600    | 140% | 0             |
| body-lg     | 18   | 400    | 160% | 0             |
| body-md     | 16   | 400    | 160% | 0             |
| body-sm     | 14   | 400    | 150% | 0             |
| caption     | 12   | 400    | 140% | 1%            |
| overline    | 11   | 500    | 100% | 8%, uppercase |
| mono-md     | 14   | 400    | 150% | 0             |
| mono-sm     | 12   | 400    | 140% | 0             |

Monospace: use **Roboto Mono** (available in Figma) for `mono-*`, because the rules mandate Inter only for UI and mono for codes/IDs/scores/dates. Flag this on the Cover.
Numbers in tables: enable tabular figures (OpenType `tnum`) on the number columns.
Usage map in this prototype: Login/Register title `display-sm`; dashboard title `display-md`; page titles `display-sm`; card titles `heading-lg`; section headers `heading-xl`; table header `overline`.

### 5.4 Effect and paint styles

Figma has no `saturate()`, so ignore it. Use the same numeric blur and **adjust visually** if the result looks different.

| Style          | Fill             | Stroke                  | Effects                                                                          |
| -------------- | ---------------- | ----------------------- | -------------------------------------------------------------------------------- |
| `glass-sm`     | surface-glass    | 1px border-subtle       | background blur 8                                                                |
| `glass-md`     | surface-glass    | 1px border-default      | background blur 20 · drop shadow 0/4/24 black 25% · inner shadow 0/1/0 white 6%  |
| `glass-lg`     | surface-glass-md | 1px border-strong       | background blur 32 · drop shadow 0/8/48 black 40% · inner shadow 0/1/0 white 10% |
| `glass-accent` | accent-glass-bg  | 1px accent-glass-border | background blur 20 · drop shadow 0/8/32 blue 12% · extra 1px blue 10% ring       |
| `shadow-hover` | n/a              | n/a                     | drop shadow 0/12/48 black 35%                                                    |
| `focus-ring`   | n/a              | n/a                     | 2px `border-focus` outside stroke + 2px offset in `bg-base`                      |

**Ambient page background** (paint style `bg/ambient`, applied to every root frame fill): solid `bg-base`, plus a blue 6% radial gradient centered at 20% / 50%, plus a purple 6% radial gradient centered at 80% / 20%. This is the **only** place raw rgba values are allowed, because gradient stops may not bind to variables. Never reuse this paint inside a card.

Glass rules to enforce: no glass inside glass; no glass on text; no blur on sidebar; no blur on content that scrolls inside the card (blur goes on the container).

### 5.5 Spacing and radius usage

- Card padding 24. Gap between cards 24. Gap between sections 48. Gap between form fields 16. Label to input 8. Page padding 32 (desktop), 16 (mobile).
- Radius: buttons, inputs, nav items 8. Cards, tables 12. Modals 16. Chips full.
- No odd values (5, 7, 13). No p-5, p-7, p-9, p-11.

### 5.6 Prototype variables (`Proto` collection)

| Variable                    | Type    | Default   | Used for                                                                      |
| --------------------------- | ------- | --------- | ----------------------------------------------------------------------------- |
| `proto/sessionActive`       | boolean | true      | Sidebar visible, guards                                                       |
| `proto/hasSemester`         | boolean | true      | Dashboard vs New Semester                                                     |
| `proto/subjectCount`        | number  | 3         | Empty dashboard, 20-subject cap demo                                          |
| `proto/subjectSelected`     | boolean | true      | Sidebar enabled/disabled items, Calculator guard                              |
| `proto/loginOutcome`        | string  | `success` | `success`, `wrong`, `throttled`                                               |
| `proto/loginFailCount`      | number  | 0         | Increment on `wrong`. At 5 go to Throttled                                    |
| `proto/pdfOutcome`          | string  | `ok`      | `ok`, `invalid`, `toolarge`, `encrypted`, `ratelimited`, `scanned`, `timeout` |
| `proto/duplicateCode`       | boolean | false     | Duplicate dialog branch                                                       |
| `proto/saveOutcome`         | string  | `ok`      | `ok`, `error`                                                                 |
| `proto/weekState`           | string  | `normal`  | `normal`, `before_start`, `after_end`, `no_class`, `no_plan`                  |
| `proto/scenario`            | string  | `PASSED`  | `PASSED`, `INT_A`, `UNDEFINED`, `INT_B`, `FAILED`, `INCOMPLETE`               |
| `proto/gradeScaleConfirmed` | boolean | false     | Release gate                                                                  |
| `proto/conflict`            | boolean | false     | CONFLICT_VERSION branch                                                       |

Every variable must be listed with its allowed values in the legend on `07 Prototype Controls`.

---

## 6. COMPONENT LIBRARY (PAGE `02 Components`)

Build as Figma components with **variant properties**, **boolean properties** for optional parts, and **text properties** for labels. Every interactive component has `State`: `Default`, `Hover`, `Active`, `Focus`, `Disabled` (and `Loading` where noted).

### 6.1 Core components (specs from Design Rules section 7)

| Component            | Variants / properties                                                                                                                      | Key specs                                                                                                                                                                                                     |
| -------------------- | ------------------------------------------------------------------------------------------------------------------------------------------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `Button`             | Variant: Primary, Secondary, Ghost, Destructive, IconOnly · Size: sm 36, md 44, lg 52 · State incl. Loading · bool `hasLeadingIcon`        | Radius 8. Primary = `accent-primary` fill, `text-inverse` label, weight 500. Loading keeps width, swaps label for spinner. Disabled = 40% opacity. IconOnly 44×44 with `aria-label` text in layer description |
| `Input`              | State: Default, Focus, Filled, Error, Disabled · bool `hasLeadingIcon`, `hasTrailingIcon` (password eye) · text `label`, `helper`, `error` | 44 high (48 on mobile), radius 8, fill `bg-subtle`. Focus 2px `border-focus` + glow. Error shows border, message and `AlertCircle` 14px **together**. Required asterisk after label                           |
| `FormField`          | Wraps Input with label, helper, error                                                                                                      | Label body-sm 500 `text-secondary`, 8px to input, 8px to error                                                                                                                                                |
| `Textarea`           | Same states                                                                                                                                | Min height 96. Used for notes                                                                                                                                                                                 |
| `Checkbox`           | Checked, Unchecked, Error                                                                                                                  | Privacy consent. 44px hit area                                                                                                                                                                                |
| `Card`               | Variant: Default, Interactive, Active · bool `hasHeader`, `hasFooter`                                                                      | `glass-md`, radius 12, padding 24. Active = `glass-accent` + static BorderBeam stroke. Header requires a title. No nested cards. Max height 60vh                                                              |
| `Badge`              | Variant: Default, Success, Warning, Error, Accent · Size sm/md/lg                                                                          | Pill. Text always present, never color only. Max 3 per card header                                                                                                                                            |
| `StatusChip`         | Not Started, In Progress, Completed                                                                                                        | Dot or check prefix. In Progress has `Pulse` 1/2 variants for the loop (section 10)                                                                                                                           |
| `ResultStatusBadge`  | PASSED, INTERVENTION_A, INTERVENTION_B, FAILED, UNDEFINED_AT_THRESHOLD, INCOMPLETE                                                         | Success, accent, warning, error, warning, default. Always carries the status text                                                                                                                             |
| `Table` + `TableRow` | Row: Default, Hover, Selected, Skeleton · Header sticky                                                                                    | Container `glass-sm` radius 12. Header 40px overline `text-muted`. Rows 52px min. Numbers right-aligned, tabular. Empty cell shows "—"                                                                        |
| `MobileRowCard`      | Replaces table rows below 640                                                                                                              | Label/value stacked, actions at the bottom                                                                                                                                                                    |
| `NavItem`            | State: Default, Hover, Active, Disabled · bool `collapsed`                                                                                 | 44 high, radius 8, icon 20. Active = `glass-accent` + accent icon + primary text. Disabled = `text-disabled` and not clickable                                                                                |
| `Sidebar`            | Expanded 240 · Collapsed 64 · Drawer (375)                                                                                                 | Logo row 40, nav list gap 4, Log out at the bottom after a divider. Fill `bg-elevated`, no blur                                                                                                               |
| `Tabs`               | Upload PDF / Enter manually                                                                                                                | Used in Add Subject dialog                                                                                                                                                                                    |
| `Modal`              | Desktop dialog · Mobile full-screen                                                                                                        | `glass-lg`, radius 16, close with X, Escape documented                                                                                                                                                        |
| `Stepper`            | Steps 1..5, State per step: Todo, Current, Done, Error                                                                                     | Used in Subject form                                                                                                                                                                                          |
| `DropZone`           | Idle, Hover/Drag, Selected, Rejected                                                                                                       | Dashed `border-default`. Selected shows file name and size                                                                                                                                                    |
| `ProgressBar`        | Value 0–100 · Sizes 4/8                                                                                                                    | Track `bg-subtle`, fill `accent-primary`                                                                                                                                                                      |
| `Banner`             | Info, Warning, Error, Success                                                                                                              | Inline, with icon and text. Used for session expired, draft restored, throttled                                                                                                                               |
| `Toast`              | Info, Success, Error                                                                                                                       | Auto-dismiss is documented, not animated                                                                                                                                                                      |
| `Tooltip`            | n/a                                                                                                                                        | Collapsed sidebar, truncated badges                                                                                                                                                                           |
| `Skeleton`           | Line, Block, Card, TableRow                                                                                                                | `bg-subtle`. Radius matches the real element. Shimmer documented in section 10                                                                                                                                |
| `EmptyState`         | bool `hasCTA` · text icon/heading/body                                                                                                     | 64px muted icon, heading-sm `text-secondary`, body-sm `text-muted` max 280                                                                                                                                    |
| `ErrorState`         | Component, Page                                                                                                                            | AlertTriangle 32 for component-level, 64 for page-level                                                                                                                                                       |
| `Popover` / `Menu`   | Subject switcher, subject actions menu                                                                                                     | Solid `bg-overlay` + `border-strong`. **No glass** (it would sit on glass)                                                                                                                                    |
| `SegmentedControl`   | 2–4 segments                                                                                                                               | Export CSV/JSON, Demo Panel                                                                                                                                                                                   |

### 6.2 Domain components

| Component          | Contents                                                                                                                          |
| ------------------ | --------------------------------------------------------------------------------------------------------------------------------- |
| `SubjectCard`      | Code (mono-md), title (heading-lg), units Badge, semester label, ProgressBar with "N of M weeks done", `Active` variant           |
| `SemesterPicker`   | Select-like control with current semester, "New semester" item                                                                    |
| `OutcomeRow`       | Outcome code, description, percent, attained check. For calculator groups                                                         |
| `ActivityRow`      | Columns: Activity, Outcome, Score, Max, Percent                                                                                   |
| `WeekRow`          | Week number, topic, outcome, activities, checkbox, StatusChip                                                                     |
| `ResultCard`       | Status badge, average (large), grade or hidden-grade note, "Estimated (self-reported)" label, weak outcomes list with plan topics |
| `OutcomeMap`       | PEO/PO/CO columns with static connector lines from CO to PO (AnimatedBeam approximation) and I/E/D chips                          |
| `CoverageMatrix`   | Activities × outcomes grid for Assessment Map                                                                                     |
| `FlaggedField`     | Input in `warning` treatment plus caption "Check this value" (for PDF-prefilled doubtful fields)                                  |
| `PdfStepIndicator` | 3 steps (Uploading, Extracting text, Parsing syllabus) + progress bar                                                             |

### 6.3 Icon set (Lucide, imported as components)

Nav and actions: LayoutDashboard (Home), ChevronsUpDown (switcher), BookOpen (Overview), Target (Outcomes), CalendarDays (Learning Plan and Notes), ClipboardList (Grading), ScrollText (Class Policies), Users (College Faculty), Network (Assessment Map), CheckSquare (Checklist), Download (Export), CalendarClock (This Week), Calculator, Plus (Add Subject), SlidersHorizontal (Edit / Archive / Delete), User (Account), LogOut, Menu, PanelLeftClose, PanelLeftOpen.
UI: AlertCircle, AlertTriangle, Check, X, Eye, EyeOff, Mail, Lock, UploadCloud, FileText, Archive, Trash2, RotateCcw, Loader (spinner), BarChart2, Info.
Sizes: nav 20, button 16, inline 14, card header 24, empty state 64. No emoji. Never mix icon libraries.

---

## 7. SEED DATA (INVENTED, FOR PROTOTYPE USE ONLY)

Show the same data on every screen that references it so the prototype feels like one system.

**Account**: `juan.delacruz@example.edu` (use `example.edu`, because D5 allowed domains are undecided).

**Semester** (static "today" = Tue 10 Nov 2026, Asia/Manila):
`1st Semester AY 2026–2027`, start **Mon 17 Aug 2026**, end **Fri 18 Dec 2026**, skipped weeks: **9**.
Derived: d = 85, so **Week 13**; plan covers weeks 1–18.

**Subjects** (3 shown on the dashboard, a 4th appears when `subjectCount` is raised for the cap demo):

| Code   | Title                           | Units | Weeks done | Active                |
| ------ | ------------------------------- | ----- | ---------- | --------------------- |
| ITE 14 | Integrative Programming         | 3     | 11 of 18   | yes (BorderBeam card) |
| ITE 15 | Information Assurance           | 3     | 9 of 18    |                       |
| GEC 4  | Mathematics in the Modern World | 3     | 12 of 18   |                       |

Active subject for all module screens: **ITE 14**.

**ITE 14 course data**

- Prerequisite: ITE 13. Effectivity: AY 2026–2027.
- PEO1–PEO3. PO a–d. **CO1–CO4**.
- Outcome map (I/E/D = Introduced/Enabled/Demonstrated): CO1→PO a (I), PO b (I) · CO2→PO b (E) · CO3→PO c (E) · CO4→PO c (D), PO d (D).
- Learning plan: 18 weeks, week 9 marked "No class", week 13 topic "Secure session handling", outcome CO3, activities "Lab 3", next assessment "Midterm Exam".
- Checklist: weeks 1–8 and 10–12 done (11 of 18), matching the card.
- Assessment map: 8 activities (section 9.2) × 4 outcomes.
- Grading, Policies, Faculty: short realistic read-only blocks (3–5 lines each).

---

## 8. SCREENS AND PROTOTYPE WIRING

Notation: `→` = navigate. All **branches** are conditionals on the `Proto` variables in 5.6 unless stated. Default transition: **Dissolve 300ms ease-out**. Overlay transitions: **Smart Animate / Move in 250ms**. Specific motion is in section 10.

### 8.1 Page 1: Authentication (`03 Auth`)

**Screens** (each at D and M; T optional): `Login`, `Register`, `Forgot`, `Reset`, `Verify`.
Layout: centered `glass-lg` auth panel (max 440) on the ambient background. Login and Register include the static meteor decoration (13). Logo and app name above the panel. Forgot, Reset and Verify have no decoration.

| Draw.io node                        | Frame / state                                                                                                      | Wiring                                                                                                                                                                                                    |
| ----------------------------------- | ------------------------------------------------------------------------------------------------------------------ | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `p1-start`                          | `P1/Login/Default`                                                                                                 | Flow start                                                                                                                                                                                                |
| `p1-login`, `p1-choice`             | Login with buttons: **Log In** (Primary shimmer), **Create Account** (Secondary), **Forgot password** (Ghost link) | Create Account → `P1/Register/Default`. Forgot → `P1/Forgot/Default`                                                                                                                                      |
| `p1-lrate` throttle (5 per 15 min)  | `P1/Login/Throttled`                                                                                               | Log In click: if `loginFailCount ≥ 5` or `loginOutcome = throttled` → Throttled. Banner: **"Too many attempts. Try again in a few minutes."** Button disabled. Return → `Login/Default`                   |
| `p1-lproc`                          | `P1/Login/Loading`                                                                                                 | Button spinner for ~800ms (After delay), then branch                                                                                                                                                      |
| `p1-lok` no                         | `P1/Login/Error`                                                                                                   | `loginOutcome = wrong`: increment `loginFailCount`. Shows **"Email or password is incorrect."** (same text for every failure) plus link **"Resend verification"**. Form shake (10). Return to Login       |
| `p1-lok` yes, `p1-lsess`            | n/a                                                                                                                | Set `sessionActive = true`, → `P2/Dashboard/Default` (Dissolve)                                                                                                                                           |
| `p1-rform`                          | `P1/Register/Default`                                                                                              | Fields: Email, Password, Confirm password, privacy consent checkbox. Primary **Create Account**                                                                                                           |
| `p1-rproc`, `p1-rok` no             | `P1/Register/FieldErrors`                                                                                          | Shows **"Fix the highlighted fields."** + inline errors (email format/domain, password 10–128 and not common, mismatch, consent). Errors appear only after first interaction or submit (Design Rules 7.2) |
| `p1-rok` yes, `p1-rmail`, `p1-rmsg` | `P1/Register/Submitting` → `P1/Register/Sent`                                                                      | Sent text: **"If this email is eligible, we sent you a message."** Identical copy for new and existing emails. CTA **Go to Login**                                                                        |
| `p1-vin`, `p1-vd`                   | `P1/Verify/Success`, `P1/Verify/Invalid`                                                                           | Entered via flow starts (links arrive by email, outside the app). Success: **"Email verified. Please log in."** Invalid: **"Link expired or already used. Request a new one."** Both → Login              |
| `p1-fform`, `p1-fproc`, `p1-fmsg`   | `P1/Forgot/Default` → `P1/Forgot/Sent`                                                                             | Single Email field. Sent: **"If this email is eligible, we sent you a message."** → Login                                                                                                                 |
| `p1-pin`, `p1-pd`                   | `P1/Reset/Default`, `P1/Reset/Invalid`, `P1/Reset/Success`                                                         | Fields: New password, Confirm. Invalid: **"Link invalid or password too weak. Try again."**, **Retry** → Reset/Default. Success: **"Password changed. Please log in."** → Login                           |
| `p1-gnote` (warning at minute 28)   | `P1/Overlay/SessionWarning`                                                                                        | Opened from Demo Panel. Modal text **proposed**: "Your session will expire in 2 minutes." Buttons: **Stay signed in** (closes), **Log out**                                                               |
| `p1-oexp`                           | `P1/Login/SessionExpired`                                                                                          | Login plus Banner (warning): **"Your session expired. Your open form was kept as a draft."** (proposed copy)                                                                                              |
| `p1-oin`, `p1-oproc`, `p1-ogo`      | `P1/Login/LoggedOut`                                                                                               | Any **Log out** control → Login with success Toast "You have been logged out." (proposed copy). Set `sessionActive = false`                                                                               |

Resend verification link → toast "If this email is eligible, we sent you a message." (reuses the generic text).

### 8.2 Page 2: Dashboard and Add Subject (`04 Dashboard + Add Subject`)

**App shell** wraps every frame from here on: Sidebar (8.3) + content area.

**Dashboard frames**: `P2/Dashboard/Default`, `/Loading` (skeleton cards), `/EmptySubjects`, `/NoSemester`, plus T and M sizes of Default.
Content: page title `display-md` "Dashboard" (solid color, C3), SemesterPicker, **Add Subject** (Primary shimmer), 3-column grid of `SubjectCard`s (2-col tablet, 1-col mobile). Active card uses `glass-accent` + BorderBeam.

| Draw.io node           | Frame / state                                   | Wiring                                                                                                                                                                     |
| ---------------------- | ----------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `p2-from`, `p2-dash`   | `P2/Dashboard/Default`                          | Landing from login                                                                                                                                                         |
| `p2-sem` no            | `P2/Semester/New` (dialog)                      | `hasSemester = false` → Dashboard shows `/NoSemester` with CTA; or SemesterPicker → "New semester". Fields: Label, Start date, End date, Skipped weeks (chip multi-select) |
| `p2-semp`              | `P2/Semester/Error`                             | Error "End date must be after the start date." and a max-30-semesters variant (proposed copy). Valid → back to Dashboard (Return)                                          |
| `p2-add`, `p2-open`    | n/a                                             | Click subject card → `P3/Overview/Default` (Dissolve), sets `subjectSelected = true`                                                                                       |
| `p2-cap` no, `p2-capm` | `P2/AddSubject/CapReached`                      | If `subjectCount ≥ 20`: Banner **"Limit reached. Archive or delete a subject first."** → Return to Dashboard                                                               |
| `p2-tab`               | `P2/AddSubject/Upload/Idle` and `/Manual/Empty` | Modal with Tabs **Upload PDF** / **Enter manually**. Tab switch uses Change-to variant. Tabs stay available at any time                                                    |

**Upload path (PDF)**

| Draw.io node                    | Frame / state                     | Wiring                                                                                                                                                                                                                                                                                                                               |
| ------------------------------- | --------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| `p2-pick`                       | `Upload/Idle` → `Upload/Selected` | DropZone: "Select or drop the syllabus PDF (CSU F-CID-009)". Click → Selected (shows filename, size). Primary **Sync Syllabus**                                                                                                                                                                                                      |
| `p2-val`, `p2-vd` no, `p2-verr` | `Upload/Rejected`                 | Branch on `pdfOutcome`: `invalid` PDF_INVALID, `toolarge` PDF_TOO_LARGE (limit 10 MB), `encrypted` PDF_ENCRYPTED, `ratelimited` RATE_LIMITED. Error Banner with specific message. Actions: **Retry** → Idle, **Switch to Manual** → Manual tab. Error codes appear as `mono-sm` captions. Message wording is proposed, keep it plain |
| `p2-q`, `p2-ext`                | `Upload/Processing`               | `PdfStepIndicator` runs the 3-step chained animation (10.4)                                                                                                                                                                                                                                                                          |
| `p2-ed` no, `p2-eerr`           | `Upload/ParseError`               | `pdfOutcome = scanned` (PDF_SCANNED, "looks like a scan") or `timeout` (PARSE_TIMEOUT). Actions: **Retry**, **Use Manual tab**                                                                                                                                                                                                       |
| `p2-parse`                      | n/a                               | → `P2/SubjectForm/Step1/Prefilled`                                                                                                                                                                                                                                                                                                   |

**Subject form** (shared by PDF and manual): a 5-step `Stepper` inside the same modal.

| Step                   | Fields (draw.io `p2-form`)                                                                |
| ---------------------- | ----------------------------------------------------------------------------------------- |
| 1 Course info          | Semester, Code, Title, Units, Prerequisite, Effectivity                                   |
| 2 Outcomes             | PEO/PO/CO list (add/remove). Limit 20                                                     |
| 3 Activities           | Activity label, max score, mapped outcome(s). Limit 150. ≥1 activity mapped to an outcome |
| 4 Learning plan        | Plan weeks (week_from, week_to, topic, outcome). Limit 30                                 |
| 5 Policies and faculty | Grading, class policies, faculty. Final button **Confirm** (disabled until valid)         |

Frames: `P2/SubjectForm/Step1..5/Prefilled` (PDF path, flagged fields highlighted using `FlaggedField`, **never hidden**), `Step1..5/Empty` (manual path) for steps 1–3 at minimum, `Step1/ValidationFailed` ("VALIDATION_FAILED": highlighted fields, Confirm disabled, with reason shown), `Step3/Autosaved` ("Draft saved" caption next to a clock icon, text-only).
Validation per step before **Next** (Design Rules 11.2). **Back** never loses data.

| Draw.io node                       | Frame / state                      | Wiring                                                                                                                                                                                            |
| ---------------------------------- | ---------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `p2-val2`, `p2-vd2` no, `p2-verr2` | `Step*/ValidationFailed`           | Confirm disabled while errors exist                                                                                                                                                               |
| `p2-dup` yes                       | `P2/Duplicate/Dialog`              | If `duplicateCode = true`: text "An active subject with this course code already exists in this semester." Buttons: **Open existing** → `P3/Overview/Default`, **Replace** → `P2/Replace/Summary` |
| `p2-rep`, `p2-repsum`              | `P2/Replace/Summary`               | Success state: **"N scores copied, M not copied."** (seed N=6, M=2). Info line: "The previous subject was archived. You can restore it for 30 days." CTA **Open Overview**                        |
| `p2-save`, `p2-sd` no, `p2-serr`   | `P2/Save/Saving` → `P2/Save/Error` | `saveOutcome = error`: Banner "System error. Nothing was saved. Retry." with **Retry** (button shows attempt count 1 of 3)                                                                        |
| `p2-ok`, `p2-end`                  | `P2/Save/Created`                  | Success check, **"Subject created. Open its Overview."** CTA **Open Overview** → `P3/Overview/Default`. `subjectCount` +1, `subjectSelected = true`                                               |
| `p2-draft`                         | `P2/Drafts/Restored`               | After SESSION_EXPIRED then login, Dashboard shows Banner **"We restored your unsaved subject form."** (proposed copy) with **Resume** → `Step1/Prefilled`                                         |

### 8.3 App shell and sidebar (used by Pages 2–4)

Sidebar anatomy, top to bottom (Design Rules 6.2 + draw.io `p3-side`):

1. Logo + "GoldenSync" (40 high)
2. **Home**
3. **Subject switcher** (shows active subject code and title, chevron)
4. Subject items: **Overview, Outcomes, Learning Plan and Notes, Grading, Class Policies, College Faculty, Assessment Map, Checklist, Export, This Week, Grade Calculator**
5. **Add Subject** (placed directly under Grade Calculator, after a subtle divider)
6. **Edit / Archive / Delete subject** (opens a Menu)
7. Bottom, after a divider: **Account**, **Log out**

Disabled rule: every item except **Home** and **Add Subject** is `Disabled` when `subjectSelected = false`.

| Breakpoint | Sidebar                                                                                                         |
| ---------- | --------------------------------------------------------------------------------------------------------------- |
| 1280       | Expanded 240, persistent. Collapse button → 64px icon-only with Tooltips (collapsed variant frame on Dashboard) |
| 768        | 64px collapsed by default. Hamburger opens a Sheet drawer overlay (Design Rules 6.2 and 9.1)                    |
| 375        | Hidden. Top bar with Menu button opens a full-width Sheet drawer. Close with X and by tapping the backdrop      |

Subject switcher Popover lists this semester's active subjects (max 20) with a checkmark on the active one. Empty state text: **"Add your first subject."** Selecting a subject → sets the active subject → `P3/Overview/Default`.

### 8.4 Page 3: Subject modules (`05 Subject Modules`)

All module screens share one template: Page title (`display-sm`) + overline breadcrumb `ITE 14 · 1st Semester AY 2026–2027`, then content. Each at D, with M for Overview, Learning Plan, This Week and Checklist.

| Draw.io node      | Frame                                                             | Content notes                                                                                                                                                                                             |
| ----------------- | ----------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `p3-ov`           | `P3/Overview/Default`                                             | Course specification card: units, prerequisite, effectivity. Quick links to Calculator and This Week                                                                                                      |
| `p3-oc`           | `P3/Outcomes/Default`                                             | `OutcomeMap` with PEO/PO/CO and I/E/D chips. Static CO→PO lines. Hovering a CO highlights its lines (While hovering, 150ms)                                                                               |
| `p3-lp`           | `P3/Plan/Default`                                                 | Weeks table (18 rows incl. week 9 "No class") with an editable-looking **Your notes** Textarea per selected week                                                                                          |
| `p3-gr`           | `P3/Grading/Default`, `P3/Policies/Default`, `P3/Faculty/Default` | **Read-only** blocks. Show a small "Read-only (from your saved syllabus)" caption                                                                                                                         |
| `p3-am`           | `P3/Assessments/Default`                                          | `CoverageMatrix`: 8 activities × 4 outcomes, with cells showing mapped state                                                                                                                              |
| `p3-ck`, `p3-ckp` | `P3/Checklist/Default`                                            | 18 `WeekRow`s. Clicking a checkbox toggles Done and updates the StatusChip and the progress line "11 of 18". Writes nothing else. Caption: "Ticking weeks never changes your results."                    |
| `p3-ex`           | `P3/Export/Default`                                               | SegmentedControl **CSV / JSON**, Primary **Download**. Info line: "Only your own subject is exported. Cells starting with = + - @ are neutralized."                                                       |
| `p3-emp`          | `P3/<Module>/EmptyModule`                                         | `EmptyState`: **"Not in this syllabus."** + body "Edit subject to add it." + CTA **Edit subject**. Build for Grading, Policies and Faculty at minimum                                                     |
| `p3-act`          | `P3/Manage/Menu` + dialogs                                        | Menu items: Edit (→ subject form in edit mode, Step1 prefilled), Archive, Delete                                                                                                                          |
| Archive           | `P3/Archive/Confirm`                                              | Dialog. "You can restore this subject for 30 days." Primary **Archive**. Success toast, → Dashboard                                                                                                       |
| Delete            | `P3/Delete/Confirm`                                               | Dialog with **Destructive** button disabled until the course code is typed. Simulate with Default (disabled) and Filled (enabled) variants. Text: "Type ITE 14 to confirm. This also removes its scores." |
| `p3-acc`          | `P3/Account/Default`                                              | Two sections: **Export my data** (Secondary) and **Delete account** (Destructive). Delete opens a dialog requiring **password**, text "This removes everything you own."                                  |
| `p3-lo`           | n/a                                                               | Log out → `P1/Login/LoggedOut`                                                                                                                                                                            |
| `p3-gc`, `p3-ad`  | n/a                                                               | Sidebar Grade Calculator → `P4/Calculator/Default`. Add Subject → opens the `P2/AddSubject` modal                                                                                                         |

**This Week** (`p3-tw`, `p3-twp`, `p3-d1..d4`, `p3-o1..o5`): one frame per state. A small "Today: Tue 10 Nov 2026 · Week 13" caption is shown on all of them. State selection comes from `proto/weekState` and from the Demo Panel.

| State                      | Frame                     | Content                                                       |
| -------------------------- | ------------------------- | ------------------------------------------------------------- |
| normal (`p3-o5`)           | `P3/ThisWeek/Normal`      | Topic, outcome, activities, next assessment. Header "Week 13" |
| BEFORE_START (`p3-o1`)     | `P3/ThisWeek/BeforeStart` | "Starts in N days" + Week 1 preview card (seed N=14)          |
| AFTER_END (`p3-o2`)        | `P3/ThisWeek/AfterEnd`    | "Semester ended"                                              |
| NO_CLASS (`p3-o3`)         | `P3/ThisWeek/NoClass`     | "No class this week" + the next scheduled topic               |
| NO_PLAN_FOR_WEEK (`p3-o4`) | `P3/ThisWeek/NoPlan`      | "No topic scheduled"                                          |

Wire the Demo Panel to set `weekState` then jump to the matching frame. A "This Week states" flow shows all five in order.

### 8.5 Page 4: Grade Calculator (`06 Grade Calculator`)

| Draw.io node                                | Frame                                | Content / wiring                                                                                                                                                                                                                                                                                                |
| ------------------------------------------- | ------------------------------------ | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `p4-in`, `p4-sel` no, `p4-none`, `p4-addgo` | `P4/Calculator/NoSubject`            | `EmptyState`: "Choose a subject, or press Add Subject." CTA **Add Subject** → opens the modal                                                                                                                                                                                                                   |
| `p4-view`                                   | `P4/Calculator/Default`              | Table grouped by outcome (CO1–CO4): Activity · Outcome · Score · Max · Percent. Buttons **Add activity** (Secondary) and **Add Subject** (Ghost). Label chip **"Estimated (self-reported)"** always visible. Unmapped activities appear in an "Other activities" group with caption "Excluded from the result." |
| `p4-actq`, `p4-actf`                        | `P4/Calculator/NewActivity` (dialog) | Fields: Label, Max score, outcome multi-select (≥1). Info: "Unmapped activities are listed under Other activities and excluded from the result." Save → Return to Default with the new row                                                                                                                      |
| `p4-inp`                                    | `P4/Calculator/EditScore`            | Clicking a Score cell opens a small Popover with value and ± stepper. Empty score shows "—" = "not taken yet"                                                                                                                                                                                                   |
| `p4-v` no, `p4-verr`                        | `P4/Calculator/InvalidValue`         | Cell in Error state, Banner/inline text **"Fix the value. Nothing is saved."**                                                                                                                                                                                                                                  |
| `p4-save`, `p4-c` yes, `p4-cerr`            | `P4/Calculator/Conflict`             | If `conflict = true`: row highlighted warning + Banner **"CONFLICT_VERSION. Reload that row and enter it again."** with **Reload** → Default                                                                                                                                                                    |
| `p4-pct`, `p4-inc` no, `p4-incout`          | `P4/Calculator/Incomplete`           | Per-outcome progress bars (scored activities per outcome). **No result card.** Caption "Score at least one activity in every outcome to see your result." (proposed)                                                                                                                                            |
| `p4-avg` … `p4-show`                        | `P4/Result/<Status>`                 | `ResultCard` below the table (section 9)                                                                                                                                                                                                                                                                        |
| `p4-gate`                                   | Release gate variants                | Section 9.4                                                                                                                                                                                                                                                                                                     |
| `p4-end`                                    | n/a                                  | Back to sidebar = any sidebar item                                                                                                                                                                                                                                                                              |

### 8.6 Prototype Controls (`07 Prototype Controls`)

A standalone **Demo Panel** frame, also reachable in any screen as an **overlay opened with the keyboard key `D`** (Key trigger). It is a prototype aid, never part of the product UI. Style it plainly (`bg-overlay`, `mono-sm`) with a "PROTOTYPE CONTROLS" overline.

Controls (each button sets a `Proto` variable then **jumps** to the first relevant frame):

- Login: Success / Wrong password / Throttled
- Verify link: Valid / Expired
- Session: Show 28-minute warning / Expire session
- PDF result: OK / Invalid / Too large / Encrypted / Rate limited / Scanned / Timeout
- Duplicate course code: On / Off
- Save: OK / Error
- Subject count: 3 / 20 (cap)
- This Week: Normal / Before start / After end / No class / No plan
- Calculator scenario: PASSED / INT_A / UNDEFINED / INT_B / FAILED / INCOMPLETE
- Grade scale: Confirmed on / off
- Row conflict: On / Off

Also build the **legend** listing what each variable does, so a reviewer without this file understands the panel.

---

## 9. GRADE CALCULATOR LOGIC (SCENARIO-DRIVEN)

### 9.1 Rules to reproduce faithfully (from draw.io)

- Outcome percent = sum of scores ÷ sum of max × 100, over **scored** activities mapped to that outcome.
- If any outcome has **no** scored activity → `INCOMPLETE` (per-outcome progress, no result).
- n = number of outcomes. Average = **unweighted mean** of outcome percents. An outcome is **attained** when its percent is **greater than 60**.
- Order of tests (first match wins):
  1. All outcomes attained → **PASSED**: grade = map(average) from the grade scale.
  2. Average > 60 → **INTERVENTION_A**: grade = map(average); list weak outcomes and their topics.
  3. Average exactly 60 → **UNDEFINED_AT_THRESHOLD**: no grade. Text: "The syllabus does not define this case. Confirm with your instructor."
  4. At least half of the outcomes attained → **INTERVENTION_B**: best possible grade **3.0** after the weak outcomes pass; list weak outcomes and topics.
  5. Otherwise → **FAILED**: grade **5.0**; list weak outcomes and topics.
- Result is always labeled **"Estimated (self-reported)"**. It is never an official grade.

### 9.2 Seed activities (8, two per outcome, max 50 each)

Labels: CO1 Quiz 1, Quiz 2 · CO2 Midterm Exam, Lab 1 · CO3 Lab 3, Project Part 1 · CO4 Project Part 2, Final Exam.
Because each outcome has two activities with max 50 each, **outcome percent = sum of its two scores**.

### 9.3 Scenarios (scores shown as activity A + activity B)

| Scenario (`proto/scenario`) | CO1            | CO2            | CO3            | CO4            | Avg    | Attained | Result                                    |
| --------------------------- | -------------- | -------------- | -------------- | -------------- | ------ | -------- | ----------------------------------------- |
| `PASSED`                    | 45+40 = **85** | 40+38 = **78** | 36+36 = **72** | 45+45 = **90** | 81.25  | 4 of 4   | PASSED                                    |
| `INT_A`                     | 40+40 = **80** | 38+37 = **75** | 28+27 = **55** | 45+45 = **90** | 75     | 3 of 4   | INTERVENTION_A, weak: CO3                 |
| `UNDEFINED`                 | 35+35 = **70** | 25+25 = **50** | 35+35 = **70** | 25+25 = **50** | **60** | 2 of 4   | UNDEFINED_AT_THRESHOLD                    |
| `INT_B`                     | 35+35 = **70** | 33+32 = **65** | 20+20 = **40** | 23+22 = **45** | 55     | 2 of 4   | INTERVENTION_B, grade 3.0, weak: CO3, CO4 |
| `FAILED`                    | 35+35 = **70** | 20+20 = **40** | 23+22 = **45** | 25+25 = **50** | 51.25  | 1 of 4   | FAILED, grade 5.0, weak: CO2, CO3, CO4    |
| `INCOMPLETE`                | 85 as above    | 78             | 72             | **no scores**  | n/a    | n/a      | INCOMPLETE                                |

Build **one Calculator frame per scenario** (`P4/Calculator/<Scenario>` with the table filled) **and one Result frame per status** (`P4/Result/Passed`, `/IntA`, `/Undefined`, `/IntB`, `/Failed`). The Demo Panel and a **"Try another scenario"** SegmentedControl (outside the product chrome, marked prototype-only) navigate between them. Weak outcomes list their plan topics (seed: CO2 "Data validation", CO3 "Secure session handling", CO4 "Deployment and testing").

### 9.4 Release gate

- `gradeScaleConfirmed = false` (default): **PASSED** and **INTERVENTION_A** hide the numeric grade. Show status and average, and a caption: **"Numeric grade hidden until the official grade scale is confirmed."**
- `gradeScaleConfirmed = true`: show the grade with an always-visible `Badge`: **"Demo value, official scale pending"**. Because D1 (the official average-to-grade table) is undecided, **do not invent a table**: render a clearly fake `x.xx` style placeholder such as "1.75" only inside that badge-marked demo state.
- **INTERVENTION_B (3.0)** and **FAILED (5.0)** are not gated. Their grades come directly from the draw.io.
- Build both gate variants for PASSED and INT_A. Four result frames in total for those two.

### 9.5 Stretch: live math

Only after all milestones pass: make the seed table cells `+/-` steppers that change number variables and compute the outcome percents with Figma expressions, then branch with conditionals following 9.1. Keep the scenario frames as the fallback.

---

## 10. MOTION SPEC (ANIME.JS / MAGIC UI → FIGMA)

Easing reference: easeOutExpo ≈ cubic-bezier(0.16, 1, 0.3, 1). Use Figma custom bezier. Hover transitions 150ms ease-out. Do not animate layout-driving properties beyond what the table says.

| Design Rules animation               | Figma implementation                                                                                                                                                            | Priority                                |
| ------------------------------------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | --------------------------------------- |
| Page enter (fade + 16px rise, 400ms) | Navigation = Dissolve 300ms ease-out (CSS `fadeIn` spec). Skip stagger                                                                                                          | Required                                |
| Dashboard card stagger               | 3 chained intermediate frames (cards revealed 1, 2, 3) with After-delay 80ms and Smart Animate 500ms easeOutExpo                                                                | Stretch                                 |
| Progress bar fill 800ms              | Smart Animate between 0% and value on entry to a frame with a 0% start frame                                                                                                    | Stretch                                 |
| Number counter 1200ms                | Not feasible. Show final number with Dissolve                                                                                                                                   | Skip                                    |
| Shake (failed login/validation)      | Component `Shake` variants 0/1/2/3 at x = 0, -8, 8, 0, After-delay 100ms each, ease-in-out-sine                                                                                 | Required for Login error                |
| Success checkmark draw               | Smart Animate scale 0.6→1 + opacity, 400ms easeOutExpo (dash offset not supported)                                                                                              | Required for Created and Verify success |
| Sync progress timeline               | Chain: Step 1 (300) → bar 33% (600) → Step 2 (300) → bar 66% (600) → Step 3 (300) → bar 100% (400), via After-delay + Smart Animate. Total ≈ 2.5 s, then branch on `pdfOutcome` | Required                                |
| StatusChip pulsing dot (2s loop)     | `Pulse` 1↔2 variants, After-delay 1000ms each, Smart Animate ease-in-out                                                                                                        | Stretch                                 |
| Shimmer button                       | Hover variant shows a diagonal highlight, Smart Animate 600ms                                                                                                                   | Stretch                                 |
| BorderBeam (active subject card)     | **Static** 1px gradient stroke segment in `accent-primary` on the card border. Layer description: `approx: BorderBeam 3s`                                                       | Required for active card                |
| MeteorShower (auth)                  | 15 thin diagonal lines, low opacity, **static**, behind the panel. Login and Register only                                                                                      | Required                                |
| AnimatedBeam (CO→PO)                 | Static connector lines. Hover highlight (While hovering, 150ms)                                                                                                                 | Required                                |
| BlurFade page content                | Not built (Dissolve instead)                                                                                                                                                    | Skip                                    |
| Skeleton shimmer 1.5s                | Skeleton frames with a 2-variant shimmer loop                                                                                                                                   | Stretch                                 |
| Modal / drawer open                  | Overlay: Move in from bottom (mobile) or Dissolve + 8px rise (desktop), 250ms ease-out, dim backdrop 60% `bg-base`, closes on outside click                                     | Required                                |

Document on the Cover that all effects are **approximations of the coded effects** and that the coded build must honor `prefers-reduced-motion`.

---

## 11. RESPONSIVE BEHAVIOR

| Size           | Required frames                                                                                                                                                                                                                      |
| -------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| 1280 (D)       | **Every** screen and state in section 8                                                                                                                                                                                              |
| 768 (T)        | Dashboard (Default), Overview, Learning Plan, Calculator (Default), with the 64px collapsed sidebar and the hamburger drawer open                                                                                                    |
| 375 (M)        | Login, Register, Forgot, Dashboard (Default + Loading + Empty), sidebar drawer (open), Add Subject modal (full-screen, Upload and Step1), Overview, This Week (Normal), Checklist, Calculator (Default + one Result), Delete confirm |
| 1920 (stretch) | Dashboard only, content max width 1400 centered, 3 columns                                                                                                                                                                           |

Rules to apply: touch targets ≥ 44×44; inputs 48 high on mobile; tables become `MobileRowCard` lists below 640 (no horizontal scroll); modals are full-screen on mobile; primary buttons are full width on mobile; no hover-only information; page padding 16 on mobile.

---

## 12. BUILD ORDER AND ACCEPTANCE

| #   | Milestone               | Done when                                                                                                                                                                        |
| --- | ----------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| M0  | File + pages + Cover    | File created, 9 pages named, Cover lists deviations C1–C14                                                                                                                       |
| M1  | Tokens                  | All variable collections and styles exist. `01 Tokens` documents them. Audit shows 0 unbound colors                                                                              |
| M2  | Core components         | Button, Input, FormField, Card, Badge, StatusChip, Table, NavItem, Sidebar, Modal, Banner, Toast, EmptyState, ErrorState, Skeleton built with all states. Screenshot of the grid |
| M3  | Domain components       | SubjectCard, WeekRow, ResultCard, OutcomeMap, CoverageMatrix, DropZone, Stepper, PdfStepIndicator built                                                                          |
| M4  | Page 1 screens + wiring | Every row in 8.1 reachable. Login success, wrong ×5 → throttled, register/forgot/reset/verify paths all click through                                                            |
| M5  | App shell + Page 2      | Sidebar states, dashboard states, Add Subject modal both tabs, all 7 `pdfOutcome` branches, stepper, duplicate, replace, save error, created                                     |
| M6  | Page 3                  | All modules, empty modules, manage dialogs, account, 5 This Week states                                                                                                          |
| M7  | Page 4                  | Six scenarios, five results, gate on/off, new activity, invalid, conflict                                                                                                        |
| M8  | Demo Panel + flows      | Key `D` overlay works from every frame. All flows in 4.5 start correctly                                                                                                         |
| M9  | Responsive pass         | Required T and M frames in section 11 built and wired                                                                                                                            |
| M10 | Motion + QA             | Required motion in section 10 done. Section 13 checklist passes. Scratch page empty                                                                                              |

**Never** start a milestone before the previous one's screenshots look right.

---

## 13. QA CHECKLIST

### 13.1 Automated audit (run with `use_figma` at the end of every milestone)

- Count fills/strokes/effects **not bound to a variable or style** (allowed exception: `bg/ambient`). Must be 0.
- Count text nodes with no text style. Must be 0.
- Count layers named like `Frame N`, `Rectangle N`, `Group N`. Must be 0.
- Count frames with spacing values not divisible by 4. Must be 0.
- Count prototype dead ends: every clickable element in a frame has a destination, and every frame is reachable from a flow start.

### 13.2 Design Rules checks (adapted from section 16)

```
VISUAL
  ☐ Colors, spacing, type come from tokens only
  ☐ Correct glass variant: cards md, modals lg, active accent, sidebar none-blur
  ☐ No glass inside glass, no glass on text
  ☐ Radii: 8 controls, 12 cards/tables, 16 modals
  ☐ Hover, active, focus and disabled variants exist for every interactive component
  ☐ Max 2 accent colors per screen, accent-secondary never a button fill
  ☐ No emoji icons, one icon library per screen, icon sizes even
RESPONSIVE
  ☐ 1280, 768 and 375 frames exist as required in section 11
  ☐ No horizontal overflow, touch targets ≥ 44
  ☐ Tables become card lists on mobile
INTERACTION
  ☐ Every async action has a loading state (button spinner, skeleton, step indicator)
  ☐ Every form has an error state with icon + message (never red border alone)
  ☐ Errors do not show before first interaction
  ☐ Every list/table has an empty state
ACCESSIBILITY
  ☐ Contrast ≥ 4.5:1 for normal text (check muted text after C1), ≥ 3:1 for UI parts
  ☐ Focus ring variant (2px, accent) on every interactive component
  ☐ Status shown by text as well as color
  ☐ Icon-only buttons carry an aria-label in the layer description
CONTENT
  ☐ Every message string from the draw.io appears verbatim (Appendix A)
  ☐ Results always labeled "Estimated (self-reported)"
  ☐ No "null", "undefined" or empty cells: use "—"
```

### 13.3 Flow coverage (must click through in Present mode)

1. Login success → Dashboard → open ITE 14 → every sidebar module → Calculator → Log out.
2. Login wrong ×5 → Throttled → Return.
3. Register → Sent → Login. Verify valid and expired. Forgot → Sent. Reset valid and invalid.
4. Dashboard → Add Subject → PDF → Selected → Processing → Prefilled form → Created.
5. Add Subject → PDF with each of the 7 failure outcomes → Retry / Manual.
6. Add Subject → Manual → validation failed → fix → duplicate → Open existing, and → Replace.
7. Add Subject at cap (20) → Limit reached.
8. This Week × 5 states. Checklist toggle. Archive, Delete (code confirm), Account delete (password).
9. Calculator: all 6 scenarios, gate on and off, invalid value, conflict, new activity.
10. Session warning → Stay signed in. Session expired → Login with banner → draft restored banner.
11. Mobile journey: Login → Dashboard → drawer → Overview → Calculator.

---

## 14. OPEN ITEMS AND ASSUMPTIONS

**Owner decisions needed** (prototype proceeds with the default shown)

| ID  | Question                                                   | Default used   |
| --- | ---------------------------------------------------------- | -------------- |
| Q1  | Approve raising `text-muted` to 50% white (C1)?            | Yes            |
| Q2  | Allow gradient text on the dashboard title (C3)?           | No             |
| Q3  | Mono font: Roboto Mono or keep Inter for codes?            | Roboto Mono    |
| Q4  | Wording for proposed copy marked "(proposed)" in section 8 | Use as written |

**From the draw.io "Still open" list, they affect the prototype like this**

| Draw.io item                    | Prototype treatment                                                                 |
| ------------------------------- | ----------------------------------------------------------------------------------- |
| D1 Official average→grade table | Release gate hides PASSED / INT_A numeric grade by default (9.4). No table invented |
| D2 Activity→outcome roll-up     | Points-weighted (default stated in the draw.io), used in 9.1                        |
| D3 INTERVENTION_A grade         | Mapped average, behind the same gate                                                |
| D4 Exactly-60 rule              | UNDEFINED_AT_THRESHOLD, no grade                                                    |
| D5 Allowed email domains        | `example.edu` placeholder                                                           |
| D6 Hosting / email provider     | Not visible in UI                                                                   |
| D7 Real F-CID-009 PDFs          | Seed data is invented. Replace when real PDFs exist                                 |

**Assumptions made by this plan**

- Dashboard card "progress" = weeks done ÷ plan weeks (the draw.io says "subject cards with progress" without defining it).
- The Subject form uses 5 steps (a stepper is required by Design Rules 11.2 for multi-step forms; the 5-way split follows F-CID-009 parts named in the draw.io).
- Error codes (PDF_INVALID and others) appear as small `mono-sm` captions below human-readable messages.
- Modal radius 16 and badge radius full are not in Design Rules.

---

## APPENDIX A: COPY THAT MUST MATCH THE DRAW.IO EXACTLY

| Where                     | String                                                                                                                                                      |
| ------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Login throttled           | Too many attempts. Try again in a few minutes.                                                                                                              |
| Login failed (all causes) | Email or password is incorrect. (+ link: Resend verification)                                                                                               |
| Register invalid          | Fix the highlighted fields.                                                                                                                                 |
| Register / Forgot sent    | If this email is eligible, we sent you a message.                                                                                                           |
| Verify success            | Email verified. Please log in.                                                                                                                              |
| Verify invalid            | Link expired or already used. Request a new one.                                                                                                            |
| Reset invalid             | Link invalid or password too weak. Try again.                                                                                                               |
| Reset success             | Password changed. Please log in.                                                                                                                            |
| Cap reached               | Limit reached. Archive or delete a subject first.                                                                                                           |
| Upload prompt             | Select or drop the syllabus PDF (CSU F-CID-009).                                                                                                            |
| Scanned / timeout         | PARSE_TIMEOUT or PDF_SCANNED (looks like a scan). Retry, or use the Manual tab.                                                                             |
| Rejected file codes       | PDF_INVALID, PDF_TOO_LARGE, PDF_ENCRYPTED, RATE_LIMITED. Retry, or switch to the Manual tab.                                                                |
| Validation                | VALIDATION_FAILED. Highlight the fields. Confirm stays disabled.                                                                                            |
| Replace summary           | N scores copied, M not copied.                                                                                                                              |
| Save error                | System error. Rolled back. Retry (max 3).                                                                                                                   |
| Created                   | Subject created. Open its Overview.                                                                                                                         |
| Empty switcher            | Add your first subject.                                                                                                                                     |
| Empty module              | Not in this syllabus. Edit subject to add it.                                                                                                               |
| This Week                 | BEFORE_START: starts in N days, Week 1 preview · AFTER_END: Semester ended · NO_CLASS: show the next scheduled topic · NO_PLAN_FOR_WEEK: No topic scheduled |
| Calculator empty          | Choose a subject, or press Add Subject.                                                                                                                     |
| Calculator invalid        | Fix the value. Nothing is saved.                                                                                                                            |
| Calculator conflict       | CONFLICT_VERSION. Reload that row and enter it again.                                                                                                       |
| Calculator unmapped       | Unmapped activities are listed under Other activities and excluded from the result.                                                                         |
| Result label              | Estimated (self-reported)                                                                                                                                   |
| Undefined at 60           | UNDEFINED_AT_THRESHOLD: no grade. The syllabus does not define this case. Confirm with your instructor.                                                     |
| Intervention B            | best possible grade 3.0 after the weak outcomes pass                                                                                                        |

_End of plan. When in doubt, re-read Design Rules section 0, then choose the most minimal and intentional option._
