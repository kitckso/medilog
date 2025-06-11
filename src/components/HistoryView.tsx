import { TrashIcon } from "lucide-react";
import React, { useMemo, useState } from "react";
import type { IntakeRecord } from "../types";
import Calendar from "./Calendar"; // Use the refactored Calendar component
import { Button } from "./ui/button"; // Import Shadcn Button
import { Card } from "./ui/card"; // Import Shadcn Card
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "./ui/dialog"; // Import Shadcn Dialog components
import { Tabs, TabsContent, TabsList, TabsTrigger } from "./ui/tabs"; // Import Shadcn Tabs

interface HistoryViewProps {
  records: IntakeRecord[];
  onDeleteRecord: (id: string) => void;
}

type ViewMode = "list" | "calendar";

const HistoryView: React.FC<HistoryViewProps> = ({
  records,
  onDeleteRecord,
}) => {
  const [recordToDelete, setRecordToDelete] = useState<IntakeRecord | null>(
    null
  );
  const [viewMode, setViewMode] = useState<ViewMode>("list");
  const [calendarMonth, setCalendarMonth] = useState(new Date());
  const [selectedCalendarDate, setSelectedCalendarDate] = useState<Date | null>(
    null
  );

  const sortedRecords = useMemo(() => {
    return [...records].sort((a, b) => b.timestamp - a.timestamp);
  }, [records]);

  const datesWithRecords = useMemo(() => {
    const dates = new Set<string>();
    records.forEach((record) => {
      const localDate = new Date(record.timestamp);
      const year = localDate.getFullYear();
      const month = (localDate.getMonth() + 1).toString().padStart(2, "0");
      const day = localDate.getDate().toString().padStart(2, "0");
      dates.add(`${year}-${month}-${day}`);
    });
    return dates;
  }, [records]);

  const recordsForSelectedDate = useMemo(() => {
    if (!selectedCalendarDate) return [];

    const targetYear = selectedCalendarDate.getFullYear();
    const targetMonth = selectedCalendarDate.getMonth();
    const targetDay = selectedCalendarDate.getDate();

    return sortedRecords.filter((record) => {
      const recordLocalDate = new Date(record.timestamp);
      return (
        recordLocalDate.getFullYear() === targetYear &&
        recordLocalDate.getMonth() === targetMonth &&
        recordLocalDate.getDate() === targetDay
      );
    });
  }, [sortedRecords, selectedCalendarDate]);

  const formatDateHeader = (timestamp: number) => {
    const date = new Date(timestamp);
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(today.getDate() - 1);

    if (date.toDateString() === today.toDateString()) return "Today";
    if (date.toDateString() === yesterday.toDateString()) return "Yesterday";
    return date.toLocaleDateString("en-US", {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  const formatTime = (timestamp: number) => {
    return new Date(timestamp).toLocaleTimeString("en-US", {
      hour: "numeric",
      minute: "2-digit",
      hour12: true,
    });
  };

  const renderListView = () => {
    if (sortedRecords.length === 0) {
      return (
        <div className="p-4 text-center text-slate-600">
          No intake history yet.
        </div>
      );
    }
    let lastDateHeader: string | null = null;
    return (
      <div className="space-y-3">
        {sortedRecords.map((record) => {
          const currentDateHeader = formatDateHeader(record.timestamp);
          const showDateHeader = currentDateHeader !== lastDateHeader;
          if (showDateHeader) {
            lastDateHeader = currentDateHeader;
          }
          return (
            <React.Fragment key={record.id}>
              {showDateHeader && (
                <h3 className="text-lg font-semibold text-sky-700 pt-4 pb-2 border-b border-slate-200">
                  {currentDateHeader}
                </h3>
              )}
              <Card className="p-3 flex flex-row justify-between items-center">
                <div>
                  <p className="font-medium text-slate-800">
                    {record.medicineName}
                  </p>
                  <p className="text-sm text-slate-500">
                    {formatTime(record.timestamp)}
                  </p>
                </div>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => setRecordToDelete(record)} 
                  className="text-red-500 hover:text-red-700"
                  aria-label={`Delete record for ${record.medicineName}`}
                >
                  <TrashIcon className="w-5 h-5" />
                </Button>
              </Card>
            </React.Fragment>
          );
        })}
      </div>
    );
  };

  const renderCalendarView = () => {
    return (
      <div className="space-y-4">
        <Calendar
          currentMonth={calendarMonth}
          onMonthChange={setCalendarMonth}
          highlightedDays={datesWithRecords}
          onDateSelect={(date) => {
            setSelectedCalendarDate(date);
          }}
          selectedDate={selectedCalendarDate}
        />
        {selectedCalendarDate && (
          <div className="mt-4">
            <h3 className="text-lg font-semibold text-slate-700 mb-2 border-b pb-2">
              Records for{" "}
              {selectedCalendarDate.toLocaleDateString("en-US", {
                month: "long",
                day: "numeric",
                year: "numeric",
              })}
              :
            </h3>
            {recordsForSelectedDate.length > 0 ? (
              <div className="space-y-3">
                {recordsForSelectedDate.map((record) => (
                  <Card
                    key={record.id}
                    className="p-3 flex justify-between items-center"
                  >
                    <div>
                      <p className="font-medium text-slate-800">
                        {record.medicineName}
                      </p>
                      <p className="text-sm text-slate-500">
                        {formatTime(record.timestamp)}
                      </p>
                    </div>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => setRecordToDelete(record)}
                      className="text-red-500 hover:text-red-700"
                      aria-label={`Delete record for ${record.medicineName}`}
                    >
                      <TrashIcon className="w-5 h-5" />
                    </Button>
                  </Card>
                ))}
              </div>
            ) : (
              <p className="text-slate-500 text-center py-4">
                No records for this day.
              </p>
            )}
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="p-4 space-y-4">
      {/* The Tabs component must wrap both the TabsList and TabsContent */}
      <Tabs
        value={viewMode}
        onValueChange={(value) => setViewMode(value as ViewMode)}
      >
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-semibold text-slate-700">
            Intake History
          </h2>
          {/* Move className="w-[200px]" to TabsList if it's for the buttons */}
          <TabsList className="w-[200px] grid grid-cols-2">
            <TabsTrigger value="list">List</TabsTrigger>
            <TabsTrigger value="calendar">Calendar</TabsTrigger>
          </TabsList>
        </div>

        {/* TabsContent must be inside the Tabs component */}
        <TabsContent value="list" className="mt-0">
          {renderListView()}
        </TabsContent>
        <TabsContent value="calendar" className="mt-0">
          {renderCalendarView()}
        </TabsContent>
      </Tabs>

      {/* The Dialog component can remain outside the Tabs component */}
      <Dialog
        open={!!recordToDelete}
        onOpenChange={(open) => !open && setRecordToDelete(null)}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Confirm Deletion</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete this intake record for{" "}
              <strong>{recordToDelete?.medicineName}</strong> taken at{" "}
              {recordToDelete && formatTime(recordToDelete.timestamp)} on{" "}
              {recordToDelete &&
                new Date(recordToDelete.timestamp).toLocaleDateString()}
              ?
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setRecordToDelete(null)}>
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={() => {
                if (recordToDelete) {
                  onDeleteRecord(recordToDelete.id);
                  setRecordToDelete(null);
                }
              }}
            >
              Delete
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default HistoryView;
