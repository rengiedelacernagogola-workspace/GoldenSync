/**
 * Authenticated app segment layout — shared live subject list for the switcher.
 */

import { AppLiveDataProvider } from "@/components/providers/live-data-provider";

export default function AppSegmentLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <AppLiveDataProvider>{children}</AppLiveDataProvider>;
}
