# GOLDENSYNC: PIECE-BY-PIECE BUILD SEQUENCE
> The exact order Cursor builds the Figma prototype. **One piece at a time. Never batch pieces.**
> Companion to `cursor-master-prompt-figma-prototype.md` and `figma-prototype-system-plan.md` (the "plan").
> Where this file says "plan 8.1", it means section 8.1 of `figma-prototype-system-plan.md`.

---

## 0. HOW TO USE THIS FILE

You work **one piece at a time**. A piece is the smallest unit that can be built, looked at, and judged on its own. The file has about 120 pieces. That is on purpose: small pieces make mistakes visible while they are still cheap to fix.

### 0.1 The Piece Loop (run for EVERY piece, no exceptions)

```
1. READ    Re-read the plan sections named in the piece. Do not rely on memory.
2. CHECK   Confirm every dependency (earlier piece) exists in the ID Ledger (0.3).
3. BUILD   Only what the piece lists. Nothing extra, nothing "while I'm here".
           One use_figma call per logical object. Keep each script short.
4. SHOT    get_screenshot of what you just built.
5. VERIFY  Run the piece's Verify list, item by item. Compare screenshot to the plan.
6. FIX     Any mismatch, even 4px, a wrong token or a wrong string: fix now.
7. RECORD  Write the piece row in system-progress-tracker.md and add new node ids to the ID Ledger.
8. NEXT    Only then open the next piece.
```

Do not skip steps 4 to 7 because a piece "looks trivial". Trivial pieces are where drift starts.

### 0.2 Hard limits per piece

| Limit | Value |
|---|---|
| Components built per piece | **1 component set** (or 1 small family that shares a master, named in the piece) |
| New frames per piece | **max 4** (the piece lists them) |
| Frames wired per piece | **1 flow segment** (wiring pieces are separate from drawing pieces) |
| Variables created per `use_figma` call | max 40 |
| Text nodes created per `use_figma` call | max 30 |
| Pieces open at once | **1** |

If a piece grows past its limit, **split it** and log the split in the tracker. Never stretch a limit.

### 0.3 ID Ledger (keep in `system-progress-tracker.md`)

After each piece, record: piece id, what it created, **node ids / component keys / variable ids / style ids**. Later pieces must reference ids from the ledger, never search by name guess. Template row:

```
| Piece | Built | Node/Component/Style ids | Verify | Shot | Notes |
```

### 0.4 Failure rules

- **Verify fails once:** fix in place, re-shoot, re-verify.
- **Verify fails twice:** delete **only that piece's output**, rebuild it clean. Never patch on top of a broken base.
- **A tool call errors twice with the same message:** stop, re-read the Figma skill for that tool, then retry. A third failure triggers stop condition 1 in the master prompt.
- **You find an error in an earlier piece:** stop the current piece. Fix the earlier piece. Re-verify it **and everything that depends on it**. Log it. Then resume.
- **Never** carry a known defect forward to "fix later".

### 0.5 Gate pieces

Pieces marked **GATE** are checkpoints: audit (plan 13.1) plus screenshots. All counts must be **0**. If a gate fails, you do not enter the next milestone.

### 0.6 Review pieces

Pieces marked **REVIEW** launch an independent review agent that has not seen your steps. Give it only: the plan, the file link and the checklist. Fix every finding, then re-run the gate audit.

### 0.7 Order of work inside a milestone

**Components before screens. Screens before wiring. Wiring last. Desktop (D) before tablet (T) before mobile (M).**

---

## 1. MILESTONE M0: FILE AND SCAFFOLD (4 pieces)

| Piece | Build | Verify |
|---|---|---|
| **0.1** | **Pre-flight.** Confirm Figma MCP. `whoami` (ask me if several plans). Read skill index and every SKILL.md needed for file creation and `use_figma`. Create `system-progress-tracker.md` with the milestone table, Deviations, Open questions, Known limits and the empty ID Ledger | Tracker exists. Skills read are listed in it |
| **0.2** | **Create the file.** `create_new_file`, design type, name `GoldenSync Prototype v1` | File link recorded in tracker. Screenshot of empty file |
| **0.3** | **Create 9 pages**, names exactly per plan 4.1: `00 Cover`, `01 Tokens`, `02 Components`, `03 Auth`, `04 Dashboard + Add Subject`, `05 Subject Modules`, `06 Grade Calculator`, `07 Prototype Controls`, `99 Scratch` | Page list matches. Screenshot of the page panel |
| **0.4** | **Cover page content.** Title, version, purpose, how to present (key `D`), seed-data warning, deviations C1 to C14 (as a list), mono-font note, reduced-motion note, link to the draw.io source. Plain text on a temporary frame. Final text styles come in M1, so mark this frame `COVER (restyle in 1.12)` | All 14 deviations present. No other content |

---

## 2. MILESTONE M1: TOKENS (13 pieces)

**Rule:** build in this exact order. Later collections alias earlier ones.

