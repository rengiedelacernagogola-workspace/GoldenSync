"use client"; // WHAT: React Context for live data only works on client. RISK: Medium

/**
 * Client boundary for LiveDataProvider under the (app) segment layout.
 */

import {
  LiveDataContext,
  useLiveDataState,
} from "@/hooks/use-live-data";

// WHAT: Supplies subject/semester live data to all child components via Context. HOW: useLiveDataState() builds the value object. RISK: Medium
export function LiveDataProvider({ children }: { children: React.ReactNode }) {
  const value = useLiveDataState();
  return (
    <LiveDataContext.Provider value={value}>{children}</LiveDataContext.Provider>
  );
}

// WHAT: Same as LiveDataProvider — name used by (app)/layout.tsx. KEEP: Export name matches import in layout.
export function AppLiveDataProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  return <LiveDataProvider>{children}</LiveDataProvider>;
}
