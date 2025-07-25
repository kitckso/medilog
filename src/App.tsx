// App.tsx
import React, { useCallback, useEffect, useState } from 'react';
import BottomNavigation from './components/BottomNavigation';
import Header from './components/Header';
import HistoryView from './components/HistoryView';
import ManageMedicinesView from './components/ManageMedicinesView';
import RecordView from './components/RecordView';
import SettingsView from './components/SettingsView'; // Import SettingsView
import * as storageService from './services/storageService';
import type { AppView, IntakeRecord, MedicineItem } from './types';
import { Toaster } from '@/components/ui/sonner';
import { toast } from 'sonner'; // Import toast

const App: React.FC = () => {
  const [medicines, setMedicines] = useState<MedicineItem[]>([]);
  const [intakeRecords, setIntakeRecords] = useState<IntakeRecord[]>([]);
  const [currentView, setCurrentView] = useState<AppView>('record');
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    setMedicines(storageService.getMedicines());
    setIntakeRecords(storageService.getIntakeRecords());
    setIsLoading(false);
  }, []);

  const handleNavigate = useCallback((view: AppView) => {
    setCurrentView(view);
  }, []);

  const handleAddMedicine = useCallback((name: string) => {
    setMedicines(prevMedicines => storageService.addMedicineItem(prevMedicines, name));
  }, []);

  const handleDeleteMedicine = useCallback((id: string) => {
    setMedicines(prevMedicines => storageService.deleteMedicineItem(prevMedicines, id));
  }, []);

  const handleRecordIntake = useCallback((medicineId: string, medicineName: string, timestamp: number, details?: string) => {
    setIntakeRecords(prevRecords => storageService.addIntakeRecordItem(prevRecords, medicineId, medicineName, timestamp, details));
  }, []);

  /**
   * Callback to reorder medicine items.
   * This function is passed to ManageMedicinesView and is called when a drag-and-drop reorder occurs.
   * @param newOrder The new array of MedicineItem in their reordered sequence.
   */
  const handleReorderMedicines = useCallback((newOrder: MedicineItem[]) => {
    setMedicines(newOrder); // Update the state with the new order
    storageService.saveMedicines(newOrder); // Persist the new order to local storage
  }, []);

  const handleDeleteRecord = useCallback((id: string) => {
    setIntakeRecords(prevRecords => storageService.deleteIntakeRecordItem(prevRecords, id));
  }, []);

  // Handler functions for SettingsView
  const handleExportData = useCallback(() => {
    storageService.exportData();
    toast.success('Data exported successfully!');
  }, []);

  const handleImportData = useCallback(async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) {
      toast.info('No file selected.');
      return;
    }
    if (!confirm('Importing data will overwrite existing data. Are you sure you want to proceed?')) {
      event.target.value = ''; // Reset file input
      return;
    }
    const result = await storageService.importData(file);
    if (result.success && result.medicines && result.intakeRecords) {
      setMedicines(result.medicines);
      setIntakeRecords(result.intakeRecords);
      toast.success('Data imported successfully!');
    } else {
      toast.error(`Import failed: ${result.error}`);
    }
    // Reset file input value to allow importing the same file again if needed
    event.target.value = '';
  }, []);

  const handleClearData = useCallback(() => {
    storageService.clearAllData();
    setMedicines(storageService.getMedicines()); // Reload medicines (will be default or empty based on storageService logic)
    setIntakeRecords(storageService.getIntakeRecords()); // Reload records (will be empty)
    toast.success('All data cleared successfully!');
  }, []);

  const renderView = () => {
    if (isLoading) {
        return <div className="p-4 text-center text-slate-600">Loading your data...</div>;
    }
    switch (currentView) {
      case 'record':
        return <RecordView medicines={medicines} onRecordIntake={handleRecordIntake} onNavigateToManage={() => setCurrentView('manage')} />;
      case 'history':
        return <HistoryView records={intakeRecords} onDeleteRecord={handleDeleteRecord} />;
      case 'manage':
        return <ManageMedicinesView medicines={medicines} onAddMedicine={handleAddMedicine} onDeleteMedicine={handleDeleteMedicine} onReorderMedicines={handleReorderMedicines}/>;
      case 'settings': // Add settings case
        return (
          <SettingsView
            onExportData={handleExportData}
            onImportData={handleImportData}
            onClearData={handleClearData}
          />
        );
      default:
        return <RecordView medicines={medicines} onRecordIntake={handleRecordIntake} onNavigateToManage={() => setCurrentView('manage')} />;
    }
  };

  return (
    <div className="flex flex-col min-h-screen bg-slate-50">
      <Header />
      <main className="flex-grow pt-4 pb-20 overflow-y-auto">
        {renderView()}
      </main>
      <BottomNavigation currentView={currentView} onNavigate={handleNavigate} />
      <Toaster position="top-right" />
    </div>
  );
};

export default App;