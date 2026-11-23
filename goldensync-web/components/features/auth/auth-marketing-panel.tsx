/**
 * Auth left panel — brand + short capability highlights (sign-in / sign-up).
 */

import {
  BookOpen,
  CalendarCheck,
  Calculator,
  StickyNote,
} from "lucide-react";

const FEATURES = [
  {
    icon: BookOpen,
    text: "Turn a syllabus into a clear course overview",
  },
  {
    icon: CalendarCheck,
    text: "Plan weeks and tick what’s done",
  },
  {
    icon: StickyNote,
    text: "Pin notes that matter; archive what you’re done with",
  },
  {
    icon: Calculator,
    text: "Track grades without the spreadsheet chaos",
  },
] as const;

/** Minimal marketing column for the split auth layout. */
export function AuthMarketingPanel() {
  return (
    <section
      data-slot="gs-auth-marketing"
      className="relative flex h-full min-h-[42dvh] w-full min-w-0 flex-1 flex-col justify-center overflow-hidden px-space-5 py-space-8 sm:px-space-10 sm:py-space-10 lg:min-h-dvh lg:px-space-12 xl:px-space-16"
    >
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_20%_10%,color-mix(in_oklab,var(--accent-primary)_18%,transparent),transparent_55%),radial-gradient(ellipse_at_80%_90%,color-mix(in_oklab,var(--accent-primary)_10%,transparent),transparent_50%)]"
      />
      <div
        aria-hidden
        className="pointer-events-none absolute inset-y-0 right-0 hidden w-px bg-border-subtle lg:block"
      />

      <div className="relative z-10 flex w-full max-w-2xl flex-col gap-space-6 sm:gap-space-8 lg:max-w-none">
        <p className="text-overline uppercase tracking-[0.14em] text-accent-primary">
          GoldenSync
        </p>

        <div className="flex flex-col gap-space-3 sm:gap-space-4">
          <h1 className="text-display-md text-balance text-text-primary lg:text-display-lg">
            Stay in sync with every course.
          </h1>
          <p className="max-w-xl text-pretty text-body-md text-text-secondary sm:text-body-lg">
            GoldenSync keeps your syllabus, plan, notes, and grades in one
            place.
          </p>
        </div>

        <ul
          className="flex flex-col gap-space-3 sm:gap-space-4"
          aria-label="What you can do"
        >
          {FEATURES.map(({ icon: Icon, text }) => (
            <li key={text} className="flex min-w-0 items-start gap-space-3">
              <span className="mt-0.5 flex size-8 shrink-0 items-center justify-center rounded-md border border-border-subtle bg-bg-subtle text-accent-primary sm:size-9">
                <Icon className="size-3.5 sm:size-4" aria-hidden />
              </span>
              <span className="min-w-0 pt-1 text-body-sm text-text-primary sm:pt-1.5 sm:text-body-md">
                {text}
              </span>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
