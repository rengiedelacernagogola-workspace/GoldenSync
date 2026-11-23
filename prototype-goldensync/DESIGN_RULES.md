# GOLDENSYNC — CURSOR DESIGN RULES

> This file is the single source of truth for every UI and design decision.
> Cursor must read and strictly follow every rule in this file before writing
> any component, page, or style. No exceptions. No approximations.

---

## 0. PRIME DIRECTIVE

Every screen, component, and interaction must feel like it was
hand-crafted by a senior designer-developer who spent 3 days on
each screen. The standard is: a senior Figma designer and a
senior React engineer both look at this and cannot tell it was
AI-generated.

If a decision is not covered by this file → choose the most
intentional, minimal, and elegant option. Never choose the
obvious default.

---

## 1. DESIGN PHILOSOPHY

```
Principle 1 — RESTRAINT
  Add nothing unless it earns its place.
  Every element must serve function or hierarchy.
  Decoration for decoration's sake = reject.

Principle 2 — INTENTIONAL SPACE
  Whitespace is not empty space. It is breathing room.
  When in doubt, add more space, not less.
  Crowded UI = failed UI.

Principle 3 — DEPTH WITHOUT NOISE
  Use blur, shadow, and layering to create depth.
  Never use busy patterns, gradients on text, or
  heavy textures as backgrounds.
  One focal point per screen. Everything else supports it.

Principle 4 — MOTION WITH PURPOSE
  Every animation must communicate something:
  state change, hierarchy, feedback, or transition.
  Animation for decoration = reject.
  Animation duration: fast enough to feel snappy,
  slow enough to be perceived.

Principle 5 — CONSISTENCY OVER CREATIVITY
  Use the same component for the same job every time.
  Never invent a new pattern when an existing one works.
  Consistency builds trust. Creativity breaks it.
```

---

## 2. COLOR SYSTEM

### 2.1 Token Structure

All colors are defined as CSS variables and Tailwind tokens.
Zero hardcoded hex values anywhere in component files.

```css
/* PRIMITIVES — never use directly in components */
--primitive-black:        #000000;
--primitive-white:        #ffffff;
--primitive-blue-400:     #4F8EF7;
--primitive-purple-400:   #9B6DFF;
--primitive-cyan-400:     #00E5FF;
--primitive-dark-950:     #0A0A0F;
--primitive-dark-900:     #0D0D1A;
--primitive-dark-800:     #12121F;
--primitive-dark-700:     #1A1A2E;
--primitive-dark-600:     #22223B;
--primitive-gray-500:     #6B7280;
--primitive-gray-400:     #9CA3AF;
--primitive-gray-300:     #D1D5DB;
--primitive-green-400:    #22C55E;
--primitive-yellow-400:   #FBBF24;
--primitive-red-400:      #F87171;

/* SEMANTIC — use these in components */
--color-bg-base:          var(--primitive-dark-950);
--color-bg-elevated:      var(--primitive-dark-900);
--color-bg-overlay:       var(--primitive-dark-800);
--color-bg-subtle:        var(--primitive-dark-700);
--color-bg-muted:         var(--primitive-dark-600);

--color-surface-glass:    rgba(255, 255, 255, 0.04);
--color-surface-glass-md: rgba(255, 255, 255, 0.07);
--color-surface-glass-lg: rgba(255, 255, 255, 0.10);

--color-border-subtle:    rgba(255, 255, 255, 0.06);
--color-border-default:   rgba(255, 255, 255, 0.10);
--color-border-strong:    rgba(255, 255, 255, 0.18);
--color-border-focus:     var(--primitive-blue-400);

--color-text-primary:     rgba(255, 255, 255, 0.95);
--color-text-secondary:   rgba(255, 255, 255, 0.65);
--color-text-muted:       rgba(255, 255, 255, 0.40);
--color-text-disabled:    rgba(255, 255, 255, 0.25);
--color-text-inverse:     var(--primitive-dark-950);

--color-accent-primary:   var(--primitive-blue-400);
--color-accent-secondary: var(--primitive-purple-400);
--color-accent-tertiary:  var(--primitive-cyan-400);

--color-status-success:   var(--primitive-green-400);
--color-status-warning:   var(--primitive-yellow-400);
--color-status-error:     var(--primitive-red-400);
--color-status-info:      var(--primitive-blue-400);
```

### 2.2 Color Usage Rules

