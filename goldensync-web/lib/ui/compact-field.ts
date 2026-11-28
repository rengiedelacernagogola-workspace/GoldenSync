/**
 * WHAT: Shared Compact + light-float classes for native selects (and similar shells).
 * HOW: Match Input Compact shell — soft fill, subtle border/shadow, 11px type.
 * SCREEN: Form dropdowns that are not the core Input component.
 * EDIT: Keep in sync with inputShellVariants Compact in components/core/input.tsx.
 * KEEP: Focus ring tokens. RISK: Low — visual only.
 *
 * NOTE: Built with string join (not `cn`) so `text-ui` is not dropped as a
 * conflicting “text color” when paired with `text-text-primary`.
 */

/** Light floating shell shared by Compact Input / Textarea / select. */
export const compactFloatShellClass = [
  "border-border-subtle",
  "bg-bg-elevated/60",
  "shadow-[0_1px_2px_rgba(0,0,0,0.12)]",
  "hover:border-border-default",
].join(" ");

/** WHAT: Native `<select>` looking like Compact Input. */
export const compactSelectClass = [
  "min-h-8 w-full appearance-none rounded-md border py-1.5 pl-space-2 pr-space-2",
  "text-ui text-text-primary antialiased",
  "focus:border-border-focus focus:outline-none focus:shadow-[0_0_0_3px_var(--focus-ring-glow)]",
  compactFloatShellClass,
].join(" ");
