"use client";

/**
 * /dev/demo — Proto Demo Panel host (C10).
 * Also mount DemoPanel on app pages during prototype QA.
 */

import Link from "next/link";


export default function DemoPage() {
  return (
    <div className="bg-ambient relative flex min-h-screen flex-col gap-space-6 bg-bg-base p-space-8 text-text-primary">
      <h1 className="text-display-sm">Proto Demo Panel</h1>
      <p className="max-w-xl text-body-sm text-text-secondary">
        Flip Proto variables here, then open{" "}
        <Link href="/dashboard" className="text-accent-primary underline">
          Dashboard
        </Link>
        ,{" "}
        <Link href="/sign-in" className="text-accent-primary underline">
          Sign in
        </Link>
        , or{" "}
        <Link href="/calculator" className="text-accent-primary underline">
          Calculator
        </Link>{" "}
        to see branches.
      </p>
    </div>
  );
}
