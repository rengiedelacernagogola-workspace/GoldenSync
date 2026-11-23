# GOLDENSYNC: SYSTEM UI CONTEXT

> Compact, always-load UI reference for Cursor. Distilled from `DESIGN_RULES.md` v1.0 and adjusted for the GoldenSync v2 system plan.
> Use it to make fast, correct UI decisions in Figma now and in code later. It is a **summary**, not a replacement.

**Precedence when sources disagree:**

1. `GoldenSync-System-Plan-v2.drawio`: screens, flows, behavior, message copy
2. `DESIGN_RULES.md`: visual and interaction rules
3. `figma-prototype-system-plan.md`: Figma translation and conflict decisions (C1–C14)
4. This file: quick reference. Where it differs from `DESIGN_RULES.md`, the difference is listed in section 17.

If something is not covered anywhere: choose the most minimal, intentional option. Never the default.

---

## 1. PRODUCT CONTEXT

| Item             | Value                                                                                                                        |
| ---------------- | ---------------------------------------------------------------------------------------------------------------------------- |
| Product          | **GoldenSync**, a personal syllabus and grade tracker for university students (Caraga State University CCIS, Team Gogola)    |
| Model            | Single-role personal tracker. Every account owns its own semesters, subjects and scores. No instructor or student roles      |
| Core objects     | Semester → Subject → Outcomes (PEO / PO / CO) → Activities → Scores. Plus plan weeks, checklist, notes                       |
| Create a subject | Upload a syllabus PDF (CSU F-CID-009), enter manually, or the Add Subject button. All open the same dialog and the same form |
| Key promise      | Results are an **estimate from self-reported scores**, never an official grade                                               |
| Privacy stance   | Syllabus data is private to the account. The uploaded PDF is parsed and discarded                                            |
| Scale and locale | Responsive web app, 500+ users growing to 5,000. All dates use **Asia/Manila**                                               |
| Screens          | 4 areas: Authentication · Dashboard + Add Subject · Subject modules · Grade Calculator                                       |

**Feel:** dark, calm, precise, quiet depth. A tool a student trusts with their grades. Think "senior designer spent 3 days on each screen" (Design Rules 0), not "AI dashboard template".

### 1.1 Voice and copy

- Plain, short, specific. No exclamation marks, no jokes, no emoji.
- **Security-neutral messages stay generic** on purpose: login failure is always "Email or password is incorrect."; register and forgot-password always say "If this email is eligible, we sent you a message."
- Always label results **"Estimated (self-reported)"**.
- Sentence case for UI text. Overline labels are UPPERCASE via style, not typed in caps.
- Button labels are verbs: Log In, Create Account, Add Subject, Sync Syllabus, Retry, Confirm, Download, Archive.
- Error text says what happened and what to do. Never blame the user.
- Never show raw `null`, `undefined` or empty cells. Use "—".
- Error codes (PDF_INVALID, CONFLICT_VERSION…) may appear as small `mono-sm` captions beneath the human message, never alone.
- Exact message strings live in the plan's Appendix A. Use them verbatim.

---

## 2. THE FIVE PRINCIPLES (APPLY TO EVERY DECISION)

1. **Restraint**: add nothing that does not earn its place. Decoration for its own sake is rejected.
2. **Intentional space**: when in doubt, more space. Crowded UI is failed UI.
3. **Depth without noise**: blur, shadow and layering for depth. No busy patterns, no gradients on text, no heavy textures. **One focal point per screen.**
4. **Motion with purpose**: animate only to show state change, hierarchy, feedback or transition.
5. **Consistency over creativity**: same component for the same job, every time. Never invent a pattern when one exists.

---

## 3. COLOR

### 3.1 Naming and structure

- Two layers: **Primitives** (never used in components) and **Semantic** tokens (used everywhere).
- Name tokens identically in Figma, CSS and Tailwind (suggested Tailwind keys in the right column).
- **Zero hardcoded hex or rgba in components.** One allowed exception: the ambient page background paint.

### 3.2 Primitives

