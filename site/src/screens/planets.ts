// (c) 2025-2026 Asymmetric Effort, LLC. MIT LICENSE
// SPDX-License-Identifier: MIT

/**
 * Solar System Simulation — 9 planets orbiting a star using
 * Newtonian gravity with a leapfrog integrator.
 *
 * Physics runs in 3D with realistic orbital inclinations.
 * Display uses logarithmic distance scaling so all planets
 * fit on screen while gravity uses true distances.
 * Orbital plane viewed at 45° from the Y-Z axes.
 */

import { createElement } from 'specifyjs';
import { ForceGraph, type ForceSimNode, type ForceEdge, type MousePosition } from '../../../components/viz/force-graph/src/index';

// ── Planetary data ───────────────────────────────────────────────────

interface Planet {
  id: string;
  label: string;
  color: string;
  /** Semi-major axis in AU */
  au: number;
  /** Orbital eccentricity */
  ecc: number;
  /** Orbital inclination in degrees (relative to ecliptic) */
  incl: number;
  /** Longitude of ascending node in degrees */
  node: number;
}

const GM_SUN = 4 * Math.PI * Math.PI; // AU³/yr² (Kepler's third law: GM = 4π² when a in AU, T in years)
const DT = 0.0008; // timestep in years (~0.3 days)
const SUB_STEPS = 3;

// NASA data: AU distances, eccentricities, inclinations, ascending nodes
const PLANETS: Planet[] = [
  { id: 'mercury',  label: 'Mercury',  color: '#94a3b8', au: 0.387,  ecc: 0.206, incl: 7.00,  node: 48.3  },
  { id: 'venus',    label: 'Venus',    color: '#f59e0b', au: 0.723,  ecc: 0.007, incl: 3.39,  node: 76.7  },
  { id: 'earth',    label: 'Earth',    color: '#3b82f6', au: 1.000,  ecc: 0.017, incl: 0.00,  node: 0.0   },
  { id: 'mars',     label: 'Mars',     color: '#ef4444', au: 1.524,  ecc: 0.093, incl: 1.85,  node: 49.6  },
  { id: 'jupiter',  label: 'Jupiter',  color: '#f97316', au: 5.203,  ecc: 0.049, incl: 1.30,  node: 100.5 },
  { id: 'saturn',   label: 'Saturn',   color: '#eab308', au: 9.537,  ecc: 0.057, incl: 2.49,  node: 113.7 },
  { id: 'uranus',   label: 'Uranus',   color: '#06b6d4', au: 19.19,  ecc: 0.046, incl: 0.77,  node: 74.0  },
  { id: 'neptune',  label: 'Neptune',  color: '#6366f1', au: 30.07,  ecc: 0.010, incl: 1.77,  node: 131.8 },
  { id: 'pluto',    label: 'Pluto',    color: '#a1a1aa', au: 39.48,  ecc: 0.249, incl: 17.16, node: 110.3 },
];

// ── Logarithmic display scaling ──────────────────────────────────────

/** Map AU distance to pixel radius using log scaling.
 *  log(AU) maps [0.387..39.48] → [~-0.41..~1.60]
 *  We scale this to fill ~30..280px */
const LOG_MIN = Math.log10(0.3);
const LOG_MAX = Math.log10(50);
const PX_MIN = 30;
const PX_MAX = 280;

function auToPixelRadius(au: number): number {
  const logAu = Math.log10(Math.max(au, 0.01));
  const t = (logAu - LOG_MIN) / (LOG_MAX - LOG_MIN);
  return PX_MIN + t * (PX_MAX - PX_MIN);
}

// ── 3D projection (45° viewing angle) ────────────────────────────────

const VIEW_ANGLE = 45 * Math.PI / 180; // tilt from face-on
const COS_VIEW = Math.cos(VIEW_ANGLE);
const SIN_VIEW = Math.sin(VIEW_ANGLE);

