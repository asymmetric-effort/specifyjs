// (c) 2025-2026 Asymmetric Effort, LLC. MIT LICENSE
// SPDX-License-Identifier: MIT

/**
 * 3D Space WebGL Demo — Single viewport showing five colored boxes
 * with an orbiting camera, rendered via the WebGL pipeline.
 */

import { createElement } from 'specifyjs';
import { useHead, useEffect, useRef } from 'specifyjs/hooks';
import {
  SceneObject,
  SceneGraph,
  Mesh,
  Camera,
  Viewport,
  WebGLPipeline,
  FlatShading,
  createMaterial,
} from '../../../components/viz/3dSpace/src/index';

// ── Scene setup ─────────────────────────────────────────────────────

interface BoxDef {
  id: string;
  x: number;
  y: number;
  z: number;
  r: number;
  g: number;
  b: number;
  label: string;
}

const BOXES: BoxDef[] = [
  { id: 'box-red',    x:  0, y:  0, z:  0, r: 0.9, g: 0.2, b: 0.2, label: 'Red' },
  { id: 'box-green',  x:  5, y:  0, z:  0, r: 0.2, g: 0.8, b: 0.2, label: 'Green' },
  { id: 'box-blue',   x: -3, y:  2, z:  5, r: 0.2, g: 0.4, b: 0.9, label: 'Blue' },
  { id: 'box-yellow', x:  0, y: -2, z: -4, r: 0.9, g: 0.8, b: 0.1, label: 'Yellow' },
  { id: 'box-cyan',   x:  7, y:  3, z: -2, r: 0.1, g: 0.8, b: 0.8, label: 'Cyan' },
];

// ── Component ───────────────────────────────────────────────────────

const CANVAS_WIDTH = 960;
const CANVAS_HEIGHT = 400;

