// components/RecordView.tsx
import { CheckIcon, PlusIcon } from 'lucide-react';
import React, { useEffect, useState } from 'react';
import type { MedicineItem } from '../types';
import { Button } from './ui/button'; // Import Shadcn Button
import { Input } from './ui/input'; // Import Shadcn Input
import { Label } from './ui/label'; // Import Shadcn Label
import { RadioGroup, RadioGroupItem } from './ui/radio-group'; // Import Shadcn RadioGroup

interface RecordViewProps {
  medicines: MedicineItem[];
  onRecordIntake: (medicineId: string, medicineName: string, timestamp: number) => void;
  onNavigateToManage: () => void;
}

// Helper to get 'YYYY-MM-DD'
const formatDateForInput = (date: Date): string => {
  const year = date.getFullYear();
  const month = (date.getMonth() + 1).toString().padStart(2, '0');
  const day = date.getDate().toString().padStart(2, '0');
  return `${year}-${month}-${day}`;
};

// Helper to get 'HH:MM' (24-hour format for input type="time")
const formatTimeForInput = (date: Date): string => {
  const hours = date.getHours().toString().padStart(2, '0');
  const minutes = date.getMinutes().toString().padStart(2, '0');
  return `${hours}:${minutes}`;
};

const RecordView: React.FC<RecordViewProps> = ({ medicines, onRecordIntake, onNavigateToManage }) => {
  const [selectedMedicineId, setSelectedMedicineId] = useState<string>('');
  const [showSuccessMessage, setShowSuccessMessage] = useState<boolean>(false);

  const [selectedDate, setSelectedDate] = useState<string>(formatDateForInput(new Date()));
  const [selectedTime, setSelectedTime] = useState<string>(formatTimeForInput(new Date()));

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
      alert('Please select a medicine.'); // Consider using a toast/notification
      return;
    }
    if (!selectedDate || !selectedTime) {
      alert('Please select a valid date and time.'); // Consider using a toast/notification
      return;
    }

    const selectedMedicine = medicines.find(m => m.id === selectedMedicineId);
    if (selectedMedicine) {
      const [year, month, day] = selectedDate.split('-').map(Number);
      const [hours, minutes] = selectedTime.split(':').map(Number);
      const timestamp = new Date(year, month - 1, day, hours, minutes).getTime();

      if (isNaN(timestamp)) {
        alert('Invalid date or time selected.'); // Consider using a toast/notification
        return;
      }

      onRecordIntake(selectedMedicine.id, selectedMedicine.name, timestamp);
      setShowSuccessMessage(true);
      setTimeout(() => {
        setShowSuccessMessage(false);
        setSelectedMedicineId(''); // Reset medicine selection
        const now = new Date();
        setSelectedDate(formatDateForInput(now));
        setSelectedTime(formatTimeForInput(now));
        // Re-select first medicine if available
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
    <div className="p-4 space-y-6">
      <h2 className="text-xl font-semibold text-slate-700">Record Intake</h2>

      <div className="space-y-3">
        <div>
            <Label htmlFor="intake-date">Date</Label>
            <Input
            type="date"
            id="intake-date"
            value={selectedDate}
            onChange={(e) => setSelectedDate(e.target.value)}
            className="mt-1"
            />
        </div>
        <div>
            <Label htmlFor="intake-time">Time</Label>
            <Input
            type="time"
            id="intake-time"
            value={selectedTime}
            onChange={(e) => setSelectedTime(e.target.value)}
            className="mt-1"
            />
        </div>
      </div>

      <div>
        <Label className="block text-sm font-medium text-slate-700 mb-2">
          Select Medicine / Supplement
        </Label>
        <RadioGroup
          value={selectedMedicineId}
          onValueChange={setSelectedMedicineId}
          className="space-y-2 max-h-60 overflow-y-auto p-3 rounded-md border border-slate-300 shadow-sm"
        >
          {medicines.map(med => (
            <div key={med.id} className="flex items-center space-x-3">
              <RadioGroupItem value={med.id} id={`med-${med.id}`} className="sr-only" />
              <Label
                htmlFor={`med-${med.id}`}
                className={`w-full flex items-center justify-between text-left p-3 rounded-md transition-colors duration-150 ease-in-out cursor-pointer
                            ${selectedMedicineId === med.id ? 'bg-sky-100 border-sky-500 text-sky-700 ring-2 ring-sky-500'
                                        : 'bg-white hover:bg-slate-50 border border-slate-200 text-slate-700'}`}
              >
                <span className="font-medium">{med.name}</span>
                {selectedMedicineId === med.id && <CheckIcon className="w-5 h-5 text-sky-600" />}
              </Label>
            </div>
          ))}
        </RadioGroup>
      </div>

      <Button
        onClick={handleRecord}
        disabled={!selectedMedicineId || !selectedDate || !selectedTime}
        className="w-full bg-sky-500 hover:bg-sky-600 text-white text-lg py-3"
      >
        <PlusIcon className="w-6 h-6 mr-2" /> Record Intake
      </Button>

      {showSuccessMessage && (
        <div className="mt-4 p-3 bg-green-100 border border-green-300 text-green-700 rounded-md text-center">
          Intake recorded successfully!
        </div>
      )}
    </div>
  );
};

export default RecordView;