/** Project 3D position (AU) to 2D pixel position */
function project(x3d: number, y3d: number, z3d: number, cx: number, cy: number): { px: number; py: number } {
  const r = Math.sqrt(x3d * x3d + y3d * y3d + z3d * z3d);
  const pixR = auToPixelRadius(r);
  // Direction in 3D, normalized
  if (r < 0.0001) return { px: cx, py: cy };
  const nx = x3d / r, ny = y3d / r, nz = z3d / r;
  // Rotate around X axis by VIEW_ANGLE to tilt the orbital plane
  const ny2 = ny * COS_VIEW - nz * SIN_VIEW;
  const nz2 = ny * SIN_VIEW + nz * COS_VIEW;
  return { px: cx + nx * pixR, py: cy - ny2 * pixR };
}

// ── 3D physics state ─────────────────────────────────────────────────

interface Body3D {
  x: number; y: number; z: number; // position in AU
  vx: number; vy: number; vz: number; // velocity in AU/yr
}

function initBodies(): Map<string, Body3D> {
  const bodies = new Map<string, Body3D>();
  bodies.set('sun', { x: 0, y: 0, z: 0, vx: 0, vy: 0, vz: 0 });

  for (let i = 0; i < PLANETS.length; i++) {
    const p = PLANETS[i]!;
    const a = p.au;
    const e = p.ecc;
    const rAph = a * (1 + e); // aphelion distance

    // Start angle — distribute planets around the orbit
    const startAngle = (i / PLANETS.length) * 2 * Math.PI + 0.5;

    // Orbital inclination rotation
    const inclRad = p.incl * Math.PI / 180;
    const nodeRad = p.node * Math.PI / 180;

    // Position at aphelion in the orbital plane, then rotate by inclination
    const xOrb = rAph * Math.cos(startAngle);
    const yOrb = rAph * Math.sin(startAngle);

    // Rotate by longitude of ascending node (around Z)
    const x1 = xOrb * Math.cos(nodeRad) - yOrb * Math.sin(nodeRad);
    const y1 = xOrb * Math.sin(nodeRad) + yOrb * Math.cos(nodeRad);

    // Rotate by inclination (around the node line = X after node rotation)
    const x = x1;
    const y = y1 * Math.cos(inclRad);
    const z = y1 * Math.sin(inclRad);

    // Aphelion velocity: v = sqrt(GM*(1-e)/(a*(1+e)))
    const speed = Math.sqrt(GM_SUN * (1 - e) / (a * (1 + e)));

    // Tangential velocity perpendicular to radius in the orbital plane
    const vxOrb = -rAph * Math.sin(startAngle);
    const vyOrb = rAph * Math.cos(startAngle);
    const vLen = Math.sqrt(vxOrb * vxOrb + vyOrb * vyOrb);
    const vnx = vxOrb / vLen, vny = vyOrb / vLen;

    // Rotate velocity direction same as position
    const vx1 = vnx * Math.cos(nodeRad) - vny * Math.sin(nodeRad);
    const vy1 = vnx * Math.sin(nodeRad) + vny * Math.cos(nodeRad);
    const vxf = vx1 * speed;
    const vyf = vy1 * Math.cos(inclRad) * speed;
    const vzf = vy1 * Math.sin(inclRad) * speed;

    bodies.set(p.id, { x, y, z, vx: vxf, vy: vyf, vz: vzf });
  }
  return bodies;
}

// ── Force function ───────────────────────────────────────────────────