```
✅ Page backgrounds     → color-bg-base only
✅ Sidebar background   → color-bg-elevated
✅ Cards                → color-surface-glass + border-default
✅ Modals/Dialogs       → color-bg-overlay + border-strong
✅ Hover states         → color-surface-glass-md
✅ Active states        → color-surface-glass-lg
✅ Dividers             → color-border-subtle
✅ Primary text         → color-text-primary
✅ Supporting text      → color-text-secondary
✅ Placeholders         → color-text-muted
✅ Primary CTA          → color-accent-primary
✅ Destructive actions  → color-status-error
✅ Success feedback     → color-status-success
✅ Warning flags        → color-status-warning

❌ Never use color-accent on body text
❌ Never use white (#ffffff) directly — use color-text-primary
❌ Never use black (#000000) directly — use color-bg-base
❌ Never mix accent colors on the same element
❌ Never use more than 2 accent colors per screen
```

### 2.3 Background Gradient Rule

```css
/* Applied to body/root only. Never repeat inside cards. */
background:
  radial-gradient(ellipse at 20% 50%, rgba(79,142,247,0.06) 0%, transparent 60%),
  radial-gradient(ellipse at 80% 20%, rgba(155,109,255,0.06) 0%, transparent 60%),
  var(--color-bg-base);
```

---

## 3. GLASS MORPHISM SYSTEM

### 3.1 Glass Variants

```css
/* GLASS SM — subtle, used for table rows, list items */
.glass-sm {
  background: var(--color-surface-glass);
  border: 1px solid var(--color-border-subtle);
  backdrop-filter: blur(8px) saturate(140%);
}

/* GLASS MD — standard, used for cards, panels */
.glass-md {
  background: var(--color-surface-glass);
  border: 1px solid var(--color-border-default);
  backdrop-filter: blur(20px) saturate(160%);
  box-shadow:
    0 4px 24px rgba(0, 0, 0, 0.25),
    inset 0 1px 0 rgba(255, 255, 255, 0.06);
}

/* GLASS LG — prominent, used for modals, featured cards */
.glass-lg {
  background: var(--color-surface-glass-md);
  border: 1px solid var(--color-border-strong);
  backdrop-filter: blur(32px) saturate(180%);
  box-shadow:
    0 8px 48px rgba(0, 0, 0, 0.40),
    inset 0 1px 0 rgba(255, 255, 255, 0.10);
}

/* GLASS ACCENT — used for highlighted/active cards */
.glass-accent {
  background: rgba(79, 142, 247, 0.08);
  border: 1px solid rgba(79, 142, 247, 0.25);
  backdrop-filter: blur(20px) saturate(160%);
  box-shadow:
    0 0 0 1px rgba(79, 142, 247, 0.10),
    0 8px 32px rgba(79, 142, 247, 0.12);
}
```

### 3.2 Glass Rules

```
✅ Cards → glass-md
✅ Sidebar → glass-sm (no backdrop-filter on sidebar —
   performance cost on scroll)
✅ Modals → glass-lg
✅ Active subject card → glass-accent
✅ Table rows on hover → glass-sm

❌ Never stack glass on glass (no glass inside glass)
❌ Never use backdrop-filter on elements that scroll
   inside a container — apply to the container instead
❌ Never apply glass to text elements
❌ Never use glass on mobile if the device has
   < 4GB RAM hint — provide solid fallback
```

---

## 4. TYPOGRAPHY SYSTEM

### 4.1 Scale

```
Scale name    Size    Weight    Line Height    Letter Spacing    Usage
──────────────────────────────────────────────────────────────────────
display-2xl   72px    700       1.0            -0.03em           Hero only
display-xl    60px    700       1.05           -0.025em          Page heroes
display-lg    48px    700       1.1            -0.02em           Section heroes
display-md    36px    700       1.15           -0.015em          Dashboard title
display-sm    30px    600       1.2            -0.01em           Card headings
heading-xl    24px    600       1.25           -0.008em          Section headers
heading-lg    20px    600       1.3            -0.005em          Card titles
heading-md    18px    600       1.35           0em               Sub-sections
heading-sm    16px    600       1.4            0em               Labels
body-lg       18px    400       1.6            0em               Long-form text
body-md       16px    400       1.6            0em               Default body
body-sm       14px    400       1.5            0em               Supporting text
caption       12px    400       1.4            0.01em            Meta info
overline      11px    500       1.0            0.08em (UPPER)    Section labels
mono-md       14px    400       1.5            0em               Codes, IDs
mono-sm       12px    400       1.4            0em               Inline code
```

