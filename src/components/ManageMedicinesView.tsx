// components/ManageMedicinesView.tsx
import React, { useState } from "react";
import { PlusIcon, TrashIcon, GripVerticalIcon } from "lucide-react";
import { toast } from "sonner";
import type { MedicineItem } from "../types";

import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { EmptyState } from "@/components/ui/empty-state";
import { validateMedicineName } from "@/lib/validation";

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

const SortableMedicineItem: React.FC<SortableMedicineItemProps> = ({ medicine, onDelete }) => {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id: medicine.id,
  });

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
      className="bg-card flex flex-row items-center justify-between rounded-xl border border-border py-2.5 pl-2 pr-1.5 shadow-card transition-shadow duration-200 hover:shadow-float"
    >
      <button
        type="button"
        className="text-muted-foreground hover:text-foreground hover:bg-muted cursor-grab rounded-lg p-1.5 transition-colors duration-150 active:cursor-grabbing"
        {...listeners}
        {...attributes}
        aria-label="Drag to reorder medicine"
        style={{ touchAction: "none" }}
      >
        <GripVerticalIcon className="w-4 h-4" />
      </button>
      <span className="text-foreground ml-1 flex-grow font-medium text-sm">{medicine.name}</span>
      <Button
        variant="ghost"
        size="icon"
        onClick={() => onDelete(medicine)}
        className="text-destructive/70 hover:text-destructive hover:bg-destructive/10 ml-1 shrink-0"
        aria-label={`Delete ${medicine.name}`}
      >
        <TrashIcon className="w-4 h-4" />
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
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates }),
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
    const error = validateMedicineName(medicines, newMedicineName);
    if (error) {
      toast.error(error);
      return;
    }
    onAddMedicine(newMedicineName.trim());
    setNewMedicineName("");
  };

  const handleDelete = (medicine: MedicineItem) => {
    onDeleteMedicine(medicine.id);
    toast.success(`"${medicine.name}" deleted`, {
      action: { label: "Undo", onClick: () => onRestoreMedicine(medicine) },
    });
  };

  return (
    <div className="space-y-4 p-4 sm:p-6">
      <div className="text-center">
        <h2 className="text-xl font-bold tracking-tight">Manage Medicines</h2>
        <p className="text-xs text-muted-foreground sm:text-sm">
          Add, reorder, and manage your medications and supplements
        </p>
      </div>

      <div className="bg-card rounded-xl border border-border p-4 shadow-card">
        <h3 className="mb-3 text-sm font-semibold">Add New Medicine/Supplement</h3>
        <form onSubmit={handleAdd} className="flex flex-col gap-3 sm:flex-row">
          <Input
            id="new-medicine"
            type="text"
            value={newMedicineName}
            onChange={(e) => setNewMedicineName(e.target.value)}
            placeholder="e.g., Vitamin B12, Aspirin, Fish Oil"
            className="w-full flex-1 text-sm"
            aria-label="Medicine name"
          />
          <Button type="submit" className="w-full sm:w-auto sm:px-6">
            <PlusIcon className="w-4 h-4" /> Add
          </Button>
        </form>
      </div>

      <div className="bg-card rounded-xl border border-border p-4 shadow-card">
        <div className="mb-3 flex items-baseline justify-between">
          <h3 className="text-sm font-semibold">Your Medicines ({medicines.length})</h3>
          {medicines.length > 0 && <p className="text-xs text-muted-foreground">Drag to reorder</p>}
        </div>
        {medicines.length === 0 ? (
          <EmptyState
            icon={PlusIcon}
            title="No medicines added yet"
            description="Add your first medicine above to get started"
          />
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
              <ul className="space-y-2">
                {medicines.map((med) => (
                  <li key={med.id}>
                    <SortableMedicineItem medicine={med} onDelete={handleDelete} />
                  </li>
                ))}
              </ul>
            </SortableContext>
            <DragOverlay>
              {activeMedicine ? (
                <SortableMedicineItem medicine={activeMedicine} onDelete={handleDelete} />
              ) : null}
            </DragOverlay>
          </DndContext>
        )}
      </div>
    </div>
  );
};

export default ManageMedicinesView;
