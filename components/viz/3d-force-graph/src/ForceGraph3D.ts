// (c) 2025-2026 Asymmetric Effort, LLC. MIT LICENSE
// SPDX-License-Identifier: MIT

/**
 * ForceGraph3D -- A SpecifyJS component that renders force-directed graph
 * layouts in 3D space using the 3dSpace engine.
 *
 * - Uses Space3D with onFrame callback for animation
 * - Creates SceneObjects for each node (sphere/polyhedron) and edge (cylinder)
 * - Maintains internal state maps (no userData on SceneObjects)
 * - Exposes imperative API via apiRef
 */

import { createElement } from 'specifyjs';
import { useState, useEffect, useRef, useCallback, useMemo } from 'specifyjs/hooks';
import type { Vec3 } from '../../../math/src/vec';
import type { Quaternion } from '../../../math/src/quaternion';
import type { Color } from '../../3dSpace/src/types';
import { SceneObject } from '../../3dSpace/src/scene-object';
import { SceneGraph } from '../../3dSpace/src/scene-graph';
import { Mesh } from '../../3dSpace/src/mesh';
import { createMaterial } from '../../3dSpace/src/material';
import { createGeomSphere } from '../../3dSpace/src/geom-sphere';
import {
  createGeomPolyhedron,
  cubeGeometry,
  tetrahedronGeometry,
  octahedronGeometry,
  icosahedronGeometry,
} from '../../3dSpace/src/geom-polyhedron';
import { Camera } from '../../3dSpace/src/camera';
import { Space3D } from '../../3dSpace/src/Space3D';
import type {
  ForceGraph3DNode,
  ForceGraph3DEdge,
  ForceGraph3DProps,
  ForceGraph3DAPI,
} from './types';
import type { SimNode, SimEdge, SimConfig } from './force-sim';
import { stepSimulation, computeKineticEnergy } from './force-sim';

// ---- Internal state types ---------------------------------------------------

/** Internal state for a node, mapping config to SceneObject. */
export interface NodeState {
  config: ForceGraph3DNode;
  sceneObjectId: string;
  labelObjectId?: string;
}

/** Internal state for an edge, mapping config to SceneObject. */
export interface EdgeState {
  config: ForceGraph3DEdge;
  sceneObjectId: string;
}

// ---- Helpers ----------------------------------------------------------------

const DEFAULT_COLOR: Color = { r: 0.23, g: 0.51, b: 0.96, a: 1 };
const DEFAULT_EDGE_COLOR: Color = { r: 0.58, g: 0.64, b: 0.72, a: 1 };
const DEFAULT_BG: Color = { r: 0.06, g: 0.09, b: 0.16, a: 1 };

/** Generate edge key from source+target. */
export function edgeKey(source: string, target: string): string {
  return `${source}::${target}`;
}

/** Auto-compute rest length based on node count. */
export function autoRestLength(nodeCount: number): number {
  return Math.max(3, 5 + Math.sqrt(nodeCount) * 2);
}

/**
 * Compute quaternion that rotates the Y-axis (0,1,0) to the given direction.
 */
export function quaternionFromYAxisTo(dir: Vec3): Quaternion {
  const yAxis: Vec3 = { x: 0, y: 1, z: 0 };

  // dot product
  const dot = yAxis.x * dir.x + yAxis.y * dir.y + yAxis.z * dir.z;

  // If dir is approximately +Y, return identity
  if (dot > 0.9999) {
    return { x: 0, y: 0, z: 0, w: 1 };
  }

  // If dir is approximately -Y, rotate 180 around Z
  if (dot < -0.9999) {
    return { x: 0, y: 0, z: 1, w: 0 };
  }

  // Cross product Y x dir
  const cx = yAxis.y * dir.z - yAxis.z * dir.y;
  const cy = yAxis.z * dir.x - yAxis.x * dir.z;
  const cz = yAxis.x * dir.y - yAxis.y * dir.x;

  // Quaternion: q = (cross, 1 + dot), then normalize
  const w = 1 + dot;
  const len = Math.sqrt(cx * cx + cy * cy + cz * cz + w * w);
  return {
    x: cx / len,
    y: cy / len,
    z: cz / len,
    w: w / len,
  };
}

