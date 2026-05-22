// (c) 2025-2026 Asymmetric Effort, LLC. MIT LICENSE
// SPDX-License-Identifier: MIT

import { describe, it, expect } from '@asymmetric-effort/nogginlessdom';
import type { Space3DProps } from '../src/Space3D';
import { Camera } from '../src/camera';
import { Viewport } from '../src/viewport';
import { SceneGraph } from '../src/scene-graph';
import { SceneObject } from '../src/scene-object';
import { FlatShading } from '../src/lighting-model';
import { DefaultObjectPicker } from '../src/types';

describe('Space3D props interface', () => {
  it('accepts minimal required props (width and height)', () => {
    const props: Space3DProps = {
      width: 800,
      height: 600,
    };
    expect(props.width).toBe(800);
    expect(props.height).toBe(600);
  });

  it('accepts all optional props', () => {
    const camera = new Camera();
    const viewport = new Viewport({ x: 0, y: 0, width: 800, height: 600, camera });
    const obj = new SceneObject('test-obj');
    const lighting = new FlatShading();
    const picker = new DefaultObjectPicker();

    const props: Space3DProps = {
      width: 1024,
      height: 768,
      finiteSpace: true,
      bounds: {
        min: { x: -10, y: -10, z: -10 },
        max: { x: 10, y: 10, z: 10 },
      },
      lightingModel: lighting,
      onFrame: (_dt, _scene, _cams) => {},
      objectPicker: picker,
      cameras: [camera],
      viewports: [viewport],
      objects: [obj],
      lights: [],
      renderer: 'cpu',
    };

    expect(props.finiteSpace).toBe(true);
    expect(props.renderer).toBe('cpu');
    expect(props.cameras!.length).toBe(1);
    expect(props.viewports!.length).toBe(1);
    expect(props.objects!.length).toBe(1);
  });

  it('supports infinite space (finiteSpace=false)', () => {
    const props: Space3DProps = {
      width: 640,
      height: 480,
      finiteSpace: false,
    };
    expect(props.finiteSpace).toBe(false);
  });

  it('supports all renderer options', () => {
    const renderers: Array<'webgl' | 'cpu' | 'auto'> = ['webgl', 'cpu', 'auto'];
    for (const r of renderers) {
      const props: Space3DProps = { width: 100, height: 100, renderer: r };
      expect(props.renderer).toBe(r);
    }
  });
});

describe('Default camera/viewport creation logic', () => {
  it('creates a default camera at (0, 5, 10) looking at origin', () => {
    const cam = new Camera({
      position: { x: 0, y: 5, z: 10 },
      fov: Math.PI / 4,
      aspect: 800 / 600,
      near: 0.1,
      far: 1000,
    });
    cam.lookAt({ x: 0, y: 0, z: 0 });

    expect(cam.position).toEqual({ x: 0, y: 5, z: 10 });
    expect(cam.fov).toBe(Math.PI / 4);
    expect(cam.aspect).toBeCloseTo(800 / 600);

    // Orientation should be a valid quaternion (unit length)
    const q = cam.orientation;
    const lenSq = q.x * q.x + q.y * q.y + q.z * q.z + q.w * q.w;
    expect(lenSq).toBeCloseTo(1, 5);
  });

  it('creates a default viewport covering the full canvas', () => {
    const cam = new Camera();
    const vp = new Viewport({
      x: 0,
      y: 0,
      width: 800,
      height: 600,
      camera: cam,
    });

    expect(vp.x).toBe(0);
    expect(vp.y).toBe(0);
    expect(vp.width).toBe(800);
    expect(vp.height).toBe(600);
    expect(vp.camera).toBe(cam);
  });

  it('viewport default clear color is black', () => {
    const cam = new Camera();
    const vp = new Viewport({
      x: 0,
      y: 0,
      width: 800,
      height: 600,
      camera: cam,
    });
    expect(vp.clearColor).toEqual({ r: 0, g: 0, b: 0, a: 1 });
  });
});

describe('Scene graph population from props.objects', () => {
  it('registers objects into scene graph', () => {
    const scene = new SceneGraph();
    const objects = [
      new SceneObject('obj-a'),
      new SceneObject('obj-b'),
      new SceneObject('obj-c'),
    ];

    for (const obj of objects) {
      scene.register(obj);
    }

    const visible = scene.getVisibleObjects();
    expect(visible.length).toBe(3);
    expect(visible.map((o) => o.id).sort()).toEqual(['obj-a', 'obj-b', 'obj-c']);
  });

  it('can unregister objects that are removed', () => {
    const scene = new SceneGraph();
    const objA = new SceneObject('obj-a');
    const objB = new SceneObject('obj-b');
    scene.register(objA);
    scene.register(objB);

    scene.unregister('obj-a');

    const visible = scene.getVisibleObjects();
    expect(visible.length).toBe(1);
    expect(visible[0]!.id).toBe('obj-b');
  });

  it('handles empty objects array', () => {
    const scene = new SceneGraph();
    const objects: SceneObject[] = [];

    for (const obj of objects) {
      scene.register(obj);
    }

    const visible = scene.getVisibleObjects();
    expect(visible.length).toBe(0);
  });

  it('tracks registered IDs for diffing', () => {
    const scene = new SceneGraph();
    const registeredIds = new Set<string>();

    // First frame: register objects
    const objects1 = [new SceneObject('a'), new SceneObject('b')];
    for (const obj of objects1) {
      scene.register(obj);
      registeredIds.add(obj.id);
    }
    expect(registeredIds.size).toBe(2);

    // Second frame: 'b' removed, 'c' added
    const objects2 = [new SceneObject('a'), new SceneObject('c')];
    const newIds = new Set<string>();
    for (const obj of objects2) {
      newIds.add(obj.id);
      if (!registeredIds.has(obj.id)) {
        scene.register(obj);
      }
    }
    for (const id of registeredIds) {
      if (!newIds.has(id)) {
        scene.unregister(id);
      }
    }

    const visible = scene.getVisibleObjects();
    expect(visible.length).toBe(2);
    const ids = visible.map((o) => o.id).sort();
    // 'a' from first registration and 'c' from second are visible
    // Note: 'a' was registered in frame 1 and not re-registered, so it persists
    expect(ids).toContain('a');
    expect(ids).toContain('c');
    expect(ids).not.toContain('b');
  });
});
