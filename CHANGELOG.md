# Changelog

All notable changes to MediLog will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [1.4.1] - 2026-10-11

### 🐛 Fixed

- Service worker updates now apply on their own. The app no longer stays pinned to the previously cached version while a newer build sits unused in the background

### 🔧 Changed

- Switched the PWA to `registerType: "autoUpdate"`, which lets the plugin inject `skipWaiting` and `clientsClaim` together. The "New version available" prompt was removed because it could not take effect: under `registerType: "prompt"` the plugin injects neither flag, so a new worker activated without claiming open tabs and the prompt's reload appeared to do nothing

## [1.4.0] - 2026-10-11

### ✨ Added

- Unit test suite powered by Vitest through `vp test` (85 tests covering the storage service, date utilities, record filtering, and medicine-name validation)
- Edit existing intake records from History (date, time, and details)
- Search/filter intake history by medicine or details, applied to both the list and calendar views
- PWA update prompt ("New version available") so users can reload into the latest version instead of a silent swap
- Top-level error boundary: a render crash now shows a reload prompt instead of a blank screen
- Pure `validateMedicineName` helper, with validation surfaced through toasts

### 🔧 Changed

- Migrated tooling to Vite+ (`vp dev`, `vp build`, `vp check`, `vp test`)
- Storage-service list helpers are now pure; persistence is explicit, reports success, and surfaces write failures with an error toast
- Data import now validates the shape of each medicine and record, not just the top-level arrays
- Design tokens: sky/slate palette centralized in `:root`; the header, buttons, dialogs, and focus rings follow `--primary`/`--ring`, with a unified centered content shell and aligned bottom navigation
- Extracted date helpers to `src/lib/dateUtils.ts` and moved `buttonVariants` into its own module

### 🐛 Fixed

- Selecting a different medicine no longer resets the chosen date/time to "now"
- "Clear All Data" now persists empty lists, so the default medicines no longer reappear
- Undo (restore) no longer creates duplicate medicines or intake records
- Replaced an invalid `shadow-top` class and improved muted-text contrast (`slate-400` → `slate-500`)
- Drag handle uses a native `<button>`; named transitions replace `transition-all`

## [1.3.0] - 2026-05-01

### ✨ Added

- Undo action for deleted medicines and intake records (toast action)
- App version badge in Settings

### 🔧 Changed

- Replaced confirmation dialogs with toast-based actions for deletions
- Unified the accent color to sky-500 across views and removed a hardcoded green
- Toaster moved to top-center for mobile and improved the loading spinner

## [1.2.0] - 2026-05-01

### ✨ Added

- Enhanced drag-and-drop for reordering medicines

### 🔧 Changed

- Compacted the Record Intake view for mobile, with the button pinned to the bottom
- Updated dependencies and switched to the standard React plugin

### 🐛 Fixed

- HistoryView full-width layout

## [1.1.1] - 2025-07-12

### 🐛 Bug Fixes

- **FIXED**: Drag and drop functionality on mobile devices.

## [1.1.0] - 2025-07-12

### 🎉 Major Features Added

#### Optional Details for Intake Records

- **NEW**: Added optional details field when recording medication intake
- Users can now add dosage information (e.g., "500mg", "2000 IU")
- Details appear prominently in history view with highlighted styling

#### Enhanced User Interface & Design

- **REDESIGNED**: Complete UI overhaul with modern, professional design
- Implemented card-based layout with subtle shadows and rounded corners
- Added gradient buttons with improved hover effects
- Enhanced visual hierarchy with better typography and spacing
- Consistent color scheme across all components

#### Mobile-First Responsive Design

- **OPTIMIZED**: Comprehensive mobile responsiveness improvements
- Responsive typography that scales properly on all screen sizes
- Stacked layouts for better mobile usability
- Full-width buttons and inputs on mobile devices
- Optimized spacing and padding for small screens

### 🎨 UI/UX Improvements

#### RecordView Enhancements

- Reorganized layout with details input under medicine selection
- Enhanced medicine selection with better visual feedback
- Improved date/time input layout with responsive grid
- Added descriptive subtitles and helper text
- Better empty state messaging

#### HistoryView Improvements

- Enhanced record cards with left border accents
- Improved date headers with elegant divider styling
- Details displayed in highlighted blue boxes for better visibility
- Better empty state with descriptive icons and text
- Optimized calendar view with consistent styling

#### ManageMedicinesView Enhancements

- Modern card design for medicine items
- Enhanced drag-and-drop visual feedback
- Improved empty state with helpful guidance
- Better section organization with clear headers
- Medicine counter in section titles

#### SettingsView Improvements

- Color-coded sections for different action types
- Enhanced buttons with icons and improved styling
- Better visual separation between sections
- Improved warning messages and descriptions

### 📱 Mobile Responsiveness

#### Responsive Design System

- Implemented consistent breakpoint strategy using `sm:` (640px)
- Mobile-first approach with progressive enhancement
- Responsive padding: `p-4 sm:p-6` pattern throughout
- Responsive spacing: `space-y-6 sm:space-y-8` for better mobile layout

#### Component-Specific Mobile Optimizations

- **RecordView**: Stacked date/time inputs, smaller medicine cards
- **HistoryView**: Vertical layout for medicine name/time, smaller details boxes
- **ManageMedicinesView**: Responsive drag handles and delete buttons
- **SettingsView**: Stacked action sections, full-width buttons

#### Typography & Sizing

- Responsive headings: `text-xl sm:text-2xl` pattern
- Smaller icons on mobile: `w-4 h-4 sm:w-5 sm:h-5`
- Appropriate input text sizing: `text-sm sm:text-base`
- Better button sizing: `py-4 sm:py-6` for touch accessibility

### 🔧 Technical Improvements

#### Data Structure Enhancements

- Extended `IntakeRecord` interface with optional `details` field
- Maintained full backward compatibility with existing data
- Enhanced storage service to handle new field gracefully
- Improved type safety throughout the application

#### Code Quality

- Consistent component structure and naming
- Improved prop interfaces and type definitions
- Better error handling and edge cases
- Enhanced accessibility with proper ARIA labels

### 🐛 Bug Fixes

- Fixed date header sizing issues on mobile devices
- Improved touch interactions on small screens
- Better handling of long medicine names in mobile layout
- Fixed spacing inconsistencies across components

### 🎯 Performance Optimizations

- Optimized component re-renders
- Improved responsive image and icon loading
- Better CSS transitions and animations
- Reduced layout shift on mobile devices

---

## [1.0.0] - 2025-06-12

### 🎉 Initial Release

#### Core Features

- **Medicine Management**: Add, delete, and reorder medications and supplements
- **Intake Recording**: Record when medications are taken with date/time selection
- **History Tracking**: View intake history in list or calendar format
- **Data Management**: Export, import, and clear data functionality

#### User Interface

- Clean, intuitive design with Tailwind CSS
- Responsive layout for desktop and mobile
- Tab-based navigation between views
- Modal dialogs for confirmations and data entry

#### Technical Foundation

- Built with React 19 and TypeScript
- Vite build system for fast development
- Local storage for data persistence
- Drag-and-drop functionality for medicine reordering

#### Components

- **RecordView**: Medicine selection and intake recording
- **HistoryView**: List and calendar views of intake records
- **ManageMedicinesView**: Medicine management with drag-and-drop
- **SettingsView**: Data import/export and app settings

---

## Future Roadmap

### Planned Features

- 📊 Intake statistics and analytics
- ☁️ Cloud sync and backup options
- 🔍 Advanced search and filtering

---

_For support or feature requests, please visit our [GitHub repository](https://github.com/kitckso/medilog)._
