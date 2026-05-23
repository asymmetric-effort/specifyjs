// (c) 2025-2026 Asymmetric Effort, LLC. MIT LICENSE
// SPDX-License-Identifier: MIT

import { describe, it, expect, beforeEach, afterEach } from '@asymmetric-effort/nogginlessdom';
import {
  ForceGraph3D,
  initSimNodes3D,
  simulationTick3D,
  kineticEnergy3D,
  cameraPosition,
  projectPoint,
} from '../src/ForceGraph3D';
import type {
  ForceGraph3DNode,
  ForceGraph3DEdge,
  ForceGraph3DSimNode,
} from '../src/ForceGraph3D';
import { installMockDispatcher, teardownMockDispatcher } from '../../../_test-helpers/mock-dispatcher';

beforeEach(() => installMockDispatcher());
afterEach(() => teardownMockDispatcher());

const sampleNodes: ForceGraph3DNode[] = [
  { id: 'a', label: 'Node A' },
  { id: 'b', label: 'Node B' },
  { id: 'c', label: 'Node C' },
];

const sampleEdges: ForceGraph3DEdge[] = [
  { source: 'a', target: 'b' },
  { source: 'b', target: 'c' },
];

// ---------------------------------------------------------------------------
// Component rendering — happy path
// ---------------------------------------------------------------------------

describe('ForceGraph3D — happy path rendering', () => {
  it('renders with nodes and edges', () => {
    const el = ForceGraph3D({ nodes: sampleNodes, edges: sampleEdges });
    expect(el).not.toBeNull();
    expect(el.type).toBe('svg');
  });

  it('renders with custom dimensions', () => {
    const el = ForceGraph3D({ nodes: sampleNodes, edges: sampleEdges, width: 800, height: 600 });
    expect(el).not.toBeNull();
    expect(el.props.viewBox).toBe('0 0 800 600');
  });

  it('renders with custom background color', () => {
    const el = ForceGraph3D({ nodes: sampleNodes, edges: sampleEdges, backgroundColor: '#000000' });
    expect(el).not.toBeNull();
  });

  it('renders with simulation parameters', () => {
    const el = ForceGraph3D({
      nodes: sampleNodes,
      edges: sampleEdges,
      simulation: {
        repulsion: -200,
        springStrength: 0.02,
        springLength: 150,
        damping: 0.85,
        iterations: 2,
      },
    });
    expect(el).not.toBeNull();
  });

  it('renders with camera parameters', () => {
    const el = ForceGraph3D({
      nodes: sampleNodes,
      edges: sampleEdges,
      camera: { distance: 500, autoRotateSpeed: 10 },
    });
    expect(el).not.toBeNull();
  });

  it('renders with onNodeClick callback', () => {
    let clicked: ForceGraph3DNode | null = null;
    const el = ForceGraph3D({
      nodes: sampleNodes,
      edges: sampleEdges,
      onNodeClick: (node) => { clicked = node; },
    });
    expect(el).not.toBeNull();
  });

  it('renders with onNodeHover callback', () => {
    const el = ForceGraph3D({
      nodes: sampleNodes,
      edges: sampleEdges,
      onNodeHover: () => {},
    });
    expect(el).not.toBeNull();
  });

  it('renders with custom node properties', () => {
    const nodes: ForceGraph3DNode[] = [
      { id: 'a', label: 'Alpha', x: 10, y: 20, z: 30, size: 8, color: '#ff0000', data: { type: 'test' } },
      { id: 'b', label: 'Beta', size: 3, color: '#00ff00' },
    ];
    const el = ForceGraph3D({ nodes, edges: [] });
    expect(el).not.toBeNull();
  });

  it('renders with custom edge properties', () => {
    const edges: ForceGraph3DEdge[] = [
      { source: 'a', target: 'b', color: '#ff0000', width: 3, label: 'link' },
    ];
    const el = ForceGraph3D({ nodes: sampleNodes, edges });
    expect(el).not.toBeNull();
  });

  it('sets width to 100%', () => {
    const el = ForceGraph3D({ nodes: sampleNodes, edges: sampleEdges });
    expect(el.props.width).toBe('100%');
  });

  it('uses role="img"', () => {
    const el = ForceGraph3D({ nodes: sampleNodes, edges: sampleEdges });
    expect(el.props.role).toBe('img');
  });

  it('has aria-label for accessibility', () => {
    const el = ForceGraph3D({ nodes: sampleNodes, edges: sampleEdges });
    expect(el.props['aria-label']).toContain('3D force-directed graph');
  });

  it('sets preserveAspectRatio', () => {
    const el = ForceGraph3D({ nodes: sampleNodes, edges: sampleEdges });
    expect(el.props.preserveAspectRatio).toBe('xMidYMid meet');
  });

  it('renders a single node with no edges', () => {
    const el = ForceGraph3D({ nodes: [{ id: 'solo' }], edges: [] });
    expect(el).not.toBeNull();
    expect(el.type).toBe('svg');
  });

  it('renders with all default props', () => {
    const el = ForceGraph3D({ nodes: [{ id: 'x' }], edges: [] });
    expect(el).not.toBeNull();
  });
});

