// (c) 2025-2026 Asymmetric Effort, LLC. MIT LICENSE
// SPDX-License-Identifier: MIT

/**
 * ForceGraph3D — A SpecifyJS component that renders force-directed graph
 * layouts in 3D space, projected to SVG via perspective projection.
 *
 * Supports:
 *  - Physics-based 3D node positioning (Coulomb repulsion + Hooke spring attraction)
 *  - Animated simulation via requestAnimationFrame with convergence detection
 *  - Camera orbit via mouse drag, zoom via scroll wheel
 *  - Node click/hover callbacks
 *  - Configurable forces (repulsion, attraction, damping)
 *  - Node labels (billboarded — always face camera)
 *  - Depth-sorted rendering (painter's algorithm)
 *
 * Zero runtime dependencies — pure SpecifyJS + SVG.
 */

import { createElement } from '../../../../core/src/index';
import {
  useState,
  useEffect,
  useMemo,
  useCallback,
  useRef,
} from '../../../../core/src/hooks/index';

// -- Data types ---------------------------------------------------------------

/** A node in the 3D force graph. */
export interface ForceGraph3DNode {
  id: string;
  label?: string;
  /** Initial position (randomized if omitted) */
  x?: number;
  y?: number;
  z?: number;
  /** Node size. Default: 5 */
  size?: number;
  /** Node color. Default: '#3b82f6' */
  color?: string;
  /** Arbitrary metadata accessible in callbacks */
  data?: Record<string, unknown>;
}

/** An edge in the 3D force graph. */
export interface ForceGraph3DEdge {
  source: string;
  target: string;
  /** Edge color. Default: '#94a3b8' */
  color?: string;
  /** Edge width. Default: 1 */
  width?: number;
  /** Edge label */
  label?: string;
}

// -- Props --------------------------------------------------------------------

export interface ForceGraph3DProps {
  /** Node definitions */
  nodes: ForceGraph3DNode[];
  /** Edge definitions (references node ids) */
  edges: ForceGraph3DEdge[];
  /** Canvas width. Default: 600 */
  width?: number;
  /** Canvas height. Default: 400 */
  height?: number;
  /** Force simulation parameters */
  simulation?: {
    /** Repulsion strength between nodes. Default: -100 */
    repulsion?: number;
    /** Spring strength for edges. Default: 0.01 */
    springStrength?: number;
    /** Ideal spring length. Default: 100 */
    springLength?: number;
    /** Velocity damping per tick. Default: 0.9 */
    damping?: number;
    /** Simulation iterations per frame. Default: 1 */
    iterations?: number;
  };
  /** Camera controls */
  camera?: {
    /** Initial distance from origin. Default: 300 */
    distance?: number;
    /** Auto-rotate speed (degrees/sec, 0 to disable). Default: 0 */
    autoRotateSpeed?: number;
  };
  /** Called when a node is clicked */
  onNodeClick?: (node: ForceGraph3DNode) => void;
  /** Called when a node is hovered */
  onNodeHover?: (node: ForceGraph3DNode | null) => void;
  /** Background color. Default: '#0f172a' */
  backgroundColor?: string;
}

// -- Internal simulation state ------------------------------------------------

/** Internal simulation node with velocity. */
export interface ForceGraph3DSimNode {
  id: string;
  label: string;
  x: number;
  y: number;
  z: number;
  vx: number;
  vy: number;
  vz: number;
  size: number;
  color: string;
  data: Record<string, unknown>;
}

// -- Camera state -------------------------------------------------------------

interface CameraState {
  /** Azimuth angle in radians (horizontal orbit) */
  azimuth: number;
  /** Elevation angle in radians (vertical orbit, clamped) */
  elevation: number;
  /** Distance from origin */
  distance: number;
}

// -- Default palette ----------------------------------------------------------

const DEFAULT_PALETTE = [
  '#3b82f6',
  '#ef4444',
  '#22c55e',
  '#f59e0b',
  '#8b5cf6',
  '#ec4899',
  '#14b8a6',
  '#f97316',
  '#6366f1',
  '#84cc16',
];

