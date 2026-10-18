// src/components/SettingsView.tsx
import { Download, Monitor, Moon, Sun, Trash2, Upload } from "lucide-react";
import React, { useRef, useState } from "react";
import { useTheme } from "next-themes";
import packageJson from "../../package.json";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "./ui/alert-dialog";
import { Button } from "./ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "./ui/card";
import { Separator } from "./ui/separator";
import { Tabs, TabsList, TabsTrigger } from "./ui/tabs";
import { Badge } from "./ui/badge";

interface SettingsViewProps {
  onExportData: () => void;
  onImportData: (event: React.ChangeEvent<HTMLInputElement>) => void;
  onClearData: () => void;
}

const SettingsView: React.FC<SettingsViewProps> = ({ onExportData, onImportData, onClearData }) => {
  const importInputRef = useRef<HTMLInputElement>(null);
  const [isClearDataDialogOpen, setClearDataDialogOpen] = useState(false);
  const [isImportDialogOpen, setImportDialogOpen] = useState(false);
  const { theme, setTheme } = useTheme();

  const handleImportClick = () => {
    setImportDialogOpen(true);
  };

  const handleImportConfirm = () => {
    setImportDialogOpen(false);
    importInputRef.current?.click();
  };

  const handleImportCancel = () => {
    setImportDialogOpen(false);
    if (importInputRef.current) {
      importInputRef.current.value = "";
    }
  };

  const handleClearDataConfirm = () => {
    onClearData();
    setClearDataDialogOpen(false);
  };

  return (
    <>
      <div className="space-y-6 p-4 sm:p-6 sm:space-y-8">
        <div className="text-center">
          <h2 className="mb-2 text-xl font-bold tracking-tight sm:text-2xl">Settings</h2>
          <p className="text-sm text-muted-foreground sm:text-base">
            Manage your data and application preferences
          </p>
        </div>

        <Card className="shadow-card sm:rounded-xl">
          <CardHeader className="pb-3 sm:pb-4">
            <CardTitle className="text-base font-semibold sm:text-lg">Appearance</CardTitle>
            <CardDescription className="text-sm">
              Choose how MediLog looks on this screen
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Tabs value={theme ?? "system"} onValueChange={setTheme}>
              <TabsList className="grid w-full grid-cols-3">
                <TabsTrigger value="light" className="gap-1.5">
                  <Sun className="size-3.5" aria-hidden="true" /> Light
                </TabsTrigger>
                <TabsTrigger value="system" className="gap-1.5">
                  <Monitor className="size-3.5" aria-hidden="true" /> System
                </TabsTrigger>
                <TabsTrigger value="dark" className="gap-1.5">
                  <Moon className="size-3.5" aria-hidden="true" /> Dark
                </TabsTrigger>
              </TabsList>
            </Tabs>
          </CardContent>
        </Card>

        <Card className="shadow-card sm:rounded-xl">
          <CardHeader className="pb-3 sm:pb-4">
            <CardTitle className="text-base font-semibold sm:text-lg">Data Management</CardTitle>
            <CardDescription className="text-sm">
              Export, import, or clear your application data
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Export Section */}
            <div className="flex flex-col space-y-3 rounded-lg border border-border bg-muted/40 p-3 sm:flex-row sm:items-center sm:justify-between sm:space-y-0 sm:space-x-4 sm:p-4">
              <div className="flex items-start space-x-3">
                <div className="rounded-lg bg-primary/10 p-2 text-primary shrink-0">
                  <Download className="h-4 w-4 sm:h-5 sm:w-5" />
                </div>
                <div>
                  <h3 className="text-sm font-semibold sm:text-base">Export Data</h3>
                  <p className="text-xs text-muted-foreground sm:text-sm">
                    Download all your data as a single JSON file
                  </p>
                </div>
              </div>
              <Button
                onClick={onExportData}
                variant="outline"
                className="w-full bg-card sm:w-28 dark:bg-card dark:hover:bg-accent"
              >
                <Download className="mr-2 w-4 h-4" />
                <span className="text-sm">Export</span>
              </Button>
            </div>

            <Separator className="my-4 sm:my-6" />

            {/* Import Section */}
            <div className="flex flex-col space-y-3 rounded-lg border border-border bg-muted/40 p-3 sm:flex-row sm:items-center sm:justify-between sm:space-y-0 sm:space-x-4 sm:p-4">
              <div className="flex items-start space-x-3">
                <div className="rounded-lg bg-success/15 p-2 text-success shrink-0">
                  <Upload className="h-4 w-4 sm:h-5 sm:w-5" />
                </div>
                <div>
                  <h3 className="text-sm font-semibold sm:text-base">Import Data</h3>
                  <p className="text-xs text-muted-foreground sm:text-sm">
                    Import from a JSON file.{" "}
                    <span className="font-semibold text-warning">
                      This will overwrite current data.
                    </span>
                  </p>
                </div>
              </div>
              <Button
                onClick={handleImportClick}
                variant="outline"
                className="w-full bg-card sm:w-28 dark:bg-card dark:hover:bg-accent"
              >
                <Upload className="mr-2 w-4 h-4" />
                <span className="text-sm">Import</span>
              </Button>
            </div>
            {/* Hidden picker lives OUTSIDE the flex row: as a zero-width flex
                child it made justify-between pull the Import button off the
                right edge, misaligning it with Export/Clear. */}
            <input
              type="file"
              ref={importInputRef}
              id="import-file-input"
              accept=".json"
              onChange={onImportData}
              className="hidden"
            />

            <Separator className="my-4 sm:my-6" />

            {/* Clear Data Section */}
            <div className="flex flex-col space-y-3 rounded-lg border border-destructive/25 bg-destructive/5 p-3 sm:flex-row sm:items-center sm:justify-between sm:space-y-0 sm:space-x-4 sm:p-4">
              <div className="flex items-start space-x-3">
                <div className="rounded-lg bg-destructive/15 p-2 text-destructive shrink-0">
                  <Trash2 className="h-4 w-4 sm:h-5 sm:w-5" />
                </div>
                <div>
                  <h3 className="text-sm font-semibold sm:text-base">Clear All Data</h3>
                  <p className="text-destructive text-xs sm:text-sm">
                    <span className="font-semibold">This action cannot be undone.</span> All records
                    will be permanently deleted.
                  </p>
                </div>
              </div>
              <Button
                onClick={() => setClearDataDialogOpen(true)}
                variant="destructive"
                className="w-full sm:w-28"
              >
                <Trash2 className="mr-2 w-4 h-4" />
                <span className="text-sm">Clear Data</span>
              </Button>
            </div>
          </CardContent>
        </Card>

        <div className="flex items-center justify-center gap-3 rounded-lg border border-border bg-card px-4 py-3 shadow-card sm:rounded-xl">
          <div className="flex size-7 items-center justify-center rounded-md bg-primary text-primary-foreground">
            <span className="text-sm font-bold">{packageJson.name.charAt(0).toUpperCase()}</span>
          </div>
          <span className="text-sm font-semibold capitalize">{packageJson.name}</span>
          <span className="text-xs text-muted-foreground">·</span>
          <Badge variant="secondary">v{packageJson.version}</Badge>
        </div>
      </div>

      {/* Import Confirmation Dialog */}
      <AlertDialog open={isImportDialogOpen} onOpenChange={setImportDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Import Data?</AlertDialogTitle>
            <AlertDialogDescription>
              Importing data will overwrite all existing medicines and intake records. This action
              cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={handleImportCancel}>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleImportConfirm}>Import</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Confirmation Dialog for Clearing Data */}
      <AlertDialog open={isClearDataDialogOpen} onOpenChange={setClearDataDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete all your medicines and
              intake history from this device.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleClearDataConfirm}
              className="bg-destructive text-white hover:bg-destructive/90"
            >
              Yes, delete everything
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
};

export default SettingsView;
