// (c) 2025-2026 Asymmetric Effort, LLC. MIT LICENSE
// SPDX-License-Identifier: MIT

import type { Camera } from './camera';
import { vec3Add, vec3Scale, vec3Normalize, vec3Sub } from '../../../math/src/vec';
import { quatFromAxisAngle, quatMultiply, quatRotateVec3 } from '../../../math/src/quaternion';

/**
 * Input state snapshot passed to camera controllers each frame.
 */
export interface InputState {
  /** Currently pressed keys (Set of key names, e.g., 'ArrowUp', 'w', 'Shift') */
  keysDown: Set<string>;
  /** Mouse position relative to canvas (pixels) */
  mouseX: number;
  mouseY: number;
  /** Mouse button state */
  mouseLeft: boolean;
  mouseRight: boolean;
  mouseMiddle: boolean;
  /** Mouse movement since last frame (pixels) */
  mouseDeltaX: number;
  mouseDeltaY: number;
  /** Scroll wheel delta */
  scrollDelta: number;
}

/**
 * Consumer-provided camera controller function.
 * Called each frame with the current input state, camera, and delta time.
 * The function should modify the camera's position and orientation.
 */
export type CameraControllerFn = (
  camera: Camera,
  input: InputState,
  deltaTime: number,
) => void;

/**
 * Create an InputState tracker that listens to keyboard, mouse, and wheel events
 * on a canvas element. Returns the current state and a cleanup function.
 */
export function createInputTracker(canvas: HTMLCanvasElement): {
  state: InputState;
  cleanup: () => void;
} {
  const state: InputState = {
    keysDown: new Set(),
    mouseX: 0, mouseY: 0,
    mouseLeft: false, mouseRight: false, mouseMiddle: false,
    mouseDeltaX: 0, mouseDeltaY: 0,
    scrollDelta: 0,
  };

  const onKeyDown = (e: KeyboardEvent) => { state.keysDown.add(e.key); };
  const onKeyUp = (e: KeyboardEvent) => { state.keysDown.delete(e.key); };
  const onMouseMove = (e: MouseEvent) => {
    const rect = canvas.getBoundingClientRect();
    state.mouseDeltaX += e.movementX;
    state.mouseDeltaY += e.movementY;
    state.mouseX = e.clientX - rect.left;
    state.mouseY = e.clientY - rect.top;
  };
  const onMouseDown = (e: MouseEvent) => {
    if (e.button === 0) state.mouseLeft = true;
    if (e.button === 1) state.mouseMiddle = true;
    if (e.button === 2) state.mouseRight = true;
  };
  const onMouseUp = (e: MouseEvent) => {
    if (e.button === 0) state.mouseLeft = false;
    if (e.button === 1) state.mouseMiddle = false;
    if (e.button === 2) state.mouseRight = false;
  };
  const onWheel = (e: WheelEvent) => {
    e.preventDefault();
    state.scrollDelta += e.deltaY;
  };
  const onContextMenu = (e: Event) => { e.preventDefault(); };

  document.addEventListener('keydown', onKeyDown);
  document.addEventListener('keyup', onKeyUp);
  canvas.addEventListener('mousemove', onMouseMove);
  canvas.addEventListener('mousedown', onMouseDown);
  canvas.addEventListener('mouseup', onMouseUp);
  canvas.addEventListener('wheel', onWheel, { passive: false });
  canvas.addEventListener('contextmenu', onContextMenu);

  const cleanup = () => {
    document.removeEventListener('keydown', onKeyDown);
    document.removeEventListener('keyup', onKeyUp);
    canvas.removeEventListener('mousemove', onMouseMove);
    canvas.removeEventListener('mousedown', onMouseDown);
    canvas.removeEventListener('mouseup', onMouseUp);
    canvas.removeEventListener('wheel', onWheel);
    canvas.removeEventListener('contextmenu', onContextMenu);
  };

  return { state, cleanup };
}

/**
 * Reset per-frame deltas. Call at the end of each frame.
 */
export function resetFrameDeltas(state: InputState): void {
  state.mouseDeltaX = 0;
  state.mouseDeltaY = 0;
  state.scrollDelta = 0;
}

/**
 * Orbit controller: left-drag to orbit around a target, scroll to zoom.
 */