function defaultColor(index: number): string {
  return DEFAULT_PALETTE[index % DEFAULT_PALETTE.length]!;
}

// -- Simulation helpers -------------------------------------------------------

/** Initialize simulation nodes from props using spherical distribution. */
export function initSimNodes3D(
  nodes: ForceGraph3DNode[],
): ForceGraph3DSimNode[] {
  const count = nodes.length;
  const radius = 50;

  const result: ForceGraph3DSimNode[] = [];
  for (let i = 0; i < count; i++) {
    const n = nodes[i]!;
    // Distribute on a sphere using the golden angle
    const phi = Math.acos(1 - (2 * (i + 0.5)) / Math.max(count, 1));
    const theta = Math.PI * (1 + Math.sqrt(5)) * i;
    result.push({
      id: n.id,
      label: n.label ?? n.id,
      x: n.x ?? radius * Math.sin(phi) * Math.cos(theta),
      y: n.y ?? radius * Math.sin(phi) * Math.sin(theta),
      z: n.z ?? radius * Math.cos(phi),
      vx: 0,
      vy: 0,
      vz: 0,
      size: n.size ?? 5,
      color: n.color ?? defaultColor(i),
      data: n.data ?? {},
    });
  }
  return result;
}

/**
 * Run one tick of the 3D force simulation. Returns new node states.
 *
 * Forces:
 *  - Coulomb repulsion between all node pairs (O(n^2))
 *  - Hooke spring attraction along edges
 *  - Center gravity — gentle pull toward origin
 */
export function simulationTick3D(
  simNodes: ForceGraph3DSimNode[],
  edges: ForceGraph3DEdge[],
  repulsion: number,
  springStrength: number,
  springLength: number,
  damping: number,
): ForceGraph3DSimNode[] {
  const count = simNodes.length;
  if (count === 0) return simNodes;

  // Build index for fast lookup
  const indexMap = new Map<string, number>();
  for (let i = 0; i < count; i++) {
    indexMap.set(simNodes[i]!.id, i);
  }

  // Accumulate forces
  const fx = new Float64Array(count);
  const fy = new Float64Array(count);
  const fz = new Float64Array(count);

  // Repulsion: Coulomb-like force between all pairs
  // repulsion is negative (e.g. -100) so force pushes nodes apart
  for (let i = 0; i < count; i++) {
    const ni = simNodes[i]!;
    for (let j = i + 1; j < count; j++) {
      const nj = simNodes[j]!;
      const dx = ni.x - nj.x;
      const dy = ni.y - nj.y;
      const dz = ni.z - nj.z;
      let distSq = dx * dx + dy * dy + dz * dz;
      if (distSq < 1) distSq = 1;
      const dist = Math.sqrt(distSq);
      // Negative repulsion => push apart (force away from other node)
      const force = -repulsion / distSq;
      const forceX = (dx / dist) * force;
      const forceY = (dy / dist) * force;
      const forceZ = (dz / dist) * force;
      fx[i] += forceX;
      fy[i] += forceY;
      fz[i] += forceZ;
      fx[j] -= forceX;
      fy[j] -= forceY;
      fz[j] -= forceZ;
    }
  }

  // Attraction: spring force along edges (Hooke's law)
  for (let e = 0; e < edges.length; e++) {
    const edge = edges[e]!;
    const si = indexMap.get(edge.source);
    const ti = indexMap.get(edge.target);
    if (si === undefined || ti === undefined) continue;

    const ns = simNodes[si]!;
    const nt = simNodes[ti]!;
    const dx = nt.x - ns.x;
    const dy = nt.y - ns.y;
    const dz = nt.z - ns.z;
    const dist = Math.sqrt(dx * dx + dy * dy + dz * dz);
    if (dist < 0.1) continue;

    const displacement = dist - springLength;
    const force = springStrength * displacement;
    const forceX = (dx / dist) * force;
    const forceY = (dy / dist) * force;
    const forceZ = (dz / dist) * force;

    fx[si] += forceX;
    fy[si] += forceY;
    fz[si] += forceZ;
    fx[ti] -= forceX;
    fy[ti] -= forceY;
    fz[ti] -= forceZ;
  }

  // Center gravity — gentle pull toward origin
  const centerForce = 0.001;
  for (let i = 0; i < count; i++) {
    const n = simNodes[i]!;
    fx[i] -= n.x * centerForce;
    fy[i] -= n.y * centerForce;
    fz[i] -= n.z * centerForce;
  }

  // Update velocities and positions (Velocity Verlet integration with damping)
  const result: ForceGraph3DSimNode[] = [];
  for (let i = 0; i < count; i++) {
    const n = simNodes[i]!;
    let vx = (n.vx + fx[i]) * damping;
    let vy = (n.vy + fy[i]) * damping;
    let vz = (n.vz + fz[i]) * damping;

    // Clamp velocity
    const speed = Math.sqrt(vx * vx + vy * vy + vz * vz);
    const maxSpeed = 10;
    if (speed > maxSpeed) {
      const scale = maxSpeed / speed;
      vx *= scale;
      vy *= scale;
      vz *= scale;
    }

    result.push({
      ...n,
      x: n.x + vx,
      y: n.y + vy,
      z: n.z + vz,
      vx,
      vy,
      vz,
    });
  }

  return result;
}

