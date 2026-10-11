// App.tsx
import React, { useCallback, useEffect, useRef, useState } from "react";
import BottomNavigation from "./components/BottomNavigation";
import Header from "./components/Header";
import HistoryView from "./components/HistoryView";
import ManageMedicinesView from "./components/ManageMedicinesView";
import RecordView from "./components/RecordView";
import SettingsView from "./components/SettingsView"; // Import SettingsView
import * as storageService from "./services/storageService";
import type { AppView, IntakeRecord, MedicineItem } from "./types";
import { Toaster } from "@/components/ui/sonner";
import { toast } from "sonner"; // Import toast

const App: React.FC = () => {
  const [medicines, setMedicines] = useState<MedicineItem[]>([]);
  const [intakeRecords, setIntakeRecords] = useState<IntakeRecord[]>([]);
  const [currentView, setCurrentView] = useState<AppView>("record");
  const [isLoading, setIsLoading] = useState(true);

  // Refs mirror the latest lists so event handlers can compute the next value
  // and persist it without putting side effects inside a state updater.
  const medicinesRef = useRef<MedicineItem[]>([]);
  const intakeRecordsRef = useRef<IntakeRecord[]>([]);

  useEffect(() => {
    const storedMedicines = storageService.getMedicines();
    const storedRecords = storageService.getIntakeRecords();
    medicinesRef.current = storedMedicines;
    intakeRecordsRef.current = storedRecords;
    setMedicines(storedMedicines);
    setIntakeRecords(storedRecords);
    setIsLoading(false);
  }, []);

  // State + storage are updated together in one place, from the event handler.
  const commitMedicines = useCallback((updated: MedicineItem[]) => {
    medicinesRef.current = updated;
    setMedicines(updated);
    if (!storageService.saveMedicines(updated)) {
      toast.error("Couldn't save your changes - storage may be full or unavailable.");
    }
  }, []);

  const commitIntakeRecords = useCallback((updated: IntakeRecord[]) => {
    intakeRecordsRef.current = updated;
    setIntakeRecords(updated);
    if (!storageService.saveIntakeRecords(updated)) {
      toast.error("Couldn't save your changes - storage may be full or unavailable.");
    }
  }, []);

  const handleNavigate = useCallback((view: AppView) => {
    setCurrentView(view);
  }, []);

  const handleAddMedicine = useCallback(
    (name: string) => {
      commitMedicines(storageService.addMedicineItem(medicinesRef.current, name));
    },
    [commitMedicines],
  );

  const handleDeleteMedicine = useCallback(
    (id: string) => {
      commitMedicines(storageService.deleteMedicineItem(medicinesRef.current, id));
    },
    [commitMedicines],
  );

  const handleRecordIntake = useCallback(
    (medicineId: string, medicineName: string, timestamp: number, details?: string) => {
      commitIntakeRecords(
        storageService.addIntakeRecordItem(
          intakeRecordsRef.current,
          medicineId,
          medicineName,
          timestamp,
          details,
        ),
      );
    },
    [commitIntakeRecords],
  );

  /**
   * Callback to reorder medicine items.
   * This function is passed to ManageMedicinesView and is called when a drag-and-drop reorder occurs.
   * @param newOrder The new array of MedicineItem in their reordered sequence.
   */
  const handleReorderMedicines = useCallback(
    (newOrder: MedicineItem[]) => {
      commitMedicines(newOrder);
    },
    [commitMedicines],
  );

  const handleDeleteRecord = useCallback(
    (id: string) => {
      commitIntakeRecords(storageService.deleteIntakeRecordItem(intakeRecordsRef.current, id));
    },
    [commitIntakeRecords],
  );

  const handleRestoreRecord = useCallback(
    (record: IntakeRecord) => {
      commitIntakeRecords(storageService.restoreIntakeRecord(intakeRecordsRef.current, record));
    },
    [commitIntakeRecords],
  );

  const handleUpdateRecord = useCallback(
    (id: string, timestamp: number, details?: string) => {
      commitIntakeRecords(
        storageService.updateIntakeRecordItem(intakeRecordsRef.current, id, { timestamp, details }),
      );
      toast.success("Record updated");
    },
    [commitIntakeRecords],
  );

  const handleRestoreMedicine = useCallback(
    (medicine: MedicineItem) => {
      commitMedicines(storageService.restoreMedicineItem(medicinesRef.current, medicine));
    },
    [commitMedicines],
  );

  // Handler functions for SettingsView
  const handleExportData = useCallback(() => {
    storageService.exportData();
    toast.success("Data exported successfully!");
  }, []);

  const handleImportData = useCallback(
    async (event: React.ChangeEvent<HTMLInputElement>) => {
      const file = event.target.files?.[0];
      if (!file) {
        toast.info("No file selected.");
        return;
      }
      const result = await storageService.importData(file);
      if (result.success && result.medicines && result.intakeRecords) {
        commitMedicines(result.medicines);
        commitIntakeRecords(result.intakeRecords);
        toast.success("Data imported successfully!");
      } else {
        toast.error(`Import failed: ${result.error}`);
      }
      event.target.value = "";
    },
    [commitMedicines, commitIntakeRecords],
  );

  const handleClearData = useCallback(() => {
    // Persist first; only clear in-memory state once the wipe actually stuck,
    // otherwise the UI would look empty while storage still holds the data.
    if (!storageService.clearAllData()) {
      toast.error("Couldn't clear data - storage may be full or unavailable.");
      return;
    }
    medicinesRef.current = [];
    intakeRecordsRef.current = [];
    setMedicines([]);
    setIntakeRecords([]);
    toast.success("All data cleared successfully!");
  }, []);

  const renderView = () => {
    if (isLoading) {
      return (
        <div className="p-4 text-center">
          <div className="w-8 h-8 border-2 border-sky-500 border-t-transparent rounded-full animate-spin mx-auto mb-2"></div>
          <span className="text-slate-500">Loading...</span>
        </div>
      );
    }
    switch (currentView) {
      case "record":
        return (
          <RecordView
            medicines={medicines}
            onRecordIntake={handleRecordIntake}
            onNavigateToManage={() => setCurrentView("manage")}
          />
        );
      case "history":
        return (
          <HistoryView
            records={intakeRecords}
            onDeleteRecord={handleDeleteRecord}
            onRestoreRecord={handleRestoreRecord}
            onUpdateRecord={handleUpdateRecord}
          />
        );
      case "manage":
        return (
          <ManageMedicinesView
            medicines={medicines}
            onAddMedicine={handleAddMedicine}
            onDeleteMedicine={handleDeleteMedicine}
            onReorderMedicines={handleReorderMedicines}
            onRestoreMedicine={handleRestoreMedicine}
          />
        );
      case "settings": // Add settings case
        return (
          <SettingsView
            onExportData={handleExportData}
            onImportData={handleImportData}
            onClearData={handleClearData}
          />
        );
      default:
        return (
          <RecordView
            medicines={medicines}
            onRecordIntake={handleRecordIntake}
            onNavigateToManage={() => setCurrentView("manage")}
          />
        );
    }
  };

  return (
    <div className="flex flex-col min-h-screen bg-slate-50">
      <Header />
      <main className="flex flex-col flex-1 min-h-0 pb-20">{renderView()}</main>
      <BottomNavigation currentView={currentView} onNavigate={handleNavigate} />
      <Toaster position="top-center" />
    </div>
  );
};

export default App;