| Token         | Value             |     | Token      | Value   |
| ------------- | ----------------- | --- | ---------- | ------- |
| black / white | #000000 / #FFFFFF |     | gray-500   | #6B7280 |
| blue-400      | #4F8EF7           |     | gray-400   | #9CA3AF |
| purple-400    | #9B6DFF           |     | gray-300   | #D1D5DB |
| cyan-400      | #00E5FF           |     | green-400  | #22C55E |
| dark-950      | #0A0A0F           |     | yellow-400 | #FBBF24 |
| dark-900      | #0D0D1A           |     | red-400    | #F87171 |
| dark-800      | #12121F           |     | dark-700   | #1A1A2E |
| dark-600      | #22223B           |     |            |         |

### 3.3 Semantic tokens

| Token (`--color-…`)                             | Value                                       | Suggested Tailwind key                             |
| ----------------------------------------------- | ------------------------------------------- | -------------------------------------------------- |
| `bg-base`                                       | dark-950                                    | `bg-base`                                          |
| `bg-elevated`                                   | dark-900                                    | `bg-elevated`                                      |
| `bg-overlay`                                    | dark-800                                    | `bg-overlay`                                       |
| `bg-subtle`                                     | dark-700                                    | `bg-subtle`                                        |
| `bg-muted`                                      | dark-600                                    | `bg-muted`                                         |
| `surface-glass` / `-md` / `-lg`                 | white 4% / 7% / 10%                         | `surface-glass`, `…-md`, `…-lg`                    |
| `border-subtle` / `default` / `strong`          | white 6% / 10% / 18%                        | `border-subtle`, `border-default`, `border-strong` |
| `border-focus`                                  | blue-400                                    | `border-focus`                                     |
| `text-primary`                                  | white 95%                                   | `text-primary`                                     |
| `text-secondary`                                | white 65%                                   | `text-secondary`                                   |
| `text-muted`                                    | **white 50%** (see section 17, C1)          | `text-muted`                                       |
| `text-disabled`                                 | white 25%                                   | `text-disabled`                                    |
| `text-inverse`                                  | dark-950                                    | `text-inverse`                                     |
| `accent-primary` / `secondary` / `tertiary`     | blue-400 / purple-400 / cyan-400            | `accent-primary`…                                  |
| `status-success` / `warning` / `error` / `info` | green-400 / yellow-400 / red-400 / blue-400 | `status-success`…                                  |

Component tints (also tokens): success/warning/error/accent **background = color at 12%**, **border = color at 25%**; focus glow blue 15%; error glow red 15%; accent glass background blue 8% with border blue 25%.

### 3.4 Where each color goes

| Use                                            | Token                                                              |
| ---------------------------------------------- | ------------------------------------------------------------------ |
| Page background                                | `bg-base` (plus the ambient gradient, 3.5)                         |
| Sidebar                                        | `bg-elevated`                                                      |
| Cards                                          | `surface-glass` + `border-default`                                 |
| Modals, dialogs                                | `bg-overlay`/glass-lg + `border-strong`                            |
| Menus, popovers, tooltips                      | solid `bg-overlay` + `border-strong` (no glass, they sit on glass) |
| Hover                                          | `surface-glass-md` · Active/pressed `surface-glass-lg`             |
| Dividers                                       | `border-subtle`                                                    |
| Titles, active nav                             | `text-primary`                                                     |
| Body copy                                      | `text-secondary`                                                   |
| Captions, metadata, inactive nav, placeholders | `text-muted`                                                       |
| Disabled text                                  | `text-disabled`                                                    |
| Primary CTA, links, focus, selection           | `accent-primary`                                                   |
| Destructive                                    | `status-error`                                                     |

### 3.5 Ambient background (root only, never inside cards)

`bg-base` + radial blue 6% at 20% / 50% + radial purple 6% at 80% / 20%.

### 3.6 Color NEVERs

- No accent color on body text.
- No raw `#fff` (use `text-primary`) and no raw `#000` (use `bg-base`).
- No mixing accent colors on one element. **No more than 2 accent colors per screen.**
- `accent-secondary` is never a button background.
- Color never carries meaning alone. Pair with text or an icon.

---

## 4. GLASS SYSTEM

| Variant        | Fill     | Border   | Blur | Shadow                                     | Use                                          |
| -------------- | -------- | -------- | ---- | ------------------------------------------ | -------------------------------------------- |
| `glass-sm`     | glass 4% | subtle   | 8    | none                                       | Table container and hover rows, list items   |
| `glass-md`     | glass 4% | default  | 20   | 0/4/24 black 25% + inner top 1px white 6%  | **Cards, panels (default)**                  |
| `glass-lg`     | glass 7% | strong   | 32   | 0/8/48 black 40% + inner top 1px white 10% | **Modals, featured cards**                   |
| `glass-accent` | blue 8%  | blue 25% | 20   | 0/8/32 blue 12% + 1px blue 10% ring        | **Active or selected card, active nav item** |

