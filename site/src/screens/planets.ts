// (c) 2025-2026 Asymmetric Effort, LLC. MIT LICENSE
// SPDX-License-Identifier: MIT

/**
 * Solar System Simulation — 3D rendering using the 3dSpace CpuPipeline.
 *
 * Two viewports on a single canvas:
 *   Left:  "View from {Planet}" — perspective camera on the selected planet's surface
 *   Right: "Solar System" — orthographic overview at 45deg from orbital plane
 *
 * Real astronomical data with logarithmic/scaled representation.
 * Keyboard controls: 0=Sun, 1=Mercury, 2=Venus, 3=Earth, ... 9=Pluto
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

// ── Constants ─────────────────────────────────────────────────────────

const AU_SCALE = 10;           // 1 AU = 10 world units
const SIZE_SCALE = 0.002;      // real radius (km) * SIZE_SCALE = world units
const MIN_VISIBLE_SIZE = 0.3;  // minimum sphere radius in world units
const TIME_SCALE = 10;         // 1 real second = 10 simulated days
const TWO_PI = 2 * Math.PI;
const DEG_TO_RAD = Math.PI / 180;

// ── Planet data ───────────────────────────────────────────────────────

interface PlanetDef {
  id: string;
  label: string;
  distAU: number;        // distance from sun in AU
  radiusKm: number;      // real radius in km
  periodDays: number;    // orbital period in days
  axialTiltDeg: number;  // axial tilt in degrees
  rotPeriodDays: number; // rotation period in days
  r: number;
  g: number;
  b: number;
}

const BODIES: PlanetDef[] = [
  { id: 'sun',     label: 'Sun',     distAU: 0,     radiusKm: 695700, periodDays: 0,       axialTiltDeg: 7.25,   rotPeriodDays: 25.38,  r: 0.98, g: 0.85, b: 0.15 },
  { id: 'mercury', label: 'Mercury', distAU: 0.387, radiusKm: 2440,   periodDays: 87.97,   axialTiltDeg: 0.03,   rotPeriodDays: 58.65,  r: 0.58, g: 0.58, b: 0.58 },
  { id: 'venus',   label: 'Venus',   distAU: 0.723, radiusKm: 6052,   periodDays: 224.7,   axialTiltDeg: 177.4,  rotPeriodDays: 243.02, r: 0.90, g: 0.60, b: 0.10 },
  { id: 'earth',   label: 'Earth',   distAU: 1.0,   radiusKm: 6371,   periodDays: 365.25,  axialTiltDeg: 23.44,  rotPeriodDays: 1.0,    r: 0.23, g: 0.51, b: 0.96 },
  { id: 'mars',    label: 'Mars',    distAU: 1.524, radiusKm: 3390,   periodDays: 687.0,   axialTiltDeg: 25.19,  rotPeriodDays: 1.026,  r: 0.94, g: 0.27, b: 0.27 },
  { id: 'jupiter', label: 'Jupiter', distAU: 5.203, radiusKm: 69911,  periodDays: 4332.6,  axialTiltDeg: 3.13,   rotPeriodDays: 0.414,  r: 0.80, g: 0.52, b: 0.20 },
  { id: 'saturn',  label: 'Saturn',  distAU: 9.537, radiusKm: 58232,  periodDays: 10759,   axialTiltDeg: 26.73,  rotPeriodDays: 0.444,  r: 0.92, g: 0.78, b: 0.20 },
  { id: 'uranus',  label: 'Uranus',  distAU: 19.19, radiusKm: 25362,  periodDays: 30688,   axialTiltDeg: 97.77,  rotPeriodDays: 0.718,  r: 0.02, g: 0.71, b: 0.82 },
  { id: 'neptune', label: 'Neptune', distAU: 30.07, radiusKm: 24622,  periodDays: 60182,   axialTiltDeg: 28.32,  rotPeriodDays: 0.671,  r: 0.39, g: 0.40, b: 0.94 },
  { id: 'pluto',   label: 'Pluto',   distAU: 39.48, radiusKm: 1188,   periodDays: 90560,   axialTiltDeg: 122.5,  rotPeriodDays: 6.387,  r: 0.55, g: 0.40, b: 0.30 },
];

// Key mapping: 0=Sun, 1=Mercury, ... 9=Pluto
const KEY_LABELS = ['0: Sun', '1: Mercury', '2: Venus', '3: Earth', '4: Mars',
  '5: Jupiter', '6: Saturn', '7: Uranus', '8: Neptune', '9: Pluto'];

/** Compute the visual sphere radius for a body. */
function bodyRadius(radiusKm: number): number {
  const scaled = radiusKm * SIZE_SCALE;
  return Math.max(scaled, MIN_VISIBLE_SIZE);
}

