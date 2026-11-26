/**
 * Shell navigation helpers — map SidebarActiveId → routes.
 * FLOW: Sidebar / MobileDrawer onNav. Edit paths here when routes change.
 */

import type { SidebarActiveId } from "@/components/core";

/** Resolve sidebar id to a path for the active subject. */
export function pathForNav(
  id: SidebarActiveId,
  subjectId?: string,
): string | null {
  const sid = subjectId ?? "ite-14";
  switch (id) {
    case "home":
      return "/dashboard";
    case "overview":
      return `/subjects/${sid}/overview`;
    case "outcomes":
      return `/subjects/${sid}/outcomes`;
    case "plan":
      return `/subjects/${sid}/plan`;
    case "notes":
      return `/notes?subject=${encodeURIComponent(sid)}`;
    case "policies":
      return `/subjects/${sid}/policies`;
    case "faculty":
      return `/subjects/${sid}/faculty`;
    case "grade-calculator":
      return `/calculator?subject=${encodeURIComponent(sid)}`;
    case "checklist":
      return `/subjects/${sid}/checklist`;
    case "export":
      return `/subjects/${sid}/export`;
    case "this-week":
      return `/subjects/${sid}/this-week`;
    case "calculator":
      return `/grading-system?subject=${encodeURIComponent(sid)}`;
    case "account":
      return "/account";
    case "add-subject":
      return null; // parent opens modal
    case "edit-subject":
      return `/subjects/${sid}/edit`;
    case "archive-subject":
    case "delete-subject":
      return null;
    case "logout":
      return "/sign-in";
    default:
      return null;
  }
}
