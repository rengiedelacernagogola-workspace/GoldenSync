/**
 * Authenticated app segment layout — shared live subject list for the switcher.
 */

// WHAT: Loads provider that shares live subject data across dashboard pages. RISK: Medium — data for whole app area.
import { AppLiveDataProvider } from "@/components/providers/live-data-provider";

// WHAT: Layout for routes inside (app) folder (logged-in area). HOW: Wraps all child pages with live data context. EDIT: Add more providers here only with care. RISK: Medium
export default function AppSegmentLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <AppLiveDataProvider>{children}</AppLiveDataProvider>;
}
