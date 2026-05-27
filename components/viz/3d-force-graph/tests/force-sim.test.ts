// (c) 2025-2026 Asymmetric Effort, LLC. MIT LICENSE
// SPDX-License-Identifier: MIT

import { describe, it, expect } from '@asymmetric-effort/nogginlessdom';
import type { SimNode, SimEdge, SimConfig } from '../src/force-sim';
import { stepSimulation, computeKineticEnergy } from '../src/force-sim';

// ---- Test helpers -----------------------------------------------------------

function makeNode(id: string, pos: { x: number; y: number; z: number }, opts?: Partial<SimNode>): SimNode {
  return {
    id,
    position: { x: pos.x, y: pos.y, z: pos.z },
    velocity: { x: 0, y: 0, z: 0 },
    mass: opts?.mass ?? 1.0,
    fixed: opts?.fixed ?? false,
    ...opts,
    // Ensure position/velocity are always fresh objects
  };
}

function makeConfig(overrides?: Partial<SimConfig>): SimConfig {
  return {
    repulsionStrength: 100,
    attractionStrength: 0.1,
    damping: 0.9,
    centerGravity: 0.01,
    timeStep: 0.016,
    bounds: {
      min: { x: -50, y: -50, z: -50 },
      max: { x: 50, y: 50, z: 50 },
    },
    ...overrides,
  };
}

function toMap(nodes: SimNode[]): Map<string, SimNode> {
  const m = new Map<string, SimNode>();
  for (const n of nodes) m.set(n.id, n);
  return m;
}

function dist3(a: { x: number; y: number; z: number }, b: { x: number; y: number; z: number }): number {
  const dx = a.x - b.x;
  const dy = a.y - b.y;
  const dz = a.z - b.z;
  return Math.sqrt(dx * dx + dy * dy + dz * dz);
}

// ---------------------------------------------------------------------------
// Happy path
// ---------------------------------------------------------------------------

describe('stepSimulation — happy path', () => {
  it('repulsion: two nodes move apart', () => {
    const a = makeNode('a', { x: -1, y: 0, z: 0 });
    const b = makeNode('b', { x: 1, y: 0, z: 0 });
    const nodes = toMap([a, b]);
    const distBefore = dist3(a.position, b.position);

    stepSimulation(nodes, [], makeConfig());

    const distAfter = dist3(nodes.get('a')!.position, nodes.get('b')!.position);
    expect(distAfter).toBeGreaterThan(distBefore);
  });

  it('attraction: connected nodes move together toward rest length', () => {
    const a = makeNode('a', { x: -20, y: 0, z: 0 });
    const b = makeNode('b', { x: 20, y: 0, z: 0 });
    const nodes = toMap([a, b]);
    const edges: SimEdge[] = [{
      source: 'a', target: 'b', restLength: 5, stiffness: 1.0,
    }];

    // Run multiple steps with strong attraction, weak repulsion
    const config = makeConfig({
      repulsionStrength: 0.01,
      attractionStrength: 1.0,
    });

    const distBefore = dist3(a.position, b.position);
    for (let i = 0; i < 10; i++) {
      stepSimulation(nodes, edges, config);
    }
    const distAfter = dist3(nodes.get('a')!.position, nodes.get('b')!.position);
    expect(distAfter).toBeLessThan(distBefore);
  });

  it('center gravity: isolated node drifts toward origin', () => {
    const a = makeNode('a', { x: 30, y: 0, z: 0 });
    const nodes = toMap([a]);
    const config = makeConfig({ centerGravity: 0.1, repulsionStrength: 0 });

    stepSimulation(nodes, [], config);

    expect(nodes.get('a')!.position.x).toBeLessThan(30);
  });

  it('damping: velocity decreases each step', () => {
    const a: SimNode = {
      id: 'a',
      position: { x: 0, y: 0, z: 0 },
      velocity: { x: 10, y: 10, z: 10 },
      mass: 1,
      fixed: false,
    };
    const nodes = toMap([a]);
    const config = makeConfig({
      repulsionStrength: 0,
      attractionStrength: 0,
      centerGravity: 0,
      damping: 0.5,
    });

    stepSimulation(nodes, [], config);

    const n = nodes.get('a')!;
    expect(Math.abs(n.velocity.x)).toBeLessThan(10);
    expect(Math.abs(n.velocity.y)).toBeLessThan(10);
    expect(Math.abs(n.velocity.z)).toBeLessThan(10);
  });

  it('fixed nodes: position does not change', () => {
    const a = makeNode('a', { x: 5, y: 5, z: 5 }, { fixed: true });
    const b = makeNode('b', { x: -5, y: -5, z: -5 });
    const nodes = toMap([a, b]);

    stepSimulation(nodes, [], makeConfig());

    const n = nodes.get('a')!;
    expect(n.position.x).toBe(5);
    expect(n.position.y).toBe(5);
    expect(n.position.z).toBe(5);
  });

  it('convergence: kinetic energy decreases over many steps', () => {
    const a = makeNode('a', { x: -5, y: 0, z: 0 });
    const b = makeNode('b', { x: 5, y: 0, z: 0 });
    const c = makeNode('c', { x: 0, y: 5, z: 0 });
    const nodes = toMap([a, b, c]);
    const edges: SimEdge[] = [
      { source: 'a', target: 'b', restLength: 10, stiffness: 0.1 },
      { source: 'b', target: 'c', restLength: 10, stiffness: 0.1 },
    ];
    const config = makeConfig();

    // Run 500 steps
    for (let i = 0; i < 500; i++) {
      stepSimulation(nodes, edges, config);
    }

    const energy = computeKineticEnergy(nodes);
    expect(energy).toBeLessThan(1);
  });

  it('boundary clamping: nodes stay within bounds', () => {
    const a: SimNode = {
      id: 'a',
      position: { x: 49, y: 0, z: 0 },
      velocity: { x: 50, y: 0, z: 0 },
      mass: 1,
      fixed: false,
    };
    const nodes = toMap([a]);
    const config = makeConfig({
      repulsionStrength: 0,
      attractionStrength: 0,
      centerGravity: 0,
      damping: 1.0, // no damping
      bounds: {
        min: { x: -50, y: -50, z: -50 },
        max: { x: 50, y: 50, z: 50 },
      },
    });

    stepSimulation(nodes, [], config);

    const n = nodes.get('a')!;
    expect(n.position.x).toBeLessThanOrEqual(50);
    expect(n.position.x).toBeGreaterThanOrEqual(-50);
  });
});

