// (c) 2025-2026 Asymmetric Effort, LLC. MIT LICENSE
// SPDX-License-Identifier: MIT

/**
 * 3D Space Demo — Camera flyby around five colored boxes rendered
 * using the CpuPipeline directly (bypasses Space3D component to
 * eliminate hook lifecycle issues).
 */

import { createElement } from 'specifyjs';
import { useHead, useEffect, useRef } from 'specifyjs/hooks';
import {
  SceneObject,
  SceneGraph,
  Mesh,
  Camera,
  Viewport,
  CpuPipeline,
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

const WIDTH = 720;
const HEIGHT = 480;

export function Space3DDemo() {
  useHead({
    title: '3D Space — SpecifyJS',
    description: 'Camera flyby demo rendering five colored boxes in 3D space.',
  });

  const initializedRef = useRef(false);
  const rafRef = useRef<number>(0);
  const cleanupRef = useRef<(() => void) | null>(null);

  // Use ref callback — fires synchronously when the DOM node is created
  const containerCallback = (node: HTMLDivElement | null) => {
    if (!node || initializedRef.current) return;
    initializedRef.current = true;

    const canvas = document.createElement('canvas');
    canvas.width = WIDTH;
    canvas.height = HEIGHT;
    canvas.style.display = 'block';
    canvas.style.backgroundColor = '#0f172a';
    node.appendChild(canvas);

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

    // Camera + viewport
    const camera = new Camera({
      position: { x: 15, y: 1, z: 0 },
      fov: Math.PI / 4,
      aspect: WIDTH / HEIGHT,
      near: 0.1,
      far: 100,
    });
    camera.lookAt({ x: 0, y: 0, z: 0 });

    const viewport = new Viewport({
      x: 0,
      y: 0,
      width: WIDTH,
      height: HEIGHT,
      camera,
      clearColor: { r: 0.06, g: 0.09, b: 0.16, a: 1 },
    });

    // Pipeline
    const pipeline = new CpuPipeline();
    pipeline.initialize(canvas);

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
      const x = Math.cos(totalTime * 0.3) * radius;
      const z = Math.sin(totalTime * 0.3) * radius;
      const y = Math.sin(totalTime * 0.2) * 4 + 1;
      camera.position = { x, y, z };
      camera.lookAt({ x: 0, y: 0, z: 0 });

      // Render
      pipeline.render(scene, camera, viewport, lighting);

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
    // Left: 3D viewport
    createElement('div', { style: { flex: '1', display: 'flex', flexDirection: 'column', minWidth: '400px' } },
      createElement('h2', {
        style: { fontSize: '18px', fontWeight: '600', marginBottom: '8px', color: 'var(--color-text, #0f172a)' },
      }, '3D Space Demo'),
      createElement('div', { style: { flex: '1', minHeight: '300px' } },
        createElement('div', {
          ref: containerCallback,
          style: { width: `${WIDTH}px`, height: `${HEIGHT}px`, backgroundColor: '#0f172a' },
        }),
      ),
      createElement('p', {
        style: { fontSize: '11px', color: 'var(--color-text-muted, #94a3b8)', marginTop: '8px' },
      }, 'The camera orbits the scene automatically. One full revolution takes ~20 seconds.'),
    ),
    // Right: sidebar
    createElement('div', {
      style: {
        width: '280px', flexShrink: '0', overflowY: 'auto',
        fontSize: '13px', lineHeight: '1.6',
        color: 'var(--color-text, #1f2937)',
        borderLeft: '1px solid var(--color-border, #e2e8f0)',
        paddingLeft: '20px',
      },
    },
      createElement('h3', { style: { fontSize: '15px', fontWeight: '600', marginBottom: '12px' } }, 'About This Demo'),
      createElement('p', null,
        'This showcase renders five coloured boxes at fixed positions in 3D space using the ',
        createElement('strong', null, '3dSpace'),
        ' CPU rasteriser. Every triangle is projected, clipped, shaded, and painted to a 2D canvas each frame.',
      ),
      createElement('h4', { style: { fontSize: '13px', fontWeight: '600', marginTop: '16px', marginBottom: '4px' } }, 'Scene Objects'),
      createElement('ul', { style: { paddingLeft: '18px', margin: '8px 0' } },
        ...BOXES.map((b) =>
          createElement('li', null,
            createElement('span', { style: { color: `rgb(${Math.round(b.r * 255)},${Math.round(b.g * 255)},${Math.round(b.b * 255)})`, fontWeight: '600' } }, b.label),
            ` box at (${b.x}, ${b.y}, ${b.z})`,
          ),
        ),
      ),
      createElement('h4', { style: { fontSize: '13px', fontWeight: '600', marginTop: '16px', marginBottom: '4px' } }, 'Camera Orbit'),
      createElement('p', null,
        'Radius 15, sinusoidal height between -3 and 5, always looking at the origin. One revolution in ~20 seconds.',
      ),
      createElement('h4', { style: { fontSize: '13px', fontWeight: '600', marginTop: '16px', marginBottom: '4px' } }, 'Rendering'),
      createElement('p', null,
        'CPU pipeline: perspective projection, painter\'s algorithm z-sort, flat shading, canvas 2D path fill.',
      ),
    ),
  );
}
