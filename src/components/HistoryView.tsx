import { PencilIcon, TrashIcon } from "lucide-react";
import React, { useMemo, useState } from "react";
import {
  filterRecordsByLocalDay,
  formatDateHeader,
  formatLongDate,
  formatTimeOfDay,
  getRecordDateKeys,
  sortRecordsByTimestampDesc,
} from "@/lib/dateUtils";
import { filterRecordsByQuery } from "@/lib/recordFilters";
import type { IntakeRecord } from "../types";
import Calendar from "./Calendar"; // Use the refactored Calendar component
import EditRecordDialog from "./EditRecordDialog";
import { Button } from "./ui/button"; // Import Shadcn Button
import { Card } from "./ui/card"; // Import Shadcn Card
import { Input } from "./ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "./ui/tabs"; // Import Shadcn Tabs
import { toast } from "sonner";

interface HistoryViewProps {
  records: IntakeRecord[];
  onDeleteRecord: (id: string) => void;
  onRestoreRecord: (record: IntakeRecord) => void;
  onUpdateRecord: (id: string, timestamp: number, details?: string) => void;
}

type ViewMode = "list" | "calendar";

const HistoryView: React.FC<HistoryViewProps> = ({
  records,
  onDeleteRecord,
  onRestoreRecord,
  onUpdateRecord,
}) => {
  const [viewMode, setViewMode] = useState<ViewMode>("list");
  const [calendarMonth, setCalendarMonth] = useState(new Date());
  const [selectedCalendarDate, setSelectedCalendarDate] = useState<Date | null>(null);
  const [query, setQuery] = useState("");
  const [editingRecord, setEditingRecord] = useState<IntakeRecord | null>(null);

  const sortedRecords = useMemo(() => sortRecordsByTimestampDesc(records), [records]);

  const filteredRecords = useMemo(
    () => filterRecordsByQuery(sortedRecords, query),
    [sortedRecords, query],
  );

  // The search applies to the calendar view too (highlights and day records),
  // so the filter never silently disappears when switching tabs.
  const datesWithRecords = useMemo(() => getRecordDateKeys(filteredRecords), [filteredRecords]);

  const recordsForSelectedDate = useMemo(() => {
    if (!selectedCalendarDate) return [];
    return filterRecordsByLocalDay(filteredRecords, selectedCalendarDate);
  }, [filteredRecords, selectedCalendarDate]);

  const handleDelete = (record: IntakeRecord) => {
    const recordCopy = { ...record };
    onDeleteRecord(record.id);
    toast.success(`"${record.medicineName}" deleted`, {
      action: { label: "Undo", onClick: () => onRestoreRecord(recordCopy) },
    });
  };

  const renderRecordActions = (record: IntakeRecord, sizeClasses: string) => (
    <div className="ml-2 flex shrink-0 items-center sm:ml-4">
      <Button
        variant="ghost"
        size="icon"
        onClick={() => setEditingRecord(record)}
        className="text-slate-500 hover:bg-sky-50 hover:text-sky-600"
        aria-label={`Edit record for ${record.medicineName}`}
      >
        <PencilIcon className={sizeClasses} />
      </Button>
      <Button
        variant="ghost"
        size="icon"
        onClick={() => handleDelete(record)}
        className="text-red-400 hover:bg-red-50 hover:text-red-600"
        aria-label={`Delete record for ${record.medicineName}`}
      >
        <TrashIcon className={sizeClasses} />
      </Button>
    </div>
  );

  const renderListView = () => {
    if (sortedRecords.length === 0) {
      return (
        <div className="text-center py-8 sm:py-12">
          <div className="bg-slate-50 rounded-full w-12 h-12 sm:w-16 sm:h-16 flex items-center justify-center mx-auto mb-3 sm:mb-4">
            <TrashIcon className="w-6 h-6 sm:w-8 sm:h-8 text-slate-500" />
          </div>
          <p className="text-slate-500 text-base sm:text-lg">No intake history yet</p>
          <p className="text-slate-500 text-xs sm:text-sm">
            Start recording your medications to see them here
          </p>
        </div>
      );
    }

    if (filteredRecords.length === 0) {
      return (
        <div className="text-center py-8 sm:py-12">
          <p className="text-slate-500 text-base sm:text-lg">No matching records</p>
          <p className="text-slate-500 text-xs sm:text-sm">Try a different search term</p>
        </div>
      );
    }

    let lastDateHeader: string | null = null;
    return (
      <div className="space-y-4">
        {filteredRecords.map((record) => {
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
                        {formatTimeOfDay(record.timestamp)}
                      </span>
                    </div>
                    {record.details && (
                      <div className="bg-sky-50 border border-sky-200 rounded-lg p-2 sm:p-3 mt-2 sm:mt-3">
                        <p className="text-xs sm:text-sm font-medium text-sky-800 mb-1">Details:</p>
                        <p className="text-xs sm:text-sm text-sky-700">{record.details}</p>
                      </div>
                    )}
                  </div>
                  {renderRecordActions(record, "w-4 h-4 sm:w-5 sm:h-5")}
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
              Records for {formatLongDate(selectedCalendarDate)}:
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
                            {formatTimeOfDay(record.timestamp)}
                          </span>
                        </div>
                        {record.details && (
                          <div className="bg-sky-50 border border-sky-200 rounded-lg p-3 mt-3">
                            <p className="text-sm font-medium text-sky-800 mb-1">Details:</p>
                            <p className="text-sm text-sky-700">{record.details}</p>
                          </div>
                        )}
                      </div>
                      {renderRecordActions(record, "w-5 h-5")}
                    </div>
                  </Card>
                ))}
              </div>
            ) : (
              <p className="text-slate-500 text-center py-4">No records for this day.</p>
            )}
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="p-4 sm:p-6 space-y-4 sm:space-y-6">
      <div className="text-center">
        <h2 className="text-xl sm:text-2xl font-bold text-slate-800 mb-2">Intake History</h2>
        <p className="text-sm sm:text-base text-slate-600">
          View and manage your medication records
        </p>
      </div>

      {sortedRecords.length > 0 && (
        <Input
          type="search"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search by medicine or details"
          aria-label="Search intake records"
          className="w-full text-sm"
        />
      )}

      {/* The Tabs component must wrap both the TabsList and TabsContent */}
      <Tabs
        value={viewMode}
        onValueChange={(value) => setViewMode(value as ViewMode)}
        className="w-full"
      >
        <TabsList className="grid w-full grid-cols-2 bg-slate-100 p-1 rounded-lg sm:rounded-xl mb-4 sm:mb-6">
          <TabsTrigger
            value="list"
            className="rounded-md sm:rounded-lg data-[state=active]:bg-card data-[state=active]:shadow-sm text-sm sm:text-base"
          >
            List View
          </TabsTrigger>
          <TabsTrigger
            value="calendar"
            className="rounded-md sm:rounded-lg data-[state=active]:bg-card data-[state=active]:shadow-sm text-sm sm:text-base"
          >
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

      <EditRecordDialog
        record={editingRecord}
        onOpenChange={(open) => {
          if (!open) setEditingRecord(null);
        }}
        onSave={(id, timestamp, details) => {
          onUpdateRecord(id, timestamp, details);
          setEditingRecord(null);
        }}
      />
    </div>
  );
};

export default HistoryView;
