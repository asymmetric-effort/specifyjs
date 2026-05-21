// (c) 2025-2026 Asymmetric Effort, LLC. MIT LICENSE
// SPDX-License-Identifier: MIT

/**
 * Solar System Simulation — 3D rendering using the 3dSpace CpuPipeline.
 *
 * Two viewports on a single canvas:
 *   Left:  "Free Camera" — inertia-based free-flying camera in space
 *   Right: "Solar System" — orthographic overview at 45deg from orbital plane
 *
 * Real astronomical data with logarithmic/scaled representation.
 * Keyboard controls: Arrow keys for thrust, WASD for pitch/yaw.
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

const THRUST_MAGNITUDE = 5;   // world units/sec²
const ROTATION_SPEED = 1;     // radians/sec

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

/** Normalize a quaternion to unit length. */
function quatNormalize(q: { x: number; y: number; z: number; w: number }): { x: number; y: number; z: number; w: number } {
  const len = Math.sqrt(q.x * q.x + q.y * q.y + q.z * q.z + q.w * q.w);
  if (len === 0) return { x: 0, y: 0, z: 0, w: 1 };
  return { x: q.x / len, y: q.y / len, z: q.z / len, w: q.w / len };
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
    description: 'Real solar system data with dual viewports: free-flying camera and orbital overview.',
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

    // ── Camera 1: Free-flying camera (perspective) ──
    const freeCam = new Camera({
      position: { x: 33, y: 5, z: 0 },
      fov: Math.PI / 3,
      aspect: (VP_WIDTH - DIVIDER) / VP_HEIGHT,
      near: 0.01,
      far: 2000,
    });
    freeCam.lookAt({ x: 0, y: 0, z: 0 });

    const freeViewport = new Viewport({
      x: 0,
      y: 0,
      width: VP_WIDTH - DIVIDER,
      height: VP_HEIGHT,
      camera: freeCam,
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

    // Free camera state
    let camPos = { x: 33, y: 5, z: 0 };
    let camVel = { x: 0, y: 0, z: 0 };

    // Compute initial orientation quaternion: camera at (33,5,0) looking at origin (0,0,0)
    // Forward direction: normalize(origin - position) = normalize(-33, -5, 0)
    const initFwdLen = Math.sqrt(33 * 33 + 5 * 5);
    const initFwd = { x: -33 / initFwdLen, y: -5 / initFwdLen, z: 0 };
    // Camera default forward is -Z. We need a quaternion that rotates -Z to initFwd.
    // Using the rotation between two vectors: from (0,0,-1) to initFwd
    const fromVec = { x: 0, y: 0, z: -1 };
    const dotInit = fromVec.x * initFwd.x + fromVec.y * initFwd.y + fromVec.z * initFwd.z;
    const crossInit = {
      x: fromVec.y * initFwd.z - fromVec.z * initFwd.y,
      y: fromVec.z * initFwd.x - fromVec.x * initFwd.z,
      z: fromVec.x * initFwd.y - fromVec.y * initFwd.x,
    };
    // q = (cross, 1 + dot), then normalize
    let camOrientation = quatNormalize({
      x: crossInit.x,
      y: crossInit.y,
      z: crossInit.z,
      w: 1 + dotInit,
    });

    // Key state tracking
    const keysDown = new Set<string>();

    const handleKeyDown = (e: KeyboardEvent) => {
      keysDown.add(e.key);
    };
    const handleKeyUp = (e: KeyboardEvent) => {
      keysDown.delete(e.key);
    };
    document.addEventListener('keydown', handleKeyDown);
    document.addEventListener('keyup', handleKeyUp);

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

      // ── Update free camera orientation (pitch/yaw) ──
      if (keysDown.has('w') || keysDown.has('W')) {
        // Pitch up: rotate around camera-local X axis (positive angle = look up)
        const pitchQuat = quatFromAxisAngle(1, 0, 0, ROTATION_SPEED * dt);
        camOrientation = quatNormalize(quatMul(camOrientation, pitchQuat));
      }
      if (keysDown.has('s') || keysDown.has('S')) {
        // Pitch down: rotate around camera-local X axis (negative angle = look down)
        const pitchQuat = quatFromAxisAngle(1, 0, 0, -ROTATION_SPEED * dt);
        camOrientation = quatNormalize(quatMul(camOrientation, pitchQuat));
      }
      if (keysDown.has('a') || keysDown.has('A')) {
        // Yaw left: rotate around camera-local Y axis (positive angle = look left)
        const yawQuat = quatFromAxisAngle(0, 1, 0, ROTATION_SPEED * dt);
        camOrientation = quatNormalize(quatMul(camOrientation, yawQuat));
      }
      if (keysDown.has('d') || keysDown.has('D')) {
        // Yaw right: rotate around camera-local Y axis (negative angle = look right)
        const yawQuat = quatFromAxisAngle(0, 1, 0, -ROTATION_SPEED * dt);
        camOrientation = quatNormalize(quatMul(camOrientation, yawQuat));
      }

      // ── Compute camera-local directions in world space ──
      // Camera default: forward = -Z, right = +X, up = +Y
      const camForward = quatRotateVec(camOrientation, { x: 0, y: 0, z: -1 });
      const camRight = quatRotateVec(camOrientation, { x: 1, y: 0, z: 0 });

      // ── Apply thrust to velocity ──
      if (keysDown.has('ArrowUp')) {
        camVel.x += camForward.x * THRUST_MAGNITUDE * dt;
        camVel.y += camForward.y * THRUST_MAGNITUDE * dt;
        camVel.z += camForward.z * THRUST_MAGNITUDE * dt;
      }
      if (keysDown.has('ArrowDown')) {
        camVel.x -= camForward.x * THRUST_MAGNITUDE * dt;
        camVel.y -= camForward.y * THRUST_MAGNITUDE * dt;
        camVel.z -= camForward.z * THRUST_MAGNITUDE * dt;
      }
      if (keysDown.has('ArrowLeft')) {
        camVel.x -= camRight.x * THRUST_MAGNITUDE * dt;
        camVel.y -= camRight.y * THRUST_MAGNITUDE * dt;
        camVel.z -= camRight.z * THRUST_MAGNITUDE * dt;
      }
      if (keysDown.has('ArrowRight')) {
        camVel.x += camRight.x * THRUST_MAGNITUDE * dt;
        camVel.y += camRight.y * THRUST_MAGNITUDE * dt;
        camVel.z += camRight.z * THRUST_MAGNITUDE * dt;
      }

      // ── Update camera position from velocity ──
      camPos.x += camVel.x * dt;
      camPos.y += camVel.y * dt;
      camPos.z += camVel.z * dt;

      // ── Apply camera state to Camera object ──
      freeCam.position = { x: camPos.x, y: camPos.y, z: camPos.z };
      const lookTarget = {
        x: camPos.x + camForward.x,
        y: camPos.y + camForward.y,
        z: camPos.z + camForward.z,
      };
      freeCam.lookAt(lookTarget);

      // ── Render left viewport (free camera view) ──
      pipeline.render(scene, freeCam, freeViewport, lighting);
      pipeline.renderEdges(scene, freeCam, freeViewport, { color: '#ffffff', lineWidth: 0.5, opacity: 0.3 });

      // ── Draw divider ──
      const ctx = (pipeline as any).ctx as CanvasRenderingContext2D;
      if (ctx) {
        ctx.fillStyle = '#1e293b';
        ctx.fillRect(VP_WIDTH - DIVIDER, 0, DIVIDER * 2, CANVAS_HEIGHT);
      }

      // ── Render right viewport (overview) ──
      pipeline.render(scene, overviewCam, overviewViewport, lighting);
      pipeline.renderEdges(scene, overviewCam, overviewViewport, { color: '#ffffff', lineWidth: 0.5, opacity: 0.2 });

      // Draw orbit rings and camera indicator on overview
      if (ctx) {
        ctx.save();
        const ocx = overviewViewport.x + overviewViewport.width / 2;
        const ocy = overviewViewport.y + overviewViewport.height / 2;
        const scale = overviewViewport.width / (overviewBounds * 2);
        ctx.beginPath();
        ctx.rect(overviewViewport.x, overviewViewport.y, overviewViewport.width, overviewViewport.height);
        ctx.clip();

        // Orbit rings
        ctx.strokeStyle = 'rgba(255,255,255,0.08)';
        ctx.lineWidth = 0.5;
        for (let i = 1; i < BODIES.length; i++) {
          const dist = bodyDistance(BODIES[i]!.distAU);
          ctx.beginPath();
          ctx.arc(ocx, ocy, dist * scale, 0, TWO_PI);
          ctx.stroke();
        }

        // Camera position indicator dot
        // Overview camera is at 45deg angle: project camera position onto the overview plane
        // The overview looks from (0, Y, Z) toward origin. In screen space:
        //   screen X = world X, screen Y = -world Z * cos(angle) - world Y * sin(angle) (approx)
        // But since the overview camera uses orthographic and looks at origin from (0, Y, Z),
        // we project using: screen offset = (worldX * scale, -(worldZ * cos45 + worldY * sin45) * scale)
        const cos45 = Math.cos(overviewAngle);
        const sin45 = Math.sin(overviewAngle);
        const camScreenX = ocx + camPos.x * scale;
        const camScreenY = ocy - (camPos.z * cos45 + camPos.y * sin45) * scale;
        ctx.fillStyle = '#00ff88';
        ctx.beginPath();
        ctx.arc(camScreenX, camScreenY, 3, 0, TWO_PI);
        ctx.fill();

        ctx.restore();
      }

      // Viewport labels
      if (ctx) {
        ctx.save();
        ctx.font = '11px sans-serif';
        ctx.fillStyle = 'rgba(255,255,255,0.5)';
        ctx.fillText('Free Camera', 8, 16);
        ctx.fillText('Solar System', VP_WIDTH + DIVIDER + 8, 16);
        ctx.restore();
      }

      rafRef.current = requestAnimationFrame(frame);
    };

    rafRef.current = requestAnimationFrame(frame);

    cleanupRef.current = () => {
      document.removeEventListener('keydown', handleKeyDown);
      document.removeEventListener('keyup', handleKeyUp);
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
      }, 'Left: free-flying camera with inertia. Right: orbital overview at 45\u00b0. Arrow keys to thrust, WASD to look.'),
    ),
    // Right: sidebar with planet data and controls legend
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
      createElement('h4', { style: { fontSize: '13px', fontWeight: '600', marginTop: '16px', marginBottom: '4px' } }, 'Camera Controls'),
      createElement('div', { style: { fontSize: '11px', fontFamily: 'monospace', lineHeight: '1.8' } },
        createElement('div', null, 'Arrow keys: thrust'),
        createElement('div', null, '  Up/Down = forward/back'),
        createElement('div', null, '  Left/Right = strafe'),
        createElement('div', null, 'WASD: pitch and yaw'),
        createElement('div', null, '  W/S = pitch up/down'),
        createElement('div', null, '  A/D = yaw left/right'),
      ),
      createElement('p', {
        style: { fontSize: '11px', marginTop: '8px', fontStyle: 'italic', color: 'var(--color-text-muted, #94a3b8)' },
      }, 'No friction in space \u2014 thrust adds velocity that persists.'),
      createElement('h4', { style: { fontSize: '13px', fontWeight: '600', marginTop: '12px', marginBottom: '4px' } }, 'Viewports'),
      createElement('p', { style: { fontSize: '12px' } },
        'Free Camera: Perspective camera with inertia-based flight. Start between Mars and Jupiter orbits, looking toward the Sun.',
      ),
      createElement('p', { style: { fontSize: '12px', marginTop: '4px' } },
        'Solar System: Orthographic overview at 45\u00b0 from the orbital plane showing all orbits. Green dot shows camera position.',
      ),
      createElement('h4', { style: { fontSize: '13px', fontWeight: '600', marginTop: '12px', marginBottom: '4px' } }, 'Scale'),
      createElement('p', { style: { fontSize: '12px' } },
        `1 AU = ${AU_SCALE} world units. Planet sizes exaggerated (${SIZE_SCALE}\u00d7 real radius, min ${MIN_VISIBLE_SIZE}). Time: 1s = ${TIME_SCALE} days.`,
      ),
    ),
  );
}