Rules:

- Never glass inside glass. Inside a modal use plain sections with `border-subtle` dividers.
- Never glass on text. Never blur content that scrolls inside a card (blur the container).
- **Sidebar: solid `bg-elevated`, no blur** (performance).
- Mobile: provide a solid fallback on low-memory devices.
- Never nest cards in cards. Never taller than 60vh.

---

## 5. TYPOGRAPHY

**One font family: Inter** (via `next/font/google`, latin subset, `display: swap`). Mono (codes, IDs, scores, dates): see 17, C-M. No weight 300.

| Style       | Size / weight | Line height | Tracking       | Use in GoldenSync                               |
| ----------- | ------------- | ----------- | -------------- | ----------------------------------------------- |
| display-2xl | 72 / 700      | 1.0         | -0.03em        | Not used in-app                                 |
| display-xl  | 60 / 700      | 1.05        | -0.025em       | Not used in-app                                 |
| display-lg  | 48 / 700      | 1.1         | -0.02em        | Not used in-app                                 |
| display-md  | 36 / 700      | 1.15        | -0.015em       | Dashboard title                                 |
| display-sm  | 30 / 600      | 1.2         | -0.01em        | Page titles, auth panel title                   |
| heading-xl  | 24 / 600      | 1.25        | -0.008em       | Section headers                                 |
| heading-lg  | 20 / 600      | 1.3         | -0.005em       | Card titles                                     |
| heading-md  | 18 / 600      | 1.35        | 0              | Sub-sections                                    |
| heading-sm  | 16 / 600      | 1.4         | 0              | Labels, empty-state headings                    |
| body-lg     | 18 / 400      | 1.6         | 0              | Long-form (rare)                                |
| body-md     | 16 / 400      | 1.6         | 0              | Default body, buttons (weight 500)              |
| body-sm     | 14 / 400      | 1.5         | 0              | Table cells, supporting text, form labels (500) |
| caption     | 12 / 400      | 1.4         | +0.01em        | Meta, helper, error text                        |
| overline    | 11 / 500      | 1.0         | +0.08em, UPPER | Table headers, section labels, breadcrumbs      |
| mono-md     | 14 / 400      | 1.5         | 0              | Course codes, IDs, dates                        |
| mono-sm     | 12 / 400      | 1.4         | 0              | Error codes, inline code                        |

Rules: every text node uses a **named style**, never raw sizes. Tabular numerals for table numbers. Body measure ≤ 65ch. Never center paragraphs longer than 2 lines. Never mix heading and body in one element. Headings never exceed their defined weight. Mobile uses `body-sm` for most content.

**Text color hierarchy:** page and section titles, card titles, active nav → `text-primary`. Body → `text-secondary`. Captions, metadata, inactive nav, placeholders → `text-muted`. Links → `accent-primary`. Errors → `status-error`. Success → `status-success`. Warnings → `status-warning`.

---

## 6. SPACING AND RADIUS (8pt GRID)

| Token    | px  | Typical use                                               |
| -------- | --- | --------------------------------------------------------- |
| space-1  | 4   | Icon padding, tight chips                                 |
| space-2  | 8   | Label to input, input vertical padding, error text offset |
| space-3  | 12  | Small component padding, footer button gap                |
| space-4  | 16  | Standard padding, form field gap, mobile page padding     |
| space-6  | 24  | **Card padding, gap between cards**                       |
| space-8  | 32  | **Desktop page padding**, auth/modal section gap          |
| space-10 | 40  | Page section gap                                          |
| space-12 | 48  | **Gap between sections**                                  |
| space-16 | 64  | Hero padding                                              |
| space-24 | 96  | Between major page sections                               |

- Everything is a multiple of 4. Prefer multiples of 8. **No** odd values (5, 7, 13) and no p-5/7/9/11.
- Use `gap` in the parent. **Never** margin-top to push elements.
- Content never touches the viewport edge (min 16 on mobile).

**Radius:** 8 buttons, inputs, nav items · 12 cards, tables · 16 modals (assumption) · full for chips and badges (assumption).

---

## 7. LAYOUT