/** Compute visual distance for a body. */
function bodyDistance(distAU: number): number {
  return distAU * AU_SCALE;
}

/** Create a quaternion from axis-angle. */
function quatFromAxisAngle(ax: number, ay: number, az: number, angle: number): { x: number; y: number; z: number; w: number } {
  const half = angle / 2;
  const s = Math.sin(half);
  return { x: ax * s, y: ay * s, z: az * s, w: Math.cos(half) };
}

/** Multiply two quaternions: a * b */
function quatMul(a: { x: number; y: number; z: number; w: number }, b: { x: number; y: number; z: number; w: number }): { x: number; y: number; z: number; w: number } {
  return {
    w: a.w * b.w - a.x * b.x - a.y * b.y - a.z * b.z,
    x: a.w * b.x + a.x * b.w + a.y * b.z - a.z * b.y,
    y: a.w * b.y - a.x * b.z + a.y * b.w + a.z * b.x,
    z: a.w * b.z + a.x * b.y - a.y * b.x + a.z * b.w,
  };
}

/** Rotate a vector by a quaternion. */
function quatRotateVec(q: { x: number; y: number; z: number; w: number }, v: { x: number; y: number; z: number }): { x: number; y: number; z: number } {
  // q * v * q^-1  (for unit quaternion, q^-1 = conjugate)
  const vq = { x: v.x, y: v.y, z: v.z, w: 0 };
  const qConj = { x: -q.x, y: -q.y, z: -q.z, w: q.w };
  const result = quatMul(quatMul(q, vq), qConj);
  return { x: result.x, y: result.y, z: result.z };
}

// ── Canvas & viewport dimensions ──────────────────────────────────────

const CANVAS_WIDTH = 960;
const CANVAS_HEIGHT = 400;
const VP_WIDTH = CANVAS_WIDTH / 2;
const VP_HEIGHT = CANVAS_HEIGHT;
const DIVIDER = 2;

// ── Component ─────────────────────────────────────────────────────────

