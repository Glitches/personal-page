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
- Chrome DevTools suppression logic for specific routes
- Footer with copyright information

## Chrome DevTools Suppression
**Location**: `src/routes/.well-known/appspecific/com.chrome.devtools.json/+server.ts`
**Purpose**: Suppresses Chrome DevTools specific errors for certain routes
**Functionality**: Returns empty JSON response for DevTools requests to prevent console errors

## Utility Functions
**Location**: `src/lib/utils.ts`
**Purpose**: Shared utility functions
**Current exports**:
- `cn()` - Combines clsx and tailwind-merge for conditional class names
- `flyAndScale()` - Svelte transition function for smooth animations with scaling and translation effects
