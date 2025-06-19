export interface MedicineItem {
  id: string;
  name: string;
}

export interface IntakeRecord {
  id: string;
  medicineId: string;
  medicineName: string; // Denormalized for easier display
  timestamp: number; // Unix timestamp
}

export type AppView = 'record' | 'history' | 'manage' | 'settings';