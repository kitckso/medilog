// components/ManageMedicinesView.tsx
import React, { useState } from "react";
import { PlusIcon, TrashIcon, GripVerticalIcon } from "lucide-react"; // Added GripVerticalIcon for drag handle
import { toast } from "sonner";
import type { MedicineItem } from "../types";

// Shadcn UI components
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";

// DND-KIT Imports for drag and drop functionality
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  type DragEndEvent,
} from "@dnd-kit/core";
import {
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
  arrayMove,
  useSortable,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";

// --- SortableMedicineItem Component ---
// This component represents a single draggable and sortable medicine item in the list.
interface SortableMedicineItemProps {
  medicine: MedicineItem;
  setMedicineToDelete: (medicine: MedicineItem) => void;
}

const SortableMedicineItem: React.FC<SortableMedicineItemProps> = ({
  medicine,
  setMedicineToDelete,
}) => {
  // useSortable hook provides properties and methods to make an item sortable
  const {
    attributes,
    listeners,
    setNodeRef, // Ref to attach to the DOM node for DND-KIT to track
    transform,
    transition,
    isDragging, // Boolean indicating if the item is currently being dragged
  } = useSortable({ id: medicine.id }); // Unique ID for the sortable item

  // Apply transform and transition for smooth dragging animation
  const style = {
    transform: CSS.Transform.toString(transform), // Apply CSS transform for positioning
    transition, // Apply CSS transition for smooth movement
    zIndex: isDragging ? 10 : 0, // Bring dragged item to front
    opacity: isDragging ? 0.8 : 1, // Slightly dim dragged item
    // Add a slight shadow when dragging for better visual feedback
    boxShadow: isDragging ? "0 4px 8px rgba(0,0,0,0.1)" : "none",
  };

  return (
    // Attach the ref and apply dynamic styles
    <Card
      ref={setNodeRef}
      style={style}
      className="p-3 sm:p-4 flex flex-row items-center justify-between bg-white border border-slate-200 shadow-sm hover:shadow-md transition-all duration-200 rounded-lg border-l-4 border-l-emerald-400"
    >
      {/* Drag handle: Attach listeners and attributes for drag functionality */}
      <button
        className="text-slate-400 hover:text-slate-600 cursor-grab active:cursor-grabbing p-1 sm:p-2 rounded-lg hover:bg-slate-50 transition-colors duration-150"
        {...listeners} // Event listeners for drag start/move/end
        {...attributes} // Accessibility attributes for drag and drop
        aria-label="Drag to reorder medicine"
      >
        <GripVerticalIcon className="w-4 h-4 sm:w-5 sm:h-5" />
      </button>
      <span className="flex-grow text-slate-800 ml-2 sm:ml-3 font-medium text-sm sm:text-base">{medicine.name}</span>
      <Button
        variant="ghost"
        size="icon"
        onClick={() => setMedicineToDelete(medicine)}
        className="text-red-400 hover:text-red-600 hover:bg-red-50 ml-1 sm:ml-2 shrink-0"
        aria-label={`Delete ${medicine.name}`}
      >
        <TrashIcon className="w-4 h-4 sm:w-5 sm:h-5" />
      </Button>
    </Card>
  );
};

// --- ManageMedicinesView Component ---
interface ManageMedicinesViewProps {
  medicines: MedicineItem[];
  onAddMedicine: (name: string) => void;
  onDeleteMedicine: (id: string) => void;
  onReorderMedicines: (newOrder: MedicineItem[]) => void; // New prop to handle reordering
}

const ManageMedicinesView: React.FC<ManageMedicinesViewProps> = ({
  medicines,
  onAddMedicine,
  onDeleteMedicine,
  onReorderMedicines,
}) => {
  const [newMedicineName, setNewMedicineName] = useState("");
  const [medicineToDelete, setMedicineToDelete] = useState<MedicineItem | null>(
    null
  );

  // Configure DND-KIT sensors for detecting drag events
  const sensors = useSensors(
    useSensor(PointerSensor), // For mouse and touch interactions
    useSensor(KeyboardSensor, {
      // For keyboard accessibility
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  /**
   * Handles the end of a drag operation.
   * Reorders the medicines array based on the drag result and updates the parent state.
   * @param event The DragEndEvent object containing information about the drag operation.
   */
  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;

    // If the item was dragged to a different position
    if (active.id !== over?.id) {
      // Find the original and new indices of the dragged item
      const oldIndex = medicines.findIndex((med) => med.id === active.id);
      const newIndex = medicines.findIndex((med) => med.id === over?.id);

      // Use arrayMove utility from dnd-kit to get the new ordered array
      const newOrder = arrayMove(medicines, oldIndex, newIndex);
      onReorderMedicines(newOrder); // Call the prop function to update the parent component's state
    }
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

  return (
    <div className="p-4 sm:p-6 space-y-6 sm:space-y-8 max-w-2xl mx-auto">
      <div className="text-center">
        <h2 className="text-xl sm:text-2xl font-bold text-slate-800 mb-2">Manage Medicines</h2>
        <p className="text-sm sm:text-base text-slate-600">Add, reorder, and manage your medications and supplements</p>
      </div>

      {/* Form for adding new medicines */}
      <div className="bg-white rounded-lg sm:rounded-xl shadow-sm border border-slate-200 p-4 sm:p-6">
        <h3 className="text-base sm:text-lg font-semibold text-slate-800 mb-3 sm:mb-4">Add New Medicine/Supplement</h3>
        <form onSubmit={handleAdd} className="space-y-3 sm:space-y-4">
          <div>
            <label
              htmlFor="new-medicine"
              className="block text-sm font-medium text-slate-700 mb-2"
            >
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
            className="w-full bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white text-base sm:text-lg py-4 sm:py-6 rounded-lg sm:rounded-xl shadow-lg hover:shadow-xl transition-all duration-200"
          >
            <PlusIcon className="w-4 h-4 sm:w-5 sm:h-5 mr-2" /> Add Medicine
          </Button>
        </form>
      </div>

      {/* Section for displaying and reordering existing medicines */}
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
          // DndContext provides the overall drag and drop environment
          <DndContext
            sensors={sensors} // Pass configured sensors
            collisionDetection={closestCenter} // Strategy for detecting collisions between draggable and droppable items
            onDragEnd={handleDragEnd} // Callback fired when a drag operation ends
          >
            {/* SortableContext manages the collection of sortable items */}
            <SortableContext
              items={medicines.map((med) => med.id)} // Array of unique IDs for all sortable items
              strategy={verticalListSortingStrategy} // Defines how items are sorted visually in a vertical list
            >
              <ul className="space-y-3">
                {medicines.map((med) => (
                  // Each sortable item must be wrapped in an element with a unique key
                  <li key={med.id}>
                    <SortableMedicineItem
                      medicine={med}
                      setMedicineToDelete={setMedicineToDelete}
                    />
                  </li>
                ))}
              </ul>
            </SortableContext>
          </DndContext>
        )}
      </div>

      {/* Confirmation dialog for deleting a medicine */}
      <Dialog
        open={!!medicineToDelete}
        onOpenChange={(open) => !open && setMedicineToDelete(null)}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Confirm Deletion</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete{" "}
              <strong>{medicineToDelete?.name}</strong>? This will not remove
              past intake records but will remove it from the list of available
              medicines.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setMedicineToDelete(null)}>
              Cancel
            </Button>
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
