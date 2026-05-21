// (c) 2025-2026 Asymmetric Effort, LLC. MIT LICENSE
// SPDX-License-Identifier: MIT

/**
 * 3D Space Demo — Camera flyby around five colored boxes rendered
 * using the Space3D component's CPU rasterisation pipeline.
 */

import { createElement } from 'specifyjs';
import { useHead } from 'specifyjs/hooks';
import {
  Space3D,
  SceneObject,
  SceneGraph,
  Mesh,
  Camera,
  Viewport,
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

function buildObjects(): SceneObject[] {
  const mesh = Mesh.createBox(1, 1, 1);
  return BOXES.map((b) => {
    const obj = new SceneObject(b.id);
    obj.position = { x: b.x, y: b.y, z: b.z };
    obj.mesh = mesh;
    obj.material = createMaterial({ r: b.r, g: b.g, b: b.b, a: 1 });
    return obj;
  });
}

// ── Component ───────────────────────────────────────────────────────

const WIDTH = 720;
const HEIGHT = 480;

export function Space3DDemo() {
  useHead({
    title: '3D Space — SpecifyJS',
    description: 'Camera flyby demo rendering five colored boxes in 3D space.',
  });

  const objects = buildObjects();

  const camera = new Camera({
    position: { x: 15, y: 1, z: 0 },
    fov: Math.PI / 4,
    aspect: WIDTH / HEIGHT,
    near: 0.1,
    far: 1000,
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

  // Accumulate elapsed time across frames for the orbit animation.
  let totalTime = 0;

  const onFrame = (deltaTime: number, _scene: SceneGraph, cameras: Camera[]) => {
    totalTime += deltaTime;
    const cam = cameras[0];
    if (!cam) return;

    const radius = 15;
    const x = Math.cos(totalTime * 0.3) * radius;
    const z = Math.sin(totalTime * 0.3) * radius;
    const y = Math.sin(totalTime * 0.2) * 4 + 1;

    cam.position = { x, y, z };
    cam.lookAt({ x: 0, y: 0, z: 0 });
  };

  return createElement('div', {
    style: { display: 'flex', height: '100%', padding: '16px', boxSizing: 'border-box', gap: '20px' },
  },
    // Left: 3D viewport
    createElement('div', { style: { flex: '1', display: 'flex', flexDirection: 'column', minWidth: '400px' } },
      createElement('h2', {
        style: { fontSize: '18px', fontWeight: '600', marginBottom: '8px', color: 'var(--color-text, #0f172a)' },
      }, '3D Space Demo'),
      createElement('div', { style: { flex: '1', minHeight: '300px' } },
        createElement(Space3D, {
          width: WIDTH,
          height: HEIGHT,
          objects,
          cameras: [camera],
          viewports: [viewport],
          onFrame,
          renderer: 'cpu',
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
        createElement('strong', null, 'Space3D'),
        ' component. A CPU-based software rasteriser projects, clips, and shades every triangle each frame — no WebGL required.',
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
        'The camera follows a circular path of radius 15 units centred on the origin. Its height oscillates sinusoidally between -3 and 5 units, and it always looks at (0, 0, 0). The orbit speed is tuned so one full revolution completes in roughly 20 seconds.',
      ),
      createElement('h4', { style: { fontSize: '13px', fontWeight: '600', marginTop: '16px', marginBottom: '4px' } }, 'Rendering Pipeline'),
      createElement('p', null,
        'The CPU pipeline performs perspective projection, back-face culling, viewport clipping, and flat shading entirely in JavaScript. Each triangle is scan-line rasterised into a 2D canvas via ',
        createElement('code', null, 'putImageData'),
        '. A z-buffer ensures correct depth ordering.',
      ),
      createElement('p', { style: { marginTop: '12px', fontSize: '11px', color: 'var(--color-text-muted, #94a3b8)' } },
        'This demo validates the full rendering pipeline end-to-end: scene graph, transforms, camera projection, clipping, shading, and rasterisation.',
      ),
    ),
  );
}
