# Changelog

All notable changes to MediLog will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

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

*For support or feature requests, please visit our [GitHub repository](https://github.com/kitckso/medilog).*