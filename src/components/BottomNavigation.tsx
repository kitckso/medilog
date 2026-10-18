// components/BottomNavigation.tsx
import { CalendarDaysIcon, CogIcon, PillIcon, SettingsIcon } from "lucide-react";
import React from "react";
import type { AppView } from "../types";

interface BottomNavigationProps {
  currentView: AppView;
  onNavigate: (view: AppView) => void;
}

const NAV_ITEMS: { view: AppView; label: string; icon: React.ElementType }[] = [
  { view: "record", label: "Record", icon: PillIcon },
  { view: "history", label: "History", icon: CalendarDaysIcon },
  { view: "manage", label: "Manage", icon: CogIcon },
  { view: "settings", label: "Settings", icon: SettingsIcon },
];

/**
 * Floating segmented nav: a single outlined card instead of a full-width bar,
 * with the active tab tinted rather than filled.
 */
const BottomNavigation: React.FC<BottomNavigationProps> = ({ currentView, onNavigate }) => {
  return (
    <nav
      className="z-10 shrink-0 px-3 pt-1"
      style={{ paddingBottom: "max(0.5rem, env(safe-area-inset-bottom))" }}
    >
      <div className="mx-auto grid w-full max-w-2xl grid-cols-4 gap-[3px] rounded-2xl border border-border bg-background/80 p-1 shadow-float backdrop-blur-xl backdrop-saturate-150">
        {NAV_ITEMS.map(({ view, label, icon: Icon }) => {
          const isActive = currentView === view;
          return (
            <button
              key={view}
              type="button"
              onClick={() => onNavigate(view)}
              aria-current={isActive ? "page" : undefined}
              aria-label={`Navigate to ${label}`}
              className={`flex flex-col items-center gap-0.5 rounded-xl py-2 text-[10.5px] font-medium transition-colors outline-none focus-visible:ring-[3px] focus-visible:ring-ring/50 ${
                isActive ? "bg-primary/10 text-primary" : "text-muted-foreground hover:bg-accent/60"
              }`}
            >
              <Icon className="size-[19px]" aria-hidden="true" />
              {label}
            </button>
          );
        })}
      </div>
    </nav>
  );
};

export default BottomNavigation;