export function orbitController(
  target: { x: number; y: number; z: number },
  options?: { orbitSpeed?: number; zoomSpeed?: number; minDist?: number; maxDist?: number },
): CameraControllerFn {
  const speed = options?.orbitSpeed ?? 0.005;
  const zoomSpeed = options?.zoomSpeed ?? 0.1;
  const minDist = options?.minDist ?? 1;
  const maxDist = options?.maxDist ?? 1000;

  return (camera, input, _dt) => {
    // Orbit on left-drag
    if (input.mouseLeft && (input.mouseDeltaX !== 0 || input.mouseDeltaY !== 0)) {
      const yawAngle = -input.mouseDeltaX * speed;
      const pitchAngle = -input.mouseDeltaY * speed;

      // Get current offset from target
      const offset = vec3Sub(camera.position, target);

      // Apply yaw (around world Y)
      const yawQ = quatFromAxisAngle({ x: 0, y: 1, z: 0 }, yawAngle);
      let newOffset = quatRotateVec3(yawQ, offset);

      // Apply pitch (around camera right vector)
      const right = vec3Normalize(vec3Sub(
        { x: -offset.z, y: 0, z: offset.x },
        { x: 0, y: 0, z: 0 }
      ));
      const pitchQ = quatFromAxisAngle(right, pitchAngle);
      newOffset = quatRotateVec3(pitchQ, newOffset);

      camera.position = vec3Add(target, newOffset);
      camera.lookAt(target);
    }

    // Zoom on scroll
    if (input.scrollDelta !== 0) {
      const offset = vec3Sub(camera.position, target);
      const dist = Math.sqrt(offset.x * offset.x + offset.y * offset.y + offset.z * offset.z);
      const newDist = Math.max(minDist, Math.min(maxDist, dist * (1 + input.scrollDelta * zoomSpeed * 0.01)));
      const dir = vec3Normalize(offset);
      camera.position = vec3Add(target, vec3Scale(dir, newDist));
      camera.lookAt(target);
    }
  };
}

/**
 * Fly controller: WASD + mouse look, arrow keys for strafe.
 * Like a free-flying camera in space.
 */
export function flyController(
  options?: { moveSpeed?: number; lookSpeed?: number },
): CameraControllerFn {
  const moveSpeed = options?.moveSpeed ?? 10;
  const lookSpeed = options?.lookSpeed ?? 0.003;

  return (camera, input, dt) => {
    // Mouse look (right-drag or always if pointer locked)
    if (input.mouseRight || input.mouseLeft) {
      if (input.mouseDeltaX !== 0 || input.mouseDeltaY !== 0) {
        const yaw = quatFromAxisAngle({ x: 0, y: 1, z: 0 }, -input.mouseDeltaX * lookSpeed);
        camera.orientation = quatMultiply(yaw, camera.orientation);
        // Pitch around local X
        const localRight = quatRotateVec3(camera.orientation, { x: 1, y: 0, z: 0 });
        const pitch = quatFromAxisAngle(localRight, -input.mouseDeltaY * lookSpeed);
        camera.orientation = quatMultiply(pitch, camera.orientation);
      }
    }

    // Movement
    const forward = quatRotateVec3(camera.orientation, { x: 0, y: 0, z: -1 });
    const right = quatRotateVec3(camera.orientation, { x: 1, y: 0, z: 0 });
    const up = { x: 0, y: 1, z: 0 };
    const spd = moveSpeed * dt;

    if (input.keysDown.has('w') || input.keysDown.has('ArrowUp'))
      camera.position = vec3Add(camera.position, vec3Scale(forward, spd));
    if (input.keysDown.has('s') || input.keysDown.has('ArrowDown'))
      camera.position = vec3Add(camera.position, vec3Scale(forward, -spd));
    if (input.keysDown.has('a') || input.keysDown.has('ArrowLeft'))
      camera.position = vec3Add(camera.position, vec3Scale(right, -spd));
    if (input.keysDown.has('d') || input.keysDown.has('ArrowRight'))
      camera.position = vec3Add(camera.position, vec3Scale(right, spd));
    if (input.keysDown.has(' '))
      camera.position = vec3Add(camera.position, vec3Scale(up, spd));
    if (input.keysDown.has('Shift'))
      camera.position = vec3Add(camera.position, vec3Scale(up, -spd));
  };
}
