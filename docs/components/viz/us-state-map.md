# USStateMap

Interactive SVG map of the United States with per-state coloring, hover effects, and click handlers. Uses built-in public domain SVG path data.

## Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| width | `number` | `959` | SVG viewBox width |
| height | `number` | `593` | SVG viewBox height |
| stateColors | `Record<string, string>` | `{}` | Map of state abbreviation to fill color |
| defaultColor | `string` | `'#D0D0D0'` | Default fill color for uncolored states |
| strokeColor | `string` | `'#FFFFFF'` | Border color between states |
| strokeWidth | `number` | `1` | Border width |
| onStateClick | `(stateId: string) => void` | `undefined` | Click handler (receives state abbreviation) |
| onStateHover | `(stateId: string \| null) => void` | `undefined` | Hover handler (null on mouse leave) |
| hoverColor | `string` | `'#FFD700'` | Highlight color on hover |
| title | `string` | `'Map of the United States'` | Accessible SVG title |

## Usage

```ts
import { createElement } from 'specifyjs';
import { USStateMap } from 'specifyjs/components/viz/us-state-map';

createElement(USStateMap, {
  stateColors: {
    CA: '#3b82f6',
    TX: '#ef4444',
    NY: '#22c55e',
  },
  onStateClick: (id) => console.log(`Clicked: ${id}`),
  onStateHover: (id) => console.log(`Hovered: ${id}`),
});
```

## Notes

- Renders as SVG with built-in state path data (public domain CC0).
- States with `onStateClick` receive `role="button"`, `tabindex`, and keyboard support (Enter/Space).
- Hover effects are applied via direct DOM attribute manipulation for performance.
