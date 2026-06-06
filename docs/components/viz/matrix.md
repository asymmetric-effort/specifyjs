# Matrix

Correlation/confusion matrix visualization rendered as SVG. Displays a colored grid with intensity proportional to value, optional diagonal highlighting, and symmetric mirroring for correlation matrices.

## Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| data | `number[][]` | `[]` | 2D grid of values (data[row][col]) |
| labels | `string[]` | `undefined` | Shared row/column labels for square matrices |
| rowLabels | `string[]` | `undefined` | Explicit row labels (overrides `labels`) |
| columnLabels | `string[]` | `undefined` | Explicit column labels (overrides `labels`) |
| width | `number` | `500` | SVG viewBox width |
| height | `number` | `500` | SVG viewBox height |
| colorScale | `string[]` | `['#f0f9ff', '#3b82f6', '#1e3a8a']` | Color gradient (low to high) |
| showValues | `boolean` | `true` | Show numeric value in each cell |
| showDiagonal | `boolean` | `true` | Highlight diagonal cells with bold border |
| cellBorderColor | `string` | `'#e5e7eb'` | Cell border color |
| title | `string` | `undefined` | Chart title |
| padding | `number` | `70` | Padding around chart |
| symmetric | `boolean` | `false` | Mirror values across diagonal |

## Usage

```ts
import { createElement } from 'specifyjs';
import { Matrix } from 'specifyjs/components/viz/matrix';

createElement(Matrix, {
  data: [[1.0, 0.8, 0.3], [0.8, 1.0, 0.5], [0.3, 0.5, 1.0]],
  labels: ['A', 'B', 'C'],
  symmetric: true,
  title: 'Correlation Matrix',
});
```

## Notes

- Renders as SVG. Text color automatically adjusts for contrast based on cell background luminance.
- When `symmetric` is true, zero values are filled from the mirror position across the diagonal.
- Diagonal cells get a bold border when `showDiagonal` is enabled.