| Viewport | Grid                         | Sidebar                                  | Content            | Cards   |
| -------- | ---------------------------- | ---------------------------------------- | ------------------ | ------- |
| 1920     | 12 col, gutter 24, margin 80 | 240 persistent                           | max 1400, centered | 3 col   |
| 1280     | 12 col, gutter 24, margin 48 | 240 persistent                           | max 1200           | 3 col   |
| 1024     | n/a                          | 240 persistent                           | fluid              | 2–3 col |
| 768      | 8 col, gutter 16, margin 24  | 64 icons (tooltips), drawer on hamburger | fluid              | 2 col   |
| 375      | 4 col, gutter 16, margin 16  | hidden, full-width sheet drawer          | single column      | 1 col   |

**Sidebar anatomy (top to bottom):** logo + app name (40 high) → Home → subject switcher → subject modules → Grade Calculator → Add Subject → Edit / Archive / Delete subject → _(bottom, after divider)_ Account, Log out.
**Nav item:** 44 high, radius 8, icon 20 + label. Default `text-muted` icon/label. Hover `glass-sm` + `text-primary`. Active `glass-accent` + accent icon + `text-primary`. Disabled `text-disabled`. All items except Home and Add Subject are disabled until a subject is selected.

**Content area:** page title block, then content; title to first block 32; sections 48 apart; card grids gap 24.

---

## 8. COMPONENT CHEAT SHEET

### 8.1 Button

| Variant     | Style                                                            | Notes                                                                   |
| ----------- | ---------------------------------------------------------------- | ----------------------------------------------------------------------- |
| Primary     | `accent-primary` fill, `text-inverse` label, weight 500, shimmer | Log In, Sync Syllabus, Save, Submit, Add Subject, Confirm. One per view |
| Secondary   | `surface-glass-md` + `border-default`, `text-primary`            | Hover → glass-lg + border-strong                                        |
| Ghost       | transparent, `text-secondary`                                    | Hover → glass + `text-primary`                                          |
| Destructive | error 12% fill, error 25% border, `status-error` text            | Hover → error 20%                                                       |
| Icon only   | 44×44, Ghost or Secondary                                        | **Must** have `aria-label`                                              |

Sizes: sm 36 · **md 44 (default)** · lg 52. Radius 8. Hover: brightness 110%, scale 1.01. Press: scale 0.98. Loading: spinner replaces label, width kept. Disabled: 40% opacity and the reason is shown elsewhere. Never a button with no visible label or aria-label.

### 8.2 Input

44 high (48 mobile) · radius 8 · fill `bg-subtle` · border `border-default` · text `body-md` `text-primary` · placeholder `text-muted`.
Focus: 2px `border-focus` + 3px blue 15% glow. Error: `status-error` border + 3px red 15% glow **and** message below (`AlertCircle` 14 + caption). Disabled: 50% opacity.
Label: `body-sm` 500 `text-secondary`, 8 above the input, red asterisk if required. Helper: `caption` `text-muted`, 8 below. Never show an error before first interaction. Never use a placeholder as a label.

### 8.3 Card

`glass-md`, radius 12, padding 24. Optional header (title required, bottom border `border-subtle`, 16 padding below), content (gap 16), footer (top border, buttons right, gap 12). Interactive cards: hover lifts 1px, `shadow-hover`, `border-strong`, 200ms ease-out. Selected: `glass-accent` + border beam. Loading: skeleton, never partial content.

### 8.4 Badge and status chip

Sizes: sm 20/11px, **md 24/12px (default)**, lg 28/13px. Variants: default, success, warning, error, accent (tint rules in 3.3). Max 3 badges per card header. Never truncate: use a tooltip.
**Topic status chips:** Not Started (default + gray dot) · In Progress (accent + pulsing dot, 2s) · Completed (success + check).

### 8.5 Table

Container `glass-sm`, radius 12, overflow hidden. Header 40 high, `overline`, `text-muted`, `bg-subtle`, sticky. Rows ≥ 52, `body-sm`, `text-secondary`, divider `border-subtle`, hover glass. Selected row: blue 8% + 2px left accent border. Alignment: text left · numbers right with tabular numerals · status centered · actions right. Max 50 rows without pagination. Mobile = stacked card list (no horizontal scroll). Empty cell = "—".

### 8.6 Other