/** Compute total kinetic energy to determine when simulation is settled. */
export function kineticEnergy3D(simNodes: ForceGraph3DSimNode[]): number {
  let energy = 0;
  for (let i = 0; i < simNodes.length; i++) {
    const n = simNodes[i]!;
    energy += n.vx * n.vx + n.vy * n.vy + n.vz * n.vz;
  }
  return energy;
}

// -- 3D projection helpers ---------------------------------------------------

/** Compute camera position from spherical coordinates. */
export function cameraPosition(cam: CameraState): { x: number; y: number; z: number } {
  return {
    x: cam.distance * Math.cos(cam.elevation) * Math.sin(cam.azimuth),
    y: cam.distance * Math.sin(cam.elevation),
    z: cam.distance * Math.cos(cam.elevation) * Math.cos(cam.azimuth),
  };
}

/**
 * Project a 3D point to 2D screen coordinates using perspective projection.
 * Returns { sx, sy, depth } where sx/sy are screen coords and depth is for sorting.
 * Returns null if the point is behind the camera.
 *
 * The camera orbits around the origin. Its "forward" direction is from camPos
 * toward the origin. We build an orthonormal camera basis (right, up, forward)
 * and project the camera-to-point vector onto that basis.
 */
export function projectPoint(
  px: number, py: number, pz: number,
  camPos: { x: number; y: number; z: number },
  camAzimuth: number,
  camElevation: number,
  width: number,
  height: number,
  fov: number,
): { sx: number; sy: number; depth: number } | null {
  // Forward direction: camera looks toward the origin
  const fwdLen = Math.sqrt(camPos.x * camPos.x + camPos.y * camPos.y + camPos.z * camPos.z);
  if (fwdLen < 0.0001) return null;

  const fwdX = -camPos.x / fwdLen;
  const fwdY = -camPos.y / fwdLen;
  const fwdZ = -camPos.z / fwdLen;

  // World up
  const worldUpX = 0;
  const worldUpY = 1;
  const worldUpZ = 0;

  // Right = forward x worldUp (cross product)
  let rightX = fwdY * worldUpZ - fwdZ * worldUpY;
  let rightY = fwdZ * worldUpX - fwdX * worldUpZ;
  let rightZ = fwdX * worldUpY - fwdY * worldUpX;
  const rightLen = Math.sqrt(rightX * rightX + rightY * rightY + rightZ * rightZ);
  if (rightLen < 0.0001) {
    // Camera looking straight up/down — use fallback right vector
    rightX = 1;
    rightY = 0;
    rightZ = 0;
  } else {
    rightX /= rightLen;
    rightY /= rightLen;
    rightZ /= rightLen;
  }

  // Up = right x forward
  const upX = rightY * fwdZ - rightZ * fwdY;
  const upY = rightZ * fwdX - rightX * fwdZ;
  const upZ = rightX * fwdY - rightY * fwdX;

  // Vector from camera to point
  const dx = px - camPos.x;
  const dy = py - camPos.y;
  const dz = pz - camPos.z;

  // Project onto camera basis
  const rx = dx * rightX + dy * rightY + dz * rightZ;
  const ry = dx * upX + dy * upY + dz * upZ;
  const rz = dx * fwdX + dy * fwdY + dz * fwdZ; // depth along forward

  if (rz < 0.1) return null; // Behind camera or too close

  const depth = rz;
  const scale = (fov * Math.min(width, height) * 0.5) / depth;
  const sx = width / 2 + rx * scale;
  const sy = height / 2 - ry * scale; // flip Y for screen coords

  return { sx, sy, depth };
}

