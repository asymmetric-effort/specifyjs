# EarthGlobe

Interactive 3D-looking Earth globe rendered as SVG with orthographic projection. Displays country outlines with per-country coloring, hover effects, click handlers, and drag-to-rotate interaction.

## Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| width | `number` | `400` | SVG viewBox width |
| height | `number` | `400` | SVG viewBox height |
| rotation | `{ longitude: number; latitude: number }` | `{ longitude: -95, latitude: 38 }` | Initial center point |
| fillColor | `string` | `'#22c55e'` | Land fill color |
| oceanColor | `string` | `'#3b82f6'` | Ocean/background color |
| strokeColor | `string` | `'#ffffff'` | Country border color |
| strokeWidth | `number` | `0.5` | Country border width |
| showGraticule | `boolean` | `true` | Show latitude/longitude grid |
| graticuleColor | `string` | `'rgba(255,255,255,0.2)'` | Grid line color |
| interactive | `boolean` | `true` | Allow drag-to-rotate |
| onCountryClick | `(countryId: string) => void` | `undefined` | Country click callback |
| onCountryHover | `(countryId: string \| null) => void` | `undefined` | Country hover callback |
| hoverColor | `string` | `'#16a34a'` | Country hover highlight color |
| title | `string` | `'Earth Globe'` | Accessible title |
| highlightCountries | `Record<string, string>` | `{}` | Map of country ID to highlight color |

## Usage

```ts
import { createElement } from 'specifyjs';
import { EarthGlobe } from 'specifyjs/components/viz/earth-globe';

createElement(EarthGlobe, {
  highlightCountries: { US: '#ef4444', GB: '#3b82f6' },
  onCountryClick: (id) => console.log(`Clicked: ${id}`),
  rotation: { longitude: 0, latitude: 30 },
});
```

## Notes

- Renders as SVG with built-in country path data (public domain).
- Orthographic projection correctly handles visibility (near side only).
- Graticule lines are drawn at 30-degree intervals.
- Countries have ARIA labels and keyboard support when `onCountryClick` is provided.
