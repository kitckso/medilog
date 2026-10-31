// components/Calendar.tsx
import React from "react";
import { format } from "date-fns";
import { Calendar as ShadcnCalendar } from "./ui/calendar"; // Renamed to avoid conflict
import { cn } from "@/lib/utils"; // Utility for merging class names

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
      const dateString = format(date, "yyyy-MM-dd");
      return highlightedDays.has(dateString);
    },
  };

  // react-day-picker v9 has no `data-highlighted` attribute: a custom modifier
  // only contributes class names, so the "day has records" styling has to live
  // here rather than behind a `data-[highlighted]:` variant that never matches.
  // The extra `[&[data-today]]` variant keeps the record colour winning over
  // today's accent colour when the two land on the same cell.
  const modifiersClassNames = {
    highlighted:
      "font-semibold text-success [&[data-today]]:text-success after:content-[''] after:bg-success data-[selected=true]:after:bg-primary-foreground",
  };

  return (
    <div className="flex justify-center items-center rounded-lg bg-card p-4 shadow-card">
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
            "h-9 w-9 p-0 font-normal aria-selected:opacity-100 relative",
            "after:absolute after:bottom-1 after:left-1/2 after:-translate-x-1/2 after:size-1 after:rounded-full",
            "data-[selected=true]:bg-primary data-[selected=true]:text-primary-foreground data-[selected=true]:font-semibold",
            "data-[selected=true]:hover:bg-primary data-[selected=true]:hover:text-primary-foreground",
            "data-[today=true]:bg-accent data-[today=true]:text-accent-foreground data-[today=true]:font-bold data-[today=true]:hover:bg-accent",
          ),
          day_selected:
            "bg-primary text-primary-foreground hover:bg-primary hover:text-primary-foreground focus:bg-primary focus:text-primary-foreground",
          day_today: "bg-accent text-accent-foreground font-bold hover:bg-accent",
          day_outside: "text-muted-foreground opacity-50",
          day_disabled: "text-muted-foreground opacity-50",
          day_range_middle: "aria-selected:bg-accent aria-selected:text-accent-foreground",
          day_hidden: "invisible",
          caption_label: "text-lg font-semibold",
          nav_button: "h-7 w-7 bg-transparent p-0 opacity-50 hover:opacity-100",
          nav_button_previous: "absolute left-1",
          nav_button_next: "absolute right-1",
          head_row: "flex",
          head_cell: "text-muted-foreground rounded-md w-9 font-medium text-xs",
          row: "flex w-full mt-2",
          cell: "h-9 w-9 text-center text-sm p-0 relative [&:has([aria-selected].day-range-end)]:rounded-r-md [&:has([aria-selected].day-range-start)]:rounded-l-md [&:has([aria-selected])]:bg-accent first:[&:has([aria-selected])]:rounded-l-md last:[&:has([aria-selected])]:rounded-r-md focus-within:relative focus-within:z-20",
        }}
      />
    </div>
  );
};

export default Calendar;
