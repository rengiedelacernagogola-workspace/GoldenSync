"use client"; // WHAT: Browser-only component (state for configure menu). RISK: Medium

/**
 * Sidebar — app shell nav (Figma `21:485`, UI-022).
 * Flows: shell collapse / drawer close / subject switch / module jump.
 * Proto: subjectSelected gates module items (Home + Add Subject stay on).
 * Edit nav order in MODULE_ITEMS; visuals on NavItem / SubjectSwitcher.
 */

import {
  BookOpen,
  CalendarClock,
  Calculator,
  CalendarDays,
  ChevronRight,
  Download,
  LayoutDashboard,
  LogOut,
  MoreHorizontal,
  PanelLeftClose,
  PanelLeftOpen,
  SquareCheck,
  StickyNote,
  TableProperties,
  Target,
  User,
  Users,
  X,
} from "lucide-react";
import * as React from "react";

import { Button } from "@/components/core/button";
import { Menu } from "@/components/core/menu";
import { MenuItem } from "@/components/core/menu-item";
import { NavItem } from "@/components/core/nav-item";
import { SubjectSwitcher } from "@/components/core/subject-switcher";
import { cn } from "@/lib/utils";

// WHAT: Three layouts — full width, icon-only, or mobile drawer. EDIT: Add variant only with design approval. RISK: Medium
export type SidebarVariant = "Expanded" | "Collapsed" | "Drawer";

// WHAT: IDs for each nav target; parent uses these for routing/highlight. KEEP: Must match app routes. RISK: Medium
export type SidebarActiveId =
  | "home"
  | "overview"
  | "outcomes"
  | "plan"
  | "notes"
  | "policies"
  | "faculty"
  | "grade-calculator"
  | "checklist"
  | "export"
  | "my-schedule"
  | "calculator"
  | "add-subject"
  | "edit-subject"
  | "archive-subject"
  | "delete-subject"
  | "account"
  | "logout";

export interface SidebarProps extends React.HTMLAttributes<HTMLElement> {
  variant?: SidebarVariant;
  /** When false, module nav (except Home / Add Subject) is disabled. */
  subjectSelected?: boolean;
  activeId?: SidebarActiveId;
  subjectCode?: string;
  subjectTitle?: string;
  switcherOpen?: boolean;
  onToggleCollapse?: () => void;
  onCloseDrawer?: () => void;
  onNav?: (id: SidebarActiveId) => void;
  onSwitcherClick?: () => void;
}

// WHAT: List of subject modules in the sidebar. EDIT: Reorder or relabel here; icons from lucide-react. RISK: Low
const MODULE_ITEMS: {
  id: SidebarActiveId;
  label: string;
  icon: React.ReactNode;
}[] = [
  { id: "overview", label: "Overview", icon: <BookOpen /> },
  { id: "outcomes", label: "Outcomes", icon: <Target /> },
  {
    id: "plan",
    label: "Learning Plan",
    icon: <CalendarDays />,
  },
  { id: "notes", label: "Notes", icon: <StickyNote /> },
  { id: "faculty", label: "College Faculty", icon: <Users /> },
  { id: "grade-calculator", label: "Grade Calculator", icon: <Calculator /> },
  { id: "checklist", label: "Checklist", icon: <SquareCheck /> },
  { id: "export", label: "Export", icon: <Download /> },
  { id: "my-schedule", label: "My Schedule", icon: <CalendarClock /> },
  { id: "calculator", label: "Grading System", icon: <TableProperties /> },
];