export function PlanetsScreen() {
  useHead({
    title: 'Solar System — SpecifyJS',
    description: 'Real solar system data with dual viewports: planet surface camera and orbital overview.',
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
    const sceneObjects: SceneObject[] = [];

    for (const body of BODIES) {
      const r = bodyRadius(body.radiusKm);
      const segments = body.id === 'sun' ? 24 : 14;
      const slices = body.id === 'sun' ? 32 : 20;
      const mesh = Mesh.createSphere(r, segments, slices);
      const obj = new SceneObject(body.id);
      obj.position = { x: bodyDistance(body.distAU), y: 0, z: 0 };
      obj.mesh = mesh;
      obj.material = createMaterial({ r: body.r, g: body.g, b: body.b, a: 1 });
      scene.register(obj);
      sceneObjects.push(obj);
    }

    // ── Camera 1: Surface camera (perspective) ──
    const surfaceCam = new Camera({
      position: { x: 10, y: 2, z: 5 },
      fov: Math.PI / 3,
      aspect: (VP_WIDTH - DIVIDER) / VP_HEIGHT,
      near: 0.01,
      far: 2000,
    });
    surfaceCam.lookAt({ x: 0, y: 0, z: 0 });

    const surfaceViewport = new Viewport({
      x: 0,
      y: 0,
      width: VP_WIDTH - DIVIDER,
      height: VP_HEIGHT,
      camera: surfaceCam,
      clearColor: { r: 0.02, g: 0.02, b: 0.06, a: 1 },
    });

    // ── Camera 2: Overview at 45deg from orbital plane ──
    const overviewDist = 500;
    const overviewAngle = Math.PI / 4;
    const overviewBounds = 450;
    const overviewCam = new Camera({
      projectionMode: 'orthographic',
      position: {
        x: 0,
        y: overviewDist * Math.sin(overviewAngle),
        z: overviewDist * Math.cos(overviewAngle),
      },
      left: -overviewBounds,
      right: overviewBounds,
      top: overviewBounds,
      bottom: -overviewBounds,
      near: 0.1,
      far: 2000,
    });
    overviewCam.lookAt({ x: 0, y: 0, z: 0 });

    const overviewViewport = new Viewport({
      x: VP_WIDTH + DIVIDER,
      y: 0,
      width: VP_WIDTH - DIVIDER,
      height: VP_HEIGHT,
      camera: overviewCam,
      clearColor: { r: 0.01, g: 0.01, b: 0.04, a: 1 },
    });

    // Pipeline & lighting
    const pipeline = new CpuPipeline();
    pipeline.initialize(canvas);
    const lighting = new FlatShading();

    // Animation state
    let totalTime = 0;
    let lastTime = performance.now();
    let selectedPlanetIndex = 3; // Start with Earth (index 3 in BODIES: Sun=0, Mercury=1, Venus=2, Earth=3)

    // Keyboard controls
    const handleKeyDown = (e: KeyboardEvent) => {
      const idx = parseInt(e.key);
      if (idx >= 0 && idx <= 9) {
        selectedPlanetIndex = idx;
      }
    };
    document.addEventListener('keydown', handleKeyDown);

    // Precompute axial tilt quaternions (tilt around Z axis from Y-up)
    const axialTiltQuats = BODIES.map((body) => {
      const tiltRad = body.axialTiltDeg * DEG_TO_RAD;
      return quatFromAxisAngle(0, 0, 1, tiltRad);
    });

    const frame = () => {
      const now = performance.now();
      const dt = (now - lastTime) / 1000;
      lastTime = now;
      totalTime += dt * TIME_SCALE; // totalTime is in simulated days

      // Update body positions and rotations
      for (let i = 0; i < BODIES.length; i++) {
        const body = BODIES[i]!;
        const obj = sceneObjects[i]!;
        const dist = bodyDistance(body.distAU);

        // Orbital position (circular orbit in XZ plane)
        if (body.periodDays > 0) {
          const orbitalAngle = TWO_PI * totalTime / body.periodDays;
          obj.position = {
            x: Math.cos(orbitalAngle) * dist,
            y: 0,
            z: Math.sin(orbitalAngle) * dist,
          };
        }

        // Planet rotation around tilted axis
        const rotAngle = TWO_PI * totalTime / body.rotPeriodDays;
        const tiltQuat = axialTiltQuats[i]!;
        // Rotation = tilt * spin_around_Y
        const spinQuat = quatFromAxisAngle(0, 1, 0, rotAngle);
        obj.rotation = quatMul(tiltQuat, spinQuat);
      }

      // Update surface camera for the selected planet
      const selBody = BODIES[selectedPlanetIndex]!;
      const selObj = sceneObjects[selectedPlanetIndex]!;
      const selTilt = axialTiltQuats[selectedPlanetIndex]!;
      const selRadius = bodyRadius(selBody.radiusKm);

      // Camera on surface at equator, rotating with the planet
      const rotAngle = TWO_PI * totalTime / selBody.rotPeriodDays;
      const spinQuat = quatFromAxisAngle(0, 1, 0, rotAngle);
      const fullRot = quatMul(selTilt, spinQuat);

      // Surface position: equator, rotating with the planet
      const surfaceDir = quatRotateVec(fullRot, { x: 1, y: 0, z: 0 });
      const camOffset = selRadius * 1.05; // slightly above surface
      surfaceCam.position = {
        x: selObj.position.x + surfaceDir.x * camOffset,
        y: selObj.position.y + surfaceDir.y * camOffset,
        z: selObj.position.z + surfaceDir.z * camOffset,
      };

      // Camera looks outward and slightly upward
      const upDir = quatRotateVec(fullRot, { x: 0, y: 1, z: 0 });
      const lookTarget = {
        x: surfaceCam.position.x + surfaceDir.x * 10 + upDir.x * 2,
        y: surfaceCam.position.y + surfaceDir.y * 10 + upDir.y * 2,
        z: surfaceCam.position.z + surfaceDir.z * 10 + upDir.z * 2,
      };
      surfaceCam.lookAt(lookTarget);

      // ── Render left viewport (surface view) ──
      pipeline.render(scene, surfaceCam, surfaceViewport, lighting);
      pipeline.renderEdges(scene, surfaceCam, surfaceViewport, { color: '#ffffff', lineWidth: 0.5, opacity: 0.3 });

      // ── Draw divider ──
      const ctx = (pipeline as any).ctx as CanvasRenderingContext2D;
      if (ctx) {
        ctx.fillStyle = '#1e293b';
        ctx.fillRect(VP_WIDTH - DIVIDER, 0, DIVIDER * 2, CANVAS_HEIGHT);
      }

      // ── Render right viewport (overview) ──
      pipeline.render(scene, overviewCam, overviewViewport, lighting);
      pipeline.renderEdges(scene, overviewCam, overviewViewport, { color: '#ffffff', lineWidth: 0.5, opacity: 0.2 });

      // Draw orbit rings on overview
      if (ctx) {
        ctx.save();
        const ocx = overviewViewport.x + overviewViewport.width / 2;
        const ocy = overviewViewport.y + overviewViewport.height / 2;
        const scale = overviewViewport.width / (overviewBounds * 2);
        ctx.beginPath();
        ctx.rect(overviewViewport.x, overviewViewport.y, overviewViewport.width, overviewViewport.height);
        ctx.clip();
        ctx.strokeStyle = 'rgba(255,255,255,0.08)';
        ctx.lineWidth = 0.5;
        for (let i = 1; i < BODIES.length; i++) {
          const dist = bodyDistance(BODIES[i]!.distAU);
          ctx.beginPath();
          ctx.arc(ocx, ocy, dist * scale, 0, TWO_PI);
          ctx.stroke();
        }
        ctx.restore();
      }

      // Viewport labels
      if (ctx) {
        ctx.save();
        ctx.font = '11px sans-serif';
        ctx.fillStyle = 'rgba(255,255,255,0.5)';
        ctx.fillText(`View from ${selBody.label}`, 8, 16);
        ctx.fillText('Solar System', VP_WIDTH + DIVIDER + 8, 16);
        ctx.restore();
      }

      rafRef.current = requestAnimationFrame(frame);
    };

    rafRef.current = requestAnimationFrame(frame);

    cleanupRef.current = () => {
      document.removeEventListener('keydown', handleKeyDown);
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
      }, 'Left: surface camera view from selected planet. Right: orbital overview at 45\u00b0. Press 0\u20139 to switch planets.'),
    ),
    // Right: sidebar with planet data and key legend
    createElement('div', {
      style: {
        width: '260px', flexShrink: '0', overflowY: 'auto',
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
            createElement('th', { style: { textAlign: 'left', padding: '2px 6px', borderBottom: '1px solid var(--color-border, #e2e8f0)' } }, 'Body'),
            createElement('th', { style: { textAlign: 'right', padding: '2px 6px', borderBottom: '1px solid var(--color-border, #e2e8f0)' } }, 'Dist (AU)'),
            createElement('th', { style: { textAlign: 'right', padding: '2px 6px', borderBottom: '1px solid var(--color-border, #e2e8f0)' } }, 'R (km)'),
            createElement('th', { style: { textAlign: 'right', padding: '2px 6px', borderBottom: '1px solid var(--color-border, #e2e8f0)' } }, 'Period (d)'),
          ),
        ),
        createElement('tbody', null,
          ...BODIES.map((p) =>
            createElement('tr', { key: p.id },
              createElement('td', { style: { padding: '2px 6px' } },
                createElement('span', {
                  style: { color: `rgb(${Math.round(p.r * 255)},${Math.round(p.g * 255)},${Math.round(p.b * 255)})`, fontWeight: '600' },
                }, p.label),
              ),
              createElement('td', { style: { textAlign: 'right', padding: '2px 6px' } }, p.distAU === 0 ? '-' : String(p.distAU)),
              createElement('td', { style: { textAlign: 'right', padding: '2px 6px' } }, String(p.radiusKm)),
              createElement('td', { style: { textAlign: 'right', padding: '2px 6px' } }, p.periodDays === 0 ? '-' : String(p.periodDays)),
            ),
          ),
        ),
      ),
      createElement('h4', { style: { fontSize: '13px', fontWeight: '600', marginTop: '16px', marginBottom: '4px' } }, 'Keyboard Controls'),
      createElement('div', { style: { fontSize: '11px', fontFamily: 'monospace', lineHeight: '1.8' } },
        ...KEY_LABELS.map((label) =>
          createElement('div', { key: label }, label),
        ),
      ),
      createElement('h4', { style: { fontSize: '13px', fontWeight: '600', marginTop: '12px', marginBottom: '4px' } }, 'Viewports'),
      createElement('p', { style: { fontSize: '12px' } },
        'Surface View: Perspective camera on the selected planet\'s equator, rotating with the planet. Shows what you\'d see standing on its surface.',
      ),
      createElement('p', { style: { fontSize: '12px', marginTop: '4px' } },
        'Solar System: Orthographic overview at 45\u00b0 from the orbital plane showing all orbits.',
      ),
      createElement('h4', { style: { fontSize: '13px', fontWeight: '600', marginTop: '12px', marginBottom: '4px' } }, 'Scale'),
      createElement('p', { style: { fontSize: '12px' } },
        `1 AU = ${AU_SCALE} world units. Planet sizes exaggerated (${SIZE_SCALE}\u00d7 real radius, min ${MIN_VISIBLE_SIZE}). Time: 1s = ${TIME_SCALE} days.`,
      ),
    ),
  );
}
