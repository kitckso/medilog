// components/Calendar.tsx
import React from 'react';
import { format } from 'date-fns';
import { Calendar as ShadcnCalendar } from './ui/calendar'; // Renamed to avoid conflict
import { cn } from '@/lib/utils'; // Utility for merging class names

interface CalendarProps {
  currentMonth: Date;
  onMonthChange: (newMonth: Date) => void;
  highlightedDays: Set<string>; // YYYY-MM-DD (local)
  onDateSelect: (date: Date) => void;
  selectedDate: Date | null;
}

const Calendar: React.FC<CalendarProps> = ({
  currentMonth,
  onMonthChange,
  highlightedDays,
  onDateSelect,
  selectedDate,
}) => {
  // Convert highlightedDays strings to Date objects for react-day-picker modifiers
  const modifiers = {
    highlighted: (date: Date) => {
      const dateString = format(date, 'yyyy-MM-dd');
      return highlightedDays.has(dateString);
    },
  };

  const modifiersClassNames = {
    highlighted: 'bg-green-100 text-green-700 font-semibold relative',
  };

  return (
    <div className="flex justify-center items-center bg-white p-4 rounded-lg shadow">
      <ShadcnCalendar
        mode="single"
        month={currentMonth}
        onMonthChange={onMonthChange}
        selected={selectedDate || undefined} // selected can be undefined if null
        onSelect={(date) => onDateSelect(date || new Date())} // Ensure a date is always passed
        modifiers={modifiers}
        modifiersClassNames={modifiersClassNames}
        className="rounded-md border"
        classNames={{
          day: cn(
            "h-9 w-9 p-0 font-normal aria-selected:opacity-100",
            "data-[highlighted]:bg-green-100 data-[highlighted]:text-green-700 data-[highlighted]:font-semibold",
            "data-[highlighted]:hover:bg-green-200",
            "data-[state=selected]:bg-sky-500 data-[state=selected]:text-white data-[state=selected]:font-semibold",
            "data-[state=selected]:hover:bg-sky-500 data-[state=selected]:hover:text-white",
            "data-[today]:bg-sky-100 data-[today]:text-sky-700 data-[today]:font-bold data-[today]:hover:bg-sky-200"
          ),
          day_selected: "bg-sky-500 text-white hover:bg-sky-500 hover:text-white focus:bg-sky-500 focus:text-white",
          day_today: "bg-sky-100 text-sky-700 font-bold hover:bg-sky-200",
          day_outside: "text-muted-foreground opacity-50",
          day_disabled: "text-muted-foreground opacity-50",
          day_range_middle: "aria-selected:bg-accent aria-selected:text-accent-foreground",
          day_hidden: "invisible",
          caption_label: "text-lg font-semibold text-slate-700",
          nav_button: "h-7 w-7 bg-transparent p-0 opacity-50 hover:opacity-100",
          nav_button_previous: "absolute left-1",
          nav_button_next: "absolute right-1",
          head_row: "flex",
          head_cell: "text-slate-500 rounded-md w-9 font-medium text-xs",
          row: "flex w-full mt-2",
          cell: "h-9 w-9 text-center text-sm p-0 relative [&:has([aria-selected].day-range-end)]:rounded-r-md [&:has([aria-selected].day-range-start)]:rounded-l-md [&:has([aria-selected])]:bg-accent first:[&:has([aria-selected])]:rounded-l-md last:[&:has([aria-selected])]:rounded-r-md focus-within:relative focus-within:z-20",
        }}
      />
      {/* Add the small green dot for highlighted days if not selected */}
      {selectedDate && highlightedDays.has(format(selectedDate, 'yyyy-MM-dd')) && (
        <style>{`
          .rdp-day_selected.bg-sky-500::after {
            content: '';
            position: absolute;
            bottom: 4px;
            right: 4px;
            width: 8px;
            height: 8px;
            background-color: hsl(var(--green-500));
            border-radius: 9999px;
          }
        `}</style>
      )}
      {/* For non-selected highlighted days, the dot is handled by the modifier class */}
    </div>
  );
};

export default Calendar;