// ---------------------------------------------------------------------------
// Component rendering — sad path
// ---------------------------------------------------------------------------

describe('ForceGraph3D — sad path rendering', () => {
  it('handles empty nodes array', () => {
    const el = ForceGraph3D({ nodes: [], edges: [] });
    expect(el).not.toBeNull();
    expect(el.type).toBe('svg');
    expect(el.props['aria-label']).toBe('Empty 3D force-directed graph');
  });

  it('handles edges referencing missing nodes', () => {
    const el = ForceGraph3D({
      nodes: [{ id: 'a' }],
      edges: [{ source: 'a', target: 'missing' }],
    });
    expect(el).not.toBeNull();
  });

  it('handles edges with both endpoints missing', () => {
    const el = ForceGraph3D({
      nodes: [{ id: 'a' }],
      edges: [{ source: 'missing1', target: 'missing2' }],
    });
    expect(el).not.toBeNull();
  });

  it('handles nodes with explicit positions', () => {
    const nodes: ForceGraph3DNode[] = [
      { id: 'a', x: 0, y: 0, z: 0 },
      { id: 'b', x: 100, y: 100, z: 100 },
    ];
    const el = ForceGraph3D({ nodes, edges: [{ source: 'a', target: 'b' }] });
    expect(el).not.toBeNull();
  });

  it('handles zero camera distance gracefully', () => {
    const el = ForceGraph3D({
      nodes: sampleNodes,
      edges: sampleEdges,
      camera: { distance: 50 }, // minimum allowed
    });
    expect(el).not.toBeNull();
  });
});

// ---------------------------------------------------------------------------
// initSimNodes3D
// ---------------------------------------------------------------------------

