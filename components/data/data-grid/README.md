# DataGrid

**Category:** Data Display  
**Path:** `components/data/data-grid`

## Overview

Full-featured data table/grid with sorting, pagination,
selection, filtering, and sticky header support.

## Props

| Prop | Type | Description |
| --- | --- | --- |
| `columns` | `DataGridColumn[]` (required) | Column definitions |
| `data` | `Record<string, unknown>[]` (required) | Row data |
| `pageSize` | `number` | Rows per page (enables pagination when set) |
| `currentPage` | `number` | Current page index (0-based) |
| `onPageChange` | `(page: number) => void` | Page change handler |
| `sortBy` | `string` | Current sort column key |
| `sortDir` | `'asc' | 'desc'` | Sort direction |
| `onSort` | `(columnKey: string, direction: 'asc' | 'desc') => void` | Sort change handler |
| `selectable` | `boolean` | Enable row selection checkboxes |
| `selectedRows` | `number[]` | Currently selected row indices |
| `onSelectionChange` | `(selectedIndices: number[]) => void` | Selection change handler |
| `striped` | `boolean` | Alternate row background colors |
| `bordered` | `boolean` | Show cell borders |
| `compact` | `boolean` | Compact row height |
| `stickyHeader` | `boolean` | Sticky header on scroll |

## Documentation

See the [SpecifyJS README](https://github.com/asymmetric-effort/specifyjs#readme) for full project documentation.
