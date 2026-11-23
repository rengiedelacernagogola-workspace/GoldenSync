# GOLDENSYNC: FIGMA NAMING CONVENTION
> Every page, frame, component, layer, variable and style in the prototype follows this file.
> Written so a non-technical person can read any name and know what it is, and strict enough that a senior reviewer can audit it by script.
> Companion to `figma-prototype-system-plan.md` (the "plan") and `piece-by-piece-goldensync.md`.

---

## 0. PURPOSE AND AUTHORITY

### 0.1 Why this file exists
Names are the user interface of a Figma file. A bad name costs time every day: people cannot find things, two things look the same, and automation (audits, wiring, handoff to code) breaks. This file makes every name **one-purpose, unique, plain-English and predictable.**

### 0.2 What this file governs
| Area | Status |
|---|---|
| Names of pages, sections, frames, components, properties, layers, icons, flows, version labels | **Governed here** |
| Names of variables and styles that the plan already lists (`bg-base`, `space-4`, `glass-md`, `proto/loginOutcome`…) | **Frozen.** Use exactly as the plan writes them. Do not rename |
| Names of any new variable or style | Governed here (section 8.3) |

### 0.3 Precedence
For **names only**: this file wins over `figma-prototype-system-plan.md` and `piece-by-piece-goldensync.md`. Where they differ, section 16 lists the exact changes. For everything else (behavior, copy, visuals) the usual order applies: draw.io, then `DESIGN_RULES.md`, then the plan.

### 0.4 Who must obey
Cursor, every reviewer agent, and every human who edits the file. **No exceptions, no "temporary" names.**

---

## 1. THE TEN RULES (PLAIN ENGLISH)

1. **One name, one purpose.** A name says exactly one thing. If it needs "and", it is two things and needs two names.
2. **No duplicates, ever.** Two things in the same scope never share a name. Never fix a clash by adding `2`, `copy` or `new`.
3. **Say what it is, not how it looks.** `Button`, not `BlueRoundedThing`. `ErrorBanner`, not `RedBox`.
4. **Use everyday words.** If a non-technical person cannot guess what it is, rename it. Abbreviations are allowed only from the approved list in section 2.
5. **Same pattern every time.** The same kind of thing is always named the same way (section 3 has one pattern per kind).
6. **The registry is the truth.** Frames and components must exist in Appendix A or B **before** you create them.
7. **Search before you create.** If the name (or its purpose) already exists, reuse it. Do not build a second one.
8. **Never leave a default name.** `Frame 12`, `Rectangle 4`, `Group 3`, `Vector`, `Ellipse` are failures.
9. **No version words.** No `final`, `v2`, `new`, `old`, `copy`, `temp`, `test`, `draft` in any name. History belongs in version history, not names.
10. **Names are stable.** Rename only through the rename process (section 12), and update the registry in the same step.

---

## 2. PLAIN-ENGLISH DECODER (APPROVED ABBREVIATIONS)

These are the **only** abbreviations allowed in names. Anything else must be spelled out.

| Short form | Means | Where it appears |
|---|---|---|
| `P1` | Page 1: Authentication (login, register, reset) | Frame names |
| `P2` | Page 2: Dashboard and Add Subject | Frame names |
| `P3` | Page 3: Subject modules (overview, plan, checklist…) | Frame names |
| `P4` | Page 4: Grade Calculator | Frame names |
| `D` | Desktop screen, 1280 wide | Frame names (last part) |
| `T` | Tablet screen, 768 wide | Frame names (last part) |
| `M` | Mobile screen, 375 wide | Frame names (last part) |
| `XL` | Wide desktop, 1920 wide (stretch only) | Frame names (last part) |
| `CO` | Course Outcome | Content labels, frame states |
| `PO` | Program Outcome | Content labels |
| `PEO` | Program Educational Objective | Content labels |
| `PDF` | The syllabus file format | Names mentioning the syllabus file |
| `CSV`, `JSON` | Export file formats | Export names |
| `IntA` | Result status **INTERVENTION_A** (average above 60, some outcomes weak) | Frame states |
| `IntB` | Result status **INTERVENTION_B** (average below 60, at least half attained) | Frame states |
| `sm`, `md`, `lg` | Small, medium, large | Size property values |
| `px` | Pixels | Notes only |

Everything else is a full word: `Dashboard` not `Dash`, `Subject` not `Subj`, `Semester` not `Sem`, `Navigation` not `Nav` (exception: the component `NavItem` and the layer `app-sidebar`, which are fixed in the plan).

---

## 3. THE GRAMMAR: ONE PATTERN PER KIND OF THING