| Piece | Build | Verify |
|---|---|---|
| **1.1** | Collection `Primitives`, mode `Value`. All 16 primitives from plan 5.2 (black, white, blue-400, purple-400, cyan-400, dark-950/900/800/700/600, gray-500/400/300, green-400, yellow-400, red-400). Scope: none directly bindable in components (hide from publishing if possible) | `get_variable_defs`: 16 vars, hex values exact |
| **1.2** | Collection `Semantic`, mode `Dark`. **Backgrounds and borders:** `bg-base/elevated/overlay/subtle/muted` (alias primitives), `surface-glass`, `-md`, `-lg` (white 4/7/10%), `border-subtle/default/strong` (white 6/10/18%), `border-focus` (alias blue-400) | Aliases resolve. Alpha values exact |
| **1.3** | `Semantic`: **text and accent.** `text-primary` white 95%, `text-secondary` 65%, `text-muted` **white 50%** (deviation C1), `text-disabled` 25%, `text-inverse` (alias dark-950), `accent-primary/secondary/tertiary`, `status-success/warning/error/info` | `text-muted` is 50%, not 40%. Logged as C1 |
| **1.4** | `Semantic`: **component tints.** `tint-success/warning/error/accent` each with `-bg` (12%) and `-border` (25%), `focus-ring-glow` (blue 15%), `error-ring-glow` (red 15%), `accent-glass-bg` (blue 8%), `accent-glass-border` (blue 25%) | 12 tint vars + 4 glow vars present |
| **1.5** | Collection `Space`, mode `Value`: `space-1,2,3,4,6,8,10,12,16,24` = 4,8,12,16,24,32,40,48,64,96. Scope: gap and padding only | 10 vars, values exact |
| **1.6** | Collection `Radius`: `radius-md` 8, `radius-lg` 12, `radius-xl` 16, `radius-full` 999. Scope: corner radius only | 4 vars |
| **1.7** | Collection `Proto`, mode `Value`: all 13 variables from plan 5.6 with exact defaults and types. Create string variables with their allowed values written into each variable's description | 13 vars. Defaults match plan 5.6 |
| **1.8** | **Text styles, batch A:** `display-2xl, xl, lg, md, sm` and `heading-xl, lg, md, sm` (9 styles). Inter. Size, weight, line-height %, letter-spacing % exactly per plan 5.3. Bind fill to `text-primary` in the specimen only | 9 styles. No weight 300. Letter-spacing converted from em to % correctly |
| **1.9** | **Text styles, batch B:** `body-lg, md, sm`, `caption`, `overline` (uppercase), `mono-md`, `mono-sm` (Roboto Mono) (7 styles). Verify fonts load first. Tabular figures note in layer description | 16 text styles total. Overline is uppercase. Mono uses Roboto Mono |
| **1.10** | **Effect styles + paint styles:** `glass-sm`, `glass-md`, `glass-lg`, `glass-accent`, `shadow-hover`, `focus-ring`, and paint style `bg/ambient` (bg-base + blue 6% radial at 20%/50% + purple 6% radial at 80%/20%). Effects use the exact blur and shadow numbers in plan 5.4. Ignore `saturate()` | Create a throwaway swatch frame on `99 Scratch` to preview each style, screenshot, then delete the swatch |
| **1.11** | **`01 Tokens` documentation page.** Color swatches (grouped), type specimens (16 lines), glass samples (4, on `bg/ambient`, **no glass inside glass**), spacing ruler, radius samples. All bound to tokens | Screenshot per section. Zero unbound fills |
| **1.12** | **Restyle the Cover** from 0.4 using text styles and tokens. Rename the temporary frame | No temp wording left |
| **1.13** | **GATE M1.** Contrast check: compute `text-muted` (white 50% on dark-950) and `text-secondary` against `bg-base`; target ≥ 4.5:1. `get_variable_defs` full dump vs plan 5.2. Run audit (plan 13.1). Record counts in tracker | All audit counts 0. Contrast values recorded. If `text-muted` fails, raise it and log |

---

## 3. MILESTONE M2: CORE COMPONENTS (≈ 24 pieces)

**Rules for every component piece:** build the master on `02 Components` inside a labeled section, auto layout, all fills/strokes/effects bound, all text on named styles, variant properties (`Variant`, `Size`, `State`) as listed, boolean and text properties for optional parts. Add a `Focus` state using the `focus-ring` style. Name every layer. Give each component a layer description (purpose and aria note).

### 3.1 Icons first (they are dependencies of almost everything)

| Piece | Build | Verify |
|---|---|---|
| **2.1** | **Nav icons** (Lucide, SVG import, 24 viewBox, stroke 2, round): LayoutDashboard, ChevronsUpDown, BookOpen, Target, CalendarDays, ClipboardList, ScrollText, Users, Network, CheckSquare, Download, CalendarClock, Calculator, Plus, SlidersHorizontal, User, LogOut, Menu, PanelLeftClose, PanelLeftOpen (20 icons). Each a component with a size property for 14/16/20/24/64 | 20 icons. Strokes use `currentColor`-style bound fill. Even sizes only |
| **2.2** | **UI icons:** AlertCircle, AlertTriangle, Check, X, Eye, EyeOff, Mail, Lock, UploadCloud, FileText, Archive, Trash2, RotateCcw, Loader, BarChart2, Info (16 icons) | Same checks. No emoji |

### 3.2 Primitive controls

