// @vitest-environment node
// (c) 2025-2026 Asymmetric Effort, LLC. MIT LICENSE
// SPDX-License-Identifier: MIT

import { describe, it, expect } from '@asymmetric-effort/nogginlessdom';
import { stepSimulation } from '../src/force-sim';
import type { SimNode, SimEdge, SimConfig } from '../src/force-sim';

/** Create a default SimConfig with collision enabled. */
function collisionConfig(overrides?: Partial<SimConfig>): SimConfig {
  return {
    repulsionStrength: 0,
    attractionStrength: 0,
    damping: 1, // no damping for predictable tests
    centerGravity: 0,
    timeStep: 1,
    bounds: { min: { x: -100, y: -100, z: -100 }, max: { x: 100, y: 100, z: 100 } },
    collisionEnabled: true,
    restitution: 1, // perfectly elastic
    ...overrides,
  };
}

/** Create a SimNode with collision radius. */
function makeNode(id: string, pos: { x: number; y: number; z: number }, vel: { x: number; y: number; z: number }, opts?: { mass?: number; fixed?: boolean; collisionRadius?: number }): SimNode {
  return {
    id,
    position: { ...pos },
    velocity: { ...vel },
    mass: opts?.mass ?? 1,
    fixed: opts?.fixed ?? false,
    collisionRadius: opts?.collisionRadius ?? 1,
  };
}

