// components/ManageMedicinesView.tsx
import { PlusIcon, TrashIcon } from 'lucide-react';
import React, { useState } from 'react';
import type { MedicineItem } from '../types';
import { Button } from './ui/button'; // Import Shadcn Button
import { Card } from './ui/card'; // Import Shadcn Card
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from './ui/dialog'; // Import Shadcn Dialog components
import { Input } from './ui/input'; // Import Shadcn Input

interface ManageMedicinesViewProps {
  medicines: MedicineItem[];
  onAddMedicine: (name: string) => void;
  onDeleteMedicine: (id: string) => void;
}

const ManageMedicinesView: React.FC<ManageMedicinesViewProps> = ({ medicines, onAddMedicine, onDeleteMedicine }) => {
  const [newMedicineName, setNewMedicineName] = useState('');
  const [medicineToDelete, setMedicineToDelete] = useState<MedicineItem | null>(null);

  const handleAdd = (e: React.FormEvent) => {
    e.preventDefault();
    if (newMedicineName.trim() === '') {
      alert('Please enter a medicine name.'); // Consider using a toast/notification instead of alert
      return;
    }
    onAddMedicine(newMedicineName.trim());
    setNewMedicineName('');
  };

  return (
    <div className="p-4 space-y-6">
      <h2 className="text-xl font-semibold text-slate-700 mb-4">Manage Medicines</h2>

      <form onSubmit={handleAdd} className="space-y-3 bg-white p-4 rounded-lg shadow">
        <div>
          <label htmlFor="new-medicine" className="block text-sm font-medium text-slate-700">
            Add New Medicine/Supplement
          </label>
          <Input
            id="new-medicine"
            type="text"
            value={newMedicineName}
            onChange={(e) => setNewMedicineName(e.target.value)}
            placeholder="e.g., Vitamin B12"
            className="mt-1"
          />
        </div>
        <Button
          type="submit"
          className="w-full bg-green-500 hover:bg-green-600 text-white text-lg py-6"
        >
          <PlusIcon className="w-5 h-5 mr-2" /> Add Medicine
        </Button>
      </form>

      <div>
        <h3 className="text-lg font-medium text-slate-700 mb-2">Your Medicines:</h3>
        {medicines.length === 0 ? (
          <p className="text-slate-500 text-center py-4">You haven't added any medicines yet.</p>
        ) : (
          <ul className="space-y-2">
            {medicines.map(med => (
              <Card key={med.id} className="px-4 py-2 flex flex-row justify-between items-center">
                <span className="text-slate-800">{med.name}</span>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => setMedicineToDelete(med)}
                  className="text-red-500 hover:text-red-700"
                  aria-label={`Delete ${med.name}`}
                >
                  <TrashIcon className="w-5 h-5" />
                </Button>
              </Card>
            ))}
          </ul>
        )}
      </div>

      <Dialog open={!!medicineToDelete} onOpenChange={(open) => !open && setMedicineToDelete(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Confirm Deletion</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete <strong>{medicineToDelete?.name}</strong>? This will not remove past intake records but will remove it from the list of available medicines.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setMedicineToDelete(null)}>Cancel</Button>
            <Button
              variant="destructive"
              onClick={() => {
                if (medicineToDelete) {
                  onDeleteMedicine(medicineToDelete.id);
                  setMedicineToDelete(null); // Close the dialog after deletion
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

export default ManageMedicinesView;