| Piece | Build | Verify |
|---|---|---|
| **2.3** | **`Button`**, part 1: Primary and Secondary. Sizes sm 36 / md 44 / lg 52. States Default, Hover, Active, Focus, Disabled, Loading (spinner replaces label, width kept). Property `hasLeadingIcon` | 2 variants × 3 sizes × 6 states. Primary uses `accent-primary` fill and `text-inverse` label. Disabled 40% opacity |
| **2.4** | **`Button`**, part 2: Ghost, Destructive, IconOnly (44×44). Same states | Destructive uses tint-error tokens. IconOnly description contains the aria-label note |
| **2.5** | **`Input`**: States Default, Focus, Filled, Error, Disabled. Booleans `hasLeadingIcon`, `hasTrailingIcon`. Height 44, 48 on mobile (separate size). Focus: 2px `border-focus` + glow. Error: red border + glow | Error state pairs the border with a message slot (built in 2.6) |
| **2.6** | **`FormField`** (label, Input, helper, error with `AlertCircle` 14). Required asterisk. 8px gaps | Label `body-sm` 500, error `caption`. Required state shows asterisk |
| **2.7** | **`Textarea`** (min 96 high) and **`Checkbox`** (Checked, Unchecked, Error, 44px hit area) | Both have all 5 states |
| **2.8** | **`Badge`**: variants default/success/warning/error/accent, sizes sm 20 / md 24 / lg 28 | Text present in all. Pill radius |
| **2.9** | **`StatusChip`**: Not Started, In Progress (with `Pulse` 1/2), Completed | Gray dot / blue dot / check |
| **2.10** | **`ResultStatusBadge`**: PASSED, INTERVENTION_A, INTERVENTION_B, FAILED, UNDEFINED_AT_THRESHOLD, INCOMPLETE. Variant mapping: success, accent, warning, error, warning, default (plan 6.1) | Status text always present |

### 3.3 Containers

| Piece | Build | Verify |
|---|---|---|
| **2.11** | **`Card`**: Default, Interactive (Hover lift + `shadow-hover`), Active (`glass-accent` + static border-beam stroke, layer note `approx: BorderBeam 3s`). Booleans `hasHeader`, `hasFooter`. `glass-md`, radius 12, padding 24 | Header requires a title slot. No nested card. Max height rule noted |
| **2.12** | **`Table` container + header row + `TableRow`**: Row states Default, Hover, Selected, Skeleton. Header 40, overline. Rows ≥ 52. Number cell right-aligned with tabular figures. Empty cell shows "—" | Container `glass-sm` radius 12. Selected row has the 2px left accent border |
| **2.13** | **`MobileRowCard`** (label/value stacked, actions at bottom) | Uses a solid or glass-md surface, no glass inside glass |
| **2.14** | **`NavItem`**: Default, Hover, Active, Disabled, plus `collapsed` boolean (icon only). 44 high, radius 8, icon 20 | Active uses `glass-accent`. Disabled uses `text-disabled` |
| **2.15** | **`Sidebar`**: Expanded 240, Collapsed 64, Drawer (full width). Fill `bg-elevated`, right border `border-subtle`, **no blur**. Item order per plan 8.3 (Home, switcher, 11 modules, Add Subject after divider, Edit/Archive/Delete, divider, Account, Log out) | Item order exact. Label "Log out" (C11). No blur effect on the layer |
| **2.16** | **`Tabs`** (Upload PDF / Enter manually) and **`SegmentedControl`** (2 to 4 segments) | Active states use token fills |
| **2.17** | **`Modal`**: Desktop dialog (`glass-lg`, radius 16, max width 960, close X) and Mobile full-screen. Internal sections are **plain with `border-subtle` dividers**, no cards | No glass inside the modal. Backdrop 60% `bg-base` documented |

### 3.4 Feedback and states

| Piece | Build | Verify |
|---|---|---|
| **2.18** | **`Banner`**: Info, Warning, Error, Success (icon + text + optional action) | Every banner has text, not only color |
| **2.19** | **`Toast`** (Info, Success, Error) and **`Tooltip`** | Tooltip uses solid `bg-overlay` |
| **2.20** | **`Skeleton`**: Line, Block, Card, TableRow. Two shimmer variants (for the loop) | Radii match the real elements |
| **2.21** | **`EmptyState`** (booleans `hasCTA`, text props icon/heading/body, 64px muted icon, body max 280) and **`ErrorState`** (Component with 32px icon, Page with 64px icon) | Heading `heading-sm`, body `body-sm` |
| **2.22** | **`Popover` / `Menu`** (solid `bg-overlay`, `border-strong`, no glass). Used for the subject switcher and the manage menu | Solid fill confirmed |
| **2.23** | **`ProgressBar`** (value 0 to 100, heights 4/8), **`Stepper`** (Todo, Current, Done, Error, 5 steps) | Track `bg-subtle`, fill `accent-primary` |
| **2.24** | **`DropZone`**: Idle, Hover, Selected (filename + size), Rejected | Dashed `border-default` |
| **2.25** | **GATE M2.** Screenshot grid per component section. Verify every interactive component has Default, Hover, Active, Focus, Disabled. Run audit | All counts 0. Gaps listed and fixed |

---

## 4. MILESTONE M3: DOMAIN COMPONENTS (7 pieces)

