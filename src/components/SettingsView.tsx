// src/components/SettingsView.tsx
import React from 'react';
import { Button } from './ui/button'; // Assuming you have a Button component
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card'; // Assuming Card components

interface SettingsViewProps {
  onExportData: () => void;
  onImportData: (event: React.ChangeEvent<HTMLInputElement>) => void;
  onClearData: () => void;
}

const SettingsView: React.FC<SettingsViewProps> = ({ onExportData, onImportData, onClearData }) => {
  const handleImportClick = () => {
    // Trigger hidden file input click
    document.getElementById('import-file-input')?.click();
  };

  return (
    <div className="p-4 space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Data Management</CardTitle>
          <CardDescription>Export, import, or clear your application data.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <h3 className="text-lg font-medium text-slate-800 mb-2">Export Data</h3>
            <p className="text-sm text-slate-600 mb-3">Download all your medicines and intake records as a JSON file.</p>
            <Button onClick={onExportData} variant="outline">Export Data</Button>
          </div>
          <div>
            <h3 className="text-lg font-medium text-slate-800 mb-2">Import Data</h3>
            <p className="text-sm text-slate-600 mb-3">Import data from a previously exported JSON file. This will overwrite existing data.</p>
            <Button onClick={handleImportClick} variant="outline">Import Data</Button>
            <input
              type="file"
              id="import-file-input"
              accept=".json"
              onChange={onImportData}
              className="hidden"
            />
          </div>
          <div>
            <h3 className="text-lg font-medium text-slate-800 mb-2">Clear Data</h3>
            <p className="text-sm text-slate-600 mb-3">Remove all medicines and intake records from the application. This action cannot be undone.</p>
            <Button onClick={onClearData} variant="destructive">Clear All Data</Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default SettingsView;