export function Space3DWebGLDemo() {
  useHead({
    title: '3D Space (WebGL) — SpecifyJS',
    description: 'WebGL-rendered demo: orbiting camera viewing five 3D boxes with flat shading.',
  });

  const initializedRef = useRef(false);
  const rafRef = useRef<number>(0);
  const cleanupRef = useRef<(() => void) | null>(null);
  const webglAvailableRef = useRef(true);

  const containerCallback = (node: HTMLDivElement | null) => {
    if (!node || initializedRef.current) return;
    initializedRef.current = true;

    const canvas = document.createElement('canvas');
    canvas.width = CANVAS_WIDTH;
    canvas.height = CANVAS_HEIGHT;
    canvas.style.display = 'block';
    canvas.style.backgroundColor = '#0f172a';
    canvas.style.width = '100%';
    canvas.style.maxWidth = `${CANVAS_WIDTH}px`;
    node.appendChild(canvas);

    // Initialize WebGL pipeline
    const pipeline = new WebGLPipeline();
    try {
      pipeline.initialize(canvas);
    } catch (_e) {
      // WebGL not available — show fallback message
      webglAvailableRef.current = false;
      canvas.style.display = 'none';
      const fallback = document.createElement('div');
      fallback.style.padding = '48px';
      fallback.style.textAlign = 'center';
      fallback.style.color = '#94a3b8';
      fallback.style.fontSize = '16px';
      fallback.textContent = 'WebGL not available';
      node.appendChild(fallback);
      return;
    }

    // Build scene
    const scene = new SceneGraph();
    const mesh = Mesh.createBox(1, 1, 1);
    for (const b of BOXES) {
      const obj = new SceneObject(b.id);
      obj.position = { x: b.x, y: b.y, z: b.z };
      obj.mesh = mesh;
      obj.material = createMaterial({ r: b.r, g: b.g, b: b.b, a: 1 });
      scene.register(obj);
    }

    // ── Camera: Orbiting perspective ──
    const orbitCam = new Camera({
      position: { x: 15, y: 1, z: 0 },
      fov: Math.PI / 4,
      aspect: CANVAS_WIDTH / CANVAS_HEIGHT,
      near: 0.1,
      far: 100,
    });
    orbitCam.lookAt({ x: 0, y: 0, z: 0 });

    const viewport = new Viewport({
      x: 0,
      y: 0,
      width: CANVAS_WIDTH,
      height: CANVAS_HEIGHT,
      camera: orbitCam,
      clearColor: { r: 0.06, g: 0.09, b: 0.16, a: 1 },
    });

    const lighting = new FlatShading();

    // Animation loop
    let totalTime = 0;
    let lastTime = performance.now();

    const frame = () => {
      const now = performance.now();
      const dt = (now - lastTime) / 1000;
      lastTime = now;
      totalTime += dt;

      // Orbit camera
      const radius = 15;
      const camAngle = totalTime * 0.3;
      const x = Math.cos(camAngle) * radius;
      const z = Math.sin(camAngle) * radius;
      const y = Math.sin(totalTime * 0.2) * 4 + 1;
      orbitCam.position = { x, y, z };
      orbitCam.lookAt({ x: 0, y: 0, z: 0 });

      // Render via WebGL pipeline
      pipeline.render(scene, orbitCam, viewport, lighting);

      rafRef.current = requestAnimationFrame(frame);
    };

    rafRef.current = requestAnimationFrame(frame);

    cleanupRef.current = () => {
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
      pipeline.dispose();
      if (canvas.parentNode) canvas.parentNode.removeChild(canvas);
    };
  };

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (cleanupRef.current) cleanupRef.current();
    };
  }, []);

  return createElement('div', {
    style: { display: 'flex', height: '100%', padding: '16px', boxSizing: 'border-box', gap: '20px' },
  },
    // Left: canvas area
    createElement('div', { style: { flex: '1', display: 'flex', flexDirection: 'column', minWidth: '600px' } },
      createElement('h2', {
        style: { fontSize: '18px', fontWeight: '600', marginBottom: '8px', color: 'var(--color-text, #0f172a)' },
      }, '3D Space WebGL Demo'),
      createElement('div', { style: { flex: '1', minHeight: '300px' } },
        createElement('div', {
          ref: containerCallback,
          style: { width: '100%', maxWidth: `${CANVAS_WIDTH}px`, height: `${CANVAS_HEIGHT}px`, backgroundColor: '#0f172a' },
        }),
      ),
      createElement('p', {
        style: { fontSize: '11px', color: 'var(--color-text-muted, #94a3b8)', marginTop: '8px' },
      }, 'WebGL pipeline with flat shading. Orbiting perspective camera viewing five colored boxes.'),
    ),
    // Right: sidebar
    createElement('div', {
      style: {
        width: '240px', flexShrink: '0', overflowY: 'auto',
        fontSize: '13px', lineHeight: '1.6',
        color: 'var(--color-text, #1f2937)',
        borderLeft: '1px solid var(--color-border, #e2e8f0)',
        paddingLeft: '16px',
      },
    },
      createElement('h3', { style: { fontSize: '15px', fontWeight: '600', marginBottom: '12px' } }, 'WebGL Pipeline Demo'),
      createElement('p', null,
        'This demo validates the WebGL render pipeline end-to-end by rendering the same scene as the CPU demo using GPU-accelerated WebGL.',
      ),
      createElement('h4', { style: { fontSize: '13px', fontWeight: '600', marginTop: '12px', marginBottom: '4px' } }, 'Pipeline'),
      createElement('p', null,
        'WebGLPipeline with FlatShading. Each object is rendered with a flat color, no lighting computation.',
      ),
      createElement('h4', { style: { fontSize: '13px', fontWeight: '600', marginTop: '12px', marginBottom: '4px' } }, 'Camera'),
      createElement('p', null,
        'Orbiting perspective camera at radius 15, sinusoidal height, looking at origin. Perspective projection (45\u00b0 FOV).',
      ),
      createElement('h4', { style: { fontSize: '13px', fontWeight: '600', marginTop: '12px', marginBottom: '4px' } }, 'Scene Objects'),
      createElement('ul', { style: { paddingLeft: '18px', margin: '4px 0', fontSize: '12px' } },
        ...BOXES.map((b) =>
          createElement('li', null,
            createElement('span', { style: { color: `rgb(${Math.round(b.r * 255)},${Math.round(b.g * 255)},${Math.round(b.b * 255)})`, fontWeight: '600' } }, b.label),
            ` (${b.x}, ${b.y}, ${b.z})`,
          ),
        ),
      ),
    ),
  );
}