| Piece | Build | Verify |
|---|---|---|
| **3.1** | **`SubjectCard`** (code `mono-md`, title `heading-lg`, units Badge, semester label, ProgressBar "N of M weeks done") with Default and Active variants. Active adds the beam stroke | Built from `Card` instance. No glass inside glass |
| **3.2** | **`SemesterPicker`** (select-like control + "New semester" item) | Uses `Popover` solid fill |
| **3.3** | **`OutcomeRow`**, **`ActivityRow`** (Activity, Outcome, Score, Max, Percent), **`WeekRow`** (week no., topic, outcome, activities, checkbox, StatusChip) | Numbers right-aligned, tabular |
| **3.4** | **`ResultCard`** (status badge, large average, grade or hidden-grade note, "Estimated (self-reported)" label, weak outcomes with plan topics). Properties for status and `isGradeHidden` | Label text present on every variant |
| **3.5** | **`OutcomeMap`** (PEO/PO/CO columns, I/E/D chips, static CO to PO connector lines, hover highlight variant, note `approx: AnimatedBeam`) and **`CoverageMatrix`** (activities × outcomes) | Lines connect the seed mapping in plan 7 |
| **3.6** | **`FlaggedField`** (warning treatment + caption "Check this value") and **`PdfStepIndicator`** (Uploading, Extracting text, Parsing syllabus + progress bar, 4 states) | Flag uses warning tint plus text, not color alone |
| **3.7** | **`Shake`** helper component (variants 0/1/2/3 at x = 0, -8, 8, 0) for the Login error animation | 4 variants exist |
| **3.8** | **GATE M3 + REVIEW A.** Audit. Then launch an independent review agent on M0 to M3 (tokens, library) against the plan. Fix every finding | Audit 0. Review findings all closed in tracker |

---

## 5. MILESTONE M4: PAGE 1, AUTHENTICATION (`03 Auth`) (≈ 13 pieces)

Reference: plan 8.1. **Draw first, wire later.** Desktop first.

### 5.1 Draw (desktop 1280)

| Piece | Frames | Verify |
|---|---|---|
| **4.1** | **Auth shell**: root frame 1280×800 with `bg/ambient`, centered `glass-lg` panel (max 440), logo + app name above, 12-col grid margin 48. Build as a reusable frame, no content | Panel is the only glass layer. Grid set |
| **4.2** | `P1/Login/Default/D`: title, Email, Password (eye icon), buttons Log In (Primary), Create Account (Secondary), Forgot password (Ghost link). Add the **static meteor decoration** (15 thin diagonal lines, low opacity, behind panel, layer note `approx: MeteorShower`) | Meteor present. Only 1 other effect on screen |
| **4.3** | `P1/Login/Loading/D` (button spinner) and `P1/Login/Error/D` ("Email or password is incorrect." + link "Resend verification", Banner error) | Message exact. Error shows icon + text |
| **4.4** | `P1/Login/Throttled/D` (Banner "Too many attempts. Try again in a few minutes.", Log In disabled with reason) and `P1/Login/SessionExpired/D` (Banner warning, proposed copy) | Disabled button has the reason visible |
| **4.5** | `P1/Login/LoggedOut/D` (success Toast "You have been logged out.") | Toast uses success variant |
| **4.6** | `P1/Register/Default/D` (Email, Password, Confirm, consent Checkbox, Create Account) and `P1/Register/FieldErrors/D` (Banner "Fix the highlighted fields." + inline errors, only after interaction) | Meteor present on both. Errors icon + message |
| **4.7** | `P1/Register/Submitting/D` and `P1/Register/Sent/D` ("If this email is eligible, we sent you a message." + Go to Login) | Same text as Forgot Sent |
| **4.8** | `P1/Forgot/Default/D`, `P1/Forgot/Sent/D`. No meteor on these | Text exact |
| **4.9** | `P1/Reset/Default/D`, `P1/Reset/Invalid/D` ("Link invalid or password too weak. Try again." + Retry), `P1/Reset/Success/D` ("Password changed. Please log in.") | Text exact |
| **4.10** | `P1/Verify/Success/D` ("Email verified. Please log in." + success check) and `P1/Verify/Invalid/D` ("Link expired or already used. Request a new one.") | Text exact. Check uses the 400ms scale animation later |
| **4.11** | `P1/Overlay/SessionWarning/D` (Modal "Your session will expire in 2 minutes." Stay signed in / Log out) | Modal over the dimmed Login-style background |
| **4.12** | **Mobile (375):** `P1/Login/Default/M`, `P1/Register/Default/M`, `P1/Forgot/Default/M`. Inputs 48 high, primary full width, padding 16 | No horizontal overflow. Targets ≥ 44 |

### 5.2 Wire (separate pieces)

| Piece | Wire | Verify |
|---|---|---|
| **4.13** | **Login branches.** Login/Default → Loading (After delay 800ms) → conditional on `loginOutcome`: success → Dashboard placeholder frame, wrong → Error (with Shake) and `loginFailCount`+1, throttled or `loginFailCount ≥ 5` → Throttled. Create Account → Register. Forgot → Forgot. Return links | Click through in Present: success, wrong ×5 reaching Throttled |
| **4.14** | **Register, Forgot, Reset, Verify** wiring per plan 8.1 table, including the Go to Login buttons and Retry | All destinations exist. No dead end |
| **4.15** | **GATE M4.** Audit. Run Flow 3 and Flow 2 (plan 13.3) in Present mode. Record pass/fail | Audit 0. Flows 2 and 3 pass |

---

## 6. MILESTONE M5: APP SHELL AND PAGE 2 (`04 Dashboard + Add Subject`) (≈ 20 pieces)

Reference: plan 8.2, 8.3.

### 6.1 Shell and dashboard