### 4.2 Typography Rules

```
✅ One font family: Inter — loaded via next/font/google
✅ All text uses a named text style — never raw Tailwind
   text-[size] inside components
✅ Headings: use font-feature-settings for optical sizing
✅ Body text: max-width 65ch for readability
✅ Overline labels: uppercase, tracked, muted color
✅ Numbers in tables: font-variant-numeric: tabular-nums
✅ Monospace for: course codes, IDs, scores, dates

❌ Never use font-weight 300 — too light on dark bg
❌ Never mix heading and body in the same element
❌ Never set font-size in px inside components —
   use the scale classes only
❌ Never let a heading exceed its defined weight
❌ Never use color-text-primary on placeholder text
❌ Never center-align long body paragraphs (> 2 lines)
```

### 4.3 Text Color Hierarchy

```
Page titles          → color-text-primary + display weight
Section headers      → color-text-primary + heading weight
Card titles          → color-text-primary + heading-md
Body copy            → color-text-secondary
Captions / metadata  → color-text-muted
Placeholders         → color-text-disabled
Links                → color-accent-primary
Active nav items     → color-text-primary
Inactive nav items   → color-text-muted
Error messages       → color-status-error
Success messages     → color-status-success
Warning messages     → color-status-warning
```

---

## 5. SPACING SYSTEM

### 5.1 Scale (8pt Grid — strict)

```
Token     Value    Tailwind    Usage
──────────────────────────────────────────────────
space-1   4px      p-1         Icon padding, tight chips
space-2   8px      p-2         Input inner padding (y)
space-3   12px     p-3         Small component padding
space-4   16px     p-4         Standard component padding
space-6   24px     p-6         Card padding, section gap
space-8   32px     p-8         Large section padding
space-10  40px     p-10        Page section gap
space-12  48px     p-12        Large section separation
space-16  64px     p-16        Hero padding
space-24  96px     p-24        Between major page sections
```

### 5.2 Spacing Rules

```
✅ All spacing is a multiple of 4px (minimum unit)
✅ Preferred spacing is a multiple of 8px
✅ Card internal padding: space-6 (24px)
✅ Page outer padding: space-8 (32px) desktop,
   space-4 (16px) mobile
✅ Gap between cards: space-6 (24px)
✅ Gap between sections: space-12 (48px)
✅ Gap between form fields: space-4 (16px)
✅ Gap between label and input: space-2 (8px)

❌ Never use odd spacing values (5px, 7px, 13px)
❌ Never use p-5, p-7, p-9, p-11 — not on the 8pt grid
❌ Never use margin-top to push elements —
   use gap in the parent flex/grid instead
❌ Never let content touch the viewport edge —
   minimum space-4 margin on mobile
```

---

## 6. LAYOUT SYSTEM

### 6.1 Grid

```
Desktop 1920px: 12 columns | 24px gutter | 80px margin
Desktop 1280px: 12 columns | 24px gutter | 48px margin
Tablet  768px:  8 columns  | 16px gutter | 24px margin
Mobile  375px:  4 columns  | 16px gutter | 16px margin
```

### 6.2 Sidebar Layout

```
State           Width     Behavior
─────────────────────────────────────────────────────
Desktop open    240px     Persistent, always visible
Desktop closed  64px      Icon only, tooltip on hover
Tablet open     240px     Overlay with backdrop
Tablet closed   0px       Hidden, hamburger trigger
Mobile          100vw     Full-width sheet drawer

Sidebar sections (top to bottom):
  1. Logo + app name (40px height)
  2. Nav items (flex-col, gap-1)
  3. Bottom: Sign Out (mt-auto, separated by divider)

Nav item anatomy:
  [Icon 20px] [Label] [Active indicator right edge]
  Height: 44px minimum (touch target)
  Border radius: 8px
  Active: glass-accent background + accent text
  Hover: glass-sm background + primary text
  Icon: 20px, secondary color (inactive), accent (active)
```

### 6.3 Content Area

```
Max content width: 1400px (centered in content area)
Page title area: mb-8 from first content block
Section separation: space-12 (48px)
Card grids:
  3-col desktop | 2-col tablet | 1-col mobile
  gap-6 (24px)
```

---

## 7. COMPONENT RULES

### 7.1 Button

