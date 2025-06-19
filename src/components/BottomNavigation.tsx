// components/BottomNavigation.tsx
import { CalendarDaysIcon, CogIcon, PillIcon, SettingsIcon } from 'lucide-react';
import React from 'react';
import type { AppView } from '../types';
import { Button } from './ui/button'; // Import Shadcn Button

interface BottomNavigationProps {
  currentView: AppView;
  onNavigate: (view: AppView) => void;
}

const BottomNavigation: React.FC<BottomNavigationProps> = ({ currentView, onNavigate }) => {
  const navItems = [
    { view: 'record' as AppView, label: 'Record', icon: PillIcon },
    { view: 'history' as AppView, label: 'History', icon: CalendarDaysIcon },
    { view: 'manage' as AppView, label: 'Manage', icon: CogIcon },
    { view: 'settings' as AppView, label: 'Settings', icon: SettingsIcon },
  ];

  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-white shadow-top flex justify-around p-2 border-t border-slate-200 z-50">
      {navItems.map(item => {
        const isActive = currentView === item.view;
        const IconComponent = item.icon;
        return (
          <Button
            key={item.view}
            variant="ghost" // Use ghost variant for a cleaner look
            onClick={() => onNavigate(item.view)}
            className={`flex flex-col items-center justify-center p-2 rounded-lg w-1/4 h-auto
                        ${isActive ? 'text-sky-600 bg-sky-100 hover:bg-sky-100/90' : 'text-slate-600 hover:bg-slate-100'}`}
            aria-label={`Navigate to ${item.label}`}
          >
            <IconComponent className={`w-6 h-6 mb-1 ${isActive ? 'text-sky-600' : 'text-slate-500'}`} />
            <span className={`text-xs font-medium ${isActive ? 'text-sky-700' : 'text-slate-700'}`}>
              {item.label}
            </span>
          </Button>
        );
      })}
    </nav>
  );
};

export default BottomNavigation;