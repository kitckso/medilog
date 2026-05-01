// components/RecordView.tsx
import { CheckIcon, PlusIcon } from "lucide-react";
import React, { useEffect, useState } from "react";
import type { MedicineItem } from "../types";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { toast } from "sonner";

interface RecordViewProps {
  medicines: MedicineItem[];
  onRecordIntake: (
    medicineId: string,
    medicineName: string,
    timestamp: number,
    details?: string,
  ) => void;
  onNavigateToManage: () => void;
}

const formatDateForInput = (date: Date): string => {
  const year = date.getFullYear();
  const month = (date.getMonth() + 1).toString().padStart(2, "0");
  const day = date.getDate().toString().padStart(2, "0");
  return `${year}-${month}-${day}`;
};

const formatTimeForInput = (date: Date): string => {
  const hours = date.getHours().toString().padStart(2, "0");
  const minutes = date.getMinutes().toString().padStart(2, "0");
  return `${hours}:${minutes}`;
};

const RecordView: React.FC<RecordViewProps> = ({
  medicines,
  onRecordIntake,
  onNavigateToManage,
}) => {
  const [selectedMedicineId, setSelectedMedicineId] = useState<string>("");
  const [selectedDate, setSelectedDate] = useState<string>(formatDateForInput(new Date()));
  const [selectedTime, setSelectedTime] = useState<string>(formatTimeForInput(new Date()));
  const [details, setDetails] = useState<string>("");

  useEffect(() => {
    const now = new Date();
    setSelectedDate(formatDateForInput(now));
    setSelectedTime(formatTimeForInput(now));
    // If there are medicines, pre-select the first one for convenience
    if (medicines.length > 0 && !selectedMedicineId) {
      setSelectedMedicineId(medicines[0].id);
    }
  }, [medicines, selectedMedicineId]);

  const handleRecord = () => {
    if (!selectedMedicineId) {
      toast.error("Please select a medicine.");
      return;
    }
    if (!selectedDate || !selectedTime) {
      toast.error("Please select a valid date and time.");
      return;
    }

    const selectedMedicine = medicines.find((m) => m.id === selectedMedicineId);
    if (selectedMedicine) {
      const [year, month, day] = selectedDate.split("-").map(Number);
      const [hours, minutes] = selectedTime.split(":").map(Number);
      const timestamp = new Date(year, month - 1, day, hours, minutes).getTime();

      if (isNaN(timestamp)) {
        toast.error("Invalid date or time selected.");
        return;
      }

      onRecordIntake(selectedMedicine.id, selectedMedicine.name, timestamp, details);
      toast.success("Intake recorded successfully!");

      setTimeout(() => {
        setSelectedMedicineId("");
        setDetails("");
        const now = new Date();
        setSelectedDate(formatDateForInput(now));
        setSelectedTime(formatTimeForInput(now));
        if (medicines.length > 0) {
          setSelectedMedicineId(medicines[0].id);
        }
      }, 2000);
    }
  };

  if (medicines.length === 0) {
    return (
      <div className="p-4 text-center text-slate-600">
        <p className="mb-4">No medicines defined yet. Please add some medicines first.</p>
        <Button
          onClick={onNavigateToManage}
          className="bg-sky-500 hover:bg-sky-600 text-white mx-auto"
        >
          <PlusIcon className="w-5 h-5 mr-2" /> Add Medicines
        </Button>
      </div>
    );
  }

  return (
    <div className="flex flex-col flex-1 overflow-y-auto">
      <div className="px-4 pt-3 flex-shrink-0">
        <h2 className="text-lg font-bold text-slate-800">Record Intake</h2>
        <p className="text-xs text-slate-600">Track your medicine and supplement intake</p>

        <div className="mt-4 bg-white rounded-lg shadow-sm border border-slate-200 p-3">
          <Label className="block text-sm font-semibold text-slate-800 mb-2">Medicine</Label>
          <RadioGroup
            value={selectedMedicineId}
            onValueChange={setSelectedMedicineId}
            className="space-y-1 max-h-48"
          >
            {medicines.map((med) => (
              <div key={med.id} className="flex items-center space-x-2">
                <RadioGroupItem value={med.id} id={`med-${med.id}`} className="sr-only" />
                <Label
                  htmlFor={`med-${med.id}`}
                  className={`w-full flex items-center justify-between text-left px-2 py-1.5 rounded cursor-pointer border text-sm
                              ${
                                selectedMedicineId === med.id
                                  ? "bg-sky-50 border-sky-400 text-sky-800"
                                  : "bg-slate-50 border-slate-200 text-slate-700"
                              }`}
                >
                  <span className="font-medium">{med.name}</span>
                  {selectedMedicineId === med.id && <CheckIcon className="w-4 h-4 text-sky-600" />}
                </Label>
              </div>
            ))}
          </RadioGroup>
          {selectedMedicineId && (
            <div className="mt-2 pt-2 border-t border-slate-200">
              <Input
                type="text"
                value={details}
                onChange={(e) => setDetails(e.target.value)}
                placeholder="Details (e.g., 500mg)"
                className="w-full text-sm"
              />
            </div>
          )}
        </div>

        <div className="mt-4 bg-white rounded-lg shadow-sm border border-slate-200 p-3">
          <Label className="block text-sm font-semibold text-slate-800 mb-2">When</Label>
          <div className="grid grid-cols-2 gap-2">
            <div>
              <Label className="block text-xs text-slate-700 mb-1">Date</Label>
              <Input
                type="date"
                value={selectedDate}
                onChange={(e) => setSelectedDate(e.target.value)}
                className="w-full text-sm"
              />
            </div>
            <div>
              <Label className="block text-xs text-slate-700 mb-1">Time</Label>
              <Input
                type="time"
                value={selectedTime}
                onChange={(e) => setSelectedTime(e.target.value)}
                className="w-full text-sm"
              />
            </div>
          </div>
        </div>
      </div>

      <div className="flex-1" />

      <div className="px-4 pt-6 pb-4 flex-shrink-0">
        <Button
          onClick={handleRecord}
          disabled={!selectedMedicineId || !selectedDate || !selectedTime}
          className="w-full bg-sky-500 hover:bg-sky-600 text-white py-3 rounded-lg shadow disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <PlusIcon className="w-4 h-4 mr-2" /> Record Intake
        </Button>
      </div>
    </div>
  );
};

export default RecordView;