| Kind | Pattern | Case | Separator | Unique within | Example |
|---|---|---|---|---|---|
| File | `GoldenSync Prototype v1` | Title | space | n/a | `GoldenSync Prototype v1` |
| Page | `NN Title` | Title Case | space | file | `03 Auth` |
| Section | `<Screen>` | PascalCase | none | file | `Login`, `ThisWeek` |
| Product frame | `P#/<Screen>[/<Area>]/<State>/<Size>` | PascalCase parts | `/` | **file** | `P1/Login/Error/D` |
| Template frame | `Template/<Name>/<Size>` | PascalCase | `/` | file | `Template/AppShell/D` |
| Prototype-control frame | `Control/<Name>` | PascalCase | `/` | file | `Control/DemoPanel` |
| Documentation frame | `Doc/<Name>[/<Sub>]` | PascalCase | `/` | file | `Doc/Tokens/Colors` |
| Component (set) | `<Noun>` | PascalCase | none | file | `SubjectCard` |
| Icon component | `Icon/<LucideName>` | PascalCase | `/` | file | `Icon/AlertCircle` |
| Component property (variant) | `Variant`, `Size`, `State`, or a named axis | Title Case | none | component | `State` |
| Variant value | `<Word>` | PascalCase (one word) | none | property | `Hover`, `IconOnly` |
| Boolean property | `is<Thing>` or `has<Thing>` | camelCase | none | component | `hasLeadingIcon` |
| Text property | `<role>` | camelCase | none | component | `label`, `helper` |
| Layer (inside a component or screen) | `<role>` or `<role>-<qualifier>` | kebab-case, lowercase | `-` | **its parent** | `error-text`, `field-email` |
| Variable | frozen by the plan, new ones per 8.3 | kebab-case (see 8.3) | `-` | collection | `bg-base` |
| Style | frozen by the plan, new ones per 8.3 | kebab-case | `-` or `/` | file | `glass-md` |
| Prototype flow | Title Case phrase from plan 4.5 | Title | space | file | `Main journey` |
| Version-history label | `M<n> <Milestone name> passed` | Title | space | n/a | `M2 Core components passed` |

**Length:** frame names ≤ 48 characters; layer names ≤ 32 characters; no leading or trailing spaces; no double separators (`//`, `--`).

---

## 4. PAGES, SECTIONS AND FRAMES

### 4.1 Pages (fixed, from plan 4.1)
`00 Cover` · `01 Tokens` · `02 Components` · `03 Auth` · `04 Dashboard + Add Subject` · `05 Subject Modules` · `06 Grade Calculator` · `07 Prototype Controls` · `99 Scratch`
Do not add, remove or rename pages. `99 Scratch` must be empty at delivery.

### 4.2 Sections
- One Figma Section per **screen**, named after the screen (`Login`, `Register`, `Dashboard`, `AddSubject`, `SubjectForm`, `ThisWeek`, `Calculator`, `Result`…).
- Inside a section: states left to right (Default, Loading, Error variants, Success). **Desktop row first. Tablet and mobile in a row beneath.**
- Section names must also be unique across the file.

### 4.3 Product frame anatomy
```
P# / Screen / [Area] / State / Size
│    │          │        │       └─ D, T, M (or XL)
│    │          │        └───────── what the user is looking at right now
│    │          └────────────────── optional: only when one screen has parts (Upload, Step1, Confirm)
│    └───────────────────────────── the screen, one word in PascalCase
└────────────────────────────────── which of the 4 pages
```
Read it aloud as a sentence: `P1/Login/Throttled/D` = "Page 1, Login screen, Throttled state, Desktop."

### 4.4 Frame prefixes (the only four allowed)
| Prefix | Use |
|---|---|
| `P1/` … `P4/` | A screen a real user would see |
| `Template/` | A reusable empty shell (`Template/AuthShell/D`, `Template/AppShell/D`, `Template/Module/D`) |
| `Control/` | Prototype-only helpers, never product UI (`Control/DemoPanel`, `Control/DemoLegend`) |
| `Doc/` | Documentation frames (`Doc/Cover`, `Doc/Tokens/Colors`, `Doc/Tokens/Type`, `Doc/Tokens/Glass`, `Doc/Tokens/Spacing`, `Doc/Tokens/Radius`) |

### 4.5 State naming rules
A state name describes **what the user sees**, in one PascalCase word or compound.
- ✅ `Loading`, `Error`, `Throttled`, `EmptySubjects`, `RejectedTooLarge`, `ProcessingStep2`
- ❌ `ErrorState2`, `Variant3`, `Alt`, `Other`, `Temp`, `Screen1`

**Every state name in the product must appear in Appendix A.** If you need a new state, add it to Appendix A first (section 11).

