// (c) 2025-2026 Asymmetric Effort, LLC. MIT LICENSE
// SPDX-License-Identifier: MIT

import { createElement } from 'specifyjs';
import { useState, useCallback, useRef } from 'specifyjs/hooks';
import { ForceGraph, type ForceSimNode, type ForceEdge, type MousePosition } from '../../../components/viz/force-graph/src/index';
import { NumberSpinner } from '../../../components/form/number-spinner/src/index';
import { Button } from '../../../components/form/button/src/index';
import { Toggle } from '../../../components/form/toggle/src/index';
import { matN, matNSet } from '../../../components/math/src/mat';
import { solve } from '../../../components/math/src/solver';

// ── Constants ────────────────────────────────────────────────────────

const COLORS = ['#3b82f6', '#ef4444', '#10b981', '#f59e0b', '#8b5cf6',
  '#ec4899', '#06b6d4', '#84cc16', '#f97316', '#6366f1'];
const ARM = 40;
const G_VERLET = 0.5;
const DAMP = 0.999;
const ITERS = 10;
const MOUSE_G = 0.08;

let cursorMass = 100;

// ── Mouse attraction ─────────────────────────────────────────────────

function mouseForce(nx: number, ny: number, vx: number, vy: number, mouse: MousePosition | null) {
  if (!mouse) return { vx, vy };
  const dx = mouse.x - nx, dy = mouse.y - ny;
  const distSq = dx * dx + dy * dy;
  if (distSq < 1) return { vx, vy };
  const dist = Math.sqrt(distSq);
  const f = MOUSE_G * cursorMass / Math.max(dist, 15);
  return { vx: vx + (dx / dist) * f, vy: vy + (dy / dist) * f };
}

// ── Verlet force ─────────────────────────────────────────────────────

function createVerlet(n: number) {
  const prev = new Map<string, { x: number; y: number }>();
  let init = false;
  return (nodes: ForceSimNode[], _e: ForceEdge[], _w: number, _h: number, mouse: MousePosition | null) => {
    const pivot = nodes.find(nd => nd.id === 'pivot');
    if (!pivot) return nodes;
    if (!init) { for (const nd of nodes) prev.set(nd.id, { x: nd.x, y: nd.y }); init = true; }
    const r = nodes.map(nd => ({ ...nd }));
    for (const nd of r) {
      if (nd.fixed) continue;
      const p = prev.get(nd.id) ?? { x: nd.x, y: nd.y };
      let vx = (nd.x - p.x) * DAMP;
      let vy = (nd.y - p.y) * DAMP + G_VERLET;
      const m = mouseForce(nd.x, nd.y, vx, vy, mouse);
      vx = m.vx; vy = m.vy;
      prev.set(nd.id, { x: nd.x, y: nd.y });
      nd.x += vx; nd.y += vy;
    }
    for (let it = 0; it < ITERS; it++) {
      for (let i = 0; i < r.length - 1; i++) {
        const a = r[i]!, b = r[i + 1]!;
        const dx = b.x - a.x, dy = b.y - a.y;
        const d = Math.sqrt(dx * dx + dy * dy);
        if (d < 0.001) continue;
        const diff = (d - ARM) / d;
        const ox = dx * diff * 0.5, oy = dy * diff * 0.5;
        if (!a.fixed) { a.x += ox; a.y += oy; }
        if (!b.fixed) { b.x -= ox; b.y -= oy; }
      }
    }
    return r;
  };
}

// ── Lagrangian force ─────────────────────────────────────────────────

function createLagrangian(n: number) {
  const theta = new Float64Array(n);
  const omega = new Float64Array(n);
  let init = false;
  const dt = 0.03, g = 9.81, L = ARM;

  return (nodes: ForceSimNode[], _e: ForceEdge[], _w: number, _h: number, mouse: MousePosition | null) => {
    const pivot = nodes.find(nd => nd.id === 'pivot');
    if (!pivot) return nodes;
    if (!init) {
      let px = pivot.x, py = pivot.y;
      for (let i = 0; i < n; i++) {
        const nd = nodes.find(m => m.id === `m${i + 1}`);
        if (!nd) continue;
        theta[i] = Math.atan2(nd.x - px, nd.y - py);
        px = nd.x; py = nd.y;
      }
      init = true;
    }
    const M = matN(n);
    const tau = new Float64Array(n);
    for (let i = 0; i < n; i++) {
      for (let j = 0; j < n; j++) {
        matNSet(M, i, j, (n - Math.max(i, j)) * Math.cos(theta[i]! - theta[j]!));
      }
      let t = 0;
      for (let j = 0; j < n; j++) {
        t -= (n - Math.max(i, j)) * omega[j]! * omega[j]! * Math.sin(theta[i]! - theta[j]!);
      }
      t -= (n - i) * (g / L) * Math.sin(theta[i]!);
      tau[i] = t;
    }
    const alpha = solve(M, tau);
    if (alpha) {
      for (let i = 0; i < n; i++) { omega[i] += alpha[i]! * dt; omega[i] *= 0.9995; }
    }
    for (let i = 0; i < n; i++) theta[i] += omega[i]! * dt;

    const result = nodes.map(nd => ({ ...nd }));
    let px = pivot.x, py = pivot.y;
    for (let i = 0; i < n; i++) {
      const nd = result.find(m => m.id === `m${i + 1}`);
      if (!nd) continue;
      nd.x = px + L * Math.sin(theta[i]!);
      nd.y = py + L * Math.cos(theta[i]!);
      if (mouse) {
        const dx = mouse.x - nd.x, dy = mouse.y - nd.y;
        const dist = Math.sqrt(dx * dx + dy * dy);
        if (dist > 1) {
          const rx = nd.x - px, ry = nd.y - py;
          const fx = (dx / dist) * MOUSE_G * cursorMass;
          const fy = (dy / dist) * MOUSE_G * cursorMass;
          omega[i] += ((rx * fy - ry * fx) / (L * L)) * dt;
        }
      }
      px = nd.x; py = nd.y;
    }
    return result;
  };
}

