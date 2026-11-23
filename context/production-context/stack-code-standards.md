# GOLDENSYNC: STACK AND CODE STANDARDS

> The engineering standard for every line of code in `goldensync-web/`.
> Written for a senior engineer with 30 years of experience: reusable, predictable, low-bug, object-oriented where it pays off, and built for a system that will grow past 500 users.
> Read this file at the start of every session, together with the canonical build tracker `goldensync-checker-code.md` (v2.0 end-to-end ledger; gates live in its section 12), `coding-name-standards.md` (production code names), `comment-flows-info.md` (function and flow comments for owner edits), and `system-architecture.md` §4 (full-system folder layout and dependency boundaries — see tracker CDEC-012 for UI-track vs architecture split).

| Field   | Value |
| ------- | --- |
| Version | 1.0 |
| Created | 2026-11-20 |
| Applies to | `goldensync-web/` (Next.js App Router) |

---

## 0. PRECEDENCE (READ FIRST)

1. **The Figma prototype wins.** It is the only source of truth for layout, copy, states, logic and motion. These standards decide **how** the code is written, never **what** is built. Nothing here permits a redesign, an extra feature, or a "nicer" interaction.
2. **The stack is fixed** (section 1). Do not add, swap or upgrade libraries without asking the owner.
3. **Where a standard conflicts with the prototype**, follow the prototype, log a `CDEC` in `goldensync-checker-code.md`, and move on.
4. **When unsure, stop and ask.** A wrong guess costs more than one question.

---

## 1. STACK CONTRACT (FIXED)

Do not swap or add libraries without asking the owner.

| Layer | Library | Rule of use |
| --- | --- | --- |
| Framework | Next.js, App Router | Server Components by default. Client Components only where needed (section 7) |
| Language | TypeScript, React with JSX (TSX files) | `strict` mode, no `any` (section 6) |
| Styling | Tailwind CSS 4 | CSS-first theme in `app/globals.css`. Tokens only (section 8) |
| Components | shadcn (`base-nova` style, built on Base UI) | Primitive layer. Customize through tokens and variants, not by forking behavior (section 9) |
| Animation components | Magic UI | Only where the prototype uses it, mapped to a Figma node |
| Icons | `lucide-react` | Same family as the prototype. Names match the prototype icons |
| Forms | `react-hook-form` + `zod` | Every form with validation (section 10) |
| Tables | TanStack Table | Checklist, scores and assessments (section 11) |
| Motion | `motion` (plus Magic UI where needed) | Only where the prototype has motion (section 12) |
| Toasts | `sonner` | All toasts |
| Theme | `next-themes` | Dark UI |

### 1.1 Needs the owner's decision before any use

These are installed in the project but are **not** in the owner's stack list. Do not import them until the owner records APPROVED in the tracker. Until then, write the code against an interface (section 5 and 14) so the choice can be made later without rewriting screens.

| Item | Needed for | Interim rule |
| --- | --- | --- |
| Global state library (zustand is installed) | The 13 Proto variables and cross-screen state | Define the typed store interface and hooks first (section 13). Implement with the approved option |
| PDF upload / parsing libraries (`react-dropzone`, `pdf-parse`) | Add Subject via PDF | Build the upload UI against a `SyllabusParser` interface. Parsing code is server-only |
| Dates and calendar helpers (`date-fns`, `react-day-picker`) | Dates, This Week logic | Use native `Intl` and `Date` unless approved |
| Command menu (`cmdk`) | Only if a prototype frame has one | Not used otherwise |
| `animejs`, `react-bootstrap-icons` | Nothing in the stack | Do not use |
| `@clerk/nextjs`, `prisma` | Auth and database | Out of scope until the owner says so. Code to interfaces (section 14) |

### 1.2 Project rules (from the setup ledger)

- Run npm commands only from `goldensync-web/`.
- Never run `npm audit fix` (especially not `--force`).
- `pdf-parse` runs only in server code.
- The repo is on a slow USB drive. Do not run installs or full rebuilds without a reason.

---

## 2. ENGINEERING PRINCIPLES