### 4.6 One frame, one purpose
A frame shows **exactly one state of exactly one screen at exactly one size.** Never put two states in one frame. Never reuse a frame for a second purpose.

### 4.7 Frames that look similar must still have different names
When several frames show the same screen with different outcomes (four rejected-file errors, six calculator scenarios), the **outcome is part of the state name** (`RejectedInvalid`, `RejectedTooLarge`, …). See section 16, N1.

---

## 5. COMPONENTS AND THEIR PROPERTIES

### 5.1 Component names
- **One noun, PascalCase, singular.** `Button`, `Banner`, `SubjectCard`.
- The name says **what it is**, never what it looks like or where it is used. ✅ `ResultCard` ❌ `CalcBottomBox`
- **No filler words:** `Component`, `Element`, `Item`, `Wrapper`, `Container`, `Custom`, `Main`, `Base`.
  (Exception: `NavItem` and `TableRow` are fixed by the plan because the thing really is one item or one row.)
- If two components do similar work, they are **one component with a property**, not two names. Example: Primary / Secondary / Ghost are values of `Variant` on `Button`, not three components.
- The full list is in Appendix B. **Do not create a component that is not on that list without adding it first.**

### 5.2 Property names and values (frozen set)
| Property | Type | Allowed values (exact spelling) |
|---|---|---|
| `Variant` | variant | Names listed per component in Appendix B |
| `Size` | variant | `sm`, `md`, `lg` (or the pixel size for icons: `14`, `16`, `20`, `24`, `64`) |
| `State` | variant | `Default`, `Hover`, `Active`, `Focus`, `Disabled`, plus per component: `Loading`, `Filled`, `Error`, `Selected`, `Checked`, `Unchecked`, `Idle`, `Rejected`, `Todo`, `Current`, `Done` |
| `hasLeadingIcon`, `hasTrailingIcon`, `hasHeader`, `hasFooter`, `hasCTA`, `isCollapsed`, `isGradeHidden` | boolean | `true`, `false` |
| `label`, `helper`, `error`, `heading`, `body`, `icon`, `title` | text | free text |

