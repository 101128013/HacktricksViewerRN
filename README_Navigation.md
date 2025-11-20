# Table of Contents Navigation Component

## Overview

The Table of Contents (TOC) navigation component provides hierarchical document navigation for the Hacktricks React Native application. It supports expandable sections, real-time search filtering, current page highlighting, and keyboard shortcuts.

## Features Implemented

### ✅ Hierarchical Table of Contents Display
- Displays documentation structure from JSON data
- Supports nested sections and subsections
- Visual indentation for different levels

### ✅ Expand/Collapse Functionality
- Click sections to expand/collapse subsections
- Expand icon (▶/▼) indicates collapsible state
- State persists during navigation

### ✅ Search Filtering
- Real-time search as you type
- Filters both section titles and subsection titles
- Highlights matching text in results
- Case-insensitive search

### ✅ Current Page Highlighting
- Active document highlighted with different background color
- Active text styled with accent color
- Visual feedback for current navigation state

### ✅ Keyboard Shortcuts
- Foundation for Ctrl+F shortcut (platform-specific implementation needed)
- Keyboard event listeners prepared

### ✅ Navigation Integration
- Context-based state management
- Dispatches navigation actions
- Integrates with app's navigation system

### ✅ Visual Feedback
- Active document styling
- Search match highlighting
- Expand/collapse icons
- Dark theme optimized

## Component Structure

```
src/components/TableOfContents.tsx
├── TableOfContents (Main Component)
├── TocSectionComponent (Section with subsections)
├── TocItemComponent (Individual items)
└── NavigationContext (State management)

src/contexts/NavigationContext.tsx
└── NavigationProvider + reducer logic

src/components/TableOfContents.test.tsx
└── Component tests

src/contexts/NavigationContext.test.tsx
└── Context tests
```

## Usage

```tsx
import TableOfContents from './components/TableOfContents';
import { NavigationProvider } from './contexts/NavigationContext';

// Wrap your app with NavigationProvider
<NavigationProvider>
  <TableOfContents data={tocData} />
</NavigationProvider>
```

## Data Structure

The component expects TOC data in this format:

```typescript
interface TocItem {
  id: string;
  title: string;
  path: string;
  level: number;
  subsections?: TocItem[];
}
```

## State Management

Uses React Context with useReducer for:
- Current navigation path
- Expanded sections set
- Search query and results
- Navigation actions

## Styling

Dark theme optimized with:
- Hierarchical indentation
- Active state highlighting
- Search match highlighting
- Expand/collapse icons

## Testing

Comprehensive test coverage for:
- Component rendering
- Search functionality
- Expand/collapse behavior
- Navigation actions
- Context state management

## Future Enhancements

- Platform-specific keyboard shortcut implementation
- Deep subsection expansion
- Search result scoring/ranking
- Keyboard navigation (arrow keys)
- Bookmark/favorites functionality