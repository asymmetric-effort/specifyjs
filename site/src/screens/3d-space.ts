// (c) 2025-2026 Asymmetric Effort, LLC. MIT LICENSE
// SPDX-License-Identifier: MIT

/**
 * 3D Space Demo — Two viewports showing the same scene from different
 * cameras: an orbiting perspective camera and a fixed top-down camera.
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
  LambertianShading,
  Light,
  createMaterial,
  generateTerrain,
  sineTerrain,
  heightGradientColor,
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
const VP_WIDTH = CANVAS_WIDTH / 2;   // Each viewport is half the canvas
const VP_HEIGHT = CANVAS_HEIGHT;
const DIVIDER = 2;                    // Pixel gap between viewports

export function Space3DDemo() {
  useHead({
    title: '3D Space — SpecifyJS',
    description: 'Dual-viewport demo: orbiting camera and top-down camera viewing five 3D boxes.',
  });

  const initializedRef = useRef(false);
  const rafRef = useRef<number>(0);
  const cleanupRef = useRef<(() => void) | null>(null);

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

    // ── Terrain ──
    const heightFn = sineTerrain(2, 0.4);
    const colorFn = heightGradientColor(-2, 2);
    const terrainMesh = generateTerrain(40, 40, 40, 40, heightFn, colorFn);
    const terrainObj = new SceneObject('terrain');
    terrainObj.position = { x: 0, y: -3, z: 0 };
    terrainObj.mesh = terrainMesh;
    terrainObj.material = createMaterial({ r: 0.3, g: 0.6, b: 0.2, a: 1 });
    scene.register(terrainObj);

    // ── Camera 1: Orbiting perspective ──
    const orbitCam = new Camera({
      position: { x: 15, y: 1, z: 0 },
      fov: Math.PI / 4,
      aspect: VP_WIDTH / VP_HEIGHT,
      near: 0.1,
      far: 100,
    });
    orbitCam.lookAt({ x: 0, y: 0, z: 0 });

    const orbitViewport = new Viewport({
      x: 0,
      y: 0,
      width: VP_WIDTH - DIVIDER,
      height: VP_HEIGHT,
      camera: orbitCam,
      clearColor: { r: 0.06, g: 0.09, b: 0.16, a: 1 },
    });

    // ── Camera 2: Fixed top-down orthographic ──
    const topCam = new Camera({
      projectionMode: 'orthographic',
      position: { x: 0, y: 25, z: 0.01 },  // Slightly off z-axis to avoid degenerate lookAt
      left: -15,
      right: 15,
      top: 15,
      bottom: -15,
      near: 0.1,
      far: 100,
    });
    topCam.lookAt({ x: 0, y: 0, z: 0 });

    const topViewport = new Viewport({
      x: VP_WIDTH + DIVIDER,
      y: 0,
      width: VP_WIDTH - DIVIDER,
      height: VP_HEIGHT,
      camera: topCam,
      clearColor: { r: 0.04, g: 0.06, b: 0.12, a: 1 },
    });

    // Pipeline (CPU — WebGL not yet visually validated)
    const pipeline = new CpuPipeline();
    pipeline.initialize(canvas);

    const lighting = new LambertianShading();

    // Red point light that orbits behind the camera
    const redLight = new Light({
      type: 'point',
      color: { r: 1.0, g: 0.2, b: 0.1, a: 1 },
      intensity: 1,
      range: 50,
    });

    // Small red sphere to visualize the light position
    const lightSphere = new SceneObject('light-indicator');
    lightSphere.mesh = Mesh.createSphere(0.3, 8, 12);
    lightSphere.material = createMaterial({ r: 1.0, g: 0.2, b: 0.1, a: 1 });
    lightSphere.scale = { x: 1, y: 1, z: 1 };
    scene.register(lightSphere);

    // Animation loop
    let totalTime = 0;
    let lastTime = performance.now();

    // Draw a small camera indicator on the top-down view showing orbit cam position
    const drawCamIndicator = (ctx: CanvasRenderingContext2D) => {
      const pos = orbitCam.position;
      // Project orbit camera position onto top-down viewport
      const vpX = topViewport.x + ((pos.x + 15) / 30) * topViewport.width;
      const vpY = topViewport.y + ((pos.z + 15) / 30) * topViewport.height;
      ctx.save();
      ctx.fillStyle = '#ffff00';
      ctx.beginPath();
      ctx.arc(vpX, vpY, 4, 0, Math.PI * 2);
      ctx.fill();
      ctx.font = '10px sans-serif';
      ctx.fillText('CAM', vpX + 6, vpY + 3);
      ctx.restore();
    };

    const frame = () => {
      const now = performance.now();
      const dt = (now - lastTime) / 1000;
      lastTime = now;
      totalTime += dt;

      // Orbit camera 1
      const radius = 15;
      const camAngle = totalTime * 0.3;
      const x = Math.cos(camAngle) * radius;
      const z = Math.sin(camAngle) * radius;
      const y = Math.sin(totalTime * 0.2) * 4 + 1;
      orbitCam.position = { x, y, z };
      orbitCam.lookAt({ x: 0, y: 0, z: 0 });

      // Position the red point light 30 degrees behind the camera
      const lightAngle = camAngle - Math.PI / 6;
      const lx = Math.cos(lightAngle) * radius;
      const lz = Math.sin(lightAngle) * radius;
      const ly = Math.sin(totalTime * 0.2) * 4 + 1;
      redLight.position = { x: lx, y: ly, z: lz };
      lightSphere.position = { x: lx, y: ly, z: lz };

      const sceneLights = [redLight];

      // Render viewport 1 (orbit perspective)
      pipeline.render(scene, orbitCam, orbitViewport, lighting, sceneLights);
      pipeline.renderGrid(orbitCam, orbitViewport, { size: 30, divisions: 30, opacity: 0.12 });
      pipeline.renderEdges(scene, orbitCam, orbitViewport, { color: '#000000', lineWidth: 1, opacity: 0.5 });

      // Draw viewport divider
      const ctx = (pipeline as any).ctx as CanvasRenderingContext2D;
      if (ctx) {
        ctx.fillStyle = '#1e293b';
        ctx.fillRect(VP_WIDTH - DIVIDER, 0, DIVIDER * 2, CANVAS_HEIGHT);
      }

      // Render viewport 2 (top-down)
      pipeline.render(scene, topCam, topViewport, lighting, sceneLights);
      pipeline.renderGrid(topCam, topViewport, { size: 30, divisions: 30, opacity: 0.15 });
      pipeline.renderEdges(scene, topCam, topViewport, { color: '#000000', lineWidth: 1, opacity: 0.4 });

      // Draw camera position indicator on top-down view
      if (ctx) drawCamIndicator(ctx);

      // Draw light position indicator on top-down view
      if (ctx) {
        const lpos = redLight.position;
        const lvpX = topViewport.x + ((lpos.x + 15) / 30) * topViewport.width;
        const lvpY = topViewport.y + ((lpos.z + 15) / 30) * topViewport.height;
        ctx.save();
        ctx.fillStyle = '#ff3322';
        ctx.beginPath();
        ctx.arc(lvpX, lvpY, 4, 0, Math.PI * 2);
        ctx.fill();
        ctx.font = '10px sans-serif';
        ctx.fillText('LIGHT', lvpX + 6, lvpY + 3);
        ctx.restore();
      }

      // Viewport labels
      if (ctx) {
        ctx.save();
        ctx.font = '11px sans-serif';
        ctx.fillStyle = 'rgba(255,255,255,0.5)';
        ctx.fillText('Perspective (orbiting)', 8, 16);
        ctx.fillText('Top-down (fixed)', VP_WIDTH + DIVIDER + 8, 16);
        ctx.restore();
      }

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
    // Left: dual viewports
    createElement('div', { style: { flex: '1', display: 'flex', flexDirection: 'column', minWidth: '600px' } },
      createElement('h2', {
        style: { fontSize: '18px', fontWeight: '600', marginBottom: '8px', color: 'var(--color-text, #0f172a)' },
      }, '3D Space Demo'),
      createElement('div', { style: { flex: '1', minHeight: '300px' } },
        createElement('div', {
          ref: containerCallback,
          style: { width: '100%', maxWidth: `${CANVAS_WIDTH}px`, height: `${CANVAS_HEIGHT}px`, backgroundColor: '#0f172a' },
        }),
      ),
      createElement('p', {
        style: { fontSize: '11px', color: 'var(--color-text-muted, #94a3b8)', marginTop: '8px' },
      }, 'Left: orbiting perspective camera. Right: fixed top-down view with camera (yellow) and light (red) indicators.'),
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
      createElement('h3', { style: { fontSize: '15px', fontWeight: '600', marginBottom: '12px' } }, 'Dual Viewport Demo'),
      createElement('p', null,
        'Two independent cameras render the same scene simultaneously to a single canvas. Each viewport has its own camera, projection, and clear color.',
      ),
      createElement('h4', { style: { fontSize: '13px', fontWeight: '600', marginTop: '12px', marginBottom: '4px' } }, 'Viewport 1 — Perspective'),
      createElement('p', null,
        'Orbiting camera at radius 15, sinusoidal height, looking at origin. Perspective projection (45\u00b0 FOV).',
      ),
      createElement('h4', { style: { fontSize: '13px', fontWeight: '600', marginTop: '12px', marginBottom: '4px' } }, 'Viewport 2 — Top-Down'),
      createElement('p', null,
        'Fixed camera at y=25 looking straight down. Orthographic projection (\u00b115 units). Yellow dot shows the orbiting camera\'s position.',
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
      createElement('h4', { style: { fontSize: '13px', fontWeight: '600', marginTop: '12px', marginBottom: '4px' } }, 'Rendering'),
      createElement('p', null, 'CPU pipeline with Lambertian diffuse shading, a red orbiting point light, grid overlay, and wireframe edges.'),
    ),
  );
}