Rules:
- Variant **values** are PascalCase, one word. `IconOnly`, not `Icon Only` or `icon-only`.
- Boolean property names start with `is` or `has` and read as a yes/no question.
- One property controls one thing. Never use `Style` or `Type` as catch-all axes.
- Never use a property named `Property 1` (Figma's default). That is a defect.

### 5.3 Component placement
Components live **only** on `02 Components`, grouped into Sections named by family (`Icons`, `Buttons`, `Inputs`, `Cards`, `Tables`, `Navigation`, `Overlays`, `Feedback`, `Progress`, `Domain`). A section name is a plural noun and unique.

---

## 6. LAYERS (INSIDE COMPONENTS AND SCREENS)

### 6.1 Pattern
`<role>` or `<role>-<qualifier>`, lowercase kebab-case, **unique inside its parent.**

### 6.2 Approved role words (use these first)
| Group | Words |
|---|---|
| Structure | `container`, `content`, `header`, `footer`, `body`, `section`, `divider`, `backdrop` |
| Layout wrappers | `<purpose>-row`, `<purpose>-column`, `<purpose>-grid` (example: `actions-row`, `fields-column`) |
| Text | `title`, `subtitle`, `label`, `helper-text`, `error-text`, `caption`, `value` |
| Icons | `icon`, `icon-leading`, `icon-trailing` |
| Parts | `track`, `fill`, `dot`, `indicator`, `badge`, `checkbox`, `input-box` |
| Decoration | `deco-<what>` (example: `deco-meteor-lines`, `deco-border-beam`) |
| Notes | `note-<what>` (example: `note-approx-border-beam`) |
| Hit areas | `hit-<what>` (example: `hit-icon-button`) |

### 6.3 Instances inside screens
An instance keeps its component name **plus its purpose**, in kebab-case:
`button-log-in`, `button-create-account`, `link-forgot-password`, `field-email`, `field-password`, `card-subject-ite-14`, `banner-login-error`, `app-sidebar`, `modal-add-subject`.
Two Buttons on one screen must have two different names, always.

### 6.4 Top-level children of a screen frame (fixed names)
`app-sidebar`, `top-bar`, `page-header`, `content`, `modal-<purpose>`, `overlay-backdrop`, `banner-<purpose>`, `toast-<purpose>`, `deco-<what>`.

### 6.5 Text layers
Named by **role**, not by the words they contain. ✅ `title`, `helper-text` ❌ `Log in to GoldenSync`, `Text`.

### 6.6 Never
`Frame N`, `Group N`, `Rectangle N`, `Ellipse N`, `Line N`, `Vector`, `Text`, `Layer`, `Untitled`, empty names.

---

## 7. ICONS

- Name: `Icon/<LucideName>` using the exact Lucide name in PascalCase (`Icon/LayoutDashboard`, `Icon/AlertTriangle`, `Icon/Trash2`).
- One component per icon with the property `Size` = `14`, `16`, `20`, `24` or `64` (even numbers only).
- One icon library only. No emoji.
- The full icon list is in plan 6.3. Do not add an icon that is not in that list without a one-line justification in the tracker.

---

## 8. VARIABLES AND STYLES

### 8.1 Collections (frozen, from plan 5.1)
`Primitives` · `Semantic` · `Space` · `Radius` · `Proto`. Do not add collections.

### 8.2 Frozen names (use exactly)
| Group | Names |
|---|---|
| Primitives | `black`, `white`, `blue-400`, `purple-400`, `cyan-400`, `dark-950`, `dark-900`, `dark-800`, `dark-700`, `dark-600`, `gray-500`, `gray-400`, `gray-300`, `green-400`, `yellow-400`, `red-400` |
| Semantic backgrounds | `bg-base`, `bg-elevated`, `bg-overlay`, `bg-subtle`, `bg-muted` |
| Semantic surfaces | `surface-glass`, `surface-glass-md`, `surface-glass-lg` |
| Semantic borders | `border-subtle`, `border-default`, `border-strong`, `border-focus` |
| Semantic text | `text-primary`, `text-secondary`, `text-muted`, `text-disabled`, `text-inverse` |
| Semantic accents | `accent-primary`, `accent-secondary`, `accent-tertiary` |
| Semantic status | `status-success`, `status-warning`, `status-error`, `status-info` |
| Semantic tints | `tint-success-bg`, `tint-success-border`, `tint-warning-bg`, `tint-warning-border`, `tint-error-bg`, `tint-error-border`, `tint-accent-bg`, `tint-accent-border`, `focus-ring-glow`, `error-ring-glow`, `accent-glass-bg`, `accent-glass-border` |
| Space | `space-1`, `space-2`, `space-3`, `space-4`, `space-6`, `space-8`, `space-10`, `space-12`, `space-16`, `space-24` |
| Radius | `radius-md`, `radius-lg`, `radius-xl`, `radius-full` |
| Proto | `proto/sessionActive`, `proto/hasSemester`, `proto/subjectCount`, `proto/subjectSelected`, `proto/loginOutcome`, `proto/loginFailCount`, `proto/pdfOutcome`, `proto/duplicateCode`, `proto/saveOutcome`, `proto/weekState`, `proto/scenario`, `proto/gradeScaleConfirmed`, `proto/conflict` |
| Text styles | `display-2xl`, `display-xl`, `display-lg`, `display-md`, `display-sm`, `heading-xl`, `heading-lg`, `heading-md`, `heading-sm`, `body-lg`, `body-md`, `body-sm`, `caption`, `overline`, `mono-md`, `mono-sm` |
| Effect styles | `glass-sm`, `glass-md`, `glass-lg`, `glass-accent`, `shadow-hover`, `focus-ring` |
| Paint style | `bg/ambient` |

### 8.3 Naming any NEW variable or style
Allowed only with a one-line reason in the tracker. Pattern:
`<group>-<role>[-<level>]`, lowercase kebab-case, group from the existing list (`bg`, `surface`, `border`, `text`, `accent`, `status`, `tint`, `space`, `radius`). Name by **role**, never by value.
- ✅ `text-link`, `border-error`
- ❌ `light-gray`, `blue-button`, `padding-24`, `my-color`

### 8.4 Never bind a component to `Primitives`. Name nothing by its color value in `Semantic`.

---

## 9. PROTOTYPE NAMES

### 9.1 Flows (from plan 4.5, frozen)
`Main journey` · `Registration` · `Verify link (valid)` · `Verify link (expired)` · `Forgot password` · `Reset link (valid)` · `Reset link (invalid)` · `Add Subject via PDF` · `Add Subject manual` · `This Week states` · `Grade Calculator` · `Mobile journey`

### 9.2 Clickable layers
Every clickable layer's name states **what clicking does**: `button-log-in`, `link-resend-verification`, `card-subject-ite-14`, `button-retry`, `tab-enter-manually`.

### 9.3 Demo Panel controls
Layer name = `control-<group>-<value>` in kebab-case: `control-login-wrong-password`, `control-pdf-too-large`, `control-scenario-int-a`.

---

## 10. DESCRIPTIONS AND NOTES

Every component and every `Control/` frame carries a description in this exact shape:

```
Purpose: <one sentence, plain English>
Used in: <screens or "everywhere">
Accessibility: <aria-label or text alternative, if any>
Approximation: <only if a coded effect is imitated, e.g. "BorderBeam 3s (static)">
```

Rules: one sentence for Purpose; no jargon; no copy of the name; update when the component changes.

---

## 11. UNIQUENESS PROTOCOL (HOW DUPLICATES ARE PREVENTED)

### 11.1 Before creating ANY named thing, in this order
1. **Pick the kind** (section 3) and apply its pattern.
2. **Look it up in the registry** (Appendix A for frames, Appendix B for components).
   - Found and not yet built → use that exact name.
   - Not found → go to step 3.
3. **Search the file** (`use_figma`: list names in the relevant scope). If the **name or the purpose** already exists, **reuse or extend it. Do not create a second.**
4. **Add the new name to the registry first** (with its one-line purpose), then create it.

### 11.2 Scope of uniqueness
| Kind | Must be unique within |
|---|---|
| Pages, sections, frames, components, flows | the **whole file** |
| Layers | their **parent** |
| Variables | their **collection** |
| Styles | the **file** |
| Properties and values | their **component / property** |

### 11.3 Fixing a clash
Never add a number, `copy`, or `new`. Instead:
1. Ask: are these two the same purpose? → **delete one, reuse the other.**
2. Different purpose? → give each a **more specific** name that states its difference (`RejectedTooLarge`, not `Rejected2`).

### 11.4 One-purpose test (every name)
Answer yes to all five or rename it:
1. Can a non-technical person guess what this is from the name alone?
2. Does the name describe **one** thing?
3. Is it unique in its scope?
4. Does it use only approved abbreviations?
5. Does it match its registry row exactly?

---

## 12. RENAME, MOVE AND DELETE POLICY

- **Rename only when a name is wrong**, never for taste.
- Steps: (1) change the registry row, (2) rename the object, (3) run the name audit (section 15), (4) log it in the tracker (old name → new name, reason).
- Renaming a component never breaks instances, but **screens that reference its old name in notes or descriptions must be updated.**
- **Deleting:** remove the registry row only after the object is gone. Never leave an orphan registry row or an orphan object.
- **Never rename in bulk without a before/after list** saved in the tracker.

---

## 13. BANNED WORDS AND PATTERNS

| Banned | Why | Use instead |
|---|---|---|
| `Frame N`, `Group N`, `Rectangle N`, `Ellipse N`, `Vector`, `Line N`, `Text`, `Untitled`, `Layer` | Figma defaults say nothing | A role name (section 6) |
| `final`, `v2`, `v3`, `new`, `old`, `copy`, `temp`, `test`, `draft`, `wip`, `backup` | Versions belong in history | Delete, or give a purpose name |
| `2`, `3`, `(1)`, `-copy` suffixes | Hides a duplicate | A more specific name (11.3) |
| `misc`, `other`, `stuff`, `thing`, `item` (except `NavItem`), `element`, `wrapper`, `custom` | Says nothing | The real role |
| Colors in names (`blue-button`, `red-box`) | Colors change, roles do not | `button-primary`, `banner-error` |
| Sizes in names (`card-24`) | Sizes change | A role |
| Personal names, initials, dates | Not part of the product | Nothing |
| Emoji, accents, double spaces, tabs | Break search and scripts | Plain ASCII |
| Mixed separators (`Log_In-Button`) | Unpredictable | One pattern per kind |

---

## 14. GOOD AND BAD NAMES

| Kind | ❌ Bad | ✅ Good | Why |
|---|---|---|---|
| Frame | `Login final 2` | `P1/Login/Default/D` | Pattern, no version word |
| Frame | `Rejected` (×4) | `P2/AddSubject/Upload/RejectedTooLarge/D` | Each outcome has its own name |
| Frame | `Mobile login` | `P1/Login/Default/M` | Size code, not a word |
| Component | `BlueCTA` | `Button` + `Variant=Primary` | Role, not color |
| Component | `CardNew` | `Card` | No version word |
| Property | `Property 1` | `State` | Meaningful axis |
| Value | `Icon Only` | `IconOnly` | PascalCase one word |
| Layer | `Frame 482` | `fields-column` | Role name |
| Layer | `Log In` (text) | `title` | Name the role, not the content |
| Instance | `Button` ×2 | `button-log-in`, `button-create-account` | Unique, states purpose |
| Variable | `light-blue-2` | `accent-primary` | Role, not value |
| Variable | `padding-24` | `space-6` | Frozen scale |

---

## 15. NAME AUDIT (RUN WITH EVERY GATE)

Run through `use_figma` at the end of **every milestone gate** and report each count in the tracker. **All counts must be 0.**

### 15.1 Checks
| # | Check | Rule |
|---|---|---|
| N-1 | Default or banned names | Layer name matches `^(Frame\|Group\|Rectangle\|Ellipse\|Line\|Vector\|Text\|Layer\|Untitled)( ?\d+)?$` |
| N-2 | Banned words | Any name containing `final`, `copy`, `new`, `old`, `temp`, `test`, `draft`, `v2` (case-insensitive) |
| N-3 | Duplicate frame names | Any two frames in the file with the same full name |
| N-4 | Duplicate component names | Any two components or component sets with the same name |
| N-5 | Duplicate layer names | Any two siblings with the same name |
| N-6 | Frame pattern | Product frame name does not match `^P[1-4](\/[A-Z][A-Za-z0-9]*){2,3}\/(D\|T\|M\|XL)$` |
| N-7 | Layer pattern | Layer name does not match `^[a-z][a-z0-9]*(-[a-z0-9]+)*$` |
| N-8 | Component pattern | Component name does not match `^[A-Z][A-Za-z0-9]*$` or `^Icon\/[A-Z][A-Za-z0-9]*$` |
| N-9 | Property defaults | Any property named like `Property \d+` |
| N-10 | Registry mismatch | Any frame or component **not** in Appendix A or B, or any registry row with **no** object |
| N-11 | Whitespace and separators | Leading or trailing spaces, `//`, `--`, tabs, non-ASCII |
| N-12 | Length | Frame name > 48 characters or layer name > 32 characters |

### 15.2 Report format
```
NAME AUDIT, milestone <M#>:
N-1=0  N-2=0  N-3=0  N-4=0  N-5=0  N-6=0
N-7=0  N-8=0  N-9=0  N-10=0 N-11=0 N-12=0
```
Any non-zero count blocks the gate. Fix, re-run, then continue.

---

## 16. DECISIONS THAT CHANGE EARLIER FILES (NAMES ONLY)

| ID | Earlier name | Problem | New name (use this) |
|---|---|---|---|
| N1 | `P2/AddSubject/Upload/Rejected/D` listed four times; `Processing/D` listed three times; `ParseError/D` listed twice | Identical names, breaks rule 2 | `RejectedInvalid`, `RejectedTooLarge`, `RejectedEncrypted`, `RejectedRateLimited`; `ProcessingStep1`, `ProcessingStep2`, `ProcessingStep3`; `ParseErrorScanned`, `ParseErrorTimeout` |
| N2 | `Popover / Menu` (one row in plan 6.1) | Two purposes in one name | Two components: `Popover` (floating panel) and `Menu` (list of actions) |
| N3 | `P3/Delete/Confirm/M` | Inconsistent with the desktop pair | `P3/Delete/Confirm/Default/M` |
| N4 | Frames of the plan with no prefix rule (shells, demo panel, docs) | Unnamed in the plan | `Template/…`, `Control/…`, `Doc/…` (section 4.4) |
| N5 | Size codes D, T, M only | 1920 stretch frame had none | `XL` added (stretch only) |
| N6 | Subject switcher empty variant | Not named | `P2/Switcher/Empty/D` |
| N7 | `P4/Calculator/Default/D` shows the PASSED scenario | Non-technical readers may not know this | Name kept (frozen by plan 8.5). Its **description** must say "Shows the PASSED scenario" |

---

## APPENDIX A: FRAME REGISTRY (THE ONLY FRAME NAMES ALLOWED)

Each name below is **the full, exact name**. Create nothing that is not on this list. 119 product frames plus 3 templates, 2 controls and 6 doc frames.

### A.1 Page `03 Auth` (21 frames)
```
P1/Login/Default/D           P1/Login/Loading/D          P1/Login/Error/D
P1/Login/Throttled/D         P1/Login/SessionExpired/D   P1/Login/LoggedOut/D
P1/Register/Default/D        P1/Register/FieldErrors/D   P1/Register/Submitting/D
P1/Register/Sent/D
P1/Forgot/Default/D          P1/Forgot/Sent/D
P1/Reset/Default/D           P1/Reset/Invalid/D          P1/Reset/Success/D
P1/Verify/Success/D          P1/Verify/Invalid/D
P1/Overlay/SessionWarning/D
P1/Login/Default/M           P1/Register/Default/M       P1/Forgot/Default/M
```

### A.2 Page `04 Dashboard + Add Subject` (45 frames)
```
Dashboard:
P2/Dashboard/Default/D       P2/Dashboard/Loading/D      P2/Dashboard/EmptySubjects/D
P2/Dashboard/NoSemester/D    P2/Dashboard/Collapsed/D
P2/Dashboard/Default/T       P2/Dashboard/DrawerOpen/T
P2/Dashboard/Default/M       P2/Dashboard/Loading/M      P2/Dashboard/EmptySubjects/M
P2/Dashboard/DrawerOpen/M
Semester:
P2/Semester/New/D            P2/Semester/Error/D
Add Subject (upload path):
P2/AddSubject/CapReached/D
P2/AddSubject/Upload/Idle/D            P2/AddSubject/Upload/Selected/D
P2/AddSubject/Upload/RejectedInvalid/D P2/AddSubject/Upload/RejectedTooLarge/D
P2/AddSubject/Upload/RejectedEncrypted/D
P2/AddSubject/Upload/RejectedRateLimited/D
P2/AddSubject/Upload/ProcessingStep1/D P2/AddSubject/Upload/ProcessingStep2/D
P2/AddSubject/Upload/ProcessingStep3/D
P2/AddSubject/Upload/ParseErrorScanned/D
P2/AddSubject/Upload/ParseErrorTimeout/D
P2/AddSubject/Upload/Idle/M
Subject form:
P2/SubjectForm/Step1/Prefilled/D  P2/SubjectForm/Step2/Prefilled/D
P2/SubjectForm/Step3/Prefilled/D  P2/SubjectForm/Step4/Prefilled/D
P2/SubjectForm/Step5/Prefilled/D
P2/SubjectForm/Step1/Empty/D      P2/SubjectForm/Step2/Empty/D
P2/SubjectForm/Step3/Empty/D
P2/SubjectForm/Step1/ValidationFailed/D
P2/SubjectForm/Step3/Autosaved/D
P2/SubjectForm/Step1/Prefilled/M
After confirm:
P2/Duplicate/Dialog/D        P2/Replace/Summary/D
P2/Save/Saving/D             P2/Save/Error/D            P2/Save/Created/D
P2/Drafts/Restored/D
Subject switcher:
P2/Switcher/Open/D           P2/Switcher/Empty/D
```

### A.3 Page `05 Subject Modules` (32 frames)
```
P3/Overview/Default/D        P3/Overview/Default/T      P3/Overview/Default/M
P3/Outcomes/Default/D        P3/Outcomes/Hover/D
P3/Plan/Default/D            P3/Plan/Default/T          P3/Plan/Default/M
P3/Grading/Default/D         P3/Policies/Default/D      P3/Faculty/Default/D
P3/Grading/EmptyModule/D     P3/Policies/EmptyModule/D  P3/Faculty/EmptyModule/D
P3/Assessments/Default/D
P3/Checklist/Default/D       P3/Checklist/Toggled/D     P3/Checklist/Default/M
P3/Export/Default/D
P3/ThisWeek/Normal/D         P3/ThisWeek/BeforeStart/D  P3/ThisWeek/AfterEnd/D
P3/ThisWeek/NoClass/D        P3/ThisWeek/NoPlan/D       P3/ThisWeek/Normal/M
P3/Manage/Menu/D             P3/Archive/Confirm/D
P3/Delete/Confirm/Default/D  P3/Delete/Confirm/Filled/D P3/Delete/Confirm/Default/M
P3/Account/Default/D         P3/Account/DeleteDialog/D
```

### A.4 Page `06 Grade Calculator` (21 frames)
```
P4/Calculator/NoSubject/D    P4/Calculator/Default/D    (Default = PASSED scenario, N7)
P4/Calculator/IntA/D         P4/Calculator/Undefined/D  P4/Calculator/IntB/D
P4/Calculator/Failed/D       P4/Calculator/Incomplete/D
P4/Calculator/NewActivity/D  P4/Calculator/EditScore/D
P4/Calculator/InvalidValue/D P4/Calculator/Conflict/D
P4/Result/IntB/D             P4/Result/Failed/D         P4/Result/Undefined/D
P4/Result/Passed/GateHidden/D  P4/Result/Passed/GateShown/D
P4/Result/IntA/GateHidden/D    P4/Result/IntA/GateShown/D
P4/Calculator/Default/T
P4/Calculator/Default/M      P4/Result/IntB/M
```

### A.5 Non-product frames
```
Template/AuthShell/D   Template/AppShell/D   Template/Module/D
Control/DemoPanel      Control/DemoLegend
Doc/Cover  Doc/Tokens/Colors  Doc/Tokens/Type  Doc/Tokens/Glass  Doc/Tokens/Spacing  Doc/Tokens/Radius
```
Stretch (only if everything else passed): `P2/Dashboard/Default/XL`.

---

## APPENDIX B: COMPONENT REGISTRY (THE ONLY COMPONENT NAMES ALLOWED)

| Component | Purpose in one sentence | Properties (exact) |
|---|---|---|
| `Button` | A clickable action | `Variant`: Primary, Secondary, Ghost, Destructive, IconOnly · `Size`: sm, md, lg · `State`: Default, Hover, Active, Focus, Disabled, Loading · `hasLeadingIcon` |
| `Input` | A single-line text box | `State`: Default, Focus, Filled, Error, Disabled · `hasLeadingIcon`, `hasTrailingIcon` |
| `FormField` | A labelled input with helper and error text | `State`: Default, Error · `label`, `helper`, `error` |
| `Textarea` | A multi-line text box | `State`: Default, Focus, Filled, Error, Disabled |
| `Checkbox` | A tick box | `State`: Unchecked, Checked, Error, Focus, Disabled |
| `Card` | A glass container for one group of content | `Variant`: Default, Interactive, Active · `hasHeader`, `hasFooter` |
| `Badge` | A small label showing a category or state | `Variant`: Default, Success, Warning, Error, Accent · `Size`: sm, md, lg |
| `StatusChip` | A topic progress label | `State`: NotStarted, InProgress, Completed · `Pulse`: 1, 2 |
| `ResultStatusBadge` | The result status of a subject | `Variant`: Passed, InterventionA, InterventionB, Failed, UndefinedAtThreshold, Incomplete |
| `Table` | A table container with header | `Size`: md |
| `TableRow` | One row of a table | `State`: Default, Hover, Selected, Skeleton |
| `MobileRowCard` | A table row shown as a card on small screens | `State`: Default, Selected |
| `NavItem` | One link in the sidebar | `State`: Default, Hover, Active, Disabled · `isCollapsed` |
| `Sidebar` | The side navigation | `Variant`: Expanded, Collapsed, Drawer |
| `Tabs` | Switch between two views | `State`: UploadActive, ManualActive |
| `SegmentedControl` | Pick one of two to four options | `State`: Default, Focus, Disabled |
| `Modal` | A dialog above the screen | `Variant`: Desktop, MobileFullScreen |
| `Popover` | A small floating panel | `Variant`: Default |
| `Menu` | A list of actions | `Variant`: Default |
| `Stepper` | Shows progress through form steps | `State`: Todo, Current, Done, Error |
| `DropZone` | Where a file is dropped or chosen | `State`: Idle, Hover, Selected, Rejected |
| `ProgressBar` | A horizontal progress indicator | `Size`: 4, 8 · `value` (0 to 100) |
| `Banner` | A message inside the page | `Variant`: Info, Warning, Error, Success |
| `Toast` | A short message that appears and leaves | `Variant`: Info, Success, Error |
| `Tooltip` | A hint on hover | `Variant`: Default |
| `Skeleton` | A grey placeholder while loading | `Variant`: Line, Block, Card, TableRow · `Shimmer`: 1, 2 |
| `EmptyState` | Message when there is nothing to show | `hasCTA` · `icon`, `heading`, `body` |
| `ErrorState` | Message when something failed | `Variant`: Component, Page |
| `SubjectCard` | A subject on the dashboard | `State`: Default, Active |
| `SemesterPicker` | Choose the current semester | `State`: Closed, Open |
| `OutcomeRow` | One outcome and its percent | `State`: Default, Attained, Weak |
| `ActivityRow` | One scored activity | `State`: Default, Error, Empty |
| `WeekRow` | One week of the learning plan | `State`: NotStarted, InProgress, Completed |
| `ResultCard` | The calculator result | `Variant`: Passed, InterventionA, InterventionB, Failed, UndefinedAtThreshold · `isGradeHidden` |
| `OutcomeMap` | The PEO, PO and CO map | `State`: Default, Hover |
| `CoverageMatrix` | Activities against outcomes | `Size`: md |
| `FlaggedField` | An input marked "check this value" | `State`: Default, Focus |
| `PdfStepIndicator` | The three steps of reading a PDF | `State`: Step1, Step2, Step3, Failed |
| `Shake` | Helper that shakes a form on error | `Frame`: 0, 1, 2, 3 |
| `Icon/<LucideName>` | One icon (see plan 6.3) | `Size`: 14, 16, 20, 24, 64 |

---

## CLOSING CHECK (BEFORE EVERY PIECE)

```
□ Did I look the name up in Appendix A or B?           □ Is it unique in its scope?
□ Is it one purpose, in plain English?                  □ Only approved abbreviations?
□ Does it match the pattern for its kind (section 3)?   □ No default names, no version words?
□ Did I add it to the registry BEFORE creating it?      □ Will the name audit (15) pass?
```