| Principle | What it means here |
| --- | --- |
| **Single source of truth** | One token set (Figma variables), one copy file, one seed layer, one place per rule. No duplicated constants |
| **Make illegal states unrepresentable** | Use discriminated unions and state machines, not boolean piles (`isLoading && !isError && data`) |
| **Separation of concerns** | UI renders. Domain logic computes. Data layer fetches. None of them reach into each other's internals |
| **Depend on abstractions** | Screens depend on interfaces (repositories, services), never on `fetch`, Prisma, or a store library directly |
| **Small, named, testable units** | A function does one thing. A component renders one thing. A file has one reason to change |
| **Fail loudly in dev, gracefully in prod** | Invalid assumptions throw in development. Users always see the prototype's error and empty states |
| **Boring over clever** | Readable code beats short code. No metaprogramming, no deep generics when a simple type works |
| **Rule of three** | Duplicate once, abstract on the third use. Never abstract before the second real use |
| **No speculative generality** | Do not build for requirements nobody has. The prototype defines the scope |

---

## 3. PROJECT STRUCTURE

Feature-first with a shared layer for the **Figma UI track** (C0–C10). Names are fixed so any session can find things.

> **Architecture note (CDEC-012):** `system-architecture.md` §4 is the **full-system** target (`lib/domain`, `lib/queries`, `lib/services`, `app/api`, `components/shell`, no dump `data/`). Until Clerk/Prisma/API are approved, keep the UI-track tree below. Do not invent a second parallel tree.

```
goldensync-web/
├─ app/                          # Routes only: layouts, pages, loading, error, not-found
│  ├─ (auth)/                    # Page 1 routes (aligns with architecture (auth)/)
│  ├─ (app)/                     # dashboard, subjects/[id]/*, grade-calculator, account
│  ├─ dev/                       # flag-gated tools (e.g. /dev/tokens)
│  ├─ globals.css                # Tokens and Tailwind theme (the only place raw values live)
│  └─ layout.tsx
├─ components/
│  ├─ ui/                        # shadcn + Magic UI primitives (do not put feature logic here)
│  ├─ core/                      # The 26 core + Chip components from the prototype
│  └─ domain/                    # The 10 domain components from the prototype
├─ features/
│  ├─ auth/                      # components/, schemas.ts, hooks.ts, copy.ts per feature
│  ├─ dashboard/
│  ├─ add-subject/
│  ├─ subject-modules/
│  └─ grade-calculator/
├─ domain/                       # PURE logic for UI track (maps later → lib/domain)
│  ├─ models/
│  ├─ services/
│  ├─ errors/
│  └─ types.ts
├─ data/                         # UI-track only (architecture forbids long-term dump data/)
│  ├─ repositories/              # → later lib/queries + lib/services
│  └─ seed/                      # → later prisma/seed or fixtures
├─ state/                        # Proto store (Demo Panel + flows)
├─ lib/                          # utils, formatters; later grows per architecture §4
└─ copy/                         # Appendix A + screen copy
```

Rules:
- `domain/` imports nothing from `app/`, `components/`, `features/`, `state/` or any framework. It must run in plain Node.
- `components/ui` knows nothing about GoldenSync. `components/core` and `components/domain` know only their props, not routes or stores.
- A feature may import from `components/`, `domain/`, `data/`, `state/`, `lib/`, `copy/`. A feature never imports another feature. Share by moving code down to `components/` or `domain/`.
- Imports use the `@/` alias, never long relative chains (`../../..`).
- One component per file, file named after the component. Barrel `index.ts` files only at feature and folder boundaries, never deep re-export chains.

---

## 4. LAYERING AND OBJECT-ORIENTED DESIGN

React components are functions, and that is correct. Object-oriented design applies to the **domain and data layers**, where state, invariants and behavior belong together. Use classes there, and keep them out of React components.

### 4.1 The layers

```
UI (components, pages)  →  Hooks / actions (features)  →  Services (domain)  →  Repositories (data)
       renders                  wires and orchestrates        business rules          reads and writes
```

Calls only go downward. A lower layer never imports a higher one.

### 4.2 Entities and value objects (classes)

