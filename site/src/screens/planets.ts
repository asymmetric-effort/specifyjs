// (c) 2025-2026 Asymmetric Effort, LLC. MIT LICENSE
// SPDX-License-Identifier: MIT

/**
 * Solar System Simulation — 9 planets orbiting a star using
 * gravitational N-body physics via the ForceGraph customForce API.
 *
 * Orbital parameters approximate our solar system's relative
 * distances and velocities. The star (Sun) is fixed at center.
 */

import { createElement } from 'specifyjs';
import { ForceGraph, type ForceSimNode, type ForceEdge, type MousePosition } from '../../../components/viz/force-graph/src/index';

// ── Planetary data (scaled for visualization) ────────────────────────

interface Planet {
  id: string;
  label: string;
  color: string;
  /** Semi-major axis in px */
  semiMajor: number;
  /** Orbital eccentricity (0 = circle, <1 = ellipse) */
  eccentricity: number;
  /** Relative mass (Earth = 1) */
  mass: number;
}

const SUN_MASS = 333000; // relative to Earth
const G = 0.0001;

// Real eccentricities from NASA planetary fact sheets.
// Semi-major axes scaled so Pluto's aphelion (~240px) fits within the viewport.
const PLANETS: Planet[] = [
  { id: 'mercury',  label: 'Mercury',  color: '#94a3b8', semiMajor: 28,  eccentricity: 0.206, mass: 0.055 },
  { id: 'venus',    label: 'Venus',    color: '#f59e0b', semiMajor: 48,  eccentricity: 0.007, mass: 0.815 },
  { id: 'earth',    label: 'Earth',    color: '#3b82f6', semiMajor: 65,  eccentricity: 0.017, mass: 1.0 },
  { id: 'mars',     label: 'Mars',     color: '#ef4444', semiMajor: 82,  eccentricity: 0.093, mass: 0.107 },
  { id: 'jupiter',  label: 'Jupiter',  color: '#f97316', semiMajor: 115, eccentricity: 0.049, mass: 317.8 },
  { id: 'saturn',   label: 'Saturn',   color: '#eab308', semiMajor: 150, eccentricity: 0.057, mass: 95.2 },
  { id: 'uranus',   label: 'Uranus',   color: '#06b6d4', semiMajor: 180, eccentricity: 0.046, mass: 14.5 },
  { id: 'neptune',  label: 'Neptune',  color: '#6366f1', semiMajor: 210, eccentricity: 0.010, mass: 17.1 },
  { id: 'pluto',    label: 'Pluto',    color: '#a1a1aa', semiMajor: 240, eccentricity: 0.249, mass: 0.002 },
];

// ── N-body gravitational force (leapfrog integrator) ─────────────────

/** Compute gravitational acceleration toward the Sun */
function sunAccel(px: number, py: number, cx: number, cy: number): { ax: number; ay: number } {
  const dx = cx - px, dy = cy - py;
  const distSq = dx * dx + dy * dy;
  const dist = Math.sqrt(distSq);
  if (dist < 3) return { ax: 0, ay: 0 };
  const a = G * SUN_MASS / distSq;
  return { ax: (dx / dist) * a, ay: (dy / dist) * a };
}

/**
 * Leapfrog (Störmer-Verlet) integrator — symplectic, conserves energy.
 *
 *   v(t + dt/2) = v(t) + a(t) * dt/2       (half-kick)
 *   x(t + dt)   = x(t) + v(t + dt/2) * dt  (drift)
 *   a(t + dt)   = accel(x(t + dt))          (recompute)
 *   v(t + dt)   = v(t + dt/2) + a(t+dt) * dt/2  (half-kick)
 *
 * Multiple sub-steps per frame for stability at all orbit sizes.
 */
const SUB_STEPS = 4;
const DT = 1.0 / SUB_STEPS;