```
Variants and their visual treatment:

PRIMARY (Shimmer Button via Magic UI)
  bg: color-accent-primary
  text: color-text-inverse (dark)
  border: none
  shimmer: enabled
  height: 44px
  border-radius: 8px
  font: body-md, weight 500
  hover: brightness 110%, scale 1.01
  active: scale 0.98
  loading: loading-ui spinner, text hidden
  disabled: opacity 40%, no interaction

SECONDARY
  bg: color-surface-glass-md
  text: color-text-primary
  border: 1px color-border-default
  height: 44px
  border-radius: 8px
  hover: color-surface-glass-lg, border-strong
  active: scale 0.98

GHOST
  bg: transparent
  text: color-text-secondary
  border: none
  height: 44px
  hover: color-surface-glass, text-primary
  active: scale 0.98

DESTRUCTIVE
  bg: rgba(248, 113, 113, 0.12)
  text: color-status-error
  border: 1px solid rgba(248, 113, 113, 0.25)
  hover: rgba(248, 113, 113, 0.20)

ICON ONLY
  width: 44px, height: 44px (touch target)
  border-radius: 8px
  Must have aria-label
  Uses Ghost or Secondary variant

SIZING (override only when layout demands it)
  sm: height 36px, font body-sm
  md: height 44px, font body-md (DEFAULT)
  lg: height 52px, font body-md

❌ Never use a button without a visible label or
   aria-label
❌ Never disable buttons without showing why
❌ Never use color-accent-secondary as a button bg
❌ Never put icons inside Primary buttons unless
   they add clarity
```

### 7.2 Input Field

```
Height:         44px (desktop), 48px (mobile)
Border radius:  8px
Background:     color-bg-subtle
Border:         1px color-border-default
Font:           body-md, color-text-primary
Placeholder:    color-text-muted

States:
  Default   → border: color-border-default
  Focus     → border: color-border-focus (2px),
               box-shadow: 0 0 0 3px rgba(79,142,247,0.15)
  Filled    → border: color-border-default
  Error     → border: color-status-error,
               box-shadow: 0 0 0 3px rgba(248,113,113,0.15)
  Disabled  → opacity 50%, cursor not-allowed

Label:
  font: body-sm, weight 500, color-text-secondary
  margin-bottom: space-2 (8px)
  Required: red asterisk after label (aria-required)

Error message:
  font: caption, color-status-error
  margin-top: space-2 (8px)
  Prefix with error icon (Lucide AlertCircle 14px)
  Must be announced via aria-live="polite"

Helper text:
  font: caption, color-text-muted
  margin-top: space-2 (8px)

❌ Never show error state before first interaction
❌ Never use red border alone — always pair with
   error message text
❌ Never use placeholder text as a label substitute
```

### 7.3 Card

```
Structure:
  container: glass-md, border-radius 12px
  padding: space-6 (24px)

Header area (optional):
  flex row, align-center, justify-between
  padding-bottom: space-4 (16px)
  border-bottom: 1px color-border-subtle
  margin-bottom: space-4 (16px)

Content area:
  flex-col, gap space-4

Footer area (optional):
  padding-top: space-4
  border-top: 1px color-border-subtle
  margin-top: space-4
  flex row, justify-end, gap space-3

Hover behavior (interactive cards only):
  box-shadow: 0 12px 48px rgba(0,0,0,0.35)
  border-color: color-border-strong
  transition: all 200ms ease-out
  transform: translateY(-1px) (ReactBits tilt optional)

Active/selected card:
  glass-accent variant
  BorderBeam (Magic UI) on the border

❌ Never nest cards inside cards
❌ Never make a card taller than 60vh
❌ Never use card header without a title
❌ Card loading state → skeleton loaders (loading-ui),
   never show partial content
```

### 7.4 Badge / Status Chip

```
Sizes:
  sm: height 20px, font 11px, px 6px
  md: height 24px, font 12px, px 8px (DEFAULT)
  lg: height 28px, font 13px, px 10px

Variants:
  default     bg: color-surface-glass-md,
              border: color-border-default
              text: color-text-secondary

  success     bg: rgba(34,197,94,0.12)
              border: rgba(34,197,94,0.25)
              text: color-status-success

  warning     bg: rgba(251,191,36,0.12)
              border: rgba(251,191,36,0.25)
              text: color-status-warning

  error       bg: rgba(248,113,113,0.12)
              border: rgba(248,113,113,0.25)
              text: color-status-error

  accent      bg: rgba(79,142,247,0.12)
              border: rgba(79,142,247,0.25)
              text: color-accent-primary

Topic Status Chips (special):
  "Not Started"  → default variant + gray dot prefix
  "In Progress"  → accent variant + pulsing blue dot
  "Completed"    → success variant + checkmark icon
  Pulsing dot: CSS animation, 2s infinite,
               prefers-reduced-motion: paused

❌ Never use colored backgrounds without matching text
❌ Never use more than 3 badges in one card header
❌ Never truncate badge text — if too long,
   use a tooltip (shadcn Tooltip)
```

