# GanttChart

Timeline bar chart rendered as SVG. Tasks are positioned horizontally by start time and duration with optional grouping, grid lines, and progress display.

## Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| tasks | `GanttTask[]` | `[]` | Array of tasks |
| width | `number` | `800` | SVG width |
| height | `number` | auto-computed | SVG height (auto-fits to task count if omitted) |
| barHeight | `number` | `24` | Height of each task bar |
| barGap | `number` | `8` | Vertical gap between bars |
| showGrid | `boolean` | `true` | Show vertical grid lines |
| showLabels | `boolean` | `true` | Show task labels on the left |
| showProgress | `boolean` | `false` | Show time range text on bars |
| timeUnit | `string` | `'days'` | Time unit label for the axis |
| title | `string` | `undefined` | Chart title |
| padding | `number` | `50` | Padding around chart area |

### GanttTask

| Field | Type | Description |
|-------|------|-------------|
| id | `string` | Unique task identifier |
| label | `string` | Task label |
| start | `number` | Start time |
| duration | `number` | Task duration |
| color | `string` | Optional bar color |
| group | `string` | Optional group name (for visual grouping) |

## Usage

```ts
import { createElement } from 'specifyjs';
import { GanttChart } from 'specifyjs/components/viz/gantt-chart';

createElement(GanttChart, {
  tasks: [
    { id: '1', label: 'Design', start: 0, duration: 5, group: 'Phase 1' },
    { id: '2', label: 'Develop', start: 3, duration: 10, group: 'Phase 1' },
    { id: '3', label: 'Test', start: 10, duration: 5, group: 'Phase 2' },
  ],
  title: 'Project Timeline',
});
```

## Notes

- Renders as SVG. Tasks are sorted by group then start time.
- Height auto-computes based on task count if not specified.
- Long labels are truncated with ellipsis.
