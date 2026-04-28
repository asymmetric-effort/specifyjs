// (c) 2025-2026 Asymmetric Effort, LLC. MIT LICENSE
// SPDX-License-Identifier: MIT

/**
 * ForceGraph — A SpecifyJS component that renders force-directed graph layouts as SVG.
 *
 * Supports:
 *  - Physics-based node positioning (repulsion + attraction)
 *  - Animated simulation via requestAnimationFrame
 *  - Directed edges with optional arrowheads
 *  - Node labels
 *  - Configurable forces (repulsion, attraction, damping)
 *  - Edge weights affecting attraction strength
 *  - Fixed (pinned) nodes
 *
 * Zero runtime dependencies — pure SpecifyJS + SVG.
 */

import { createElement } from "../../../../core/src/index";
import {
  useState,
  useEffect,
  useMemo,
  useCallback,
  useRef,
} from "../../../../core/src/hooks/index";

// -- Data types ---------------------------------------------------------------

export interface ForceNode {
  id: string;
  label?: string;
  color?: string;
  x?: number;
  y?: number;
  fixed?: boolean;
}

export interface ForceEdge {
  source: string;
  target: string;
  weight?: number;
  color?: string;
}

// -- Props --------------------------------------------------------------------

export interface ForceGraphProps {
  /** Array of nodes to render */
  nodes: ForceNode[];
  /** Array of edges connecting nodes */
  edges: ForceEdge[];
  /** SVG width in pixels (default: 600) */
  width?: number;
  /** SVG height in pixels (default: 400) */
  height?: number;
  /** Node circle radius in pixels (default: 12) */
  nodeRadius?: number;
  /** Show node labels (default: true) */
  showLabels?: boolean;
  /** Show arrowheads on edges (default: false) */
  showArrows?: boolean;
  /** Repulsion force between nodes (default: 300) */
  repulsionForce?: number;
  /** Attraction force along edges (default: 0.01) */
  attractionForce?: number;
  /** Velocity damping factor 0..1 (default: 0.9) */
  damping?: number;
  /** Ideal edge length in pixels (default: 100) */
  edgeLength?: number;
  /** Default edge stroke color (default: '#94a3b8') */
  edgeColor?: string;
  /** Default edge stroke width (default: 1.5) */
  edgeWidth?: number;
  /** Chart title */
  title?: string;
}

// -- Internal simulation state ------------------------------------------------

interface SimNode {
  id: string;
  label: string;
  color: string;
  x: number;
  y: number;
  vx: number;
  vy: number;
  fixed: boolean;
}

// -- Default palette ----------------------------------------------------------

const DEFAULT_PALETTE = [
  "#3b82f6",
  "#ef4444",
  "#22c55e",
  "#f59e0b",
  "#8b5cf6",
  "#ec4899",
  "#14b8a6",
  "#f97316",
  "#6366f1",
  "#84cc16",
];

function defaultColor(index: number): string {
  return DEFAULT_PALETTE[index % DEFAULT_PALETTE.length]!;
}

// -- Simulation helpers -------------------------------------------------------

/** Initialize simulation nodes from props. Uses deterministic circular layout for initial positions. */
function initSimNodes(
  nodes: ForceNode[],
  width: number,
  height: number,
): SimNode[] {
  const cx = width / 2;
  const cy = height / 2;
  const radius = Math.min(width, height) * 0.3;
  const count = nodes.length;

  const result: SimNode[] = [];
  for (let i = 0; i < count; i++) {
    const n = nodes[i]!;
    const angle = (2 * Math.PI * i) / Math.max(count, 1);
    result.push({
      id: n.id,
      label: n.label ?? n.id,
      color: n.color ?? defaultColor(i),
      x: n.x ?? cx + radius * Math.cos(angle),
      y: n.y ?? cy + radius * Math.sin(angle),
      vx: 0,
      vy: 0,
      fixed: n.fixed ?? false,
    });
  }
  return result;
}