### 7.5 Table

```
Container: glass-sm, border-radius 12px, overflow hidden

Header row:
  bg: color-bg-subtle
  font: overline (11px, uppercase, tracked)
  color: color-text-muted
  height: 40px
  border-bottom: 1px color-border-default
  sticky: top-0 when table scrolls

Data rows:
  height: 52px minimum
  font: body-sm
  color: color-text-secondary
  border-bottom: 1px color-border-subtle
  hover: color-surface-glass-sm

Selected row:
  bg: rgba(79,142,247,0.08)
  border-left: 2px color-accent-primary

Column alignment:
  Text → left align
  Numbers → right align, font-variant-numeric tabular-nums
  Status chips → center align
  Actions → right align

Empty state (no data):
  Centered icon (64px, muted)
  Heading: "No data yet" (heading-sm)
  Body: relevant helper text (body-sm, muted)
  Optional CTA button

Loading state:
  Skeleton rows (loading-ui) —
  same height as data rows
  Animate: shimmer left-to-right

Mobile:
  Card-based layout — each row becomes a card
  Label: value pairs stacked vertically
  Actions at card bottom

❌ Never show more than 50 rows without pagination
❌ Never use horizontal scroll on mobile —
   hide non-essential columns with responsive classes
❌ Never show raw null or undefined —
   display "—" (em dash) for empty cells
```

---

## 8. ANIMATION RULES

### 8.1 Anime.js — Implementation Rules

```javascript
// RULE: All Anime.js in useEffect with cleanup
// RULE: Use refs, never query selectors on global DOM
// RULE: Respect prefers-reduced-motion

const elementRef = useRef(null)

useEffect(() => {
  const prefersReduced = window.matchMedia(
    '(prefers-reduced-motion: reduce)'
  ).matches
  if (prefersReduced) return

  const anim = anime({
    targets: elementRef.current,
    // properties here
  })

  return () => anim.pause()
}, [/* stable deps only */])
```

**Defined animations (use exactly as specified):**

```javascript
// PAGE ENTER — stagger children into view
anime({
  targets: '.page-child',
  opacity: [0, 1],
  translateY: [16, 0],
  duration: 400,
  delay: anime.stagger(60),
  easing: 'easeOutExpo'
})

// CARD STAGGER — dashboard subject cards
anime({
  targets: '.subject-card',
  opacity: [0, 1],
  translateY: [24, 0],
  scale: [0.97, 1],
  duration: 500,
  delay: anime.stagger(80, { start: 100 }),
  easing: 'easeOutExpo'
})

// PROGRESS BAR FILL — from 0 to value
anime({
  targets: progressRef.current,
  width: [`0%`, `${value}%`],
  duration: 800,
  easing: 'easeOutExpo'
})

// NUMBER COUNTER — performance scores
anime({
  targets: counterRef.current,
  innerHTML: [0, targetValue],
  round: 1,
  duration: 1200,
  easing: 'easeOutExpo'
})

// SHAKE — failed login/validation
anime({
  targets: formRef.current,
  translateX: [0, -8, 8, -6, 6, -4, 4, 0],
  duration: 500,
  easing: 'easeInOutSine'
})

// SUCCESS CHECKMARK SVG PATH
anime({
  targets: '#check-path',
  strokeDashoffset: [anime.setDashoffset, 0],
  duration: 600,
  easing: 'easeOutExpo',
  delay: 200
})

// SYNC PROGRESS TIMELINE
const syncTimeline = anime.timeline({ easing: 'easeOutExpo' })
  .add({ targets: '#step-1', opacity: [0,1], duration: 300 })
  .add({ targets: '#progress-bar', width: ['0%','33%'], duration: 600 })
  .add({ targets: '#step-2', opacity: [0,1], duration: 300 })
  .add({ targets: '#progress-bar', width: ['33%','66%'], duration: 600 })
  .add({ targets: '#step-3', opacity: [0,1], duration: 300 })
  .add({ targets: '#progress-bar', width: ['66%','100%'], duration: 400 })
```

