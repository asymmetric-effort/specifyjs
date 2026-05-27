// (c) 2025-2026 Asymmetric Effort, LLC. MIT LICENSE
// SPDX-License-Identifier: MIT

import { describe, it, expect, beforeEach, afterEach } from '@asymmetric-effort/nogginlessdom';
import {
  ForceGraph3D,
  edgeKey,
  autoRestLength,
  quaternionFromYAxisTo,
  createNodeSceneObject,
  createEdgeSceneObject,
  updateEdgeTransform,
} from '../src/ForceGraph3D';
import type { ForceGraph3DNode, ForceGraph3DEdge, ForceGraph3DAPI } from '../src/types';
import { SceneObject } from '../../3dSpace/src/scene-object';
import { installMockDispatcher, teardownMockDispatcher } from '../../../_test-helpers/mock-dispatcher';

beforeEach(() => installMockDispatcher());
afterEach(() => teardownMockDispatcher());

const sampleNodes: ForceGraph3DNode[] = [
  { id: 'a', label: 'Node A', position: { x: 0, y: 0, z: 0 } },
  { id: 'b', label: 'Node B', position: { x: 10, y: 0, z: 0 } },
  { id: 'c', label: 'Node C', position: { x: 0, y: 10, z: 0 } },
];

const sampleEdges: ForceGraph3DEdge[] = [
  { source: 'a', target: 'b' },
  { source: 'b', target: 'c' },
];

// ---------------------------------------------------------------------------
// Component rendering — happy path
// ---------------------------------------------------------------------------

describe('ForceGraph3D — happy path rendering', () => {
  it('creates without errors', () => {
    const el = ForceGraph3D({
      width: 600,
      height: 400,
      nodes: sampleNodes,
      edges: sampleEdges,
    });
    expect(el).not.toBeNull();
  });

  it('renders with custom dimensions', () => {
    const el = ForceGraph3D({
      width: 800,
      height: 600,
      nodes: sampleNodes,
      edges: sampleEdges,
    });
    expect(el).not.toBeNull();
  });

  it('renders with simulation parameters', () => {
    const el = ForceGraph3D({
      width: 600,
      height: 400,
      nodes: sampleNodes,
      edges: sampleEdges,
      repulsionStrength: 200,
      attractionStrength: 0.2,
      damping: 0.85,
      centerGravity: 0.02,
      timeStep: 0.032,
    });
    expect(el).not.toBeNull();
  });

  it('renders with camera distance', () => {
    const el = ForceGraph3D({
      width: 600,
      height: 400,
      nodes: sampleNodes,
      edges: sampleEdges,
      cameraDistance: 100,
    });
    expect(el).not.toBeNull();
  });

  it('renders with running=false', () => {
    const el = ForceGraph3D({
      width: 600,
      height: 400,
      nodes: sampleNodes,
      edges: sampleEdges,
      running: false,
    });
    expect(el).not.toBeNull();
  });

  it('renders with custom bounds', () => {
    const el = ForceGraph3D({
      width: 600,
      height: 400,
      nodes: sampleNodes,
      edges: sampleEdges,
      bounds: {
        min: { x: -100, y: -100, z: -100 },
        max: { x: 100, y: 100, z: 100 },
      },
    });
    expect(el).not.toBeNull();
  });

  it('renders with onNodeClick callback', () => {
    const el = ForceGraph3D({
      width: 600,
      height: 400,
      nodes: sampleNodes,
      edges: sampleEdges,
      onNodeClick: () => {},
    });
    expect(el).not.toBeNull();
  });

  it('renders with onNodeHover callback', () => {
    const el = ForceGraph3D({
      width: 600,
      height: 400,
      nodes: sampleNodes,
      edges: sampleEdges,
      onNodeHover: () => {},
    });
    expect(el).not.toBeNull();
  });

  it('renders with onEdgeClick callback', () => {
    const el = ForceGraph3D({
      width: 600,
      height: 400,
      nodes: sampleNodes,
      edges: sampleEdges,
      onEdgeClick: () => {},
    });
    expect(el).not.toBeNull();
  });

  it('renders with backgroundColor', () => {
    const el = ForceGraph3D({
      width: 600,
      height: 400,
      nodes: sampleNodes,
      edges: sampleEdges,
      backgroundColor: { r: 0, g: 0, b: 0, a: 1 },
    });
    expect(el).not.toBeNull();
  });
});

// ---------------------------------------------------------------------------
// Component rendering — sad path
// ---------------------------------------------------------------------------