- Model real concepts as classes: `Subject`, `Assessment`, `Score`, `GradeScale`, `Semester`, `Syllabus`.
- Encapsulate invariants in the constructor or a static factory. An invalid object cannot exist.
- Value objects (`Percentage`, `GradePoint`, `Score`) are immutable. Operations return new instances.
- No public mutable fields. Expose `readonly` properties and methods.

```ts
// domain/models/percentage.ts
export class Percentage {
  private constructor(readonly value: number) {}

  static of(value: number): Percentage {
    if (!Number.isFinite(value) || value < 0 || value > 100) {
      throw new InvalidPercentageError(value);
    }
    return new Percentage(value);
  }

  toString(): string {
    return `${this.value}%`;
  }
}
```

### 4.3 Services and the Strategy pattern

- Business rules live in services, as classes with injected dependencies, or as pure functions when stateless.
- The Grade Calculator has 6 scenarios and 7 results. Model each scenario as a **strategy** behind one interface, selected by a registry. Do not write one giant `switch` in a component.

```ts
// domain/services/grade-calculator/scenario-strategy.ts
export interface ScenarioStrategy {
  readonly id: ScenarioId;
  calculate(input: CalculatorInput): CalculatorResult; // result is a discriminated union
}

export class GradeCalculator {
  constructor(private readonly strategies: ReadonlyMap<ScenarioId, ScenarioStrategy>) {}

  run(id: ScenarioId, input: CalculatorInput): CalculatorResult {
    const strategy = this.strategies.get(id);
    if (!strategy) throw new UnknownScenarioError(id);
    return strategy.calculate(input);
  }
}
```

- Results are a discriminated union (`PASSED | INT_A | UNDEFINED | INT_B | FAILED | INCOMPLETE`, as the prototype defines them), never strings and booleans scattered across components.
- Results and rules come from the prototype and the plan, not from invention. If the prototype does not define a rule, ask.

### 4.4 Repositories (the seam for Prisma and Neon later)

- Each aggregate has a repository **interface** in `data/repositories`. The seed-backed implementation is one class. A Prisma implementation will be another class, with no screen changes.
- Methods are async and return domain models, never raw rows. Failure is a typed error (section 14).

```ts
export interface SubjectRepository {
  list(semesterId: SemesterId): Promise<readonly Subject[]>;
  get(id: SubjectId): Promise<Subject | null>;
  create(draft: SubjectDraft): Promise<Subject>;
  archive(id: SubjectId): Promise<void>;
  delete(id: SubjectId): Promise<void>;
}
```

- Inject repositories through a small composition root (`data/container.ts`). Screens ask for the interface, never `new SeedSubjectRepository()`.

### 4.5 State machines for flows

Every multi-step or branching flow is a finite state machine with explicit states, events and transitions: login (with the fail counter and throttle), PDF upload and processing, Add Subject steps, session warning and expiry, grade scale gate.

```ts
type UploadState =
  | { kind: "idle" }
  | { kind: "processing"; step: 1 | 2 | 3 }
  | { kind: "prefilled"; draft: SubjectDraft }
  | { kind: "rejected"; reason: UploadRejection }
  | { kind: "error"; error: AppError };
```

- Transitions live in a pure reducer (`(state, event) => state`) that can be reasoned about and checked without a browser.
- The UI maps each state to exactly one prototype frame. If a state has no frame, it should not exist.

### 4.6 SOLID, applied

| Rule | In this project |
| --- | --- |
| Single responsibility | One class or module, one reason to change |
| Open/closed | New grade scenario = new strategy class, no edits to the calculator |
| Liskov | Any `SubjectRepository` implementation works wherever the interface is used |
| Interface segregation | Small interfaces (`SyllabusParser`, `SubjectRepository`), not one `Api` god object |
| Dependency inversion | Features depend on interfaces from `domain/` and `data/`, never concrete classes |

---

## 5. TYPESCRIPT STANDARDS

