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
  CollisionManager,
  applyBoundary,
} from '../../../components/viz/3dSpace/src/index';
import type { SpaceBounds } from '../../../components/viz/3dSpace/src/index';

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
    terrainObj.renderOrder = -1; // Draw terrain first (background) so objects render on top
    scene.register(terrainObj);

    // ── Collision detection + boundary ──
    const bounds: SpaceBounds = {
      min: { x: -20, y: -5, z: -20 },
      max: { x: 20, y: 15, z: 20 },
    };

    const collisionMgr = new CollisionManager({
      colliderType: 'sphere',
      response: (info) => {
        // Bounce response: push objects apart along collision normal
        const pushDist = info.overlap / 2;
        const a = info.objectA;
        const b = info.objectB;
        a.position = {
          x: a.position.x - info.normal.x * pushDist,
          y: a.position.y - info.normal.y * pushDist,
          z: a.position.z - info.normal.z * pushDist,
        };
        b.position = {
          x: b.position.x + info.normal.x * pushDist,
          y: b.position.y + info.normal.y * pushDist,
          z: b.position.z + info.normal.z * pushDist,
        };
      },
    });

    // Store per-object velocity for bounce boundary mode
    const velocities = new Map<string, { x: number; y: number; z: number }>();
    for (const b of BOXES) {
      velocities.set(b.id, { x: 0, y: 0, z: 0 });
    }

    // Height function ref for camera terrain avoidance
    const terrainHeightFn = heightFn;
    const terrainY = -3; // terrain base Y offset

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

    // Stationary red point light — high above one corner of the terrain
    const redLight = new Light({
      type: 'point',
      position: { x: -18, y: 12, z: -18 },
      color: { r: 1.0, g: 0.2, b: 0.1, a: 1 },
      intensity: 1,
      range: 60,
    });

    // Stationary green point light — high above the diagonally opposing corner
    const greenLight = new Light({
      type: 'point',
      position: { x: 18, y: 12, z: 18 },
      color: { r: 0.1, g: 1.0, b: 0.2, a: 1 },
      intensity: 1,
      range: 60,
    });

    // Small spheres to visualize the light positions
    const redLightSphere = new SceneObject('light-red');
    redLightSphere.mesh = Mesh.createSphere(0.3, 8, 12);
    redLightSphere.material = createMaterial({ r: 1.0, g: 0.2, b: 0.1, a: 1 });
    redLightSphere.position = { x: -18, y: 12, z: -18 };
    scene.register(redLightSphere);

    const greenLightSphere = new SceneObject('light-green');
    greenLightSphere.mesh = Mesh.createSphere(0.3, 8, 12);
    greenLightSphere.material = createMaterial({ r: 0.1, g: 1.0, b: 0.2, a: 1 });
    greenLightSphere.position = { x: 18, y: 12, z: 18 };
    scene.register(greenLightSphere);

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

      // Orbit camera at fixed height (below lights at y=12, above terrain)
      const radius = 15;
      const camAngle = totalTime * 0.3;
      const cx = Math.cos(camAngle) * radius;
      const cz = Math.sin(camAngle) * radius;
      const cy = 8;

      orbitCam.position = { x: cx, y: cy, z: cz };
      orbitCam.lookAt({ x: 0, y: 0, z: 0 });

      // Apply boundary bounce to scene objects (excluding terrain and light)
      const bounceable = scene.getVisibleObjects().filter(
        (o) => o.id !== 'terrain' && o.id !== 'light-red' && o.id !== 'light-green',
      );
      for (const obj of bounceable) {
        const vel = velocities.get(obj.id);
        if (vel) applyBoundary(obj, bounds, 'bounce', vel);
      }

      // Run collision detection
      collisionMgr.update(bounceable);

      // Lights are stationary — no position updates needed
      const sceneLights = [redLight, greenLight];

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

      // Draw light position indicators on top-down view
      if (ctx) {
        for (const [light, label, color] of [
          [redLight, 'RED', '#ff3322'],
          [greenLight, 'GRN', '#22ff44'],
        ] as [Light, string, string][]) {
          const lpos = light.position;
          const lvpX = topViewport.x + ((lpos.x + 15) / 30) * topViewport.width;
          const lvpY = topViewport.y + ((lpos.z + 15) / 30) * topViewport.height;
          ctx.save();
          ctx.fillStyle = color;
          ctx.beginPath();
          ctx.arc(lvpX, lvpY, 4, 0, Math.PI * 2);
          ctx.fill();
          ctx.font = '10px sans-serif';
          ctx.fillText(label, lvpX + 6, lvpY + 3);
          ctx.restore();
        }
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
      }, 'Left: orbiting perspective camera. Right: top-down view with camera (yellow), red light, and green light indicators.'),
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
        'Orbiting camera at radius 15, fixed height (y=8), looking at origin. Perspective projection (45\u00b0 FOV). Two stationary colored lights at opposing corners.',
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
      createElement('h4', { style: { fontSize: '13px', fontWeight: '600', marginTop: '12px', marginBottom: '4px' } }, 'Lighting'),
      createElement('p', null, 'Two stationary point lights: red at corner (-18, 12, -18) and green at corner (18, 12, 12). Lambertian diffuse shading, grid overlay, and wireframe edges.'),
    ),
  );
}
