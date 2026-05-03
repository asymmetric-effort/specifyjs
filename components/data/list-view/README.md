# ListView

**Category:** Data Display  
**Path:** `components/data/list-view`

## Overview

Styled list with configurable item rendering, dividers,
selection, hover effects, and optional header/footer.

## Props

| Prop | Type | Description |
| --- | --- | --- |
| `items` | `unknown[]` (required) | Array of items to render |
| `renderItem` | `(item: unknown, index: number) => unknown` (required) | Render function for each item |
| `keyExtractor` | `(item: unknown, index: number) => string` (required) | Unique key extractor per item |
| `divider` | `boolean` | Show divider between items |
| `hoverable` | `boolean` | Highlight items on hover |
| `selectedIndex` | `number` | Currently selected item index |
| `onSelect` | `(index: number) => void` | Selection handler |
| `emptyMessage` | `string` | Message shown when items is empty |
| `header` | `unknown` | Optional header element |
| `footer` | `unknown` | Optional footer element |

## Documentation

See the [SpecifyJS README](https://github.com/asymmetric-effort/specifyjs#readme) for full project documentation.
