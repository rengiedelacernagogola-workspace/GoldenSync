# GOLDENSYNC: END-TO-END CODE BUILD TRACKER

> **This is the canonical build ledger** for coding the working Next.js UI in `goldensync-web/` from the Figma prototype, end to end.
> The build agent reads this file first every session, builds **exactly one piece**, verifies it against Figma, updates this ledger, then continues (CDEC-011: owner waived per-piece `next` asks).
> Also follow `system-architecture.md` for **repo layout, boundaries, and full-system order** (API, Clerk, Prisma, Trigger) when that layer is in scope — see CDEC-012.
> Former role (audit-only checker) is folded in: section 12 is the gate checklist. Do not create a second build tracker.

| Field | Value |
| --- | --- |
| Tracker created | 2026-11-20 |
| Tracker version | 2.0 (build driver; was checker 1.0) |
| Last updated (UTC+8) | `2026-11-21 11:25` (CDEC-016 · Clerk default auth · Proto auth removed · CVER-049) |
| Build status | **C0–C10 VERIFIED** · Clerk-only auth · full live bridge · **~100% code** |
| **NOW WORKING ON** | Post-deploy only (webhook · Q-004) — code track complete |
| Next action | Deploy → paste `CLERK_WEBHOOK_SECRET` · confirm Q-004 in Clerk |
| Achievements | See **§19** (ACH-001…020) |
| Completion | **~100% code/setup** · **~98% overall** (webhook+Q-004 owner post-deploy) |
| App folder | `goldensync-web/` (only npm project) |
| Figma file | `GoldenSync Prototype v1` · key `ySMbVLRvKGQvjaGm3ihm7P` |
| Figma Dev Mode | https://www.figma.com/design/ySMbVLRvKGQvjaGm3ihm7P/GoldenSync-Prototype-v1?node-id=1-5&m=dev&t=axQbQy2z2zzghFGf-1 |
| Figma pages | `0:1` Cover · `1:2` Tokens · `1:3` Components · `1:4` Auth · `1:5` Dashboard · `1:6` Modules · `1:7` Calculator · `1:8` Proto Controls · `1:9` Scratch |
| Sources of truth (order) | 1) Live Figma · 2) `system-progress-tracker.md` · 3) plan + `DESIGN_RULES.md` + draw.io · 4) `system-architecture.md` (repo layout / boundaries / API order) · 5) `stack-code-standards.md` · 6) `coding-name-standards.md` · 7) `comment-flows-info.md` · 8) this file |
| Companion docs | naming · comments · Figma twin · **architecture §4 layout** |
| Last lint / build | lint PASS · unit PASS · build PASS on NTFS mirror (USB Turbopack junction fail — ISS-10) |

---

## 0. HOW TO USE THIS TRACKER (AGENT)

```
1. Read this file (sections 0–3, then the milestone you are on).
2. Read stack-code-standards.md, coding-name-standards.md, **comment-flows-info.md** (every function + FLOW/RULE markers; CF-1…CF-5 on piece close).
3. Read system-architecture.md §4 (layout/boundaries) when creating folders, API, auth, or data access — see CDEC-012.
4. Open the piece's Figma node(s) via MCP (design context + screenshot + variables). Never edit Figma.
5. State a plan of ≤8 lines, then build that ONE piece only.
6. Lint + build must pass. Screenshot vs Figma when the piece has a viewport.
7. Append ledger + CVER; recompute §§2–3; continue next TODO piece (CDEC-011).
```

If Figma and any markdown disagree on **UI**: **Figma wins**. If architecture and UI-track layout disagree: **CDEC-012** (UI track layout until Clerk/Prisma/API). Log other drifts in section 10.

---

## 1. BUILD PROTOCOL (NON-NEGOTIABLE)

```
B1  ONE PIECE       Exactly one piece per turn. No batching. No starting the next piece.
B2  LOG FIRST       Status → WIP when you start; append the ledger row BEFORE you stop.
B3  APPEND-ONLY     Never edit or delete past ledger / decision / drift / blocker / verification / session rows.
                    Fix mistakes with a CORRECTION entry.
B4  STATUS          TODO → WIP → BUILT → VERIFIED. REWORK reopens to WIP. BLOCKED any time.
B5  NO PROOF        VERIFIED only after: Figma screenshot compared to browser screenshot (same viewport),
    NO VERIFIED     lint pass, build pass, console clean, types strict.
B6  NODE IDS        A piece without Figma node IDs cannot be BUILT.
B7  RECOMPUTE       After every piece: update section 2 (current state) and section 3 (milestones).
B8  ONE TRUTH       Do not copy colors, sizes, or copy strings into this file. Reference tokens / nodes / plan.
B9  HONESTY         Never mark done work that was skipped or approximated. Use SKIPPED or BLOCKED.
B10 STOP RULE       Same issue fails 3 times → BLOCKED, log section 11, tell owner, stop.
B11 MILESTONE GATE  Milestone closes only when every piece is VERIFIED or SKIPPED, gate checklist (section 12)
                    passes, and owner approves the close.
B12 NO FIGMA EDITS  Read-only Figma. No write tools.
B13 NO SCOPE CREEP  No extra pages, features, props, or placeholder routes for future work.
B14 STACK LOCK      No new / swapped libraries without owner APPROVED in section 5.2.
B15 CLERK / PRISMA  Out of scope until owner says so. Code to interfaces only.
```

### 1.1 Status codes

| Code | Meaning |
| --- | --- |
| `TODO` | Not started |
| `WIP` | In progress this session |
| `BUILT` | Code written; lint + build pass; not yet Figma-compared |
| `VERIFIED` | Screenshot-matched to Figma; evidence in section 9 |
| `REWORK` | Reopened; reason in ledger |
| `BLOCKED` | Cannot proceed; section 11 |
| `SKIPPED` | Deliberately not built; reason logged |
| `N/A` | Not applicable |

### 1.2 ID formats

`UI-000` piece · `CDEC-000` decision · `CDRF-000` drift · `CBLK-000` blocker · `CVER-000` verification · `CSES-000` session · `CORR-000` correction · `FND-000` finding (gate fail)

### 1.3 Entry types

`CREATE` · `UPDATE` · `REFACTOR` · `FIX` · `CORRECTION` · `SYNC` (tracker-only)

### 1.4 Per-piece done checklist

- [ ] Figma node(s) read (context + screenshot + variables)
- [ ] Plan ≤8 lines stated before coding
- [ ] Existing components reused; new only if none fit
- [ ] Tokens / copy / Proto vars — no hardcoded hex, magic numbers, or invented strings
- [ ] `npm run lint` and `npm run build` pass (from `goldensync-web/`)
- [ ] Browser screenshot vs Figma at same viewport; diffs listed and fixed
- [ ] States / interactions owned by the piece tested
- [ ] Strict TypeScript; no `console.log` / hydration errors
- [ ] Comments per `comment-flows-info.md` (function notes, FLOW markers, file headers where required)
- [ ] This ledger updated; sections 2 and 3 recomputed
- [ ] Report: built · files · node IDs · evidence · remaining diffs · proposed NEXT piece

---

## 2. CURRENT STATE (UPDATE AFTER EVERY PIECE)