describe('initSimNodes3D', () => {
  it('creates simulation nodes from input', () => {
    const result = initSimNodes3D(sampleNodes);
    expect(result.length).toBe(3);
    expect(result[0]!.id).toBe('a');
    expect(result[0]!.label).toBe('Node A');
    expect(result[0]!.vx).toBe(0);
    expect(result[0]!.vy).toBe(0);
    expect(result[0]!.vz).toBe(0);
  });

  it('uses provided positions when available', () => {
    const nodes: ForceGraph3DNode[] = [
      { id: 'a', x: 10, y: 20, z: 30 },
    ];
    const result = initSimNodes3D(nodes);
    expect(result[0]!.x).toBe(10);
    expect(result[0]!.y).toBe(20);
    expect(result[0]!.z).toBe(30);
  });

  it('generates positions when not provided', () => {
    const nodes: ForceGraph3DNode[] = [{ id: 'a' }];
    const result = initSimNodes3D(nodes);
    // Should have non-NaN values
    expect(Number.isFinite(result[0]!.x)).toBe(true);
    expect(Number.isFinite(result[0]!.y)).toBe(true);
    expect(Number.isFinite(result[0]!.z)).toBe(true);
  });

  it('uses default size when not provided', () => {
    const result = initSimNodes3D([{ id: 'a' }]);
    expect(result[0]!.size).toBe(5);
  });

  it('uses provided size', () => {
    const result = initSimNodes3D([{ id: 'a', size: 10 }]);
    expect(result[0]!.size).toBe(10);
  });

  it('uses default color when not provided', () => {
    const result = initSimNodes3D([{ id: 'a' }]);
    expect(result[0]!.color).toBe('#3b82f6');
  });

  it('uses provided color', () => {
    const result = initSimNodes3D([{ id: 'a', color: '#ff0000' }]);
    expect(result[0]!.color).toBe('#ff0000');
  });

  it('uses id as label when label not provided', () => {
    const result = initSimNodes3D([{ id: 'test-id' }]);
    expect(result[0]!.label).toBe('test-id');
  });

  it('uses provided data', () => {
    const result = initSimNodes3D([{ id: 'a', data: { foo: 'bar' } }]);
    expect(result[0]!.data).toEqual({ foo: 'bar' });
  });

  it('defaults data to empty object', () => {
    const result = initSimNodes3D([{ id: 'a' }]);
    expect(result[0]!.data).toEqual({});
  });

  it('handles empty array', () => {
    const result = initSimNodes3D([]);
    expect(result.length).toBe(0);
  });

  it('distributes multiple nodes at different positions', () => {
    const nodes: ForceGraph3DNode[] = [
      { id: 'a' }, { id: 'b' }, { id: 'c' },
    ];
    const result = initSimNodes3D(nodes);
    // All three should have distinct positions
    const posA = `${result[0]!.x},${result[0]!.y},${result[0]!.z}`;
    const posB = `${result[1]!.x},${result[1]!.y},${result[1]!.z}`;
    const posC = `${result[2]!.x},${result[2]!.y},${result[2]!.z}`;
    expect(posA).not.toBe(posB);
    expect(posB).not.toBe(posC);
  });

  it('cycles through default palette for colors', () => {
    const nodes: ForceGraph3DNode[] = [];
    for (let i = 0; i < 12; i++) {
      nodes.push({ id: `n${i}` });
    }
    const result = initSimNodes3D(nodes);
    // Index 0 and 10 should have the same color (palette wraps at 10)
    expect(result[0]!.color).toBe(result[10]!.color);
  });
});

// ---------------------------------------------------------------------------
// simulationTick3D
// ---------------------------------------------------------------------------

