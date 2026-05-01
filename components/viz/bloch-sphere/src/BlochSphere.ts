// (c) 2025-2026 Asymmetric Effort, LLC. MIT LICENSE
// SPDX-License-Identifier: MIT

/**
 * BlochSphere — A configurable 3D Bloch sphere visualization component.
 *
 * Renders a unit sphere with:
 *  - Wireframe great circles (equator, meridians)
 *  - Axis labels (|0⟩, |1⟩, |+⟩, |-⟩, |+i⟩, |-i⟩)
 *  - Qubit state vector as a point on the sphere surface
 *  - Optional state trajectory trail
 *  - Interactive rotation (drag) and zoom (scroll)
 *  - Configurable gate application
 *
 * The qubit state is represented as (θ, φ) on the Bloch sphere:
 *   |ψ⟩ = cos(θ/2)|0⟩ + e^(iφ)sin(θ/2)|1⟩
 *
 * Cartesian coordinates on the sphere:
 *   x = sin(θ)cos(φ)
 *   y = sin(θ)sin(φ)
 *   z = cos(θ)
 *
 * Zero runtime dependencies — pure SpecifyJS + SVG.
 */

import { createElement } from '../../../../core/src/index';
import {
  useState,
  useEffect,
  useMemo,
  useCallback,
  useRef,
} from '../../../../core/src/hooks/index';

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

/** Qubit state in Bloch sphere coordinates */
export interface BlochState {
  /** Polar angle from |0⟩ (north pole) in radians [0, π] */
  theta: number;
  /** Azimuthal angle in the XY plane in radians [0, 2π) */
  phi: number;
}

/** A point on the sphere trail */
export interface TrailPoint {
  x: number;
  y: number;
  z: number;
}

/** Standard quantum gate names */
export type GateName = 'X' | 'Y' | 'Z' | 'H' | 'S' | 'T' | 'Rx' | 'Ry' | 'Rz';

/** Gate to apply with optional rotation angle */
export interface GateOp {
  gate: GateName;
  /** Rotation angle in radians (for Rx, Ry, Rz gates) */
  angle?: number;
}

export interface BlochSphereProps {
  /** Current qubit state (default: |0⟩ = {theta: 0, phi: 0}) */
  state?: BlochState;
  /** Sequence of gates to animate (applied one per frame) */
  gates?: GateOp[];
  /** SVG viewBox width (default: 400) */
  width?: number;
  /** SVG viewBox height (default: 400) */
  height?: number;
  /** Initial rotation around Y axis in degrees (default: -25) */
  rotateY?: number;
  /** Initial rotation around X axis in degrees (default: 15) */
  rotateX?: number;
  /** Zoom level (default: 1.0, range 0.5–3.0) */
  zoom?: number;
  /** Allow interactive rotation via drag (default: true) */
  interactive?: boolean;
  /** Allow zoom via scroll (default: true) */
  zoomable?: boolean;
  /** Show state vector arrow (default: true) */
  showVector?: boolean;
  /** Show axis labels (default: true) */
  showLabels?: boolean;
  /** Show wireframe circles (default: true) */
  showWireframe?: boolean;
  /** Show trajectory trail (default: true) */
  showTrail?: boolean;
  /** Max trail points (default: 200) */
  trailMaxPoints?: number;
  /** Trail color (default: '#ef4444') */
  trailColor?: string;
  /** Sphere wireframe color (default: '#cbd5e1') */
  wireframeColor?: string;
  /** State vector color (default: '#3b82f6') */
  vectorColor?: string;
  /** Background color (default: transparent) */
  backgroundColor?: string;
  /** Sphere radius in viewBox units (default: 130) */
  sphereRadius?: number;
  /** Title text */
  title?: string;
  /** Called when state changes (from gates or interaction) */
  onStateChange?: (state: BlochState) => void;
}

// ---------------------------------------------------------------------------
// 3D projection
// ---------------------------------------------------------------------------

const DEG = Math.PI / 180;

function project(
  x: number, y: number, z: number,
  rotX: number, rotY: number,
  cx: number, cy: number,
  scale: number,
): { sx: number; sy: number; depth: number } {
  const cosX = Math.cos(rotX * DEG), sinX = Math.sin(rotX * DEG);
  const cosY = Math.cos(rotY * DEG), sinY = Math.sin(rotY * DEG);

  // Rotate around Y
  const x1 = x * cosY + z * sinY;
  const z1 = -x * sinY + z * cosY;
  // Rotate around X
  const y1 = y * cosX - z1 * sinX;
  const z2 = y * sinX + z1 * cosX;

  return { sx: cx + x1 * scale, sy: cy - y1 * scale, depth: z2 };
}