| Piece | Build | Verify |
|---|---|---|
| **5.1** | **App shell template D**: Sidebar Expanded + content area with 32 padding, 12-col subgrid gutter 24, top area. Sidebar and top bar set to Fixed scroll | Sidebar solid, no blur. Item order exact |
| **5.2** | `P2/Dashboard/Default/D`: title (`display-md`, solid, C3), SemesterPicker, Add Subject (Primary), 3-col grid of 3 `SubjectCard`s from the seed data (ITE 14 Active) | Seed data exact (plan 7). Gap 24. Title not gradient |
| **5.3** | `P2/Dashboard/Loading/D` (skeleton layout, 3 cards), `P2/Dashboard/EmptySubjects/D` (EmptyState BookOpen "No subjects yet" + Add Subject) | Skeleton sized like real cards |
| **5.4** | `P2/Dashboard/NoSemester/D` and `P2/Semester/New/D` (dialog: Label, Start, End, Skipped weeks chips) and `P2/Semester/Error/D` ("End date must be after the start date.") | Validation error only after interaction |
| **5.5** | `P2/AddSubject/CapReached/D` (Banner "Limit reached. Archive or delete a subject first.") | Text exact |

### 6.2 Add Subject modal: upload path

| Piece | Build | Verify |
|---|---|---|
| **5.6** | `P2/AddSubject/Upload/Idle/D` (Modal, Tabs, DropZone "Select or drop the syllabus PDF (CSU F-CID-009).") and `.../Upload/Selected/D` (filename and size, Sync Syllabus) | Tabs visible. Text exact |
| **5.7** | `P2/AddSubject/Upload/Rejected/D` **four variants**: `invalid` PDF_INVALID, `toolarge` PDF_TOO_LARGE, `encrypted` PDF_ENCRYPTED, `ratelimited` RATE_LIMITED. Error Banner + `mono-sm` code + actions Retry and Switch to Manual | One frame per code. Plain wording, proposed copy logged |
| **5.8** | `P2/AddSubject/Upload/Processing/D` **three states**: step 1, step 2, step 3 with `PdfStepIndicator` and bar at 33/66/100 | Bar values exact |
| **5.9** | `P2/AddSubject/Upload/ParseError/D` **two variants**: `scanned` PDF_SCANNED and `timeout` PARSE_TIMEOUT. Retry and Use Manual tab | Text per Appendix A |

### 6.3 Subject form

| Piece | Build | Verify |
|---|---|---|
| **5.10** | **Form shell**: Modal with Stepper (5 steps), footer Back / Next / Confirm. Plain sections, no cards | Back and Next visible. Confirm disabled by default |
| **5.11** | `P2/SubjectForm/Step1/Prefilled/D`: Semester, Code, Title, Units, Prerequisite, Effectivity. One or two `FlaggedField`s | Flags never hide data |
| **5.12** | `Step2/Prefilled/D` (Outcomes list, add/remove, limit 20 noted) and `Step3/Prefilled/D` (Activities: label, max, mapped outcomes; limit 150) | Seed outcomes CO1 to CO4, 8 activities |
| **5.13** | `Step4/Prefilled/D` (Learning plan weeks, 30 limit) and `Step5/Prefilled/D` (Policies, faculty, Confirm enabled) | Plan shows week 9 as no class |
| **5.14** | **Manual path:** `Step1/Empty/D`, `Step2/Empty/D`, `Step3/Empty/D` | Empty fields, no flags |
| **5.15** | `Step1/ValidationFailed/D` ("VALIDATION_FAILED. Highlight the fields. Confirm stays disabled.") and `Step3/Autosaved/D` ("Draft saved" caption) | Confirm disabled with reason |

### 6.4 After confirm

| Piece | Build | Verify |
|---|---|---|
| **5.16** | `P2/Duplicate/Dialog/D` (text, Open existing, Replace) and `P2/Replace/Summary/D` ("N scores copied, M not copied." seed 6 and 2, archive info line, Open Overview) | Text exact |
| **5.17** | `P2/Save/Saving/D`, `P2/Save/Error/D` ("System error. Nothing was saved. Retry." attempt 1 of 3), `P2/Save/Created/D` ("Subject created. Open its Overview." + check) | Text exact |
| **5.18** | `P2/Drafts/Restored/D` (Dashboard + Banner "We restored your unsaved subject form." + Resume) | Proposed copy logged |

### 6.5 Sidebar variants and responsive

| Piece | Build | Verify |
|---|---|---|
| **5.19** | `P2/Dashboard/Collapsed/D` (64px sidebar + Tooltip) and the subject switcher popover (`P2/Switcher/Open/D`, list of active subjects with check, "Add your first subject." empty variant) | Tooltip solid. Popover solid |
| **5.20** | **Tablet 768:** `P2/Dashboard/Default/T` (64 sidebar, 2-col) and `P2/Dashboard/DrawerOpen/T` | Hamburger present |
| **5.21** | **Mobile 375:** `P2/Dashboard/Default/M`, `.../Loading/M`, `.../EmptySubjects/M`, `P2/Dashboard/DrawerOpen/M` | One column. Drawer full width. Targets ≥ 44 |
| **5.22** | **Mobile Add Subject:** `P2/AddSubject/Upload/Idle/M` and `P2/SubjectForm/Step1/Prefilled/M` (full-screen modal, single column) | No horizontal overflow |

### 6.6 Wire Page 2 (three pieces)