describe('simulationTick3D', () => {
  it('returns same number of nodes', () => {
    const sim = initSimNodes3D(sampleNodes);
    const result = simulationTick3D(sim, sampleEdges, -100, 0.01, 100, 0.9);
    expect(result.length).toBe(3);
  });

  it('nodes move after tick', () => {
    const sim = initSimNodes3D([
      { id: 'a', x: 0, y: 0, z: 0 },
      { id: 'b', x: 10, y: 0, z: 0 },
    ]);
    const result = simulationTick3D(sim, [], -100, 0.01, 100, 0.9);
    // Repulsion should push them apart
    expect(result[0]!.x).not.toBe(0);
    expect(result[1]!.x).not.toBe(10);
  });

  it('repulsion pushes nodes apart', () => {
    const sim = initSimNodes3D([
      { id: 'a', x: 0, y: 0, z: 0 },
      { id: 'b', x: 5, y: 0, z: 0 },
    ]);
    const result = simulationTick3D(sim, [], -100, 0.01, 100, 0.9);
    // Distance should increase
    const dxBefore = 5;
    const dxAfter = result[1]!.x - result[0]!.x;
    expect(Math.abs(dxAfter)).toBeGreaterThan(Math.abs(dxBefore));
  });

  it('spring attraction pulls connected nodes together', () => {
    const sim: ForceGraph3DSimNode[] = [
      { id: 'a', label: 'A', x: 0, y: 0, z: 0, vx: 0, vy: 0, vz: 0, size: 5, color: '#fff', data: {} },
      { id: 'b', label: 'B', x: 200, y: 0, z: 0, vx: 0, vy: 0, vz: 0, size: 5, color: '#fff', data: {} },
    ];
    const edges: ForceGraph3DEdge[] = [{ source: 'a', target: 'b' }];
    // Strong spring, weak repulsion, short ideal length
    const result = simulationTick3D(sim, edges, -1, 0.1, 50, 0.9);
    const distAfter = result[1]!.x - result[0]!.x;
    // Spring should pull them closer since they're 200 apart with ideal 50
    expect(distAfter).toBeLessThan(200);
  });

  it('handles empty nodes', () => {
    const result = simulationTick3D([], [], -100, 0.01, 100, 0.9);
    expect(result.length).toBe(0);
  });

  it('handles edges referencing missing nodes', () => {
    const sim = initSimNodes3D([{ id: 'a' }]);
    const edges: ForceGraph3DEdge[] = [{ source: 'a', target: 'missing' }];
    const result = simulationTick3D(sim, edges, -100, 0.01, 100, 0.9);
    expect(result.length).toBe(1);
  });

  it('damping reduces velocity over time', () => {
    const sim: ForceGraph3DSimNode[] = [
      { id: 'a', label: 'A', x: 0, y: 0, z: 0, vx: 5, vy: 5, vz: 5, size: 5, color: '#fff', data: {} },
    ];
    // High damping with no forces (single node, no edges, no repulsion)
    const result = simulationTick3D(sim, [], 0, 0, 100, 0.5);
    // velocity should be reduced by damping
    expect(Math.abs(result[0]!.vx)).toBeLessThan(5);
  });

  it('clamps velocity to max speed', () => {
    const sim: ForceGraph3DSimNode[] = [
      { id: 'a', label: 'A', x: 0, y: 0, z: 0, vx: 100, vy: 100, vz: 100, size: 5, color: '#fff', data: {} },
    ];
    const result = simulationTick3D(sim, [], 0, 0, 100, 1.0);
    const speed = Math.sqrt(
      result[0]!.vx * result[0]!.vx +
      result[0]!.vy * result[0]!.vy +
      result[0]!.vz * result[0]!.vz,
    );
    expect(speed).toBeLessThanOrEqual(10.01); // maxSpeed = 10, allow tiny fp error
  });

  it('center gravity pulls nodes toward origin', () => {
    const sim: ForceGraph3DSimNode[] = [
      { id: 'a', label: 'A', x: 1000, y: 0, z: 0, vx: 0, vy: 0, vz: 0, size: 5, color: '#fff', data: {} },
    ];
    const result = simulationTick3D(sim, [], 0, 0, 100, 0.9);
    // Should be pulled toward origin
    expect(result[0]!.x).toBeLessThan(1000);
  });

  it('handles nodes at the same position (overlap)', () => {
    const sim: ForceGraph3DSimNode[] = [
      { id: 'a', label: 'A', x: 0, y: 0, z: 0, vx: 0, vy: 0, vz: 0, size: 5, color: '#fff', data: {} },
      { id: 'b', label: 'B', x: 0, y: 0, z: 0, vx: 0, vy: 0, vz: 0, size: 5, color: '#fff', data: {} },
    ];
    // Should not throw — distSq clamped to 1
    const result = simulationTick3D(sim, [], -100, 0.01, 100, 0.9);
    expect(result.length).toBe(2);
  });

  it('handles very close nodes (near zero distance)', () => {
    const sim: ForceGraph3DSimNode[] = [
      { id: 'a', label: 'A', x: 0, y: 0, z: 0, vx: 0, vy: 0, vz: 0, size: 5, color: '#fff', data: {} },
      { id: 'b', label: 'B', x: 0.001, y: 0, z: 0, vx: 0, vy: 0, vz: 0, size: 5, color: '#fff', data: {} },
    ];
    const result = simulationTick3D(sim, [], -100, 0.01, 100, 0.9);
    expect(result.length).toBe(2);
    expect(Number.isFinite(result[0]!.x)).toBe(true);
    expect(Number.isFinite(result[1]!.x)).toBe(true);
  });

  it('spring handles zero-distance edge gracefully', () => {
    const sim: ForceGraph3DSimNode[] = [
      { id: 'a', label: 'A', x: 0, y: 0, z: 0, vx: 0, vy: 0, vz: 0, size: 5, color: '#fff', data: {} },
      { id: 'b', label: 'B', x: 0, y: 0, z: 0, vx: 0, vy: 0, vz: 0, size: 5, color: '#fff', data: {} },
    ];
    const edges: ForceGraph3DEdge[] = [{ source: 'a', target: 'b' }];
    const result = simulationTick3D(sim, edges, -100, 0.01, 100, 0.9);
    expect(result.length).toBe(2);
  });

  it('preserves node metadata through tick', () => {
    const sim: ForceGraph3DSimNode[] = [
      { id: 'a', label: 'Alpha', x: 0, y: 0, z: 0, vx: 0, vy: 0, vz: 0, size: 8, color: '#ff0000', data: { key: 'value' } },
    ];
    const result = simulationTick3D(sim, [], 0, 0, 100, 0.9);
    expect(result[0]!.id).toBe('a');
    expect(result[0]!.label).toBe('Alpha');
    expect(result[0]!.size).toBe(8);
    expect(result[0]!.color).toBe('#ff0000');
    expect(result[0]!.data).toEqual({ key: 'value' });
  });
});