/** Create a SceneObject for a node based on its shape config. */
export function createNodeSceneObject(
  nodeId: string,
  node: ForceGraph3DNode,
  position: Vec3,
): SceneObject {
  const color = node.color ?? DEFAULT_COLOR;
  const size = Math.max(0.01, node.size ?? 1.0);
  const shape = node.shape ?? 'sphere';
  const sceneId = `node-${nodeId}`;

  if (shape === 'sphere') {
    return createGeomSphere(sceneId, position, {
      radius: size,
      surfaceColor: color,
      label: node.label,
      textColor: node.textColor,
    });
  }

  // For polyhedra, map shape to geometry
  let geometry;
  switch (shape) {
    case 'cube':
      geometry = cubeGeometry();
      break;
    case 'tetrahedron':
      geometry = tetrahedronGeometry();
      break;
    case 'octahedron':
      geometry = octahedronGeometry();
      break;
    case 'icosahedron':
      geometry = icosahedronGeometry();
      break;
    case 'custom':
      if (node.customGeometry) {
        geometry = node.customGeometry;
      } else {
        geometry = cubeGeometry(); // fallback
      }
      break;
    default:
      geometry = cubeGeometry();
      break;
  }

  return createGeomPolyhedron(sceneId, position, {
    geometry,
    scale: size,
    surfaceColor: color,
    label: node.label,
    textColor: node.textColor,
  });
}

/** Create a SceneObject for an edge (unit cylinder). */
export function createEdgeSceneObject(
  source: string,
  target: string,
  edge: ForceGraph3DEdge,
): SceneObject {
  const style = edge.style ?? 'cylinder-solid';
  const color = edge.color ?? DEFAULT_EDGE_COLOR;
  const sceneId = `edge-${source}-${target}`;

  const obj = new SceneObject(sceneId);

  if (style === 'cylinder-mesh') {
    obj.mesh = Mesh.createCylinderMesh(1, 1, { radialSegments: 8, heightSegments: 1 });
    obj.renderMode = 'lines';
  } else {
    // cylinder-solid or line (we use thin cylinder for line)
    obj.mesh = Mesh.createCylinderSolid(1, 1, { radialSegments: 8 });
  }

  obj.material = createMaterial(color);
  return obj;
}

/** Update edge SceneObject transform to connect source and target positions. */
export function updateEdgeTransform(
  edgeObj: SceneObject,
  sourcePos: Vec3,
  targetPos: Vec3,
  thickness: number,
): void {
  const dx = targetPos.x - sourcePos.x;
  const dy = targetPos.y - sourcePos.y;
  const dz = targetPos.z - sourcePos.z;
  const dist = Math.sqrt(dx * dx + dy * dy + dz * dz);

  if (dist < 0.0001) {
    edgeObj.visible = false;
    return;
  }
  edgeObj.visible = true;

  // Midpoint
  const mid: Vec3 = {
    x: (sourcePos.x + targetPos.x) / 2,
    y: (sourcePos.y + targetPos.y) / 2,
    z: (sourcePos.z + targetPos.z) / 2,
  };

  // Direction (normalized)
  const dir: Vec3 = { x: dx / dist, y: dy / dist, z: dz / dist };

  // Quaternion from Y-axis to direction
  const quat = quaternionFromYAxisTo(dir);

  edgeObj.position = mid;
  edgeObj.scale = { x: thickness, y: dist, z: thickness };
  edgeObj.rotation = quat;
}

// ---- Component --------------------------------------------------------------