function createSolarForce(): (
  nodes: ForceSimNode[], edges: ForceEdge[], w: number, h: number, mouse: MousePosition | null
) => ForceSimNode[] {
  const bodies = initBodies();

  return (nodes, _edges, w, h, _mouse) => {
    const cx = w / 2, cy = h / 2;
    const result = nodes.map(n => ({ ...n }));

    // Leapfrog integration in 3D
    for (const p of PLANETS) {
      const b = bodies.get(p.id);
      if (!b) continue;

      for (let s = 0; s < SUB_STEPS; s++) {
        // Acceleration toward sun
        const r2 = b.x * b.x + b.y * b.y + b.z * b.z;
        const r = Math.sqrt(r2);
        if (r < 0.001) continue;
        const a1 = -GM_SUN / r2;
        const ax1 = (b.x / r) * a1;
        const ay1 = (b.y / r) * a1;
        const az1 = (b.z / r) * a1;

        // Half-kick
        const vxH = b.vx + ax1 * DT * 0.5;
        const vyH = b.vy + ay1 * DT * 0.5;
        const vzH = b.vz + az1 * DT * 0.5;

        // Drift
        b.x += vxH * DT;
        b.y += vyH * DT;
        b.z += vzH * DT;

        // New acceleration
        const r2b = b.x * b.x + b.y * b.y + b.z * b.z;
        const rb = Math.sqrt(r2b);
        const a2 = -GM_SUN / r2b;
        const ax2 = (b.x / rb) * a2;
        const ay2 = (b.y / rb) * a2;
        const az2 = (b.z / rb) * a2;

        // Second half-kick
        b.vx = vxH + ax2 * DT * 0.5;
        b.vy = vyH + ay2 * DT * 0.5;
        b.vz = vzH + az2 * DT * 0.5;
      }

      // Project 3D → 2D for display
      const projected = project(b.x, b.y, b.z, cx, cy);
      const nd = result.find(n => n.id === p.id);
      if (nd) { nd.x = projected.px; nd.y = projected.py; }
    }

    // Sun stays at center
    const sunNd = result.find(n => n.id === 'sun');
    if (sunNd) { sunNd.x = cx; sunNd.y = cy; }

    return result;
  };
}

// ── Build initial nodes from 3D state ────────────────────────────────

function buildNodes(cx: number, cy: number): { id: string; fixed?: boolean; x: number; y: number; color: string; label?: string }[] {
  const bodies = initBodies();
  const nodes: { id: string; fixed?: boolean; x: number; y: number; color: string; label?: string }[] = [
    { id: 'sun', fixed: true, x: cx, y: cy, color: '#fbbf24', label: 'Sun' },
  ];
  for (const p of PLANETS) {
    const b = bodies.get(p.id)!;
    const proj = project(b.x, b.y, b.z, cx, cy);
    nodes.push({ id: p.id, x: proj.px, y: proj.py, color: p.color, label: p.label });
  }
  return nodes;
}

const solarForce = createSolarForce();

// ── Component ────────────────────────────────────────────────────────

export function PlanetsScreen() {
  const cx = 400, cy = 350;
  const nodes = buildNodes(cx, cy);

  const trails = PLANETS.map(p => ({
    nodeId: p.id,
    color: p.color,
    maxPoints: 1200,
    width: 0.5,
    opacity: 0.25,
  }));

  return createElement('div', {
    style: { display: 'flex', flexDirection: 'column', height: '100%', padding: '16px', boxSizing: 'border-box' },
  },
    createElement('h2', {
      style: { fontSize: '18px', fontWeight: '600', marginBottom: '12px', color: 'var(--color-text, #0f172a)' },
    }, 'Solar System'),
    createElement('div', { style: { flex: '1', minHeight: '400px' } },
      createElement(ForceGraph, {
        nodes, edges: [],
        customForce: solarForce,
        trails,
        width: 800, height: 700,
        nodeRadius: 4, nodeStrokeWidth: 0,
        showLabels: true, edgeWidth: 0,
      }),
    ),
    createElement('p', {
      style: { fontSize: '11px', color: 'var(--color-text-muted, #94a3b8)', marginTop: '8px', lineHeight: '1.5' },
    }, 'Newtonian gravity in 3D with leapfrog integration. Logarithmic distance scaling. Orbital plane tilted 45\u00b0. Inclinations from NASA data (Pluto: 17.16\u00b0).'),
  );
}