// ---------------------------------------------------------------------------
// kineticEnergy3D
// ---------------------------------------------------------------------------

describe('kineticEnergy3D', () => {
  it('returns 0 for stationary nodes', () => {
    const nodes: ForceGraph3DSimNode[] = [
      { id: 'a', label: 'A', x: 0, y: 0, z: 0, vx: 0, vy: 0, vz: 0, size: 5, color: '#fff', data: {} },
    ];
    expect(kineticEnergy3D(nodes)).toBe(0);
  });

  it('returns positive value for moving nodes', () => {
    const nodes: ForceGraph3DSimNode[] = [
      { id: 'a', label: 'A', x: 0, y: 0, z: 0, vx: 3, vy: 4, vz: 0, size: 5, color: '#fff', data: {} },
    ];
    expect(kineticEnergy3D(nodes)).toBe(25); // 9 + 16
  });

  it('sums energy across all nodes', () => {
    const nodes: ForceGraph3DSimNode[] = [
      { id: 'a', label: 'A', x: 0, y: 0, z: 0, vx: 1, vy: 0, vz: 0, size: 5, color: '#fff', data: {} },
      { id: 'b', label: 'B', x: 0, y: 0, z: 0, vx: 0, vy: 1, vz: 0, size: 5, color: '#fff', data: {} },
    ];
    expect(kineticEnergy3D(nodes)).toBe(2);
  });

  it('returns 0 for empty array', () => {
    expect(kineticEnergy3D([])).toBe(0);
  });

  it('includes z velocity', () => {
    const nodes: ForceGraph3DSimNode[] = [
      { id: 'a', label: 'A', x: 0, y: 0, z: 0, vx: 0, vy: 0, vz: 5, size: 5, color: '#fff', data: {} },
    ];
    expect(kineticEnergy3D(nodes)).toBe(25);
  });
});

// ---------------------------------------------------------------------------
// cameraPosition
// ---------------------------------------------------------------------------

describe('cameraPosition', () => {
  it('returns correct position for azimuth 0, elevation 0', () => {
    const pos = cameraPosition({ azimuth: 0, elevation: 0, distance: 100 });
    expect(Math.abs(pos.x)).toBeLessThan(0.001);
    expect(Math.abs(pos.y)).toBeLessThan(0.001);
    expect(Math.abs(pos.z - 100)).toBeLessThan(0.001);
  });

  it('returns correct position for azimuth PI/2, elevation 0', () => {
    const pos = cameraPosition({ azimuth: Math.PI / 2, elevation: 0, distance: 100 });
    expect(Math.abs(pos.x - 100)).toBeLessThan(0.001);
    expect(Math.abs(pos.y)).toBeLessThan(0.001);
    expect(Math.abs(pos.z)).toBeLessThan(0.001);
  });

  it('returns correct position for elevation PI/2', () => {
    const pos = cameraPosition({ azimuth: 0, elevation: Math.PI / 2, distance: 100 });
    expect(Math.abs(pos.y - 100)).toBeLessThan(0.001);
  });

  it('respects distance parameter', () => {
    const pos1 = cameraPosition({ azimuth: 0.5, elevation: 0.3, distance: 100 });
    const pos2 = cameraPosition({ azimuth: 0.5, elevation: 0.3, distance: 200 });
    const dist1 = Math.sqrt(pos1.x * pos1.x + pos1.y * pos1.y + pos1.z * pos1.z);
    const dist2 = Math.sqrt(pos2.x * pos2.x + pos2.y * pos2.y + pos2.z * pos2.z);
    expect(Math.abs(dist1 - 100)).toBeLessThan(0.001);
    expect(Math.abs(dist2 - 200)).toBeLessThan(0.001);
  });

  it('returns zero distance when distance is 0', () => {
    const pos = cameraPosition({ azimuth: 1, elevation: 1, distance: 0 });
    expect(Math.abs(pos.x)).toBeLessThan(0.001);
    expect(Math.abs(pos.y)).toBeLessThan(0.001);
    expect(Math.abs(pos.z)).toBeLessThan(0.001);
  });
});

