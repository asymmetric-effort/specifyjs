// (c) 2025-2026 Asymmetric Effort, LLC. MIT LICENSE
// SPDX-License-Identifier: MIT

/**
 * Solar System Simulation — 3D rendering using the 3dSpace CpuPipeline.
 *
 * Two viewports on a single canvas:
 *   Left:  "View from Earth" — perspective camera near Earth looking at the Sun
 *   Right: "Oort Cloud view" — orthographic at 45° from orbital plane
 *
 * Planets orbit the Sun in the XZ plane with simplified circular orbits.
 * Each body is a colored sphere (Mesh.createSphere) scaled by relative size.
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

// ── Planet data ────────────────────────────────────────────────────────

interface PlanetDef {
  id: string;
  label: string;
  r: number;
  g: number;
  b: number;
  distance: number;   // distance from sun in scene units
  size: number;        // box half-extent scale
  orbitSpeed: number;  // relative to Earth = 1
}

const PLANETS: PlanetDef[] = [
  { id: 'mercury',  label: 'Mercury',  r: 0.58, g: 0.64, b: 0.72, distance: 4,  size: 0.3, orbitSpeed: 4.0  },
  { id: 'venus',    label: 'Venus',    r: 0.96, g: 0.62, b: 0.04, distance: 7,  size: 0.6, orbitSpeed: 1.6  },
  { id: 'earth',    label: 'Earth',    r: 0.23, g: 0.51, b: 0.96, distance: 10, size: 0.6, orbitSpeed: 1.0  },
  { id: 'mars',     label: 'Mars',     r: 0.94, g: 0.27, b: 0.27, distance: 15, size: 0.4, orbitSpeed: 0.53 },
  { id: 'jupiter',  label: 'Jupiter',  r: 0.80, g: 0.52, b: 0.20, distance: 25, size: 1.8, orbitSpeed: 0.4  },
  { id: 'saturn',   label: 'Saturn',   r: 0.92, g: 0.78, b: 0.20, distance: 35, size: 1.5, orbitSpeed: 0.32 },
  { id: 'uranus',   label: 'Uranus',   r: 0.02, g: 0.71, b: 0.82, distance: 45, size: 1.0, orbitSpeed: 0.18 },
  { id: 'neptune',  label: 'Neptune',  r: 0.39, g: 0.40, b: 0.94, distance: 55, size: 1.0, orbitSpeed: 0.1  },
];

const SUN_SIZE = 3;

// ── Canvas & viewport dimensions ───────────────────────────────────────

const CANVAS_WIDTH = 960;
const CANVAS_HEIGHT = 400;
const VP_WIDTH = CANVAS_WIDTH / 2;
const VP_HEIGHT = CANVAS_HEIGHT;
const DIVIDER = 2;

// ── Component ──────────────────────────────────────────────────────────

export function PlanetsScreen() {
  useHead({
    title: 'Solar System — SpecifyJS',
    description: 'Dual-viewport 3D solar system: Earth perspective and Oort Cloud top-down view.',
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
    canvas.style.backgroundColor = '#0a0a1a';
    canvas.style.width = '100%';
    canvas.style.maxWidth = `${CANVAS_WIDTH}px`;
    node.appendChild(canvas);

    // ── Build scene ──
    const scene = new SceneGraph();

    // Sun at origin
    const sunMesh = Mesh.createSphere(SUN_SIZE / 2, 20, 30);
    const sunObj = new SceneObject('sun');
    sunObj.position = { x: 0, y: 0, z: 0 };
    sunObj.mesh = sunMesh;
    sunObj.material = createMaterial({ r: 0.98, g: 0.75, b: 0.15, a: 1 });
    scene.register(sunObj);

    // Planet scene objects
    const planetObjects: SceneObject[] = [];
    for (const p of PLANETS) {
      const mesh = Mesh.createSphere(p.size / 2, 12, 18);
      const obj = new SceneObject(p.id);
      obj.position = { x: p.distance, y: 0, z: 0 };
      obj.mesh = mesh;
      obj.material = createMaterial({ r: p.r, g: p.g, b: p.b, a: 1 });
      scene.register(obj);
      planetObjects.push(obj);
    }

    // ── Camera 1: View from Earth (perspective) ──
    const earthCam = new Camera({
      position: { x: 10, y: 2, z: 5 },
      fov: Math.PI / 3,
      aspect: (VP_WIDTH - DIVIDER) / VP_HEIGHT,
      near: 0.1,
      far: 500,
    });
    earthCam.lookAt({ x: 0, y: 0, z: 0 });

    const earthViewport = new Viewport({
      x: 0,
      y: 0,
      width: VP_WIDTH - DIVIDER,
      height: VP_HEIGHT,
      camera: earthCam,
      clearColor: { r: 0.02, g: 0.02, b: 0.06, a: 1 },
    });

    // ── Camera 2: Oort Cloud view at 45° from orbital plane ──
    const oortDist = 200;
    const oortAngle = Math.PI / 4; // 45 degrees from horizontal
    const oortCam = new Camera({
      projectionMode: 'orthographic',
      position: {
        x: 0,
        y: oortDist * Math.sin(oortAngle),
        z: oortDist * Math.cos(oortAngle),
      },
      left: -70,
      right: 70,
      top: 70,
      bottom: -70,
      near: 0.1,
      far: 500,
    });
    oortCam.lookAt({ x: 0, y: 0, z: 0 });

    const oortViewport = new Viewport({
      x: VP_WIDTH + DIVIDER,
      y: 0,
      width: VP_WIDTH - DIVIDER,
      height: VP_HEIGHT,
      camera: oortCam,
      clearColor: { r: 0.01, g: 0.01, b: 0.04, a: 1 },
    });

    // Pipeline & lighting
    const pipeline = new CpuPipeline();
    pipeline.initialize(canvas);
    const lighting = new FlatShading();

    // Animation state
    let totalTime = 0;
    let lastTime = performance.now();

    const frame = () => {
      const now = performance.now();
      const dt = (now - lastTime) / 1000;
      lastTime = now;
      totalTime += dt;

      // Update planet positions (circular orbits in XZ plane)
      for (let i = 0; i < PLANETS.length; i++) {
        const p = PLANETS[i]!;
        const obj = planetObjects[i]!;
        const angle = totalTime * p.orbitSpeed * 0.5;
        obj.position = {
          x: Math.cos(angle) * p.distance,
          y: 0,
          z: Math.sin(angle) * p.distance,
        };
      }

      // Earth camera: follow Earth, look at Sun
      const earthDef = PLANETS[2]!;
      const earthObj = planetObjects[2]!;
      earthCam.position = {
        x: earthObj.position.x,
        y: 2,
        z: earthObj.position.z + 5,
      };
      earthCam.lookAt({ x: 0, y: 0, z: 0 });

      // ── Render left viewport (Earth view) ──
      pipeline.render(scene, earthCam, earthViewport, lighting);
      pipeline.renderEdges(scene, earthCam, earthViewport, { color: '#ffffff', lineWidth: 0.5, opacity: 0.3 });

      // ── Draw divider ──
      const ctx = (pipeline as any).ctx as CanvasRenderingContext2D;
      if (ctx) {
        ctx.fillStyle = '#1e293b';
        ctx.fillRect(VP_WIDTH - DIVIDER, 0, DIVIDER * 2, CANVAS_HEIGHT);
      }

      // ── Render right viewport (Oort Cloud view) ──
      pipeline.render(scene, oortCam, oortViewport, lighting);
      pipeline.renderEdges(scene, oortCam, oortViewport, { color: '#ffffff', lineWidth: 0.5, opacity: 0.2 });

      // Draw orbit rings on top-down view
      if (ctx) {
        ctx.save();
        const ocx = oortViewport.x + oortViewport.width / 2;
        const ocy = oortViewport.y + oortViewport.height / 2;
        const scale = oortViewport.width / 140; // maps -70..70 to viewport width
        ctx.beginPath();
        ctx.rect(oortViewport.x, oortViewport.y, oortViewport.width, oortViewport.height);
        ctx.clip();
        ctx.strokeStyle = 'rgba(255,255,255,0.08)';
        ctx.lineWidth = 0.5;
        for (const p of PLANETS) {
          ctx.beginPath();
          ctx.arc(ocx, ocy, p.distance * scale, 0, Math.PI * 2);
          ctx.stroke();
        }

        ctx.restore();
      }

      // Viewport labels
      if (ctx) {
        ctx.save();
        ctx.font = '11px sans-serif';
        ctx.fillStyle = 'rgba(255,255,255,0.5)';
        ctx.fillText('View from Earth', 8, 16);
        ctx.fillText('Oort Cloud view', VP_WIDTH + DIVIDER + 8, 16);
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
      }, 'Solar System'),
      createElement('div', { style: { flex: '1', minHeight: '300px' } },
        createElement('div', {
          ref: containerCallback,
          style: { width: '100%', maxWidth: `${CANVAS_WIDTH}px`, height: `${CANVAS_HEIGHT}px`, backgroundColor: '#0a0a1a' },
        }),
      ),
      createElement('p', {
        style: { fontSize: '11px', color: 'var(--color-text-muted, #94a3b8)', marginTop: '8px' },
      }, 'Left: perspective view from Earth toward the Sun. Right: Oort Cloud view at 45\u00b0 from the orbital plane.'),
    ),
    // Right: sidebar with planet data
    createElement('div', {
      style: {
        width: '240px', flexShrink: '0', overflowY: 'auto',
        fontSize: '13px', lineHeight: '1.6',
        color: 'var(--color-text, #1f2937)',
        borderLeft: '1px solid var(--color-border, #e2e8f0)',
        paddingLeft: '16px',
      },
    },
      createElement('h3', { style: { fontSize: '15px', fontWeight: '600', marginBottom: '12px' } }, 'Planet Data'),
      createElement('table', { style: { fontSize: '11px', borderCollapse: 'collapse', width: '100%' } },
        createElement('thead', null,
          createElement('tr', null,
            createElement('th', { style: { textAlign: 'left', padding: '2px 6px', borderBottom: '1px solid var(--color-border, #e2e8f0)' } }, 'Planet'),
            createElement('th', { style: { textAlign: 'right', padding: '2px 6px', borderBottom: '1px solid var(--color-border, #e2e8f0)' } }, 'Dist'),
            createElement('th', { style: { textAlign: 'right', padding: '2px 6px', borderBottom: '1px solid var(--color-border, #e2e8f0)' } }, 'Size'),
          ),
        ),
        createElement('tbody', null,
          createElement('tr', null,
            createElement('td', { style: { padding: '2px 6px' } },
              createElement('span', { style: { color: '#fbbf24', fontWeight: '600' } }, 'Sun'),
            ),
            createElement('td', { style: { textAlign: 'right', padding: '2px 6px' } }, '0'),
            createElement('td', { style: { textAlign: 'right', padding: '2px 6px' } }, String(SUN_SIZE)),
          ),
          ...PLANETS.map((p) =>
            createElement('tr', { key: p.id },
              createElement('td', { style: { padding: '2px 6px' } },
                createElement('span', {
                  style: { color: `rgb(${Math.round(p.r * 255)},${Math.round(p.g * 255)},${Math.round(p.b * 255)})`, fontWeight: '600' },
                }, p.label),
              ),
              createElement('td', { style: { textAlign: 'right', padding: '2px 6px' } }, String(p.distance)),
              createElement('td', { style: { textAlign: 'right', padding: '2px 6px' } }, String(p.size)),
            ),
          ),
        ),
      ),
      createElement('h4', { style: { fontSize: '13px', fontWeight: '600', marginTop: '16px', marginBottom: '4px' } }, 'Viewports'),
      createElement('p', { style: { fontSize: '12px' } },
        'Earth View: Perspective camera positioned near Earth, looking at the Sun. FOV 60 degrees.',
      ),
      createElement('p', { style: { fontSize: '12px', marginTop: '4px' } },
        'Oort Cloud: Orthographic camera at 45\u00b0 from orbital plane. Bounds: \u00b170 units.',
      ),
      createElement('h4', { style: { fontSize: '13px', fontWeight: '600', marginTop: '12px', marginBottom: '4px' } }, 'Rendering'),
      createElement('p', { style: { fontSize: '12px' } },
        'CPU pipeline with flat shading. Planets are colored spheres (Mesh.createSphere) orbiting in the XZ plane.',
      ),
    ),
  );
}