/** Run one tick of the force simulation. Returns new node positions. */
function simulationTick(
  simNodes: SimNode[],
  edges: ForceEdge[],
  width: number,
  height: number,
  repulsion: number,
  attraction: number,
  damping: number,
  idealLength: number,
): SimNode[] {
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

  // Repulsion: Coulomb-like force between all pairs
  for (let i = 0; i < count; i++) {
    const ni = simNodes[i]!;
    for (let j = i + 1; j < count; j++) {
      const nj = simNodes[j]!;
      let dx = ni.x - nj.x;
      let dy = ni.y - nj.y;
      let distSq = dx * dx + dy * dy;
      if (distSq < 1) distSq = 1;
      const dist = Math.sqrt(distSq);
      const force = repulsion / distSq;
      const forceX = (dx / dist) * force;
      const forceY = (dy / dist) * force;
      fx[i] += forceX;
      fy[i] += forceY;
      fx[j] -= forceX;
      fy[j] -= forceY;
    }
  }

  // Attraction: spring force along edges
  for (let e = 0; e < edges.length; e++) {
    const edge = edges[e]!;
    const si = indexMap.get(edge.source);
    const ti = indexMap.get(edge.target);
    if (si === undefined || ti === undefined) continue;

    const ns = simNodes[si]!;
    const nt = simNodes[ti]!;
    const dx = nt.x - ns.x;
    const dy = nt.y - ns.y;
    const dist = Math.sqrt(dx * dx + dy * dy);
    if (dist < 0.1) continue;

    const weight = edge.weight ?? 1;
    const displacement = dist - idealLength;
    const force = attraction * displacement * weight;
    const forceX = (dx / dist) * force;
    const forceY = (dy / dist) * force;

    fx[si] += forceX;
    fy[si] += forceY;
    fx[ti] -= forceX;
    fy[ti] -= forceY;
  }

  // Center gravity — gentle pull toward center
  const cx = width / 2;
  const cy = height / 2;
  const centerForce = 0.001;
  for (let i = 0; i < count; i++) {
    const n = simNodes[i]!;
    fx[i] += (cx - n.x) * centerForce;
    fy[i] += (cy - n.y) * centerForce;
  }

  // Update velocities and positions
  const margin = 20;
  const result: SimNode[] = [];
  for (let i = 0; i < count; i++) {
    const n = simNodes[i]!;
    if (n.fixed) {
      result.push({ ...n, vx: 0, vy: 0 });
      continue;
    }

    let vx = (n.vx + fx[i]) * damping;
    let vy = (n.vy + fy[i]) * damping;

    // Clamp velocity
    const speed = Math.sqrt(vx * vx + vy * vy);
    const maxSpeed = 10;
    if (speed > maxSpeed) {
      vx = (vx / speed) * maxSpeed;
      vy = (vy / speed) * maxSpeed;
    }

    let x = n.x + vx;
    let y = n.y + vy;

    // Keep nodes within bounds
    x = Math.max(margin, Math.min(width - margin, x));
    y = Math.max(margin, Math.min(height - margin, y));

    result.push({ ...n, x, y, vx, vy });
  }

  return result;
}

/** Compute total kinetic energy to determine when simulation is settled. */
function kineticEnergy(simNodes: SimNode[]): number {
  let energy = 0;
  for (let i = 0; i < simNodes.length; i++) {
    const n = simNodes[i]!;
    energy += n.vx * n.vx + n.vy * n.vy;
  }
  return energy;
}

// -- Component ----------------------------------------------------------------