| Piece | Wire | Verify |
|---|---|---|
| **5.23** | Dashboard: subject card → Overview placeholder, Add Subject → modal (overlay, Move in/Dissolve 250ms), semester paths, cap branch on `subjectCount ≥ 20` | Overlay closes on outside click |
| **5.24** | Upload branches: Selected → Processing (chain 3 steps ≈ 2.5s) → branch on `pdfOutcome` (7 values) → Rejected/ParseError (Retry and Switch to Manual) or Prefilled Step1. Tab switching | All 7 outcomes reachable |
| **5.25** | Form and save: Step1→5 Next/Back, ValidationFailed branch, `duplicateCode` branch → Dialog → Open existing / Replace → Summary, `saveOutcome` branch → Saving → Error (Retry) or Created → Overview | Both duplicate branches work |
| **5.26** | **GATE M5.** Audit. Run Flows 4, 5, 6, 7 (plan 13.3) in Present mode | Audit 0. Four flows pass |

---

## 7. MILESTONE M6: PAGE 3, SUBJECT MODULES (`05 Subject Modules`) (≈ 16 pieces)

Reference: plan 8.4. All frames use the app shell with ITE 14 active.

| Piece | Build | Verify |
|---|---|---|
| **6.1** | **Module template D**: shell + page title (`display-sm`) + overline breadcrumb `ITE 14 · 1st Semester AY 2026–2027` + content slot | Breadcrumb exact |
| **6.2** | `P3/Overview/Default/D` (course specification card, quick links) | Units, prerequisite ITE 13, effectivity AY 2026–2027 |
| **6.3** | `P3/Outcomes/Default/D` with `OutcomeMap` (seed map: CO1 to PO a,b · CO2 to PO b · CO3 to PO c · CO4 to PO c,d) and `.../Hover/D` highlight variant | Lines and I/E/D chips match plan 7 |
| **6.4** | `P3/Plan/Default/D`: 18-row weeks table (week 9 "No class", week 13 "Secure session handling"), notes Textarea | Week 13 row highlighted |
| **6.5** | `P3/Grading/Default/D`, `P3/Policies/Default/D`, `P3/Faculty/Default/D` with "Read-only (from your saved syllabus)" caption | 3 to 5 lines of seed text each |
| **6.6** | `P3/Grading/EmptyModule/D`, `P3/Policies/EmptyModule/D`, `P3/Faculty/EmptyModule/D` ("Not in this syllabus. Edit subject to add it." + Edit subject) | Text exact |
| **6.7** | `P3/Assessments/Default/D` with `CoverageMatrix` (8 activities × 4 outcomes) | Activity labels match plan 9.2 |
| **6.8** | `P3/Checklist/Default/D` (18 `WeekRow`s, 11 of 18 done, caption "Ticking weeks never changes your results.") and `P3/Checklist/Toggled/D` (one week toggled, "12 of 18") | Done = Completed chip, current week In Progress |
| **6.9** | `P3/Export/Default/D` (SegmentedControl CSV/JSON, Download, info line) | Text per plan |
| **6.10** | **This Week states, 5 frames** (D): `Normal` (Week 13, Topic, Outcome CO3, Lab 3, Next: Midterm Exam), `BeforeStart` (starts in 14 days, Week 1 preview), `AfterEnd` ("Semester ended"), `NoClass` ("No class this week" + next topic), `NoPlan` ("No topic scheduled"). Each shows "Today: Tue 10 Nov 2026 · Week 13" | 5 frames. Caption on all |
| **6.11** | `P3/Manage/Menu/D` (Menu: Edit, Archive, Delete) and `P3/Archive/Confirm/D` | "You can restore this subject for 30 days." |
| **6.12** | `P3/Delete/Confirm/Default/D` (Destructive disabled) and `.../Filled/D` (enabled after typing ITE 14). Text "Type ITE 14 to confirm. This also removes its scores." | Disabled state shows the reason |
| **6.13** | `P3/Account/Default/D` (Export my data, Delete account) and `P3/Account/DeleteDialog/D` (password field, "This removes everything you own.") | Destructive uses error tokens |
| **6.14** | **Mobile (375):** `P3/Overview/Default/M`, `P3/Plan/Default/M`, `P3/ThisWeek/Normal/M`, `P3/Checklist/Default/M`, `P3/Delete/Confirm/M` (full-screen) | Tables become `MobileRowCard` lists |
| **6.15** | **Tablet (768):** `P3/Overview/Default/T`, `P3/Plan/Default/T` | 64 sidebar. Low-priority columns hidden |
| **6.16** | **Wire Page 3.** Sidebar items to modules (each sidebar instance wired the same way, so wire the component once if possible), Manage menu, Archive/Delete flows, Account, This Week jumps by `weekState`, Checklist toggle via a variable and variant change, Log out to Login/LoggedOut | No dead ends. Disabled items not clickable |
| **6.17** | **GATE M6 + REVIEW B.** Audit. Run Flows 1 and 8 (plan 13.3). Launch an independent review agent over M4 to M6 against the plan and Appendix A. Fix findings | Audit 0. Review closed |

---

## 8. MILESTONE M7: PAGE 4, GRADE CALCULATOR (`06 Grade Calculator`) (≈ 12 pieces)

Reference: plan 8.5, 9. **Recompute every number yourself before drawing it.**

### 8.1 Scenario arithmetic (verify this table first, piece 7.0)

Each outcome has 2 activities, max 50 each, so the percent = sum of the two scores.

