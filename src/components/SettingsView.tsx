// src/components/SettingsView.tsx
import { Download, Trash2, Upload } from 'lucide-react';
import React, { useRef, useState } from 'react';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from './ui/alert-dialog';
import { Button } from './ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Separator } from './ui/separator';

interface SettingsViewProps {
  onExportData: () => void;
  onImportData: (event: React.ChangeEvent<HTMLInputElement>) => void;
  onClearData: () => void;
}

const SettingsView: React.FC<SettingsViewProps> = ({ onExportData, onImportData, onClearData }) => {
  // Use a ref for the file input for a more idiomatic React approach
  const importInputRef = useRef<HTMLInputElement>(null);
  const [isClearDataDialogOpen, setClearDataDialogOpen] = useState(false);

  const handleImportClick = () => {
    importInputRef.current?.click();
  };
  
  const handleClearDataConfirm = () => {
    onClearData();
    setClearDataDialogOpen(false);
  }

  return (
    <>
      <div className="p-4 sm:p-6 space-y-6 sm:space-y-8 max-w-2xl mx-auto">
        <div className="text-center">
          <h2 className="text-xl sm:text-2xl font-bold text-slate-800 mb-2">Settings</h2>
          <p className="text-sm sm:text-base text-slate-600">Manage your data and application preferences</p>
        </div>

        <Card className="bg-white rounded-lg sm:rounded-xl shadow-sm border border-slate-200">
          <CardHeader className="pb-3 sm:pb-4">
            <CardTitle className="text-base sm:text-lg font-semibold text-slate-800">Data Management</CardTitle>
            <CardDescription className="text-sm sm:text-base text-slate-600">Export, import, or clear your application data</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Export Section */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-3 sm:space-y-0 sm:space-x-4 p-3 sm:p-4 bg-slate-50 rounded-lg border border-slate-200">
              <div className="flex items-start space-x-3">
                 <div className="bg-blue-100 p-2 rounded-lg shrink-0">
                   <Download className="h-4 w-4 sm:h-5 sm:w-5 text-blue-600" />
                 </div>
                <div>
                  <h3 className="text-sm sm:text-base font-semibold text-slate-800">Export Data</h3>
                  <p className="text-xs sm:text-sm text-slate-600">Download all your data as a single JSON file</p>
                </div>
              </div>
              <Button onClick={onExportData} variant="outline" className="bg-white hover:bg-blue-50 border-blue-200 text-blue-700 hover:text-blue-800 w-full sm:w-auto">
                <Download className="w-4 h-4 mr-2" />
                <span className="text-sm sm:text-base">Export</span>
              </Button>
            </div>

            <Separator className="my-4 sm:my-6" />

            {/* Import Section */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-3 sm:space-y-0 sm:space-x-4 p-3 sm:p-4 bg-slate-50 rounded-lg border border-slate-200">
               <div className="flex items-start space-x-3">
                 <div className="bg-green-100 p-2 rounded-lg shrink-0">
                   <Upload className="h-4 w-4 sm:h-5 sm:w-5 text-green-600" />
                 </div>
                <div>
                  <h3 className="text-sm sm:text-base font-semibold text-slate-800">Import Data</h3>
                  <p className="text-xs sm:text-sm text-slate-600">
                    Import from a JSON file. <span className="font-semibold text-amber-600">This will overwrite current data.</span>
                  </p>
                </div>
              </div>
              <Button onClick={handleImportClick} variant="outline" className="bg-white hover:bg-green-50 border-green-200 text-green-700 hover:text-green-800 w-full sm:w-auto">
                <Upload className="w-4 h-4 mr-2" />
                <span className="text-sm sm:text-base">Import</span>
              </Button>
              <input
                type="file"
                ref={importInputRef}
                id="import-file-input"
                accept=".json"
                onChange={onImportData}
                className="hidden"
              />
            </div>

            <Separator className="my-4 sm:my-6" />

            {/* Clear Data Section */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-3 sm:space-y-0 sm:space-x-4 p-3 sm:p-4 bg-red-50 rounded-lg border border-red-200">
              <div className="flex items-start space-x-3">
                 <div className="bg-red-100 p-2 rounded-lg shrink-0">
                   <Trash2 className="h-4 w-4 sm:h-5 sm:w-5 text-red-600" />
                 </div>
                 <div>
                  <h3 className="text-sm sm:text-base font-semibold text-slate-800">Clear All Data</h3>
                  <p className="text-xs sm:text-sm text-red-600">
                    <span className="font-semibold">This action cannot be undone.</span> All records will be permanently deleted.
                  </p>
                </div>
              </div>
              <Button onClick={() => setClearDataDialogOpen(true)} variant="destructive" className="bg-red-600 hover:bg-red-700 w-full sm:w-auto">
                <Trash2 className="w-4 h-4 mr-2" />
                <span className="text-sm sm:text-base">Clear Data</span>
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Confirmation Dialog for Clearing Data */}
      <AlertDialog open={isClearDataDialogOpen} onOpenChange={setClearDataDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete all your medicines and intake history from this device.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleClearDataConfirm} className="bg-red-600 hover:bg-red-700">
              Yes, delete everything
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
};

export default SettingsView;