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
import { EmptyState } from "./ui/empty-state";
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
        className="text-muted-foreground hover:bg-accent hover:text-accent-foreground"
        aria-label={`Edit record for ${record.medicineName}`}
      >
        <PencilIcon className={sizeClasses} />
      </Button>
      <Button
        variant="ghost"
        size="icon"
        onClick={() => handleDelete(record)}
        className="text-destructive/70 hover:bg-destructive/10 hover:text-destructive"
        aria-label={`Delete record for ${record.medicineName}`}
      >
        <TrashIcon className={sizeClasses} />
      </Button>
    </div>
  );

  const renderListView = () => {
    if (sortedRecords.length === 0) {
      return (
        <EmptyState
          icon={TrashIcon}
          title="No intake history yet"
          description="Start recording your medications to see them here"
        />
      );
    }

    if (filteredRecords.length === 0) {
      return (
        <EmptyState
          icon={PencilIcon}
          title="No matching records"
          description="Try a different search term"
        />
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
                <div className="my-4 flex items-center gap-3 sm:my-6 first:mt-0">
                  <div className="flex-grow border-t border-border"></div>
                  <h3 className="shrink-0 text-[11px] font-semibold uppercase tracking-[0.08em] text-muted-foreground">
                    {currentDateHeader}
                  </h3>
                  <div className="flex-grow border-t border-border"></div>
                </div>
              )}
              <Card className="p-3 shadow-card transition-shadow duration-200 hover:shadow-float sm:p-4">
                <div className="flex justify-between items-start">
                  <div className="flex-1">
                    <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-3 mb-2">
                      <h4 className="font-semibold text-foreground text-base sm:text-lg">
                        {record.medicineName}
                      </h4>
                      <span className="w-fit rounded-full bg-muted px-2 py-1 text-xs text-muted-foreground tabular-nums sm:text-sm">
                        {formatTimeOfDay(record.timestamp)}
                      </span>
                    </div>
                    {record.details && (
                      <div className="mt-2 rounded-lg bg-muted/60 p-2 sm:mt-3 sm:p-3">
                        <p className="mb-1 text-xs font-medium text-muted-foreground sm:text-sm">
                          Details:
                        </p>
                        <p className="text-xs text-foreground/80 sm:text-sm">{record.details}</p>
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
            <h3 className="mb-2 border-b pb-2 text-lg font-semibold">
              Records for {formatLongDate(selectedCalendarDate)}:
            </h3>
            {recordsForSelectedDate.length > 0 ? (
              <div className="space-y-3">
                {recordsForSelectedDate.map((record) => (
                  <Card
                    key={record.id}
                    className="p-4 shadow-card transition-shadow duration-200 hover:shadow-float"
                  >
                    <div className="flex justify-between items-start">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <h4 className="font-semibold text-foreground text-lg">
                            {record.medicineName}
                          </h4>
                          <span className="rounded-full bg-muted px-2 py-1 text-sm text-muted-foreground tabular-nums">
                            {formatTimeOfDay(record.timestamp)}
                          </span>
                        </div>
                        {record.details && (
                          <div className="mt-3 rounded-lg bg-muted/60 p-3">
                            <p className="mb-1 text-sm font-medium text-muted-foreground">
                              Details:
                            </p>
                            <p className="text-sm text-foreground/80">{record.details}</p>
                          </div>
                        )}
                      </div>
                      {renderRecordActions(record, "w-5 h-5")}
                    </div>
                  </Card>
                ))}
              </div>
            ) : (
              <p className="text-muted-foreground py-4 text-center">No records for this day.</p>
            )}
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="p-4 sm:p-6 space-y-4 sm:space-y-6">
      <div className="text-center">
        <h2 className="mb-2 text-xl font-bold tracking-tight sm:text-2xl">Intake History</h2>
        <p className="text-sm text-muted-foreground sm:text-base">
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
        <TabsList className="mb-4 grid w-full grid-cols-2 sm:mb-6">
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