function createSolarForce(): (
  nodes: ForceSimNode[], edges: ForceEdge[], w: number, h: number, mouse: MousePosition | null
) => ForceSimNode[] {
  const vel = new Map<string, { vx: number; vy: number }>();
  let init = false;

  return (nodes, _edges, w, h, _mouse) => {
    const sun = nodes.find(n => n.id === 'sun');
    if (!sun) return nodes;
    const cx = w / 2, cy = h / 2;

    // Initialize velocities for elliptical orbits (Kepler)
    // Start at aphelion: v_aph = sqrt(GM*(1-e)/(a*(1+e)))
    if (!init) {
      for (const p of PLANETS) {
        const nd = nodes.find(n => n.id === p.id);
        if (!nd) continue;
        const dx = nd.x - cx, dy = nd.y - cy;
        const dist = Math.sqrt(dx * dx + dy * dy);
        if (dist < 1) continue;
        const e = p.eccentricity;
        const a = p.semiMajor;
        const speed = Math.sqrt(G * SUN_MASS * (1 - e) / (a * (1 + e)));
        // Tangential (perpendicular to radius, counter-clockwise)
        vel.set(p.id, { vx: -(dy / dist) * speed, vy: (dx / dist) * speed });
      }
      vel.set('sun', { vx: 0, vy: 0 });
      init = true;
    }

    const result = nodes.map(n => ({ ...n }));

    for (const nd of result) {
      if (nd.id === 'sun') { nd.x = cx; nd.y = cy; continue; }
      const v = vel.get(nd.id);
      if (!v) continue;

      // Leapfrog with sub-stepping
      for (let s = 0; s < SUB_STEPS; s++) {
        // Current acceleration
        const a1 = sunAccel(nd.x, nd.y, cx, cy);

        // Half-kick
        const vxHalf = v.vx + a1.ax * DT * 0.5;
        const vyHalf = v.vy + a1.ay * DT * 0.5;

        // Drift
        nd.x += vxHalf * DT;
        nd.y += vyHalf * DT;

        // New acceleration at updated position
        const a2 = sunAccel(nd.x, nd.y, cx, cy);

        // Second half-kick
        v.vx = vxHalf + a2.ax * DT * 0.5;
        v.vy = vyHalf + a2.ay * DT * 0.5;
      }
    }

    return result;
  };
}

// ── Build initial node positions on circular orbits ──────────────────

function buildNodes(cx: number, cy: number) {
  const nodes: { id: string; fixed?: boolean; x: number; y: number; color: string; label?: string }[] = [
    { id: 'sun', fixed: true, x: cx, y: cy, color: '#fbbf24', label: 'Sun' },
  ];
  for (let i = 0; i < PLANETS.length; i++) {
    const p = PLANETS[i]!;
    // Place each planet at its aphelion (farthest point): r_aph = a * (1 + e)
    const aphelion = p.semiMajor * (1 + p.eccentricity);
    // Distribute at different starting angles so they don't overlap
    const angle = (i / PLANETS.length) * 2 * Math.PI + Math.PI / 6;
    nodes.push({
      id: p.id,
      x: cx + aphelion * Math.cos(angle),
      y: cy + aphelion * Math.sin(angle),
      color: p.color,
      label: p.label,
    });
  }
  return nodes;
}

// Module-level stable force function
const solarForce = createSolarForce();

// ── Component ────────────────────────────────────────────────────────

export function PlanetsScreen() {
  const cx = 400, cy = 350;
  const nodes = buildNodes(cx, cy);

  // Trails for all planets
  const trails = PLANETS.map(p => ({
    nodeId: p.id,
    color: p.color,
    maxPoints: 800,
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
        nodes,
        edges: [],
        customForce: solarForce,
        trails,
        width: 800,
        height: 700,
        nodeRadius: 5,
        showLabels: true,
        edgeWidth: 0,
      }),
    ),
    createElement('p', {
      style: { fontSize: '11px', color: 'var(--color-text-muted, #94a3b8)', marginTop: '8px' },
    }, '9 planets orbiting a star under Newtonian gravity. Orbital radii and speeds approximate our solar system.'),
  );
}
