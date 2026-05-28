// @vitest-environment node
// (c) 2025-2026 Asymmetric Effort, LLC. MIT LICENSE
// SPDX-License-Identifier: MIT

/**
 * Integration tests for the ForceGraph3D component.
 *
 * Tests the component's helper functions, collision config propagation,
 * raycasting pick pipeline, boundingRadius on created nodes, and
 * event handler type contracts. Does NOT require the SpecifyJS runtime
 * (no mock-dispatcher, no createElement) — tests pure exported functions
 * and type contracts directly.
 */

import { describe, it, expect } from '@asymmetric-effort/nogginlessdom';

// NOTE: We cannot import from ForceGraph3D.ts directly because it imports
// 'specifyjs' which is only resolvable via the core/ preload. Instead we
// test the helper functions by calling the underlying engine APIs directly.
import type { ForceGraph3DNode, ForceGraph3DEdge, ForceGraph3DProps } from '../src/types';
import type { SimConfig, SimNode } from '../src/force-sim';
import { stepSimulation, computeKineticEnergy } from '../src/force-sim';
import { SceneObject } from '../../3dSpace/src/scene-object';
import { Mesh } from '../../3dSpace/src/mesh';
import { createGeomSphere } from '../../3dSpace/src/geom-sphere';
import { createGeomPolyhedron, cubeGeometry, octahedronGeometry } from '../../3dSpace/src/geom-polyhedron';
import { raySphereIntersect, rayAABBIntersect, rayCylinderIntersect, screenToRay, pickObjects, RaycastPicker } from '../../3dSpace/src/raycast';
import type { Ray } from '../../3dSpace/src/raycast';
import { createMaterial } from '../../3dSpace/src/material';
import { mat4Multiply, mat4Perspective, mat4LookAt } from '../../../math/src/mat4';
import { vec3 } from '../../../math/src/vec';

// Helper: create a node SceneObject the same way ForceGraph3D does internally
function createTestNode(id: string, size: number, pos: { x: number; y: number; z: number }, label?: string) {
  const obj = createGeomSphere(`node-${id}`, pos, {
    radius: size,
    surfaceColor: { r: 0.5, g: 0.5, b: 0.5, a: 1 },
    label,
    textColor: { r: 1, g: 1, b: 1, a: 1 },
  });
  obj.boundingRadius = size;
  return obj;
}

function createTestCubeNode(id: string, size: number, pos: { x: number; y: number; z: number }) {
  return createGeomPolyhedron(`node-${id}`, pos, {
    geometry: cubeGeometry(),
    scale: size,
    surfaceColor: { r: 0.5, g: 0.5, b: 0.5, a: 1 },
  });
}

function createTestOctaNode(id: string, size: number, pos: { x: number; y: number; z: number }) {
  return createGeomPolyhedron(`node-${id}`, pos, {
    geometry: octahedronGeometry(),
    scale: size,
    surfaceColor: { r: 0.5, g: 0.5, b: 0.5, a: 1 },
  });
}

function createTestEdge(source: string, target: string) {
  const obj = new SceneObject(`edge-${source}-${target}`);
  obj.mesh = Mesh.createCylinderSolid(1, 1, { radialSegments: 8 });
  obj.material = createMaterial({ r: 0.5, g: 0.5, b: 0.5, a: 1 });
  return obj;
}

// ---------------------------------------------------------------------------
// Node SceneObject — boundingRadius
// ---------------------------------------------------------------------------

