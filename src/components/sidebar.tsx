"use client";

import {
  IconLayoutSidebar,
  IconMessage,
  IconPlus,
  IconSearch,
  IconSettings,
} from "@tabler/icons-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { cn } from "@/lib/utils";
import { Button } from "./ui/button";

const mockHistory = [
  { id: "1", title: "How does React Server Components work?", date: "Today" },
  { id: "2", title: "Help me write a Python script", date: "Today" },
  { id: "3", title: "Explain async/await in JavaScript", date: "Yesterday" },
  { id: "4", title: "Design a REST API for a blog", date: "Yesterday" },
  { id: "5", title: "CSS Grid vs Flexbox comparison", date: "Previous 7 Days" },
];

export default function Sidebar() {
  const [collapsed, setCollapsed] = useState(false);
  const pathname = usePathname();

  const grouped = mockHistory.reduce(
    (acc, item) => {
      if (!acc[item.date]) acc[item.date] = [];
      acc[item.date].push(item);
      return acc;
    },
    {} as Record<string, typeof mockHistory>,
  );

  return (
    <aside
      className={cn(
        "flex h-screen flex-col border-r border-border bg-sidebar transition-all duration-200",
        collapsed ? "w-[52px]" : "w-[260px]",
      )}
    >
      {/* Top bar */}
      <div className="flex h-14 items-center justify-between px-2">
        <Button
          variant="ghost"
          size="icon"
          onClick={() => setCollapsed(!collapsed)}
          className="rounded-lg text-sidebar-foreground/70 hover:text-sidebar-foreground"
          aria-label="Toggle sidebar"
        >
          <IconLayoutSidebar className="size-5" />
        </Button>

        {!collapsed && (
          <div className="flex items-center gap-1">
            <Button
              variant="ghost"
              size="icon"
              className="rounded-lg text-sidebar-foreground/70 hover:text-sidebar-foreground"
              aria-label="Search"
            >
              <IconSearch className="size-5" />
            </Button>
            <Link href="/">
              <Button
                variant="ghost"
                size="icon"
                className="rounded-lg text-sidebar-foreground/70 hover:text-sidebar-foreground"
                aria-label="New chat"
              >
                <IconPlus className="size-5" />
              </Button>
            </Link>
          </div>
        )}
      </div>

      {/* Collapsed: just icon buttons */}
      {collapsed && (
        <div className="flex flex-col items-center gap-1 px-2 pt-1">
          <Link href="/">
            <Button
              variant="ghost"
              size="icon"
              className="rounded-lg text-sidebar-foreground/70 hover:text-sidebar-foreground"
              aria-label="New chat"
            >
              <IconPlus className="size-5" />
            </Button>
          </Link>
          <Button
            variant="ghost"
            size="icon"
            className="rounded-lg text-sidebar-foreground/70 hover:text-sidebar-foreground"
            aria-label="Search"
          >
            <IconSearch className="size-5" />
          </Button>
        </div>
      )}

      {/* Chat history */}
      {!collapsed && (
        <nav className="flex-1 overflow-y-auto px-2 pb-2">
          {Object.entries(grouped).map(([date, items]) => (
            <div key={date} className="mt-4 first:mt-2">
              <p className="mb-1 px-2 text-xs font-medium text-sidebar-foreground/50">
                {date}
              </p>
              {items.map((item) => (
                <button
                  key={item.id}
                  type="button"
                  className={cn(
                    "group flex w-full items-center gap-2 rounded-lg px-2 py-2 text-left text-sm text-sidebar-foreground/80 transition-colors hover:bg-sidebar-accent hover:text-sidebar-foreground",
                    pathname === `/chat/${item.id}` &&
                      "bg-sidebar-accent text-sidebar-foreground",
                  )}
                >
                  <IconMessage className="size-4 shrink-0 opacity-50" />
                  <span className="truncate">{item.title}</span>
                </button>
              ))}
            </div>
          ))}
        </nav>
      )}

      {/* Bottom */}
      {!collapsed && (
        <div className="border-t border-sidebar-border px-2 py-2">
          <button
            type="button"
            className="flex w-full items-center gap-2 rounded-lg px-2 py-2 text-sm text-sidebar-foreground/70 transition-colors hover:bg-sidebar-accent hover:text-sidebar-foreground"
          >
            <IconSettings className="size-4" />
            Settings
          </button>
        </div>
      )}
    </aside>
  );
}