- **Modal:** `glass-lg`, radius 16, close X, Escape closes, focus trapped, returns focus to trigger. Full-screen on mobile.
- **Drawer/Sheet:** swipe to close on mobile, focus trapped.
- **Stepper (multi-step forms):** validate the current step before advancing, going back never loses data.
- **Toast and banner:** icon + text, never color alone.
- **Tooltip:** collapsed sidebar and any truncated text.
- **Skeleton:** `bg-subtle`, radius matches the real element, shimmer left to right 1.5s, same size as real content.

---

## 9. DOMAIN PATTERNS (GOLDENSYNC-SPECIFIC)

### 9.1 Subject card

Code (`mono-md`) · title (`heading-lg`) · units badge · semester label · progress bar with "N of M weeks done". Active subject = `glass-accent` + border beam. Click opens Overview.

### 9.2 Result status → visual mapping

| Status                 | Badge variant | Grade display                                             |
| ---------------------- | ------------- | --------------------------------------------------------- |
| PASSED                 | success       | `map(average)`, hidden until the grade scale is confirmed |
| INTERVENTION_A         | accent        | `map(average)`, same gate                                 |
| INTERVENTION_B         | warning       | best possible grade **3.0**                               |
| FAILED                 | error         | **5.0**                                                   |
| UNDEFINED_AT_THRESHOLD | warning       | no grade, "Confirm with your instructor."                 |
| INCOMPLETE             | default       | no result, per-outcome progress only                      |

Always show the status as text. Always show **"Estimated (self-reported)"**. Weak outcomes list their plan topics. Never use more than 2 accent colors on the result screen.

### 9.3 Calculator table

Grouped by outcome. Columns: Activity | Outcome | Score | Max | Percent (numbers right-aligned, tabular). Empty score = "—" (not taken yet). Unmapped activities sit in "Other activities" with "Excluded from the result." Primary action: Add activity (Secondary). Add Subject (Ghost).

### 9.4 Checklist and weeks

Status derived: done → Completed · not done and current week → In Progress · otherwise Not Started. Ticking a week never changes any result. Say so in a caption.

### 9.5 This Week states

Normal · BEFORE_START · AFTER_END · NO_CLASS · NO_PLAN_FOR_WEEK. Each has its own calm message. Show "Today: <date> · Week N". Planner uses **Asia/Manila**.

### 9.6 PDF import

Drop zone → server checks → 3-step progress (Uploading, Extracting text, Parsing syllabus) → prefilled form. Missing or doubtful fields are **flagged** (warning treatment + caption), never dropped. Failures offer Retry **and** Switch to Manual.

### 9.7 Read-only modules

Grading, Class Policies, College Faculty show saved syllabus parts. Mark them "Read-only (from your saved syllabus)". Missing part → empty state "Not in this syllabus." with "Edit subject".

### 9.8 Destructive actions

Archive (restorable 30 days) uses a Primary confirm. **Delete** requires typing the course code. **Delete account** requires the password. Destructive buttons are disabled until the requirement is met and show why.

---

## 10. FORMS

- Single column on mobile and in modals. Two columns on desktop only, for related pairs (First/Last, Units/Hours).
- Field gap 16. Section gap 32 with a subtle section heading.
- Required: asterisk after the label + `aria-required`.
- Validate **on blur and on submit**, never per keystroke.
- Error below the field: icon + message, `aria-live="polite"`. Success: subtle check, only after interaction.
- Limits worth surfacing in UI: 20 outcomes, 150 activities, 30 weeks, 20 subjects per semester, 30 semesters, 10 MB PDF, 60 pages.
- Drafts autosave (about every 10 s, kept 7 days). Show a quiet "Draft saved" caption.

---

## 11. MOTION

| Do                              | Spec                                                                    |
| ------------------------------- | ----------------------------------------------------------------------- |
| Hover transitions               | 150ms ease-out (shadow 200ms) on background, border, transform, opacity |
| Page transition                 | 300ms fade + 8px rise, ease-out                                         |
| Page enter stagger              | 400ms, 60ms stagger, easeOutExpo, 16px rise                             |
| Card stagger (dashboard)        | 500ms, 80ms stagger, 24px rise, scale .97→1                             |
| Progress fill                   | 800ms easeOutExpo                                                       |
| Number counter                  | 1200ms (scores, pass rate only)                                         |
| Shake (failed login/validation) | 500ms                                                                   |
| Success check                   | stroke draw 600ms, 200ms delay                                          |
| Skeleton shimmer                | 1.5s loop                                                               |