- `tsconfig`: `strict: true`. Also enable `noUncheckedIndexedAccess`, `noImplicitOverride`, `exactOptionalPropertyTypes` when they do not conflict with the generated config (ISS-07). Log a `CDEC` if one cannot be enabled.
- **Banned:** `any`, `as any`, `@ts-ignore`, `@ts-expect-error` without a linked reason, non-null assertion `!` outside tests of impossible states, `Function`, `Object`, `{}` as a type.
- Use `unknown` at boundaries and narrow it (zod, type guards).
- Use `type` for unions and shapes, `interface` for object contracts that classes implement. Be consistent within a folder.
- Use **branded types** for IDs so a `SubjectId` cannot be passed as a `SemesterId`:
  ```ts
  type Brand<T, B extends string> = T & { readonly __brand: B };
  export type SubjectId = Brand<string, "SubjectId">;
  ```
- Prefer `readonly` arrays and properties. Prefer `as const` objects and string-literal unions over `enum`.
- Exhaustive checks on unions:
  ```ts
  export function assertNever(x: never): never {
    throw new Error(`Unhandled case: ${JSON.stringify(x)}`);
  }
  ```
- Derive types from schemas (`z.infer<typeof schema>`). Never write the same shape twice.
- Export types with `export type`. Use `import type` for type-only imports.
- Public functions and components have explicit return types where it aids readability. Internal inference is fine.
- Dates: store and pass as ISO strings or `Date` consistently inside one layer. Convert at the boundary. Never mix.

---

## 6. NAMING AND CODE STYLE

> **Full naming authority:** `coding-name-standards.md` (registries, audits CN-1…CN-14, Figma→code map). This section is the short checklist; when they differ on a name, `coding-name-standards.md` wins and a `CDEC` is logged.

| Item | Convention |
| --- | --- |
| Files | `kebab-case.ts` / `kebab-case.tsx`. Components file `component-name.tsx` |
| Components | `PascalCase`, named after the Figma component (e.g. Figma `StatusChip` → `StatusChip`) |
| Hooks | `useThing`, one per file when non-trivial |
| Functions and variables | `camelCase`, verbs for functions (`calculateGrade`), nouns for values |
| Booleans | `isX`, `hasX`, `canX`, `shouldX` |
| Constants | `SCREAMING_SNAKE_CASE` only for true constants. Group related constants in `as const` objects |
| Types and classes | `PascalCase`, no `I` prefix, no `Type` suffix |
| Event handlers | `handleX` in the component, `onX` as props |
| Errors | `SomethingError` class names |

- Maximum function length: about 40 lines. Maximum component file: about 200 lines. Split when exceeded.
- Maximum 4 parameters. Beyond that, pass an options object.
- No magic strings or numbers in logic: name them (`MAX_SUBJECTS = 20` from the prototype value, with its source noted).
- Comments: follow `comment-flows-info.md`. Every function gets a short plain comment; complicated logic gets `FLOW` / `RULE` markers; feature and domain service files get a short flow header. Also explain **why** for non-obvious decisions (or cite a `CDEC`). Do not narrate obvious one-liners.
- No dead code, no commented-out code, no `TODO` without a tracker reference.
- Prettier formats, ESLint (with `jsx-a11y`) enforces. Never disable a lint rule inline without a reason comment.

---

## 7. NEXT.JS APP ROUTER STANDARDS

- **Server Components by default.** Add `"use client"` only at the smallest leaf that needs state, effects, event handlers or browser APIs. Never put `"use client"` on a layout or a page just for convenience.
- Pass serializable props from server to client components. No class instances, functions or `Date` objects across the boundary (map to plain DTOs or ISO strings).
- Each route segment provides `loading.tsx` (the prototype's loading state), `error.tsx` (the prototype's error state) and `not-found.tsx` where the prototype has them.
- Route groups `(auth)` and `(app)` separate shells.
- `params` and `searchParams` are asynchronous in current Next.js. Await them. Check the installed Next.js docs for the current form before using caching APIs (`cacheComponents` is on in `next.config.ts`).
- Server-only code (anything touching secrets, `pdf-parse`, the future database) is marked with `import "server-only"`.
- Mutations use Server Actions or route handlers that **validate input with zod on the server**, even when the client already validated.
- Metadata via the Metadata API per route. No hardcoded `<title>` tags.
- Images through `next/image`, fonts through `next/font` (the prototype uses Inter and a mono font). No layout shift: fixed dimensions or aspect ratios.
- Never read `process.env` outside `lib/env.ts`, which validates environment variables with zod at startup.
- Route protection and session handling go in the single place designated for it (`proxy.ts` per the setup ledger), added only when auth is approved.