describe('node SceneObject — boundingRadius', () => {
  it('mesh has computable bounding radius matching node size', () => {
    const obj = createTestNode('a', 2, { x: 0, y: 0, z: 0 });
    const r = obj.computeBoundingRadius();
    expect(r).toBeGreaterThan(1.9);
    expect(r).toBeLessThan(2.1);
  });

  it('default size produces radius ~1', () => {
    const obj = createTestNode('a', 1, { x: 0, y: 0, z: 0 });
    const r = obj.computeBoundingRadius();
    expect(r).toBeGreaterThan(0.9);
    expect(r).toBeLessThan(1.1);
  });

  it('cube shape has computable bounding radius', () => {
    const obj = createTestCubeNode('a', 1, { x: 0, y: 0, z: 0 });
    const r = obj.computeBoundingRadius();
    expect(r).toBeGreaterThan(0);
  });

  it('octahedron shape has computable bounding radius', () => {
    const obj = createTestOctaNode('a', 1, { x: 0, y: 0, z: 0 });
    const r = obj.computeBoundingRadius();
    expect(r).toBeGreaterThan(0);
  });

  it('label child SceneObject has label property set', () => {
    const obj = createTestNode('a', 1, { x: 0, y: 0, z: 0 }, 'AS3356');
    const labelChild = obj.children.find(c => c.id === 'node-a-label');
    expect(labelChild).toBeDefined();
    expect(labelChild!.label).toBe('AS3356');
    expect(labelChild!.mesh).toBeUndefined();
  });
});

// ---------------------------------------------------------------------------
// Collision config — SimConfig propagation
// ---------------------------------------------------------------------------

describe('collision config propagation', () => {
  function makeConfig(overrides?: Partial<SimConfig>): SimConfig {
    return {
      repulsionStrength: 0,
      attractionStrength: 0,
      damping: 1,
      centerGravity: 0,
      timeStep: 0.001,
      bounds: { min: { x: -100, y: -100, z: -100 }, max: { x: 100, y: 100, z: 100 } },
      ...overrides,
    };
  }

  function makeNode(id: string, x: number, vel: number, opts?: Partial<SimNode>): SimNode {
    return {
      id,
      position: { x, y: 0, z: 0 },
      velocity: { x: vel, y: 0, z: 0 },
      mass: 1,
      fixed: false,
      collisionRadius: 1,
      ...opts,
    };
  }

  it('collisionEnabled=true triggers collision response', () => {
    const nodes = new Map<string, SimNode>();
    nodes.set('a', makeNode('a', -0.5, 5));
    nodes.set('b', makeNode('b', 0.5, -5));

    stepSimulation(nodes, [], makeConfig({ collisionEnabled: true, restitution: 1 }));

    // Should have bounced
    expect(nodes.get('a')!.velocity.x).toBeLessThan(0);
    expect(nodes.get('b')!.velocity.x).toBeGreaterThan(0);
  });

  it('collisionEnabled=false skips collision', () => {
    const nodes = new Map<string, SimNode>();
    nodes.set('a', makeNode('a', -0.5, 5));
    nodes.set('b', makeNode('b', 0.5, -5));

    stepSimulation(nodes, [], makeConfig({ collisionEnabled: false }));

    // Velocities unchanged by collision (only integration happened)
    // With timeStep 0.001, positions barely moved, no collision applied
    expect(nodes.get('a')!.velocity.x).toBeGreaterThan(0); // still moving +x
    expect(nodes.get('b')!.velocity.x).toBeLessThan(0); // still moving -x
  });

  it('collisionEnabled defaults to false when omitted', () => {
    const nodes = new Map<string, SimNode>();
    nodes.set('a', makeNode('a', -0.5, 5));
    nodes.set('b', makeNode('b', 0.5, -5));

    stepSimulation(nodes, [], makeConfig()); // no collision fields

    // Should NOT have bounced
    expect(nodes.get('a')!.velocity.x).toBeGreaterThan(0);
  });

  it('restitution=0 results in zero relative velocity after collision', () => {
    const nodes = new Map<string, SimNode>();
    nodes.set('a', makeNode('a', -0.5, 5));
    nodes.set('b', makeNode('b', 0.5, -5));

    stepSimulation(nodes, [], makeConfig({ collisionEnabled: true, restitution: 0 }));

    const relVel = nodes.get('b')!.velocity.x - nodes.get('a')!.velocity.x;
    expect(Math.abs(relVel)).toBeLessThan(0.5);
  });

  it('collisionRadius on SimNode controls overlap detection', () => {
    const nodes = new Map<string, SimNode>();
    // Small radii: no overlap at distance 1
    nodes.set('a', makeNode('a', 0, 0, { collisionRadius: 0.3 }));
    nodes.set('b', makeNode('b', 1, 0, { collisionRadius: 0.3 }));

    stepSimulation(nodes, [], makeConfig({ collisionEnabled: true, restitution: 1 }));

    // Should NOT have collided (0.3 + 0.3 = 0.6 < 1)
    expect(nodes.get('a')!.velocity.x).toBe(0);
    expect(nodes.get('b')!.velocity.x).toBe(0);
  });

  it('large collisionRadius triggers collision at greater distance', () => {
    const nodes = new Map<string, SimNode>();
    nodes.set('a', makeNode('a', 0, 1, { collisionRadius: 3 }));
    nodes.set('b', makeNode('b', 4, -1, { collisionRadius: 3 }));
    // distance=4, r1+r2=6, so they overlap

    stepSimulation(nodes, [], makeConfig({ collisionEnabled: true, restitution: 1 }));

    // Should have bounced
    expect(nodes.get('a')!.velocity.x).toBeLessThan(0);
    expect(nodes.get('b')!.velocity.x).toBeGreaterThan(0);
  });
});