### 8.2 Magic UI — Usage Map

```
AnimatedGradientText   → Dashboard heading, page titles only
                         Max: 1 per page

BorderBeam             → Active subject card border only
                         Color: color-accent-primary
                         Duration: 3s

ShimmerButton          → Primary CTA buttons only
                         (Log In, Sync Syllabus, Save, Submit)

NumberTicker           → Passing rate %, CO scores
                         Never on static content

BlurFade               → Wrap page content —
                         fade in on route change
                         duration: 0.4s, blur: 6px

MeteorShower           → Log In + Create Account
                         backgrounds only
                         Quantity: 15, speed: slow

AnimatedBeam           → PEO/PO/CO mapping connections
                         CO → PO connecting lines only

Marquee                → Subject list overflow only
                         Never for primary content

ShimmerEffect          → Data card loading states
                         Fallback when loading-ui unavailable
```

```
❌ Never use more than 2 Magic UI effects per screen
❌ Never use AnimatedGradientText on body text
❌ Never use MeteorShower on content screens
❌ Never let effects run if prefers-reduced-motion
❌ Never use effects on error or empty states
```

### 8.3 CSS Transition Rules

```css
/* Standard hover transitions */
.interactive {
  transition:
    background-color 150ms ease-out,
    border-color 150ms ease-out,
    box-shadow 200ms ease-out,
    transform 150ms ease-out,
    opacity 150ms ease-out;
}

/* Page/screen transitions */
.page-transition {
  animation: fadeIn 300ms ease-out;
}

@keyframes fadeIn {
  from { opacity: 0; transform: translateY(8px); }
  to   { opacity: 1; transform: translateY(0); }
}

/* NEVER animate these properties (causes layout thrash) */
/* width, height, top, left, margin, padding */
/* Use transform: scale/translate instead */
```

### 8.4 Loading States (loading-ui.co)

```
Every async action must have a loading state.
Match the loading component to the context:

Page initial load      → Full-page skeleton layout
Data fetch (table)     → Skeleton table rows
                         (same height as real rows)
Data fetch (cards)     → Skeleton card grid
                         (same count as real cards)
Button submit action   → Inline spinner
                         (replace text, keep width)
File upload progress   → Progress bar with percentage
Step processing        → Step indicator with
                         animated current step
Infinite scroll        → 3 skeleton items at bottom

Skeleton styling:
  bg: color-bg-subtle
  shimmer: left-to-right, 1.5s, infinite
  border-radius: match the real element's radius
  Never show partial content alongside skeleton
  Fade out skeleton → fade in content (opacity transition)
```

---

## 9. RESPONSIVE RULES

### 9.1 Breakpoint Behavior

```
1920px (2xl) — Full HD target
  Sidebar: 240px persistent
  Content: max-width 1400px, centered
  Cards: 3-column grid
  Tables: all columns visible
  Typography: display scales at full size

1280px (xl) — Standard desktop
  Sidebar: 240px persistent
  Content: max-width 1200px
  Cards: 3-column grid
  Typography: scale down 10%

1024px (lg) — Compact desktop
  Sidebar: 240px persistent
  Content: full width minus sidebar
  Cards: 2-3 column grid

768px (md) — Tablet
  Sidebar: 64px collapsed (icons only),
           tooltip on hover
           Sheet drawer on hamburger tap
  Cards: 2-column grid
  Tables: hide low-priority columns
  Typography: heading sizes reduce

640px (sm) — Large mobile
  Sidebar: hidden, sheet drawer only
  Cards: 1-column
  Tables: card view
  Buttons: full width where primary

375px (default) — Mobile
  Sidebar: hidden, sheet drawer only
  All layouts: single column
  Spacing: space-4 outer padding
  Tables: card view, horizontal scroll disabled
  Typography: body-sm for most content
```

### 9.2 Responsive Rules

```
✅ Mobile-first CSS — base styles are mobile,
   desktop added with sm: md: lg: xl: prefixes
✅ Touch targets minimum 44×44px on mobile
✅ Swipe to close on sheet/drawer components
✅ Sticky headers on scrollable tables
✅ All modals/dialogs: full-screen on mobile
✅ Forms: single column on mobile,
   multi-column allowed on desktop only

❌ Never use hover-only interactions on mobile
❌ Never show desktop nav on mobile
   (hamburger/sheet required)
❌ Never let content overflow horizontal on mobile
❌ Never use fixed pixel widths inside cards
❌ Never rely on :hover for critical information
```

