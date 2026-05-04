# US State Map Components

Individual SVG map components for all 50 US states, the District of Columbia, and 5 US territories.

## Components

Each component renders the SVG outline of a single US state or territory. All components share the same `StateMapProps` interface.

### States (50)

AL, AK, AZ, AR, CA, CO, CT, DE, FL, GA, HI, ID, IL, IN, IA, KS, KY, LA, ME, MD, MA, MI, MN, MS, MO, MT, NE, NV, NH, NJ, NM, NY, NC, ND, OH, OK, OR, PA, RI, SC, SD, TN, TX, UT, VT, VA, WA, WV, WI, WY

### District of Columbia

DC

### Territories (5)

PR (Puerto Rico), GU (Guam), VI (U.S. Virgin Islands), AS (American Samoa), MP (Northern Mariana Islands)

**Note:** Territory outlines use simplified path data since detailed SVG paths were not available in the source map. The 50 states and DC use accurate path data extracted from a public domain (CC0) US map SVG.

## Usage

```typescript
import { CA, TX, NY } from './states';
import type { StateMapProps } from './states';

// Render California with defaults
const california = CA({});

// Render Texas with custom colors and size
const texas = TX({
  width: 300,
  fillColor: '#dc2626',
  strokeColor: '#000000',
  strokeWidth: 2,
  onClick: (e) => console.log('Clicked Texas'),
  title: 'Texas - The Lone Star State',
  className: 'state-map',
});
```

## Props (StateMapProps)

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `width` | `number` | auto | SVG width in pixels |
| `height` | `number` | auto | SVG height in pixels |
| `fillColor` | `string` | `'#3b82f6'` | Fill color for the state shape |
| `strokeColor` | `string` | `'#ffffff'` | Stroke/outline color |
| `strokeWidth` | `number` | `1` | Stroke width |
| `onClick` | `(e: Event) => void` | - | Click handler |
| `onMouseEnter` | `(e: Event) => void` | - | Mouse enter handler |
| `onMouseLeave` | `(e: Event) => void` | - | Mouse leave handler |
| `title` | `string` | Full state name | Accessible title text |
| `className` | `string` | - | CSS class name |

When only `width` or `height` is provided, the other dimension is computed to preserve the state's natural aspect ratio. When neither is provided, a default size of 200px on the longest axis is used.

## Factory Function

Use `createStateMapComponent` to create custom state components with your own path data:

```typescript
import { createStateMapComponent } from './states/factory';

const CustomRegion = createStateMapComponent({
  name: 'Custom Region',
  pathData: 'M 0,0 L 100,0 L 100,100 L 0,100 Z',
  viewBox: { minX: -5, minY: -5, width: 110, height: 110 },
});
```

## Accessibility

All components are ARIA-compliant:
- `role="img"` on the SVG element
- `aria-label` set to the state name (overridable via `title` prop)
- `<title>` element inside the SVG for screen readers

## Source Data

State outlines extracted from a public domain (CC0) SVG map of the United States.