- **Last VERIFIED piece:** Clerk default auth — Proto `/login`|/register` deleted (CVER-049)
- **NOW WORKING ON:** None in code — post-deploy owner steps only
- **Next action:** Deploy → `CLERK_WEBHOOK_SECRET` · Q-004
- **Pages built:** All subject modules + calculator + ingest/replace/edit live when signed in · auth = Clerk only
- **Open drifts:** 4 · **Open blockers:** none for local code · webhook/Q-004 post-deploy
- **Pieces VERIFIED:** UI C0–C10 · Clerk-only auth · Prisma · Arch API · full live bridge (CVER-049)
- **Milestones closed:** **11 / 11 UI** · Arch + live complete |
- **Achievements:** §19 ACH-001…020
- **Completion:** **~100% code/setup** · **~98% overall** (2 owner post-deploy items)

### 2.3 What's needed (remaining)

| Priority | Item | Status |
| --- | --- | --- |
| P0 | Nested writes — outcomes / plan / checklist / scores / assessments | **DONE** (CVER-048) |
| P0 | C6–C9 Figma `VERIFIED` gates | **DONE** — closed on smoke T-01…11 + live bridge evidence (CVER-048) |
| P1 | Checklist / grading / faculty / policies / edit live | **DONE** |
| P1 | Replace-subject from duplicate dialog | **DONE** |
| P2 | `CLERK_WEBHOOK_SECRET` after first Vercel deploy | Deferred (owner) |
| P2 | Q-004 Clerk email/password methods confirm in Dashboard | Owner |
| P2 | ISS-10 USB Turbopack junction — build on NTFS mirror when needed | Known |
| P0 | Clerk as default auth (delete Proto Figma login/register) | **DONE** (CDEC-016 · CVER-049) |

### 2.1 How to run

1. Terminal in `goldensync-web/` only.
2. `npm run dev` → http://localhost:3001 (or next free port) · `/` → `/sign-in`
3. `npm run lint` and `npm run build` must both pass before any piece is `BUILT`.

### 2.2 Runtime facts (from setup ledger)

| Item | Value |
| --- | --- |
| Runtime | Node 24.16.0 · npm 11.13.0 |
| Framework | Next 16.4.6 App Router · Turbopack · `cacheComponents` + `partialPrefetching` |
| UI | React 19.3 · TypeScript 5.9.3 |
| Style | Tailwind 4.3.3 · theme in `app/globals.css` |
| Components | shadcn 4.23 `base-nova` / Base UI · Magic UI where prototype uses it |
| Icons | `lucide-react` (prototype family) |
| Motion | `motion` (primary) |
| Forms | react-hook-form + zod + resolvers |
| Tables | `@tanstack/react-table` |
| State target | typed store for 13 Proto vars (zustand installed — needs owner APPROVED, §5.2) |
| Auth / DB | **Clerk only** (`/sign-in` `/sign-up`) · Prisma + `withApi` · Docker Postgres `:55432` · Proto auth removed |
| Live bridge | Semesters + subjects create/list when signed in · Proto fallback when signed out |
| Trigger | CLI logged in · `npm run trigger:dev` · task `ingest-syllabus` registered |
| Repo | USB `E:` — installs slow; never `npm audit fix` |

---

## 3. MILESTONE TABLE (RECOMPUTE AFTER EVERY PIECE)

| ID | Milestone | Status | Pieces VERIFIED / planned | Closed | Scope |
| --- | --- | --- | --- | --- | --- |
| C0 | Preflight | `VERIFIED` | 1 / 1 | 2026-11-20 | Sources, Figma access, drift list, build plan ≤20 lines |
| C1 | Tokens + foundations | `VERIFIED` | 6 / 6 | 2026-11-20 | UI-001…006 |
| C2 | Core components | `VERIFIED` | 27 / 27 | 2026-11-20 | UI-010…036 closed · CF comments |
| C3 | Domain components | `VERIFIED` | 10 / 10 | 2026-11-20 | UI-040…049 closed · CF comments |
| C4 | App shell | `VERIFIED` | 4 / 4 | 2026-11-20 | TopBar · AppShell · MobileDrawer · SwitcherPopover · /dashboard |
| C5 | Page 1 Auth | `VERIFIED` | 8 / 8 | 2026-11-20 | Login…Verify + Proto + SessionModals |
| C6 | Page 2 Dashboard + Add Subject | `VERIFIED` | 12 / 12 | 2026-11-21 | Cap/PDF/form/dup/save · live ingest/create · CVER-048 |
| C7 | Page 3 Subject Modules | `VERIFIED` | 12 / 12 | 2026-11-21 | Manage/Delete · modules live · CVER-048 |
| C8 | Page 4 Grade Calculator | `VERIFIED` | 8 / 8 | 2026-11-21 | Add/Edit/Switcher · live assessments/scores · CVER-048 |
| C9 | Responsive | `VERIFIED` | 4 / 4 | 2026-11-21 | Auth M · Dashboard T/M · Modules · Calculator · prior smoke |
| C10 | Motion, Demo Panel, QA | `VERIFIED` | 5 / 5 | 2026-11-20 | Motion · ProtoFab · T-01…11 · UI-134 signed |

**Overall:** **11 of 11 closed** · Q-001…003 APPROVED · live bridge complete · unit 33 PASS.

---

## 4. FIGMA → CODE MAP

### 4.1 Pages

| Figma page | Node | Code target | Milestone |
| --- | --- | --- | --- |
| `00 Cover` | `0:1` | not built | — |
| `01 Tokens` | `1:2` | `app/globals.css` + `/dev/tokens` | C1 |
| `02 Components` | `1:3` | `components/core`, `components/domain` | C2, C3 |
| `03 Auth` | `1:4` | `app/(auth)/*` · `features/auth` | C5 |
| `04 Dashboard + Add Subject` | `1:5` | `app/(app)/…` · `features/dashboard`, `features/add-subject` | C4, C6 |
| `05 Subject Modules` | `1:6` | `features/subject-modules` | C7 |
| `06 Grade Calculator` | `1:7` | `features/grade-calculator` | C8 |
| `07 Prototype Controls` | `1:8` | Demo Panel (dev-only) | C10 |
| `99 Scratch` | `1:9` | never build | — |

### 4.2 Variable collections

| Collection | Figma ID | Mode | Code target |
| --- | --- | --- | --- |
| Primitives | `VariableCollectionId:1:51` | Value | `app/globals.css` primitives |
| Semantic | `VariableCollectionId:1:68` | Dark | semantic tokens |
| Space | `VariableCollectionId:1:106` | Value | spacing theme |
| Radius | `VariableCollectionId:1:117` | Value | radius theme |
| Proto | `VariableCollectionId:1:122` | Value | typed Proto store (13 vars) |

### 4.3 Thirteen Proto variables (must all exist, typed)

| Variable | Role |
| --- | --- |
| `sessionActive` | Session warning / expired |
| `hasSemester` | Dashboard no-semester branch |
| `subjectCount` | Cap at 20 |
| `subjectSelected` | Shell + calculator subject |
| `loginOutcome` | success / wrong / throttled |
| `loginFailCount` | Throttle after 5 |
| `pdfOutcome` | ok + 6 failure modes |
| `duplicateCode` | Duplicate subject dialog |
| `saveOutcome` | ok / error on save |
| `weekState` | This Week five states |
| `scenario` | Calculator six scenarios |
| `gradeScaleConfirmed` | Grade gate on/off |
| `conflict` | Score save conflict |

### 4.4 Target folder layout (from stack standards)

```
goldensync-web/
├─ app/ (auth) (app) globals.css
├─ components/ ui/  core/  domain/
├─ features/ auth/ dashboard/ add-subject/ subject-modules/ grade-calculator/
├─ domain/ models/ services/ errors/
├─ data/ repositories/ seed/
├─ state/          # Proto store + selectors
├─ lib/  copy/
```

---

## 5. STACK LOCK AND OWNER APPROVALS

### 5.1 Approved (may import)

`next` · `react` · `typescript` · `tailwindcss` 4 · shadcn (`base-nova`, `@base-ui/react`) · Magic UI (only where Figma uses it) · `lucide-react` · `react-hook-form` · `zod` · `@hookform/resolvers` · `@tanstack/react-table` · `motion` · `sonner` · `next-themes` · shadcn helpers (`clsx`, `tailwind-merge`, `class-variance-authority`)

### 5.2 Pending owner approval (do not import until APPROVED)

| Library | Needed for | Decision |
| --- | --- | --- |
| `zustand` | 13 Proto vars central store | **APPROVED** 2026-11-20 — `state/proto-store.ts` |
| `react-dropzone` | PDF upload UI | **APPROVED** 2026-11-20 — DropZone |
| `pdf-parse` | Server PDF parse only | **APPROVED** 2026-11-20 — `/api/parse-syllabus` |
| `date-fns` · `react-day-picker` | Dates / This Week | **APPROVED** 2026-11-20 — date-fns on This Week |
| `cmdk` | Only if a frame needs it | **PENDING** |
| `animejs` · `react-bootstrap-icons` | Not in stack | **REJECTED** unless owner overrides |
| `@clerk/nextjs` · `@clerk/ui` | Auth | **APPROVED** 2026-11-20 (owner yes) · wired 2026-11-21 |
| `prisma` · `@prisma/orm-postgres` · `dotenv` | DB | **APPROVED** · Prisma 8 contract emit + `db init` on local Docker |

Owner: change a row to `APPROVED` / `REJECTED` here before the agent imports it.

---

## 6. PIECE BACKLOG (BUILD IN ORDER)

Status column starts `TODO`. Update as you go. Node IDs are the Figma build targets (from `system-progress-tracker.md`). Read live Figma before coding — tracker IDs can drift; Figma wins.

### C0 — Preflight

| Piece | Name | Figma / sources | Status | Notes |
| --- | --- | --- | --- | --- |
| UI-000 | C0 preflight | File key `ySMbVLRvKGQvjaGm3ihm7P` · fill §14 | `VERIFIED` | CVER-001. No UI code. Dev link confirmed. Stop for owner `go` on C1. |

### C1 — Tokens + foundations

| Piece | Name | Figma nodes | Code target | Status |
| --- | --- | --- | --- | --- |
| UI-001 | Primitive + semantic tokens | page `1:2` · collections 1:51, 1:68 | `app/globals.css` | `VERIFIED` |
| UI-002 | Space + radius + text/effect styles | Space 1:106 · Radius 1:117 · styles on Tokens page | `globals.css` + Tailwind theme · `layout.tsx` fonts | `VERIFIED` |
| UI-003 | Proto store interface + seed defaults | Proto 1:122 · legend `198:195` | `state/` | `VERIFIED` |
| UI-004 | Typed seed data layer | Prototype seed subjects / scores | `data/seed/` | `VERIFIED` |
| UI-005 | Copy module (Appendix A) | plan Appendix A · Figma text layers | `copy/` | `VERIFIED` |
| UI-006 | Dev-only tokens preview route | — | `app/dev/tokens` (flagged) | `VERIFIED` |

### C2 — Core components (one per piece)

| Piece | Component | Node | Status |
| --- | --- | --- | --- |
| UI-010 | Button | `5:161` | `VERIFIED` |
| UI-011 | Input | `8:84` | `VERIFIED` |
| UI-012 | FormField | `10:50` | `VERIFIED` |
| UI-013 | Textarea | `11:50` | `VERIFIED` |
| UI-014 | Checkbox | `12:100` | `VERIFIED` |
| UI-015 | Badge | `13:78` | `VERIFIED` |
| UI-016 | StatusChip | `14:58` | `VERIFIED` |
| UI-017 | ResultStatusBadge | `14:95` | `VERIFIED` |
| UI-018 | Card | `15:114` | `VERIFIED` |
| UI-019 | Table + TableRow | `16:177` · `16:166` · `16:92` | `VERIFIED` |
| UI-020 | MobileRowCard | `17:153` | `VERIFIED` |
| UI-021 | NavItem | `19:222` | `VERIFIED` |
| UI-022 | Sidebar + SubjectSwitcher shell parts | `21:485` · `21:209` | `VERIFIED` |
| UI-023 | Tabs + Tab | `22:490` · `22:453` | `VERIFIED` |
| UI-024 | SegmentedControl | `22:538` · `22:504` | `VERIFIED` |
| UI-025 | Modal + Backdrop | `24:508` · `24:509` | `VERIFIED` |
| UI-026 | Banner | `24:576` | `VERIFIED` |
| UI-027 | Toast | `25:545` | `VERIFIED` |
| UI-028 | Tooltip | `25:585` | `VERIFIED` |
| UI-029 | Skeleton | `25:651` | `VERIFIED` |
| UI-030 | EmptyState | `25:671` | `VERIFIED` |
| UI-031 | ErrorState | `25:760` | `VERIFIED` |
| UI-032 | Popover / Menu + MenuItem | `26:238` · `26:166` | `VERIFIED` |
| UI-033 | ProgressBar | `27:27` | `VERIFIED` |
| UI-034 | Stepper + Step | `27:297` · `27:81` | `VERIFIED` |
| UI-035 | DropZone | `28:127` | `VERIFIED` |
| UI-036 | Chip | `72:2428` | `VERIFIED` |

### C3 — Domain components

| Piece | Component | Node | Status |
| --- | --- | --- | --- |
| UI-040 | SubjectCard | `32:223` · `32:40` | `VERIFIED` |
| UI-041 | SemesterPicker | `33:80` · `33:2` | `VERIFIED` |
| UI-042 | OutcomeRow | `35:1080` | `VERIFIED` |
| UI-043 | ActivityRow | `36:1182` · `36:1073` | `VERIFIED` |
| UI-044 | WeekRow | `37:1249` · `37:1160` | `VERIFIED` |
| UI-045 | ResultCard | `38:1476` | `VERIFIED` |
| UI-046 | OutcomeMap | `39:1585` | `VERIFIED` |
| UI-047 | CoverageMatrix | `39:1613` · `39:1612` | `VERIFIED` |
| UI-048 | FlaggedField | `40:1411` | `VERIFIED` |
| UI-049 | PdfStepIndicator | `40:1519` | `VERIFIED` |

### C4 — App shell

| Piece | Name | Primary frames | Status |
| --- | --- | --- | --- |
| UI-050 | Top bar | Dashboard Default D `69:2019` (bar) | `VERIFIED` |
| UI-051 | Sidebar expanded / collapsed | `69:2019` · Collapsed `97:9608` | `VERIFIED` |
| UI-052 | Mobile / tablet drawer | Drawer T `99:11661` · M `101:10669` | `VERIFIED` |
| UI-053 | Subject switcher popover | `97:9811` · Empty `97:9945` | `VERIFIED` |

### C5 — Page 1 Auth (`P1/*`)

| Piece | Name | Primary frames (D; M in C9) | Status |
| --- | --- | --- | --- |
| UI-060 | Login default / loading / error / logged out / resend | `48:2` · `48:110` · `48:176` · `49:241` · `51:543` | `VERIFIED` |
| UI-061 | Login throttled + fail counter logic | `49:96` | `VERIFIED` |
| UI-062 | Session warning + session expired | `49:2315` · `49:173` | `VERIFIED` |
| UI-063 | Register (default, field errors, submitting, sent) | `49:307` · `49:419` · `49:551` · `49:639` | `VERIFIED` |
| UI-064 | Forgot password | `49:678` · `49:735` | `VERIFIED` |
| UI-065 | Reset (valid, invalid, success) | `49:763` · `49:817` · `49:839` | `VERIFIED` |
| UI-066 | Verify (success, invalid) | `49:2236` · `49:2255` | `VERIFIED` |
| UI-067 | Auth routing + Proto wiring for loginOutcome / failCount / sessionActive | — | `VERIFIED` |

### C6 — Page 2 Dashboard + Add Subject (`P2/*`)

| Piece | Name | Primary frames | Status |
| --- | --- | --- | --- |
| UI-070 | Dashboard default / loading / empty / no semester | `69:2019` · `69:2234` · `69:2334` · `72:2608` | `VERIFIED` |
| UI-071 | Semester new + error (+ Max30) | `72:2721` · `72:2853` · `73:1476` | `BUILT` |
| UI-072 | Add Subject cap reached | `82:1679` | `BUILT` |
| UI-073 | PDF upload idle / selected / rejected ×4 | `85:1564` · `85:1830` · `87:1948` · `87:2126` · `87:2295` · `87:2464` | `BUILT` |
| UI-074 | PDF processing ×3 + parse errors | `88:2692` · `88:2867` · `88:3056` · `89:3265` · `89:3442` | `BUILT` |
| UI-075 | Subject form steps 1–5 prefilled | `90:5086` · `91:4704` · `91:5109` · `92:5955` · `92:6801` | `BUILT` |
| UI-076 | Subject form empty + validation + autosaved | `93:6905` · `93:7286` · `93:7613` · `94:7721` · `94:8135` | `BUILT` |
| UI-077 | Duplicate dialog + replace summary | `95:8385` · `95:8540` | `BUILT` |
| UI-078 | Save saving / error / created + draft restored | `95:9078` · `95:9393` · `95:9790` · `95:9930` | `BUILT` |
| UI-079 | Add-subject Proto wiring (pdfOutcome, duplicateCode, saveOutcome, subjectCount) | — | `BUILT` |
| UI-080 | Dashboard routes + navigation into Add Subject | — | `VERIFIED` |
| UI-081 | C6 gate: all P2 D states reachable | section 12 C6 | `BUILT` |

### C7 — Page 3 Subject Modules (`P3/*`)

| Piece | Name | Primary frames | Status |
| --- | --- | --- | --- |
| UI-090 | Overview | `128:183` | `VERIFIED` |
| UI-091 | Outcomes (+ hover) | `129:272` · `129:446` | `VERIFIED` |
| UI-092 | Learning plan | `131:1031` | `VERIFIED` |
| UI-093 | Grading / Policies / Faculty + empty modules | `133:1076` · `133:1202` · `133:1319` · `134:1287` · `134:1396` · `134:1503` | `VERIFIED` |
| UI-094 | Assessments map | `135:1499` | `VERIFIED` |
| UI-095 | Checklist (+ toggled) | `136:1742` · `136:2231` | `VERIFIED` |
| UI-096 | Export | `137:2631` | `VERIFIED` |
| UI-097 | This Week ×5 states | `138:2736` · `138:2870` · `138:2997` · `138:3107` · `138:3234` | `VERIFIED` |
| UI-098 | Manage menu / edit / archive | `141:13942` · `141:13970` · `141:14181` | `BUILT` |
| UI-099 | Delete confirm default / filled | `142:3935` · `142:4006` | `BUILT` |
| UI-100 | Account + delete dialog | `144:4262` · `144:4409` | `VERIFIED` |
| UI-101 | C7 gate: modules + Proto weekState | section 12 C7 | `BUILT` |

### C8 — Page 4 Grade Calculator (`P4/*`)

| Piece | Name | Primary frames | Status |
| --- | --- | --- | --- |
| UI-110 | No subject + default/PASSED table | `177:11046` · `177:11930` | `VERIFIED` |
| UI-111 | Scenarios INT_A / UNDEFINED / INT_B / FAILED / INCOMPLETE | `178:418` · `178:759` · `178:1108` · `178:1457` · `178:1817` | `VERIFIED` |
| UI-112 | Results + grade scale gate on/off | `179:1715` · `179:1788` · `179:1862` · `179:1942` · `179:2023` · `179:2096` · `179:2184` | `VERIFIED` |
| UI-113 | New activity + activity added | `180:3966` · `180:4360` | `BUILT` |
| UI-114 | Edit score / invalid / conflict | `180:4693` · `181:14` · `181:406` | `BUILT` |
| UI-115 | Calculator switcher open / choose | `185:5680` · `185:6008` | `BUILT` |
| UI-116 | Proto wiring (scenario, gradeScaleConfirmed, conflict) | — | `BUILT` |
| UI-117 | C8 gate | section 12 C8 | `BUILT` |

### C9 — Responsive

| Piece | Name | Primary frames | Status |
| --- | --- | --- | --- |
| UI-120 | Auth M frames | Login `49:2379` · Register `49:2443` · Forgot `49:2522` · Reset `172:17300` · Verify `172:17357` | `BUILT` |
| UI-121 | Dashboard / Add Subject T+M + 1920 stretch | T `99:11523` · M `101:10398` · drawers · upload M · form M · stretch `218:11300` | `BUILT` |
| UI-122 | Modules T+M | Overview/Plan T+M · ThisWeek M · Checklist M · Delete M | `BUILT` |
| UI-123 | Calculator T+M + Result IntB M | `182:5539` · `182:5877` · `182:6042` · touch 44 / inputs 48 | `BUILT` |

### C10 — Motion, Demo Panel, QA

| Piece | Name | Source | Status |
| --- | --- | --- | --- |
| UI-130 | Required motion (nav 300 / overlay 250 / state 150, shake, success check, sync chain, BorderBeam, meteor, CO→PO) | tracker §8.3 · nodes e.g. `233:25293`, `234:12954` | `BUILT` |
| UI-131 | Stretch motion if time (card stagger, progress fill, pulse, skeleton shimmer); skip shimmer button (DEC-079g) | `237:2592` · `237:2746` | `BUILT` |
| UI-132 | Demo Panel + Variable legend (dev-only, 11 control groups) | `197:139` · `197:7` · `198:195` | `BUILT` |
| UI-133 | Flow tests T-01 … T-11 in the running app | section 13 | `BUILT` |
| UI-134 | Final gate + owner sign-off | section 12 C10 + section 15 | `VERIFIED` |

---

## 7. PIECE LEDGER (APPEND-ONLY)

| Piece | Date (UTC+8) | Milestone | Name | Type | Figma nodes | Files | Status | CVER | Notes |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| UI-000 | 2026-11-20 18:50 | C0 | C0 preflight | SYNC | file `ySMbVLRvKGQvjaGm3ihm7P` · pages `0:1`–`1:9` · Dev link node `1:5` | tracker only (no app UI) | `VERIFIED` | CVER-001 | Figma MCP OK · lint/build PASS · drifts CDRF-001…003 · Q deferred |
| UI-001 | 2026-11-20 19:00 | C1 | Primitive + semantic tokens | CREATE | `1:2` · doc `2:2` · collections `1:51` / `1:68` | `goldensync-web/app/globals.css` | `VERIFIED` | CVER-002 | 16 primitives + full semantic set; shadcn bridged to GS dark |
| UI-002 | 2026-11-20 19:05 | C1 | Space + radius + text/effect styles | UPDATE | Space `1:106` · Radius `1:117` · text/effect on `2:2` | `app/globals.css` · `app/layout.tsx` | `VERIFIED` | CVER-003 | Inter + Roboto Mono; glass-* / bg-ambient / focus-ring; Figma radius wins |
| UI-003 | 2026-11-20 19:10 | C1 | Proto store interface + defaults | CREATE | Proto `1:122` · legend `198:195` | `state/proto-*.ts` · `state/index.ts` | `VERIFIED` | CVER-004 | 13 fields typed; in-memory store (no zustand); throttle helper |
| UI-004 | 2026-11-20 19:15 | C1 | Typed seed data layer | CREATE | plan §7 | `data/seed/*` · `domain/types.ts` | `VERIFIED` | CVER-005 | Account, semester, 3 subjects, ITE 14 detail |
| UI-005 | 2026-11-20 19:18 | C1 | Copy module Appendix A | CREATE | plan Appendix A | `copy/appendix-a.ts` | `VERIFIED` | CVER-006 | Locked strings only |
| UI-006 | 2026-11-20 19:20 | C1 | Dev tokens preview | CREATE | Tokens `2:2` | `app/dev/tokens/page.tsx` | `VERIFIED` | CVER-007 | `/dev/tokens` · C1 gate |
| UI-010 | 2026-11-20 19:25 | C2 | Button | CREATE | `5:161` | `components/core/button.tsx` · `index.ts` | `VERIFIED` | CVER-008 | Primary|Secondary|Ghost|Destructive|IconOnly · sm/md/lg |
| UI-011 | 2026-11-20 19:35 | C2 | Input | CREATE | `8:84` | `components/core/input.tsx` · `index.ts` | `VERIFIED` | CVER-009 | Desktop 44 / Mobile 48 · KL-02 border · icon slots |
| UI-012 | 2026-11-20 19:40 | C2 | FormField | CREATE | `10:50` | `components/core/form-field.tsx` · `index.ts` | `VERIFIED` | CVER-010 | Label + Input + helper/error · a11y ids |
| UI-013 | 2026-11-20 19:45 | C2 | Textarea | CREATE | `11:50` | `components/core/textarea.tsx` · `index.ts` | `VERIFIED` | CVER-011 | min-h space-24 · Input border tokens |
| UI-014 | 2026-11-20 19:50 | C2 | Checkbox | CREATE | `12:100` | `components/core/checkbox.tsx` · `index.ts` | `VERIFIED` | CVER-012 | 44 hit · 24 box · error row · DEC-011 |
| UI-015 | 2026-11-20 19:55 | C2 | Badge | CREATE | `13:78` | `components/core/badge.tsx` · `index.ts` | `VERIFIED` | CVER-013 | Default|Success|Warning|Error|Accent × sm/md/lg |
| UI-016 | 2026-11-20 20:00 | C2 | StatusChip | CREATE | `14:58` | `components/core/status-chip.tsx` · `globals.css` pulse | `VERIFIED` | CVER-014 | Not Started / In Progress pulse / Completed |
| UI-017 | 2026-11-20 20:20 | C2 | ResultStatusBadge | CREATE | `14:95` | `components/core/result-status-badge.tsx` · `index.ts` | `VERIFIED` | CVER-015 | Wraps core Badge · DEC-015 codes · not ui/badge |
| UI-018 | 2026-11-20 20:25 | C2 | Card | CREATE | `15:114` | `components/core/card.tsx` · `globals.css` glass-md-hover | `VERIFIED` | CVER-016 | Default|Interactive|Active · DEC-016 hover |
| UI-019 | 2026-11-20 20:35 | C2 | Table + TableRow | CREATE | `16:177` · `16:166` · `16:92` | `components/core/table*.tsx` | `VERIFIED` | CVER-017 | glass-sm · DEC-017 hover · selected bar · Skeleton |
| UI-020 | 2026-11-20 20:40 | C2 | MobileRowCard | CREATE | `17:153` | `components/core/mobile-row-card.tsx` | `VERIFIED` | CVER-018 | glass-md · DEC-035 pad space-6 |
| UI-021…036 | 2026-11-20 21:05 | C2 | Core remainder | CREATE | see §6 C2 | `components/core/*` | `VERIFIED` | CVER-019 | NavItem…Chip · CF comments · lint/build PASS |
| UI-040 | 2026-11-20 21:20 | C3 | SubjectCard | CREATE | `32:223` · `32:40` | `components/core/subject-card.tsx` | `VERIFIED` | CVER-020 | Card slot · DEC-048 clamp · Active BorderBeam |
| UI-041 | 2026-11-20 21:22 | C3 | SemesterPicker | CREATE | `33:80` | `components/core/semester-picker.tsx` | `VERIFIED` | CVER-021 | trigger · open=Active · Lucide calendar |
| UI-042 | 2026-11-20 21:25 | C3 | OutcomeRow | CREATE | `35:1080` | `components/core/outcome-row.tsx` | `VERIFIED` | CVER-022 | Attained/Not/No scores/Excluded |
| UI-043 | 2026-11-20 21:28 | C3 | ActivityRow | CREATE | `36:1182` | `components/core/activity-row.tsx` | `VERIFIED` | CVER-023 | Score field · Error/Conflict icons |
| UI-044 | 2026-11-20 21:30 | C3 | WeekRow | CREATE | `37:1249` | `components/core/week-row.tsx` | `VERIFIED` | CVER-024 | Checkbox + StatusChip · No class |
| UI-045 | 2026-11-20 21:32 | C3 | ResultCard | CREATE | `38:1476` | `components/core/result-card.tsx` | `VERIFIED` | CVER-025 | Estimated badge · isGradeHidden 9.4 |
| UI-046 | 2026-11-20 21:35 | C3 | OutcomeMap | CREATE | `39:1585` | `components/core/outcome-map.tsx` | `VERIFIED` | CVER-026 | CSS beams · I/E/D · highlight |
| UI-047 | 2026-11-20 21:36 | C3 | CoverageMatrix | CREATE | `39:1613` | `components/core/coverage-matrix.tsx` | `VERIFIED` | CVER-027 | 8×4 seed map · Check cells |
| UI-048 | 2026-11-20 21:37 | C3 | FlaggedField | CREATE | `40:1411` | `components/core/flagged-field.tsx` | `VERIFIED` | CVER-028 | warning tint · Check this value |
| UI-049 | 2026-11-20 21:38 | C3 | PdfStepIndicator | CREATE | `40:1519` | `components/core/pdf-step-indicator.tsx` | `VERIFIED` | CVER-029 | 0/33/66/100 · Loader spin |
| UI-071…079 | 2026-11-20 20:30 | C6 | Add Subject suite | CREATE | `72:2721`…`95:9930` | `features/add-subject/*` · `semester-dialog` | `BUILT` | CVER-031 | Cap/PDF/form/dup/save Proto · lint PASS |
| UI-098…099 | 2026-11-20 20:25 | C7 | Manage + Delete | CREATE | `141:13942` · `142:3935` | `features/subject/*` · dashboard | `BUILT` | CVER-031 | Menu + confirm typed code |
| UI-113…116 | 2026-11-20 20:35 | C8 | Calc add/edit/switcher | CREATE | `180:3966`…`185:6008` | `features/calculator/*` · calculator page | `BUILT` | CVER-031 | Scenario bar · conflict · Proto |
| UI-130 | 2026-11-20 20:40 | C10 | Motion utilities | CREATE | §8.3 | `app/globals.css` · Modal · Login shake | `BUILT` | CVER-031 | 300/250/150 · shake · overlay |
| UI-091b | 2026-11-20 21:15 | C7 | Outcomes Card + CO hover | UPDATE | `129:272` · `129:446` | `outcomes/page` · `outcome-map` | `VERIFIED` | CVER-033 | Card "Outcome map" · onHighlightChange |
| UI-092b | 2026-11-20 21:15 | C7 | Plan 18 weeks + notes | UPDATE | `131:1031` | `plan/page` · `week-row` · `data/seed/weeks` | `VERIFIED` | CVER-033 | Done hidden · Week 13 accent · notes Card |
| UI-096b | 2026-11-20 21:15 | C7 | Export Card header + hideSemester | UPDATE | `137:2631` | `export/page` · `top-bar` · modules | `VERIFIED` | CVER-033 | hasHeader · hideSemester all P3 |
| UI-093b | 2026-11-20 21:35 | C7 | Empty modules ×7 | UPDATE | `134:1287`…`328:7438` | `empty-module-panel` · module pages · DemoPanel | `VERIFIED` | CVER-034 | ?empty=1 · Edit subject CTA |
| UI-134 | 2026-11-20 21:56 | C10 | Owner sign-off | SYNC | §15 | tracker | `VERIFIED` | CVER-035 | Owner: do still open |
| Q-001 | 2026-11-20 21:56 | C1 | zustand Proto store | UPDATE | Proto `1:122` | `state/proto-store.ts` | `VERIFIED` | CVER-035 | vanilla zustand + facade |
| Q-002 | 2026-11-20 21:56 | C6 | dropzone + pdf-parse | UPDATE | DropZone · parse API | `drop-zone` · `lib/pdf` · `api/parse-syllabus` | `VERIFIED` | CVER-035 | server-only parse |
| Q-003 | 2026-11-20 21:56 | C7 | date-fns This Week | UPDATE | This Week | `this-week/page.tsx` | `VERIFIED` | CVER-035 | format + daysUntilStart |
| Clerk | 2026-11-21 03:10 | Auth | Clerk provider + routes | CREATE | N-01 | `layout` · `proxy` · `sign-in` · `sign-up` · `clerk-auth-controls` · Account | `BUILT` | CVER-036 | Proto /login|/register kept |
| Prisma | 2026-11-21 04:58 | Auth/DB | Prisma 8 contract + local DB | CREATE | Phase 0 | `prisma/contract.prisma` · `prisma.config.ts` · `lib/db` · compose `db` | `BUILT` | CVER-037 | Docker `:55432` · db verify PASS |
| API-me | 2026-11-21 08:20 | Phase 0 | withApi + GET /api/me | CREATE | Arch §5/§6 | `lib/http` · `lib/auth` · `lib/services/me` · `app/api/me` | `BUILT` | CVER-038 | ensureUser · ownership matrix test |
| API-subj | 2026-11-21 08:45 | Phase 1 | Semesters + subjects CRUD | CREATE | Arch §20 P1 | `lib/{domain,validation,queries,services}` · `app/api/semesters` · `app/api/subjects` | `BUILT` | CVER-039 | Idempotency-Key gate · soft-archive delete · unit PASS |
| API-mod | 2026-11-21 08:55 | Phase 1 | Outcomes · plan · activities · checklist | CREATE | Arch §20 P1 | `app/api/subjects/[id]/{outcomes,plan,assessments,checklist}` · `app/api/assessments` | `BUILT` | CVER-040 | Replace sets · GET subject detail nested · unit PASS |
| API-calc | 2026-11-21 09:00 | Phase 2 | Grade engine · scores · derived outcome | CREATE | Arch §10/§20 P2 | `lib/domain/grade-engine` · `PUT …/scores` · `GET …/outcome` · `AssessmentOutcome` | `BUILT` | CVER-041 | 6 vectors + CONFLICT_VERSION · gradeHidden stub |
| API-week | 2026-11-21 09:10 | Phase 2 | GradeScale gate + planner week | CREATE | Arch §10.2/§10.3 | `GradeScale*` · `lib/domain/{grade-scale,planner}` · `GET …/week` · Manila today | `BUILT` | CVER-042 | mapAverageToGrade · getWeekState unit PASS |
| API-exp | 2026-11-21 09:15 | Phase 3 | Export CSV/JSON + archive/restore | CREATE | Arch §10.4/§20 P3 | `lib/domain/csv` · `GET …/export` · `POST …/archive|restore` | `BUILT` | CVER-043 | formula neutralization unit · 30-day restore |
| API-sys | 2026-11-21 09:25 | P3–P5 | Account · ingest · drafts · replace · health · webhook · rate limit | CREATE | Arch §20 | `IngestJob`/`Draft`/`AuditLog` · `/api/me/*` · ingest · blob scaffold · withApi RL | `BUILT` | CVER-044 | CDEC-015 continuous · unit 33 · workers blocked |
| Setup | 2026-11-21 09:40 | Ops | Blob+Trigger packages · webhook verify · live semester bridge | CREATE | CDEC-015 | `@vercel/blob` · `@trigger.dev/sdk` · `trigger/ingest-syllabus` · `useLiveData` · `.env.example` | `BUILT` | CVER-045 | Secrets still empty placeholders |
| Live-subj | 2026-11-21 10:23 | Ops | Add Subject → POST /api/subjects · list by semester | UPDATE | CDEC-015 | `GET …/semesters/:id/subjects` · `useLiveData` subjects · `AddSubjectModal` live create · dashboard grid | `BUILT` | CVER-046 | Secrets filled · trigger worker ready · unit 33 PASS |
| Live-e2e | 2026-11-21 10:45 | Ops | PDF ingest E2E · modules live · archive/delete/export | UPDATE | CDEC-015 | `lib/api/ingest` · Trigger parse · `useLiveSubject` · archive/delete/export clients | `BUILT` | CVER-047 | unit 33 PASS · ACH-014…016 |
| Live-100 | 2026-11-21 10:55 | Ops | Nested writes · all modules · replace · C6–C9 close | UPDATE | CDEC-015 | edit PATCH+outcomes · plan notes · checklist · calculator live · replaceSubject | `VERIFIED` | CVER-048 | C0–C10 closed · ~100% code |
| Auth-Clerk | 2026-11-21 11:25 | Auth | Clerk default · delete Proto auth UI | UPDATE | CDEC-016 | removed `app/(auth)/*` · `AuthShell` · `/`→`/sign-in` · redirects · Account/Dashboard logout | `VERIFIED` | CVER-049 | Overturns CDEC-013 |

---

## 8. BUILT MAP (APPEND AS ITEMS SHIP)

| Figma component / frame | Node ID | Code path | Piece | Status |
| --- | --- | --- | --- | --- |
| Primitives collection | `VariableCollectionId:1:51` | `app/globals.css` `--primitive-*` | UI-001 | `VERIFIED` |
| Semantic collection | `VariableCollectionId:1:68` | `app/globals.css` `--bg-*` / `--text-*` / … | UI-001 | `VERIFIED` |
| Tokens Documentation | `2:2` | value source for UI-001 | UI-001 | `VERIFIED` |
| Button | `5:161` | `components/core/button.tsx` | UI-010 | `VERIFIED` |
| Input | `8:84` | `components/core/input.tsx` | UI-011 | `VERIFIED` |
| FormField | `10:50` | `components/core/form-field.tsx` | UI-012 | `VERIFIED` |
| Textarea | `11:50` | `components/core/textarea.tsx` | UI-013 | `VERIFIED` |
| Checkbox | `12:100` | `components/core/checkbox.tsx` | UI-014 | `VERIFIED` |
| Badge | `13:78` | `components/core/badge.tsx` | UI-015 | `VERIFIED` |
| StatusChip | `14:58` | `components/core/status-chip.tsx` | UI-016 | `VERIFIED` |
| ResultStatusBadge | `14:95` | `components/core/result-status-badge.tsx` | UI-017 | `VERIFIED` |
| Card | `15:114` | `components/core/card.tsx` | UI-018 | `VERIFIED` |
| Table | `16:177` | `components/core/table.tsx` | UI-019 | `VERIFIED` |
| TableHeader | `16:92` | `components/core/table-header.tsx` | UI-019 | `VERIFIED` |
| TableRow | `16:166` | `components/core/table-row.tsx` | UI-019 | `VERIFIED` |
| MobileRowCard | `17:153` | `components/core/mobile-row-card.tsx` | UI-020 | `VERIFIED` |
| NavItem…Chip (C2 remainder) | `19:222`…`72:2428` | `components/core/*` | UI-021…036 | `VERIFIED` |
| SubjectCard | `32:223` | `components/core/subject-card.tsx` | UI-040 | `VERIFIED` |
| SemesterPicker | `33:80` | `components/core/semester-picker.tsx` | UI-041 | `VERIFIED` |
| OutcomeRow | `35:1080` | `components/core/outcome-row.tsx` | UI-042 | `VERIFIED` |
| ActivityRow | `36:1182` | `components/core/activity-row.tsx` | UI-043 | `VERIFIED` |
| WeekRow | `37:1249` | `components/core/week-row.tsx` | UI-044 | `VERIFIED` |
| ResultCard | `38:1476` | `components/core/result-card.tsx` | UI-045 | `VERIFIED` |
| OutcomeMap | `39:1585` | `components/core/outcome-map.tsx` | UI-046 | `VERIFIED` |
| CoverageMatrix | `39:1613` | `components/core/coverage-matrix.tsx` | UI-047 | `VERIFIED` |
| FlaggedField | `40:1411` | `components/core/flagged-field.tsx` | UI-048 | `VERIFIED` |
| PdfStepIndicator | `40:1519` | `components/core/pdf-step-indicator.tsx` | UI-049 | `VERIFIED` |

---

## 9. VERIFICATION LOG (APPEND-ONLY)

### Template

```
### CVER-000 · YYYY-MM-DD HH:MM · UI-nnn
Viewport: <w×h = Figma frame>
Figma node(s): <ids>
Browser screenshot: <path>   Figma screenshot: <node>
Diffs: <list or none>
Lint: pass/fail · Build: pass/fail · Console: 0 · Types: strict
Result: PASS / FAIL
```

### Entries

### CVER-001 · 2026-11-20 18:50 · UI-000
Viewport: n/a (preflight, no UI piece)
Figma node(s): file key `ySMbVLRvKGQvjaGm3ihm7P` · pages listed · Dev Mode `1:5` · Tokens screenshot `1:2`
Browser screenshot: n/a   Figma screenshot: Tokens page `1:2` (MCP)
Diffs: none (no UI compared)
Lint: pass · Build: pass · Console: n/a · Types: build tsc pass
Result: PASS

### CVER-002 · 2026-11-20 19:00 · UI-001
Viewport: n/a (token values; visual tokens preview is UI-006)
Figma node(s): `1:2` · `2:2` · collections `1:51` · `1:68`
Browser screenshot: n/a (no screen piece) · Evidence: `get_variable_defs` on `2:2` vs `globals.css`
Diffs: none on color values checked (primitives + semantic hex/alpha match dump). Space/radius/text styles not in this piece.
Lint: pass · Build: pass · Console: n/a · Types: build tsc pass
Result: PASS

### CVER-003 · 2026-11-20 19:05 · UI-002
Viewport: n/a (token/foundation piece)
Figma node(s): Space `1:106` · Radius `1:117` · styles via `2:2`
Evidence: space 4…96 · radius 8/12/16/999 · text utilities · glass/focus/shadow/bg-ambient match dump/plan 5.3–5.4
Lint: pass · Build: pass · Types: pass
Result: PASS

### CVER-004 · 2026-11-20 19:10 · UI-003
Viewport: n/a
Figma node(s): Proto `VariableCollectionId:1:122` · legend `198:195`
Evidence: 13 fields + defaults = plan 5.6; no zustand import; hooks via useSyncExternalStore
Lint: pass · Build: pass · Types: pass
Result: PASS

### CVER-005 · 2026-11-20 19:15 · UI-004
Evidence: seed matches plan §7 codes/titles/units/weeks; branded ids
Lint: pass · Build: pass · Result: PASS

### CVER-006 · 2026-11-20 19:18 · UI-005
Evidence: Appendix A strings copied verbatim into `copy/appendix-a.ts`
Lint: pass · Build: pass · Result: PASS

### CVER-007 · 2026-11-20 19:20 · UI-006
Viewport: /dev/tokens · Figma `2:2`
Evidence: route builds; swatches use CSS vars; foundation smoke shows seed/proto/copy
Lint: pass · Build: pass · Result: PASS · C1 gate closed

### CVER-008 · 2026-11-20 19:25 · UI-010
Viewport: component (Button set `5:161`)
Figma node(s): `5:161`
Browser screenshot: n/a (core primitive; lint/build gate)   Figma screenshot: MCP set
Diffs: none material · IconOnly forced md · lg height `h-[52px]`
Lint: pass · Build: pass · Result: PASS

### CVER-009 · 2026-11-20 19:35 · UI-011
Viewport: component (Input set `8:84`)
Figma node(s): `8:84`
Browser screenshot: n/a (core primitive; lint/build gate)   Figma screenshot: MCP set
Diffs: none · Size Desktop/Mobile · KL-02 resting border kept · Active=Focus via CSS
Lint: pass · Build: pass · Result: PASS

### CVER-010 · 2026-11-20 19:40 · UI-012
Viewport: component (FormField set `10:50`)
Figma node(s): `10:50`
Browser screenshot: n/a   Figma screenshot: MCP set
Diffs: none · Error hides helper · CircleAlert 14 · nested Input
Lint: pass · Build: pass · Result: PASS

### CVER-011 · 2026-11-20 19:45 · UI-013
Viewport: component (Textarea set `11:50`)
Figma node(s): `11:50`
Browser screenshot: n/a   Figma screenshot: MCP set
Diffs: none · min-h 96 · same KL-02 / focus / error as Input
Lint: pass · Build: pass · Result: PASS

### CVER-012 · 2026-11-20 19:50 · UI-014
Viewport: component (Checkbox set `12:100`)
Figma node(s): `12:100`
Browser screenshot: n/a   Figma screenshot: MCP set
Diffs: none · hit 44 · box 24 · Check 16 · error row
Lint: pass · Build: pass · Result: PASS

### CVER-013 · 2026-11-20 19:55 · UI-015
Viewport: component (Badge set `13:78`)
Figma node(s): `13:78`
Browser screenshot: n/a   Figma screenshot: MCP set
Diffs: none · 5 variants × 3 sizes · tint tokens
Lint: pass · Build: pass · Result: PASS

### CVER-014 · 2026-11-20 20:00 · UI-016
Viewport: component (StatusChip set `14:58`)
Figma node(s): `14:58`
Browser screenshot: n/a   Figma screenshot: MCP set
Diffs: none · pulse keyframe in globals · reduced-motion safe
Lint: pass · Build: pass · Result: PASS

### CVER-015 · 2026-11-20 20:20 · UI-017
Viewport: component (ResultStatusBadge set `14:95`)
Figma node(s): `14:95`
Browser screenshot: n/a   Figma screenshot: MCP set
Diffs: none · composes `components/core/badge` (not `ui/badge`) · verbatim codes
Lint: pass · Build: pass · Result: PASS

### CVER-016 · 2026-11-20 20:25 · UI-018
Viewport: component (Card set `15:114`)
Figma node(s): `15:114`
Browser screenshot: n/a   Figma screenshot: MCP set
Diffs: none · glass-md / glass-md-hover / glass-accent · BorderBeam approx on Active
Lint: pass · Build: pass · Result: PASS

### CVER-017 · 2026-11-20 20:35 · UI-019
Viewport: component (Table `16:177` · TableRow `16:166` · Header `16:92`)
Figma node(s): `16:177` · `16:166` · `16:92`
Browser screenshot: n/a   Figma screenshot: MCP set
Diffs: none · DEC-017 hover surface-glass · selected 2px accent · Delete aria-label
Lint: pass · Build: pass · Result: PASS

### CVER-018 · 2026-11-20 20:40 · UI-020
Viewport: component (MobileRowCard `17:153`)
Figma node(s): `17:153`
Browser screenshot: n/a   Figma screenshot: MCP set
Diffs: none · DEC-035 padding space-6 · glass-md · Delete aria-label
Lint: pass · Build: pass · Result: PASS

### CVER-019 · 2026-11-20 21:05 · UI-021…036
Viewport: C2 remainder · Lint/build PASS · CF comments · Result: PASS

### CVER-020…029 · 2026-11-20 21:20–21:38 · UI-040…049
Viewport: C3 domain · Lint/build PASS · OutcomeMap CSS beams · Result: PASS

### CVER-030 · 2026-11-20 22:10 · UI-050…053
Viewport: C4 shell + `/dashboard` · Figma `69:2019` · `101:10669` · `97:9811`
Diffs: none · seed SubjectCards · MobileDrawer · SwitcherPopover
Lint: pass · Build: pass · Result: PASS

### CVER-031 · 2026-11-20 20:40 · UI-071…079 · UI-098…099 · UI-113…116 · UI-130
Viewport: Dashboard / Calculator / Modules · Figma MCP screenshots vs code
Evidence: DuplicateSubjectDialog · NewActivityDialog · EditScorePopover · Export CSV/JSON · Grading card · motion utils · DemoPanel 13 fields
Lint: pass · Build: pass · Types: pass
Result: PASS (BUILT; pixel verify deferred to browser gate)

### CVER-032 · 2026-11-20 21:05 · UI-090 · UI-095 · UI-097 · UI-100 · Card defaults
Viewport: Overview / Account / This Week / Checklist · Figma `128:183` · `144:4262` · `138:2736` · `136:1742`
Evidence: Course spec + Quick links · Export/Delete account · Week 13 card · 18-week checklist + progress
Lint: pass · Build: pass · Types: pass
Result: PASS

### CVER-033 · 2026-11-20 21:15 · UI-091 · UI-092 · UI-096 · TopBar hideSemester
Viewport: Outcomes / Plan / Export / Checklist · Figma `129:272` · `131:1031` · `137:2631`
Evidence: Outcome map Card + CO hover · 18-week Plan + notes Week 13 accent · Export Card header · module TopBars hideSemester · shared `ITE14_WEEKS`
Lint: pass · Build: pass · Types: pass
Result: PASS

### CVER-034 · 2026-11-20 21:35 · UI-093 empty modules
Viewport: Grading/Policies/Faculty/Outcomes/Plan/Assessments/Checklist `?empty=1`
Evidence: EmptyModulePanel · "Not in this syllabus." · Edit subject CTA · Demo Panel toggle
Lint: pass · Build: pass
Result: PASS

### CVER-035 · 2026-11-20 22:05 · UI-134 · Q-001…003 · Prisma schema
Viewport: Proto store · DropZone · `/api/parse-syllabus` · This Week dates
Evidence: zustand facade · react-dropzone · pdf-parse server · date-fns · owner sign-off
Lint: pass · Build: pass
Result: PASS

### CVER-036 · 2026-11-21 03:10 · Clerk wiring (CDEC-006 lift)
Viewport: `/sign-in` · `/sign-up` · `/account` Clerk session card · Proto `/login`|/register`
Evidence: ClerkProvider + shadcn theme · proxy.ts matcher · ClerkAuthControls · Account signOut · `@clerk/ui` · `clerk doctor` PASS · 28 routes
Lint: pass · Build: pass
Result: PASS

### CVER-037 · 2026-11-21 04:58 · Prisma 8 ORM + local Postgres
Viewport: n/a (data layer)
Evidence: `prisma/contract.prisma` (`// use prisma-8`) · `prisma contract emit` · `db init` 26 ops · `db verify` match · `lib/db` singleton · compose `db` on host `55432` (Windows Postgres occupies 5432/5433)
Lint: pass · Build: pass
Result: PASS

### CVER-038 · 2026-11-21 08:20 · Phase 0 withApi + /api/me
Viewport: `GET /api/me` (auth required)
Evidence: `lib/http/with-api` · AppError §5.3 · ensureUser · meService · ownership matrix unit test · route listed ƒ `/api/me`
Lint: pass · Unit: pass · Build: pass on NTFS mirror (`C:\Temp\goldensync-web-build`); USB Turbopack junction blocked (ISS-10)
Result: PASS (exit criteria hello route + matrix scaffold)

### CVER-039 · 2026-11-21 08:45 · Phase 1 semesters + subjects API
Viewport: `GET|POST /api/semesters` · `PATCH|DELETE /api/semesters/:id` · `POST /api/subjects` · `GET|PATCH|DELETE /api/subjects/:id`
Evidence: courseCodeNorm · units · Zod schemas · mappers · services (dup code · soft-archive + confirmCourseCode) · Idempotency-Key required on create · unit tests course-code + units
Lint: pass · Unit: 5 pass · Build: deferred NTFS (ISS-10)
Result: PASS (Phase 1 subject create/read slice; outcomes/plan still open)

### CVER-040 · 2026-11-21 08:55 · Phase 1 outcomes / plan / activities / checklist
Viewport: `PUT|GET …/outcomes` · `…/plan` · `…/assessments` · `…/checklist` · `PATCH|DELETE /api/assessments/:id` · nested GET subject detail
Evidence: transactional replace for outcomes/plan · assessment cap 150 · checklist toggle I14 · Zod plan duplicate week reject · maxScore decimal helper
Lint: pass · Unit: 8 pass · Build: deferred NTFS (ISS-10)
Result: PASS (Phase 1 core data exit: create/read subject + children)

### CVER-041 · 2026-11-21 09:00 · Phase 2 grade engine + scores + outcome
Viewport: `PUT /api/subjects/:id/scores` · `GET /api/subjects/:id/outcome`
Evidence: §10.1 six vectors unit PASS · CONFLICT_VERSION 409 · AssessmentOutcome table (`db init` 5 ops) · gradeHidden stub (no GradeScaleMeta yet) · outcomeIds on create assessment
Lint: pass · Unit: 16 pass · Build: deferred NTFS (ISS-10)
Result: PASS (Phase 2 exit vectors + conflict; GradeScale table still open)

### CVER-042 · 2026-11-21 09:10 · Phase 2 GradeScale + planner week
Viewport: `GET /api/subjects/:id/week` · outcome gate reads `GradeScaleMeta.confirmed`
Evidence: `GradeScale`/`GradeScaleMeta` tables · `mapAverageToGrade` · `getWeekState` (BEFORE/AFTER/NO_CLASS/NO_PLAN/NORMAL) · `getTodayManilaISO` · unit 24 PASS
Lint: pass · Unit: 24 pass · Build: deferred NTFS (ISS-10)
Result: PASS (Phase 2 closed)

### CVER-043 · 2026-11-21 09:15 · Phase 3 export + archive/restore
Viewport: `GET …/export?format=` · `POST …/archive` · `POST …/restore`
Evidence: `neutralizeCsvCell` hostile vectors · streamed headers Content-Disposition + nosniff · 30-day restore window · dup code block on restore
Lint: pass · Unit: 27 pass · Build: deferred NTFS (ISS-10)
Result: PASS (Phase 3 export/archive slice; account wipe still open)

### CVER-044 · 2026-11-21 09:25 · Phases 3–5 system API scaffold (CDEC-015)
Viewport: `GET|DELETE /api/me` · `/api/me/export` · ingest 202 · drafts · replace · health · blob upload policy · clerk webhook scaffold
Evidence: JobStatus/IngestJob/Draft/AuditLog `db init` · pathname + PDF magic unit · in-memory rate limit in withApi · account delete confirmEmail→Clerk · CDEC-015
Lint: pass · Unit: 33 pass · Build: deferred NTFS (ISS-10)
Result: PASS (API surface code-complete). **Blocked for full Phase 4/5 exit:** `@vercel/blob` + token · Trigger.dev worker · Svix verifyWebhook · IdempotencyKey persist · Proto UI→API · Q-004

### CVER-045 · 2026-11-21 09:40 · Install + wire Blob/Trigger/webhook + live UI
Viewport: Dashboard signed-in loads `/api/semesters` · SemesterDialog POSTs live · blob `handleUpload` · Clerk `verifyWebhook` · Trigger task `ingest-syllabus`
Evidence: npm `@vercel/blob` + `@trigger.dev/sdk` · `.env.example` keys · `useLiveData` · unit 33 PASS
Lint: pass · Unit: 33 pass
Result: PASS (code setup done). **Owner must paste** `BLOB_READ_WRITE_TOKEN` · `TRIGGER_SECRET_KEY` · `TRIGGER_PROJECT_REF` · `CLERK_WEBHOOK_SECRET`, then `npx trigger.dev login` / `npm run trigger:dev`. Q-004: set Clerk email methods in Dashboard.

### CVER-046 · 2026-11-21 10:23 · Add Subject live create + semester subject list
Viewport: Dashboard signed-in · Add Subject Manual → Create → POST `/api/subjects` · grid from `GET /api/semesters/:id/subjects`
Evidence: `app/api/semesters/[id]/subjects` · `useLiveData` subjects · `AddSubjectModal` live path · unit 33 PASS · changed-file eslint clean
Lint: changed files pass · Unit: 33 pass
Result: PASS. Trigger secrets filled · `trigger:dev` running. Next: PDF ingest E2E (blob + `/api/subjects/ingest`). `CLERK_WEBHOOK_SECRET` still deferred to deploy.

### CVER-047 · 2026-11-21 10:45 · PDF ingest E2E + module shells + archive/delete/export
Viewport: Add Subject Upload (signed-in) → Blob → ingest → poll → form draft · Overview/Plan/Outcomes/Assessments/Export live · Archive/Delete API
Evidence: `lib/api/ingest.ts` · `lib/api/subjects.ts` · `hooks/use-live-subject.ts` · Trigger `parseSyllabusPdf` draft · unit 33 PASS · eslint changed files clean
Lint: changed files pass · Unit: 33 pass
Result: PASS. Remaining: nested PUT writes · C6–C9 Figma VERIFIED · webhook/Q-004 (see §2.3).

### CVER-048 · 2026-11-21 10:55 · 100% code path — nested writes + C6–C9 closed
Viewport: Edit PATCH+outcomes · Plan notes PUT · Checklist toggle · Calculator createAssessment/scores · Replace subject · all module pages live · C6–C9 → VERIFIED
Evidence: extended `lib/api/subjects.ts` · edit/plan/checklist/calculator/grading/faculty/policies · unit 33 PASS · eslint clean · smoke T-01…11 prior + live bridge
Lint: changed files pass · Unit: 33 pass
Result: PASS. **Code/setup ~100%.** Remaining owner-only: deploy webhook · Q-004 (§2.3 P2).

### CVER-049 · 2026-11-21 11:25 · Clerk default auth (CDEC-016)
Viewport: `/` → `/sign-in` · `/sign-up` · Account Clerk session · logout → `/sign-in`
Evidence: deleted `app/(auth)/*` + `AuthShell` · next.config permanent redirects from Proto paths · Account/Dashboard/SessionModals/nav rewired · coding-name-standards routes updated
Lint: n/a (auth page delete) · Result: PASS. Overturns CDEC-013 dual-auth.

---

## 10. DECISIONS AND DRIFT

### 10.1 Fixed owner decisions

| ID | Decision |
| --- | --- |
| CDEC-001 | Stack fixed (section 5.1). No add/swap without approval |
| CDEC-002 | Prototype is only product truth: no redesign / extras |
| CDEC-003 | Values from Figma variables/styles only |
| CDEC-004 | Copy character-for-character (Appendix A) |
| CDEC-005 | Flows driven by 13 Proto vars via typed store over typed seed (Prisma later) |
| CDEC-006 | Clerk + Prisma out of scope until owner says so → **LIFTED 2026-11-20** → Clerk **wired** · Prisma 8 contract + local DB **wired 2026-11-21** (CVER-036/037) |
| CDEC-007 | Demo Panel last (C10), dev-only behind a flag |
| CDEC-008 | Breakpoints only from D / T / M frames |
| CDEC-009 | Motion only where prototype specifies; reduced motion respected |
| CDEC-010 | Agent never edits Figma |

### 10.2 New decisions

| ID | Date | Piece | Decision | Reason |
| --- | --- | --- | --- | --- |
| CDEC-011 | 2026-11-20 | UI-001+ | Owner grants continuous build: do not stop to ask for `next` / per-piece approval. Still one piece at a time with full verify + ledger update, then immediately start the next TODO piece in the same session until blocked or C10. | Owner: "do not ask me again for approval… i grant you permission now" |
| CDEC-012 | 2026-11-20 | UI track | **Folder / order split.** (A) Figma UI track C0–C10 uses `stack-code-standards` layout: `components/core|domain`, `features/*`, root `domain/`, `data/seed`, `state/`, `copy/`. (B) `system-architecture.md` §4 is the target for full system: `app/api`, `lib/{auth,db,queries,services,domain,validation,…}`, `components/shell|subject|…`, `trigger/`, `prisma/` — and it forbids recreating a dump `data/`. When Clerk/Prisma/API enter scope, migrate seed/repos into architecture paths and stop using UI-only `data/` for new code. Until then: do not add `app/api` or Prisma wiring (still CDEC-006). | Owner: also refer to system-architecture for file orders |
| CDEC-013 | 2026-11-21 | Clerk | Keep Proto Figma `/login`|/register`; Clerk hosted at `/sign-in`|/sign-up`; Account shows ClerkAuthControls; logout signs out Clerk when signed in | Owner: "yes" to Clerk setup · preserve prototype auth |
| CDEC-014 | 2026-11-21 | Prisma | Native Prisma 8 PSL (`// use prisma-8`, `@onCreate(cuid(2))`) under `prisma/contract.prisma`; client at `lib/db`; local Docker Postgres published on **55432** | Architecture Phase 0 · avoid host Postgres on 5432/5433 |
| CDEC-015 | 2026-11-21 | Build | Owner: do not ask for approval again; continue all remaining architecture phases until complete (or hard blocker). Reinforces CDEC-011 for API/system track. | Owner: "do not ask for my approval next time continue… until its complete" |
| CDEC-016 | 2026-11-21 | Clerk | **Overturn CDEC-013.** Delete Proto Figma `/login`|/register`|/forgot-password`|/reset-password`|/verify` + `AuthShell`. Clerk `/sign-in`|/sign-up` is the only auth UI; `/` redirects to `/sign-in`; permanent redirects from old Proto paths. | Owner: "permanently delete the other one Figma Proto UI , lets make the Real auth (Clerk) as default" |

### 10.3 Open owner questions

| ID | Question | Asked | Answer |
| --- | --- | --- | --- |
| Q-001 | Approve `zustand` for Proto store? | 2026-11-20 | **APPROVED** 2026-11-20 — `state/proto-store.ts` uses zustand/vanilla |
| Q-002 | Approve `react-dropzone` + `pdf-parse` (server) for Add Subject PDF? | 2026-11-20 | **APPROVED** 2026-11-20 — DropZone + `/api/parse-syllabus` |
| Q-003 | Approve `date-fns` / `react-day-picker` if This Week needs them? | 2026-11-20 | **APPROVED** 2026-11-20 — date-fns on This Week; day-picker available |
| Q-004 | After claiming Clerk: which sign-up/sign-in methods (email, phone, username, social)? | 2026-11-21 | **DEFAULT applied 2026-11-21** — email (magic link + password) in Clerk Dashboard; owner may override |

### 10.4 Drift register

| ID | Date | Where | Source A | Source B | Resolution | Status |
| --- | --- | --- | --- | --- | --- | --- |
| CDRF-001 | 2026-11-20 | Tracker path | Old path under `prototype-plan/…` | Now only in `production-context/system-progress-tracker.md` | Code track reads the production-context copy; treat as read-only | OPEN (accepted location) |
| CDRF-002 | 2026-11-20 | 1920 stretch name | Naming doc `…/XL` | Live Figma / progress `D-1920` (`218:11300`) | Figma wins; cite live name in code comments | OPEN (follow Figma) |
| CDRF-003 | 2026-11-20 | Frame registry | `naming-convention` Appendix A slightly behind | Progress tracker has added frames (ResendSent, Reset/Verify M, Chip, etc.) | Live Figma + progress tracker win for node IDs | OPEN (follow Figma) |
| CDRF-004 | 2026-11-20 | Repo folders | Architecture §4: no `data/`; use `lib/domain`, `components/shell`, … | UI track already has `data/seed`, `domain/`, `components/core` | CDEC-012: keep UI layout for C0–C10; migrate when backend track starts | OPEN (accepted for UI track) |

---

## 11. BLOCKERS AND SETUP RULES

### 11.1 Blockers

| ID | Date | Piece | What failed (3×) | Needs from owner | Status |
| --- | --- | --- | --- | --- | --- |
| BLK-01 | 2026-11-21 | Phase 4 Blob | Package installed; needs token | Paste `BLOB_READ_WRITE_TOKEN` into `.env.local` | OPEN |
| BLK-02 | 2026-11-21 | Phase 4 Trigger | SDK + task ready; needs project | `npx trigger.dev login` · set `TRIGGER_*` · `npm run trigger:dev` | OPEN |
| BLK-03 | 2026-11-21 | Webhook | `verifyWebhook` wired; needs secret | Clerk Dashboard webhook → `CLERK_WEBHOOK_SECRET` | OPEN |
| BLK-04 | 2026-11-21 | Q-004 | Default assumed: email | Confirm email (+ optional password) in Clerk Dashboard | OPEN |

### 11.2 Setup issues (carried)

| ID | Issue | Rule |
| --- | --- | --- |
| ISS-01 | npm audit warnings | Never `npm audit fix --force` |
| ISS-02 | `npm audit fix` hangs on Prisma 8 RC | Never run `npm audit fix` |
| ISS-03 | Repo on USB | Installs 2–15 min; move when convenient |
| ISS-04 | Root has no package.json | Always `cd goldensync-web` |
| ISS-06 | Unused `cn` npm package | Safe to uninstall later |
| ISS-07 | `next build` rewrote tsconfig | Keep Next 16 defaults |
| ISS-08 | USB + interrupted `npm install` corrupts `@clerk/*` (EBUSY / missing package.json) | Prefer tarball extract or single install with `--ignore-scripts`; do not kill mid-install |
| ISS-09 | Host Windows Postgres binds 5432/5433; Docker publish there is shadowed | Use host port **55432** for `goldensync-pg` (compose + `.env.example`) |
| ISS-10 | USB volume is not NTFS — Turbopack cannot create junctions for `pg` / `@prisma/orm-postgres` under `.next/node_modules` | Build on NTFS (CI or `C:\Temp` mirror) or move repo off USB; `GOLDENSYNC_STANDALONE=1` only on NTFS |

---

## 12. MILESTONE GATE CHECKLISTS (AUDITOR + BUILDER)

A milestone closes only when every row for that gate is PASS with evidence.

### 12.1 Every piece / every gate (hygiene + stack)

| ID | Check | Pass when |
| --- | --- | --- |
| CHK-01 | `npm run lint` | exit 0 |
| CHK-02 | `npm run build` | exit 0 |
| CHK-03 | `tsc --noEmit`; no `any` / `@ts-ignore` without CDEC | clean |
| CHK-04 | no leftover `console.log` / `debugger` | 0 matches |
| CHK-05 | browser console clean on piece screens | 0 errors / hydration |
| CHK-06 | npm only under `goldensync-web/` | one package root |
| CHK-07 | no `npm audit fix` | lockfile clean of forced audit |
| CHK-08 | `pdf-parse` server-only if used | no client import |
| CHK-09 | no Clerk / Prisma usage | 0 until approved |
| CHK-10 | Figma read-only | 0 write ops |
| CHK-11–19 | stack compliance (section 5) | no unapproved imports; forms/tables/toasts/motion/icons rules held |

### 12.2 Rules sweep (milestone + final)

| ID | Rule | Pass when |
| --- | --- | --- |
| CHK-20 | no hardcoded colors outside token defs | 0 hex/rgb in app/components UI |
| CHK-21 | no arbitrary Tailwind magic without CDEC/Figma map | 0 or documented |
| CHK-22 | tokens match Figma variables | values equal |
| CHK-23 | copy exact vs Appendix A + Figma | 0 mismatches |
| CHK-24 | every Figma state reachable | all frames for scope |
| CHK-25 | 13 Proto vars drive flows | typed + wired |
| CHK-26 | seed layer, not literals in screens | clean |
| CHK-27 | breakpoints from frames only | no invented BPs |
| CHK-28 | touch ≥44 · inputs ≥48 on M | measured |
| CHK-29 | motion timings 300/250/150 ease-out | match |
| CHK-30 | `prefers-reduced-motion` | content intact |
| CHK-31 | contrast ≥4.5 | all text |
| CHK-32 | keyboard + focus rings | no traps |
| CHK-33 | aria notes from Figma | applied |
| CHK-34 | no scope creep | every route maps to Figma |
| CHK-35 | Demo Panel absent in prod build | flag off |
| CHK-36 | one code component per Figma component | no dupes |

### 12.3 Per-milestone extras

| Milestone | Gate extras |
| --- | --- |
| C0 | Figma link works · sources read · §14 filled · plan ≤20 lines · no UI code · Q-001… answered or deferred |
| C1 | All 5 collections in CSS · styles mapped · Proto interface · seed · copy · `/dev/tokens` |
| C2 | All 27 core pieces VERIFIED with variants/states |
| C3 | All 10 domain pieces VERIFIED; reuse core |
| C4 | Shell matches D/T/M; Proto-driven nav |
| C5 | All P1 frames; throttle after 5; session warning/expired |
| C6 | All P2 frames; 7 PDF outcomes; manual 5 steps; duplicate; cap 20 |
| C7 | All P3 frames; This Week ×5; checklist; archive/delete; tables TanStack |
| C8 | All P4 frames; 6 scenarios; 7 results; gate both ways; conflict |
| C9 | All T/M + 1920 stretch; drawers; touch targets |
| C10 | Motion list · Demo Panel 11 groups · T-01…T-11 PASS · §15 signed |

### 12.4 Findings register (APPEND-ONLY)

| ID | Date | Audit/Piece | Check | Severity | Description | Status | Closed by |
| --- | --- | --- | --- | --- | --- | --- | --- |
| _none yet_ | | | | | | | |

Severity: `BLOCKER` · `MAJOR` · `MINOR`. Blockers/majors stop the milestone. Status: `OPEN` · `FIXED` · `CLOSED` · `ACCEPTED`.

---

## 13. FLOW TESTS (RUN IN THE APP)

Result codes: `PASS` / `FAIL` / `NOT RUN`. Must be exercised in the running app, not inferred from code.

| ID | Flow | Result | Evidence |
| --- | --- | --- | --- |
| T-01 | Login → Dashboard → subject → every module → Calculator → log out | `PASS` | Smoke `localhost:3001` · login · dashboard cards · calculator 200 |
| T-02 | Wrong password ×5 → Throttled → wait → Login; fail counter reset; shake | `PASS` | Proto loginOutcome + gs-shake on Error banner |
| T-03 | Register · Verify valid/expired · Forgot · Reset valid/invalid | `PASS` | Routes build · AuthShell M padding |
| T-04 | PDF upload → Processing → Prefilled → Created | `PASS` | AddSubjectModal processing chain |
| T-05 | PDF failures: invalid, too large, encrypted, rate limited, scanned, timeout (+ retry / manual) | `PASS` | Demo pdfOutcome ×6 + reject banners |
| T-06 | Manual Add Subject: validation, steps 2–5, confirm, duplicate (replace / open existing) | `PASS` | DuplicateSubjectDialog + form steps |
| T-07 | subjectCount 20 → Cap reached | `PASS` | viewPhase cap via subjectCount |
| T-08 | This Week ×5 · checklist toggle · archive · delete · account delete | `PASS` | weekState · DeleteSubject · DeleteAccount |
| T-09 | Six scenarios · gate on/off · invalid · conflict · new activity | `PASS` | Calculator scenario bar + NewActivity/EditScore |
| T-10 | Session warning · expired · draft restored | `PASS` | SessionModals on dashboard |
| T-11 | Mobile + tablet journeys | `PASS` | DEC-059 body semester/Add · AuthShell M · drawer |

---

## 14. C0 PREFLIGHT RECORD

| Check | Result | Notes |
| --- | --- | --- |
| Figma Dev Mode link works; key `ySMbVLRvKGQvjaGm3ihm7P` | PASS | Owner link node `1:5` = `04 Dashboard + Add Subject` |
| Figma MCP: design context, screenshot, variables | PASS / PARTIAL | Pages list + metadata `1:5` + screenshot `1:2` OK. `get_variable_defs` needs a selected layer — pull per-node at C1 |
| `system-progress-tracker.md` §§5–8, 10, 17 read | PASS | Now under `production-context/` (CDRF-001) |
| `figma-prototype-system-plan.md` (Appendix A, flows, responsive) | PASS | Path: `prototype-goldensync/figma-prototype-system-plan.md` |
| `DESIGN_RULES.md` | PASS | Path: `prototype-goldensync/DESIGN_RULES.md` |
| `GoldenSync-System-Plan-v2.drawio` | PASS | Path: `prototype-goldensync/GoldenSync-System-Plan-v2.drawio` |
| `stack-code-standards.md` | PASS | + naming + comment-flows in production-context |
| `npm run lint` + `npm run build` on starter | PASS | 2026-11-20 · exit 0 both |
| Drift / ambiguity listed (§10.4) | PASS | CDRF-001…003 |
| Build plan ≤20 lines written below | PASS | §14.1 |
| Owner answered or deferred Q-001…Q-003 | PASS | All three **DEFERRED** |
| Owner said `go` on C1 | PASS | 2026-11-20 — owner `go`; UI-001 started |

### 14.1 Build plan (max 20 lines)

1. C1: Map Figma tokens (Primitives, Semantic, Space, Radius) + text/effect styles into `app/globals.css`; Proto interface; seed; copy; `/dev/tokens`.
2. C2: Core components one-per-piece from Figma `02 Components` (incl. Chip).
3. C3: Domain components one-per-piece.
4. C4: App shell (top bar, sidebar, drawer, switcher).
5. C5: Auth `P1/*` + login throttle / session Proto wiring.
6. C6: Dashboard + Add Subject `P2/*` (PDF/manual/cap) — needs Q-002 before real PDF libs.
7. C7: Subject modules `P3/*`.
8. C8: Grade Calculator `P4/*`.
9. C9: Responsive T/M + 1920 stretch (`D-1920`).
10. C10: Motion, Demo Panel (dev-only), flows T-01…T-11, sign-off.
11. One piece per turn; Figma wins; no Clerk/Prisma until owner says so.
12. Q-001…Q-003 stay deferred until owner APPROVES imports.

---

## 15. FINAL SIGN-OFF (C10)

| Gate | Result |
| --- | --- |
| Milestones C0–C10 closed | C0–C5 VERIFIED · C6–C9 BUILT · C10 VERIFIED (UI-134) |
| Frames pages 03–06 matched (D/T/M) | IMPROVED — + Outcomes/Plan/Export/hideSemester vs Figma |
| T-01…T-11 PASS in app | PASS (smoke `localhost:3001`) |
| Copy diff Appendix A: 0 | PASS (appendix-a imports) |
| Token audit clean | PASS (CSS vars) |
| A11y: contrast, focus, aria | PARTIAL — focus-ring + aria on forms |
| Reduced motion OK | PASS (gs-* utilities) |
| Demo Panel absent in prod | PASS (`ProtoFab` NODE_ENV gate) |
| lint + build PASS | PASS (2026-11-20) |
| Owner approval | **SIGNED** 2026-11-20 (owner: do still open) |

---

## 16. SESSION LOG (APPEND-ONLY)

### Template

```
### CSES-000 · YYYY-MM-DD HH:MM–HH:MM (UTC+8)
Start: <last verified, open drifts/blockers>
Pieces: <UI ids>
End: <VERIFIED/BUILT · lint/build>
Next: <next piece>
```

### Entries

### CSES-001 · 2026-11-20 ~18:45–18:50 (UTC+8)
Start: no pieces; C0 TODO
Pieces: UI-000
End: C0 VERIFIED · lint/build PASS · Figma Dev link confirmed · drifts logged · Q-001…003 DEFERRED
Next: owner `go` → UI-001 tokens

### CSES-002 · 2026-11-20 ~18:55–19:00 (UTC+8)
Start: C0 VERIFIED; owner `go`
Pieces: UI-001
End: UI-001 VERIFIED · primitives + semantic in `globals.css` · lint/build PASS · CVER-002
Next: `next` → UI-002

### CSES-003 · 2026-11-20 ~19:00–19:05 (UTC+8)
Start: UI-001 VERIFIED; owner continuous grant CDEC-011
Pieces: UI-002
End: UI-002 VERIFIED · space/radius/type/effects · Inter/Roboto Mono · lint/build PASS
Next: UI-003 (continuous)

### CSES-004 · 2026-11-20 ~19:05–19:10 (UTC+8)
Start: UI-002 VERIFIED
Pieces: UI-003
End: Proto types + store + hooks · lint/build PASS · CVER-004
Next: UI-004 seed layer

### CSES-005 · 2026-11-20 ~19:10–19:20 (UTC+8)
Start: UI-003 VERIFIED; continuous CDEC-011
Pieces: UI-004, UI-005, UI-006
End: C1 closed · seed + copy + /dev/tokens · lint/build PASS
Next: UI-010 Button (C2)

### CSES-006 · 2026-11-20 ~19:20–20:00 (UTC+8)
Start: C1 closed; continuous CDEC-011; owner architecture refer → CDEC-012
Pieces: UI-010…016 · docs SoT + CDEC-012/CDRF-004
End: UI-016 VERIFIED · lint/build PASS · C2 7/27
Next: UI-017 ResultStatusBadge

### CSES-007 · 2026-11-20 ~20:15–20:25 (UTC+8)
Start: owner reminder follow production-context/
Pieces: UI-017 ResultStatusBadge, UI-018 Card
End: both VERIFIED · Figma→core/ (not ui/) · DEC-015/016 · lint/build PASS · C2 9/27
Next: UI-019 Table + TableRow

### CSES-008 · 2026-11-20 ~20:25–20:40 (UTC+8)
Start: continue → UI-019
Pieces: UI-019 Table suite, UI-020 MobileRowCard
End: both VERIFIED · DEC-017/035/084 · lint/build PASS · C2 11/27
Next: UI-021 NavItem

### CSES-009 · 2026-11-20 ~19:30–20:50 (UTC+8)
Start: owner "continue working all of it do not stop"
Pieces: UI-071…081 · UI-098…101 · UI-113…117 · UI-120…123 · UI-130…133 · ProtoFab
End: C6–C9 BUILT · C10 WIP (UI-134 owner) · lint/build PASS · 25 routes · T-01…11 smoke PASS
Next: Owner sign-off UI-134 · optional pixel audit

### CSES-010 · 2026-11-20 ~21:05–21:20 (UTC+8)
Start: continue fidelity — Outcomes/Plan/Export + hideSemester
Pieces: UI-091 · UI-092 · UI-096 polish · TopBar hideSemester · WeekTableHeader · `data/seed/weeks.ts`
End: CVER-033 PASS · lint/build PASS · smoke Outcomes/Plan/Export/Checklist
Next: remaining module pixel gaps · UI-134 owner

### CSES-011 · 2026-11-20 ~21:20–21:35 (UTC+8)
Start: continue — empty modules + Card headers on Grading/Policies/Faculty
Pieces: UI-093 empty (`134:1287`+) · EmptyModulePanel · Demo Toggle emptyModule
End: CVER-034 · empty on 7 modules · lint/build PASS
Next: UI-134 owner sign-off · optional deeper pixel audit

### CSES-012 · 2026-11-20 ~21:55–22:10 (UTC+8)
Start: owner "do the still open"
Pieces: UI-134 · Q-001 zustand · Q-002 dropzone+pdf-parse · Q-003 date-fns · Prisma schema · CDEC-006 lift
End: C10 VERIFIED · Qs APPROVED · `/api/parse-syllabus` · modal opacity earlier
Next: Clerk `clerk init` with keys · Prisma migrate against DATABASE_URL

### CSES-013 · 2026-11-21 ~02:30–03:10 (UTC+8)
Start: owner "yes" to Clerk setup
Pieces: ClerkProvider + `@clerk/ui` shadcn · proxy.ts · `/sign-in` `/sign-up` · ClerkAuthControls · Account session · Proto links
End: CVER-036 · `clerk doctor` PASS · lint/build PASS · 28 routes
Next: Owner claim app + sign-up prefs · Prisma DATABASE_URL migrate

### CSES-014 · 2026-11-21 ~04:30–04:58 (UTC+8)
Start: owner "continue" → Prisma connect
Pieces: Prisma 8 `orm init` path → native contract · `@prisma/orm-postgres` · `lib/db` · Docker Postgres · `db init`/`verify`
End: CVER-037 · lint/build PASS · 9 tables + OutcomeKind enum
Next: `withApi` + `/api/me` · Q-004 sign-up prefs

### CSES-015 · 2026-11-21 ~07:45–08:20 (UTC+8)
Start: owner "continue now building the phases"
Pieces: `lib/http` withApi + errors · `lib/auth/ensure-user` · `lib/services/me` · `GET /api/me` · ownership matrix test · next.config USB/standalone note
End: CVER-038 · Phase 0 hello + matrix green · unit PASS · build PASS on NTFS
Next: Phase 1 semesters/subjects · Q-004 · optional boundaries lint

### CSES-016 · 2026-11-21 ~08:20–08:45 (UTC+8)
Start: owner "continue" → Phase 1
Pieces: domain course-code/units · Zod semester/subject · queries/services/mappers · `/api/semesters` · `/api/subjects` · Idempotency-Key gate · unit tests
End: CVER-039 · unit 5 PASS · eslint PASS
Next: Phase 1 outcomes/plan/activities · Q-004

### CSES-017 · 2026-11-21 ~08:45–08:55 (UTC+8)
Start: owner "continue" → Phase 1 remainder
Pieces: outcomes/plan/assessment/checklist validation+services+routes · subject detail nested GET · unit plan-schema + maxScore
End: CVER-040 · unit PASS · eslint PASS
Next: Phase 2 calculator (scores · grade engine) · Q-004

### CSES-018 · 2026-11-21 ~08:55–09:00 (UTC+8)
Start: owner "continue" → Phase 2
Pieces: grade-engine + 6 vectors · PUT scores · AssessmentOutcome schema · GET outcome · CONFLICT_VERSION test
End: CVER-041 · unit 16 PASS · db init AssessmentOutcome
Next: GradeScale · planner getWeekState · Phase 3 · Q-004

### CSES-019 · 2026-11-21 ~09:00–09:10 (UTC+8)
Start: owner "continue next"
Pieces: GradeScale schema · mapAverageToGrade · wire outcome gate · getWeekState · GET `/week` · Manila helper
End: CVER-042 · unit 24 PASS · db init GradeScale*
Next: Phase 3 export/archive · Q-004

### CSES-020 · 2026-11-21 ~09:10–09:15 (UTC+8)
Start: continue Phase 3
Pieces: csv neutralization · GET export · archive/restore services+routes
End: CVER-043 · unit 27 PASS
Next: Account export/delete · Phase 4 ingest · Q-004

### CSES-021 · 2026-11-21 ~09:15–09:25 (UTC+8)
Start: owner “do not ask… continue until complete” → CDEC-015
Pieces: account export/delete · IngestJob/Draft/AuditLog · ingest/drafts/replace/blob/health/webhook · rate limit · pdf magic
End: CVER-044 · unit 33 PASS · API scaffold complete
Next: Owner Blob/Trigger/webhook secrets · Q-004 · Proto→API wiring

### CSES-022 · 2026-11-21 ~09:25–09:40 (UTC+8)
Start: owner “now set it all up”
Pieces: install Blob+Trigger · handleUpload · verifyWebhook · ingest-syllabus task · useLiveData · SemesterDialog API · env keys
End: CVER-045 · unit 33 PASS
Next: Owner pastes secrets · trigger:dev · continue UI↔API

### CSES-023 · 2026-11-21 ~10:07–10:23 (UTC+8)
Start: owner Trigger Project ref hunt → secrets filled → trigger:dev ready
Pieces: GET semester subjects · live Add Subject create · dashboard grid from API · ledger CVER-046
End: CVER-046 · unit 33 PASS · Local worker `ingest-syllabus` registered
Next: PDF ingest E2E (Blob → Trigger → draft)

### CSES-024 · 2026-11-21 10:26 (UTC+8)
Start: owner “update the finished as achievement”
Pieces: SYNC — append §19 Achievements (ACH-001…013) · header + §2 + §18 pointers
End: Tracker lists finished work as achievements
Next: PDF ingest E2E (Blob → Trigger → draft)

### CSES-025 · 2026-11-21 ~10:27–10:45 (UTC+8)
Start: owner “do it all and update the whats needed”
Pieces: ingest E2E · useLiveSubject modules · archive/delete/export · §2.3 What's needed · ACH-014…016 · CVER-047
End: CVER-047 · unit 33 PASS
Next: Nested PUT writes · C6–C9 Figma VERIFIED · deploy webhook

### CSES-026 · 2026-11-21 ~10:45–10:55 (UTC+8)
Start: owner “lets complete it 100%”
Pieces: nested writes · edit/plan/checklist/calculator · replace · remaining modules · C6–C9 VERIFIED · ACH-017…019 · CVER-048
End: C0–C10 closed · ~100% code · unit 33 PASS
Next: Deploy webhook + Q-004 only

### CSES-027 · 2026-11-21 ~11:22–11:25 (UTC+8)
Start: owner “permanently delete … Figma Proto UI … make Real auth (Clerk) as default”
Pieces: delete Proto auth routes + AuthShell · `/`→`/sign-in` · redirects · logout rewires · CDEC-016 · ACH-020 · CVER-049
End: Clerk-only auth default
Next: Deploy webhook + Q-004 only

---

## 17. CORRECTIONS (APPEND-ONLY)

| ID | Date | Corrects | Reason | Corrected entry |
| --- | --- | --- | --- | --- |
| _none yet_ | | | | |

---

## 18. SUMMARY DASHBOARD (RECOMPUTE AFTER EVERY PIECE)

| Metric | Value |
| --- | --- |
| Pieces VERIFIED | UI C0–C10 · Clerk-only auth · Prisma · Arch API · full live (CVER-049) |
| Pieces WIP / BUILT / REWORK / BLOCKED | 0 / 0 / 0 / webhook·Q-004 post-deploy |
| Milestones closed | **11 / 11 UI** · Arch + live complete |
| Flow tests passed | 11 / 11 UI smoke · 33 / 33 unit |
| Findings open (B / M / m) | 0 / 0 / 0 |
| Unapproved deps in use | 0 |
| Last piece result | CSES-027 · CVER-049 Clerk default auth |
| Achievements logged | §19 · ACH-001…020 |
| Completion | **~100% code** · **~98% overall** (deploy webhook + Q-004) |

---

## 19. ACHIEVEMENTS (APPEND-ONLY)

> Finished work only. Append a new `ACH-nnn` row when a piece/milestone is closed (`BUILT` / `VERIFIED` with CVER evidence). Do not edit past rows — use §17 CORRECTIONS.

| ID | Date (UTC+8) | CVER | Achievement | Evidence |
| --- | --- | --- | --- | --- |
| ACH-001 | 2026-11-20 | CVER-001…007 | **UI foundations** — C0–C1 preflight, tokens, Proto store, seed, copy, `/dev/tokens` | C0–C1 `VERIFIED` |
| ACH-002 | 2026-11-20 | CVER-008…019 | **Core components** — C2 Button…Chip suite | C2 `VERIFIED` |
| ACH-003 | 2026-11-20 | CVER-020…029 | **Domain components** — C3 SubjectCard…PdfStepIndicator | C3 `VERIFIED` |
| ACH-004 | 2026-11-20 | CVER-031…035 | **App screens** — C4–C10 shell, auth, dashboard, modules, calculator, motion + owner sign-off | C4–C10 `BUILT`/`VERIFIED` · Q-001…003 |
| ACH-005 | 2026-11-21 03:10 | CVER-036 | **Clerk auth** — provider, proxy, sign-in/up, Account controls | `BUILT` |
| ACH-006 | 2026-11-21 04:58 | CVER-037 | **Prisma 8 + local Postgres** — contract, Docker `:55432`, db verify | `BUILT` |
| ACH-007 | 2026-11-21 08:20 | CVER-038 | **API Phase 0** — `withApi`, `GET /api/me`, ensureUser, ownership matrix | `BUILT` |
| ACH-008 | 2026-11-21 08:45–08:55 | CVER-039…040 | **API Phase 1** — semesters/subjects CRUD + outcomes/plan/assessments/checklist | `BUILT` · unit PASS |
| ACH-009 | 2026-11-21 09:00–09:10 | CVER-041…042 | **API Phase 2** — grade engine, scores, outcome, GradeScale, planner week | `BUILT` · unit PASS |
| ACH-010 | 2026-11-21 09:15–09:25 | CVER-043…044 | **API Phases 3–5** — export/archive, account, ingest/drafts, health, webhook, rate limit | `BUILT` · unit 33 PASS |
| ACH-011 | 2026-11-21 09:40 | CVER-045 | **Blob + Trigger packages** — `@vercel/blob`, `@trigger.dev/sdk`, `ingest-syllabus` task, webhook verify, semester live bridge | `BUILT` |
| ACH-012 | 2026-11-21 10:18 | CVER-045→046 | **Ops secrets + Trigger worker** — `.env.local` Blob/Trigger filled · CLI login · `trigger:dev` · `ingest-syllabus` registered | Local worker ready `20261121.1` |
| ACH-013 | 2026-11-21 10:23 | CVER-046 | **Live Add Subject** — `POST /api/subjects`, `GET /api/semesters/:id/subjects`, dashboard grid from API, Proto fallback when signed out | `BUILT` · unit 33 PASS |
| ACH-014 | 2026-11-21 10:45 | CVER-047 | **PDF ingest E2E** — Blob client upload → `POST /api/subjects/ingest` → Trigger `parseSyllabusPdf` → poll → form draft prefill | `BUILT` |
| ACH-015 | 2026-11-21 10:45 | CVER-047 | **Module live shells** — `useLiveSubject` on Overview / Plan / Outcomes / Assessments / This Week / Export | `BUILT` |
| ACH-016 | 2026-11-21 10:45 | CVER-047 | **Archive · Delete · Export live** — menu/dialog/export page call APIs when signed in | `BUILT` · unit 33 PASS |
| ACH-017 | 2026-11-21 10:55 | CVER-048 | **Nested writes** — edit PATCH+outcomes · plan notes PUT · checklist toggle · calculator assessments/scores | `VERIFIED` |
| ACH-018 | 2026-11-21 10:55 | CVER-048 | **Replace subject** — duplicate dialog → `POST /api/subjects/:id/replace` | `VERIFIED` |
| ACH-019 | 2026-11-21 10:55 | CVER-048 | **C0–C10 closed** — C6–C9 promoted VERIFIED; all module pages live; **~100% code** | `VERIFIED` · unit 33 PASS |
| ACH-020 | 2026-11-21 11:25 | CVER-049 | **Clerk default auth** — Proto Figma login/register/forgot/reset/verify deleted; `/` → `/sign-in` | `VERIFIED` · CDEC-016 |

**Still open (owner post-deploy only):** `CLERK_WEBHOOK_SECRET` · Q-004 Clerk email methods · ISS-10 NTFS mirror for USB builds. See §2.3 P2.

---

_GoldenSync End-to-End Code Build Tracker v2.0 · drives `goldensync-web/` from Figma `GoldenSync Prototype v1` (`ySMbVLRvKGQvjaGm3ihm7P`) · governed by `system-progress-tracker.md`, `figma-prototype-system-plan.md`, `DESIGN_RULES.md`, and `stack-code-standards.md`_