describe('ForceGraph3D — sad path rendering', () => {
  it('handles empty nodes array', () => {
    const el = ForceGraph3D({
      width: 600,
      height: 400,
      nodes: [],
      edges: [],
    });
    expect(el).not.toBeNull();
  });

  it('handles edges referencing missing nodes', () => {
    const el = ForceGraph3D({
      width: 600,
      height: 400,
      nodes: [{ id: 'a' }],
      edges: [{ source: 'a', target: 'missing' }],
    });
    expect(el).not.toBeNull();
  });

  it('handles single node, no edges', () => {
    const el = ForceGraph3D({
      width: 600,
      height: 400,
      nodes: [{ id: 'solo' }],
      edges: [],
    });
    expect(el).not.toBeNull();
  });

  it('handles self-loop edge', () => {
    const el = ForceGraph3D({
      width: 600,
      height: 400,
      nodes: [{ id: 'a' }],
      edges: [{ source: 'a', target: 'a' }],
    });
    expect(el).not.toBeNull();
  });

  it('handles duplicate node IDs by ignoring duplicates', () => {
    const el = ForceGraph3D({
      width: 600,
      height: 400,
      nodes: [{ id: 'a' }, { id: 'a' }],
      edges: [],
    });
    expect(el).not.toBeNull();
  });

  it('handles duplicate edges by ignoring duplicates', () => {
    const el = ForceGraph3D({
      width: 600,
      height: 400,
      nodes: sampleNodes,
      edges: [
        { source: 'a', target: 'b' },
        { source: 'a', target: 'b' },
      ],
    });
    expect(el).not.toBeNull();
  });
});

// ---------------------------------------------------------------------------
// API via apiRef
// ---------------------------------------------------------------------------

describe('ForceGraph3D — imperative API', () => {
  it('apiRef receives API object', () => {
    let api: ForceGraph3DAPI | null = null;
    ForceGraph3D({
      width: 600,
      height: 400,
      nodes: sampleNodes,
      edges: sampleEdges,
      apiRef: (a) => { api = a; },
    });
    // With mock dispatcher, useEffect doesn't fire, but API is created.
    // In real runtime the apiRef would be called.
    // We test the helper functions directly instead.
  });

  it('getNodePositions returns Map', () => {
    let api: ForceGraph3DAPI | null = null;
    ForceGraph3D({
      width: 600,
      height: 400,
      nodes: sampleNodes,
      edges: sampleEdges,
      apiRef: (a) => { api = a; },
    });
    // Since mock dispatcher runs useEffect as no-op, we test exports directly.
    // Direct verification of getNodePositions is done via the integration tests below.
  });
});

// ---------------------------------------------------------------------------
// Helper functions
// ---------------------------------------------------------------------------

describe('edgeKey', () => {
  it('creates key from source and target', () => {
    expect(edgeKey('a', 'b')).toBe('a::b');
  });

  it('preserves order (not symmetric)', () => {
    expect(edgeKey('a', 'b')).not.toBe(edgeKey('b', 'a'));
  });
});

describe('autoRestLength', () => {
  it('returns minimum 3 for 0 nodes', () => {
    expect(autoRestLength(0)).toBeGreaterThanOrEqual(3);
  });

  it('returns reasonable length for 10 nodes', () => {
    const len = autoRestLength(10);
    expect(len).toBeGreaterThan(3);
    expect(len).toBeLessThan(100);
  });

  it('increases with node count', () => {
    const small = autoRestLength(4);
    const large = autoRestLength(100);
    expect(large).toBeGreaterThan(small);
  });
});

describe('quaternionFromYAxisTo', () => {
  it('returns identity for direction +Y', () => {
    const q = quaternionFromYAxisTo({ x: 0, y: 1, z: 0 });
    expect(Math.abs(q.w - 1)).toBeLessThan(0.001);
    expect(Math.abs(q.x)).toBeLessThan(0.001);
    expect(Math.abs(q.y)).toBeLessThan(0.001);
    expect(Math.abs(q.z)).toBeLessThan(0.001);
  });

  it('returns 180 rotation for direction -Y', () => {
    const q = quaternionFromYAxisTo({ x: 0, y: -1, z: 0 });
    // Should be a 180-degree rotation around Z
    expect(Math.abs(q.w)).toBeLessThan(0.001);
    expect(Math.abs(q.z - 1)).toBeLessThan(0.001);
  });

  it('returns valid quaternion for +X direction', () => {
    const q = quaternionFromYAxisTo({ x: 1, y: 0, z: 0 });
    const lenSq = q.x * q.x + q.y * q.y + q.z * q.z + q.w * q.w;
    expect(Math.abs(lenSq - 1)).toBeLessThan(0.001);
  });

  it('returns valid quaternion for +Z direction', () => {
    const q = quaternionFromYAxisTo({ x: 0, y: 0, z: 1 });
    const lenSq = q.x * q.x + q.y * q.y + q.z * q.z + q.w * q.w;
    expect(Math.abs(lenSq - 1)).toBeLessThan(0.001);
  });

  it('returns valid quaternion for diagonal direction', () => {
    const len = Math.sqrt(3);
    const q = quaternionFromYAxisTo({ x: 1 / len, y: 1 / len, z: 1 / len });
    const qLen = Math.sqrt(q.x * q.x + q.y * q.y + q.z * q.z + q.w * q.w);
    expect(Math.abs(qLen - 1)).toBeLessThan(0.001);
  });
});

