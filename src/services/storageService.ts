import type { IntakeRecord, MedicineItem } from '../types';

const MEDICINES_KEY = 'mediLog_medicines';
const INTAKE_RECORDS_KEY = 'mediLog_intakeRecords';

const getDefaultMedicines = (): MedicineItem[] => [
  { id: 'default-1', name: 'Vitamin C' },
  { id: 'default-2', name: 'Vitamin D' },
];

export const getMedicines = (): MedicineItem[] => {
  try {
    const medicinesJson = localStorage.getItem(MEDICINES_KEY);
    if (medicinesJson) {
      return JSON.parse(medicinesJson);
    } else {
      // Initialize with default medicines if none are found
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

export const saveMedicines = (medicines: MedicineItem[]): void => {
  try {
    localStorage.setItem(MEDICINES_KEY, JSON.stringify(medicines));
  } catch (error) {
    console.error("Error saving medicines to local storage:", error);
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

export const saveIntakeRecords = (records: IntakeRecord[]): void => {
  try {
    localStorage.setItem(INTAKE_RECORDS_KEY, JSON.stringify(records));
  } catch (error) {
    console.error("Error saving intake records to local storage:", error);
  }
};

export const addMedicineItem = (medicines: MedicineItem[], name: string): MedicineItem[] => {
  if (!name.trim()) {
    alert("Medicine name cannot be empty.");
    return medicines;
  }
  if (medicines.some(med => med.name.toLowerCase() === name.trim().toLowerCase())) {
    alert("Medicine with this name already exists.");
    return medicines;
  }
  const newItem: MedicineItem = {
    id: Date.now().toString() + Math.random().toString(36).substring(2, 9),
    name: name.trim(),
  };
  const updatedMedicines = [...medicines, newItem];
  saveMedicines(updatedMedicines);
  return updatedMedicines;
};

export const deleteMedicineItem = (medicines: MedicineItem[], id: string): MedicineItem[] => {
  const updatedMedicines = medicines.filter(med => med.id !== id);
  saveMedicines(updatedMedicines);
  // Optionally, also remove intake records associated with this medicine
  // For now, we'll keep them with the stored medicineName
  return updatedMedicines;
};

export const addIntakeRecordItem = (
  intakeRecords: IntakeRecord[],
  medicineId: string,
  medicineName: string,
  timestamp: number, // Accept custom timestamp
  details?: string // Optional details parameter
): IntakeRecord[] => {
  const newRecord: IntakeRecord = {
    id: Date.now().toString() + Math.random().toString(36).substring(2, 9), // Record ID is still unique now
    medicineId,
    medicineName,
    timestamp, // Use provided timestamp
    ...(details && details.trim() && { details: details.trim() }), // Only add details if provided and not empty
  };
  const updatedRecords = [...intakeRecords, newRecord];
  saveIntakeRecords(updatedRecords);
  return updatedRecords;
};

export const deleteIntakeRecordItem = (intakeRecords: IntakeRecord[], id: string): IntakeRecord[] => {
  const updatedRecords = intakeRecords.filter(record => record.id !== id);
  saveIntakeRecords(updatedRecords);
  return updatedRecords;
};

export const exportData = (): void => {
  const medicines = getMedicines();
  const intakeRecords = getIntakeRecords();
  const data = { medicines, intakeRecords };
  const jsonString = JSON.stringify(data, null, 2);
  const blob = new Blob([jsonString], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = 'medilog_data.json';
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
};

export const importData = async (file: File): Promise<{ success: boolean; medicines?: MedicineItem[]; intakeRecords?: IntakeRecord[]; error?: string }> => {
  return new Promise((resolve) => {
    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const jsonString = event.target?.result as string;
        const data = JSON.parse(jsonString);

        if (!data || typeof data !== 'object') {
          throw new Error('Invalid file format: Not a JSON object.');
        }

        if (!Array.isArray(data.medicines) || !Array.isArray(data.intakeRecords)) {
          throw new Error('Invalid data structure: medicines or intakeRecords are not arrays.');
        }

        // Further validation could be added here to check item structures
        const medicines: MedicineItem[] = data.medicines;
        const intakeRecords: IntakeRecord[] = data.intakeRecords;

        saveMedicines(medicines);
        saveIntakeRecords(intakeRecords);
        resolve({ success: true, medicines, intakeRecords });
      } catch (e: any) {
        console.error("Error importing data:", e);
        resolve({ success: false, error: e.message || 'Failed to parse or validate the imported file.' });
      }
    };
    reader.onerror = (error) => {
      console.error("FileReader error:", error);
      resolve({ success: false, error: 'Failed to read the file.' });
    };
    reader.readAsText(file);
  });
};

export const clearAllData = (): void => {
  saveMedicines([]);
  saveIntakeRecords([]);
  // Consider also clearing any default medicines if they are re-added on empty
  // For now, this just clears the current lists.
  // To truly reset to initial state, one might need to localStorage.removeItem for the keys
  // and then reload the app or re-initialize defaults.
  // However, the current getMedicines() logic re-adds defaults if the list is empty.
  // So, to ensure a true clear, we'll remove the items.
  localStorage.removeItem(MEDICINES_KEY);
  localStorage.removeItem(INTAKE_RECORDS_KEY);
};