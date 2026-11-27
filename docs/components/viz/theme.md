<!-- (c) 2025-2026 Asymmetric Effort, LLC. MIT LICENSE -->
<!-- SPDX-License-Identifier: MIT -->

# VizTheme

Visualization theming system that controls appearance tokens (typography,
line geometry, spacing, borders, axes, legend, animation) for all viz
components. Themes do **not** include colors.

## Import

```ts
import {
  VizThemeProvider,
  useVizTheme,
  createVizTheme,
  getVizTheme,
} from 'specifyjs/components/viz/theme';
import type { VizTheme, VizThemeProviderProps } from 'specifyjs/components/viz/theme';
```

---

## VizThemeProvider

Context provider that sets the visualization theme for all descendant
components. When no provider is present, `useVizTheme()` returns the
`casual` theme.

### Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `theme` | `'casual' \| 'crisp' \| VizTheme` | -- | Theme name or a custom `VizTheme` object. String names resolve to built-in themes. |
| `children` | `SpecNode` | -- | Child elements |

### Usage

```ts
import { createElement } from 'specifyjs';
import { VizThemeProvider } from 'specifyjs/components/viz/theme';

createElement(VizThemeProvider, { theme: 'crisp' }, children);
```

---

## useVizTheme

```ts
function useVizTheme(): VizTheme;
```

Hook that reads the current visualization theme from context. Returns the
`casual` theme when no `VizThemeProvider` is present in the tree.

### Usage

```ts
import { useVizTheme } from 'specifyjs/components/viz/theme';

function MyChart() {
  const theme = useVizTheme();
  // theme.fontFamily, theme.lineWidth.series, etc.
}
```

---

## createVizTheme

```ts
function createVizTheme(
  base: 'casual' | 'crisp',
  overrides: Partial<VizTheme>,
): VizTheme;
```

Creates a custom theme by deep-merging `overrides` onto a built-in base
theme. The returned theme is deeply frozen and safe to pass directly to
`VizThemeProvider`.

### Parameters

| Parameter | Type | Description |
|-----------|------|-------------|
| `base` | `'casual' \| 'crisp'` | The built-in theme to use as a starting point |
| `overrides` | `Partial<VizTheme>` | Partial theme tokens to override. Nested objects are deep-merged — only the keys you provide are changed. |

### Usage

```ts
import { createVizTheme } from 'specifyjs/components/viz/theme';

const myTheme = createVizTheme('crisp', {
  fontSize: { axis: '10px' },
  lineCap: 'round',
});
```

---

## getVizTheme

```ts
function getVizTheme(name: 'casual' | 'crisp'): VizTheme;
```

Returns a frozen built-in theme by name. Useful outside component trees
where `useVizTheme()` is not available (utility functions, build scripts,
tests).

### Parameters

| Parameter | Type | Description |
|-----------|------|-------------|
| `name` | `'casual' \| 'crisp'` | The built-in theme name |

### Usage

```ts
import { getVizTheme } from 'specifyjs/components/viz/theme';

const crisp = getVizTheme('crisp');
```

Throws an `Error` if `name` is not a recognized theme.

---

## VizTheme Type

```ts
interface VizTheme {
  fontFamily: string;
  fontFamilyMono: string;
  fontSize: {
    axis: string;
    label: string;
    title: string;
  };
  lineWidth: {
    grid: number;
    axis: number;
    series: number;
  };
  lineCap: 'round' | 'butt';
  spacing: {
    padding: { top: number; right: number; bottom: number; left: number };
  };
  border: {
    radius: string;
    width: string;
  };
  axis: {
    showGrid: boolean;
    showMinorGrid: boolean;
    tickLength: number;
    tickWidth: number;
  };
  legend: {
    swatchSize: number;
    spacing: string;
  };
  animation: {
    duration: number;
  };
}
```

| Field | Type | Description |
|-------|------|-------------|
| `fontFamily` | `string` | Primary font family for labels, titles, legends |
| `fontFamilyMono` | `string` | Monospace font family for numeric values |
| `fontSize.axis` | `string` | Axis tick label font size |
| `fontSize.label` | `string` | Data label and legend text font size |
| `fontSize.title` | `string` | Chart title font size |
| `lineWidth.grid` | `number` | Grid line stroke width |
| `lineWidth.axis` | `number` | Axis line stroke width |
| `lineWidth.series` | `number` | Data series line stroke width |
| `lineCap` | `'round' \| 'butt'` | SVG stroke-linecap value |
| `spacing.padding` | `{ top, right, bottom, left }` | Chart area padding in pixels |
| `border.radius` | `string` | Container border-radius |
| `border.width` | `string` | Container border width |
| `axis.showGrid` | `boolean` | Whether to show major grid lines |
| `axis.showMinorGrid` | `boolean` | Whether to show minor grid lines |
| `axis.tickLength` | `number` | Tick mark length in pixels (0 = none) |
| `axis.tickWidth` | `number` | Tick mark stroke width in pixels |
| `legend.swatchSize` | `number` | Legend color swatch size in pixels |
| `legend.spacing` | `string` | Spacing between legend items |
| `animation.duration` | `number` | Transition duration in ms (0 = none) |

See the [Viz Themes Guide](../../guides/viz-themes.md) for the full token
reference table comparing casual and crisp values, theme switching
examples, and custom theme creation patterns.