---

## 8. TAILWIND CSS 4 AND DESIGN TOKENS

- Tokens live **only** in `app/globals.css`, in a CSS-first theme (`@theme`), mapped from the Figma collections: Primitives, Semantic, Space, Radius. Text styles and effect styles (glass, shadow, focus ring) become named utilities or `@utility` / `@layer components` classes.
- Components use **semantic** tokens (`bg-surface-glass`, `text-text-primary`), never primitives and never raw values.
- **Banned in components:** hex, `rgb()`, `hsl()`, arbitrary values (`w-[372px]`, `text-[13px]`, `gap-[10px]`). If the prototype needs a value that has no token, ask the owner and record a `CDEC`. Do not invent a token.
- Class order handled by `prettier-plugin-tailwindcss`. Merge conditional classes with `cn()` only (`clsx` + `tailwind-merge`).
- Variants with `class-variance-authority` (`cva`), one `cva` per component, variant names equal the Figma component properties.
- Responsive utilities use only breakpoints taken from the D, T, M frames. No invented breakpoints. Design mobile-first in code, but verify desktop first against the frames.
- No inline `style` except for truly dynamic values (e.g. progress width) passed as a CSS variable.
- No `!important`. No global element selectors beyond the base layer.
- Dark UI is the default theme via `next-themes` (`attribute="class"`, set `defaultTheme` as the prototype requires). Avoid theme flash: `suppressHydrationWarning` on `<html>`, theme provider at the root.

---

## 9. SHADCN (BASE-NOVA, BASE UI) AND MAGIC UI

- shadcn components are the **primitive layer**. Do not rebuild a dialog, select, tabs, tooltip or popover by hand.
- Style them through tokens and `cva` variants so they match the prototype exactly. Edit the file in `components/ui/` only to change **styling or variants**, never to change accessibility behavior.
- Wrap primitives into the prototype's own components in `components/core` and `components/domain`. Feature code imports from there, not from `components/ui` directly (except trivial layout primitives).
- Base UI differs from Radix: composition uses a `render` prop rather than `asChild`. Read the installed component source before using a pattern from memory.
- Keep keyboard and focus behavior, `aria-*` and focus trapping that the primitive provides. Do not remove them to match visuals.
- Magic UI components (`BorderBeam`, `AnimatedBeam`, `BlurFade`, etc.) are used **only** where a Figma node uses them, and are wrapped so they can be turned off for reduced motion.
- Every UI primitive added with the shadcn CLI is logged in the tracker (name, why, node).

---

## 10. FORMS (REACT HOOK FORM + ZOD)

- **Schema first.** One zod schema per form, in `features/<name>/schemas.ts`. The TypeScript type comes from `z.infer`.
- Use the resolver from `@hookform/resolvers` so client validation equals the schema. The **same schema** validates again on the server.
- Validation messages come from `copy/`, character-for-character as in the prototype. Never write messages inside schemas inline.
- Multi-step flows (Add Subject, 5 steps): one form instance for the whole flow, one schema per step plus a merged schema. Navigate steps through the state machine (section 4.5). Validate the current step before moving on. Persist the draft (the prototype has a "draft restored" state).
- Error display: field error under the field, form-level error in the prototype's error slot. Set `aria-invalid`, `aria-describedby`, and move focus to the first invalid field on submit.
- Disable submit only where the prototype does. Always prevent double submit while pending.
- Controlled by the form library, not by parallel `useState` per field.
- No uncontrolled mix. No validation logic in components.
- Sensitive inputs: correct `type`, `autoComplete` and `inputMode`. Inputs are 48px high on mobile, as in the frames.

---

## 11. TABLES (TANSTACK TABLE)

- Tables for checklist, scores and assessments only.
- **Column definitions live outside the component** (module-level, stable identity) or are memoized. Data passed to the table is memoized so it does not re-create each render.
- The table is headless. Rendering uses the project's `Table` primitive styled with tokens.
- Cell renderers are small components with explicit props. Editable cells (scores) validate through the domain (`Score`, `Percentage`) before committing.
- Row identity: stable IDs (`getRowId`), never array index.
- Sorting, filtering and selection only if the prototype shows them.
- Empty state, loading skeleton and error state use the prototype components. Tables on mobile follow the M frame (the prototype decides: scroll container or stacked rows).
- Wide tables scroll inside their own `overflow-x-auto` container, never the page.