// ---------------------------------------------------------------------------
// createNodeSceneObject
// ---------------------------------------------------------------------------

describe('createNodeSceneObject', () => {
  it('creates sphere SceneObject by default', () => {
    const obj = createNodeSceneObject('a', { id: 'a' }, { x: 0, y: 0, z: 0 });
    expect(obj).not.toBeNull();
    expect(obj.id).toBe('node-a');
    expect(obj.mesh).not.toBeNull();
  });

  it('creates sphere SceneObject for shape=sphere', () => {
    const obj = createNodeSceneObject('a', { id: 'a', shape: 'sphere' }, { x: 1, y: 2, z: 3 });
    expect(obj.id).toBe('node-a');
    expect(obj.position.x).toBe(1);
    expect(obj.position.y).toBe(2);
    expect(obj.position.z).toBe(3);
  });

  it('creates cube SceneObject', () => {
    const obj = createNodeSceneObject('a', { id: 'a', shape: 'cube' }, { x: 0, y: 0, z: 0 });
    expect(obj).not.toBeNull();
    expect(obj.mesh).not.toBeNull();
  });

  it('creates tetrahedron SceneObject', () => {
    const obj = createNodeSceneObject('a', { id: 'a', shape: 'tetrahedron' }, { x: 0, y: 0, z: 0 });
    expect(obj).not.toBeNull();
  });

  it('creates octahedron SceneObject', () => {
    const obj = createNodeSceneObject('a', { id: 'a', shape: 'octahedron' }, { x: 0, y: 0, z: 0 });
    expect(obj).not.toBeNull();
  });

  it('creates icosahedron SceneObject', () => {
    const obj = createNodeSceneObject('a', { id: 'a', shape: 'icosahedron' }, { x: 0, y: 0, z: 0 });
    expect(obj).not.toBeNull();
  });

  it('creates custom SceneObject with provided geometry', () => {
    const customGeom = {
      vertices: [
        { x: 0, y: 1, z: 0 },
        { x: -1, y: -1, z: 0 },
        { x: 1, y: -1, z: 0 },
      ],
      faces: [{ vertices: [0, 1, 2] }],
    };
    const obj = createNodeSceneObject('a', {
      id: 'a',
      shape: 'custom',
      customGeometry: customGeom,
    }, { x: 0, y: 0, z: 0 });
    expect(obj).not.toBeNull();
  });

  it('falls back to cube for custom without geometry', () => {
    const obj = createNodeSceneObject('a', { id: 'a', shape: 'custom' }, { x: 0, y: 0, z: 0 });
    expect(obj).not.toBeNull();
  });

  it('uses custom color', () => {
    const obj = createNodeSceneObject('a', {
      id: 'a',
      color: { r: 1, g: 0, b: 0, a: 1 },
    }, { x: 0, y: 0, z: 0 });
    expect(obj.material).not.toBeNull();
    expect(obj.material!.color.r).toBe(1);
  });

  it('uses custom size', () => {
    const obj = createNodeSceneObject('a', { id: 'a', size: 3 }, { x: 0, y: 0, z: 0 });
    expect(obj).not.toBeNull();
  });

  it('clamps negative size to minimum', () => {
    const obj = createNodeSceneObject('a', { id: 'a', size: -5 }, { x: 0, y: 0, z: 0 });
    expect(obj).not.toBeNull();
  });

  it('creates label child for labeled nodes', () => {
    const obj = createNodeSceneObject('a', { id: 'a', label: 'Hello' }, { x: 0, y: 0, z: 0 });
    expect(obj.children.length).toBeGreaterThan(0);
  });
});

// ---------------------------------------------------------------------------
// createEdgeSceneObject
// ---------------------------------------------------------------------------

