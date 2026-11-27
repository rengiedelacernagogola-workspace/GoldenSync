// WHAT: Locked user-facing strings for prototype flows (auth, Add Subject, shell, modules, calculator).
// HOW: Nested `appendixA` object exported as const; `AppendixACopy` type mirrors the shape for typing.
// SCREEN: Login/register, Add Subject, subject switcher, This Week, Grade Calculator error/empty states.
// EDIT: Only when product plan Appendix A / Figma copy changes — keep wording character-for-character.
// KEEP: Import from `@/copy` in UI; never paste these strings directly in JSX (UI-005).
// RISK: Medium — drift from Figma/plan confuses QA and Demo Panel scenarios.
/**
 * Appendix A copy — plan strings character-for-character.
 * UI-005: import from features via copy/; never hardcode these in JSX.
 * Source: figma-prototype-system-plan.md Appendix A.
 */

export const appendixA = {
  auth: {
    loginThrottled: "Too many attempts. Try again in a few minutes.",
    loginFailed: "Email or password is incorrect.",
    resendVerification: "Resend verification",
    registerInvalid: "Fix the highlighted fields.",
    registerOrForgotSent: "If this email is eligible, we sent you a message.",
    verifySuccess: "Email verified. Please log in.",
    verifyInvalid: "Link expired or already used. Request a new one.",
    resetInvalid: "Link invalid or password too weak. Try again.",
    resetSuccess: "Password changed. Please log in.",
  },
  addSubject: {
    capReached: "Limit reached. Archive or delete a subject first.",
    uploadPrompt: "Select or drop the syllabus PDF (CSU F-CID-009).",
    scannedOrTimeout:
      "PARSE_TIMEOUT or PDF_SCANNED (looks like a scan). Retry, or use the Manual tab.",
    rejectedFileCodes:
      "PDF_INVALID, PDF_TOO_LARGE, PDF_ENCRYPTED, RATE_LIMITED. Retry, or switch to the Manual tab.",
    validationFailed:
      "VALIDATION_FAILED. Highlight the fields. Confirm stays disabled.",
    replaceSummary: "N scores copied, M not copied.",
    saveError: "System error. Rolled back. Retry (max 3).",
    created: "Subject created. Open its Overview.",
  },
  shell: {
    emptySwitcher: "Add your first subject.",
  },
  modules: {
    emptyModule: "Not in this syllabus. Edit subject to add it.",
    thisWeek:
      "BEFORE_START: starts in N days, Week 1 preview · AFTER_END: Semester ended · NO_CLASS: show the next scheduled topic · NO_PLAN_FOR_WEEK: No topic scheduled",
  },
  calculator: {
    empty: "Choose a subject, or press Add Subject.",
    invalid: "Fix the value. Nothing is saved.",
    conflict: "CONFLICT_VERSION. Reload that row and enter it again.",
    unmapped:
      "Unmapped activities are listed under Other activities and excluded from the result.",
    resultLabel: "Estimated (self-reported)",
    undefinedAtThreshold:
      "UNDEFINED_AT_THRESHOLD: no grade. The syllabus does not define this case. Confirm with your instructor.",
    interventionB:
      "best possible grade 3.0 after the weak outcomes pass",
  },
} as const;

export type AppendixACopy = typeof appendixA;
