import React, { useState } from "react";
import type { IntakeRecord } from "../types";
import { formatTimeForInput, parseLocalDateTime, toLocalDateKey } from "@/lib/dateUtils";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

interface EditRecordDialogProps {
  record: IntakeRecord | null;
  onOpenChange: (open: boolean) => void;
  onSave: (id: string, timestamp: number, details?: string) => void;
}

interface EditRecordFormProps {
  record: IntakeRecord;
  onSave: (id: string, timestamp: number, details?: string) => void;
  onCancel: () => void;
}

const EditRecordForm: React.FC<EditRecordFormProps> = ({ record, onSave, onCancel }) => {
  const [date, setDate] = useState(() => toLocalDateKey(new Date(record.timestamp)));
  const [time, setTime] = useState(() => formatTimeForInput(new Date(record.timestamp)));
  const [details, setDetails] = useState(record.details ?? "");

  const timestamp = parseLocalDateTime(date, time);
  const isValid = Boolean(date) && Boolean(time) && !Number.isNaN(timestamp);

  const handleSave = () => {
    if (!isValid) return;
    onSave(record.id, timestamp, details);
  };

  return (
    <>
      <div className="grid grid-cols-2 gap-3">
        <div>
          <Label htmlFor="edit-record-date" className="mb-1 block text-xs text-slate-700">
            Date
          </Label>
          <Input
            id="edit-record-date"
            type="date"
            value={date}
            onChange={(e) => setDate(e.target.value)}
            className="w-full text-sm"
          />
        </div>
        <div>
          <Label htmlFor="edit-record-time" className="mb-1 block text-xs text-slate-700">
            Time
          </Label>
          <Input
            id="edit-record-time"
            type="time"
            value={time}
            onChange={(e) => setTime(e.target.value)}
            className="w-full text-sm"
          />
        </div>
      </div>
      <div>
        <Label htmlFor="edit-record-details" className="mb-1 block text-xs text-slate-700">
          Details
        </Label>
        <Input
          id="edit-record-details"
          type="text"
          value={details}
          onChange={(e) => setDetails(e.target.value)}
          placeholder="Details (e.g., 500mg)"
          className="w-full text-sm"
        />
      </div>
      <DialogFooter>
        <Button variant="outline" onClick={onCancel}>
          Cancel
        </Button>
        <Button
          onClick={handleSave}
          disabled={!isValid}
          className="bg-sky-500 text-white hover:bg-sky-600"
        >
          Save
        </Button>
      </DialogFooter>
    </>
  );
};

const EditRecordDialog: React.FC<EditRecordDialogProps> = ({ record, onOpenChange, onSave }) => {
  return (
    <Dialog open={record !== null} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Edit record</DialogTitle>
          <DialogDescription>
            Update the date, time or details for {record?.medicineName}.
          </DialogDescription>
        </DialogHeader>
        {record && (
          <EditRecordForm
            key={record.id}
            record={record}
            onSave={onSave}
            onCancel={() => onOpenChange(false)}
          />
        )}
      </DialogContent>
    </Dialog>
  );
};

export default EditRecordDialog;