// ---------------------------------------------------------------------------
// Raycast pick pipeline integration
// ---------------------------------------------------------------------------

describe('raycast pick pipeline with ForceGraph3D nodes', () => {
  it('hits created node sphere at world origin', () => {
    const obj = createTestNode('target', 2, { x: 0, y: 0, z: 0 });
    obj.boundingRadius = 2;

    const ray: Ray = { origin: { x: 0, y: 0, z: 10 }, direction: { x: 0, y: 0, z: -1 } };
    const hit = pickObjects(ray, [obj]);
    expect(hit).not.toBeNull();
    expect(hit!.object.id).toBe('node-target');
    expect(hit!.distance).toBeCloseTo(8, 1);
  });

  it('picks nearest of multiple nodes', () => {
    const near = createTestNode('near', 1, { x: 0, y: 0, z: 5 });
    near.boundingRadius = 1;
    const far = createTestNode('far', 1, { x: 0, y: 0, z: -5 });
    far.boundingRadius = 1;

    const ray: Ray = { origin: { x: 0, y: 0, z: 20 }, direction: { x: 0, y: 0, z: -1 } };
    const hit = pickObjects(ray, [far, near]); // far first in array
    expect(hit!.object.id).toBe('node-near');
  });

  it('misses when ray does not intersect any node', () => {
    const obj = createTestNode('off', 1, { x: 50, y: 50, z: 0 });
    obj.boundingRadius = 1;

    const ray: Ray = { origin: { x: 0, y: 0, z: 10 }, direction: { x: 0, y: 0, z: -1 } };
    expect(pickObjects(ray, [obj])).toBeNull();
  });

  it('skips invisible nodes', () => {
    const obj = createTestNode('hidden', 1, { x: 0, y: 0, z: 0 });
    obj.boundingRadius = 1;
    obj.visible = false;

    const ray: Ray = { origin: { x: 0, y: 0, z: 10 }, direction: { x: 0, y: 0, z: -1 } };
    expect(pickObjects(ray, [obj])).toBeNull();
  });

  it('screenToRay produces correct ray from viewport center', () => {
    const view = mat4LookAt(vec3(0, 0, 10), vec3(0, 0, 0), vec3(0, 1, 0));
    const proj = mat4Perspective(Math.PI / 4, 800 / 600, 0.1, 1000);
    const vp = mat4Multiply(proj, view);

    const ray = screenToRay(400, 300, 800, 600, vp);
    expect(ray.direction.z).toBeLessThan(0);
  });

  it('end-to-end: screenToRay → pickObjects hits node at origin', () => {
    const obj = createTestNode('hit', 2, { x: 0, y: 0, z: 0 });
    obj.boundingRadius = 2;

    const view = mat4LookAt(vec3(0, 0, 10), vec3(0, 0, 0), vec3(0, 1, 0));
    const proj = mat4Perspective(Math.PI / 4, 800 / 600, 0.1, 1000);
    const vp = mat4Multiply(proj, view);

    const ray = screenToRay(400, 300, 800, 600, vp);
    const hit = pickObjects(ray, [obj]);
    expect(hit).not.toBeNull();
    expect(hit!.object.id).toBe('node-hit');
  });

  it('end-to-end: screenToRay at edge of viewport misses centered node', () => {
    const obj = createTestNode('small', 0.5, { x: 0, y: 0, z: 0 });
    obj.boundingRadius = 0.5;

    const view = mat4LookAt(vec3(0, 0, 10), vec3(0, 0, 0), vec3(0, 1, 0));
    const proj = mat4Perspective(Math.PI / 4, 800 / 600, 0.1, 1000);
    const vp = mat4Multiply(proj, view);

    // Far corner of viewport
    const ray = screenToRay(0, 0, 800, 600, vp);
    const hit = pickObjects(ray, [obj]);
    expect(hit).toBeNull();
  });

  it('RaycastPicker implements ObjectPicker and finds object', () => {
    const picker = new RaycastPicker();
    const obj = createTestNode('x', 1, { x: 0, y: 0, z: 0 });
    obj.boundingRadius = 1;

    const result = picker.pick({ x: 0, y: 0, z: 10 }, { x: 0, y: 0, z: -1 }, [obj]);
    expect(result).not.toBeNull();
    expect(result!.id).toBe('node-x');
  });
});

