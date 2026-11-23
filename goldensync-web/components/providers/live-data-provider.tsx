"use client";

/**
 * Client boundary for LiveDataProvider under the (app) segment layout.
 */

import {
  LiveDataContext,
  useLiveDataState,
} from "@/hooks/use-live-data";

export function LiveDataProvider({ children }: { children: React.ReactNode }) {
  const value = useLiveDataState();
  return (
    <LiveDataContext.Provider value={value}>{children}</LiveDataContext.Provider>
  );
}

export function AppLiveDataProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  return <LiveDataProvider>{children}</LiveDataProvider>;
}