| Scenario | CO1 | CO2 | CO3 | CO4 | Average | Attained (>60) | Status |
|---|---|---|---|---|---|---|---|
| PASSED | 85 | 78 | 72 | 90 | 81.25 | 4/4 | PASSED |
| INT_A | 80 | 75 | 55 | 90 | 75 | 3/4 | INTERVENTION_A (weak CO3) |
| UNDEFINED | 70 | 50 | 70 | 50 | 60 | 2/4 | UNDEFINED_AT_THRESHOLD |
| INT_B | 70 | 65 | 40 | 45 | 55 | 2/4 | INTERVENTION_B, 3.0 (weak CO3, CO4) |
| FAILED | 70 | 40 | 45 | 50 | 51.25 | 1/4 | FAILED, 5.0 (weak CO2, CO3, CO4) |
| INCOMPLETE | 85 | 78 | 72 | none | n/a | n/a | INCOMPLETE |

Per-activity splits are in plan 9.3. Weak-outcome topics (plan 9.3): CO2 "Data validation", CO3 "Secure session handling", CO4 "Deployment and testing".

| Piece | Build | Verify |
|---|---|---|
| **7.0** | **Arithmetic check.** Recompute all six rows above from the per-activity scores in plan 9.3. Write results in the tracker. Do not draw before this passes | Every average and attained count matches |
| **7.1** | `P4/Calculator/NoSubject/D` (EmptyState "Choose a subject, or press Add Subject." + Add Subject) | Text exact |
| **7.2** | `P4/Calculator/Default/D` (= PASSED scenario table): groups CO1 to CO4 with `ActivityRow`s, chip "Estimated (self-reported)", buttons Add activity (Secondary) and Add Subject (Ghost), "Other activities" group with caption "Excluded from the result." | Label chip always visible. Numbers right-aligned |
| **7.3** | `P4/Calculator/IntA/D`, `.../Undefined/D`, `.../IntB/D` tables with the scenario scores | Scores match plan 9.3 |
| **7.4** | `P4/Calculator/Failed/D` and `.../Incomplete/D` (CO4 empty cells "—", per-outcome progress bars, caption "Score at least one activity in every outcome to see your result.", **no result card**) | Incomplete shows no result |
| **7.5** | **Result cards, ungated:** `P4/Result/IntB/D` (grade 3.0, weak CO3 CO4 with topics), `P4/Result/Failed/D` (grade 5.0, weak CO2 CO3 CO4), `P4/Result/Undefined/D` ("UNDEFINED_AT_THRESHOLD: no grade. The syllabus does not define this case. Confirm with your instructor.") | Never gated. Weak topics exact |
| **7.6** | **Result cards, gated, 4 frames:** `P4/Result/Passed/GateHidden/D` and `.../GateShown/D`, `P4/Result/IntA/GateHidden/D` and `.../GateShown/D`. Hidden: status + average + "Numeric grade hidden until the official grade scale is confirmed." Shown: badge "Demo value, official scale pending" + placeholder grade (do **not** invent a table) | 4 frames. Placeholder only inside the badge-marked state |
| **7.7** | `P4/Calculator/NewActivity/D` (dialog: Label, Max, outcome multi-select ≥ 1, info line) and `P4/Calculator/EditScore/D` (Popover with ± stepper) | Info text exact |
| **7.8** | `P4/Calculator/InvalidValue/D` (cell error + "Fix the value. Nothing is saved.") and `P4/Calculator/Conflict/D` (row highlight + "CONFLICT_VERSION. Reload that row and enter it again." + Reload) | Text exact |
| **7.9** | **Responsive:** `P4/Calculator/Default/T`, `P4/Calculator/Default/M`, `P4/Result/IntB/M` (card-list on mobile) | No horizontal scroll |
| **7.10** | **Wire Page 4:** NoSubject → Add Subject modal, Default ⇄ NewActivity, score cell → EditScore → valid returns / invalid → InvalidValue, `conflict` branch, scenario SegmentedControl (prototype-only, marked) jumps between the 6 calculators and results, `gradeScaleConfirmed` switches hidden and shown frames for PASSED and INT_A | All six scenarios reachable. Gate toggle works |
| **7.11** | **GATE M7 + REVIEW C.** Audit. Run Flow 9. Independent review of M7: re-derives every status from the table. Fix findings | Audit 0. Review closed |

---

## 9. MILESTONE M8: DEMO PANEL AND FLOWS (`07 Prototype Controls`) (≈ 6 pieces)

Reference: plan 8.6, 4.5.

| Piece | Build | Verify |
|---|---|---|
| **8.1** | **Demo Panel frame** (`bg-overlay`, `mono-sm`, overline "PROTOTYPE CONTROLS"): control groups per plan 8.6 as `SegmentedControl`s | All 11 control groups present |
| **8.2** | **Legend** on the same page: every `Proto` variable, what it does and allowed values (plan 5.6) | 13 variables listed |
| **8.3** | **Wire Demo Panel buttons** group 1: Login outcome, Verify link, Session (warning / expire) | Each sets its variable and jumps to the first relevant frame |
| **8.4** | **Wire group 2:** PDF result (7), Duplicate, Save, Subject count | Cap (20) reaches CapReached |
| **8.5** | **Wire group 3:** This Week (5), Calculator scenario (6), Grade scale, Conflict | Scenario jumps correct frame |
| **8.6** | **Key `D` overlay** from every frame (add the key trigger on each root frame or via the app shell component). Create the 11 Flow starting points of plan 4.5 | Key opens panel on any frame. Flows list matches |
| **8.7** | **GATE M8.** Audit, then run Flows 10 and 11 | Audit 0. Flows pass |

