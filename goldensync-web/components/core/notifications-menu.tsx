"use client";

/**
 * NotificationsMenu — bell + dropdown of system activities.
 */

import {
  ArrowDownUp,
  Bell,
  BookOpen,
  CalendarDays,
  NotebookPen,
  Trash2,
  User,
} from "lucide-react";
import * as React from "react";

import { Button } from "@/components/core/button";
import { Menu } from "@/components/core/menu";
import {
  deleteActivity,
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

type SortOrder = "newest" | "oldest";

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
  const [sortOrder, setSortOrder] = React.useState<SortOrder>("newest");
  const [busy, setBusy] = React.useState(false);
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

  const sortedItems = React.useMemo(() => {
    const list = [...items];
    list.sort((a, b) =>
      sortOrder === "newest"
        ? b.createdAt - a.createdAt
        : a.createdAt - b.createdAt,
    );
    return list;
  }, [items, sortOrder]);

  function handleOpen() {
    setOpen((o) => {
      const next = !o;
      if (next) {
        void markActivitiesRead().then(setItems);
      }
      return next;
    });
  }

  function toggleSort(e: React.MouseEvent) {
    e.stopPropagation();
    setSortOrder((s) => (s === "newest" ? "oldest" : "newest"));
  }

  async function handleDeleteOne(e: React.MouseEvent, id: string) {
    e.stopPropagation();
    if (busy) return;
    setBusy(true);
    try {
      const next = await deleteActivity(id);
      setItems(next);
    } finally {
      setBusy(false);
    }
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
          <div className="flex items-center gap-space-2 border-b border-border-subtle px-space-3 py-space-2">
            <p className="min-w-0 flex-1 text-[11px] font-semibold tracking-tight text-text-primary">
              Activity
            </p>
            <Button
              variant="IconOnly"
              size="sm"
              aria-label={
                sortOrder === "newest"
                  ? "Sort oldest first"
                  : "Sort newest first"
              }
              title={sortOrder === "newest" ? "Newest" : "Oldest"}
              onClick={toggleSort}
              className="size-7 shrink-0 text-text-muted hover:text-text-primary"
            >
              <ArrowDownUp className="size-3.5" aria-hidden />
            </Button>
          </div>
          <ul className="max-h-72 overflow-y-auto py-space-1">
            {sortedItems.length === 0 ? (
              <li className="px-space-3 py-space-4 text-[11px] tracking-tight text-text-muted">
                No activity yet.
              </li>
            ) : (
              sortedItems.map((item) => (
                <li
                  key={item.id}
                  role="menuitem"
                  className="group flex gap-space-2 px-space-3 py-space-2"
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
                  <Button
                    variant="IconOnly"
                    size="sm"
                    aria-label={`Delete ${item.title}`}
                    disabled={busy}
                    onClick={(e) => handleDeleteOne(e, item.id)}
                    className="size-7 shrink-0 self-start text-text-muted opacity-0 hover:text-status-error group-hover:opacity-100 group-focus-within:opacity-100 focus-visible:opacity-100 disabled:opacity-40"
                  >
                    <Trash2 className="size-3.5" aria-hidden />
                  </Button>
                </li>
              ))
            )}
          </ul>
        </Menu>
      ) : null}
    </div>
  );
}