export function ForceGraph(props: ForceGraphProps) {
  const {
    nodes,
    edges,
    width = 600,
    height = 400,
    nodeRadius = 12,
    showLabels = true,
    showArrows = false,
    repulsionForce = 300,
    attractionForce = 0.01,
    damping = 0.9,
    edgeLength = 100,
    edgeColor = "#94a3b8",
    edgeWidth = 1.5,
    title,
  } = props;

  // Handle empty data
  if (!nodes || nodes.length === 0) {
    return createElement(
      "svg",
      {
        width: String(width),
        height: String(height),
        viewBox: `0 0 ${width} ${height}`,
        xmlns: "http://www.w3.org/2000/svg",
        role: "img",
        "aria-label": title ?? "Empty force-directed graph",
      },
      title
        ? createElement(
            "text",
            {
              x: String(width / 2),
              y: String(height / 2),
              "text-anchor": "middle",
              "font-size": "16",
              "font-weight": "bold",
              "font-family": "sans-serif",
              fill: "#111827",
            },
            title,
          )
        : createElement(
            "text",
            {
              x: String(width / 2),
              y: String(height / 2),
              "text-anchor": "middle",
              "font-size": "14",
              "font-family": "sans-serif",
              fill: "#6b7280",
            },
            "No data",
          ),
    );
  }

  // ── Animated physics simulation ────────────────────────────────────
  // Simulation state lives in a ref to avoid re-render loops.
  // A tick counter in useState triggers re-renders at animation frame rate.
  const simRef = useRef<SimNode[]>(initSimNodes(nodes, width, height));
  const [tick, setTick] = useState(0);
  const runningRef = useRef(true);
  const settledRef = useRef(false);

  // Store edges/config in refs so the animation effect has stable deps
  const edgesRef = useRef(edges);
  edgesRef.current = edges;
  const configRef = useRef({
    repulsionForce,
    attractionForce,
    damping,
    edgeLength,
    width,
    height,
  });
  configRef.current = {
    repulsionForce,
    attractionForce,
    damping,
    edgeLength,
    width,
    height,
  };

  // Re-initialize when nodes change
  useEffect(() => {
    simRef.current = initSimNodes(nodes, width, height);
    settledRef.current = false;
    runningRef.current = true;
    setTick((t: number) => t + 1);
  }, [nodes.length]);

  // Animation loop — runs once, reads from refs
  useEffect(() => {
    let frameId = 0;
    const animate = () => {
      if (!runningRef.current) return;
      const cfg = configRef.current;
      const next = simulationTick(
        simRef.current,
        edgesRef.current,
        cfg.width,
        cfg.height,
        cfg.repulsionForce,
        cfg.attractionForce,
        cfg.damping,
        cfg.edgeLength,
      );
      simRef.current = next;

      if (kineticEnergy(next) < 0.01) {
        settledRef.current = true;
        // Do one final render then stop
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

  // Current snapshot for rendering (read from ref, driven by tick counter)
  const simNodes = simRef.current;
  // Suppress unused variable warning — tick drives re-renders
  void tick;

  // Toggle fixed state on click
  const toggleFixed = useCallback((id: string) => {
    simRef.current = simRef.current.map((n) =>
      n.id === id ? { ...n, fixed: !n.fixed, vx: 0, vy: 0 } : n,
    );
    if (settledRef.current) {
      // Restart animation if settled
      settledRef.current = false;
      runningRef.current = true;
      setTick((t: number) => t + 1);
    }
  }, []);

  // Build node index for edge lookups
  const nodeIndex = useMemo(() => {
    const map = new Map<string, SimNode>();
    for (let i = 0; i < simNodes.length; i++) {
      map.set(simNodes[i]!.id, simNodes[i]!);
    }
    return map;
  }, [tick]);

  // ---- Arrow marker defs ----------------------------------------------------

  const buildDefs = useCallback(() => {
    if (!showArrows) return [];
    return [
      createElement(
        "defs",
        { key: "arrow-defs" },
        createElement(
          "marker",
          {
            key: "arrowhead",
            id: "arrowhead",
            markerWidth: "10",
            markerHeight: "7",
            refX: String(10 + nodeRadius),
            refY: "3.5",
            orient: "auto",
            markerUnits: "userSpaceOnUse",
          },
          createElement("polygon", {
            key: "arrow-poly",
            points: "0 0, 10 3.5, 0 7",
            fill: edgeColor,
          }),
        ),
      ),
    ];
  }, [showArrows, nodeRadius, edgeColor]);

  // ---- Build edges ----------------------------------------------------------

  const buildEdges = useCallback(() => {
    const elements: ReturnType<typeof createElement>[] = [];

    for (let i = 0; i < edges.length; i++) {
      const edge = edges[i]!;
      const sourceNode = nodeIndex.get(edge.source);
      const targetNode = nodeIndex.get(edge.target);
      if (!sourceNode || !targetNode) continue;

      // Skip zero-weight edges
      if (edge.weight !== undefined && edge.weight <= 0) continue;

      const strokeWidth = edge.weight
        ? Math.max(0.5, Math.min(6, edgeWidth * edge.weight))
        : edgeWidth;

      const lineProps: Record<string, string> = {
        key: `edge-${i}`,
        x1: String(sourceNode.x),
        y1: String(sourceNode.y),
        x2: String(targetNode.x),
        y2: String(targetNode.y),
        stroke: edge.color ?? edgeColor,
        "stroke-width": String(strokeWidth),
        "stroke-opacity": "0.6",
      };

      if (showArrows) {
        lineProps["marker-end"] = "url(#arrowhead)";
      }

      elements.push(createElement("line", lineProps));
    }

    return elements;
  }, [tick, edgeColor, edgeWidth, showArrows]);

  // ---- Build nodes ----------------------------------------------------------

  const buildNodes = useCallback(() => {
    const elements: ReturnType<typeof createElement>[] = [];

    for (let i = 0; i < simNodes.length; i++) {
      const n = simNodes[i]!;

      // Node circle — click to toggle fixed/unfixed
      elements.push(
        createElement("circle", {
          key: `node-${n.id}`,
          cx: String(n.x),
          cy: String(n.y),
          r: String(nodeRadius),
          fill: n.color,
          stroke: n.fixed ? "#0f172a" : "#fff",
          "stroke-width": n.fixed ? "3" : "2",
          style: { cursor: "pointer" },
          onClick: () => toggleFixed(n.id),
          role: "button",
          tabIndex: 0,
          "aria-label": `Node: ${n.label}${n.fixed ? " (locked)" : ""}`,
        }),
      );

      // Label
      if (showLabels) {
        elements.push(
          createElement(
            "text",
            {
              key: `label-${n.id}`,
              x: String(n.x),
              y: String(n.y + nodeRadius + 14),
              "text-anchor": "middle",
              "font-size": "11",
              "font-family": "sans-serif",
              fill: "#374151",
              "pointer-events": "none",
            },
            n.label,
          ),
        );
      }
    }

    return elements;
  }, [tick, nodeRadius, showLabels, toggleFixed]);

  // ---- Title ----------------------------------------------------------------

  const buildTitle = useCallback(() => {
    if (!title) return [];
    return [
      createElement(
        "text",
        {
          key: "title",
          x: String(width / 2),
          y: "24",
          "text-anchor": "middle",
          "font-size": "16",
          "font-weight": "bold",
          "font-family": "sans-serif",
          fill: "#111827",
        },
        title,
      ),
    ];
  }, [title, width]);

  // ---- Assemble SVG ---------------------------------------------------------

  const defs = buildDefs();
  const edgeElements = buildEdges();
  const nodeElements = buildNodes();
  const titleEl = buildTitle();

  return createElement(
    "svg",
    {
      width: String(width),
      height: String(height),
      viewBox: `0 0 ${width} ${height}`,
      xmlns: "http://www.w3.org/2000/svg",
      role: "img",
      "aria-label": title ?? "Force-directed graph",
      style: { fontFamily: "sans-serif" },
    },
    ...defs,
    ...titleEl,
    ...edgeElements,
    ...nodeElements,
  );
}