---

## 12. MOTION (`motion`, MAGIC UI)

- Allowed motion is the list in plan section 8.3 and tracker section 8.3 only: transitions, overlays, shake, success check, progress fill, card stagger, pulse, skeleton shimmer, BorderBeam, meteor, and the CO to PO line animations.
- Durations and easing come from the prototype: navigations 300 ms, dialogs and overlays 250 ms, state changes 150 ms, all ease-out. Store them as named constants in `lib/motion.ts` and reuse. No ad hoc numbers.
- Import from the package's React entry. Animate `transform` and `opacity` only. Never animate layout properties that cause reflow (width, height, top, left) unless the prototype requires it and it is checked for jank.
- Respect `prefers-reduced-motion`: use the library's reduced-motion hook, and make motion non-essential (state and meaning never depend on animation).
- Wrap motion components in client leaf components. Do not turn a whole page into a client component for one animation.
- Loading and shimmer states use the `Skeleton` component with a CSS animation where possible, not JavaScript.
- Clean up animations on unmount. No animation loops that run off-screen.

---

## 13. STATE MANAGEMENT

- **Server state and domain data** come from repositories (section 4.4) and Server Components. Do not copy it into a client store.
- **Prototype state** (the 13 Proto variables: `sessionActive`, `hasSemester`, `subjectCount`, `subjectSelected`, `loginOutcome`, `loginFailCount`, `pdfOutcome`, and the rest of tracker section 5.2) lives in one typed store, defined by an interface first:
  ```ts
  export interface ProtoState {
    readonly sessionActive: boolean;
    readonly hasSemester: boolean;
    readonly subjectCount: number;
    // ...all 13, typed from the tracker
  }
  export interface ProtoActions { /* named intent methods, no raw setters in components */ }
  ```
  The implementation uses the library the owner approves (section 1.1). Components never import the library directly. They use hooks from `state/` (`useSession()`, `useSubjectCount()`).
- Select narrowly (`useStore(selector)`), never subscribe to the whole store. Derive values with selectors, never store derived data.
- **Local UI state** (open/closed, hover, current tab) stays in the component with `useState` / `useReducer`.
- **URL state** (selected subject, active module, scenario) lives in the URL when it should survive refresh and be linkable.
- No global state for form fields. No prop drilling beyond two levels: use composition (`children`, slots) first, context second.
- The state used for the Demo Panel (dev-only) writes to the same store through the same actions. It must not create a second path of truth.

---

## 14. DATA LAYER, ERRORS AND RESILIENCE

### 14.1 Seed-first data, Prisma-ready

- Seed data is typed, lives in `data/seed/`, and mirrors the prototype's data exactly (including the seed-data warning on the Cover).
- Components never import seed files. Only the seed repositories do.
- Every repository method is async, even when seed-backed, so swapping in the database changes no caller.
- Domain models carry no database-specific fields. Mapping from rows to models happens in the repository (a mapper per aggregate).

### 14.2 Typed errors

```ts
export abstract class AppError extends Error {
  abstract readonly code: string;
  abstract readonly userSafe: boolean;
}
export class ValidationError extends AppError { /* code: "VALIDATION" */ }
export class NotFoundError extends AppError { /* code: "NOT_FOUND" */ }
export class RateLimitedError extends AppError { /* code: "RATE_LIMITED" */ }
```

- Errors map to **prototype states** through one mapper (`error → UI state`): throttled, session expired, upload rejected, parse error, cap reached, conflict. Do not scatter `try/catch` in components.
- Never swallow an error silently. Either handle it into a defined state, or let it reach `error.tsx`.
- Never show a raw error message to the user. Only the prototype's copy.
- Expected failures (invalid file, wrong password) are **values**, returned as results (`{ ok: false, error }`) from services and actions, not thrown. Unexpected failures throw.

### 14.3 Resilience

