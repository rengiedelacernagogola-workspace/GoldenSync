/**
 * Dev-only tokens preview — UI-006.
 * Route: /dev/tokens. Not linked from product UI. Remove or gate harder before prod.
 * Figma twin: Tokens Documentation `2:2`.
 */

import { appendixA } from "@/copy";
import { goldenSyncSeed } from "@/data/seed";
import { PROTO_DEFAULTS } from "@/state";

const primitiveSwatches = [
  "primitive-black",
  "primitive-white",
  "primitive-blue-400",
  "primitive-purple-400",
  "primitive-cyan-400",
  "primitive-dark-950",
  "primitive-dark-900",
  "primitive-dark-800",
  "primitive-dark-700",
  "primitive-dark-600",
  "primitive-gray-500",
  "primitive-gray-400",
  "primitive-gray-300",
  "primitive-green-400",
  "primitive-yellow-400",
  "primitive-red-400",
] as const;

const semanticSwatches = [
  "bg-base",
  "bg-elevated",
  "bg-overlay",
  "bg-subtle",
  "bg-muted",
  "surface-glass",
  "accent-primary",
  "status-success",
  "status-warning",
  "status-error",
  "text-primary",
] as const;

/** Lists token swatches and foundation smoke checks for C1. */
export default function DevTokensPage() {
  return (
    <main className="bg-ambient mx-auto flex w-full max-w-5xl flex-col gap-space-12 p-space-8">
      <header className="flex flex-col gap-space-2">
        <p className="text-overline text-text-muted">Dev only · UI-006</p>
        <h1 className="text-display-sm text-text-primary">Tokens preview</h1>
        <p className="text-body-md text-text-secondary">
          Figma Tokens doc <span className="text-mono-sm">2:2</span>. Product
          screens must not link here.
        </p>
      </header>

      <section className="flex flex-col gap-space-4">
        <h2 className="text-heading-xl text-text-primary">Primitives</h2>
        <div className="grid grid-cols-2 gap-space-3 sm:grid-cols-4 md:grid-cols-8">
          {primitiveSwatches.map((name) => (
            <div key={name} className="flex flex-col gap-space-2">
              <div
                className="border-border-subtle h-space-16 w-full rounded-md border"
                style={{ backgroundColor: `var(--${name})` }}
              />
              <span className="text-mono-sm text-text-muted">{name}</span>
            </div>
          ))}
        </div>
      </section>

      <section className="flex flex-col gap-space-4">
        <h2 className="text-heading-xl text-text-primary">Semantic</h2>
        <div className="grid grid-cols-2 gap-space-3 sm:grid-cols-4">
          {semanticSwatches.map((name) => (
            <div key={name} className="flex flex-col gap-space-2">
              <div
                className="border-border-subtle h-space-16 w-full rounded-lg border"
                style={{ backgroundColor: `var(--${name})` }}
              />
              <span className="text-mono-sm text-text-muted">{name}</span>
            </div>
          ))}
        </div>
      </section>

      <section className="glass-md flex flex-col gap-space-3 p-space-6">
        <h2 className="text-heading-lg text-text-primary">Type + glass</h2>
        <p className="text-display-md text-text-primary">display-md</p>
        <p className="text-heading-sm text-text-secondary">heading-sm</p>
        <p className="text-body-md text-text-muted">body-md muted</p>
        <p className="text-mono-md text-accent-primary">mono-md accent</p>
      </section>

      <section className="flex flex-col gap-space-2">
        <h2 className="text-heading-xl text-text-primary">Foundation smoke</h2>
        <p className="text-body-sm text-text-secondary">
          Seed subjects: {goldenSyncSeed.subjects.length} · Active:{" "}
          {goldenSyncSeed.activeSubject.id}
        </p>
        <p className="text-body-sm text-text-secondary">
          Proto defaults scenario: {PROTO_DEFAULTS.scenario} · subjectCount:{" "}
          {PROTO_DEFAULTS.subjectCount}
        </p>
        <p className="text-body-sm text-text-secondary">
          Appendix A sample: {appendixA.auth.loginThrottled}
        </p>
      </section>
    </main>
  );
}