describe('force-sim collision detection', () => {
  it('separates overlapping nodes', () => {
    const nodes = new Map<string, SimNode>();
    nodes.set('a', makeNode('a', { x: 0, y: 0, z: 0 }, { x: 0, y: 0, z: 0 }));
    nodes.set('b', makeNode('b', { x: 0.5, y: 0, z: 0 }, { x: 0, y: 0, z: 0 }));
    // radius 1 + 1 = 2, but distance = 0.5, so they overlap

    stepSimulation(nodes, [], collisionConfig());

    const a = nodes.get('a')!;
    const b = nodes.get('b')!;
    const dx = b.position.x - a.position.x;
    const dy = b.position.y - a.position.y;
    const dz = b.position.z - a.position.z;
    const dist = Math.sqrt(dx * dx + dy * dy + dz * dz);
    // After collision resolution, nodes should be at least 2 apart (r1 + r2)
    expect(dist).toBeGreaterThanOrEqual(1.9);
  });

  it('bounces two nodes approaching head-on', () => {
    const nodes = new Map<string, SimNode>();
    // Start already overlapping with opposing velocities
    nodes.set('a', makeNode('a', { x: -0.5, y: 0, z: 0 }, { x: 5, y: 0, z: 0 }));
    nodes.set('b', makeNode('b', { x: 0.5, y: 0, z: 0 }, { x: -5, y: 0, z: 0 }));

    stepSimulation(nodes, [], collisionConfig({ timeStep: 0.001 }));

    const a = nodes.get('a')!;
    const b = nodes.get('b')!;
    // After elastic collision with equal masses, velocities swap
    expect(a.velocity.x).toBeLessThan(0);
    expect(b.velocity.x).toBeGreaterThan(0);
  });

  it('fixed nodes do not move on collision', () => {
    const nodes = new Map<string, SimNode>();
    nodes.set('fixed', makeNode('fixed', { x: 0, y: 0, z: 0 }, { x: 0, y: 0, z: 0 }, { fixed: true }));
    nodes.set('moving', makeNode('moving', { x: 1.5, y: 0, z: 0 }, { x: -5, y: 0, z: 0 }));

    stepSimulation(nodes, [], collisionConfig());

    const fixed = nodes.get('fixed')!;
    expect(fixed.position.x).toBe(0);
    expect(fixed.position.y).toBe(0);
    expect(fixed.position.z).toBe(0);
  });

  it('mass ratio affects post-collision velocities', () => {
    const nodes = new Map<string, SimNode>();
    // Already overlapping
    nodes.set('heavy', makeNode('heavy', { x: -0.5, y: 0, z: 0 }, { x: 2, y: 0, z: 0 }, { mass: 10 }));
    nodes.set('light', makeNode('light', { x: 0.5, y: 0, z: 0 }, { x: -2, y: 0, z: 0 }, { mass: 1 }));

    stepSimulation(nodes, [], collisionConfig({ timeStep: 0.001 }));

    const heavy = nodes.get('heavy')!;
    const light = nodes.get('light')!;
    // Heavy object should barely change velocity
    // Light object should bounce off hard
    expect(Math.abs(light.velocity.x)).toBeGreaterThan(Math.abs(heavy.velocity.x));
  });

  it('collision disabled skips detection', () => {
    const nodes = new Map<string, SimNode>();
    nodes.set('a', makeNode('a', { x: 0, y: 0, z: 0 }, { x: 0, y: 0, z: 0 }));
    nodes.set('b', makeNode('b', { x: 0.5, y: 0, z: 0 }, { x: 0, y: 0, z: 0 }));

    const config = collisionConfig({ collisionEnabled: false });
    stepSimulation(nodes, [], config);

    // Nodes should remain overlapping since collision is disabled
    const a = nodes.get('a')!;
    const b = nodes.get('b')!;
    const dx = b.position.x - a.position.x;
    // Without collision, only forces (which are all 0) affect positions
    // They should stay roughly where they were
    expect(Math.abs(dx)).toBeLessThan(2);
  });

  it('restitution of 0 results in inelastic collision (no bounce)', () => {
    const nodes = new Map<string, SimNode>();
    // Already overlapping
    nodes.set('a', makeNode('a', { x: -0.5, y: 0, z: 0 }, { x: 5, y: 0, z: 0 }));
    nodes.set('b', makeNode('b', { x: 0.5, y: 0, z: 0 }, { x: -5, y: 0, z: 0 }));

    stepSimulation(nodes, [], collisionConfig({ restitution: 0, timeStep: 0.001 }));

    const a = nodes.get('a')!;
    const b = nodes.get('b')!;
    // With restitution=0 and equal masses, both should have ~0 relative velocity along collision normal
    const relVel = b.velocity.x - a.velocity.x;
    expect(Math.abs(relVel)).toBeLessThan(1);
  });

  it('handles 3D collision (not just x-axis)', () => {
    const nodes = new Map<string, SimNode>();
    // Already overlapping on Y axis
    nodes.set('a', makeNode('a', { x: 0, y: -0.5, z: 0 }, { x: 0, y: 3, z: 0 }));
    nodes.set('b', makeNode('b', { x: 0, y: 0.5, z: 0 }, { x: 0, y: -3, z: 0 }));

    stepSimulation(nodes, [], collisionConfig({ timeStep: 0.001 }));

    const a = nodes.get('a')!;
    const b = nodes.get('b')!;
    // After elastic collision, y velocities should reverse
    expect(a.velocity.y).toBeLessThan(0);
    expect(b.velocity.y).toBeGreaterThan(0);
  });

  it('nodes with different collision radii interact correctly', () => {
    const nodes = new Map<string, SimNode>();
    nodes.set('big', makeNode('big', { x: 0, y: 0, z: 0 }, { x: 0, y: 0, z: 0 }, { collisionRadius: 3 }));
    nodes.set('small', makeNode('small', { x: 2, y: 0, z: 0 }, { x: 0, y: 0, z: 0 }, { collisionRadius: 1 }));
    // r1 + r2 = 4, dist = 2, so they overlap

    stepSimulation(nodes, [], collisionConfig());

    const big = nodes.get('big')!;
    const small = nodes.get('small')!;
    const dx = small.position.x - big.position.x;
    const dist = Math.abs(dx);
    expect(dist).toBeGreaterThanOrEqual(3.9); // should be pushed to r1 + r2 = 4
  });
});