// ---------------------------------------------------------------------------
// Quantum gate operations on Bloch sphere
// ---------------------------------------------------------------------------

export function blochToCartesian(state: BlochState): { x: number; y: number; z: number } {
  return {
    x: Math.sin(state.theta) * Math.cos(state.phi),
    y: Math.sin(state.theta) * Math.sin(state.phi),
    z: Math.cos(state.theta),
  };
}

export function cartesianToBloch(x: number, y: number, z: number): BlochState {
  const r = Math.sqrt(x * x + y * y + z * z);
  if (r < 1e-10) return { theta: 0, phi: 0 };
  const nx = x / r, ny = y / r, nz = z / r;
  const theta = Math.acos(Math.max(-1, Math.min(1, nz)));
  const phi = Math.atan2(ny, nx);
  return { theta, phi: phi < 0 ? phi + 2 * Math.PI : phi };
}

/** Apply a rotation matrix to Bloch vector */
function rotateBloch(state: BlochState, axis: 'x' | 'y' | 'z', angle: number): BlochState {
  const { x, y, z } = blochToCartesian(state);
  const c = Math.cos(angle), s = Math.sin(angle);
  let nx: number, ny: number, nz: number;
  if (axis === 'x') {
    nx = x; ny = y * c - z * s; nz = y * s + z * c;
  } else if (axis === 'y') {
    nx = x * c + z * s; ny = y; nz = -x * s + z * c;
  } else {
    nx = x * c - y * s; ny = x * s + y * c; nz = z;
  }
  return cartesianToBloch(nx, ny, nz);
}

export function applyGate(state: BlochState, op: GateOp): BlochState {
  const angle = op.angle ?? Math.PI;
  switch (op.gate) {
    case 'X': return rotateBloch(state, 'x', Math.PI);
    case 'Y': return rotateBloch(state, 'y', Math.PI);
    case 'Z': return rotateBloch(state, 'z', Math.PI);
    case 'H': {
      // H = (X + Z) / √2 — rotation by π around (X+Z)/√2 axis
      const { x, y, z } = blochToCartesian(state);
      // H swaps X↔Z, negates Y
      return cartesianToBloch(z, -y, x);
    }
    case 'S': return rotateBloch(state, 'z', Math.PI / 2);
    case 'T': return rotateBloch(state, 'z', Math.PI / 4);
    case 'Rx': return rotateBloch(state, 'x', angle);
    case 'Ry': return rotateBloch(state, 'y', angle);
    case 'Rz': return rotateBloch(state, 'z', angle);
  }
}

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