---

## 10. MILESTONE M9: RESPONSIVE PASS (≈ 3 pieces)

Reference: plan section 11. Most T and M frames already exist from earlier pieces. This milestone **fills gaps only**.

| Piece | Build | Verify |
|---|---|---|
| **9.1** | **Gap audit.** List every T and M frame required by plan 11 and compare to the file. Write the missing list in the tracker | List is complete |
| **9.2** | **Build the missing frames**, **max 4 per piece**, repeating 9.2 as needed (9.2a, 9.2b, …). Include the 1920 dashboard if time allows (stretch, plan C12) | Every required frame exists. No horizontal overflow |
| **9.3** | **Wire T and M frames:** drawer open/close, mobile journey (Flow 11), sidebar hamburger | Mobile journey clicks through end to end |
| **9.4** | **GATE M9.** Audit. Check targets ≥ 44 and inputs 48 on every M frame | Audit 0 |

---

## 11. MILESTONE M10: MOTION AND FINAL QA (≈ 8 pieces)

Reference: plan 10, 13. **Motion is last** so it never hides a layout bug.

| Piece | Build | Verify |
|---|---|---|
| **10.1** | **Page transitions:** default Dissolve 300ms ease-out on all navigations. Overlay: Move in or Dissolve + 8px rise 250ms, backdrop 60% | Check from every flow |
| **10.2** | **Shake** on Login error (Shake variants chained, 100ms each, ease-in-out-sine) and on register errors | Login wrong → visible shake |
| **10.3** | **Success check** (Smart Animate scale 0.6 to 1 + opacity, 400ms easeOutExpo) on Created and Verify success | Plays on arrival |
| **10.4** | **PDF processing chain** (3 steps, bar 33/66/100, ≈ 2.5s) with Smart Animate | Total ≈ 2.5s, then branch on `pdfOutcome` |
| **10.5** | **Stretch, only if everything above passed:** card stagger, progress fill, StatusChip pulse, skeleton shimmer, shimmer button hover | Skip any that cause instability |
| **10.6** | **Content diff:** compare every string in Appendix A (plan) to the file, line by line | 0 mismatches |
| **10.7** | **Contrast and a11y recheck:** muted text, captions, helper text, table headers ≥ 4.5:1. Focus variants exist. Icon buttons have aria notes. Status never color-only | Values recorded |
| **10.8** | **Flow run, all 11** (plan 13.3) in Present mode, recording pass/fail each | 11 of 11 pass |
| **10.9** | **REVIEW D (final).** Independent agent runs plan 13.2 checklist against the whole file. Fix every finding, re-audit | Closed |
| **10.10** | **Cleanup:** `99 Scratch` emptied, no default layer names, no orphan components, tracker finalized. Final **GATE** audit | All counts 0 |
| **10.11** | **Deliver** the final report in the master prompt's format (section 10 there). Include the file link | Every evidence line filled with real numbers |

---

## 12. CHEAT SHEET: COMMON TRAPS (CHECK BEFORE EVERY PIECE)

```
TOKENS     Bind to Semantic/Space/Radius only. Never to Primitives. Never raw hex.
GLASS      Card md · Modal lg · Active accent · Sidebar solid no blur · Menus/Popovers solid.
           No glass inside glass. No cards inside modals.
TEXT       Every text node has a named style. text-muted is 50% (C1). Placeholders use muted.
COPY       Appendix A verbatim. Login failure text is ALWAYS the same. Register/Forgot sent text is the same.
RESULTS    "Estimated (self-reported)" visible on every calculator and result frame.
GATE       No invented grade table. PASSED and INT_A numeric grade hidden by default.
THRESHOLD  Attained means percent > 60. Exactly 60 is NOT attained. Average = 60 is UNDEFINED.
SEED       Today is Tue 10 Nov 2026 = Week 13. Semester 17 Aug to 18 Dec 2026. Week 9 skipped. 11 of 18 done.
NAMING     P<page>/<Screen>/<State>/<Size>. No "Frame 12".
LAYOUT     Auto layout. Gaps and padding multiples of 4. No nudged layers.
EFFECTS    Max 2 per screen. Meteor on Login and Register only. Beam on active subject card only.
SCOPE      Never draw server-only steps. Never write code. Never use system-ai-workflow-rules.md.
ORDER      Components → screens → wiring → motion. D → T → M.
```

---

## 13. PIECE COUNT AND PACE

| Milestone | Pieces | Notes |
|---|---|---|
| M0 | 4 | Scaffold |
| M1 | 13 | Tokens, gate |
| M2 | 25 | Core library, gate |
| M3 | 8 | Domain library, gate, review A |
| M4 | 15 | Page 1 |
| M5 | 26 | Page 2 |
| M6 | 17 | Page 3, review B |
| M7 | 12 | Page 4, review C |
| M8 | 7 | Demo Panel and flows |
| M9 | 4+ | Responsive gaps |
| M10 | 11 | Motion, QA, review D, delivery |

About **140 pieces.** The speed is the sum of many small safe steps. If you feel the urge to combine two pieces, that is the signal to slow down, not speed up.

---

*Begin with piece 0.1. When a piece is verified and recorded, open the next one. Not before.*
