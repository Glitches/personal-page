# Component Documentation

## Menu.svelte
**Location**: `src/lib/Menu.svelte`
**Purpose**: Navigation component for the site
**Usage**: Imported in `+layout.svelte`

## Global Styles
**Location**: `src/app.css`
**Purpose**: Tailwind CSS imports and global styles
**Contains**: 
- Tailwind directives (@tailwind base, components, utilities)
- Custom CSS variables if any

## Layout Component
**Location**: `src/routes/+layout.svelte`
**Purpose**: Main layout wrapper for all pages
**Features**:
- Includes Menu component
- Applies global styles

## Utility Functions
**Location**: `src/lib/utils.ts`
**Purpose**: Shared utility functions
**Current exports**: Check file for available functions
