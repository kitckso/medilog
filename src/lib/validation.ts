import type { MedicineItem } from "../types";

/**
 * Validates a new medicine name against the existing list.
 * Returns a human-readable error message, or `null` when the name is valid.
 * Pure so it can be reused and tested without any UI.
 */
export const validateMedicineName = (medicines: MedicineItem[], name: string): string | null => {
  const trimmed = name.trim();
  if (!trimmed) {
    return "Medicine name cannot be empty.";
  }
  if (medicines.some((med) => med.name.trim().toLowerCase() === trimmed.toLowerCase())) {
    return "Medicine with this name already exists.";
  }
  return null;
};