// ---------------------------------------------------------------------------
// projectPoint
// ---------------------------------------------------------------------------

describe('projectPoint', () => {
  it('projects point in front of camera', () => {
    // Camera at (0, 0, 300), looking at origin
    const camPos = { x: 0, y: 0, z: 300 };
    const result = projectPoint(0, 0, 0, camPos, 0, 0, 600, 400, 1.5);
    expect(result).not.toBeNull();
    // Origin should project to center of screen
    expect(Math.abs(result!.sx - 300)).toBeLessThan(1);
    expect(Math.abs(result!.sy - 200)).toBeLessThan(1);
  });

  it('returns null for points behind camera', () => {
    const camPos = { x: 0, y: 0, z: 300 };
    // Point at z=500, which is behind the camera (camera at z=300 looking toward origin)
    const result = projectPoint(0, 0, 500, camPos, 0, 0, 600, 400, 1.5);
    expect(result).toBeNull();
  });

  it('projects point to the right of center for positive x', () => {
    const camPos = { x: 0, y: 0, z: 300 };
    const center = projectPoint(0, 0, 0, camPos, 0, 0, 600, 400, 1.5);
    const right = projectPoint(50, 0, 0, camPos, 0, 0, 600, 400, 1.5);
    expect(center).not.toBeNull();
    expect(right).not.toBeNull();
    expect(right!.sx).toBeGreaterThan(center!.sx);
  });

  it('projects point above center for positive y', () => {
    const camPos = { x: 0, y: 0, z: 300 };
    const center = projectPoint(0, 0, 0, camPos, 0, 0, 600, 400, 1.5);
    const above = projectPoint(0, 50, 0, camPos, 0, 0, 600, 400, 1.5);
    expect(center).not.toBeNull();
    expect(above).not.toBeNull();
    // Screen Y is flipped, so positive y should give smaller sy
    expect(above!.sy).toBeLessThan(center!.sy);
  });

  it('depth increases for further points', () => {
    const camPos = { x: 0, y: 0, z: 300 };
    const near = projectPoint(0, 0, 100, camPos, 0, 0, 600, 400, 1.5);
    const far = projectPoint(0, 0, -100, camPos, 0, 0, 600, 400, 1.5);
    expect(near).not.toBeNull();
    expect(far).not.toBeNull();
    expect(far!.depth).toBeGreaterThan(near!.depth);
  });

  it('handles rotated camera via azimuth', () => {
    // Camera rotated 90 degrees, should see from the side
    const camPos = cameraPosition({ azimuth: Math.PI / 2, elevation: 0, distance: 300 });
    const result = projectPoint(0, 0, 0, camPos, Math.PI / 2, 0, 600, 400, 1.5);
    expect(result).not.toBeNull();
  });

  it('handles rotated camera via elevation', () => {
    const camPos = cameraPosition({ azimuth: 0, elevation: Math.PI / 4, distance: 300 });
    const result = projectPoint(0, 0, 0, camPos, 0, Math.PI / 4, 600, 400, 1.5);
    expect(result).not.toBeNull();
  });

  it('handles camera looking straight down (fallback right vector)', () => {
    // Camera directly above, looking straight down
    const camPos = { x: 0, y: 300, z: 0 };
    const result = projectPoint(0, 0, 0, camPos, 0, Math.PI / 2, 600, 400, 1.5);
    expect(result).not.toBeNull();
    expect(result!.depth).toBeGreaterThan(0);
  });

  it('returns null when camera is at origin (zero distance)', () => {
    const camPos = { x: 0, y: 0, z: 0 };
    const result = projectPoint(10, 10, 10, camPos, 0, 0, 600, 400, 1.5);
    expect(result).toBeNull();
  });

  it('point at camera position returns null (behind camera)', () => {
    const camPos = { x: 0, y: 0, z: 300 };
    const result = projectPoint(0, 0, 300, camPos, 0, 0, 600, 400, 1.5);
    expect(result).toBeNull();
  });

  it('returns correct depth ordering', () => {
    const camPos = { x: 0, y: 0, z: 300 };
    const near = projectPoint(0, 0, 200, camPos, 0, 0, 600, 400, 1.5);
    const far = projectPoint(0, 0, 0, camPos, 0, 0, 600, 400, 1.5);
    expect(near).not.toBeNull();
    expect(far).not.toBeNull();
    expect(far!.depth).toBeGreaterThan(near!.depth);
  });
});

