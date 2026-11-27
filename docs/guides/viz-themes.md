<!-- (c) 2025-2026 Asymmetric Effort, LLC. MIT LICENSE -->
<!-- SPDX-License-Identifier: MIT -->

# Visualization Themes

SpecifyJS provides a theming system for visualization components that
controls **appearance only** — typography, line geometry, spacing, borders,
axis configuration, legend sizing, and animation timing. Themes do **not**
include color tokens; colors remain the consumer's concern via component
props and CSS variables.

```typescript
import {
  VizThemeProvider,
  useVizTheme,
  createVizTheme,
  getVizTheme,
} from 'specifyjs/components/viz/theme';
```

---

## Built-in Themes

SpecifyJS ships with two built-in themes:

| Theme | Style | Description |
|-------|-------|-------------|
| `casual` | Friendly, rounded | The default. Rounded line caps, generous padding, rounded borders, larger fonts, no tick marks, standard 300ms animation. |
| `crisp` | Scientific, precise | Designed for data density. Thinner lines, butt line caps, tighter padding, no border radius, tick marks on axes, minor gridlines, smaller monospace-friendly fonts, no animation. |

When no `VizThemeProvider` is present, all visualization components
default to the **casual** theme for backward compatibility.

---

## Usage

### Wrapping Your App

Wrap your application (or a subtree) in a `VizThemeProvider` to set the
theme for all descendant visualization components:

```typescript
import { createElement } from 'specifyjs';
import { VizThemeProvider } from 'specifyjs/components/viz/theme';

function App() {
  return createElement(
    VizThemeProvider,
    { theme: 'crisp' },
    createElement(MyDashboard, null),
  );
}
```

### Reading the Theme in Custom Components

Use the `useVizTheme()` hook inside any component to access the current
theme tokens:

```typescript
import { createElement } from 'specifyjs';
import { useVizTheme } from 'specifyjs/components/viz/theme';

function CustomChart() {
  const theme = useVizTheme();

  return createElement('svg', {
    style: {
      fontFamily: theme.fontFamily,
      borderRadius: theme.border.radius,
    },
  });
}
```

### Switching Themes

Use `useState` to toggle between themes at runtime:

```typescript
import { createElement } from 'specifyjs';
import { useState } from 'specifyjs/hooks';
import { VizThemeProvider } from 'specifyjs/components/viz/theme';
import { Button } from 'specifyjs/components/form/button';

function Dashboard() {
  const [theme, setTheme] = useState<'casual' | 'crisp'>('casual');

  return createElement(
    VizThemeProvider,
    { theme },
    createElement(Button, {
      label: theme === 'casual' ? 'Switch to Crisp' : 'Switch to Casual',
      onClick: () =>
        setTheme((prev: 'casual' | 'crisp') =>
          prev === 'casual' ? 'crisp' : 'casual',
        ),
    }),
    createElement(MyCharts, null),
  );
}
```

---

## Custom Themes

### createVizTheme

Create a custom theme by deep-merging overrides onto a built-in base.
Only the tokens you specify are overridden; everything else is preserved
from the base theme.

```typescript
import { createVizTheme } from 'specifyjs/components/viz/theme';

const myTheme = createVizTheme('crisp', {
  fontSize: { axis: '10px' },   // only axis changes; label and title preserved
  lineCap: 'round',
  animation: { duration: 150 }, // add subtle animation to the crisp base
});
```

Pass the resulting object to `VizThemeProvider`:

```typescript
createElement(VizThemeProvider, { theme: myTheme }, children);
```

### getVizTheme

For non-context usage (e.g., utility functions, build scripts, or tests),
retrieve a frozen built-in theme by name:

```typescript
import { getVizTheme } from 'specifyjs/components/viz/theme';

const crisp = getVizTheme('crisp');
console.log(crisp.lineCap); // 'butt'
```

---

## Token Reference

All appearance tokens with their values in each built-in theme:

| Token | Casual | Crisp |
|-------|--------|-------|
| `fontFamily` | `'sans-serif'` | `'"Inter", "Helvetica Neue", Arial, sans-serif'` |
| `fontFamilyMono` | `'monospace'` | `'"JetBrains Mono", "Fira Code", "Consolas", monospace'` |
| `fontSize.axis` | `'12px'` | `'11px'` |
| `fontSize.label` | `'13px'` | `'11px'` |
| `fontSize.title` | `'16px'` | `'13px'` |
| `lineWidth.grid` | `1` | `0.5` |
| `lineWidth.axis` | `1` | `1` |
| `lineWidth.series` | `2` | `1.5` |
| `lineCap` | `'round'` | `'butt'` |
| `spacing.padding.top` | `20` | `12` |
| `spacing.padding.right` | `20` | `12` |
| `spacing.padding.bottom` | `40` | `32` |
| `spacing.padding.left` | `50` | `44` |
| `border.radius` | `'8px'` | `'0'` |
| `border.width` | `'1px'` | `'0'` |
| `axis.showGrid` | `true` | `true` |
| `axis.showMinorGrid` | `false` | `true` |
| `axis.tickLength` | `0` | `4` |
| `axis.tickWidth` | `0` | `1` |
| `legend.swatchSize` | `12` | `8` |
| `legend.spacing` | `'8px'` | `'6px'` |
| `animation.duration` | `300` | `0` |
