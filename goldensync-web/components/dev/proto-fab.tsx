"use client";

// WHAT: Floating dev-only chip that opens Proto scenario controls on /dev/* routes.
// SCREEN: Hidden in production and on live app routes — only /dev pages.
// HOW: usePathname gate + Suspense wrapper; renders DemoPanel when expanded.
// KEEP: Never ship enabled in production (NODE_ENV check + route prefix).
// EDIT: Mount rules here — scenario fields stay in demo-panel.tsx.
// RISK: Low

/**
 * ProtoFab — mount DemoPanel only on /dev/* (C10).
 * FLOW: collapsed Proto chip → expand controls for all Proto fields.
 * RULE: absent in production; absent on live app routes (avoids hydration + UX clutter).
 * usePathname is Suspense-gated so root layout can prerender.
 */

import { usePathname } from "next/navigation";
import * as React from "react";

import { DemoPanel } from "@/components/dev/demo-panel";

function ProtoFabInner() {
  const pathname = usePathname();
  const [mounted, setMounted] = React.useState(false);

  React.useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) return null;
  if (!pathname?.startsWith("/dev")) return null;
  return <DemoPanel />;
}

/** Dev-only Proto switcher — `/dev/demo` and other `/dev/*` pages only. */
export function ProtoFab() {
  if (process.env.NODE_ENV === "production") return null;
  return (
    <React.Suspense fallback={null}>
      <ProtoFabInner />
    </React.Suspense>
  );
}
