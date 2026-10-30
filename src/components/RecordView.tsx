// components/RecordView.tsx
import { CalendarDaysIcon, CheckIcon, PillIcon, PlusIcon } from "lucide-react";
import React, { useState } from "react";
import type { IntakeRecord, MedicineItem } from "../types";
import {
  filterRecordsByToday,
  formatCompactDate,
  formatTimeForInput,
  formatTimeOfDay,
  getStreakDays,
  parseLocalDateTime,
  sortRecordsByTimestampDesc,
  toLocalDateKey,
} from "@/lib/dateUtils";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { EmptyState } from "@/components/ui/empty-state";
import { toast } from "sonner";

interface RecordViewProps {
  medicines: MedicineItem[];
  records: IntakeRecord[];
  onRecordIntake: (
    medicineId: string,
    medicineName: string,
    timestamp: number,
    details?: string,
  ) => void;
  onNavigateToManage: () => void;
}

/** Quick offsets for the "when did you take it" chips (minutes back from now). */
const TIME_OPTIONS = [
  { label: "Now", minutes: 0 },
  { label: "15m ago", minutes: 15 },
  { label: "30m ago", minutes: 30 },
  { label: "1h ago", minutes: 60 },
  { label: "2h ago", minutes: 120 },
] as const;

// Module scope so the render-time purity lint stays clean (same trick as the
// date helpers); only ever called from the tap handler.
const timestampForOffset = (minutes: number): number => Date.now() - minutes * 60_000;