export function BlochSphere(props: BlochSphereProps) {
  const {
    state: externalState,
    gates,
    width = 400,
    height = 400,
    rotateY: initRotY = -25,
    rotateX: initRotX = 15,
    zoom: initZoom = 1.0,
    interactive = true,
    zoomable = true,
    showVector = true,
    showLabels = true,
    showWireframe = true,
    showTrail = true,
    trailMaxPoints = 200,
    trailColor = '#ef4444',
    wireframeColor = '#cbd5e1',
    vectorColor = '#3b82f6',
    backgroundColor,
    sphereRadius = 130,
    title,
    onStateChange,
  } = props;

  // State
  const [qState, setQState] = useState<BlochState>(externalState ?? { theta: 0, phi: 0 });
  const [rotY, setRotY] = useState(initRotY);
  const [rotX, setRotX] = useState(initRotX);
  const [zoomLevel, setZoomLevel] = useState(initZoom);
  const trailRef = useRef<TrailPoint[]>([]);
  const draggingRef = useRef(false);
  const dragStartRef = useRef<{ mx: number; my: number; rx: number; ry: number } | null>(null);
  const svgRef = useRef<SVGSVGElement | null>(null);

  // Sync external state
  useEffect(() => {
    if (externalState) setQState(externalState);
  }, [externalState?.theta, externalState?.phi]);

  // Apply gate sequence
  const gateIdxRef = useRef(0);
  useEffect(() => {
    if (!gates || gates.length === 0) return;
    gateIdxRef.current = 0;
    let frameId = 0;
    const step = () => {
      if (gateIdxRef.current >= gates.length) return;
      setQState((prev: BlochState) => {
        const next = applyGate(prev, gates[gateIdxRef.current]!);
        gateIdxRef.current++;
        if (onStateChange) onStateChange(next);
        return next;
      });
      frameId = requestAnimationFrame(step) as unknown as number;
    };
    frameId = requestAnimationFrame(step) as unknown as number;
    return () => cancelAnimationFrame(frameId);
  }, [gates]);

  // Record trail
  useEffect(() => {
    const pt = blochToCartesian(qState);
    trailRef.current.push(pt);
    if (trailRef.current.length > trailMaxPoints) {
      trailRef.current.splice(0, trailRef.current.length - trailMaxPoints);
    }
  }, [qState.theta, qState.phi]);

  // Projection helpers
  const scale = sphereRadius * zoomLevel;
  const cx = width / 2;
  const cy = height / 2;

  const proj = useCallback(
    (x: number, y: number, z: number) => project(x, y, z, rotX, rotY, cx, cy, scale),
    [rotX, rotY, cx, cy, scale],
  );

  // Drag handlers
  const onMouseDown = useCallback((e: Event) => {
    if (!interactive) return;
    const me = e as MouseEvent;
    draggingRef.current = true;
    dragStartRef.current = { mx: me.clientX, my: me.clientY, rx: rotX, ry: rotY };
  }, [interactive, rotX, rotY]);

  const onMouseMove = useCallback((e: Event) => {
    if (!draggingRef.current || !dragStartRef.current) return;
    const me = e as MouseEvent;
    const ds = dragStartRef.current;
    setRotY(ds.ry + (me.clientX - ds.mx) * 0.5);
    setRotX(ds.rx - (me.clientY - ds.my) * 0.5);
  }, []);

  const onMouseUp = useCallback(() => { draggingRef.current = false; }, []);

  const onWheel = useCallback((e: Event) => {
    if (!zoomable) return;
    const we = e as WheelEvent;
    we.preventDefault();
    setZoomLevel((z: number) => Math.max(0.5, Math.min(3.0, z * (we.deltaY > 0 ? 0.95 : 1.05))));
  }, [zoomable]);

  // ── Build SVG elements ──────────────────────────────────────────────

  const elements: ReturnType<typeof createElement>[] = [];

  // Background
  if (backgroundColor) {
    elements.push(createElement('rect', {
      key: 'bg', x: '0', y: '0', width: String(width), height: String(height),
      fill: backgroundColor, rx: '6',
    }));
  }

  // Title
  if (title) {
    elements.push(createElement('text', {
      key: 'title', x: String(cx), y: '24',
      'text-anchor': 'middle', 'font-size': '14', 'font-weight': 'bold',
      'font-family': 'sans-serif', fill: '#374151',
    }, title));
  }

  // Wireframe circles
  if (showWireframe) {
    const circleRes = 60;
    // Equator (XY plane, z=0)
    const eqPts: string[] = [];
    for (let i = 0; i <= circleRes; i++) {
      const a = (i / circleRes) * 2 * Math.PI;
      const p = proj(Math.cos(a), Math.sin(a), 0);
      eqPts.push(`${i === 0 ? 'M' : 'L'}${p.sx.toFixed(1)},${p.sy.toFixed(1)}`);
    }
    elements.push(createElement('path', {
      key: 'eq', d: eqPts.join(' '), fill: 'none',
      stroke: wireframeColor, 'stroke-width': '0.8', opacity: '0.5',
    }));

    // XZ meridian (y=0)
    const xzPts: string[] = [];
    for (let i = 0; i <= circleRes; i++) {
      const a = (i / circleRes) * 2 * Math.PI;
      const p = proj(Math.cos(a), 0, Math.sin(a));
      xzPts.push(`${i === 0 ? 'M' : 'L'}${p.sx.toFixed(1)},${p.sy.toFixed(1)}`);
    }
    elements.push(createElement('path', {
      key: 'xz', d: xzPts.join(' '), fill: 'none',
      stroke: wireframeColor, 'stroke-width': '0.8', opacity: '0.4',
    }));

    // YZ meridian (x=0)
    const yzPts: string[] = [];
    for (let i = 0; i <= circleRes; i++) {
      const a = (i / circleRes) * 2 * Math.PI;
      const p = proj(0, Math.cos(a), Math.sin(a));
      yzPts.push(`${i === 0 ? 'M' : 'L'}${p.sx.toFixed(1)},${p.sy.toFixed(1)}`);
    }
    elements.push(createElement('path', {
      key: 'yz', d: yzPts.join(' '), fill: 'none',
      stroke: wireframeColor, 'stroke-width': '0.8', opacity: '0.4',
    }));
  }

  // Axes
  const axes: { id: string; dir: [number, number, number]; color: string }[] = [
    { id: 'x', dir: [1, 0, 0], color: '#ef4444' },
    { id: 'y', dir: [0, 1, 0], color: '#22c55e' },
    { id: 'z', dir: [0, 0, 1], color: '#3b82f6' },
  ];
  for (const ax of axes) {
    const pos = proj(ax.dir[0] * 1.15, ax.dir[1] * 1.15, ax.dir[2] * 1.15);
    const neg = proj(-ax.dir[0] * 1.15, -ax.dir[1] * 1.15, -ax.dir[2] * 1.15);
    const orig = proj(0, 0, 0);
    elements.push(createElement('line', {
      key: `axis-${ax.id}`, x1: String(neg.sx), y1: String(neg.sy),
      x2: String(pos.sx), y2: String(pos.sy),
      stroke: ax.color, 'stroke-width': '0.8', opacity: '0.4',
      'stroke-dasharray': '3 3',
    }));
  }

  // Axis labels
  if (showLabels) {
    const labels: { text: string; pos: [number, number, number] }[] = [
      { text: '|0⟩', pos: [0, 0, 1.3] },
      { text: '|1⟩', pos: [0, 0, -1.3] },
      { text: '|+⟩', pos: [1.3, 0, 0] },
      { text: '|-⟩', pos: [-1.3, 0, 0] },
      { text: '|+i⟩', pos: [0, 1.3, 0] },
      { text: '|-i⟩', pos: [0, -1.3, 0] },
    ];
    for (const lbl of labels) {
      const p = proj(lbl.pos[0], lbl.pos[1], lbl.pos[2]);
      elements.push(createElement('text', {
        key: `lbl-${lbl.text}`, x: String(p.sx), y: String(p.sy),
        'text-anchor': 'middle', 'dominant-baseline': 'central',
        'font-size': '11', 'font-family': 'serif', fill: '#475569',
        style: { pointerEvents: 'none' },
      }, lbl.text));
    }
  }

  // Trail
  if (showTrail && trailRef.current.length > 1) {
    const trail = trailRef.current;
    const trailParts: string[] = [];
    for (let i = 0; i < trail.length; i++) {
      const t = trail[i]!;
      const p = proj(t.x, t.y, t.z);
      trailParts.push(`${i === 0 ? 'M' : 'L'}${p.sx.toFixed(1)},${p.sy.toFixed(1)}`);
    }
    elements.push(createElement('path', {
      key: 'trail', d: trailParts.join(' '), fill: 'none',
      stroke: trailColor, 'stroke-width': '1.5', opacity: '0.5',
      'stroke-linecap': 'round', 'stroke-linejoin': 'round',
    }));
  }

  // State vector
  if (showVector) {
    const sv = blochToCartesian(qState);
    const origin = proj(0, 0, 0);
    const tip = proj(sv.x, sv.y, sv.z);

    // Arrow line
    elements.push(createElement('line', {
      key: 'vec-line',
      x1: String(origin.sx), y1: String(origin.sy),
      x2: String(tip.sx), y2: String(tip.sy),
      stroke: vectorColor, 'stroke-width': '2.5', 'stroke-linecap': 'round',
    }));

    // State point
    elements.push(createElement('circle', {
      key: 'vec-point',
      cx: String(tip.sx), cy: String(tip.sy), r: '5',
      fill: vectorColor, stroke: '#fff', 'stroke-width': '1.5',
    }));

    // State label
    const tDeg = (qState.theta * 180 / Math.PI).toFixed(0);
    const pDeg = (qState.phi * 180 / Math.PI).toFixed(0);
    elements.push(createElement('text', {
      key: 'state-label',
      x: String(width - 10), y: String(height - 10),
      'text-anchor': 'end', 'font-size': '10', 'font-family': 'monospace',
      fill: '#64748b',
    }, `\u03b8=${tDeg}\u00b0 \u03c6=${pDeg}\u00b0`));
  }

  return createElement('svg', {
    ref: svgRef,
    width: '100%',
    viewBox: `0 0 ${width} ${height}`,
    preserveAspectRatio: 'xMidYMid meet',
    xmlns: 'http://www.w3.org/2000/svg',
    role: 'img',
    'aria-label': title ?? 'Bloch sphere quantum state visualization',
    style: {
      fontFamily: 'sans-serif',
      cursor: interactive ? (draggingRef.current ? 'grabbing' : 'grab') : 'default',
    },
    onMouseDown: interactive ? onMouseDown : undefined,
    onMouseMove: interactive ? onMouseMove : undefined,
    onMouseUp: interactive ? onMouseUp : undefined,
    onMouseLeave: interactive ? onMouseUp : undefined,
    onWheel: zoomable ? onWheel : undefined,
  }, ...elements);
}
