// (c) 2025-2026 Asymmetric Effort, LLC. MIT LICENSE
// SPDX-License-Identifier: MIT

/**
 * HypercubeGraph — A SpecifyJS component that renders an N-dimensional
 * hypercube as an SVG with colored vertex balls and heavy black edges.
 *
 * Supports:
 *  - Configurable dimension (2–8)
 *  - Auto-rotation with configurable speed
 *  - Custom vertex colors / palette
 *  - Perspective projection
 *  - Interactive mouse-drag rotation
 *  - Depth-sorted rendering (painter's algorithm)
 */

import { createElement } from 'specifyjs';
import {
  useState,
  useEffect,
  useRef,
  useMemo,
  useCallback,
} from 'specifyjs/hooks';
import {
  generateHypercube,
  numRotationAngles,
  generatePalette,
  type HypercubeData,
  type Vertex,
} from './hypercube';

// -- Props ------------------------------------------------------------------

export interface HypercubeGraphProps {
  /** Number of dimensions (default: 4) */
  dimension?: number;
  /** SVG width in pixels (default: 600) */
  width?: number;
  /** SVG height in pixels (default: 600) */
  height?: number;
  /** Vertex radius in pixels (default: 10) */
  vertexRadius?: number;
  /** Edge stroke width (default: 3) */
  edgeWidth?: number;
  /** Edge color (default: '#111') */
  edgeColor?: string;
  /** Array of vertex colors, or 'auto' for generated palette (default: 'auto') */
  vertexColors?: string[] | 'auto';
  /** Perspective strength, 0 = orthographic (default: 0.25) */
  perspective?: number;
  /** Auto-rotation speed (radians/frame). 0 = no rotation (default: 0.008) */
  rotationSpeed?: number;
  /** Whether to show vertex labels (default: false) */
  showLabels?: boolean;
  /** Background color (default: 'transparent') */
  backgroundColor?: string;
  /** Scale factor (default: auto-fit) */
  scale?: number;
}

// -- Component --------------------------------------------------------------

