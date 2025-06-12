// App.tsx
import React, { useCallback, useEffect, useState } from 'react';
import BottomNavigation from './components/BottomNavigation';
import Header from './components/Header';
import HistoryView from './components/HistoryView';
import ManageMedicinesView from './components/ManageMedicinesView';
import RecordView from './components/RecordView';
import * as storageService from './services/storageService';
import type { AppView, IntakeRecord, MedicineItem } from './types';
import { Toaster } from '@/components/ui/sonner';

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

  const handleRecordIntake = useCallback((medicineId: string, medicineName: string, timestamp: number) => {
    setIntakeRecords(prevRecords => storageService.addIntakeRecordItem(prevRecords, medicineId, medicineName, timestamp));
  }, []);

  const handleDeleteRecord = useCallback((id: string) => {
    setIntakeRecords(prevRecords => storageService.deleteIntakeRecordItem(prevRecords, id));
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
        return <ManageMedicinesView medicines={medicines} onAddMedicine={handleAddMedicine} onDeleteMedicine={handleDeleteMedicine} />;
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