// -- Component ----------------------------------------------------------------

export function ForceGraph3D(props: ForceGraph3DProps) {
  const {
    nodes,
    edges,
    width = 600,
    height = 400,
    simulation,
    camera,
    onNodeClick,
    onNodeHover,
    backgroundColor = '#0f172a',
  } = props;

  const repulsion = simulation?.repulsion ?? -100;
  const springStrength = simulation?.springStrength ?? 0.01;
  const springLength = simulation?.springLength ?? 100;
  const damping = simulation?.damping ?? 0.9;
  const iterations = simulation?.iterations ?? 1;
  const cameraDistance = camera?.distance ?? 300;
  const autoRotateSpeed = camera?.autoRotateSpeed ?? 0;

  // Handle empty data
  if (!nodes || nodes.length === 0) {
    return createElement(
      'svg',
      {
        width: '100%',
        viewBox: `0 0 ${width} ${height}`,
        preserveAspectRatio: 'xMidYMid meet',
        xmlns: 'http://www.w3.org/2000/svg',
        role: 'img',
        'aria-label': 'Empty 3D force-directed graph',
      },
      createElement('rect', {
        key: 'bg',
        x: '0',
        y: '0',
        width: String(width),
        height: String(height),
        fill: backgroundColor,
      }),
      createElement(
        'text',
        {
          key: 'empty-text',
          x: String(width / 2),
          y: String(height / 2),
          'text-anchor': 'middle',
          'font-size': '14',
          'font-family': 'sans-serif',
          fill: '#6b7280',
        },
        'No data',
      ),
    );
  }

  // ── Simulation state ──────────────────────────────────────────────
  const simRef = useRef<ForceGraph3DSimNode[]>(initSimNodes3D(nodes));
  const [tick, setTick] = useState(0);
  const runningRef = useRef(true);
  const settledRef = useRef(false);

  // Camera state in ref
  const cameraRef = useRef<CameraState>({
    azimuth: Math.PI / 4,
    elevation: Math.PI / 6,
    distance: cameraDistance,
  });

  // Drag state
  const isDraggingRef = useRef(false);
  const lastMouseRef = useRef<{ x: number; y: number }>({ x: 0, y: 0 });
  const svgRef = useRef<SVGSVGElement | null>(null);

  // Hovered node
  const hoveredNodeRef = useRef<string | null>(null);

  // Store edges/config in refs for animation loop
  const edgesRef = useRef(edges);
  edgesRef.current = edges;
  const configRef = useRef({
    repulsion, springStrength, springLength, damping, iterations, autoRotateSpeed,
  });
  configRef.current = {
    repulsion, springStrength, springLength, damping, iterations, autoRotateSpeed,
  };

  // Callback refs
  const onNodeClickRef = useRef(onNodeClick);
  onNodeClickRef.current = onNodeClick;
  const onNodeHoverRef = useRef(onNodeHover);
  onNodeHoverRef.current = onNodeHover;

  // Re-initialize when nodes change
  useEffect(() => {
    simRef.current = initSimNodes3D(nodes);
    settledRef.current = false;
    runningRef.current = true;
    setTick((t: number) => t + 1);
  }, [nodes.length]);

  // Animation loop
  useEffect(() => {
    let frameId = 0;
    let lastTime = 0;
    const animate = (time: number) => {
      if (!runningRef.current) return;
      const cfg = configRef.current;

      // Auto-rotate
      if (cfg.autoRotateSpeed !== 0 && !isDraggingRef.current) {
        const dt = lastTime > 0 ? (time - lastTime) / 1000 : 0;
        cameraRef.current = {
          ...cameraRef.current,
          azimuth: cameraRef.current.azimuth + (cfg.autoRotateSpeed * Math.PI / 180) * dt,
        };
      }
      lastTime = time;

      // Run simulation iterations
      let current = simRef.current;
      for (let iter = 0; iter < cfg.iterations; iter++) {
        current = simulationTick3D(
          current,
          edgesRef.current,
          cfg.repulsion,
          cfg.springStrength,
          cfg.springLength,
          cfg.damping,
        );
      }
      simRef.current = current;

      // Check for convergence
      if (kineticEnergy3D(current) < 0.01 && cfg.autoRotateSpeed === 0) {
        settledRef.current = true;
        setTick((t: number) => t + 1);
        return;
      }

      setTick((t: number) => t + 1);
      frameId = requestAnimationFrame(animate) as unknown as number;
    };
    frameId = requestAnimationFrame(animate) as unknown as number;
    return () => {
      runningRef.current = false;
      cancelAnimationFrame(frameId);
    };
  }, []);

  // Current simulation snapshot
  const simNodes = simRef.current;
  void tick; // drives re-render

  // ── Mouse interaction handlers ────────────────────────────────────

  const getSvgCoords = useCallback((e: Event): { x: number; y: number } => {
    const me = e as MouseEvent;
    const svg = svgRef.current;
    if (!svg) return { x: me.clientX, y: me.clientY };
    const rect = (svg as unknown as Element).getBoundingClientRect();
    const scaleX = width / rect.width;
    const scaleY = height / rect.height;
    return {
      x: (me.clientX - rect.left) * scaleX,
      y: (me.clientY - rect.top) * scaleY,
    };
  }, [width, height]);

  // Camera orbit drag
  const handleMouseDown = useCallback((e: Event) => {
    const pt = getSvgCoords(e);
    isDraggingRef.current = true;
    lastMouseRef.current = pt;
  }, [getSvgCoords]);

  const handleMouseMove = useCallback((e: Event) => {
    const pt = getSvgCoords(e);

    if (isDraggingRef.current) {
      const dx = pt.x - lastMouseRef.current.x;
      const dy = pt.y - lastMouseRef.current.y;
      lastMouseRef.current = pt;

      const cam = cameraRef.current;
      const sensitivity = 0.005;
      cameraRef.current = {
        ...cam,
        azimuth: cam.azimuth + dx * sensitivity,
        elevation: Math.max(-Math.PI / 2 + 0.01, Math.min(Math.PI / 2 - 0.01,
          cam.elevation - dy * sensitivity)),
      };

      // Wake simulation for re-render even if settled
      if (settledRef.current) {
        settledRef.current = false;
        runningRef.current = true;
      }
      setTick((t: number) => t + 1);
      return;
    }

    // Hover detection — find nearest projected node
    const cam = cameraRef.current;
    const camPos = cameraPosition(cam);
    const fov = 1.5;
    let closestId: string | null = null;
    let closestDistSq = Infinity;

    for (let i = 0; i < simNodes.length; i++) {
      const n = simNodes[i]!;
      const proj = projectPoint(n.x, n.y, n.z, camPos, cam.azimuth, cam.elevation, width, height, fov);
      if (!proj) continue;
      const ddx = proj.sx - pt.x;
      const ddy = proj.sy - pt.y;
      const dSq = ddx * ddx + ddy * ddy;
      // Hit radius based on projected node size
      const hitRadius = Math.max(8, n.size * (fov * Math.min(width, height) * 0.5) / proj.depth);
      if (dSq < hitRadius * hitRadius && dSq < closestDistSq) {
        closestDistSq = dSq;
        closestId = n.id;
      }
    }

    if (closestId !== hoveredNodeRef.current) {
      hoveredNodeRef.current = closestId;
      if (onNodeHoverRef.current) {
        if (closestId) {
          const node = nodes.find(n => n.id === closestId) ?? null;
          onNodeHoverRef.current(node);
        } else {
          onNodeHoverRef.current(null);
        }
      }
      setTick((t: number) => t + 1);
    }
  }, [getSvgCoords, width, height]);

  const handleMouseUp = useCallback(() => {
    isDraggingRef.current = false;
  }, []);

  const handleMouseLeave = useCallback(() => {
    isDraggingRef.current = false;
    if (hoveredNodeRef.current !== null) {
      hoveredNodeRef.current = null;
      if (onNodeHoverRef.current) {
        onNodeHoverRef.current(null);
      }
    }
  }, []);

  // Zoom via scroll
  const handleWheel = useCallback((e: Event) => {
    const we = e as WheelEvent;
    const cam = cameraRef.current;
    const zoomFactor = 1 + (we.deltaY > 0 ? 0.1 : -0.1);
    cameraRef.current = {
      ...cam,
      distance: Math.max(50, Math.min(2000, cam.distance * zoomFactor)),
    };
    if (settledRef.current) {
      settledRef.current = false;
      runningRef.current = true;
    }
    setTick((t: number) => t + 1);
  }, []);

  // Click handler
  const handleClick = useCallback((e: Event) => {
    if (!onNodeClickRef.current) return;
    const pt = getSvgCoords(e);
    const cam = cameraRef.current;
    const camPos = cameraPosition(cam);
    const fov = 1.5;
    let closestNode: ForceGraph3DNode | null = null;
    let closestDistSq = Infinity;

    for (let i = 0; i < simNodes.length; i++) {
      const n = simNodes[i]!;
      const proj = projectPoint(n.x, n.y, n.z, camPos, cam.azimuth, cam.elevation, width, height, fov);
      if (!proj) continue;
      const ddx = proj.sx - pt.x;
      const ddy = proj.sy - pt.y;
      const dSq = ddx * ddx + ddy * ddy;
      const hitRadius = Math.max(8, n.size * (fov * Math.min(width, height) * 0.5) / proj.depth);
      if (dSq < hitRadius * hitRadius && dSq < closestDistSq) {
        closestDistSq = dSq;
        closestNode = nodes.find(nd => nd.id === n.id) ?? null;
      }
    }

    if (closestNode) {
      onNodeClickRef.current(closestNode);
    }
  }, [getSvgCoords, width, height]);

  // ── Projection & rendering ────────────────────────────────────────

  const cam = cameraRef.current;
  const camPos = cameraPosition(cam);
  const fov = 1.5;

  // Build projected node data with depth sorting
  const projectedNodes = useMemo(() => {
    const projected: {
      node: ForceGraph3DSimNode;
      sx: number;
      sy: number;
      depth: number;
      projectedSize: number;
    }[] = [];

    for (let i = 0; i < simNodes.length; i++) {
      const n = simNodes[i]!;
      const proj = projectPoint(n.x, n.y, n.z, camPos, cam.azimuth, cam.elevation, width, height, fov);
      if (!proj) continue;
      const projectedSize = Math.max(2, n.size * (fov * Math.min(width, height) * 0.5) / proj.depth);
      projected.push({ node: n, sx: proj.sx, sy: proj.sy, depth: proj.depth, projectedSize });
    }

    // Sort back-to-front (painter's algorithm)
    projected.sort((a, b) => b.depth - a.depth);
    return projected;
  }, [tick]);

  // Build projected edges
  const projectedEdges = useMemo(() => {
    const nodeProjections = new Map<string, { sx: number; sy: number; depth: number }>();
    for (let i = 0; i < simNodes.length; i++) {
      const n = simNodes[i]!;
      const proj = projectPoint(n.x, n.y, n.z, camPos, cam.azimuth, cam.elevation, width, height, fov);
      if (proj) nodeProjections.set(n.id, proj);
    }

    const result: {
      edge: ForceGraph3DEdge;
      x1: number; y1: number;
      x2: number; y2: number;
      depth: number;
    }[] = [];

    for (let i = 0; i < edges.length; i++) {
      const edge = edges[i]!;
      const sp = nodeProjections.get(edge.source);
      const tp = nodeProjections.get(edge.target);
      if (!sp || !tp) continue;
      result.push({
        edge,
        x1: sp.sx, y1: sp.sy,
        x2: tp.sx, y2: tp.sy,
        depth: Math.max(sp.depth, tp.depth),
      });
    }

    // Sort back-to-front
    result.sort((a, b) => b.depth - a.depth);
    return result;
  }, [tick]);

  // ── Build SVG elements ────────────────────────────────────────────

  // Background
  const bgRect = createElement('rect', {
    key: 'bg',
    x: '0',
    y: '0',
    width: String(width),
    height: String(height),
    fill: backgroundColor,
  });

  // Edges
  const edgeElements: ReturnType<typeof createElement>[] = [];
  for (let i = 0; i < projectedEdges.length; i++) {
    const pe = projectedEdges[i]!;
    const opacity = Math.max(0.1, Math.min(0.8, 100 / pe.depth));
    edgeElements.push(
      createElement('line', {
        key: `edge-${i}`,
        x1: String(pe.x1),
        y1: String(pe.y1),
        x2: String(pe.x2),
        y2: String(pe.y2),
        stroke: pe.edge.color ?? '#94a3b8',
        'stroke-width': String(pe.edge.width ?? 1),
        'stroke-opacity': String(opacity),
      }),
    );
  }

  // Nodes
  const nodeElements: ReturnType<typeof createElement>[] = [];
  for (let i = 0; i < projectedNodes.length; i++) {
    const pn = projectedNodes[i]!;
    const isHovered = hoveredNodeRef.current === pn.node.id;
    const opacity = Math.max(0.3, Math.min(1, 150 / pn.depth));

    // Node circle
    nodeElements.push(
      createElement('circle', {
        key: `node-${pn.node.id}`,
        cx: String(pn.sx),
        cy: String(pn.sy),
        r: String(pn.projectedSize),
        fill: pn.node.color,
        stroke: isHovered ? '#ffffff' : 'rgba(255,255,255,0.3)',
        'stroke-width': isHovered ? '2' : '1',
        opacity: String(opacity),
        style: { cursor: 'pointer' },
        role: 'button',
        tabIndex: 0,
        'aria-label': `Node: ${pn.node.label}`,
      }),
    );

    // Label (billboarded — always rendered horizontally)
    const fontSize = Math.max(8, Math.min(14, 10 * (150 / pn.depth)));
    nodeElements.push(
      createElement('text', {
        key: `label-${pn.node.id}`,
        x: String(pn.sx),
        y: String(pn.sy + pn.projectedSize + fontSize * 0.9),
        'text-anchor': 'middle',
        'font-size': String(Math.round(fontSize)),
        'font-family': 'sans-serif',
        fill: '#e2e8f0',
        opacity: String(Math.max(0.2, opacity - 0.2)),
        'pointer-events': 'none',
      }, pn.node.label),
    );
  }

  // ── Assemble SVG ──────────────────────────────────────────────────

  return createElement(
    'svg',
    {
      ref: svgRef,
      width: '100%',
      viewBox: `0 0 ${width} ${height}`,
      preserveAspectRatio: 'xMidYMid meet',
      xmlns: 'http://www.w3.org/2000/svg',
      role: 'img',
      'aria-label': '3D force-directed graph — drag to orbit, scroll to zoom',
      style: {
        fontFamily: 'sans-serif',
        cursor: isDraggingRef.current ? 'grabbing' : 'grab',
        userSelect: 'none',
      },
      onMouseDown: handleMouseDown,
      onMouseMove: handleMouseMove,
      onMouseUp: handleMouseUp,
      onMouseLeave: handleMouseLeave,
      onWheel: handleWheel,
      onClick: handleClick,
    },
    bgRect,
    ...edgeElements,
    ...nodeElements,
  );
}