- Every async action has pending, success and failure states that match the prototype.
- Idempotent mutations where possible. Guard against double clicks and double submits.
- Time-based behavior (session warning and expiry, upload timeout, processing steps) goes through an injectable clock or timer utility so it can be controlled by the Demo Panel and not hardcoded with scattered `setTimeout`.
- Clean up timers, listeners and subscriptions in effect cleanup.
- Conflict handling (the prototype has a Conflict state on edit score) is explicit: a version or timestamp check at the repository, and a Reload path in the UI.

---

## 15. SECURITY

- Validate **all** external input (forms, file uploads, URL params, cookies) with zod at the boundary. Never trust client validation.
- File uploads: check MIME type, extension and size limit server-side, reject encrypted or unreadable PDFs with the prototype's states, never execute or render uploaded content as HTML.
- No secrets in client code. Environment variables are validated in `lib/env.ts`. Only `NEXT_PUBLIC_` values reach the browser, and only when needed.
- No `dangerouslySetInnerHTML`. If unavoidable, sanitize and log a `CDEC`.
- Do not log personal data, scores, passwords or tokens. No `console.log` left in committed code.
- Authentication, sessions, CSRF and rate limiting are implemented only when the owner approves Clerk and the database. Until then, behavior is simulated through the Proto state, and the code is written so the real implementation replaces the simulation behind the same interface.
- Dependencies: do not add packages. Never run `npm audit fix --force`.

---

## 16. ACCESSIBILITY (WCAG 2.2 AA TARGET)

- Use semantic HTML first: `button` for actions, `a` for navigation, `nav`, `main`, `header`, `aside`, headings in order, `label` for every input, `table` for tabular data.
- Every interactive element is keyboard reachable, shows the prototype's focus ring, and has a logical tab order. No keyboard traps (dialogs trap focus on purpose and restore it on close).
- Icon-only buttons have an accessible name (`aria-label`), as in the 58 aria annotations of the Figma file. Decorative icons use `aria-hidden`.
- Status is never shown by color alone: text accompanies every status chip.
- Live regions for async feedback (toasts, upload progress, form errors) with the right politeness.
- Contrast 4.5:1 or better for text. The prototype was audited for this, so do not change token values.
- Touch targets 44px or more, inputs 48px on mobile.
- Respect `prefers-reduced-motion` and do not rely on motion to convey information.
- Test with keyboard only and with a screen reader on one flow per milestone.

---

## 17. PERFORMANCE

- Targets (Lighthouse CI is installed, config to be added by an approved piece): LCP under 2.5 s, CLS under 0.1, INP under 200 ms on the prototype's key screens.
- Server Components and streaming first. Keep client bundles small: leaf client components only.
- Lazy-load heavy, rarely used UI (dialogs with big content, the Demo Panel) with `next/dynamic`.
- No `useEffect` for data that a Server Component can fetch.
- Avoid unnecessary renders: stable props, memoized column definitions, narrow store selectors. Use `memo`, `useMemo` and `useCallback` only where a measured or obvious problem exists, never everywhere.
- Lists use stable keys (IDs), never index.
- Images sized and optimized with `next/image`. Fonts via `next/font`, no render-blocking font CSS.
- No layout shift: reserve space for skeletons, images and async content, matching the prototype's loading frames.
- Animate only `transform` and `opacity`.

---

## 18. COMPONENT DESIGN RULES (REUSABILITY)

- **Map one Figma component to one code component.** The Figma component's properties are the code component's props, with the same names and values.
- Props are typed, minimal and explicit. Boolean props only for true on/off. Use a `variant` union instead of several booleans that cannot combine.
- Prefer **composition** over configuration: `children` and slot props over a dozen flags.
- Components are controlled or uncontrolled consistently, documented in the type.
- Every component forwards `className` (merged with `cn`) and standard HTML attributes, and `ref` where it wraps a native element.
- No business logic and no data fetching in `components/ui`, `components/core`. `components/domain` receives data as props.
- No hardcoded copy in components. Text comes from `copy/` or props.
- A component renders every state the prototype defines for it (default, hover, focus, disabled, loading, error), driven by props, not by internal guessing.
- Stateless where possible. If it needs state, keep it minimal and local.
- Keep a component's public API stable. Changing props of a shared component means checking every use.
- Document each shared component in one comment block: purpose, Figma node ID, props, states.