// ── Helpers ──────────────────────────────────────────────────────────

type Mode = 'verlet' | 'lagrangian';

function mkForce(mode: Mode, n: number) {
  return mode === 'lagrangian' ? createLagrangian(n) : createVerlet(n);
}

function mkNodes(n: number, cx: number, cy: number) {
  const nodes = [{ id: 'pivot', fixed: true, x: cx, y: cy, color: '#64748b' }];
  for (let i = 0; i < n; i++) {
    const a = Math.PI / 4 + i * 0.3;
    nodes.push({ id: `m${i + 1}`, x: cx + (i + 1) * ARM * Math.sin(a), y: cy + (i + 1) * ARM * Math.cos(a), color: COLORS[i % COLORS.length]! });
  }
  return nodes;
}

function mkEdges(n: number) {
  const ids = ['pivot', ...Array.from({ length: n }, (_, i) => `m${i + 1}`)];
  return ids.slice(0, -1).map((s, i) => ({ source: s, target: ids[i + 1]!, color: 'var(--color-text-muted, #94a3b8)' }));
}

// ── Component ────────────────────────────────────────────────────────

export function PendulumScreen() {
  const [joints, setJoints] = useState(3);
  const [mode, setMode] = useState<Mode>('verlet');
  const [grav, setGrav] = useState(100);
  const [solid, setSolid] = useState(false);
  const forceRef = useRef(mkForce(mode, joints));

  const onJoints = useCallback((n: number) => { forceRef.current = mkForce(mode, n); setJoints(n); }, [mode]);
  const onMode = useCallback((m: Mode) => { forceRef.current = mkForce(m, joints); setMode(m); }, [joints]);
  const onGrav = useCallback((v: number) => { cursorMass = v; setGrav(v); }, []);

  const lastId = `m${joints}`;
  const lastClr = COLORS[(joints - 1) % COLORS.length]!;

  return createElement('div', {
    style: { display: 'flex', flexDirection: 'column', height: '100%', padding: '16px', boxSizing: 'border-box' },
  },
    // Title
    createElement('h2', {
      style: { fontSize: '18px', fontWeight: '600', marginBottom: '12px', color: 'var(--color-text, #0f172a)' },
    }, 'Pendulum Physics'),
    // Main area
    createElement('div', {
      style: { flex: '1', display: 'flex', gap: '16px', alignItems: 'flex-start', flexWrap: 'wrap' },
    },
      // Visualization
      createElement('div', { style: { flex: '1', minWidth: '300px' } },
        createElement(ForceGraph, {
          nodes: mkNodes(joints, 400, 60),
          edges: mkEdges(joints),
          customForce: forceRef.current,
          trails: [{ nodeId: lastId, color: lastClr, maxPoints: 600, width: 1, opacity: 0.3 }],
          width: 800, height: 600, nodeRadius: 6, nodeStrokeWidth: 0, solidNodes: solid, showLabels: false, edgeWidth: 2,
        }),
      ),
      // Controls
      createElement('div', {
        style: { display: 'flex', flexDirection: 'column', gap: '12px', minWidth: '100px', fontSize: '12px', color: 'var(--color-text, #1f2937)' },
      },
        createElement(NumberSpinner, { value: joints, onChange: onJoints, min: 2, max: 1000, step: 1, label: 'Joints' }),
        createElement(NumberSpinner, { value: grav, onChange: onGrav, min: 1, max: 1000000, step: 10, label: 'Cursor mass' }),
        createElement('div', { style: { display: 'flex', flexDirection: 'column', gap: '4px', marginTop: '8px' } },
          createElement(Button, { size: 'sm', active: mode === 'verlet', onClick: () => onMode('verlet') }, 'Verlet (PBD)'),
          createElement(Button, { size: 'sm', active: mode === 'lagrangian', onClick: () => onMode('lagrangian') }, 'Lagrangian'),
        ),
        createElement(Toggle, { checked: solid, onChange: setSolid, label: 'Solid', size: 'sm' }),
        createElement('p', { style: { fontSize: '10px', color: 'var(--color-text-muted, #94a3b8)', marginTop: '8px', lineHeight: '1.4' } },
          'Move cursor over the visualization to attract vertices. Double-click a vertex to lock/unlock it.',
        ),
      ),
    ),
  );
}
