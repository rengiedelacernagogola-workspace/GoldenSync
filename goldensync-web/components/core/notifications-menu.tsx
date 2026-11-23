"use client";

/**
 * NotificationsMenu — bell + dropdown of system activities.
 */

import {
  Bell,
  BookOpen,
  CalendarDays,
  NotebookPen,
  User,
} from "lucide-react";
import * as React from "react";

import { Button } from "@/components/core/button";
import { Menu } from "@/components/core/menu";
import {
  formatActivityTime,
  loadActivities,
  markActivitiesRead,
  type ActivityItem,
  type ActivityKind,
  unreadActivityCount,
} from "@/lib/activity/activity-log";
import { cn } from "@/lib/utils";

export interface NotificationsMenuProps {
  className?: string;
  /** Bump to refresh list after an action. */
  refreshKey?: number;
}

function kindIcon(kind: ActivityKind) {
  switch (kind) {
    case "subject":
      return <BookOpen className="size-3.5" aria-hidden />;
    case "notes":
      return <NotebookPen className="size-3.5" aria-hidden />;
    case "semester":
      return <CalendarDays className="size-3.5" aria-hidden />;
    case "account":
      return <User className="size-3.5" aria-hidden />;
    default:
      return <Bell className="size-3.5" aria-hidden />;
  }
}

/** TopBar notifications: click bell → activity dropdown. */
export function NotificationsMenu({
  className,
  refreshKey = 0,
}: NotificationsMenuProps) {
  const [open, setOpen] = React.useState(false);
  const [items, setItems] = React.useState<ActivityItem[]>([]);
  const rootRef = React.useRef<HTMLDivElement>(null);

  React.useEffect(() => {
    let cancelled = false;
    const handle = window.setTimeout(() => {
      void loadActivities().then((next) => {
        if (!cancelled) setItems(next);
      });
    }, 0);
    return () => {
      cancelled = true;
      window.clearTimeout(handle);
    };
  }, [refreshKey, open]);

  React.useEffect(() => {
    if (!open) return;
    function onDoc(e: MouseEvent) {
      if (!rootRef.current?.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") setOpen(false);
    }
    document.addEventListener("mousedown", onDoc);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onDoc);
      document.removeEventListener("keydown", onKey);
    };
  }, [open]);

  const unread = unreadActivityCount(items);

  function handleOpen() {
    setOpen((o) => {
      const next = !o;
      if (next) {
        void markActivitiesRead().then(setItems);
      }
      return next;
    });
  }

  return (
    <div
      ref={rootRef}
      data-slot="gs-notifications"
      className={cn("relative", className)}
    >
      <Button
        variant="IconOnly"
        size="sm"
        aria-label={
          unread > 0
            ? `Notifications, ${unread} unread`
            : "Notifications"
        }
        aria-expanded={open}
        aria-haspopup="menu"
        onClick={handleOpen}
        className="relative"
      >
        <Bell className="size-4" aria-hidden />
        {unread > 0 ? (
          <span
            className="absolute right-1 top-1 size-1.5 rounded-full bg-status-error"
            aria-hidden
          />
        ) : null}
      </Button>
      {open ? (
        <Menu
          className="absolute right-0 top-full z-50 mt-space-2 w-72"
          role="menu"
          aria-label="Activity"
        >
          <div className="border-b border-border-subtle px-space-3 py-space-2">
            <p className="text-[11px] font-semibold tracking-tight text-text-primary">
              Activity
            </p>
          </div>
          <ul className="max-h-72 overflow-y-auto py-space-1">
            {items.length === 0 ? (
              <li className="px-space-3 py-space-4 text-[11px] tracking-tight text-text-muted">
                No activity yet.
              </li>
            ) : (
              items.map((item) => (
                <li
                  key={item.id}
                  role="menuitem"
                  className="flex gap-space-2 px-space-3 py-space-2"
                >
                  <span className="mt-0.5 text-text-muted">
                    {kindIcon(item.kind)}
                  </span>
                  <div className="min-w-0 flex-1">
                    <p className="text-[11px] font-medium tracking-tight text-text-primary">
                      {item.title}
                    </p>
                    <p className="truncate text-[10px] tracking-tight text-text-muted">
                      {item.detail}
                    </p>
                    <p className="mt-0.5 text-[10px] tracking-tight text-text-disabled">
                      {formatActivityTime(item.createdAt)}
                    </p>
                  </div>
                </li>
              ))
            )}
          </ul>
        </Menu>
      ) : null}
    </div>
  );
}
