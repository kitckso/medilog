export interface MedicineItem {
  id: string;
  name: string;
}

export interface IntakeRecord {
  id: string;
  medicineId: string;
  medicineName: string; // Denormalized for easier display
  timestamp: number; // Unix timestamp
  details?: string; // Optional details like dosage (e.g., "500mg", "2 IU")
}

export type AppView = 'record' | 'history' | 'manage' | 'settings';