---

## 10. ICONOGRAPHY RULES

```
Library: Lucide React (primary) +
         Bootstrap Icons (secondary, matched to design)

Sizes:
  nav icons:        20px
  button icons:     16px
  inline text:      14px (matches body-sm)
  feature icons:    24px (card headers)
  empty state:      64px (muted, decorative)
  status dots:      8px (css circle, not icon)

Color:
  nav inactive:     color-text-muted
  nav active:       color-accent-primary
  button (primary): color-text-inverse
  button (ghost):   color-text-secondary
  status success:   color-status-success
  status warning:   color-status-warning
  status error:     color-status-error
  decorative:       color-text-muted, opacity 40%

Usage rules:
✅ Icon-only buttons: always aria-label
✅ Icons next to text: gap-2, vertically centered
✅ Leading icon in input: position absolute,
   left-3, vertically centered, pointer-events-none
✅ Trailing icon in input: position absolute, right-3

❌ Never use emoji as UI icons
❌ Never mix Lucide and Bootstrap Icons on same screen
❌ Never resize icons to odd numbers (15px, 17px)
❌ Never use icons larger than 32px
   outside of empty states
```

---

## 11. FORM RULES

### 11.1 Layout

```
Single column: always on mobile and modal forms
Two column: desktop only, for related field pairs
  (e.g., First Name | Last Name, Units | Hours)

Field order: most critical fields first
Group related fields with a subtle section heading
Separate sections with a space-8 gap

Required fields:
  Asterisk (*) after label text
  aria-required="true" on input
  Never use placeholder to indicate required
```

### 11.2 Validation

```
When to validate:
  On blur (after leaving a field)
  On submit (all fields)
  Never on every keystroke (too aggressive)

Error display:
  Below the field, never above or beside
  Icon + message: <AlertCircle 14px> message text
  Color: color-status-error
  aria-live="polite" on the error container

Success display:
  Subtle checkmark on field (not intrusive)
  Only show after user has interacted with field
  Never show success on empty optional fields

Multi-step forms (Manual Upload):
  Validate current step before advancing
  Never allow advancing with errors
  Show step progress: Stepper component (componentry.dev)
  Allow going back without losing data (Zustand state)
```

---

## 12. EMPTY & ERROR STATES

### 12.1 Empty State Anatomy

```
Every list, table, and data view needs an empty state:

[Icon — 64px, muted, relevant to content]
[Heading — heading-sm, color-text-secondary]
[Body — body-sm, color-text-muted, max-width 280px, centered]
[CTA button — optional, Secondary variant]

Examples:
  Subjects (no syllabus) →
    icon: BookOpen
    heading: "No subjects yet"
    body: "Sync a syllabus PDF or enter it manually."
    cta: "Sync Syllabus"

  Performance (no scores) →
    icon: BarChart2
    heading: "No scores recorded"
    body: "Enter course outcome scores to see performance."
    cta: "Enter Scores"
```

### 12.2 Error State Anatomy

```
Inline error (field level):
  <AlertCircle 14px color-status-error> message

Component error (card/section level):
  [Icon — AlertTriangle 32px, color-status-warning]
  [Heading — "Could not load data"]
  [Body — specific reason + action]
  [Retry button — Secondary variant]

Page error (full screen):
  Centered layout
  Icon: 64px
  Code: mono-md, muted (optional)
  Heading: heading-md
  Body: body-md, muted
  Actions: Primary + Ghost buttons
```

---

## 13. ACCESSIBILITY RULES

```
Contrast:
  Normal text (< 18px): minimum 4.5:1
  Large text (≥ 18px bold or ≥ 24px): minimum 3:1
  UI components and graphics: minimum 3:1
  Test with Figma contrast plugin before shipping

Focus management:
  Visible 2px focus ring on ALL interactive elements
  Focus ring color: color-border-focus
  focus-visible:ring-2 focus-visible:ring-blue-400
  focus-visible:ring-offset-2 focus-visible:ring-offset-dark-950
  Modals: trap focus inside when open
  Drawers: trap focus inside when open
  On close: return focus to trigger element

Keyboard navigation:
  Tab order follows visual reading order
  All interactive elements reachable by Tab
  Modals closeable with Escape
  Dropdowns navigable with arrow keys

Screen readers:
  All images have alt text (or alt="" if decorative)
  Icon-only buttons have aria-label
  Form fields have associated <label>
  Error messages: aria-live="polite"
  Loading states: aria-busy="true" on container
  Dynamic content: aria-live regions where needed
  Status badges: include text, not just color

Reduced motion:
  All Anime.js animations: check
    window.matchMedia('(prefers-reduced-motion: reduce)')
  All Magic UI effects: same check
  CSS animations: @media (prefers-reduced-motion: reduce)
    pause or disable
```

