// (c) 2025-2026 Asymmetric Effort, LLC. MIT LICENSE
// SPDX-License-Identifier: MIT

import type { Vec3 } from '../../../math/src/vec';
import type { Color } from '../../3dSpace/src/types';
import type { PolyhedronGeometry } from '../../3dSpace/src/geom-polyhedron';
import type { LightingModel } from '../../3dSpace/src/lighting-model';
import type { SceneGraph } from '../../3dSpace/src/scene-graph';

/** A node in the 3D force graph. */
export interface ForceGraph3DNode {
  id: string;
  label?: string;
  position?: Vec3;
  shape?: 'sphere' | 'cube' | 'tetrahedron' | 'octahedron' | 'icosahedron' | 'custom';
  customGeometry?: PolyhedronGeometry;
  /** Radius for spheres, scale for polyhedra. Default: 1.0. */
  size?: number;
  color?: Color;
  textColor?: Color;
  /** Exempt from force simulation. Default: false. */
  fixed?: boolean;
  /** Affects force response. Default: 1.0. */
  mass?: number;
  /** Collision sphere radius. Defaults to size. */
  collisionRadius?: number;
}

/** An edge in the 3D force graph. */
export interface ForceGraph3DEdge {
  source: string;
  target: string;
  /** Default: 'cylinder-solid'. */
  style?: 'cylinder-solid' | 'cylinder-mesh' | 'line';
  /** Cylinder radius or line width. Default: 0.1. */
  thickness?: number;
  color?: Color;
  /** Rest length for spring force. Default: auto-computed. */
  length?: number;
  /** Spring constant. Default: 0.1. */
  stiffness?: number;
}

/** Props for the ForceGraph3D component. */
export interface ForceGraph3DProps {
  width: number;
  height: number;
  nodes: ForceGraph3DNode[];
  edges: ForceGraph3DEdge[];
  /** Default: +/-50 on all axes. */
  bounds?: { min: Vec3; max: Vec3 };
  /** Coulomb constant. Default: 100. */
  repulsionStrength?: number;
  /** Hooke constant. Default: 0.1. */
  attractionStrength?: number;
  /** Velocity decay 0-1. Default: 0.9. */
  damping?: number;
  /** Pull toward origin. Default: 0.01. */
  centerGravity?: number;
  /** Simulation active. Default: true. */
  running?: boolean;
  /** Seconds per step. Default: 0.016. */
  timeStep?: number;
  /** Default: auto-fit to graph. */
  cameraDistance?: number;
  /** Default: true. */
  orbitControls?: boolean;
  /** Enable sphere-sphere collision detection. Default: true. */
  collisionEnabled?: boolean;
  /** Coefficient of restitution (bounciness) 0-1. Default: 0.8. */
  restitution?: number;
  onNodeClick?: (nodeId: string, node: ForceGraph3DNode, event: MouseEvent) => void;
  onNodeDoubleClick?: (nodeId: string, node: ForceGraph3DNode, event: MouseEvent) => void;
  onNodeRightClick?: (nodeId: string, node: ForceGraph3DNode, event: MouseEvent) => void;
  onNodeMouseDown?: (nodeId: string, node: ForceGraph3DNode, event: MouseEvent) => void;
  onNodeMouseUp?: (nodeId: string, node: ForceGraph3DNode, event: MouseEvent) => void;
  onNodeHover?: (nodeId: string | null, node: ForceGraph3DNode | null, event: MouseEvent) => void;
  onEdgeClick?: (edge: ForceGraph3DEdge, event: MouseEvent) => void;
  onEdgeHover?: (edge: ForceGraph3DEdge | null, event: MouseEvent) => void;
  /** Dynamic API ref. */
  apiRef?: (api: ForceGraph3DAPI) => void;
  lightingModel?: LightingModel;
  backgroundColor?: Color;
}

/** Imperative API for dynamic graph manipulation. */
export interface ForceGraph3DAPI {
  addNode(node: ForceGraph3DNode): void;
  removeNode(nodeId: string): void;
  addEdge(edge: ForceGraph3DEdge): void;
  removeEdge(source: string, target: string): void;
  updateNode(nodeId: string, updates: Partial<ForceGraph3DNode>): void;
  updateEdge(source: string, target: string, updates: Partial<ForceGraph3DEdge>): void;
  getNodePositions(): Map<string, Vec3>;
  setRunning(running: boolean): void;
  resetPositions(): void;
  fitCamera(): void;
  loadGraph(graph: { nodes: ForceGraph3DNode[]; edges: ForceGraph3DEdge[] }): void;
  getSceneGraph(): SceneGraph;
}
