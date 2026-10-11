import type { IntakeRecord, MedicineItem } from "../types";

const MEDICINES_KEY = "mediLog_medicines";
const INTAKE_RECORDS_KEY = "mediLog_intakeRecords";

/** Builds a reasonably unique id without touching external state. */
const createId = (): string => Date.now().toString() + Math.random().toString(36).substring(2, 9);

const getDefaultMedicines = (): MedicineItem[] => [
  { id: "default-1", name: "Vitamin C" },
  { id: "default-2", name: "Vitamin D" },
];

export const getMedicines = (): MedicineItem[] => {
  try {
    const medicinesJson = localStorage.getItem(MEDICINES_KEY);
    if (medicinesJson) {
      return JSON.parse(medicinesJson);
    } else {
      // Initialize with default medicines only on a genuine first run (no key yet).
      const defaultMeds = getDefaultMedicines();
      saveMedicines(defaultMeds);
      return defaultMeds;
    }
  } catch (error) {
    console.error("Error fetching medicines from local storage:", error);
    // Fallback to default if parsing fails or local storage is inaccessible
    const defaultMeds = getDefaultMedicines();
    saveMedicines(defaultMeds); // Attempt to save defaults again
    return defaultMeds;
  }
};

export const saveMedicines = (medicines: MedicineItem[]): boolean => {
  try {
    localStorage.setItem(MEDICINES_KEY, JSON.stringify(medicines));
    return true;
  } catch (error) {
    console.error("Error saving medicines to local storage:", error);
    return false;
  }
};

export const getIntakeRecords = (): IntakeRecord[] => {
  try {
    const recordsJson = localStorage.getItem(INTAKE_RECORDS_KEY);
    return recordsJson ? JSON.parse(recordsJson) : [];
  } catch (error) {
    console.error("Error fetching intake records from local storage:", error);
    return []; // Return empty array on error
  }
};

export const saveIntakeRecords = (records: IntakeRecord[]): boolean => {
  try {
    localStorage.setItem(INTAKE_RECORDS_KEY, JSON.stringify(records));
    return true;
  } catch (error) {
    console.error("Error saving intake records to local storage:", error);
    return false;
  }
};

// The helpers below are pure list transformations: they never read or write
// storage and never trigger UI. Persistence is handled by the caller so they
// stay safe to use inside React state updaters.

export const addMedicineItem = (medicines: MedicineItem[], name: string): MedicineItem[] => {
  const newItem: MedicineItem = {
    id: createId(),
    name: name.trim(),
  };
  return [...medicines, newItem];
};

export const deleteMedicineItem = (medicines: MedicineItem[], id: string): MedicineItem[] => {
  return medicines.filter((med) => med.id !== id);
};

export const restoreMedicineItem = (
  medicines: MedicineItem[],
  medicine: MedicineItem,
): MedicineItem[] => {
  // Guard against duplicates if undo is pressed after the item was re-added.
  if (medicines.some((med) => med.id === medicine.id)) {
    return medicines;
  }
  return [...medicines, medicine];
};

export const addIntakeRecordItem = (
  intakeRecords: IntakeRecord[],
  medicineId: string,
  medicineName: string,
  timestamp: number, // Accept custom timestamp
  details?: string, // Optional details parameter
): IntakeRecord[] => {
  const newRecord: IntakeRecord = {
    id: createId(),
    medicineId,
    medicineName,
    timestamp, // Use provided timestamp
    ...(details && details.trim() && { details: details.trim() }), // Only add details if provided and not empty
  };
  return [...intakeRecords, newRecord];
};

export const deleteIntakeRecordItem = (
  intakeRecords: IntakeRecord[],
  id: string,
): IntakeRecord[] => {
  return intakeRecords.filter((record) => record.id !== id);
};

export const updateIntakeRecordItem = (
  intakeRecords: IntakeRecord[],
  id: string,
  updates: { timestamp: number; details?: string },
): IntakeRecord[] => {
  return intakeRecords.map((record) => {
    if (record.id !== id) return record;
    // Spread keeps any fields added to IntakeRecord in the future.
    const updated: IntakeRecord = { ...record, timestamp: updates.timestamp };
    const details = updates.details?.trim();
    if (details) {
      updated.details = details;
    } else {
      delete updated.details;
    }
    return updated;
  });
};

export const restoreIntakeRecord = (
  intakeRecords: IntakeRecord[],
  record: IntakeRecord,
): IntakeRecord[] => {
  // Guard against duplicates if undo is pressed after the record was re-added.
  if (intakeRecords.some((existing) => existing.id === record.id)) {
    return intakeRecords;
  }
  return [...intakeRecords, record];
};

export const exportData = (): void => {
  const medicines = getMedicines();
  const intakeRecords = getIntakeRecords();
  const data = { medicines, intakeRecords };
  const jsonString = JSON.stringify(data, null, 2);
  const blob = new Blob([jsonString], { type: "application/json" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = "medilog_data.json";
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
};

const isMedicineItem = (value: unknown): value is MedicineItem => {
  if (typeof value !== "object" || value === null) return false;
  const medicine = value as MedicineItem;
  return typeof medicine.id === "string" && typeof medicine.name === "string";
};

const isIntakeRecord = (value: unknown): value is IntakeRecord => {
  if (typeof value !== "object" || value === null) return false;
  const record = value as IntakeRecord;
  return (
    typeof record.id === "string" &&
    typeof record.medicineId === "string" &&
    typeof record.medicineName === "string" &&
    typeof record.timestamp === "number" &&
    (record.details === undefined || typeof record.details === "string")
  );
};

/**
 * Parses and validates an exported JSON file. Returns the parsed data without
 * persisting it; the caller is responsible for updating and saving state.
 */
export const importData = async (
  file: File,
): Promise<{
  success: boolean;
  medicines?: MedicineItem[];
  intakeRecords?: IntakeRecord[];
  error?: string;
}> => {
  return new Promise((resolve) => {
    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const jsonString = event.target?.result as string;
        const data = JSON.parse(jsonString);

        if (!data || typeof data !== "object") {
          throw new Error("Invalid file format: Not a JSON object.");
        }

        if (!Array.isArray(data.medicines) || !Array.isArray(data.intakeRecords)) {
          throw new Error("Invalid data structure: medicines or intakeRecords are not arrays.");
        }

        if (!data.medicines.every(isMedicineItem)) {
          throw new Error("Invalid data structure: one or more medicines are malformed.");
        }

        if (!data.intakeRecords.every(isIntakeRecord)) {
          throw new Error("Invalid data structure: one or more intake records are malformed.");
        }

        const medicines: MedicineItem[] = data.medicines;
        const intakeRecords: IntakeRecord[] = data.intakeRecords;

        resolve({ success: true, medicines, intakeRecords });
      } catch (e: unknown) {
        console.error("Error importing data:", e);
        resolve({
          success: false,
          error: e instanceof Error ? e.message : "Failed to parse or validate the imported file.",
        });
      }
    };
    reader.onerror = (error) => {
      console.error("FileReader error:", error);
      resolve({ success: false, error: "Failed to read the file." });
    };
    reader.readAsText(file);
  });
};

/**
 * Clears all data by persisting empty lists. The keys are kept so a cleared
 * app stays cleared instead of re-seeding the default medicines.
 */
export const clearAllData = (): boolean => {
  const medicinesCleared = saveMedicines([]);
  const recordsCleared = saveIntakeRecords([]);
  return medicinesCleared && recordsCleared;
};