---

## 14. PERFORMANCE RULES

```
Images:
  Always use next/image
  Always provide width and height
  Lazy load below the fold
  Use WebP format
  Placeholder: blur data URL

Fonts:
  Inter via next/font/google (zero layout shift)
  Subset: latin only
  display: swap

Code splitting:
  Dynamic import for: PDF viewer,
  data tables, heavy chart components
  import dynamic from 'next/dynamic'
  Loading fallback: skeleton component

Bundle rules:
  No library imported in full if tree-shakeable
  Anime.js: import only used functions
  shadcn: import only used components
  Lucide: import individual icons, never lucide-react/*

Rendering:
  Static pages (no user data): SSG
  Authenticated pages: SSR or CSR with skeleton
  Tables with large datasets:
    virtualize with react-virtual

Core Web Vitals targets:
  LCP: < 2.5s
  FID: < 100ms
  CLS: 0 (no layout shift)
  Lighthouse Performance: ≥ 90
  Lighthouse Accessibility: ≥ 95
```

---

## 15. NAMING CONVENTIONS

```
Files:
  Components:   PascalCase.tsx      (SubjectCard.tsx)
  Pages:        page.tsx            (Next.js App Router)
  Hooks:        camelCase.ts        (useSubjects.ts)
  Utilities:    camelCase.ts        (formatGrade.ts)
  Constants:    SCREAMING_SNAKE.ts  (GRADE_THRESHOLDS.ts)
  Types:        PascalCase.types.ts (Subject.types.ts)
  Stores:       camelCase.store.ts  (subjects.store.ts)
  Schemas:      camelCase.schema.ts (login.schema.ts)

Variables:
  Components: PascalCase
  Functions:  camelCase
  Constants:  SCREAMING_SNAKE_CASE
  Types/Interfaces: PascalCase, prefix I for interfaces
  Boolean props: prefix is/has/can/should
    (isLoading, hasError, canEdit, shouldAnimate)

CSS classes:
  Tailwind utilities only
  Custom classes: kebab-case
  BEM for complex custom CSS:
    block__element--modifier

Component props:
  Never: data, item, value (too generic)
  Always: subjectData, syllabusItem, scoreValue
  Callbacks: onAction pattern (onSubmit, onChange,
    onSyllabusSync, onTopicStatusChange)
```

---

## 16. QA CHECKLIST

Before any component, page, or feature is considered done,
verify every item below. Mark ✅ or ❌:

```
VISUAL
  ☐ Matches Figma design — colors, spacing, typography
  ☐ No hardcoded colors or sizes
  ☐ Correct glass variant applied
  ☐ Correct border radius on all elements
  ☐ Correct shadow on elevated elements
  ☐ Hover states visible and correct
  ☐ Active/selected states visible and correct

RESPONSIVE
  ☐ Tested at 1920px, 1280px, 768px, 375px
  ☐ No horizontal overflow on any breakpoint
  ☐ Touch targets ≥ 44px on mobile
  ☐ Sidebar collapses correctly
  ☐ Tables use card view on mobile

INTERACTION
  ☐ All buttons have loading states
  ☐ All forms validate before submit
  ☐ All errors display with icon + message
  ☐ All success states shown
  ☐ All async data shows skeleton while loading
  ☐ Empty states present for all data views
  ☐ Animations respect prefers-reduced-motion

ACCESSIBILITY
  ☐ Contrast ≥ 4.5:1 on all text
  ☐ Focus ring visible on all interactive elements
  ☐ All form fields have labels
  ☐ All icon-only buttons have aria-label
  ☐ Modals trap focus
  ☐ Keyboard navigation works fully

CODE
  ☐ Zero TypeScript errors
  ☐ Zero console errors or warnings
  ☐ No any types
  ☐ No unused imports
  ☐ No TODO comments
  ☐ No console.log
  ☐ No magic number values
  ☐ All async errors handled
```

---

_GOLDENSYNC Design Rules v1.0 — Team Gogola — Caraga State University CCIS_
_This file governs every UI decision. When in doubt, refer here first._
