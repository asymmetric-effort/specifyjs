# Stepper

**Category:** Navigation  
**Path:** `components/nav/stepper`

## Overview

Step wizard indicator component.
Renders a sequence of step circles/dots connected by lines, showing
completed, active, and pending states. Supports horizontal and vertical
orientations, clickable steps, and circle/dot variants.

## Props

| Prop | Type | Description |
| --- | --- | --- |
| `steps` | `StepItem[]` (required) | Array of step definitions |
| `currentStep` | `number` (required) | Current active step (0-based index) |
| `orientation` | `StepperOrientation` | Orientation (default: 'horizontal') |
| `onChange` | `(step: number) => void` | Called when a step is clicked — receives the step index |
| `clickable` | `boolean` | Whether steps are clickable (default: false) |
| `variant` | `StepperVariant` | Visual variant (default: 'circle') |

## Documentation

See the [SpecifyJS README](https://github.com/asymmetric-effort/specifyjs#readme) for full project documentation.
