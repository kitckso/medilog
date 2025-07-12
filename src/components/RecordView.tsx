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
    details?: string
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
  const [selectedDate, setSelectedDate] = useState<string>(
    formatDateForInput(new Date())
  );
  const [selectedTime, setSelectedTime] = useState<string>(
    formatTimeForInput(new Date())
  );
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
      const timestamp = new Date(
        year,
        month - 1,
        day,
        hours,
        minutes
      ).getTime();

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
        <p className="mb-4">
          No medicines defined yet. Please add some medicines first.
        </p>
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
    <div className="p-4 sm:p-6 space-y-6 sm:space-y-8 max-w-2xl mx-auto">
      <div className="text-center">
        <h2 className="text-xl sm:text-2xl font-bold text-slate-800 mb-2">Record Intake</h2>
        <p className="text-sm sm:text-base text-slate-600">Track your medicine and supplement intake</p>
      </div>

      {/* Medicine Selection Section */}
      <div className="bg-white rounded-lg sm:rounded-xl shadow-sm border border-slate-200 p-4 sm:p-6">
        <Label className="block text-base sm:text-lg font-semibold text-slate-800 mb-3 sm:mb-4">
          Select Medicine / Supplement
        </Label>
        <RadioGroup
          value={selectedMedicineId}
          onValueChange={setSelectedMedicineId}
          className="space-y-2 sm:space-y-3 max-h-60 sm:max-h-64 overflow-y-auto"
        >
          {medicines.map((med) => (
            <div key={med.id} className="flex items-center space-x-3">
              <RadioGroupItem
                value={med.id}
                id={`med-${med.id}`}
                className="sr-only"
              />
              <Label
                htmlFor={`med-${med.id}`}
                className={`w-full flex items-center justify-between text-left p-3 sm:p-4 rounded-lg transition-all duration-200 ease-in-out cursor-pointer border-2
                            ${
                              selectedMedicineId === med.id
                                ? "bg-sky-50 border-sky-400 text-sky-800 shadow-md"
                                : "bg-slate-50 hover:bg-slate-100 border-slate-200 text-slate-700 hover:border-slate-300"
                            }`}
              >
                <span className="font-medium text-sm sm:text-base">{med.name}</span>
                {selectedMedicineId === med.id && (
                  <CheckIcon className="w-4 h-4 sm:w-5 sm:h-5 text-sky-600" />
                )}
              </Label>
            </div>
          ))}
        </RadioGroup>

        {/* Details Section - Under Medicine Selection */}
        {selectedMedicineId && (
          <div className="mt-4 sm:mt-6 pt-4 sm:pt-6 border-t border-slate-200">
            <Label htmlFor="intake-details" className="block text-sm font-medium text-slate-700 mb-2">
              Details (optional)
            </Label>
            <Input
              type="text"
              id="intake-details"
              value={details}
              onChange={(e) => setDetails(e.target.value)}
              placeholder="e.g., 500mg, 2000 IU, with food"
              className="w-full text-sm sm:text-base"
            />
            <p className="text-xs text-slate-500 mt-1">
              Add dosage or other relevant information
            </p>
          </div>
        )}
      </div>

      {/* Date & Time Section */}
      <div className="bg-white rounded-lg sm:rounded-xl shadow-sm border border-slate-200 p-4 sm:p-6">
        <Label className="block text-base sm:text-lg font-semibold text-slate-800 mb-3 sm:mb-4">
          When did you take it?
        </Label>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
          <div>
            <Label htmlFor="intake-date" className="block text-sm font-medium text-slate-700 mb-2">
              Date
            </Label>
            <Input
              type="date"
              id="intake-date"
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
              className="w-full text-sm sm:text-base"
            />
          </div>
          <div>
            <Label htmlFor="intake-time" className="block text-sm font-medium text-slate-700 mb-2">
              Time
            </Label>
            <Input
              type="time"
              id="intake-time"
              value={selectedTime}
              onChange={(e) => setSelectedTime(e.target.value)}
              className="w-full text-sm sm:text-base"
            />
          </div>
        </div>
      </div>

      {/* Record Button */}
      <Button
        onClick={handleRecord}
        disabled={!selectedMedicineId || !selectedDate || !selectedTime}
        className="w-full bg-gradient-to-r from-sky-500 to-blue-600 hover:from-sky-600 hover:to-blue-700 text-white text-base sm:text-lg py-4 sm:py-6 rounded-lg sm:rounded-xl shadow-lg hover:shadow-xl transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
      >
        <PlusIcon className="w-5 h-5 sm:w-6 sm:h-6 mr-2" /> Record Intake
      </Button>
    </div>
  );
};

export default RecordView;