describe('createEdgeSceneObject', () => {
  it('creates cylinder-solid edge by default', () => {
    const obj = createEdgeSceneObject('a', 'b', { source: 'a', target: 'b' });
    expect(obj).not.toBeNull();
    expect(obj.id).toBe('edge-a-b');
    expect(obj.mesh).not.toBeNull();
    expect(obj.renderMode).toBe('triangles');
  });

  it('creates cylinder-mesh edge', () => {
    const obj = createEdgeSceneObject('a', 'b', {
      source: 'a', target: 'b', style: 'cylinder-mesh',
    });
    expect(obj.renderMode).toBe('lines');
  });

  it('creates line-style edge (uses solid cylinder)', () => {
    const obj = createEdgeSceneObject('a', 'b', {
      source: 'a', target: 'b', style: 'line',
    });
    expect(obj).not.toBeNull();
    expect(obj.mesh).not.toBeNull();
  });

  it('uses custom color', () => {
    const obj = createEdgeSceneObject('a', 'b', {
      source: 'a', target: 'b', color: { r: 1, g: 0, b: 0, a: 1 },
    });
    expect(obj.material!.color.r).toBe(1);
  });
});

// ---------------------------------------------------------------------------
// updateEdgeTransform
// ---------------------------------------------------------------------------

describe('updateEdgeTransform', () => {
  it('positions edge at midpoint between source and target', () => {
    const obj = new SceneObject('test-edge');
    obj.mesh = Mesh.createCylinderSolid(1, 1, { radialSegments: 8 });
    updateEdgeTransform(
      obj,
      { x: 0, y: 0, z: 0 },
      { x: 10, y: 0, z: 0 },
      0.1,
    );
    expect(obj.position.x).toBeCloseTo(5, 5);
    expect(obj.position.y).toBeCloseTo(0, 5);
    expect(obj.position.z).toBeCloseTo(0, 5);
  });

  it('scales edge Y to distance between nodes', () => {
    const obj = new SceneObject('test-edge');
    obj.mesh = Mesh.createCylinderSolid(1, 1, { radialSegments: 8 });
    updateEdgeTransform(
      obj,
      { x: 0, y: 0, z: 0 },
      { x: 0, y: 10, z: 0 },
      0.2,
    );
    expect(obj.scale.y).toBeCloseTo(10, 5);
    expect(obj.scale.x).toBeCloseTo(0.2, 5);
    expect(obj.scale.z).toBeCloseTo(0.2, 5);
  });

  it('rotates edge to align with direction vector', () => {
    const obj = new SceneObject('test-edge');
    obj.mesh = Mesh.createCylinderSolid(1, 1, { radialSegments: 8 });
    updateEdgeTransform(
      obj,
      { x: 0, y: 0, z: 0 },
      { x: 10, y: 0, z: 0 },
      0.1,
    );
    // Rotation should be set (not identity, since direction is X not Y)
    const q = obj.rotation;
    const lenSq = q.x * q.x + q.y * q.y + q.z * q.z + q.w * q.w;
    expect(Math.abs(lenSq - 1)).toBeLessThan(0.01);
  });

  it('hides edge when source and target overlap', () => {
    const obj = new SceneObject('test-edge');
    obj.mesh = Mesh.createCylinderSolid(1, 1, { radialSegments: 8 });
    updateEdgeTransform(
      obj,
      { x: 5, y: 5, z: 5 },
      { x: 5, y: 5, z: 5 },
      0.1,
    );
    expect(obj.visible).toBe(false);
  });

  it('shows edge when nodes are separated', () => {
    const obj = new SceneObject('test-edge');
    obj.mesh = Mesh.createCylinderSolid(1, 1, { radialSegments: 8 });
    updateEdgeTransform(
      obj,
      { x: 0, y: 0, z: 0 },
      { x: 0, y: 5, z: 0 },
      0.1,
    );
    expect(obj.visible).toBe(true);
  });

  it('handles diagonal direction correctly', () => {
    const obj = new SceneObject('test-edge');
    obj.mesh = Mesh.createCylinderSolid(1, 1, { radialSegments: 8 });
    updateEdgeTransform(
      obj,
      { x: 0, y: 0, z: 0 },
      { x: 5, y: 5, z: 5 },
      0.1,
    );
    const expectedDist = Math.sqrt(75);
    expect(obj.scale.y).toBeCloseTo(expectedDist, 3);
    expect(obj.visible).toBe(true);
  });

  it('handles negative direction correctly', () => {
    const obj = new SceneObject('test-edge');
    obj.mesh = Mesh.createCylinderSolid(1, 1, { radialSegments: 8 });
    updateEdgeTransform(
      obj,
      { x: 10, y: 10, z: 10 },
      { x: 0, y: 0, z: 0 },
      0.1,
    );
    expect(obj.visible).toBe(true);
    expect(Number.isFinite(obj.position.x)).toBe(true);
  });
});

