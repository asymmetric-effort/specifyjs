// (c) 2025-2026 Asymmetric Effort, LLC. MIT LICENSE
// SPDX-License-Identifier: MIT

import { createElement } from '../../../../core/src/index';
import { useState, useEffect, useRef, useCallback } from '../../../../core/src/hooks/index';
import type { Vec3 } from '../../../math/src/vec';
import type { RenderPipeline } from './render-pipeline';
import type { LightingModel } from './lighting-model';
import type { ObjectPicker, Color } from './types';
import type { Light } from './light';
import { FlatShading } from './lighting-model';
import { DefaultObjectPicker } from './types';
import { Camera } from './camera';
import { Viewport } from './viewport';
import { SceneGraph } from './scene-graph';
import { SceneObject } from './scene-object';
import { CpuPipeline } from './cpu-pipeline';

/** Props for the Space3D component. */
export interface Space3DProps {
  /** Width of the canvas in pixels. */
  width: number;
  /** Height of the canvas in pixels. */
  height: number;
  /** Space mode. */
  spaceMode?: 'finite' | 'infinite';
  /** Bounds for finite mode. */
  bounds?: { min: Vec3; max: Vec3 };
  /** Lighting model (default: FlatShading). */
  lightingModel?: LightingModel;
  /** Consumer animation function — called each frame with deltaTime in seconds. */
  onFrame?: (deltaTime: number, scene: SceneGraph, cameras: Camera[]) => void;
  /** Object picker (default: no-op). */
  objectPicker?: ObjectPicker;
  /** Cameras (consumer-defined). */
  cameras?: Camera[];
  /** Viewports mapped to cameras. */
  viewports?: Viewport[];
  /** Scene objects to register. */
  objects?: SceneObject[];
  /** Lights. */
  lights?: Light[];
  /** Show a 3D grid on the XZ plane for spatial reference. Default: false. */
  showGrid?: boolean;
  /** Grid size in world units (default: 20). */
  gridSize?: number;
  /** Grid divisions (default: 20). */
  gridDivisions?: number;
  /** Preferred renderer: 'webgl' | 'cpu' | 'auto' (default 'auto'). */
  renderer?: 'webgl' | 'cpu' | 'auto';
}

/**
 * Create the default camera positioned at (0, 5, 10) looking at the origin.
 */
function createDefaultCamera(width: number, height: number): Camera {
  const cam = new Camera({
    position: { x: 0, y: 5, z: 10 },
    fov: Math.PI / 4,
    aspect: width / height,
    near: 0.1,
    far: 1000,
  });
  cam.lookAt({ x: 0, y: 0, z: 0 });
  return cam;
}

/**
 * Create a default viewport covering the full canvas.
 */
function createDefaultViewport(width: number, height: number, camera: Camera): Viewport {
  return new Viewport({
    x: 0,
    y: 0,
    width,
    height,
    camera,
  });
}

/**
 * Create the render pipeline based on the renderer preference.
 * For 'auto', tries WebGL first and falls back to CPU.
 * For v1, only CPU pipeline is implemented.
 */
function createPipeline(preference: 'webgl' | 'cpu' | 'auto', canvas: HTMLCanvasElement): RenderPipeline {
  if (preference === 'cpu') {
    const pipeline = new CpuPipeline();
    pipeline.initialize(canvas);
    return pipeline;
  }

  // 'auto' or 'webgl': try WebGL first, fall back to CPU
  if (preference === 'auto' || preference === 'webgl') {
    const glContext = canvas.getContext('webgl') || canvas.getContext('experimental-webgl');
    if (glContext) {
      // WebGL pipeline not yet implemented — fall back to CPU
      const pipeline = new CpuPipeline();
      pipeline.initialize(canvas);
      return pipeline;
    }
  }

  // Fallback to CPU
  const pipeline = new CpuPipeline();
  pipeline.initialize(canvas);
  return pipeline;
}

/**
 * Space3D — a SpecifyJS component that renders a 3D scene to a canvas.
 *
 * Assembles the render pipeline, scene graph, cameras, viewports, and
 * runs a requestAnimationFrame loop for continuous rendering.
 */
export function Space3D(props: Space3DProps) {
  const {
    width,
    height,
    lightingModel,
    onFrame,
    cameras: propCameras,
    viewports: propViewports,
    objects,
    renderer = 'auto',
  } = props;

  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const pipelineRef = useRef<RenderPipeline | null>(null);
  const sceneRef = useRef<SceneGraph | null>(null);
  const rafRef = useRef<number>(0);
  const lastTimeRef = useRef<number>(0);
  const registeredIdsRef = useRef<Set<string>>(new Set());

  // Resolve lighting model
  const lighting = lightingModel ?? new FlatShading();

  // Resolve cameras and viewports
  const resolvedCameras = useCallback(() => {
    if (propCameras && propCameras.length > 0) return propCameras;
    return [createDefaultCamera(width, height)];
  }, [propCameras, width, height]);

  const resolvedViewports = useCallback(() => {
    const cams = resolvedCameras();
    if (propViewports && propViewports.length > 0) return propViewports;
    // Create a single viewport covering the full canvas using the first camera
    return [createDefaultViewport(width, height, cams[0]!)];
  }, [propViewports, resolvedCameras, width, height]);

  // Initialize pipeline, scene, and start render loop on mount
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    // Initialize scene graph
    const scene = new SceneGraph();
    sceneRef.current = scene;

    // Initialize pipeline
    const pipeline = createPipeline(renderer, canvas);
    pipelineRef.current = pipeline;

    // Register initial objects
    if (objects) {
      for (const obj of objects) {
        scene.register(obj);
        registeredIdsRef.current.add(obj.id);
      }
    }

    // Animation loop
    lastTimeRef.current = performance.now();

    const frame = (timestamp: number) => {
      const deltaTime = (timestamp - lastTimeRef.current) / 1000;
      lastTimeRef.current = timestamp;

      const cams = resolvedCameras();
      const vps = resolvedViewports();

      // Consumer update callback
      if (onFrame) {
        onFrame(deltaTime, scene, cams);
      }

      // Render each viewport
      for (const vp of vps) {
        pipeline.render(scene, vp.camera, vp, lighting);
      }

      rafRef.current = requestAnimationFrame(frame);
    };

    rafRef.current = requestAnimationFrame(frame);

    // Cleanup on unmount
    return () => {
      if (rafRef.current) {
        cancelAnimationFrame(rafRef.current);
        rafRef.current = 0;
      }
      pipeline.dispose();
      pipelineRef.current = null;
      sceneRef.current = null;
    };
  }, [renderer]);

  // Sync objects when props.objects changes
  useEffect(() => {
    const scene = sceneRef.current;
    if (!scene) return;

    const currentIds = new Set<string>();
    const newObjects = objects ?? [];

    // Register new objects
    for (const obj of newObjects) {
      currentIds.add(obj.id);
      if (!registeredIdsRef.current.has(obj.id)) {
        scene.register(obj);
      }
    }

    // Unregister removed objects
    for (const id of registeredIdsRef.current) {
      if (!currentIds.has(id)) {
        scene.unregister(id);
      }
    }

    registeredIdsRef.current = currentIds;
  }, [objects]);

  return createElement('canvas', {
    ref: canvasRef,
    width,
    height,
    style: { display: 'block' },
  });
}