// ---------------------------------------------------------------------------
// Sad path
// ---------------------------------------------------------------------------

describe('stepSimulation — sad path', () => {
  it('empty nodes map: no error', () => {
    const nodes = new Map<string, SimNode>();
    expect(() => stepSimulation(nodes, [], makeConfig())).not.toThrow();
  });

  it('single node, no edges: no forces except gravity', () => {
    const a = makeNode('a', { x: 10, y: 0, z: 0 });
    const nodes = toMap([a]);
    const config = makeConfig({ repulsionStrength: 0, centerGravity: 0 });

    stepSimulation(nodes, [], config);

    // No forces applied, only damping on zero velocity
    const n = nodes.get('a')!;
    expect(Number.isFinite(n.position.x)).toBe(true);
  });

  it('self-loop edge: ignored', () => {
    const a = makeNode('a', { x: 0, y: 0, z: 0 });
    const nodes = toMap([a]);
    const edges: SimEdge[] = [
      { source: 'a', target: 'a', restLength: 5, stiffness: 0.1 },
    ];

    expect(() => stepSimulation(nodes, edges, makeConfig())).not.toThrow();
  });

  it('zero mass: handled (clamped to minimum)', () => {
    const a = makeNode('a', { x: 0, y: 0, z: 0 }, { mass: 0 });
    const b = makeNode('b', { x: 5, y: 0, z: 0 }, { mass: 0 });
    const nodes = toMap([a, b]);

    expect(() => stepSimulation(nodes, [], makeConfig())).not.toThrow();

    // Positions should be finite (no NaN/Infinity)
    expect(Number.isFinite(nodes.get('a')!.position.x)).toBe(true);
    expect(Number.isFinite(nodes.get('b')!.position.x)).toBe(true);
  });

  it('negative mass: handled (clamped to minimum)', () => {
    const a = makeNode('a', { x: 0, y: 0, z: 0 }, { mass: -5 });
    const b = makeNode('b', { x: 5, y: 0, z: 0 });
    const nodes = toMap([a, b]);

    expect(() => stepSimulation(nodes, [], makeConfig())).not.toThrow();
    expect(Number.isFinite(nodes.get('a')!.position.x)).toBe(true);
  });

  it('nodes at same position: repulsion uses small epsilon offset', () => {
    const a = makeNode('a', { x: 0, y: 0, z: 0 });
    const b = makeNode('b', { x: 0, y: 0, z: 0 });
    const nodes = toMap([a, b]);

    expect(() => stepSimulation(nodes, [], makeConfig())).not.toThrow();

    // Nodes should have moved apart
    const na = nodes.get('a')!;
    const nb = nodes.get('b')!;
    expect(Number.isFinite(na.position.x)).toBe(true);
    expect(Number.isFinite(nb.position.x)).toBe(true);
    const d = dist3(na.position, nb.position);
    expect(d).toBeGreaterThan(0);
  });

  it('very large repulsion: velocities clamped', () => {
    const a = makeNode('a', { x: -0.1, y: 0, z: 0 });
    const b = makeNode('b', { x: 0.1, y: 0, z: 0 });
    const nodes = toMap([a, b]);
    const config = makeConfig({ repulsionStrength: 1e10 });

    stepSimulation(nodes, [], config);

    // Velocities should be clamped to MAX_VELOCITY (50)
    const na = nodes.get('a')!;
    const speed = Math.sqrt(
      na.velocity.x * na.velocity.x
      + na.velocity.y * na.velocity.y
      + na.velocity.z * na.velocity.z,
    );
    expect(speed).toBeLessThanOrEqual(50 * Math.sqrt(3) + 0.01);
    expect(Number.isFinite(na.position.x)).toBe(true);
  });

  it('edge with nonexistent source: no error', () => {
    const a = makeNode('a', { x: 0, y: 0, z: 0 });
    const nodes = toMap([a]);
    const edges: SimEdge[] = [
      { source: 'missing', target: 'a', restLength: 5, stiffness: 0.1 },
    ];

    expect(() => stepSimulation(nodes, edges, makeConfig())).not.toThrow();
  });

  it('edge with nonexistent target: no error', () => {
    const a = makeNode('a', { x: 0, y: 0, z: 0 });
    const nodes = toMap([a]);
    const edges: SimEdge[] = [
      { source: 'a', target: 'missing', restLength: 5, stiffness: 0.1 },
    ];

    expect(() => stepSimulation(nodes, edges, makeConfig())).not.toThrow();
  });

  it('very large graph (100+ nodes): does not crash', () => {
    const nodeList: SimNode[] = [];
    for (let i = 0; i < 120; i++) {
      nodeList.push(makeNode(`n${i}`, {
        x: (Math.random() - 0.5) * 40,
        y: (Math.random() - 0.5) * 40,
        z: (Math.random() - 0.5) * 40,
      }));
    }
    const edges: SimEdge[] = [];
    for (let i = 0; i < 100; i++) {
      edges.push({
        source: `n${i}`,
        target: `n${i + 1}`,
        restLength: 5,
        stiffness: 0.1,
      });
    }
    const nodes = toMap(nodeList);

    expect(() => {
      for (let step = 0; step < 5; step++) {
        stepSimulation(nodes, edges, makeConfig());
      }
    }).not.toThrow();
  });
});

