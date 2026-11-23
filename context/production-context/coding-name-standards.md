# GOLDENSYNC: CODING NAME STANDARDS

> Every folder, file, symbol, route, token, copy key and test id in `goldensync-web/` follows this file.
> Written so a non-technical person can read any name and know what it is, and strict enough that a senior reviewer can audit it by script.
> Companion to `stack-code-standards.md` (how code is written), `goldensync-checker-code.md` (what to build), `naming-convention-goldensync.md` (Figma names), and `system-architecture.md` §4 (full-system folder order — UI track uses this file’s paths until CDEC-012 migration).
> **Figma component and frame names are the product names.** Code mirrors them; it does not invent parallel vocabularies.

| Field | Value |
| --- | --- |
| Version | 1.0 |
| Created | 2026-11-20 |
| Applies to | `goldensync-web/` (production UI code) |
| Figma twin | `context/prototype-plan/goldensync-context/naming-convention-goldensync.md` |

---

## 0. PURPOSE AND AUTHORITY

### 0.1 Why this file exists
Names are the user interface of the codebase. A bad name costs time every day: people cannot find things, two things look the same, and automation (lint, imports, handoff from Figma) breaks. This file makes every name **one-purpose, unique, plain-English and predictable.**

### 0.2 What this file governs

| Area | Status |
| --- | --- |
| Folders, files, routes, exports, components, hooks, types, classes, functions, props, CSS tokens, copy keys, store keys, test ids, env keys | **Governed here** |
| Figma frame / component / layer / variable names | **Frozen by** `naming-convention-goldensync.md` + live Figma. Map into code; do not rename the product concept |
| Design token string values (`bg-base`, `space-4`, `proto/loginOutcome`…) | **Frozen.** Same spelling as Figma / plan |
| Engineering how-to (layers, banned practices, DoD) | `stack-code-standards.md` — not renamed here |

### 0.3 Precedence (names only)

1. **Live Figma** (product concept name: `StatusChip`, `P1/Login/Error/D`)
2. **This file** (how that concept appears in code: file path, export, prop, token class)
3. `naming-convention-goldensync.md` (Figma grammar; use when mapping)
4. `stack-code-standards.md` §6 (must not contradict this file; if it does, this file wins for names, log a `CDEC`)
5. `goldensync-checker-code.md` piece / path targets

For behavior, copy text, and visuals: Figma → plan / `DESIGN_RULES.md` → draw.io, as usual.

### 0.4 Who must obey
Cursor, every reviewer agent, and every human who edits `goldensync-web/`. **No exceptions, no "temporary" names.**

### 0.5 Mapping rule (Figma → code)

