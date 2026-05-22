// (c) 2025-2026 Asymmetric Effort, LLC. MIT LICENSE
// SPDX-License-Identifier: MIT

import type { SceneObject } from './scene-object';

/**
 * Animation update function for a single scene object.
 * Called each frame with the object, elapsed time, and delta time.
 */
export type AnimationFn = (
  object: SceneObject,
  totalTime: number,
  deltaTime: number,
) => void;

/**
 * An animation binding: associates an animation function with a scene object.
 */
export interface AnimationBinding {
  /** The scene object to animate */
  objectId: string;
  /** The animation function to call each frame */
  animate: AnimationFn;
  /** Whether this animation is currently active. Default: true */
  active?: boolean;
}

/**
 * Animation manager that tracks and executes per-object animations.
 */
export class AnimationManager {
  private bindings: Map<string, AnimationBinding> = new Map();

  /**
   * Register an animation for a scene object.
   * If an animation already exists for this objectId, it is replaced.
   */
  register(binding: AnimationBinding): void {
    this.bindings.set(binding.objectId, { ...binding, active: binding.active ?? true });
  }

  /**
   * Unregister an animation by object ID.
   */
  unregister(objectId: string): void {
    this.bindings.delete(objectId);
  }

  /**
   * Pause animation for a specific object.
   */
  pause(objectId: string): void {
    const b = this.bindings.get(objectId);
    if (b) b.active = false;
  }

  /**
   * Resume animation for a specific object.
   */
  resume(objectId: string): void {
    const b = this.bindings.get(objectId);
    if (b) b.active = true;
  }

  /**
   * Check if an object has an active animation.
   */
  isActive(objectId: string): boolean {
    const b = this.bindings.get(objectId);
    return b?.active ?? false;
  }

  /**
   * Get all registered binding IDs.
   */
  getRegisteredIds(): string[] {
    return Array.from(this.bindings.keys());
  }

  /**
   * Execute all active animations for the given frame.
   * Looks up each object in the scene graph by ID.
   */
  update(scene: { getVisibleObjects(): SceneObject[] }, totalTime: number, deltaTime: number): void {
    // Build a lookup map from scene objects
    const objects = scene.getVisibleObjects();
    const objectMap = new Map<string, SceneObject>();
    for (const obj of objects) {
      objectMap.set(obj.id, obj);
    }

    for (const [id, binding] of this.bindings) {
      if (!binding.active) continue;
      const obj = objectMap.get(id);
      if (obj) {
        binding.animate(obj, totalTime, deltaTime);
      }
    }
  }

  /**
   * Remove all bindings.
   */
  clear(): void {
    this.bindings.clear();
  }
}

/**
 * Create a rotation animation around the Y axis.
 */
export function rotateY(radiansPerSecond: number): AnimationFn {
  return (obj, totalTime) => {
    const angle = totalTime * radiansPerSecond;
    const half = angle / 2;
    const s = Math.sin(half);
    obj.rotation = { x: 0, y: s, z: 0, w: Math.cos(half) };
  };
}

/**
 * Create a bobbing animation (up and down on Y axis).
 */
export function bob(amplitude: number, frequency: number, baseY: number = 0): AnimationFn {
  return (obj, totalTime) => {
    obj.position = {
      ...obj.position,
      y: baseY + Math.sin(totalTime * frequency) * amplitude,
    };
  };
}

/**
 * Create a circular orbit animation in the XZ plane.
 */
export function orbit(radius: number, speed: number, centerX: number = 0, centerZ: number = 0): AnimationFn {
  return (obj, totalTime) => {
    const angle = totalTime * speed;
    obj.position = {
      x: centerX + Math.cos(angle) * radius,
      y: obj.position.y,
      z: centerZ + Math.sin(angle) * radius,
    };
  };
}

/**
 * Compose multiple animations on the same object.
 */
export function compose(...fns: AnimationFn[]): AnimationFn {
  return (obj, totalTime, deltaTime) => {
    for (const fn of fns) {
      fn(obj, totalTime, deltaTime);
    }
  };
}