export function HypercubeGraph(props: HypercubeGraphProps) {
  const dim = props.dimension ?? 4;
  const width = props.width ?? 600;
  const height = props.height ?? 600;
  const vertexRadius = props.vertexRadius ?? 10;
  const edgeWidth = props.edgeWidth ?? 3;
  const edgeColor = props.edgeColor ?? '#111';
  const perspective = props.perspective ?? 0.25;
  const rotationSpeed = props.rotationSpeed ?? 0.008;
  const showLabels = props.showLabels ?? false;
  const backgroundColor = props.backgroundColor ?? 'transparent';
  const scale = props.scale ?? Math.min(width, height) * 0.3;

  const numAngles = numRotationAngles(dim);
  const vertexCount = 1 << dim;

  // Vertex colors
  const colors = useMemo(() => {
    if (props.vertexColors === 'auto' || props.vertexColors === undefined) {
      return generatePalette(vertexCount);
    }
    return props.vertexColors;
  }, [vertexCount, props.vertexColors]);

  // Animation state: rotation angles
  const [angles, setAngles] = useState<number[]>(() => {
    const a: number[] = [];
    for (let i = 0; i < numAngles; i++) {
      a.push(0);
    }
    return a;
  });

  // Drag rotation state
  const [dragging, setDragging] = useState(false);
  const dragStart = useRef({ x: 0, y: 0 });
  const anglesAtDragStart = useRef<number[]>([]);

  // Animation frame ref
  const frameRef = useRef<number>(0);

  // Auto-rotation via requestAnimationFrame
  useEffect(() => {
    if (rotationSpeed === 0) return;

    let running = true;

    const animate = () => {
      if (!running) return;
      setAngles((prev: number[]) => {
        const next = prev.slice();
        for (let i = 0; i < next.length; i++) {
          // Each plane pair rotates at a slightly different rate for visual interest
          next[i] = (next[i] ?? 0) + rotationSpeed * (1 + i * 0.3);
        }
        return next;
      });
      frameRef.current = requestAnimationFrame(animate);
    };

    frameRef.current = requestAnimationFrame(animate);

    return () => {
      running = false;
      cancelAnimationFrame(frameRef.current);
    };
  }, [rotationSpeed]);

  // Generate projected hypercube data
  const data: HypercubeData = useMemo(
    () => generateHypercube(dim, angles, perspective, scale),
    [dim, angles, perspective, scale],
  );

  // Center offset
  const cx = width / 2;
  const cy = height / 2;

  // Sort edges and vertices by depth for painter's algorithm
  const sortedEdges = useMemo(() => {
    return data.edges
      .map((e) => {
        const sv = data.vertices[e.source]!;
        const tv = data.vertices[e.target]!;
        const avgDepth = (sv.depth + tv.depth) / 2;
        return { ...e, avgDepth, sv, tv };
      })
      .sort((a, b) => a.avgDepth - b.avgDepth);
  }, [data]);

  const sortedVertices = useMemo(() => {
    return data.vertices.slice().sort((a, b) => a.depth - b.depth);
  }, [data]);

  // Mouse drag handlers
  const handleMouseDown = useCallback(
    (e: Event) => {
      const me = e as MouseEvent;
      setDragging(true);
      dragStart.current = { x: me.clientX, y: me.clientY };
      anglesAtDragStart.current = angles.slice();
    },
    [angles],
  );

  const handleMouseMove = useCallback(
    (e: Event) => {
      if (!dragging) return;
      const me = e as MouseEvent;
      const dx = (me.clientX - dragStart.current.x) * 0.01;
      const dy = (me.clientY - dragStart.current.y) * 0.01;

      setAngles(() => {
        const next = anglesAtDragStart.current.slice();
        if (next.length > 0) next[0] = (next[0] ?? 0) + dx;
        if (next.length > 1) next[1] = (next[1] ?? 0) + dy;
        return next;
      });
    },
    [dragging],
  );

  const handleMouseUp = useCallback(() => {
    setDragging(false);
  }, []);

  // Depth-based opacity for edges (further = more transparent)
  const edgeOpacity = (depth: number) => {
    const normalized = (depth + 2) / 4; // rough range [-2, 2] → [0, 1]
    return 0.3 + 0.7 * Math.max(0, Math.min(1, normalized));
  };

  // Depth-based size for vertices
  const vertexScale = (depth: number) => {
    const normalized = (depth + 2) / 4;
    return 0.6 + 0.4 * Math.max(0, Math.min(1, normalized));
  };

  // Build SVG elements
  const edgeElements = sortedEdges.map((e, i) => {
    const opacity = edgeOpacity(e.avgDepth);
    return createElement('line', {
      key: `e-${e.source}-${e.target}`,
      x1: String(cx + e.sv.x),
      y1: String(cy + e.sv.y),
      x2: String(cx + e.tv.x),
      y2: String(cy + e.tv.y),
      stroke: edgeColor,
      'stroke-width': String(edgeWidth),
      'stroke-opacity': String(opacity),
      'stroke-linecap': 'round',
    });
  });

  const vertexElements = sortedVertices.map((v) => {
    const r = vertexRadius * vertexScale(v.depth);
    const color = colors[v.id % colors.length] ?? '#3b82f6';

    const children = [
      createElement('circle', {
        key: `v-${v.id}-circle`,
        cx: String(cx + v.x),
        cy: String(cy + v.y),
        r: String(r),
        fill: color,
        stroke: '#000',
        'stroke-width': '1.5',
        style: { filter: 'drop-shadow(0 1px 2px rgba(0,0,0,0.3))' },
      }),
    ];

    if (showLabels) {
      children.push(
        createElement(
          'text',
          {
            key: `v-${v.id}-label`,
            x: String(cx + v.x),
            y: String(cy + v.y + r + 14),
            'text-anchor': 'middle',
            'font-size': '11',
            'font-family': 'monospace',
            fill: '#555',
          },
          v.id.toString(2).padStart(dim, '0'),
        ),
      );
    }

    return children;
  });

  return createElement(
    'svg',
    {
      width: '100%',
      viewBox: `0 0 ${width} ${height}`,
      preserveAspectRatio: 'xMidYMid meet',
      style: {
        backgroundColor,
        cursor: dragging ? 'grabbing' : 'grab',
        userSelect: 'none',
      },
      onMouseDown: handleMouseDown,
      onMouseMove: handleMouseMove,
      onMouseUp: handleMouseUp,
      onMouseLeave: handleMouseUp,
    },
    // Edges first (behind vertices)
    ...edgeElements,
    // Vertices on top
    ...vertexElements.flat(),
  );
}

// -- Hook -------------------------------------------------------------------

export interface UseHypercubeOptions {
  dimension?: number;
  rotationSpeed?: number;
  perspective?: number;
  scale?: number;
}

/**
 * Hook that provides hypercube data with auto-animated rotation angles.
 * Useful for headless rendering or custom SVG layouts.
 */
export function useHypercube(opts: UseHypercubeOptions = {}) {
  const dim = opts.dimension ?? 4;
  const speed = opts.rotationSpeed ?? 0.008;
  const persp = opts.perspective ?? 0.25;
  const sc = opts.scale ?? 200;
  const numAngles = numRotationAngles(dim);

  const [angles, setAngles] = useState<number[]>(() => new Array(numAngles).fill(0));

  useEffect(() => {
    if (speed === 0) return;
    let running = true;
    let frame = 0;
    const animate = () => {
      if (!running) return;
      setAngles((prev: number[]) => prev.map((a, i) => a + speed * (1 + i * 0.3)));
      frame = requestAnimationFrame(animate);
    };
    frame = requestAnimationFrame(animate);
    return () => {
      running = false;
      cancelAnimationFrame(frame);
    };
  }, [speed]);

  const data = useMemo(
    () => generateHypercube(dim, angles, persp, sc),
    [dim, angles, persp, sc],
  );

  return { data, angles, setAngles };
}
