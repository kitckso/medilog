// components/ManageMedicinesView.tsx
import React, { useState } from "react";
import { PlusIcon, TrashIcon, GripVerticalIcon } from "lucide-react";
import { toast } from "sonner";
import type { MedicineItem } from "../types";

import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";

import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  TouchSensor,
  useSensor,
  useSensors,
  type DragEndEvent,
  DragOverlay,
} from "@dnd-kit/core";
import {
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
  arrayMove,
  useSortable,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";

interface SortableMedicineItemProps {
  medicine: MedicineItem;
  onDelete: (medicine: MedicineItem) => void;
}

const SortableMedicineItem: React.FC<SortableMedicineItemProps> = ({
  medicine,
  onDelete,
}) => {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: medicine.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    zIndex: isDragging ? 10 : 0,
    opacity: isDragging ? 0 : 1,
    boxShadow: isDragging ? "0 4px 8px rgba(0,0,0,0.1)" : "none",
  };

  return (
    <Card
      ref={setNodeRef}
      style={style}
      className="p-3 sm:p-4 flex flex-row items-center justify-between bg-white border border-slate-200 shadow-sm hover:shadow-md transition-all duration-200 rounded-lg border-l-4 border-l-sky-400"
    >
      <div
        className="text-slate-400 hover:text-slate-600 cursor-grab active:cursor-grabbing p-1 sm:p-2 rounded-lg hover:bg-slate-50 transition-colors duration-150"
        {...listeners}
        {...attributes}
        role="button"
        tabIndex={0}
        aria-label="Drag to reorder medicine"
        style={{ touchAction: 'none' }}
      >
        <GripVerticalIcon className="w-4 h-4 sm:w-5 sm:h-5" />
      </div>
      <span className="flex-grow text-slate-800 ml-2 sm:ml-3 font-medium text-sm sm:text-base">{medicine.name}</span>
      <Button
        variant="ghost"
        size="icon"
        onClick={() => onDelete(medicine)}
        className="text-red-400 hover:text-red-600 hover:bg-red-50 ml-1 sm:ml-2 shrink-0"
        aria-label={`Delete ${medicine.name}`}
      >
        <TrashIcon className="w-4 h-4 sm:w-5 sm:h-5" />
      </Button>
    </Card>
  );
};

interface ManageMedicinesViewProps {
  medicines: MedicineItem[];
  onAddMedicine: (name: string) => void;
  onDeleteMedicine: (id: string) => void;
  onReorderMedicines: (newOrder: MedicineItem[]) => void;
  onRestoreMedicine: (medicine: MedicineItem) => void;
}

const ManageMedicinesView: React.FC<ManageMedicinesViewProps> = ({
  medicines,
  onAddMedicine,
  onDeleteMedicine,
  onReorderMedicines,
  onRestoreMedicine,
}) => {
  const [newMedicineName, setNewMedicineName] = useState("");
  const [activeMedicine, setActiveMedicine] = useState<MedicineItem | null>(null);

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 3 } }),
    useSensor(TouchSensor, { activationConstraint: { delay: 200, tolerance: 5 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
  );

  const handleDragStart = (event: DragEndEvent) => {
    const { active } = event;
    setActiveMedicine(medicines.find((med) => med.id === active.id) || null);
  };

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    if (active.id !== over?.id) {
      const oldIndex = medicines.findIndex((med) => med.id === active.id);
      const newIndex = medicines.findIndex((med) => med.id === over?.id);
      const newOrder = arrayMove(medicines, oldIndex, newIndex);
      onReorderMedicines(newOrder);
    }
    setActiveMedicine(null);
  };

  const handleAdd = (e: React.FormEvent) => {
    e.preventDefault();
    if (newMedicineName.trim() === "") {
      toast.error("Please enter a medicine name.");
      return;
    }
    onAddMedicine(newMedicineName.trim());
    setNewMedicineName("");
  };

  const handleDelete = (medicine: MedicineItem) => {
    onDeleteMedicine(medicine.id);
    toast.success(`"${medicine.name}" deleted`, {
      action: { label: 'Undo', onClick: () => onRestoreMedicine(medicine) },
    });
  };

  return (
    <div className="p-4 sm:p-6 space-y-6 sm:space-y-8 max-w-2xl">
      <div className="text-center">
        <h2 className="text-xl sm:text-2xl font-bold text-slate-800 mb-2">Manage Medicines</h2>
        <p className="text-sm sm:text-base text-slate-600">Add, reorder, and manage your medications and supplements</p>
      </div>

      <div className="bg-white rounded-lg sm:rounded-xl shadow-sm border border-slate-200 p-4 sm:p-6">
        <h3 className="text-base sm:text-lg font-semibold text-slate-800 mb-3 sm:mb-4">Add New Medicine/Supplement</h3>
        <form onSubmit={handleAdd} className="space-y-3 sm:space-y-4">
          <div>
            <label htmlFor="new-medicine" className="block text-sm font-medium text-slate-700 mb-2">
              Medicine Name
            </label>
            <Input
              id="new-medicine"
              type="text"
              value={newMedicineName}
              onChange={(e) => setNewMedicineName(e.target.value)}
              placeholder="e.g., Vitamin B12, Aspirin, Fish Oil"
              className="w-full text-sm sm:text-base"
            />
          </div>
          <Button
            type="submit"
            className="w-full bg-sky-500 hover:bg-sky-600 text-white text-base sm:text-lg py-4 sm:py-6 rounded-lg sm:rounded-xl shadow-lg hover:shadow-xl transition-all duration-200"
          >
            <PlusIcon className="w-4 h-4 sm:w-5 sm:h-5 mr-2" /> Add Medicine
          </Button>
        </form>
      </div>

      <div className="bg-white rounded-lg sm:rounded-xl shadow-sm border border-slate-200 p-4 sm:p-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-3 sm:mb-4 gap-2">
          <h3 className="text-base sm:text-lg font-semibold text-slate-800">
            Your Medicines ({medicines.length})
          </h3>
          {medicines.length > 0 && (
            <p className="text-xs sm:text-sm text-slate-500">Drag to reorder</p>
          )}
        </div>
        {medicines.length === 0 ? (
          <div className="text-center py-6 sm:py-8">
            <div className="bg-slate-50 rounded-full w-12 h-12 sm:w-16 sm:h-16 flex items-center justify-center mx-auto mb-3 sm:mb-4">
              <PlusIcon className="w-6 h-6 sm:w-8 sm:h-8 text-slate-400" />
            </div>
            <p className="text-slate-500 text-base sm:text-lg">No medicines added yet</p>
            <p className="text-slate-400 text-xs sm:text-sm">Add your first medicine above to get started</p>
          </div>
        ) : (
          <DndContext
            sensors={sensors}
            collisionDetection={closestCenter}
            onDragStart={handleDragStart}
            onDragEnd={handleDragEnd}
          >
            <SortableContext
              items={medicines.map((med) => med.id)}
              strategy={verticalListSortingStrategy}
            >
              <ul className="space-y-3">
                {medicines.map((med) => (
                  <li key={med.id}>
                    <SortableMedicineItem
                      medicine={med}
                      onDelete={handleDelete}
                    />
                  </li>
                ))}
              </ul>
            </SortableContext>
            <DragOverlay>
              {activeMedicine ? (
                <SortableMedicineItem
                  medicine={activeMedicine}
                  onDelete={handleDelete}
                />
              ) : null}
            </DragOverlay>
          </DndContext>
        )}
      </div>
    </div>
  );
};

export default ManageMedicinesView;