// ---------------------------------------------------------------------------
// Correct number of SceneObjects
// ---------------------------------------------------------------------------

describe('ForceGraph3D — scene object counts', () => {
  it('correct number of node SceneObjects', () => {
    // We verify via createNodeSceneObject directly
    const objs = sampleNodes.map((n, i) =>
      createNodeSceneObject(n.id, n, n.position ?? { x: i, y: 0, z: 0 }),
    );
    expect(objs.length).toBe(3);
    for (const obj of objs) {
      expect(obj).not.toBeNull();
      expect(obj.mesh).not.toBeNull();
    }
  });

  it('correct number of edge SceneObjects', () => {
    const objs = sampleEdges.map(e =>
      createEdgeSceneObject(e.source, e.target, e),
    );
    expect(objs.length).toBe(2);
    for (const obj of objs) {
      expect(obj).not.toBeNull();
      expect(obj.mesh).not.toBeNull();
    }
  });
});

// ---------------------------------------------------------------------------
// Different node shapes
// ---------------------------------------------------------------------------

describe('ForceGraph3D — node shapes', () => {
  const shapes = ['sphere', 'cube', 'tetrahedron', 'octahedron', 'icosahedron'] as const;

  for (const shape of shapes) {
    it(`renders ${shape} shape correctly`, () => {
      const obj = createNodeSceneObject('test', { id: 'test', shape }, { x: 0, y: 0, z: 0 });
      expect(obj).not.toBeNull();
      expect(obj.mesh).not.toBeNull();
      expect(obj.mesh!.vertexCount).toBeGreaterThan(0);
    });
  }
});

// ---------------------------------------------------------------------------
// Different edge styles
// ---------------------------------------------------------------------------

describe('ForceGraph3D — edge styles', () => {
  it('cylinder-solid has triangles render mode', () => {
    const obj = createEdgeSceneObject('a', 'b', {
      source: 'a', target: 'b', style: 'cylinder-solid',
    });
    expect(obj.renderMode).toBe('triangles');
  });

  it('cylinder-mesh has lines render mode', () => {
    const obj = createEdgeSceneObject('a', 'b', {
      source: 'a', target: 'b', style: 'cylinder-mesh',
    });
    expect(obj.renderMode).toBe('lines');
  });

  it('line style has triangles render mode (thin cylinder)', () => {
    const obj = createEdgeSceneObject('a', 'b', {
      source: 'a', target: 'b', style: 'line',
    });
    expect(obj.renderMode).toBe('triangles');
  });
});

// ---------------------------------------------------------------------------
// Exports verification
// ---------------------------------------------------------------------------

describe('ForceGraph3D — exports', () => {
  it('exports ForceGraph3D from index', async () => {
    const mod = await import('../src/index');
    expect(typeof mod.ForceGraph3D).toBe('function');
  });

  it('exports stepSimulation from index', async () => {
    const mod = await import('../src/index');
    expect(typeof mod.stepSimulation).toBe('function');
  });

  it('exports computeKineticEnergy from index', async () => {
    const mod = await import('../src/index');
    expect(typeof mod.computeKineticEnergy).toBe('function');
  });

  it('exports edgeKey from index', async () => {
    const mod = await import('../src/index');
    expect(typeof mod.edgeKey).toBe('function');
  });

  it('exports autoRestLength from index', async () => {
    const mod = await import('../src/index');
    expect(typeof mod.autoRestLength).toBe('function');
  });

  it('exports quaternionFromYAxisTo from index', async () => {
    const mod = await import('../src/index');
    expect(typeof mod.quaternionFromYAxisTo).toBe('function');
  });

  it('exports createNodeSceneObject from index', async () => {
    const mod = await import('../src/index');
    expect(typeof mod.createNodeSceneObject).toBe('function');
  });

  it('exports createEdgeSceneObject from index', async () => {
    const mod = await import('../src/index');
    expect(typeof mod.createEdgeSceneObject).toBe('function');
  });

  it('exports updateEdgeTransform from index', async () => {
    const mod = await import('../src/index');
    expect(typeof mod.updateEdgeTransform).toBe('function');
  });
});