const RecordView: React.FC<RecordViewProps> = ({
  medicines,
  records,
  onRecordIntake,
  onNavigateToManage,
}) => {
  const [offsetMinutes, setOffsetMinutes] = useState(0);
  const [flashedId, setFlashedId] = useState<string | null>(null);

  // Custom-dose dialog state: the backfill path with exact date, time, details.
  const [dialogOpen, setDialogOpen] = useState(false);
  const [selectedMedicineId, setSelectedMedicineId] = useState<string>("");
  const [selectedDate, setSelectedDate] = useState<string>(() => toLocalDateKey(new Date()));
  const [selectedTime, setSelectedTime] = useState<string>(() => formatTimeForInput(new Date()));
  const [details, setDetails] = useState<string>("");

  const today = filterRecordsByToday(records);
  const takenToday = new Map<string, number>();
  for (const r of sortRecordsByTimestampDesc(today)) takenToday.set(r.medicineId, r.timestamp);
  const streak = getStreakDays(records);
  // Latest doses regardless of day; the list labels anything older than today
  // with its date so "Recent" doesn't silently stop at midnight.
  const recent = sortRecordsByTimestampDesc(records).slice(0, 5);
  const todayIds = new Set(today.map((r) => r.id));

  const recordNow = (med: MedicineItem) => {
    const timestamp = timestampForOffset(offsetMinutes);
    onRecordIntake(med.id, med.name, timestamp);
    setFlashedId(med.id);
    setTimeout(() => setFlashedId(null), 450);
    toast.success(
      `${med.name} logged${offsetMinutes ? ` (${TIME_OPTIONS.find((t) => t.minutes === offsetMinutes)?.label})` : ""}`,
    );
  };

  const handleOpenCustom = () => {
    // Reset date/time/details on open; the medicine selection inherits the
    // first item so the dialog is always valid by default.
    const now = new Date();
    setSelectedDate(toLocalDateKey(now));
    setSelectedTime(formatTimeForInput(now));
    setDetails("");
    setDialogOpen(true);
  };

  // Derived, never stored: follows the dialog list, recovers if deleted.
  const activeMedicineId = medicines.some((med) => med.id === selectedMedicineId)
    ? selectedMedicineId
    : (medicines[0]?.id ?? "");

  const handleSaveCustom = () => {
    const selectedMedicine = medicines.find((m) => m.id === activeMedicineId);
    if (!selectedMedicine || !selectedDate || !selectedTime) {
      toast.error("Please select a medicine and a valid date and time.");
      return;
    }
    const timestamp = parseLocalDateTime(selectedDate, selectedTime);
    if (isNaN(timestamp)) {
      toast.error("Invalid date or time selected.");
      return;
    }
    onRecordIntake(selectedMedicine.id, selectedMedicine.name, timestamp, details || undefined);
    toast.success("Intake recorded successfully!");
    setDialogOpen(false);
  };

  if (medicines.length === 0) {
    return (
      <EmptyState
        icon={PillIcon}
        title="No medicines yet"
        description="Add your first medicine to start logging doses."
        action={
          <Button onClick={onNavigateToManage}>
            <PlusIcon className="size-4" /> Add medicines
          </Button>
        }
      />
    );
  }

  return (
    <div className="p-4 pb-6">
      <header>
        <h2 className="text-xl font-bold tracking-tight">Today</h2>
        <p className="mt-0.5 text-xs text-muted-foreground">
          {takenToday.size} of {medicines.length} taken
          {streak > 0 && <> · {streak}-day streak</>}
        </p>
      </header>

      {/* When-did-you-take chips; the selection applies to every next tap. */}
      <div className="mt-3 flex gap-2 overflow-x-auto pb-1">
        {TIME_OPTIONS.map(({ label, minutes }) => (
          <button
            key={minutes}
            type="button"
            onClick={() => setOffsetMinutes(minutes)}
            aria-pressed={offsetMinutes === minutes}
            className={`shrink-0 rounded-full border px-3.5 py-1.5 text-xs font-medium transition-colors ${
              offsetMinutes === minutes
                ? "border-transparent bg-primary text-primary-foreground"
                : "border-border bg-card text-muted-foreground hover:border-primary/40 hover:text-foreground"
            }`}
          >
            {label}
          </button>
        ))}
      </div>

      {/* Tap-to-log grid: one tap = one dose at the selected time chip. */}
      <div className="mt-3 grid grid-cols-2 gap-2.5">
        {medicines.map((med) => {
          const taken = takenToday.has(med.id);
          const flashed = flashedId === med.id;
          return (
            <button
              key={med.id}
              type="button"
              onClick={() => recordNow(med)}
              className={`relative flex flex-col items-center gap-2.5 rounded-2xl border bg-card p-4 text-foreground shadow-card transition-[transform,border-color] duration-150 active:scale-[0.96] ${
                flashed ? "border-primary" : ""
              }`}
            >
              <span
                aria-hidden="true"
                className={`absolute right-2.5 top-2.5 size-2 rounded-full transition-colors ${
                  taken ? "bg-success" : "bg-border"
                }`}
              />
              <span className="flex size-10 items-center justify-center rounded-xl bg-primary/10 text-primary">
                {taken ? (
                  <CheckIcon className="size-4.5" aria-hidden="true" />
                ) : (
                  <PillIcon className="size-4.5" aria-hidden="true" />
                )}
              </span>
              <span className="line-clamp-2 text-[13px] font-medium leading-tight tracking-[-0.01em]">
                {med.name}
              </span>
            </button>
          );
        })}

        {/* Backfill path: exact date, time, and details. */}
        <button
          type="button"
          onClick={handleOpenCustom}
          className="col-span-2 flex flex-row items-center justify-center gap-2 rounded-2xl border border-dashed border-border bg-transparent p-3 text-muted-foreground shadow-none transition-colors hover:border-primary/40 hover:text-foreground"
        >
          <CalendarDaysIcon className="size-4" aria-hidden="true" />
          <span className="text-[13px] font-medium">Custom dose…</span>
        </button>
      </div>

      {/* Latest doses, most recent first across all days. */}
      <section className="mt-5">
        <h3 className="pb-1 text-[11px] font-semibold uppercase tracking-[0.08em] text-muted-foreground">
          Recent
        </h3>
        {recent.length === 0 ? (
          <p className="pt-2 text-sm text-muted-foreground">
            Nothing logged yet — tap a medicine above.
          </p>
        ) : (
          <ul>
            {recent.map((r) => (
              <li
                key={r.id}
                className="flex items-center gap-3 border-b border-border/60 py-2.5 last:border-0"
              >
                <span className="w-32 shrink-0 whitespace-nowrap text-xs text-muted-foreground tabular-nums">
                  {!todayIds.has(r.id) && `${formatCompactDate(r.timestamp)} · `}
                  {formatTimeOfDay(r.timestamp)}
                </span>
                <span className="min-w-0 flex-1 truncate text-sm font-medium">
                  {r.medicineName}
                </span>
                <CheckIcon className="size-4 shrink-0 text-success" aria-hidden="true" />
              </li>
            ))}
          </ul>
        )}
      </section>

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="rounded-2xl">
          <DialogHeader>
            <DialogTitle>Custom dose</DialogTitle>
            <DialogDescription>
              Log a dose with an exact date, time, or extra details.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            <div>
              <Label className="mb-2 block text-sm font-semibold">Medicine</Label>
              <RadioGroup
                value={activeMedicineId}
                onValueChange={setSelectedMedicineId}
                className="max-h-40 space-y-1 overflow-y-auto"
              >
                {medicines.map((med) => (
                  <div key={med.id} className="flex items-center space-x-2">
                    <RadioGroupItem value={med.id} id={`med-${med.id}`} className="sr-only" />
                    <Label
                      htmlFor={`med-${med.id}`}
                      className={`flex w-full cursor-pointer items-center justify-between rounded-lg border px-2 py-1.5 text-left text-sm ${
                        activeMedicineId === med.id
                          ? "border-primary/40 bg-primary/10 text-foreground"
                          : "border-border bg-muted/40 text-muted-foreground"
                      }`}
                    >
                      <span className="font-medium">{med.name}</span>
                      {activeMedicineId === med.id && (
                        <CheckIcon className="size-4 text-primary" aria-hidden="true" />
                      )}
                    </Label>
                  </div>
                ))}
              </RadioGroup>
            </div>

            <Input
              type="text"
              value={details}
              onChange={(e) => setDetails(e.target.value)}
              placeholder="Details (e.g., 500mg)"
              className="w-full text-sm"
            />

            <div className="grid grid-cols-2 gap-2">
              <div>
                <Label className="mb-1 block text-xs text-muted-foreground">Date</Label>
                <Input
                  type="date"
                  value={selectedDate}
                  onChange={(e) => setSelectedDate(e.target.value)}
                  className="w-full text-sm"
                />
              </div>
              <div>
                <Label className="mb-1 block text-xs text-muted-foreground">Time</Label>
                <Input
                  type="time"
                  value={selectedTime}
                  onChange={(e) => setSelectedTime(e.target.value)}
                  className="w-full text-sm"
                />
              </div>
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleSaveCustom}>
              <PlusIcon className="size-4" /> Save dose
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default RecordView;