// ---------------------------------------------------------------------------
// Edge interaction support
// ---------------------------------------------------------------------------

describe('edge SceneObject properties for interaction', () => {
  it('edge SceneObject has mesh for hit testing', () => {
    const obj = createTestEdge('a', 'b');
    expect(obj.mesh).not.toBeNull();
    expect(obj.mesh!.vertexCount).toBeGreaterThan(0);
  });

  it('edge can compute bounding radius', () => {
    const obj = createTestEdge('a', 'b');
    const r = obj.computeBoundingRadius();
    expect(r).toBeGreaterThan(0);
  });

  it('edge SceneObject can be positioned between two points', () => {
    const obj = createTestEdge('a', 'b');
    // Simulate what updateEdgeTransform does: position at midpoint, scale to distance
    const sourcePos = { x: 0, y: 0, z: 0 };
    const targetPos = { x: 10, y: 0, z: 0 };
    obj.position = {
      x: (sourcePos.x + targetPos.x) / 2,
      y: (sourcePos.y + targetPos.y) / 2,
      z: (sourcePos.z + targetPos.z) / 2,
    };
    obj.scale = { x: 0.1, y: 10, z: 0.1 };
    expect(obj.position.x).toBeCloseTo(5, 5);
    expect(obj.scale.y).toBeCloseTo(10, 5);
  });
});

// ---------------------------------------------------------------------------
// ForceGraph3DProps type contract
// ---------------------------------------------------------------------------

describe('ForceGraph3DProps type contract', () => {
  it('collision props are part of the type', () => {
    const props: ForceGraph3DProps = {
      width: 800,
      height: 600,
      nodes: [],
      edges: [],
      collisionEnabled: true,
      restitution: 0.5,
    };
    expect(props.collisionEnabled).toBe(true);
    expect(props.restitution).toBe(0.5);
  });

  it('all mouse event handlers are part of the type', () => {
    const props: ForceGraph3DProps = {
      width: 800,
      height: 600,
      nodes: [],
      edges: [],
      onNodeClick: (_id, _node, _e) => {},
      onNodeDoubleClick: (_id, _node, _e) => {},
      onNodeRightClick: (_id, _node, _e) => {},
      onNodeMouseDown: (_id, _node, _e) => {},
      onNodeMouseUp: (_id, _node, _e) => {},
      onNodeHover: (_id, _node, _e) => {},
      onEdgeClick: (_edge, _e) => {},
      onEdgeHover: (_edge, _e) => {},
    };
    expect(props.onNodeClick).toBeDefined();
    expect(props.onNodeDoubleClick).toBeDefined();
    expect(props.onNodeRightClick).toBeDefined();
    expect(props.onNodeMouseDown).toBeDefined();
    expect(props.onNodeMouseUp).toBeDefined();
    expect(props.onNodeHover).toBeDefined();
    expect(props.onEdgeClick).toBeDefined();
    expect(props.onEdgeHover).toBeDefined();
  });

  it('ForceGraph3DNode includes collisionRadius', () => {
    const node: ForceGraph3DNode = {
      id: 'test',
      collisionRadius: 3,
    };
    expect(node.collisionRadius).toBe(3);
  });
});