// ---------------------------------------------------------------------------
// Component event handlers
// ---------------------------------------------------------------------------

describe('ForceGraph3D — event handlers', () => {
  it('has onMouseDown handler', () => {
    const el = ForceGraph3D({ nodes: sampleNodes, edges: sampleEdges });
    expect(typeof el.props.onMouseDown).toBe('function');
  });

  it('has onMouseMove handler', () => {
    const el = ForceGraph3D({ nodes: sampleNodes, edges: sampleEdges });
    expect(typeof el.props.onMouseMove).toBe('function');
  });

  it('has onMouseUp handler', () => {
    const el = ForceGraph3D({ nodes: sampleNodes, edges: sampleEdges });
    expect(typeof el.props.onMouseUp).toBe('function');
  });

  it('has onMouseLeave handler', () => {
    const el = ForceGraph3D({ nodes: sampleNodes, edges: sampleEdges });
    expect(typeof el.props.onMouseLeave).toBe('function');
  });

  it('has onWheel handler for zoom', () => {
    const el = ForceGraph3D({ nodes: sampleNodes, edges: sampleEdges });
    expect(typeof el.props.onWheel).toBe('function');
  });

  it('has onClick handler', () => {
    const el = ForceGraph3D({ nodes: sampleNodes, edges: sampleEdges });
    expect(typeof el.props.onClick).toBe('function');
  });

  it('sets grab cursor style', () => {
    const el = ForceGraph3D({ nodes: sampleNodes, edges: sampleEdges });
    expect(el.props.style.cursor).toBe('grab');
  });

  it('sets userSelect to none', () => {
    const el = ForceGraph3D({ nodes: sampleNodes, edges: sampleEdges });
    expect(el.props.style.userSelect).toBe('none');
  });
});

// ---------------------------------------------------------------------------
// Simulation convergence
// ---------------------------------------------------------------------------

describe('ForceGraph3D — simulation convergence', () => {
  it('simulation converges over many ticks', () => {
    let sim = initSimNodes3D(sampleNodes);
    for (let i = 0; i < 500; i++) {
      sim = simulationTick3D(sim, sampleEdges, -100, 0.01, 100, 0.9);
    }
    const energy = kineticEnergy3D(sim);
    expect(energy).toBeLessThan(1);
  });

  it('single node simulation has low energy', () => {
    let sim = initSimNodes3D([{ id: 'solo' }]);
    // Single node with only center gravity — converges slowly
    for (let i = 0; i < 500; i++) {
      sim = simulationTick3D(sim, [], -100, 0.01, 100, 0.9);
    }
    const energy = kineticEnergy3D(sim);
    expect(energy).toBeLessThan(0.1);
  });
});

// ---------------------------------------------------------------------------
// Edge cases and export verification
// ---------------------------------------------------------------------------

describe('ForceGraph3D — exports', () => {
  it('exports ForceGraph3D from index', async () => {
    const mod = await import('../src/index');
    expect(typeof mod.ForceGraph3D).toBe('function');
  });
});