- Animate `transform` and `opacity`. **Never** animate width, height, top, left, margin or padding in CSS (the progress bar is the one defined exception).
- **Reduced motion:** every animation and effect checks `prefers-reduced-motion` and stops or snaps.
- **Effect budget:** max 2 Magic UI effects per screen. Border beam: active subject card only. Shimmer button: primary CTAs only. Meteor: Login and Register backgrounds only. Number ticker: scores and pass rates only. Animated beam: CO → PO lines only. No effects on error or empty states.
- In **Figma** these are approximations; the plan's section 10 lists what is built, static, or skipped.

---

## 12. LOADING, EMPTY AND ERROR STATES

**Every async action has a loading state:** page load = full skeleton layout · table = skeleton rows · cards = skeleton grid (same count) · button = inline spinner · upload = progress bar with % · processing = animated step indicator · infinite scroll = 3 skeleton items. Container gets `aria-busy="true"`. Fade skeleton out, content in.

**Empty state anatomy:** icon 64 muted → `heading-sm` `text-secondary` → `body-sm` `text-muted` (max 280, centered) → optional Secondary CTA.

| Context               | Icon      | Heading               | CTA          |
| --------------------- | --------- | --------------------- | ------------ |
| No subjects           | BookOpen  | No subjects yet       | Add Subject  |
| No scores             | BarChart2 | No scores recorded    | Enter scores |
| Missing syllabus part | FileText  | Not in this syllabus. | Edit subject |

**Error anatomy:** field = icon 14 + message · component = AlertTriangle 32 + heading + reason + Retry · page = centered, icon 64, optional code in `mono-md`, heading, body, Primary + Ghost actions.

---

## 13. ICONS

Lucide React (primary). Never mix with another icon set on one screen. Import individual icons only.
Sizes (always even): nav 20 · button 16 · inline 14 · card header 24 · empty state 64 · status dot 8 (a CSS circle, not an icon). Nothing larger than 32 outside empty states.
Color: nav inactive `text-muted`, nav active `accent-primary`, primary button `text-inverse`, ghost `text-secondary`, status icons use status colors, decorative `text-muted` at 40% opacity.
Icon-only buttons need `aria-label`. Never emoji as UI icons.

---

## 14. RESPONSIVE

- Mobile-first. Touch targets ≥ 44×44. Inputs 48 on mobile.
- Tables become card lists below 640. Forms single column. Modals full-screen. Primary buttons full width.
- No hover-only information. No desktop nav on mobile. No horizontal overflow. No fixed pixel widths inside cards.
- Sticky table headers. Swipe-to-close on drawers.

---

## 15. ACCESSIBILITY

- Contrast: normal text ≥ 4.5:1, large text (≥ 24px, or ≥ 18px bold) ≥ 3:1, UI parts ≥ 3:1.
- Focus: visible 2px ring on every interactive element (`border-focus`, 2px offset on `bg-base`). Order follows reading order.
- Modals and drawers trap focus, close on Escape, and return focus to the trigger.
- Dropdowns navigate with arrow keys.
- Images have alt text (or empty alt if decorative). Form fields have real labels. Errors use `aria-live="polite"`. Status is always text, not only color.
- Targets: Lighthouse Accessibility ≥ 95.

---

## 16. NAMING (CODE PHASE)

| Thing      | Convention                                                                           |
| ---------- | ------------------------------------------------------------------------------------ |
| Components | `PascalCase.tsx` (`SubjectCard.tsx`)                                                 |
| Pages      | `page.tsx` (App Router)                                                              |
| Hooks      | `camelCase.ts` (`useSubjects.ts`)                                                    |
| Utilities  | `camelCase.ts` (`formatGrade.ts`)                                                    |
| Constants  | `SCREAMING_SNAKE.ts` (`GRADE_THRESHOLDS.ts`)                                         |
| Types      | `Subject.types.ts` · interfaces prefixed `I`                                         |
| Stores     | `subjects.store.ts` (Zustand)                                                        |
| Schemas    | `login.schema.ts`                                                                    |
| Booleans   | `isLoading`, `hasError`, `canEdit`, `shouldAnimate`                                  |
| Props      | Specific: `subjectData`, `syllabusItem`, `scoreValue`. Never `data`, `item`, `value` |
| Callbacks  | `onSubmit`, `onChange`, `onSyllabusSync`, `onTopicStatusChange`                      |
| CSS        | Tailwind utilities only. Custom classes kebab-case, BEM for complex                  |

