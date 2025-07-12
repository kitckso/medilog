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
        <div className="text-center py-8 sm:py-12">
          <div className="bg-slate-50 rounded-full w-12 h-12 sm:w-16 sm:h-16 flex items-center justify-center mx-auto mb-3 sm:mb-4">
            <TrashIcon className="w-6 h-6 sm:w-8 sm:h-8 text-slate-400" />
          </div>
          <p className="text-slate-500 text-base sm:text-lg">No intake history yet</p>
          <p className="text-slate-400 text-xs sm:text-sm">Start recording your medications to see them here</p>
        </div>
      );
    }
    let lastDateHeader: string | null = null;
    return (
      <div className="space-y-4">
        {sortedRecords.map((record) => {
          const currentDateHeader = formatDateHeader(record.timestamp);
          const showDateHeader = currentDateHeader !== lastDateHeader;
          if (showDateHeader) {
            lastDateHeader = currentDateHeader;
          }
          return (
            <React.Fragment key={record.id}>
              {showDateHeader && (
                <div className="flex items-center my-4 sm:my-6 first:mt-0">
                  <div className="flex-grow border-t border-slate-200"></div>
                  <h3 className="px-3 sm:px-4 text-sm sm:text-lg font-semibold text-slate-600 bg-slate-50 rounded-full py-1 sm:py-2">
                    {currentDateHeader}
                  </h3>
                  <div className="flex-grow border-t border-slate-200"></div>
                </div>
              )}
              <Card className="p-3 sm:p-4 hover:shadow-md transition-shadow duration-200 border-l-4 border-l-sky-400">
                <div className="flex justify-between items-start">
                  <div className="flex-1">
                    <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-3 mb-2">
                      <h4 className="font-semibold text-slate-800 text-base sm:text-lg">
                        {record.medicineName}
                      </h4>
                      <span className="text-xs sm:text-sm text-slate-500 bg-slate-100 px-2 py-1 rounded-full w-fit">
                        {formatTime(record.timestamp)}
                      </span>
                    </div>
                    {record.details && (
                      <div className="bg-sky-50 border border-sky-200 rounded-lg p-2 sm:p-3 mt-2 sm:mt-3">
                        <p className="text-xs sm:text-sm font-medium text-sky-800 mb-1">Details:</p>
                        <p className="text-xs sm:text-sm text-sky-700">{record.details}</p>
                      </div>
                    )}
                  </div>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => setRecordToDelete(record)} 
                    className="text-red-400 hover:text-red-600 hover:bg-red-50 ml-2 sm:ml-4 shrink-0"
                    aria-label={`Delete record for ${record.medicineName}`}
                  >
                    <TrashIcon className="w-4 h-4 sm:w-5 sm:h-5" />
                  </Button>
                </div>
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
                    className="p-4 hover:shadow-md transition-shadow duration-200 border-l-4 border-l-sky-400"
                  >
                    <div className="flex justify-between items-start">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <h4 className="font-semibold text-slate-800 text-lg">
                            {record.medicineName}
                          </h4>
                          <span className="text-sm text-slate-500 bg-slate-100 px-2 py-1 rounded-full">
                            {formatTime(record.timestamp)}
                          </span>
                        </div>
                        {record.details && (
                          <div className="bg-sky-50 border border-sky-200 rounded-lg p-3 mt-3">
                            <p className="text-sm font-medium text-sky-800 mb-1">Details:</p>
                            <p className="text-sm text-sky-700">{record.details}</p>
                          </div>
                        )}
                      </div>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => setRecordToDelete(record)}
                        className="text-red-400 hover:text-red-600 hover:bg-red-50 ml-4 shrink-0"
                        aria-label={`Delete record for ${record.medicineName}`}
                      >
                        <TrashIcon className="w-5 h-5" />
                      </Button>
                    </div>
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
    <div className="p-4 sm:p-6 space-y-4 sm:space-y-6 max-w-4xl mx-auto">
      <div className="text-center">
        <h2 className="text-xl sm:text-2xl font-bold text-slate-800 mb-2">Intake History</h2>
        <p className="text-sm sm:text-base text-slate-600">View and manage your medication records</p>
      </div>

      {/* The Tabs component must wrap both the TabsList and TabsContent */}
      <Tabs
        value={viewMode}
        onValueChange={(value) => setViewMode(value as ViewMode)}
        className="w-full"
      >
        <TabsList className="grid w-full grid-cols-2 bg-slate-100 p-1 rounded-lg sm:rounded-xl mb-4 sm:mb-6">
          <TabsTrigger value="list" className="rounded-md sm:rounded-lg data-[state=active]:bg-white data-[state=active]:shadow-sm text-sm sm:text-base">
            List View
          </TabsTrigger>
          <TabsTrigger value="calendar" className="rounded-md sm:rounded-lg data-[state=active]:bg-white data-[state=active]:shadow-sm text-sm sm:text-base">
            Calendar View
          </TabsTrigger>
        </TabsList>

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
