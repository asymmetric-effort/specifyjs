# Accordion

**Category:** Navigation  
**Path:** `components/nav/accordion`

## Overview

Expandable/collapsible section navigation component.
Builds on NavWrapper to provide accessible accordion behavior with
configurable single or multiple expansion, animation, keyboard
navigation, and custom styling.

## Props

| Prop | Type | Description |
| --- | --- | --- |
| `sections` | `AccordionSection[]` (required) | Array of sections to render |
| `defaultExpanded` | `string[]` | IDs of sections that should be expanded on initial render |
| `allowMultiple` | `boolean` | Allow multiple sections to be open at the same time (default: false) |
| `headerStyle` | `AccordionHeaderStyle` | Styling for section headers |
| `contentStyle` | `AccordionContentStyle` | Styling for section content panels |
| `wrapperStyle` | `NavWrapperStyle` | Styling passed through to the NavWrapper container |
| `expandIcon` | `string` | Icon shown on collapsed sections (default: '+') |
| `collapseIcon` | `string` | Icon shown on expanded sections (default: '\u2212') |
| `iconPosition` | `'left' | 'right'` | Position of the expand/collapse icon (default: 'right') |
| `animated` | `boolean` | Enable smooth open/close animation via max-height transition (default: true) |
| `onChange` | `(expandedIds: string[]) => void` | Callback fired with the array of currently expanded section IDs |

## Documentation

See the [SpecifyJS README](https://github.com/asymmetric-effort/specifyjs#readme) for full project documentation.