| Figma | Code |
| --- | --- |
| Component `StatusChip` | Export `StatusChip` · file `status-chip.tsx` |
| Frame `P1/Login/Error/D` | Route/screen module under auth; state `error` (or machine state `Error`); comment / tracker cites the frame |
| Layer `button-log-in` | Prefer matching `data-testid` / stable id; React tree uses the component export, not the layer name as the component name |
| Variable `bg-base` | CSS / Tailwind token `--bg-base` / `bg-bg-base` (or the project's mapped utility — one mapping, documented in C1) |
| Proto `proto/loginOutcome` | Store field `loginOutcome` (camelCase); never `login_outcome` or `LoginOutcome` as the field name |

---

## 1. THE TEN RULES (PLAIN ENGLISH)

1. **One name, one purpose.** A name says exactly one thing. If it needs "and", it is two things and needs two names (or two files).
2. **No duplicates, ever.** Two exports in the same folder never share a name. Never fix a clash with `2`, `copy`, `new`, `Improved`, `Final`.
3. **Say what it is, not how it looks.** `Banner`, not `RedBox`. `StatusChip`, not `GreenPill`.
4. **Use everyday words.** Abbreviations only from section 2.
5. **Same pattern every time.** Section 3 has one pattern per kind of thing.
6. **The registry is the truth.** Components and routes in Appendices A–C must exist there **before** you create them (or add the row first).
7. **Search before you create.** If the name or purpose already exists, reuse it.
8. **Never leave a default name.** `page`, `index2`, `Component`, `utils2`, `temp`, `Untitled` are failures (except Next.js required filenames: `page.tsx`, `layout.tsx`, `loading.tsx`, `error.tsx`, `not-found.tsx`, `route.ts`, `globals.css`).
9. **No version words.** No `final`, `v2`, `new`, `old`, `copy`, `temp`, `test`, `draft`, `wip` in production names. Tests may use `*.test.ts` / `*.spec.ts` only as the suffix.
10. **Names are stable.** Rename only through section 12, and update the registry + tracker in the same step.

---

## 2. PLAIN-ENGLISH DECODER (APPROVED ABBREVIATIONS)

These are the **only** abbreviations allowed in **code names**. Anything else must be spelled out.

| Short form | Means | Where it appears |
| --- | --- | --- |
| `P1`…`P4` | Product pages (Auth, Dashboard+Add Subject, Modules, Calculator) | Comments, tracker refs, frame citations — **not** in file names |
| `auth` | Page 1 authentication feature | folders, routes |
| `pdf` | Syllabus PDF | identifiers (`pdfOutcome`, `parse-pdf`) |
| `co` / `po` / `peo` | Course / Program outcome labels | only as domain terms matching prototype copy, lowercase in code ids |
| `ui` | shadcn / Magic UI primitives folder | `components/ui/` only |
| `env` | Environment | `lib/env.ts` |
| `id` | Identifier | `subjectId`, branded types |
| `sm` `md` `lg` | Size tokens matching Figma | variant props, cva |
| `dto` | Data transfer object at a boundary | types that cross server/client |
| `tsx` `ts` | File extensions | files only |

**Not allowed as abbreviations in names:** `nav` → use `NavItem` only where Figma fixed it; folders say `navigation` if needed. `calc` → `grade-calculator`. `subj` → `subject`. `sem` → `semester`. `btn` → `button`. `msg` → `message`. `err` → prefer `error` in full words (`ValidationError` is OK as a class pattern).

**Figma-only codes** (`D`, `T`, `M`, `XL`) are **not** part of code identifiers. They appear in comments and tracker evidence only.

---

## 3. THE GRAMMAR: ONE PATTERN PER KIND OF THING

| Kind | Pattern | Case | Separator | Unique within | Example |
| --- | --- | --- | --- | --- | --- |
| App root | `goldensync-web/` | kebab | `-` | repo | fixed |
| Feature folder | `<feature>/` | kebab | `-` | `features/` | `add-subject/` |
| Module file | `<name>.ts` / `<name>.tsx` | kebab | `-` | folder | `status-chip.tsx` |
| Next route segment | `<segment>/` | kebab | `-` | parent route | `grade-calculator/` |
| Next special files | fixed Next names | lowercase | none | segment | `page.tsx`, `layout.tsx` |
| React component export | Figma noun | PascalCase | none | module | `StatusChip` |
| Component file | kebab of export | kebab | `-` | folder | `status-chip.tsx` |
| Hook | `use` + Thing | camelCase | none | module | `useLoginForm` |
| Hook file | `use-thing.ts` | kebab | `-` | folder | `use-login-form.ts` |
| Function | verb + object | camelCase | none | module | `calculateGrade` |
| Variable / param | noun | camelCase | none | scope | `subjectCount` |
| Boolean | `is`/`has`/`can`/`should` + Thing | camelCase | none | scope | `hasSemester` |
| Constant (true constant) | `NAME` | SCREAMING_SNAKE | `_` | module | `MAX_SUBJECTS` |
| Const object group | noun | camelCase or Pascal for namespaces | none | module | `motionDurations` |
| Type / interface | Thing | PascalCase | none | module | `Subject`, `ProtoState` |
| Class (domain) | Thing | PascalCase | none | module | `Percentage`, `GradeCalculator` |
| Error class | `ThingError` | PascalCase | none | `domain/errors` | `ValidationError` |
| Prop (boolean) | `is`/`has` + Thing | camelCase | none | props | `hasLeadingIcon` |
| Prop (event) | `on` + Event | camelCase | none | props | `onSubmit` |
| Handler (local) | `handle` + Event | camelCase | none | component | `handleSubmit` |
| Variant prop / value | match Figma | PascalCase values | none | cva | `Variant="Primary"` |
| CSS variable | `--<token>` | kebab | `-` | globals | `--bg-base` |
| Tailwind token utility | mapped once in C1 | kebab parts | `-` | theme | document mapping in tracker |
| Copy key | `feature.screen.slot` | camelCase segments | `.` | `copy/` | `auth.login.title` |
| Proto store field | match Proto camelCase | camelCase | none | store | `loginOutcome` |
| Repository interface | `ThingRepository` | PascalCase | none | `data/repositories` | `SubjectRepository` |
| Seed file | `thing.seed.ts` | kebab | `-` | `data/seed` | `subjects.seed.ts` |
| Server action / route | verb or resource | kebab file | `-` | feature | `create-subject.ts` |
| `data-testid` | role path | kebab | `-` | screen | `button-log-in` |
| Env var | `GOLDENSYNC_*` or Next forms | SCREAMING_SNAKE | `_` | `lib/env.ts` | `NEXT_PUBLIC_APP_URL` |
| Piece / commit | `UI-nnn` | as tracker | `-` | git | `UI-016: StatusChip` |

**Length:** file names ≤ 48 characters (excluding extension); export names ≤ 48; no leading/trailing separators; no `--` or `__` in new names (except Next / CSS where required).

---

## 4. FOLDERS AND ROUTES

### 4.1 Top-level folders (fixed)

```
goldensync-web/
├─ app/
│  ├─ (auth)/                 # P1
│  ├─ (app)/                  # P2–P4 shell
│  ├─ dev/                    # tokens preview and other flag-gated tools
│  ├─ globals.css
│  └─ layout.tsx
├─ components/
│  ├─ ui/                     # shadcn + Magic UI only
│  ├─ core/                   # Figma core components
│  └─ domain/                 # Figma domain components
├─ features/
│  ├─ auth/
│  ├─ dashboard/
│  ├─ add-subject/
│  ├─ subject-modules/
│  └─ grade-calculator/
├─ domain/
├─ data/
│  ├─ repositories/
│  └─ seed/
├─ state/
├─ lib/
└─ copy/
```

Do not add top-level folders without a tracker `CDEC`. Do not create `helpers/`, `common/`, `shared/`, `misc/`, `utils/` at the root (utilities live in `lib/`).

### 4.2 Feature folder contents (fixed names)

| File / folder | Purpose |
| --- | --- |
| `components/` | Feature-only UI compositions |
| `schemas.ts` | Zod schemas |
| `hooks.ts` or `use-*.ts` | Feature hooks |
| `copy.ts` | Re-exports or local keys pointing at `copy/` |
| `actions.ts` | Server Actions (when used) |
| `index.ts` | Barrel at feature boundary only |

### 4.3 Route naming (App Router)

| Product | Route pattern | Notes |
| --- | --- | --- |
| Sign in | `/sign-in` | Clerk default (CDEC-016); old `/login` redirects here |
| Sign up | `/sign-up` | Clerk default; old `/register` redirects here |
| Forgot / Reset / Verify | Clerk-hosted via `/sign-in` | Proto `/forgot-password` `/reset-password` `/verify` removed |
| Dashboard | `/(app)/dashboard` | |
| Add Subject | `/(app)/subjects/new` or modal route as built in C6 — **one** chosen in C0/C6 and logged | No `add-subj` |
| Subject module | `/(app)/subjects/[subjectId]/<module>` | modules: `overview`, `outcomes`, `plan`, `grading`, `policies`, `faculty`, `assessments`, `checklist`, `export`, `this-week` |
| Calculator | `/(app)/grade-calculator` | |
| Tokens preview | `/dev/tokens` | Dev-only |
| Demo Panel | not a public route; flag-gated overlay | Name: `DemoPanel` |

Dynamic segments: `[subjectId]`, `[semesterId]` — camelCase param names in code (`params.subjectId`).

### 4.4 One route, one purpose
A `page.tsx` maps to one primary Figma screen family. Do not stuff unrelated screens into one route.

---

## 5. COMPONENTS AND PROPS

### 5.1 Component names
- **One noun, PascalCase, singular**, equal to the Figma component name: `Button`, `SubjectCard`, `ResultStatusBadge`.
- File = kebab-case of that name: `subject-card.tsx`.
- Location:
  - Figma core → `components/core/`
  - Figma domain → `components/domain/`
  - shadcn / Magic UI → `components/ui/` (keep CLI names unless a CDEC says otherwise)
  - Feature-only composition → `features/<feature>/components/`
- **No filler:** `Component`, `Wrapper`, `Container`, `View`, `Element`, `Item` (except Figma-fixed `NavItem`, `TableRow`, `MenuItem` if present).
- One Figma component → one code component (stack rule). Properties become props with the **same names and values** as Figma where possible (`Variant`, `Size`, `State`, `hasLeadingIcon`).

### 5.2 Prop names (frozen patterns)

| Kind | Pattern | Example |
| --- | --- | --- |
| Variant axis | `variant` in code (maps Figma `Variant`) | `variant="Primary"` |
| Size | `size` | `size="md"` |
| State | `state` or specific props if controlled | `state="Error"` |
| Boolean | `isX` / `hasX` | `hasLeadingIcon`, `isCollapsed`, `isGradeHidden` |
| Text slots | camelCase role | `label`, `helper`, `error`, `heading`, `body`, `title` |
| Events | `onX` | `onClick`, `onValueChange` |
| Children / slots | `children`, or named slot | `footer`, `header` |
| className / ref | always forwarded where wrapping DOM | `className`, `ref` |

Variant **values** stay PascalCase to match Figma: `IconOnly`, `InterventionA`, not `icon-only`.

### 5.3 Icon names
- Import from `lucide-react` using the **exact Lucide export** matching Figma `Icon/<LucideName>` (e.g. `AlertTriangle`).
- Do not rename to `Alert`, `WarningIcon`, etc.
- Local wrapper only if needed: `IconAlertTriangle` is banned; use Lucide directly or a thin `icons.ts` re-export map keyed by Lucide name.

---

## 6. HOOKS, FUNCTIONS, VARIABLES, TYPES

### 6.1 Hooks
- Name: `use` + PascalCase thing → `useProtoStore`, `useSubjectCount`, `useLoginForm`.
- File: `use-login-form.ts` (or grouped `hooks.ts` when small and co-located).
- One non-trivial hook per file when it grows past ~40 lines.

### 6.2 Functions and variables
- Functions: verb first — `calculateGrade`, `mapPdfOutcomeToFrame`, `assertNever`.
- Values: nouns — `subjectCount`, `selectedSubjectId`.
- Booleans: `isX`, `hasX`, `canX`, `shouldX` — never `flag`, `check`, `status` as a boolean name.
- No single-letter names except loop indices `i`, `j` in tiny scopes.

### 6.3 Types and classes
- Domain entities: `Subject`, `Assessment`, `Semester`, `Syllabus` — match product language.
- Branded ids: `SubjectId`, `SemesterId` (no `ISubject`).
- Unions for Figma states: use the prototype’s state words — `UploadState`, `LoginOutcome`.
- Result statuses: prefer prototype codes as string-literal unions (`"PASSED" | "INT_A" | …`) exactly as Figma / plan, or map 1:1 in one module — never invent friendlier type names without a `CDEC`.
- Interfaces for contracts: `SubjectRepository`, `ProtoState`, `ScenarioStrategy`.
- No `I` prefix, no `Type` / `Interface` suffix, no `Props` as a naked name — use `StatusChipProps`.

### 6.4 Errors
- `ValidationError`, `NotFoundError`, `RateLimitedError`, `UnknownScenarioError`.
- File: `validation-error.ts` or grouped under `domain/errors/`.

---

## 7. STATE, PROTO, AND MACHINES

### 7.1 Proto fields (frozen — 13)

Use **exact camelCase** (strip `proto/` only):

`sessionActive` · `hasSemester` · `subjectCount` · `subjectSelected` · `loginOutcome` · `loginFailCount` · `pdfOutcome` · `duplicateCode` · `saveOutcome` · `weekState` · `scenario` · `gradeScaleConfirmed` · `conflict`

- Store module: `state/proto-store.ts` (or approved implementation behind `state/`).
- Selectors / hooks: `useSessionActive`, `useSubjectCount`, … — or narrow selectors; do not expose a raw `useStore()` that encourages whole-tree subscriptions in features.
- Demo Panel writes through the **same** action names: `setLoginOutcome`, not `demoSetLogin`.

### 7.2 State machines
- Type name: `<Flow>State` — `UploadState`, `LoginMachineState`.
- Event name: `<Flow>Event` — `UploadEvent`.
- Discriminant field: `kind` (preferred) with PascalCase or camelCase values that match frame states: `"idle"`, `"processing"`, `"rejected"`.
- Reducer: `uploadReducer`, file `upload-machine.ts` or `upload-reducer.ts`.

---

## 8. TOKENS, STYLES, AND COPY

### 8.1 Token names (frozen)
Use the Figma / plan spellings in CSS:

Primitives, Semantic (`bg-base`, `text-primary`, `accent-primary`, `status-error`, …), Space (`space-1`…), Radius (`radius-md`…), effects (`glass-md`, `focus-ring`), Proto names as above.

- CSS custom properties: `--bg-base`, `--space-4`, etc.
- Do not invent `primaryColor`, `gray1`, `padding24`.
- New tokens only with tracker reason + Figma twin update.

### 8.2 Tailwind / cva
- Semantic classes only after C1 mapping is logged.
- `cva` variant keys: `variant`, `size`, `state` — values match Figma PascalCase strings.
- File for shared motion numbers: `lib/motion.ts` with names `durationNav`, `durationOverlay`, `durationState` (or `motionDurations.nav`) — values from prototype, not magic numbers at call sites.

### 8.3 Copy keys
- All user-visible strings live under `copy/`.
- Key pattern: `<feature>.<screen>.<slot>` in camelCase segments:
  - `auth.login.title`
  - `auth.login.errorGeneric`
  - `addSubject.upload.rejectedTooLarge`
- Slot names describe **role**, not the sentence: `title`, `helper`, `ctaPrimary`, `bannerSessionExpired`.
- Never embed prototype sentences as JavaScript identifiers.

---

## 9. DATA LAYER AND BOUNDARIES

| Kind | Name | Example |
| --- | --- | --- |
| Repository interface | `ThingRepository` | `SubjectRepository` |
| Seed implementation | `SeedThingRepository` | `SeedSubjectRepository` |
| Future Prisma impl | `PrismaThingRepository` | (later) |
| Mapper | `mapThingRowToModel` / `thing-mapper.ts` | |
| Seed data file | `things.seed.ts` | `subjects.seed.ts` |
| DTO (boundary) | `ThingDto` | only at server/client edge |
| Composition root | `data/container.ts` | fixed |

Screens never import `*.seed.ts` or `Seed*` classes directly.

---

## 10. TESTS, TEST IDS, COMMENTS, COMMITS

### 10.1 Tests (when a runner is approved)
- File: `<name>.test.ts` next to the unit, or `__tests__/<name>.test.ts` — pick one style in C0 and keep it.
- Describe blocks use the export name: `describe("GradeCalculator", …)`.

### 10.2 `data-testid`
- Prefer Figma layer purpose names in kebab-case: `button-log-in`, `field-email`, `card-subject-ite-14`.
- Pattern: `<role>-<purpose>`, unique within the screen.
- Do not use CSS class names or copy text as test ids.

### 10.3 Comments
- Cite Figma nodes as `Figma \`48:2\` · \`P1/Login/Default/D\``.
- Cite decisions as `CDEC-00n` / `DEC-0nn`.
- No commented-out code. No `TODO` without a tracker piece id (`TODO(UI-070): …`).

### 10.4 Git
- Message: `UI-nnn: <Piece name>` with node IDs in the body.
- Branch (if used): `ui/ui-nnn-short-kebab` — no `final`, `fix`, `wip` alone.

---

## 11. UNIQUENESS PROTOCOL

### 11.1 Before creating ANY named thing
1. Pick the kind (section 3) and apply its pattern.
2. Look it up in Appendices A–C (and Figma registry for components).
3. Search the repo (`rg`, Go to Symbol). If the name or purpose exists, reuse or extend.
4. Add the registry row first, then create the file/export.

### 11.2 Scope of uniqueness

| Kind | Must be unique within |
| --- | --- |
| Top-level folders | `goldensync-web/` |
| Feature names | `features/` |
| Component exports | their folder (`core`, `domain`, `ui`, or feature `components`) |
| Files | their directory |
| Proto fields | the Proto store |
| Copy keys | the copy tree |
| Routes | the App Router tree |
| `data-testid` | the screen |

### 11.3 Fixing a clash
Never add `2` / `copy` / `new`. Either delete the duplicate or give each a **more specific** purpose name (`rejected-too-large`, not `error2`).

### 11.4 One-purpose test
1. Can a non-technical person guess what this is?
2. Does the name describe **one** thing?
3. Is it unique in its scope?
4. Only approved abbreviations?
5. Does it match Figma / the registry?

---

## 12. RENAME, MOVE AND DELETE POLICY

1. Update the registry row (this file or tracker map).
2. Rename the file/export (and update all imports).
3. Run the name audit (section 15).
4. Log in `goldensync-checker-code.md`: old → new, reason, piece id.
5. Never bulk-rename without a before/after list in the tracker.

Deleting: remove the registry row only after the code is gone. No orphan exports, no orphan registry rows.

---

## 13. BANNED WORDS AND PATTERNS

| Banned | Why | Use instead |
| --- | --- | --- |
| `final`, `v2`, `new`, `old`, `copy`, `temp`, `tmp`, `test` (in prod names), `draft`, `wip`, `backup` | Version noise | Purpose name |
| `2`, `3`, `-copy`, `Improved`, `Final` suffixes | Hides duplicates | More specific name |
| `utils`, `helpers`, `common`, `shared`, `misc`, `stuff` as dump folders | No purpose | `lib/` + specific file |
| `Button2`, `CardNew`, `StatusChipAlt` | Duplicate / version | One component + props |
| Color in names (`BlueButton`, `red-text`) | Colors change | Role / variant |
| `any`, `data`, `info`, `manager`, `handler` as the whole name | Vague | Specific domain word |
| `ISubject`, `SubjectType`, `SubjectInterface` | Banned type style | `Subject` |
| `snake_case` for TS identifiers | Inconsistent | camelCase / PascalCase |
| Hungarian / prefix soup (`strName`, `arrItems`) | Noise | Plain names |
| Default Next leftovers used as product names (`Home`, `page` as a component export) | Unclear | Screen name from Figma |

---

## 14. GOOD AND BAD NAMES

| Kind | ❌ Bad | ✅ Good | Why |
| --- | --- | --- | --- |
| File | `StatusChipFinal.tsx` | `status-chip.tsx` | kebab + stable |
| Export | `GSStatusChip` | `StatusChip` | Match Figma |
| Folder | `calc/` | `grade-calculator/` | Full words |
| Route | `/p4` | `/grade-calculator` | Plain English |
| Hook | `useData` | `useSubjectCount` | One purpose |
| Boolean | `flag` / `check` | `hasSemester` | Readable |
| Proto | `login_outcome` | `loginOutcome` | Frozen camelCase |
| Copy key | `msg1` | `auth.login.errorGeneric` | Role path |
| Test id | `btn1` | `button-log-in` | Figma purpose |
| Token | `--light-blue-2` | `--accent-primary` | Role |
| Error | `Err` | `ValidationError` | Clear |
| Machine state | `state2` | `{ kind: "throttled" }` | Matches frame |

---

## 15. NAME AUDIT (RUN WITH EVERY MILESTONE GATE)

Run at each C0–C10 gate. **All counts must be 0** (or N/A with reason). Report in the tracker.

| # | Check | Rule |
| --- | --- | --- |
| CN-1 | Banned version words in paths/exports | `final`, `copy`, `temp`, `wip`, `v2`, `new`, `old`, `draft` (case-insensitive) outside `*.test.*` |
| CN-2 | Default / vague dump folders | top-level or feature `utils/`, `helpers/`, `misc/`, `common/`, `shared/` |
| CN-3 | File not kebab-case | `^[a-z0-9]+(-[a-z0-9]+)*\.(ts|tsx|css)$` (except Next specials) |
| CN-4 | Component file ≠ kebab(export) | `StatusChip` must live in `status-chip.tsx` |
| CN-5 | Duplicate component exports in `core/` or `domain/` | two files exporting same PascalCase name |
| CN-6 | Component not in Appendix B (or Figma) | new core/domain component without registry row |
| CN-7 | Route not in Appendix A | new app route without registry / CDEC |
| CN-8 | Proto field rename / extra | store keys ≠ the 13 frozen names |
| CN-9 | Token invent | hex class names or non-registry token ids in components |
| CN-10 | Copy key pattern | keys match `^[a-z][a-zA-Z0-9]*(\.[a-z][a-zA-Z0-9]*)+$` |
| CN-11 | `data-testid` pattern | `^[a-z][a-z0-9]*(-[a-z0-9]+)*$` |
| CN-12 | Feature imports another feature | forbidden; move shared code down |
| CN-13 | Abbreviation abuse | `btn`, `subj`, `sem`, `calc`, `msg` in new names |
| CN-14 | Barrel spam | deep `index.ts` re-export chains beyond feature/folder boundary |

### 15.1 Report format

```
CODE NAME AUDIT, milestone <C#>:
CN-1=0  CN-2=0  CN-3=0  CN-4=0  CN-5=0  CN-6=0
CN-7=0  CN-8=0  CN-9=0  CN-10=0 CN-11=0 CN-12=0
CN-13=0 CN-14=0
```

Any non-zero blocks the gate.

---

## 16. DECISIONS THAT BRIDGE FIGMA → CODE (NAMES ONLY)

| ID | Topic | Rule |
| --- | --- | --- |
| CN1 | Figma `Variant` / `Size` / `State` | Code props `variant` / `size` / `state` (camelCase prop ids); **values** keep Figma PascalCase |
| CN2 | Figma `P2/Dashboard/Collapsed/D` vs tracker `SidebarCollapsed` | Code and comments prefer the **live Figma frame name**; cite node id |
| CN3 | Stretch `D-1920` vs naming-doc `XL` | Prefer live Figma name in citations; breakpoint tokens still from frames |
| CN4 | Figma `IntA` / `IntB` | Types and routes use the prototype’s status codes; UI labels from copy only |
| CN5 | `Popover` + `Menu` (Figma N2) | Two code components: `Popover`, `Menu` (plus `MenuItem` if in Figma) |
| CN6 | Chip (added in Figma) | Code component `Chip` in `components/core/chip.tsx` |
| CN7 | Demo Panel | Export `DemoPanel`; file `demo-panel.tsx`; never shipped in prod routes |
| CN8 | shadcn file names | Keep CLI names under `components/ui/`; wrap with core/domain for product API |

---

## APPENDIX A: ROUTE REGISTRY (ALLOWED APP ROUTES)

Add a row before creating a route. Mark status in the build tracker when shipped.

| Route | Product screen family | Milestone |
| --- | --- | --- |
| `/sign-in` | Clerk SignIn (replaces `P1/Login/*`) | CDEC-016 |
| `/sign-up` | Clerk SignUp (replaces `P1/Register/*`) | CDEC-016 |
| `/(auth)/forgot-password` | `P1/Forgot/*` | C5 |
| `/(auth)/reset-password` | `P1/Reset/*` | C5 |
| `/(auth)/verify` | `P1/Verify/*` | C5 |
| `/(app)/dashboard` | `P2/Dashboard/*` | C6 |
| `/(app)/subjects/new` (or CDEC alternative) | `P2/AddSubject/*`, `P2/SubjectForm/*` | C6 |
| `/(app)/subjects/[subjectId]/overview` | `P3/Overview/*` | C7 |
| `/(app)/subjects/[subjectId]/outcomes` | `P3/Outcomes/*` | C7 |
| `/(app)/subjects/[subjectId]/plan` | `P3/Plan/*` | C7 |
| `/(app)/subjects/[subjectId]/grading` | `P3/Grading/*` | C7 |
| `/(app)/subjects/[subjectId]/policies` | `P3/Policies/*` | C7 |
| `/(app)/subjects/[subjectId]/faculty` | `P3/Faculty/*` | C7 |
| `/(app)/subjects/[subjectId]/assessments` | `P3/Assessments/*` | C7 |
| `/(app)/subjects/[subjectId]/checklist` | `P3/Checklist/*` | C7 |
| `/(app)/subjects/[subjectId]/export` | `P3/Export/*` | C7 |
| `/(app)/subjects/[subjectId]/this-week` | `P3/ThisWeek/*` | C7 |
| `/(app)/account` | `P3/Account/*` | C7 |
| `/(app)/grade-calculator` | `P4/Calculator/*`, `P4/Result/*` | C8 |
| `/dev/tokens` | Tokens preview | C1 |

---

## APPENDIX B: COMPONENT REGISTRY (CODE EXPORTS)

One Figma component → one export. File = kebab-case. Properties must follow section 5.2.

### B.1 Core (`components/core/`)

`Button` · `Input` · `FormField` · `Textarea` · `Checkbox` · `Card` · `Badge` · `StatusChip` · `ResultStatusBadge` · `Table` · `TableRow` · `MobileRowCard` · `NavItem` · `Sidebar` · `Tabs` · `Tab` · `SegmentedControl` · `Modal` · `Popover` · `Menu` · `MenuItem` · `Stepper` · `DropZone` · `ProgressBar` · `Banner` · `Toast` · `Tooltip` · `Skeleton` · `EmptyState` · `ErrorState` · `Chip` · `Shake` (if shipped as its own component)

### B.2 Domain (`components/domain/`)

`SubjectCard` · `SemesterPicker` · `OutcomeRow` · `ActivityRow` · `WeekRow` · `ResultCard` · `OutcomeMap` · `CoverageMatrix` · `FlaggedField` · `PdfStepIndicator`

### B.3 Product chrome / controls

`TopBar` · `SubjectSwitcher` · `DemoPanel` · `VariableLegend` (dev-only)

### B.4 `components/ui/`
shadcn / Magic UI primitives only. Product code prefers B.1–B.3 wrappers.

Do not create a product component that is not on this list without adding it here first and citing the Figma node.

---

## APPENDIX C: FEATURE AND MODULE REGISTRY

| Feature folder | Owns |
| --- | --- |
| `features/auth` | Login, register, forgot, reset, verify, session warning/expired |
| `features/dashboard` | Dashboard states, semester entry points |
| `features/add-subject` | Upload, processing, form steps, duplicate, save |
| `features/subject-modules` | Overview…Account module screens |
| `features/grade-calculator` | Scenarios, results, edit score, conflict |

| Domain module examples | Name |
| --- | --- |
| `domain/models/subject.ts` | `Subject` |
| `domain/models/percentage.ts` | `Percentage` |
| `domain/services/grade-calculator/` | `GradeCalculator`, strategies |
| `state/proto-store.ts` | Proto store |
| `copy/auth.ts` | Auth copy keys |
| `lib/motion.ts` | Motion duration constants |
| `lib/env.ts` | Env schema |

---

## CLOSING CHECK (BEFORE EVERY PIECE)

```
□ Looked up the name in Appendix A/B/C or Figma registry?
□ Unique in its scope?  One purpose?  Approved abbreviations only?
□ File kebab-case · export matches Figma · props match Figma axes?
□ Proto / tokens / copy keys use frozen spellings?
□ No version words, no dump folders, no feature→feature imports?
□ Registry updated BEFORE creating?  Will CN audit (15) pass?
□ Tracker cites Figma node id + frame name?
```

---

_GoldenSync Coding Name Standards v1.0 · twin of `naming-convention-goldensync.md` · works with `stack-code-standards.md` and `goldensync-checker-code.md`_
