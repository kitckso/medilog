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
      <div className="p-4">
        <Card>
          <CardHeader>
            <CardTitle>Data Management</CardTitle>
            <CardDescription>Export, import, or clear your application data.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Export Section */}
            <div className="flex items-center justify-between space-x-4">
              <div className="flex items-start space-x-3">
                 <Download className="h-5 w-5 shrink-0 text-slate-500 mt-1" />
                <div>
                  <h3 className="text-md font-medium text-slate-800">Export Data</h3>
                  <p className="text-sm text-slate-600">Download all your data as a single JSON file.</p>
                </div>
              </div>
              <Button onClick={onExportData} variant="outline">
                Export
              </Button>
            </div>

            <Separator />

            {/* Import Section */}
            <div className="flex items-center justify-between space-x-4">
               <div className="flex items-start space-x-3">
                 <Upload className="h-5 w-5 shrink-0 text-slate-500 mt-1" />
                <div>
                  <h3 className="text-md font-medium text-slate-800">Import Data</h3>
                  <p className="text-sm text-slate-600">
                    Import from a JSON file. <span className="font-semibold">This will overwrite current data.</span>
                  </p>
                </div>
              </div>
              <Button onClick={handleImportClick} variant="outline" className='mr-0'>
                Import
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

            <Separator />

            {/* Clear Data Section */}
            <div className="flex items-center justify-between space-x-4">
              <div className="flex items-start space-x-3">
                 <Trash2 className="h-5 w-5 shrink-0 text-red-500 mt-1" />
                 <div>
                  <h3 className="text-md font-medium text-slate-800">Clear All Data</h3>
                  <p className="text-sm text-red-600">
                    <span className="font-semibold">This action cannot be undone.</span> All records will be permanently deleted.
                  </p>
                </div>
              </div>
              <Button onClick={() => setClearDataDialogOpen(true)} variant="destructive">
                Clear Data
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