/** Shell sidebar — Expanded | Collapsed | Drawer. Wire Proto from the app layout. */
// WHAT: Left navigation column. SCREEN: Logo, Home, subject switcher, modules, Account, Log out. HOW: onNav(id) tells parent which link was clicked. RISK: Medium
export function Sidebar({
  className,
  variant = "Expanded",
  subjectSelected = true,
  activeId = "home",
  subjectCode = "ITE 14",
  subjectTitle = "Integrative Programming",
  switcherOpen = false,
  onToggleCollapse,
  onCloseDrawer,
  onNav,
  onSwitcherClick,
  ...props
}: SidebarProps) {
  const collapsed = variant === "Collapsed";
  const isDrawer = variant === "Drawer";
  // RULE: proto/subjectSelected false → disable modules (not Home / Add Subject)
  // HOW: No subject picked yet → grey out module links (user must pick subject first).
  const modulesDisabled = !subjectSelected;
  // WHAT: Local state for Edit/Archive/Delete dropdown under "Configure Information".
  const [configureOpen, setConfigureOpen] = React.useState(false);

  const toggleLabel =
    variant === "Expanded"
      ? "Collapse sidebar"
      : variant === "Collapsed"
        ? "Expand sidebar"
        : "Close navigation";

  return (
    <aside
      data-slot="gs-sidebar"
      data-variant={variant}
      className={cn(
        "relative flex flex-col gap-space-4 overflow-hidden bg-bg-elevated",
        "text-ui antialiased",
        isDrawer
          ? "h-full w-[375px] items-stretch p-space-4"
          : collapsed
            ? "h-full w-14 items-center border-r border-border-subtle px-space-2 py-space-3"
            : "h-full w-56 items-stretch border-r border-border-subtle px-space-4 py-space-3",
        className,
      )}
      {...props}
    >
      {/* Logo row */}
      <div
        data-slot="gs-sidebar-logo-row"
        className={cn(
          "relative flex h-8 w-full shrink-0 items-center gap-space-2",
          collapsed ? "justify-center" : "justify-start",
        )}
      >
        {!collapsed ? (
          <>
            <span className="flex size-4 shrink-0 items-center justify-center rounded-md bg-accent-primary text-ui-sm font-semibold text-text-inverse">
              G
            </span>
            <span className="text-ui font-semibold antialiased whitespace-nowrap text-text-primary">
              GoldenSync
            </span>
          </>
        ) : null}
        <Button
          variant="IconOnly"
          size="md"
          aria-label={toggleLabel}
          className={cn(
            "absolute top-1/2 -translate-y-1/2",
            collapsed ? "left-1/2 -translate-x-1/2" : "right-0",
          )}
          onClick={isDrawer ? onCloseDrawer : onToggleCollapse}
        >
          {variant === "Expanded" ? (
            <PanelLeftClose className="size-4" aria-hidden />
          ) : variant === "Collapsed" ? (
            <PanelLeftOpen className="size-4" aria-hidden />
          ) : (
            <X className="size-4" aria-hidden />
          )}
        </Button>
      </div>

      {/* Nav list */}
      <nav
        data-slot="gs-sidebar-nav"
        className={cn(
          "flex min-h-0 w-full flex-1 flex-col justify-between overflow-x-clip overflow-y-auto",
          collapsed ? "items-center" : "items-stretch",
        )}
      >
        <NavItem
          label="Home"
          icon={<LayoutDashboard />}
          collapsed={collapsed}
          active={activeId === "home"}
          className={collapsed ? undefined : "w-full"}
          onClick={() => onNav?.("home")}
        />
        <SubjectSwitcher
          code={subjectCode}
          title={subjectTitle}
          collapsed={collapsed}
          open={switcherOpen}
          disabled={!subjectSelected && !switcherOpen}
          className={collapsed ? undefined : "w-full"}
          onClick={onSwitcherClick}
        />
        {MODULE_ITEMS.map((item) => (
          <NavItem
            key={item.id}
            label={item.label}
            icon={item.icon}
            collapsed={collapsed}
            active={activeId === item.id}
            disabled={modulesDisabled}
            className={collapsed ? undefined : "w-full"}
            onClick={() => onNav?.(item.id)}
          />
        ))}
        <div
          aria-hidden
          className="h-px w-full shrink-0 bg-border-subtle"
        />
        <div
          data-slot="gs-sidebar-configure"
          className={cn(
            "relative flex w-full flex-col",
            collapsed ? "items-center" : "items-stretch",
          )}
        >
          {collapsed ? (
            <button
              type="button"
              disabled={modulesDisabled}
              aria-label="Configure Information"
              aria-expanded={configureOpen}
              aria-haspopup="menu"
              className={cn(
                "flex size-11 shrink-0 items-center justify-center rounded-md",
                "text-text-muted outline-none transition-colors",
                "hover:bg-bg-muted hover:text-text-primary",
                "focus-visible:border-2 focus-visible:border-border-focus",
                configureOpen && "bg-bg-muted text-text-primary",
                modulesDisabled && "pointer-events-none opacity-40",
              )}
              onClick={() => setConfigureOpen((o) => !o)}
            >
              <MoreHorizontal className="size-4" aria-hidden />
            </button>
          ) : (
            <div
              className={cn(
                "flex h-8 w-full items-center justify-start gap-space-1 rounded-md",
                "bg-bg-muted px-space-2 text-ui antialiased text-text-secondary",
                modulesDisabled && "pointer-events-none opacity-40",
              )}
            >
              <button
                type="button"
                disabled={modulesDisabled}
                aria-expanded={configureOpen}
                className={cn(
                  "flex min-w-0 flex-1 items-center justify-start gap-space-1 rounded-sm",
                  "px-space-1 py-space-1 text-left outline-none",
                  "hover:text-text-primary focus-visible:text-text-primary",
                )}
                onClick={() => setConfigureOpen((o) => !o)}
              >
                <span className="truncate text-text-secondary">
                  Configure Information
                </span>
                <ChevronRight
                  className={cn(
                    "size-3.5 shrink-0 text-text-muted transition-transform",
                    configureOpen && "rotate-90",
                  )}
                  aria-hidden
                />
              </button>
              <button
                type="button"
                disabled={modulesDisabled}
                aria-label="Configure Information actions"
                aria-haspopup="menu"
                aria-expanded={configureOpen}
                className={cn(
                  "flex size-6 shrink-0 items-center justify-center rounded-sm",
                  "text-text-muted outline-none",
                  "hover:bg-bg-elevated hover:text-text-primary",
                  "focus-visible:border focus-visible:border-border-focus",
                )}
                onClick={() => setConfigureOpen((o) => !o)}
              >
                <MoreHorizontal className="size-4" aria-hidden />
              </button>
            </div>
          )}
          {/* WHAT: Edit / Archive / Delete actions for current subject. */}
          {configureOpen && !modulesDisabled ? (
            <Menu
              aria-label="Configure Information"
              className={cn(
                "z-40 mt-space-1",
                collapsed
                  ? "absolute top-full left-full ml-space-2"
                  : "w-full",
              )}
            >
              <MenuItem
                label="Edit"
                className="text-ui antialiased"
                onClick={() => {
                  setConfigureOpen(false);
                  onNav?.("edit-subject");
                }}
              />
              <MenuItem
                label="Archive"
                className="text-ui antialiased"
                onClick={() => {
                  setConfigureOpen(false);
                  onNav?.("archive-subject");
                }}
              />
              <MenuItem
                label="Delete"
                destructive
                className="text-ui antialiased"
                onClick={() => {
                  setConfigureOpen(false);
                  onNav?.("delete-subject");
                }}
              />
            </Menu>
          ) : null}
        </div>
      </nav>

      <div aria-hidden className="h-px w-full shrink-0" />

      <div
        data-slot="gs-sidebar-bottom"
        className={cn(
          "flex w-full shrink-0 flex-col gap-space-1 border-t border-border-subtle pt-space-2",
          collapsed ? "items-center" : "items-stretch",
        )}
      >
        <NavItem
          label="Account"
          icon={<User />}
          collapsed={collapsed}
          active={activeId === "account"}
          className={collapsed ? undefined : "w-full"}
          onClick={() => onNav?.("account")}
        />
        <NavItem
          label="Log out"
          icon={<LogOut />}
          collapsed={collapsed}
          active={activeId === "logout"}
          className={collapsed ? undefined : "w-full"}
          onClick={() => onNav?.("logout")}
        />
      </div>
    </aside>
  );
}
