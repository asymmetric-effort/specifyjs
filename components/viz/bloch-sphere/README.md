# BlochSphere

**Category:** Visualization  
**Path:** `components/viz/bloch-sphere`

## Overview

A configurable 3D Bloch sphere visualization component.
Renders a unit sphere with:
 - Wireframe great circles (equator, meridians)
 - Axis labels (|0⟩, |1⟩, |+⟩, |-⟩, |+i⟩, |-i⟩)
 - Qubit state vector as a point on the sphere surface
 - Optional state trajectory trail
 - Interactive rotation (drag) and zoom (scroll)
 - Configurable gate application
The qubit state is represented as (θ, φ) on the Bloch sphere:
  |ψ⟩ = cos(θ/2)|0⟩ + e^(iφ)sin(θ/2)|1⟩
Cartesian coordinates on the sphere:
  x = sin(θ)cos(φ)
  y = sin(θ)sin(φ)
  z = cos(θ)
Zero runtime dependencies — pure SpecifyJS + SVG.

## Props

| Prop | Type | Description |
| --- | --- | --- |
| `state` | `BlochState` | Current qubit state (default: |0⟩ = {theta: 0, phi: 0}) |
| `gates` | `GateOp[]` | Sequence of gates to animate (applied one per frame) |
| `width` | `number` | SVG viewBox width (default: 400) |
| `height` | `number` | SVG viewBox height (default: 400) |
| `rotateY` | `number` | Initial rotation around Y axis in degrees (default: -25) |
| `rotateX` | `number` | Initial rotation around X axis in degrees (default: 15) |
| `zoom` | `number` | Zoom level (default: 1.0, range 0.5–3.0) |
| `interactive` | `boolean` | Allow interactive rotation via drag (default: true) |
| `zoomable` | `boolean` | Allow zoom via scroll (default: true) |
| `showVector` | `boolean` | Show state vector arrow (default: true) |
| `showLabels` | `boolean` | Show axis labels (default: true) |
| `showWireframe` | `boolean` | Show wireframe circles (default: true) |
| `showTrail` | `boolean` | Show trajectory trail (default: true) |
| `trailMaxPoints` | `number` | Max trail points (default: 200) |
| `trailColor` | `string` | Trail color (default: '#ef4444') |
| `wireframeColor` | `string` | Sphere wireframe color (default: '#cbd5e1') |
| `vectorColor` | `string` | State vector color (default: '#3b82f6') |
| `backgroundColor` | `string` | Background color (default: transparent) |
| `sphereRadius` | `number` | Sphere radius in viewBox units (default: 130) |
| `title` | `string` | Title text |
| `onStateChange` | `(state: BlochState) => void` | Called when state changes (from gates or interaction) |

## Documentation

See the [SpecifyJS README](https://github.com/asymmetric-effort/specifyjs#readme) for full project documentation.