**Figma layers and frames:** `P<page>/<Screen>/<State>/<Size>` (D, T, M). No default layer names.

**Performance (code phase):** `next/image` with width and height, WebP, lazy below the fold · dynamic import for the PDF viewer, data tables and charts, with a skeleton fallback · virtualize big tables · import only what is used · targets LCP < 2.5s, FID < 100ms, CLS 0, Lighthouse Performance ≥ 90.

---

## 17. DEVIATIONS FROM `DESIGN_RULES.md` (HONOR THESE)

| ID  | Deviation                                                                              | Why                                                                                                                                                                                      |
| --- | -------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| C1  | `text-muted` is **white 50%**, not 40%                                                 | 40% measures 3.77:1 on `bg-base`, which fails the 4.5:1 rule in Design Rules 13. Pending owner approval (Q1). If rejected, revert one token and keep muted text to non-essential content |
| C2  | Placeholder color = `text-muted`                                                       | Design Rules 4.3 says `text-disabled` (about 2:1), 7.2 says `text-muted`. Muted wins for readability                                                                                     |
| C3  | No gradient text on the dashboard title                                                | Principle 3 bans gradient text; the effects map allows it. Restraint wins (Q2)                                                                                                           |
| C4  | Add Subject is a **modal**, not a page                                                 | Legend says dialog; route name is only a label                                                                                                                                           |
| C5  | CTA labels: "Add Subject" in nav and buttons, "Sync Syllabus" on the Upload tab submit | Design Rules and draw.io use different names                                                                                                                                             |
| C11 | "Log out", not "Sign Out"                                                              | draw.io wording wins                                                                                                                                                                     |
| C-M | Mono = **Roboto Mono**; Inter everywhere else                                          | Rules require mono for codes but forbid a second UI family. Pending (Q3)                                                                                                                 |
| A1  | Modal radius 16, badge radius full                                                     | Not specified in Design Rules                                                                                                                                                            |

Full list C1–C14 and rationale: `figma-prototype-system-plan.md`, section 2.

---

## 18. NEVER LIST (CONSOLIDATED)

```
COLOR      accent on body text · raw #fff/#000 · >2 accents per screen · accent-secondary on buttons
           · color as the only signal · hardcoded colors in components
GLASS      glass in glass · glass on text · blur on scrolling content · blur on sidebar · nested cards
           · card taller than 60vh · cards inside modals
TYPE       weight 300 · raw font sizes · gradient text · centered long paragraphs · heading+body in one element
SPACE      odd values · margin-top as layout · content touching viewport edge
BUTTONS    no label/aria-label · disabled without a reason · icons in Primary unless they add clarity
FORMS      error before interaction · red border without message · placeholder as label · per-keystroke validation
TABLES     >50 rows unpaginated · horizontal scroll on mobile · raw null/undefined · truncated badges
MOTION     animating layout properties · decorative animation · effects on error/empty states
           · >2 effects per screen · ignoring reduced motion
ICONS      emoji · mixed libraries · odd sizes · >32px outside empty states
MOBILE     hover-only info · desktop nav · horizontal overflow · fixed px widths in cards
CONTENT    presenting an estimate as an official grade · specific login/register failure reasons
           · dropping flagged or missing syllabus fields silently
```

---

## 19. FAST DECISION CHECKLIST (RUN BEFORE ANY NEW SCREEN OR COMPONENT)

1. Does an existing component already do this job? **Use it.**
2. What is the **one focal point** of this screen?
3. Are all colors, sizes, type and spacing from tokens and named styles?
4. Which glass variant applies, and is anything glass-on-glass?
5. Are loading, empty, error and success states defined?
6. Does it work at 375, 768 and 1280, with touch targets ≥ 44?
7. Is there a focus ring, an aria-label on icon buttons, and text beside every color signal?
8. Does the copy match the draw.io (Appendix A of the plan) and the voice rules in 1.1?
9. Is any motion purposeful, within the effect budget, and reduced-motion safe?
10. Did I log any deviation in `system-progress-tracker.md`?

---

_GoldenSync System UI Context v1.0 · derived from `DESIGN_RULES.md` v1.0 · Team Gogola, Caraga State University CCIS_