// ---------------------------------------------------------------------------
// computeKineticEnergy
// ---------------------------------------------------------------------------

describe('computeKineticEnergy', () => {
  it('returns 0 for empty map', () => {
    expect(computeKineticEnergy(new Map())).toBe(0);
  });

  it('returns 0 for stationary nodes', () => {
    const nodes = toMap([makeNode('a', { x: 0, y: 0, z: 0 })]);
    expect(computeKineticEnergy(nodes)).toBe(0);
  });

  it('returns positive value for moving nodes', () => {
    const a: SimNode = {
      id: 'a',
      position: { x: 0, y: 0, z: 0 },
      velocity: { x: 3, y: 4, z: 0 },
      mass: 1,
      fixed: false,
    };
    const nodes = toMap([a]);
    // KE = 0.5 * m * v^2 = 0.5 * 1 * (9+16) = 12.5
    expect(computeKineticEnergy(nodes)).toBeCloseTo(12.5, 5);
  });

  it('sums energy across all nodes', () => {
    const a: SimNode = {
      id: 'a',
      position: { x: 0, y: 0, z: 0 },
      velocity: { x: 1, y: 0, z: 0 },
      mass: 2,
      fixed: false,
    };
    const b: SimNode = {
      id: 'b',
      position: { x: 0, y: 0, z: 0 },
      velocity: { x: 0, y: 1, z: 0 },
      mass: 2,
      fixed: false,
    };
    const nodes = toMap([a, b]);
    // KE = 0.5*2*1 + 0.5*2*1 = 2
    expect(computeKineticEnergy(nodes)).toBeCloseTo(2, 5);
  });

  it('accounts for mass in kinetic energy', () => {
    const a: SimNode = {
      id: 'a',
      position: { x: 0, y: 0, z: 0 },
      velocity: { x: 1, y: 0, z: 0 },
      mass: 10,
      fixed: false,
    };
    const nodes = toMap([a]);
    // KE = 0.5 * 10 * 1 = 5
    expect(computeKineticEnergy(nodes)).toBeCloseTo(5, 5);
  });

  it('includes z velocity in energy', () => {
    const a: SimNode = {
      id: 'a',
      position: { x: 0, y: 0, z: 0 },
      velocity: { x: 0, y: 0, z: 5 },
      mass: 1,
      fixed: false,
    };
    const nodes = toMap([a]);
    // KE = 0.5 * 1 * 25 = 12.5
    expect(computeKineticEnergy(nodes)).toBeCloseTo(12.5, 5);
  });

  it('clamps zero mass to minimum for energy calc', () => {
    const a: SimNode = {
      id: 'a',
      position: { x: 0, y: 0, z: 0 },
      velocity: { x: 1, y: 0, z: 0 },
      mass: 0,
      fixed: false,
    };
    const nodes = toMap([a]);
    const energy = computeKineticEnergy(nodes);
    expect(energy).toBeGreaterThan(0);
    expect(Number.isFinite(energy)).toBe(true);
  });
});