---

## 19. QUALITY GATES AND TESTING

- Before any piece is BUILT: `npm run lint` and `npm run build` pass, `tsc --noEmit` is clean, there are no console errors, and no `any`.
- Domain logic (`domain/`) is pure, so it is verified with table-driven checks: inputs and expected outputs taken from the prototype and the plan (every scenario and result of the Grade Calculator, every login and upload outcome). A test runner is **not** in the owner's stack list. Ask the owner which tool to use before adding one. Until then, verify with typed scripts run in Node and record the evidence in the tracker.
- Visual verification: browser screenshot at the Figma frame's viewport, compared to the Figma screenshot of the same node. Differences of 1px count.
- Run the matching flow test (T-01 to T-11) for every piece that touches a flow.
- The build tracker (`goldensync-checker-code.md` §12) gates every piece and milestone. Findings are fixed before the next piece.

---

## 20. GIT AND CHANGE HYGIENE

- One piece = one commit (or a small series), message `UI-nnn: <piece name>` with the Figma node IDs in the body.
- Never commit `node_modules`, `.next`, `.env*` with secrets, or build output.
- Lockfile changes are intentional. Review `package.json` and `package-lock.json` diffs for any unapproved dependency.
- No unrelated refactors inside a piece. A refactor is its own piece, logged in the tracker.
- Keep the repo in a working state at the end of every session.

---

## 21. BANNED PRACTICES (QUICK LIST)

| Banned | Why |
| --- | --- |
| `any`, `@ts-ignore`, unchecked casts | Hides bugs |
| Hex colors, arbitrary Tailwind values, magic numbers | Breaks the token system and fidelity |
| Hardcoded copy in components | Copy must equal the prototype and stay in one place |
| `"use client"` at page or layout level without need | Bloats the client bundle |
| `useEffect` to fetch or derive data | Race conditions and wasted renders |
| Boolean flag piles for flow state | Impossible states. Use unions and machines |
| Direct import of a store library, `fetch`, or the seed in a component | Breaks the layers and the Prisma seam |
| Index as a React key | Wrong state on reorder |
| Duplicated types, schemas, constants | Drift |
| Inline `setTimeout` scattered in components | Untestable timing |
| `console.log`, `debugger` committed | Noise and leaks |
| Adding or swapping libraries | Stack is fixed |
| Extra features, props, pages "just in case" | Prototype is the scope |
| `npm audit fix`, `--force` | Project rule |
| Editing the Figma file | Read only |

---

## 22. DEFINITION OF DONE (PER PIECE)

A piece is done only when all are true:

- [ ] Matches the Figma node(s) at the same viewport, with zero unlogged differences
- [ ] Every state the prototype defines for it is built and reachable
- [ ] Copy is character-for-character from the prototype
- [ ] Only tokens used, no hardcoded values
- [ ] Reuses existing components, no duplicate
- [ ] Props, schemas and types are strict, no `any`
- [ ] Logic is in `domain/` or a service, not in the component
- [ ] Data access goes through a repository interface
- [ ] Forms use react-hook-form + zod with prototype messages
- [ ] Keyboard, focus ring, aria and contrast verified
- [ ] Motion only as the prototype has it, reduced motion respected
- [ ] No new dependency, no unapproved library import
- [ ] `npm run lint`, `npm run build` and `tsc --noEmit` pass, no console errors
- [ ] Comments and FLOW markers written (`comment-flows-info.md`)
- [ ] Tracker entry written (`goldensync-checker-code.md`), node IDs mapped
- [ ] Ready for the milestone gate audit

---

## 23. DEVIATIONS

If a standard here cannot be followed for a piece, do not bend it silently. Record a `CDEC` in `goldensync-checker-code.md` with the standard, the reason, the alternative used and who approved it. An unrecorded deviation is a finding at the next gate.

_GoldenSync Stack and Code Standards v1.0 · works with `goldensync-checker-code.md` (canonical build ledger), `coding-name-standards.md`, `comment-flows-info.md`, and `system-progress-tracker.md`_
