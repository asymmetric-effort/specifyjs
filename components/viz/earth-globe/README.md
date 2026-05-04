# EarthGlobe

A SpecifyJS component that renders an interactive 3D-looking Earth globe using SVG with orthographic projection.

## Features

- Orthographic (spherical) projection for a realistic 3D globe appearance
- Simplified country/continent outlines covering all continents and major nations
- Latitude/longitude graticule grid (configurable step, color, visibility)
- Mouse-drag rotation (toggleable via `interactive` prop)
- Per-country click and hover callbacks
- Country highlight coloring via `highlightCountries` map
- ARIA-compliant (`role="img"`, `aria-label`)
- Zero runtime dependencies -- all projection math and map data are built in

## Usage

```typescript
import { createElement } from "specifyjs";
import { EarthGlobe } from "./components/viz/earth-globe/src";

const globe = createElement(EarthGlobe, {
  width: 500,
  height: 500,
  rotation: { longitude: -95, latitude: 38 },
  fillColor: "#22c55e",
  oceanColor: "#3b82f6",
  showGraticule: true,
  interactive: true,
  onCountryClick: (id) => console.log("Clicked:", id),
  highlightCountries: { USA: "#ff6600", CHN: "#cc0000" },
});
```

## Props

| Prop                 | Type                                      | Default                            | Description                              |
| -------------------- | ----------------------------------------- | ---------------------------------- | ---------------------------------------- |
| `width`              | `number`                                  | `400`                              | SVG width in pixels                      |
| `height`             | `number`                                  | `400`                              | SVG height in pixels                     |
| `rotation`           | `{ longitude: number; latitude: number }` | `{ longitude: -95, latitude: 38 }` | Initial center of the visible hemisphere |
| `fillColor`          | `string`                                  | `'#22c55e'`                        | Land/country fill color                  |
| `oceanColor`         | `string`                                  | `'#3b82f6'`                        | Ocean background circle color            |
| `strokeColor`        | `string`                                  | `'#ffffff'`                        | Country border stroke color              |
| `strokeWidth`        | `number`                                  | `0.5`                              | Country border stroke width              |
| `showGraticule`      | `boolean`                                 | `true`                             | Show lat/lon grid lines                  |
| `graticuleColor`     | `string`                                  | `'rgba(255,255,255,0.2)'`          | Graticule line color                     |
| `interactive`        | `boolean`                                 | `true`                             | Allow drag-to-rotate                     |
| `onCountryClick`     | `(countryId: string) => void`             | --                                 | Callback on country click                |
| `onCountryHover`     | `(countryId: string \| null) => void`     | --                                 | Callback on country hover/leave          |
| `hoverColor`         | `string`                                  | `'#16a34a'`                        | Country hover fill color                 |
| `title`              | `string`                                  | `'Earth Globe'`                    | Accessible title (aria-label)            |
| `highlightCountries` | `Record<string, string>`                  | `{}`                               | Map of country ID to highlight color     |

## Country IDs

The following country IDs are available for use with `onCountryClick`, `onCountryHover`, and `highlightCountries`:

`USA`, `CAN`, `MEX`, `BRA`, `ARG`, `COL`, `GBR`, `FRA`, `DEU`, `ITA`, `ESP`, `NOR`, `SWE`, `RUS`, `EGY`, `NGA`, `ZAF`, `COD`, `DZA`, `AFR_WEST`, `AFR_EAST`, `CHN`, `IND`, `JPN`, `KOR`, `TUR`, `SAU`, `IRN`, `IDN`, `AUS`, `NZL`, `GRL`, `ATA`

## Orthographic Projection

The component uses an orthographic projection to create a 3D globe appearance. Points on the far side of the globe (determined by a dot-product visibility check) are hidden. Country polygons are clipped to the visible hemisphere using an SVG `<clipPath>`.

## Architecture

```
earth-globe/
  src/
    EarthGlobe.ts    -- Main component and projection math
    globe-data.ts    -- Simplified country polygon data
    index.ts         -- Public exports
  tests/
    earth-globe.test.ts
  README.md
```

## Testing

```bash
npx vitest run components/viz/earth-globe/tests/earth-globe.test.ts
```
