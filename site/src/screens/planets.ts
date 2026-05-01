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
  /** Orbital radius in px */
  orbit: number;
  /** Orbital speed (radians per frame) */
  speed: number;
  /** Relative mass (Earth = 1) */
  mass: number;
}

const SUN_MASS = 333000; // relative to Earth
const G = 0.0001;

const PLANETS: Planet[] = [
  { id: 'mercury',  label: 'Mercury',  color: '#94a3b8', orbit: 40,  speed: 0.048, mass: 0.055 },
  { id: 'venus',    label: 'Venus',    color: '#f59e0b', orbit: 65,  speed: 0.035, mass: 0.815 },
  { id: 'earth',    label: 'Earth',    color: '#3b82f6', orbit: 90,  speed: 0.030, mass: 1.0 },
  { id: 'mars',     label: 'Mars',     color: '#ef4444', orbit: 115, speed: 0.024, mass: 0.107 },
  { id: 'jupiter',  label: 'Jupiter',  color: '#f97316', orbit: 160, speed: 0.013, mass: 317.8 },
  { id: 'saturn',   label: 'Saturn',   color: '#eab308', orbit: 210, speed: 0.010, mass: 95.2 },
  { id: 'uranus',   label: 'Uranus',   color: '#06b6d4', orbit: 255, speed: 0.007, mass: 14.5 },
  { id: 'neptune',  label: 'Neptune',  color: '#6366f1', orbit: 295, speed: 0.005, mass: 17.1 },
  { id: 'pluto',    label: 'Pluto',    color: '#a1a1aa', orbit: 330, speed: 0.004, mass: 0.002 },
];

// ── N-body gravitational force ───────────────────────────────────────

function createSolarForce(): (
  nodes: ForceSimNode[], edges: ForceEdge[], w: number, h: number, mouse: MousePosition | null
) => ForceSimNode[] {
  // Velocity state per body
  const vel = new Map<string, { vx: number; vy: number }>();
  let init = false;

  return (nodes, _edges, w, h, _mouse) => {
    const sun = nodes.find(n => n.id === 'sun');
    if (!sun) return nodes;
    const cx = w / 2, cy = h / 2;

    // Initialize velocities for circular orbits
    if (!init) {
      for (const p of PLANETS) {
        const nd = nodes.find(n => n.id === p.id);
        if (!nd) continue;
        // Tangential velocity for circular orbit
        const dx = nd.x - cx, dy = nd.y - cy;
        const dist = Math.sqrt(dx * dx + dy * dy);
        const speed = Math.sqrt(G * SUN_MASS / Math.max(dist, 1));
        // Perpendicular to radius vector (counter-clockwise)
        vel.set(p.id, { vx: -(dy / dist) * speed, vy: (dx / dist) * speed });
      }
      vel.set('sun', { vx: 0, vy: 0 });
      init = true;
    }

    const result = nodes.map(n => ({ ...n }));

    // Compute gravitational forces on each planet from the Sun
    // (planet-planet interactions are negligible at this scale)
    for (const nd of result) {
      if (nd.id === 'sun') {
        nd.x = cx; nd.y = cy; // Keep sun fixed at center
        continue;
      }

      const v = vel.get(nd.id);
      if (!v) continue;

      const dx = cx - nd.x, dy = cy - nd.y;
      const distSq = dx * dx + dy * dy;
      const dist = Math.sqrt(distSq);
      if (dist < 5) continue;

      // Gravitational acceleration: a = G * M / r^2
      const accel = G * SUN_MASS / distSq;
      const ax = (dx / dist) * accel;
      const ay = (dy / dist) * accel;

      v.vx += ax;
      v.vy += ay;

      nd.x += v.vx;
      nd.y += v.vy;
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
    // Distribute planets at different starting angles
    const angle = (i / PLANETS.length) * 2 * Math.PI + Math.PI / 6;
    nodes.push({
      id: p.id,
      x: cx + p.orbit * Math.cos(angle),
      y: cy + p.orbit * Math.sin(angle),
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
