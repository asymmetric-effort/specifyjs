# Pagination

**Category:** Navigation  
**Path:** `components/nav/pagination`

## Overview

Page navigation component.
Renders First, Previous, page number buttons with ellipsis gaps,
Next, and Last controls for navigating paginated data.

## Props

| Prop | Type | Description |
| --- | --- | --- |
| `total` | `number` (required) | Total number of items |
| `pageSize` | `number` (required) | Items per page |
| `currentPage` | `number` (required) | Current active page (1-based) |
| `onChange` | `(page: number) => void` (required) | Called when page changes |
| `siblingCount` | `number` | Number of sibling pages shown around the current page (default: 1) |
| `showFirstLast` | `boolean` | Show First/Last buttons (default: true) |
| `showPrevNext` | `boolean` | Show Prev/Next buttons (default: true) |
| `disabled` | `boolean` | Disable all controls |

## Documentation

See the [SpecifyJS README](https://github.com/asymmetric-effort/specifyjs#readme) for full project documentation.