/** ForceGraph3D component. */
export function ForceGraph3D(props: ForceGraph3DProps) {
  const {
    width,
    height,
    nodes,
    edges,
    bounds,
    repulsionStrength = 100,
    attractionStrength = 0.1,
    damping = 0.9,
    centerGravity = 0.01,
    running = true,
    timeStep = 0.016,
    cameraDistance,
    apiRef,
    lightingModel,
    backgroundColor = DEFAULT_BG,
  } = props;

  const defaultBounds = bounds ?? {
    min: { x: -50, y: -50, z: -50 },
    max: { x: 50, y: 50, z: 50 },
  };

  // Internal state maps
  const nodeStatesRef = useRef<Map<string, NodeState>>(new Map());
  const edgeStatesRef = useRef<Map<string, EdgeState>>(new Map());
  const simNodesRef = useRef<Map<string, SimNode>>(new Map());
  const simEdgesRef = useRef<SimEdge[]>([]);
  const sceneGraphRef = useRef<SceneGraph>(new SceneGraph());
  const runningRef = useRef<boolean>(running);
  const simConfigRef = useRef<SimConfig>({
    repulsionStrength,
    attractionStrength,
    damping,
    centerGravity,
    timeStep,
    bounds: defaultBounds,
  });

  // Keep running state in sync
  runningRef.current = running;
  simConfigRef.current = {
    repulsionStrength,
    attractionStrength,
    damping,
    centerGravity,
    timeStep,
    bounds: defaultBounds,
  };

  const scene = sceneGraphRef.current;

  // ---- Node/Edge CRUD helpers -----------------------------------------------

  const addNodeInternal = useCallback((node: ForceGraph3DNode) => {
    const ns = nodeStatesRef.current;
    const simNodes = simNodesRef.current;

    if (ns.has(node.id)) return; // duplicate

    // Initial position
    const pos: Vec3 = node.position ?? {
      x: (Math.random() - 0.5) * 20,
      y: (Math.random() - 0.5) * 20,
      z: (Math.random() - 0.5) * 20,
    };

    // Simulation node
    const simNode: SimNode = {
      id: node.id,
      position: { x: pos.x, y: pos.y, z: pos.z },
      velocity: { x: 0, y: 0, z: 0 },
      mass: Math.max(0.001, node.mass ?? 1.0),
      fixed: node.fixed ?? false,
    };
    simNodes.set(node.id, simNode);

    // Scene object
    const obj = createNodeSceneObject(node.id, node, pos);
    scene.register(obj);

    const state: NodeState = {
      config: node,
      sceneObjectId: obj.id,
    };
    ns.set(node.id, state);
  }, []);

  const removeNodeInternal = useCallback((nodeId: string) => {
    const ns = nodeStatesRef.current;
    const simNodes = simNodesRef.current;
    const es = edgeStatesRef.current;

    const state = ns.get(nodeId);
    if (!state) return;

    // Remove scene object
    scene.unregister(state.sceneObjectId);

    // Remove connected edges
    const edgesToRemove: string[] = [];
    for (const [key, edgeState] of es.entries()) {
      if (edgeState.config.source === nodeId || edgeState.config.target === nodeId) {
        edgesToRemove.push(key);
      }
    }
    for (const key of edgesToRemove) {
      const edgeState = es.get(key);
      if (edgeState) {
        scene.unregister(edgeState.sceneObjectId);
        es.delete(key);
      }
    }
    // Remove from sim edges
    simEdgesRef.current = simEdgesRef.current.filter(
      e => e.source !== nodeId && e.target !== nodeId,
    );

    // Remove from maps
    ns.delete(nodeId);
    simNodes.delete(nodeId);
  }, []);

  const addEdgeInternal = useCallback((edge: ForceGraph3DEdge) => {
    const es = edgeStatesRef.current;
    const ns = nodeStatesRef.current;
    const key = edgeKey(edge.source, edge.target);

    // Validate endpoints exist
    if (!ns.has(edge.source) || !ns.has(edge.target)) return;
    // Skip self-loops
    if (edge.source === edge.target) return;
    // Skip duplicates
    if (es.has(key)) return;

    const restLen = edge.length ?? autoRestLength(nodeStatesRef.current.size);
    const stiffness = edge.stiffness ?? 0.1;

    // Simulation edge
    const simEdge: SimEdge = {
      source: edge.source,
      target: edge.target,
      restLength: restLen,
      stiffness,
    };
    simEdgesRef.current.push(simEdge);

    // Scene object
    const obj = createEdgeSceneObject(edge.source, edge.target, edge);
    scene.register(obj);

    const state: EdgeState = {
      config: edge,
      sceneObjectId: obj.id,
    };
    es.set(key, state);
  }, []);

  const removeEdgeInternal = useCallback((source: string, target: string) => {
    const es = edgeStatesRef.current;
    const key = edgeKey(source, target);
    const state = es.get(key);
    if (!state) return;

    scene.unregister(state.sceneObjectId);
    es.delete(key);
    simEdgesRef.current = simEdgesRef.current.filter(
      e => !(e.source === source && e.target === target),
    );
  }, []);

  // ---- Initialize from props ------------------------------------------------

  useEffect(() => {
    // Clear existing state
    for (const [, ns] of nodeStatesRef.current) {
      scene.unregister(ns.sceneObjectId);
    }
    for (const [, es] of edgeStatesRef.current) {
      scene.unregister(es.sceneObjectId);
    }
    nodeStatesRef.current.clear();
    edgeStatesRef.current.clear();
    simNodesRef.current.clear();
    simEdgesRef.current = [];

    // Add nodes
    for (const node of nodes) {
      addNodeInternal(node);
    }
    // Add edges
    for (const edge of edges) {
      addEdgeInternal(edge);
    }
  }, [nodes, edges]);

  // ---- Frame callback -------------------------------------------------------

  const onFrame = useCallback((_deltaTime: number, _scene: SceneGraph) => {
    if (!runningRef.current) return;

    const simNodes = simNodesRef.current;
    const simEdges = simEdgesRef.current;
    const config = simConfigRef.current;

    // Step simulation
    stepSimulation(simNodes, simEdges, config);

    // Update node SceneObject positions
    for (const [nodeId, state] of nodeStatesRef.current) {
      const simNode = simNodes.get(nodeId);
      if (!simNode) continue;

      // Find the scene object and update position
      scene.traverse((obj: SceneObject) => {
        if (obj.id === state.sceneObjectId) {
          obj.position = {
            x: simNode.position.x,
            y: simNode.position.y,
            z: simNode.position.z,
          };
        }
      });
    }

    // Update edge SceneObject transforms
    for (const [, edgeState] of edgeStatesRef.current) {
      const sourceNode = simNodes.get(edgeState.config.source);
      const targetNode = simNodes.get(edgeState.config.target);
      if (!sourceNode || !targetNode) continue;

      const thickness = edgeState.config.thickness ?? 0.1;

      scene.traverse((obj: SceneObject) => {
        if (obj.id === edgeState.sceneObjectId) {
          updateEdgeTransform(obj, sourceNode.position, targetNode.position, thickness);
        }
      });
    }

    // Check convergence
    const energy = computeKineticEnergy(simNodes);
    if (energy < 0.001) {
      runningRef.current = false;
    }
  }, []);

  // ---- Camera ---------------------------------------------------------------

  const computeCameraDistance = useCallback((): number => {
    if (cameraDistance !== undefined) return cameraDistance;

    // Auto-fit: compute bounding sphere of nodes
    const simNodes = simNodesRef.current;
    if (simNodes.size === 0) return 30;

    let maxDist = 0;
    for (const node of simNodes.values()) {
      const d = Math.sqrt(
        node.position.x * node.position.x
        + node.position.y * node.position.y
        + node.position.z * node.position.z,
      );
      if (d > maxDist) maxDist = d;
    }
    return Math.max(30, maxDist * 2.5);
  }, [cameraDistance]);

  const cameras = useMemo(() => {
    const dist = computeCameraDistance();
    const cam = new Camera({
      position: { x: 0, y: dist * 0.3, z: dist },
      fov: Math.PI / 4,
      aspect: width / height,
      near: 0.1,
      far: 1000,
    });
    cam.lookAt({ x: 0, y: 0, z: 0 });
    return [cam];
  }, [width, height]);

  // ---- Imperative API -------------------------------------------------------

  useEffect(() => {
    if (!apiRef) return;

    const api: ForceGraph3DAPI = {
      addNode: (node: ForceGraph3DNode) => {
        addNodeInternal(node);
      },
      removeNode: (nodeId: string) => {
        removeNodeInternal(nodeId);
      },
      addEdge: (edge: ForceGraph3DEdge) => {
        addEdgeInternal(edge);
      },
      removeEdge: (source: string, target: string) => {
        removeEdgeInternal(source, target);
      },
      updateNode: (nodeId: string, updates: Partial<ForceGraph3DNode>) => {
        const ns = nodeStatesRef.current;
        const state = ns.get(nodeId);
        if (!state) return;

        const newConfig = { ...state.config, ...updates };
        state.config = newConfig;

        // Update sim node
        const simNode = simNodesRef.current.get(nodeId);
        if (simNode) {
          if (updates.mass !== undefined) simNode.mass = Math.max(0.001, updates.mass);
          if (updates.fixed !== undefined) simNode.fixed = updates.fixed;
          if (updates.position !== undefined) {
            (simNode.position as { x: number; y: number; z: number }).x = updates.position.x;
            (simNode.position as { x: number; y: number; z: number }).y = updates.position.y;
            (simNode.position as { x: number; y: number; z: number }).z = updates.position.z;
          }
        }
      },
      updateEdge: (source: string, target: string, updates: Partial<ForceGraph3DEdge>) => {
        const es = edgeStatesRef.current;
        const key = edgeKey(source, target);
        const state = es.get(key);
        if (!state) return;

        state.config = { ...state.config, ...updates };

        // Update sim edge
        const simEdge = simEdgesRef.current.find(
          e => e.source === source && e.target === target,
        );
        if (simEdge) {
          if (updates.length !== undefined) simEdge.restLength = updates.length;
          if (updates.stiffness !== undefined) simEdge.stiffness = updates.stiffness;
        }
      },
      getNodePositions: (): Map<string, Vec3> => {
        const result = new Map<string, Vec3>();
        for (const [id, simNode] of simNodesRef.current) {
          result.set(id, {
            x: simNode.position.x,
            y: simNode.position.y,
            z: simNode.position.z,
          });
        }
        return result;
      },
      setRunning: (r: boolean) => {
        runningRef.current = r;
      },
      resetPositions: () => {
        for (const [nodeId, state] of nodeStatesRef.current) {
          const simNode = simNodesRef.current.get(nodeId);
          if (!simNode) continue;
          const pos = state.config.position ?? {
            x: (Math.random() - 0.5) * 20,
            y: (Math.random() - 0.5) * 20,
            z: (Math.random() - 0.5) * 20,
          };
          (simNode.position as { x: number; y: number; z: number }).x = pos.x;
          (simNode.position as { x: number; y: number; z: number }).y = pos.y;
          (simNode.position as { x: number; y: number; z: number }).z = pos.z;
          (simNode.velocity as { x: number; y: number; z: number }).x = 0;
          (simNode.velocity as { x: number; y: number; z: number }).y = 0;
          (simNode.velocity as { x: number; y: number; z: number }).z = 0;
        }
        runningRef.current = true;
      },
      fitCamera: () => {
        const dist = computeCameraDistance();
        if (cameras.length > 0) {
          cameras[0]!.position = { x: 0, y: dist * 0.3, z: dist };
          cameras[0]!.lookAt({ x: 0, y: 0, z: 0 });
        }
      },
      loadGraph: (graph: { nodes: ForceGraph3DNode[]; edges: ForceGraph3DEdge[] }) => {
        // Clear everything
        for (const [, ns] of nodeStatesRef.current) {
          scene.unregister(ns.sceneObjectId);
        }
        for (const [, es] of edgeStatesRef.current) {
          scene.unregister(es.sceneObjectId);
        }
        nodeStatesRef.current.clear();
        edgeStatesRef.current.clear();
        simNodesRef.current.clear();
        simEdgesRef.current = [];

        // Re-add
        for (const node of graph.nodes) {
          addNodeInternal(node);
        }
        for (const edge of graph.edges) {
          addEdgeInternal(edge);
        }
        runningRef.current = true;
      },
      getSceneGraph: () => scene,
    };

    apiRef(api);
  }, [apiRef]);

  // ---- Collect scene objects for Space3D ------------------------------------
  // Trigger re-render after objects are registered in the effect.
  const [sceneVersion, setSceneVersion] = useState(0);
  useEffect(() => {
    setSceneVersion((v: number) => v + 1);
  }, [nodes, edges]);

  // Collect objects on every render — the scene graph traversal is cheap.
  const sceneObjects: SceneObject[] = [];
  scene.traverse((obj: SceneObject) => {
    sceneObjects.push(obj);
  });

  // ---- Render ---------------------------------------------------------------

  return Space3D({
    width,
    height,
    onFrame,
    cameras,
    objects: sceneObjects,
    lightingModel,
  });
}
