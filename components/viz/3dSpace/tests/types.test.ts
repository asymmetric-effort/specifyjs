// @vitest-environment node
// (c) 2025-2026 Asymmetric Effort, LLC. MIT LICENSE
// SPDX-License-Identifier: MIT

import { describe, it, expect } from '@asymmetric-effort/nogginlessdom';
import { Mesh } from '../src/mesh';
import { SceneObject } from '../src/scene-object';
import { Camera } from '../src/camera';
import { SceneGraph } from '../src/scene-graph';
import { FlatShading, LambertianShading } from '../src/lighting-model';
import { DefaultObjectPicker } from '../src/types';
import { Light } from '../src/light';
import { Viewport } from '../src/viewport';
import { createMaterial } from '../src/material';
import { generateTerrain, sineTerrain, heightGradientColor } from '../src/terrain';
import type { Color, ShadeParams } from '../src/types';
import { solidTexture, checkerboardTexture, gradientTexture, noiseTexture } from '../src/texture';
import { createInputTracker, resetFrameDeltas, orbitController, flyController } from '../src/camera-controller';
import type { InputState } from '../src/camera-controller';
import { clampToBounds, isInBounds, boundsCenter, boundsSize, applyBoundary } from '../src/bounds';
import type { SpaceBounds, BoundaryMode } from '../src/bounds';
import { CpuPipeline } from '../src/cpu-pipeline';
import { screenToRay, rayIntersectSphere, rayIntersectAABB, BoundingSpherePicker, pickAtScreen } from '../src/picking';
import { vec3Length } from '../../../math/src/vec';
import { AnimationManager, rotateY, bob, orbit, compose } from '../src/animation';
import {
  computeBoundingSphereRadius,
  computeAABB,
  sphereSphereTest,
  aabbTest,
  CollisionManager,
} from '../src/collision';
import type { CollisionInfo } from '../src/collision';

describe('Mesh', () => {
  describe('createBox', () => {
    it('produces 24 vertices (6 faces x 4 verts) and 36 indices (6 faces x 2 tris x 3)', () => {
      const box = Mesh.createBox(2, 2, 2);
      expect(box.vertexCount).toBe(24);
      expect(box.indexCount).toBe(36);
    });

    it('produces correct array lengths for packed data', () => {
      const box = Mesh.createBox(1, 1, 1);
      expect(box.vertices.length).toBe(24 * 3); // 24 vertices, 3 floats each
      expect(box.normals.length).toBe(24 * 3);
      expect(box.indices.length).toBe(36);
    });

    it('has vertex positions bounded by half-extents', () => {
      const box = Mesh.createBox(4, 6, 8);
      for (let i = 0; i < box.vertices.length; i += 3) {
        expect(Math.abs(box.vertices[i]!)).toBeLessThanOrEqual(2);    // half width
        expect(Math.abs(box.vertices[i + 1]!)).toBeLessThanOrEqual(3); // half height
        expect(Math.abs(box.vertices[i + 2]!)).toBeLessThanOrEqual(4); // half depth
      }
    });
  });

  describe('createPlane', () => {
    it('produces correct counts for a 1x1 segment plane', () => {
      const plane = Mesh.createPlane(10, 10);
      // 1 segment each: (1+1)*(1+1) = 4 vertices, 2 triangles = 6 indices
      expect(plane.vertexCount).toBe(4);
      expect(plane.indexCount).toBe(6);
    });

    it('produces correct counts for a multi-segment plane', () => {
      const plane = Mesh.createPlane(10, 10, 3, 2);
      // (3+1)*(2+1) = 12 vertices, 3*2*2 = 12 triangles = 36 indices
      expect(plane.vertexCount).toBe(12);
      expect(plane.indexCount).toBe(36);
    });

    it('generates UV coordinates', () => {
      const plane = Mesh.createPlane(10, 10, 2, 2);
      expect(plane.uvs).toBeDefined();
      expect(plane.uvs!.length).toBe(plane.vertexCount * 2);
    });

    it('all normals point up (y+)', () => {
      const plane = Mesh.createPlane(5, 5, 3, 3);
      for (let i = 0; i < plane.normals.length; i += 3) {
        expect(plane.normals[i]).toBe(0);     // x
        expect(plane.normals[i + 1]).toBe(1); // y
        expect(plane.normals[i + 2]).toBe(0); // z
      }
    });
  });

  describe('constructor', () => {
    it('stores optional uvs and colors', () => {
      const verts = new Float32Array([0, 0, 0]);
      const norms = new Float32Array([0, 1, 0]);
      const inds = new Uint32Array([0]);
      const uvs = new Float32Array([0, 0]);
      const colors = new Float32Array([1, 0, 0, 1]);
      const mesh = new Mesh(verts, norms, inds, uvs, colors);
      expect(mesh.uvs).toBe(uvs);
      expect(mesh.colors).toBe(colors);
    });
  });
});

describe('SceneObject', () => {
  it('has default transform values', () => {
    const obj = new SceneObject('test');
    expect(obj.id).toBe('test');
    expect(obj.position).toEqual({ x: 0, y: 0, z: 0 });
    expect(obj.rotation).toEqual({ x: 0, y: 0, z: 0, w: 1 });
    expect(obj.scale).toEqual({ x: 1, y: 1, z: 1 });
    expect(obj.visible).toBe(true);
    expect(obj.parent).toBeNull();
    expect(obj.children).toEqual([]);
  });

  it('supports parent/child hierarchy', () => {
    const parent = new SceneObject('parent');
    const child = new SceneObject('child');

    parent.addChild(child);
    expect(child.parent).toBe(parent);
    expect(parent.children).toContain(child);
    expect(parent.children.length).toBe(1);
  });

  it('removes child from previous parent when re-parenting', () => {
    const parent1 = new SceneObject('p1');
    const parent2 = new SceneObject('p2');
    const child = new SceneObject('child');

    parent1.addChild(child);
    expect(parent1.children.length).toBe(1);

    parent2.addChild(child);
    expect(parent1.children.length).toBe(0);
    expect(parent2.children.length).toBe(1);
    expect(child.parent).toBe(parent2);
  });

  it('removeChild clears parent reference', () => {
    const parent = new SceneObject('parent');
    const child = new SceneObject('child');
    parent.addChild(child);

    parent.removeChild(child);
    expect(child.parent).toBeNull();
    expect(parent.children.length).toBe(0);
  });

  it('removeChild is no-op for non-child', () => {
    const parent = new SceneObject('parent');
    const other = new SceneObject('other');
    parent.removeChild(other);
    expect(parent.children.length).toBe(0);
  });

  it('getWorldMatrix returns identity for default transform', () => {
    const obj = new SceneObject('test');
    const mat = obj.getWorldMatrix();
    expect(mat.length).toBe(16);
    // Identity matrix (column-major)
    const identity = new Float64Array(16);
    identity[0] = 1;
    identity[5] = 1;
    identity[10] = 1;
    identity[15] = 1;
    for (let i = 0; i < 16; i++) {
      expect(mat[i]).toBeCloseTo(identity[i]!, 10);
    }
  });

  it('getWorldMatrix includes translation', () => {
    const obj = new SceneObject('test');
    obj.position = { x: 3, y: 5, z: 7 };
    const mat = obj.getWorldMatrix();
    expect(mat[12]).toBeCloseTo(3);
    expect(mat[13]).toBeCloseTo(5);
    expect(mat[14]).toBeCloseTo(7);
  });

  it('getWorldMatrix composes parent transforms', () => {
    const parent = new SceneObject('parent');
    parent.position = { x: 10, y: 0, z: 0 };
    const child = new SceneObject('child');
    child.position = { x: 5, y: 0, z: 0 };
    parent.addChild(child);

    const mat = child.getWorldMatrix();
    // Combined translation should be 15 along x
    expect(mat[12]).toBeCloseTo(15);
  });
});

describe('Camera', () => {
  it('has default values', () => {
    const cam = new Camera();
    expect(cam.position).toEqual({ x: 0, y: 0, z: 0 });
    expect(cam.projectionMode).toBe('perspective');
    expect(cam.near).toBe(0.1);
    expect(cam.far).toBe(1000);
  });

  it('getViewMatrix returns a Mat4 with 16 elements', () => {
    const cam = new Camera();
    const view = cam.getViewMatrix();
    expect(view.length).toBe(16);
  });

  it('getViewMatrix at origin with identity orientation is identity', () => {
    const cam = new Camera();
    const view = cam.getViewMatrix();
    // Should be identity since position is origin and orientation is identity quaternion
    expect(view[0]).toBeCloseTo(1);
    expect(view[5]).toBeCloseTo(1);
    expect(view[10]).toBeCloseTo(1);
    expect(view[15]).toBeCloseTo(1);
    expect(view[12]).toBeCloseTo(0);
    expect(view[13]).toBeCloseTo(0);
    expect(view[14]).toBeCloseTo(0);
  });

  it('getProjectionMatrix returns a Mat4 for perspective mode', () => {
    const cam = new Camera({ projectionMode: 'perspective' });
    const proj = cam.getProjectionMatrix();
    expect(proj.length).toBe(16);
    // Perspective matrix should have non-zero values at specific positions
    expect(proj[0]).not.toBe(0); // f / aspect
    expect(proj[5]).not.toBe(0); // f
  });

  it('getProjectionMatrix returns a Mat4 for orthographic mode', () => {
    const cam = new Camera({ projectionMode: 'orthographic' });
    const proj = cam.getProjectionMatrix();
    expect(proj.length).toBe(16);
    expect(proj[15]).toBeCloseTo(1);
  });

  it('move updates position', () => {
    const cam = new Camera();
    cam.move({ x: 1, y: 2, z: 3 });
    expect(cam.position).toEqual({ x: 1, y: 2, z: 3 });
    cam.move({ x: -1, y: 0, z: 0 });
    expect(cam.position).toEqual({ x: 0, y: 2, z: 3 });
  });

  it('rotate updates orientation via quaternion multiplication', () => {
    const cam = new Camera();
    // Rotate by identity quaternion should not change orientation
    cam.rotate({ x: 0, y: 0, z: 0, w: 1 });
    expect(cam.orientation.w).toBeCloseTo(1);
    expect(cam.orientation.x).toBeCloseTo(0);
    expect(cam.orientation.y).toBeCloseTo(0);
    expect(cam.orientation.z).toBeCloseTo(0);
  });

  it('lookAt changes orientation', () => {
    const cam = new Camera({ position: { x: 0, y: 0, z: 5 } });
    cam.lookAt({ x: 0, y: 0, z: 0 });
    // After lookAt, the orientation quaternion should be different from identity
    // The camera looks from (0,0,5) toward (0,0,0), i.e. along -z
    const q = cam.orientation;
    const lenSq = q.x * q.x + q.y * q.y + q.z * q.z + q.w * q.w;
    expect(lenSq).toBeCloseTo(1, 5); // quaternion should be unit length
  });
});

describe('SceneGraph', () => {
  it('has an invisible root node', () => {
    const sg = new SceneGraph();
    expect(sg.root.visible).toBe(false);
    expect(sg.root.id).toBe('__root__');
  });

  it('register adds objects under root', () => {
    const sg = new SceneGraph();
    const obj = new SceneObject('a');
    sg.register(obj);
    expect(sg.root.children.length).toBe(1);
    expect(sg.root.children[0]).toBe(obj);
  });

  it('unregister removes object by id', () => {
    const sg = new SceneGraph();
    const obj = new SceneObject('a');
    sg.register(obj);
    sg.unregister('a');
    expect(sg.root.children.length).toBe(0);
    expect(obj.parent).toBeNull();
  });

  it('unregister is no-op for unknown id', () => {
    const sg = new SceneGraph();
    sg.unregister('nonexistent');
    expect(sg.root.children.length).toBe(0);
  });

  it('traverse visits all objects depth-first', () => {
    const sg = new SceneGraph();
    const a = new SceneObject('a');
    const b = new SceneObject('b');
    const c = new SceneObject('c');
    a.addChild(b);
    sg.register(a);
    sg.register(c);

    const visited: string[] = [];
    sg.traverse((obj) => visited.push(obj.id));
    expect(visited).toEqual(['a', 'b', 'c']);
  });

  it('getVisibleObjects filters by visible flag', () => {
    const sg = new SceneGraph();
    const a = new SceneObject('visible');
    const b = new SceneObject('hidden');
    b.visible = false;
    sg.register(a);
    sg.register(b);

    const visible = sg.getVisibleObjects();
    expect(visible.length).toBe(1);
    expect(visible[0]!.id).toBe('visible');
  });

  it('traverse includes nested children', () => {
    const sg = new SceneGraph();
    const a = new SceneObject('a');
    const b = new SceneObject('b');
    const c = new SceneObject('c');
    const d = new SceneObject('d');
    a.addChild(b);
    b.addChild(c);
    sg.register(a);
    sg.register(d);

    const visited: string[] = [];
    sg.traverse((obj) => visited.push(obj.id));
    expect(visited).toEqual(['a', 'b', 'c', 'd']);
  });
});

describe('FlatShading', () => {
  it('shade returns materialColor unchanged', () => {
    const flat = new FlatShading();
    const materialColor: Color = { r: 0.5, g: 0.3, b: 0.8, a: 1.0 };
    const params: ShadeParams = {
      normal: { x: 0, y: 1, z: 0 },
      lightDir: { x: 0, y: -1, z: 0 },
      viewDir: { x: 0, y: 0, z: -1 },
      lightColor: { r: 1, g: 1, b: 1, a: 1 },
      materialColor,
      ambientStrength: 0.1,
    };

    const result = flat.shade(params);
    expect(result.r).toBe(0.5);
    expect(result.g).toBe(0.3);
    expect(result.b).toBe(0.8);
    expect(result.a).toBe(1.0);
  });

  it('shade returns a copy, not the same reference', () => {
    const flat = new FlatShading();
    const materialColor: Color = { r: 1, g: 0, b: 0, a: 1 };
    const params: ShadeParams = {
      normal: { x: 0, y: 1, z: 0 },
      lightDir: { x: 0, y: -1, z: 0 },
      viewDir: { x: 0, y: 0, z: -1 },
      lightColor: { r: 1, g: 1, b: 1, a: 1 },
      materialColor,
      ambientStrength: 0.1,
    };
    const result = flat.shade(params);
    expect(result).not.toBe(materialColor);
    expect(result).toEqual(materialColor);
  });

  it('has name "FlatShading"', () => {
    const flat = new FlatShading();
    expect(flat.name).toBe('FlatShading');
  });

  it('vertexShaderSource returns a string', () => {
    const flat = new FlatShading();
    expect(typeof flat.vertexShaderSource()).toBe('string');
    expect(flat.vertexShaderSource().length).toBeGreaterThan(0);
  });

  it('fragmentShaderSource returns a string', () => {
    const flat = new FlatShading();
    expect(typeof flat.fragmentShaderSource()).toBe('string');
    expect(flat.fragmentShaderSource().length).toBeGreaterThan(0);
  });

  it('uniforms returns object with uColor', () => {
    const flat = new FlatShading();
    const material = createMaterial({ r: 0.2, g: 0.4, b: 0.6, a: 1.0 });
    const uniforms = flat.uniforms([], material);
    expect(uniforms.uColor).toEqual([0.2, 0.4, 0.6, 1.0]);
  });
});

describe('DefaultObjectPicker', () => {
  it('always returns null', () => {
    const picker = new DefaultObjectPicker();
    const result = picker.pick(
      { x: 0, y: 0, z: 0 },
      { x: 0, y: 0, z: -1 },
      [new SceneObject('a')],
    );
    expect(result).toBeNull();
  });

  it('returns null with empty objects array', () => {
    const picker = new DefaultObjectPicker();
    const result = picker.pick({ x: 0, y: 0, z: 0 }, { x: 1, y: 0, z: 0 }, []);
    expect(result).toBeNull();
  });
});

describe('Light', () => {
  it('creates a directional light with defaults', () => {
    const light = new Light({ type: 'directional' });
    expect(light.type).toBe('directional');
    expect(light.intensity).toBe(1);
    expect(light.color).toEqual({ r: 1, g: 1, b: 1, a: 1 });
  });

  it('creates a point light with custom values', () => {
    const light = new Light({
      type: 'point',
      position: { x: 5, y: 10, z: 3 },
      color: { r: 1, g: 0, b: 0, a: 1 },
      intensity: 2.5,
      range: 50,
    });
    expect(light.type).toBe('point');
    expect(light.position).toEqual({ x: 5, y: 10, z: 3 });
    expect(light.intensity).toBe(2.5);
    expect(light.range).toBe(50);
  });

  it('creates a spot light with spotAngle', () => {
    const light = new Light({
      type: 'spot',
      spotAngle: Math.PI / 6,
    });
    expect(light.type).toBe('spot');
    expect(light.spotAngle).toBeCloseTo(Math.PI / 6);
  });
});

describe('Viewport', () => {
  it('stores dimensions and camera', () => {
    const cam = new Camera();
    const vp = new Viewport({ x: 0, y: 0, width: 800, height: 600, camera: cam });
    expect(vp.x).toBe(0);
    expect(vp.y).toBe(0);
    expect(vp.width).toBe(800);
    expect(vp.height).toBe(600);
    expect(vp.camera).toBe(cam);
  });

  it('uses default black clear color', () => {
    const cam = new Camera();
    const vp = new Viewport({ x: 0, y: 0, width: 100, height: 100, camera: cam });
    expect(vp.clearColor).toEqual({ r: 0, g: 0, b: 0, a: 1 });
  });

  it('accepts custom clear color', () => {
    const cam = new Camera();
    const color: Color = { r: 0.2, g: 0.3, b: 0.4, a: 1 };
    const vp = new Viewport({ x: 0, y: 0, width: 100, height: 100, camera: cam, clearColor: color });
    expect(vp.clearColor).toEqual(color);
  });
});

describe('Material', () => {
  it('createMaterial sets defaults', () => {
    const mat = createMaterial({ r: 1, g: 0, b: 0, a: 1 });
    expect(mat.color).toEqual({ r: 1, g: 0, b: 0, a: 1 });
    expect(mat.wireframe).toBe(false);
    expect(mat.texture).toBeUndefined();
  });

  it('createMaterial accepts wireframe option', () => {
    const mat = createMaterial({ r: 0, g: 1, b: 0, a: 1 }, { wireframe: true });
    expect(mat.wireframe).toBe(true);
  });
});

describe('DefaultObjectPicker (additional)', () => {
  it('pick() returns null when called with no arguments', () => {
    const picker = new DefaultObjectPicker();
    // The pick signature allows calling with no args since the implementation ignores them
    const result = picker.pick();
    expect(result).toBeNull();
  });

  it('pick() returns null for multiple objects', () => {
    const picker = new DefaultObjectPicker();
    const objects = [new SceneObject('a'), new SceneObject('b'), new SceneObject('c')];
    const result = picker.pick({ x: 1, y: 2, z: 3 }, { x: 0, y: 0, z: -1 }, objects);
    expect(result).toBeNull();
  });
});

describe('Color type validation', () => {
  it('Color with valid RGBA values', () => {
    const color: Color = { r: 0.5, g: 0.3, b: 0.8, a: 1.0 };
    expect(color.r).toBe(0.5);
    expect(color.g).toBe(0.3);
    expect(color.b).toBe(0.8);
    expect(color.a).toBe(1.0);
  });

  it('Color with zero values', () => {
    const color: Color = { r: 0, g: 0, b: 0, a: 0 };
    expect(color.r).toBe(0);
    expect(color.a).toBe(0);
  });

  it('Color with max values', () => {
    const color: Color = { r: 1, g: 1, b: 1, a: 1 };
    expect(color.r).toBe(1);
    expect(color.g).toBe(1);
  });
});

describe('Vertex type', () => {
  it('Vertex with position and normal only', () => {
    const v = { position: { x: 1, y: 2, z: 3 }, normal: { x: 0, y: 1, z: 0 } };
    expect(v.position.x).toBe(1);
    expect(v.normal.y).toBe(1);
  });

  it('Vertex with optional uv and color', () => {
    const v = {
      position: { x: 0, y: 0, z: 0 },
      normal: { x: 0, y: 0, z: 1 },
      uv: { x: 0.5, y: 0.5 },
      color: { r: 1, g: 0, b: 0, a: 1 } as Color,
    };
    expect(v.uv).toBeDefined();
    expect(v.color).toBeDefined();
    expect(v.uv!.x).toBe(0.5);
    expect(v.color!.r).toBe(1);
  });
});

describe('FlatShading (detailed shader sources)', () => {
  it('vertexShaderSource contains gl_Position', () => {
    const flat = new FlatShading();
    const src = flat.vertexShaderSource();
    expect(src).toContain('gl_Position');
  });

  it('vertexShaderSource contains uModelViewProjection uniform', () => {
    const flat = new FlatShading();
    const src = flat.vertexShaderSource();
    expect(src).toContain('uModelViewProjection');
  });

  it('fragmentShaderSource contains gl_FragColor', () => {
    const flat = new FlatShading();
    const src = flat.fragmentShaderSource();
    expect(src).toContain('gl_FragColor');
  });

  it('fragmentShaderSource contains precision qualifier', () => {
    const flat = new FlatShading();
    const src = flat.fragmentShaderSource();
    expect(src).toContain('precision mediump float');
  });

  it('shade with zero normal returns materialColor unchanged', () => {
    const flat = new FlatShading();
    const params: ShadeParams = {
      normal: { x: 0, y: 0, z: 0 },
      lightDir: { x: 0, y: -1, z: 0 },
      viewDir: { x: 0, y: 0, z: -1 },
      lightColor: { r: 1, g: 1, b: 1, a: 1 },
      materialColor: { r: 0.2, g: 0.4, b: 0.6, a: 0.8 },
      ambientStrength: 0.1,
    };
    const result = flat.shade(params);
    expect(result).toEqual({ r: 0.2, g: 0.4, b: 0.6, a: 0.8 });
  });

  it('shade with various light directions always returns materialColor', () => {
    const flat = new FlatShading();
    const materialColor: Color = { r: 0.5, g: 0.5, b: 0.5, a: 1.0 };
    const directions = [
      { x: 1, y: 0, z: 0 },
      { x: 0, y: 1, z: 0 },
      { x: 0, y: 0, z: 1 },
      { x: -1, y: -1, z: -1 },
    ];
    for (const lightDir of directions) {
      const result = flat.shade({
        normal: { x: 0, y: 1, z: 0 },
        lightDir,
        viewDir: { x: 0, y: 0, z: -1 },
        lightColor: { r: 1, g: 1, b: 1, a: 1 },
        materialColor,
        ambientStrength: 0.3,
      });
      expect(result).toEqual(materialColor);
    }
  });

  it('uniforms returns object with uColor key containing RGBA array', () => {
    const flat = new FlatShading();
    const material = createMaterial({ r: 1, g: 0.5, b: 0.25, a: 0.75 });
    const uniforms = flat.uniforms([], material);
    expect(uniforms).toHaveProperty('uColor');
    const uColor = uniforms.uColor as number[];
    expect(uColor).toHaveLength(4);
    expect(uColor[0]).toBe(1);
    expect(uColor[1]).toBe(0.5);
    expect(uColor[2]).toBe(0.25);
    expect(uColor[3]).toBe(0.75);
  });
});

describe('Camera (additional)', () => {
  it('perspective matrix has correct aspect ratio influence', () => {
    const cam1 = new Camera({ aspect: 2.0, fov: Math.PI / 4 });
    const cam2 = new Camera({ aspect: 1.0, fov: Math.PI / 4 });
    const proj1 = cam1.getProjectionMatrix();
    const proj2 = cam2.getProjectionMatrix();
    // data[0] = f / aspect, so wider aspect => smaller data[0]
    expect(proj1[0]).toBeLessThan(proj2[0]!);
    // data[5] = f, should be the same for same fov
    expect(proj1[5]).toBeCloseTo(proj2[5]!);
  });

  it('orthographic matrix has correct bounds', () => {
    const cam = new Camera({
      projectionMode: 'orthographic',
      left: -5,
      right: 5,
      top: 3,
      bottom: -3,
      near: 0.1,
      far: 100,
    });
    const proj = cam.getProjectionMatrix();
    // data[0] = -2 / (left - right) = -2 / (-10) = 0.2
    expect(proj[0]).toBeCloseTo(0.2);
    // data[5] = -2 / (bottom - top) = -2 / (-6) = 1/3
    expect(proj[5]).toBeCloseTo(1 / 3);
    expect(proj[15]).toBeCloseTo(1);
  });

  it('move accumulates position changes', () => {
    const cam = new Camera({ position: { x: 1, y: 2, z: 3 } });
    cam.move({ x: 10, y: 20, z: 30 });
    expect(cam.position).toEqual({ x: 11, y: 22, z: 33 });
    cam.move({ x: -11, y: -22, z: -33 });
    expect(cam.position).toEqual({ x: 0, y: 0, z: 0 });
  });

  it('rotate with non-identity quaternion changes orientation', () => {
    const cam = new Camera();
    // 90 degree rotation around Y axis: q = (0, sin(45), 0, cos(45))
    const angle = Math.PI / 2;
    const halfAngle = angle / 2;
    cam.rotate({ x: 0, y: Math.sin(halfAngle), z: 0, w: Math.cos(halfAngle) });
    expect(cam.orientation.w).toBeCloseTo(Math.cos(halfAngle));
    expect(cam.orientation.y).toBeCloseTo(Math.sin(halfAngle));
  });

  it('lookAt from various positions produces unit quaternion', () => {
    const positions = [
      { x: 10, y: 0, z: 0 },
      { x: 0, y: 10, z: 10 },
      { x: -5, y: 3, z: 7 },
    ];
    for (const pos of positions) {
      const cam = new Camera({ position: pos });
      cam.lookAt({ x: 0, y: 0, z: 0 });
      const q = cam.orientation;
      const lenSq = q.x * q.x + q.y * q.y + q.z * q.z + q.w * q.w;
      expect(lenSq).toBeCloseTo(1, 4);
    }
  });

  it('lookAt handles camera along positive X axis', () => {
    const cam = new Camera({ position: { x: 10, y: 0, z: 0 } });
    cam.lookAt({ x: 0, y: 0, z: 0 });
    // View matrix should produce valid transform
    const view = cam.getViewMatrix();
    expect(view.length).toBe(16);
    expect(view[15]).toBeCloseTo(1);
  });

  it('getViewMatrix reflects position translation', () => {
    const cam = new Camera({ position: { x: 5, y: 0, z: 0 } });
    const view = cam.getViewMatrix();
    // Translation column should reflect -position
    expect(view[12]).toBeCloseTo(-5);
  });
});

describe('Mesh (additional)', () => {
  it('createBox with zero dimensions produces valid mesh', () => {
    const box = Mesh.createBox(0, 0, 0);
    expect(box.vertexCount).toBe(24);
    expect(box.indexCount).toBe(36);
    // All vertices should be at origin (allow -0)
    for (let i = 0; i < box.vertices.length; i++) {
      expect(box.vertices[i]).toBeCloseTo(0);
    }
  });

  it('createPlane with default segments produces 4 vertices', () => {
    const plane = Mesh.createPlane(10, 10);
    expect(plane.vertexCount).toBe(4);
    expect(plane.indexCount).toBe(6);
  });

  it('vertex and normal array lengths match for box', () => {
    const box = Mesh.createBox(2, 3, 4);
    expect(box.vertices.length).toBe(box.normals.length);
  });

  it('vertex and normal array lengths match for plane', () => {
    const plane = Mesh.createPlane(5, 5, 4, 4);
    expect(plane.vertices.length).toBe(plane.normals.length);
  });

  it('indices are within valid range for box', () => {
    const box = Mesh.createBox(1, 1, 1);
    for (let i = 0; i < box.indices.length; i++) {
      expect(box.indices[i]).toBeLessThan(box.vertexCount);
      expect(box.indices[i]).toBeGreaterThanOrEqual(0);
    }
  });

  it('indices are within valid range for plane', () => {
    const plane = Mesh.createPlane(5, 5, 3, 3);
    for (let i = 0; i < plane.indices.length; i++) {
      expect(plane.indices[i]).toBeLessThan(plane.vertexCount);
      expect(plane.indices[i]).toBeGreaterThanOrEqual(0);
    }
  });

  it('createBox normals are unit length', () => {
    const box = Mesh.createBox(2, 2, 2);
    for (let i = 0; i < box.normals.length; i += 3) {
      const nx = box.normals[i]!;
      const ny = box.normals[i + 1]!;
      const nz = box.normals[i + 2]!;
      const len = Math.sqrt(nx * nx + ny * ny + nz * nz);
      expect(len).toBeCloseTo(1, 5);
    }
  });

  it('createPlane normals are unit length', () => {
    const plane = Mesh.createPlane(5, 5, 2, 2);
    for (let i = 0; i < plane.normals.length; i += 3) {
      const nx = plane.normals[i]!;
      const ny = plane.normals[i + 1]!;
      const nz = plane.normals[i + 2]!;
      const len = Math.sqrt(nx * nx + ny * ny + nz * nz);
      expect(len).toBeCloseTo(1, 5);
    }
  });
});

describe('Mesh.createSphere', () => {
  it('creates a sphere with correct vertex count', () => {
    const sphere = Mesh.createSphere(1, 8, 12);
    expect(sphere.vertexCount).toBe((8 + 1) * (12 + 1));
  });

  it('creates a sphere with correct index count', () => {
    const sphere = Mesh.createSphere(1, 8, 12);
    expect(sphere.indexCount).toBe(8 * 12 * 2 * 3);
  });

  it('vertices are on the sphere surface', () => {
    const r = 2;
    const sphere = Mesh.createSphere(r, 10, 16);
    for (let i = 0; i < sphere.vertices.length; i += 3) {
      const x = sphere.vertices[i]!;
      const y = sphere.vertices[i + 1]!;
      const z = sphere.vertices[i + 2]!;
      const dist = Math.sqrt(x * x + y * y + z * z);
      expect(dist).toBeCloseTo(r, 4);
    }
  });

  it('normals are unit length', () => {
    const sphere = Mesh.createSphere(3, 12, 18);
    for (let i = 0; i < sphere.normals.length; i += 3) {
      const nx = sphere.normals[i]!;
      const ny = sphere.normals[i + 1]!;
      const nz = sphere.normals[i + 2]!;
      const len = Math.sqrt(nx * nx + ny * ny + nz * nz);
      expect(len).toBeCloseTo(1, 4);
    }
  });

  it('indices are within valid range', () => {
    const sphere = Mesh.createSphere(1, 8, 12);
    for (let i = 0; i < sphere.indices.length; i++) {
      expect(sphere.indices[i]).toBeLessThan(sphere.vertexCount);
      expect(sphere.indices[i]).toBeGreaterThanOrEqual(0);
    }
  });

  it('uses default stacks and slices', () => {
    const sphere = Mesh.createSphere(1);
    expect(sphere.vertexCount).toBe((16 + 1) * (24 + 1)); // defaults 16, 24
  });
});

describe('SceneObject (additional)', () => {
  it('addChild to self sets parent to self', () => {
    const obj = new SceneObject('self');
    obj.addChild(obj);
    expect(obj.parent).toBe(obj);
    expect(obj.children).toContain(obj);
  });

  it('removeChild that does not exist is a no-op', () => {
    const parent = new SceneObject('parent');
    const nonChild = new SceneObject('stranger');
    expect(() => parent.removeChild(nonChild)).not.toThrow();
    expect(parent.children.length).toBe(0);
  });

  it('deep hierarchy world matrix (3+ levels)', () => {
    const root = new SceneObject('root');
    root.position = { x: 1, y: 0, z: 0 };
    const mid = new SceneObject('mid');
    mid.position = { x: 2, y: 0, z: 0 };
    const leaf = new SceneObject('leaf');
    leaf.position = { x: 3, y: 0, z: 0 };

    root.addChild(mid);
    mid.addChild(leaf);

    const mat = leaf.getWorldMatrix();
    // Combined translation: 1 + 2 + 3 = 6
    expect(mat[12]).toBeCloseTo(6);
    expect(mat[13]).toBeCloseTo(0);
    expect(mat[14]).toBeCloseTo(0);
  });

  it('visible=false does not affect getWorldMatrix', () => {
    const obj = new SceneObject('hidden');
    obj.visible = false;
    obj.position = { x: 5, y: 10, z: 15 };
    const mat = obj.getWorldMatrix();
    expect(mat[12]).toBeCloseTo(5);
    expect(mat[13]).toBeCloseTo(10);
    expect(mat[14]).toBeCloseTo(15);
  });

  it('getWorldMatrix with scale', () => {
    const obj = new SceneObject('scaled');
    obj.scale = { x: 2, y: 3, z: 4 };
    const mat = obj.getWorldMatrix();
    expect(mat[0]).toBeCloseTo(2);
    expect(mat[5]).toBeCloseTo(3);
    expect(mat[10]).toBeCloseTo(4);
  });

  it('getWorldMatrix with parent scale and child translation', () => {
    const parent = new SceneObject('parent');
    parent.scale = { x: 2, y: 2, z: 2 };
    const child = new SceneObject('child');
    child.position = { x: 5, y: 0, z: 0 };
    parent.addChild(child);

    const mat = child.getWorldMatrix();
    // Child position (5,0,0) is scaled by parent scale (2): world x = 10
    expect(mat[12]).toBeCloseTo(10);
  });
});

describe('SceneGraph (additional)', () => {
  it('unregister non-existent id is a no-op', () => {
    const sg = new SceneGraph();
    expect(() => sg.unregister('does-not-exist')).not.toThrow();
    expect(sg.root.children.length).toBe(0);
  });

  it('register duplicate id replaces parent', () => {
    const sg = new SceneGraph();
    const obj = new SceneObject('dup');
    sg.register(obj);
    // Re-registering moves it (addChild removes from old parent first)
    sg.register(obj);
    expect(sg.root.children.length).toBe(1);
    expect(sg.root.children[0]).toBe(obj);
  });

  it('getVisibleObjects filters invisible objects', () => {
    const sg = new SceneGraph();
    const a = new SceneObject('a');
    const b = new SceneObject('b');
    b.visible = false;
    const c = new SceneObject('c');
    sg.register(a);
    sg.register(b);
    sg.register(c);

    const visible = sg.getVisibleObjects();
    expect(visible.length).toBe(2);
    expect(visible.map(o => o.id)).toContain('a');
    expect(visible.map(o => o.id)).toContain('c');
    expect(visible.map(o => o.id)).not.toContain('b');
  });

  it('traverse visits children in depth-first order', () => {
    const sg = new SceneGraph();
    const a = new SceneObject('a');
    const a1 = new SceneObject('a1');
    const a2 = new SceneObject('a2');
    const b = new SceneObject('b');
    const b1 = new SceneObject('b1');

    a.addChild(a1);
    a.addChild(a2);
    b.addChild(b1);
    sg.register(a);
    sg.register(b);

    const visited: string[] = [];
    sg.traverse((obj) => visited.push(obj.id));
    // Depth-first: a -> a1 -> a2 -> b -> b1
    expect(visited).toEqual(['a', 'a1', 'a2', 'b', 'b1']);
  });

  it('getVisibleObjects does not include root', () => {
    const sg = new SceneGraph();
    const visible = sg.getVisibleObjects();
    expect(visible.length).toBe(0);
    // Root is invisible
    expect(sg.root.visible).toBe(false);
  });

  it('traverse on empty scene visits nothing', () => {
    const sg = new SceneGraph();
    const visited: string[] = [];
    sg.traverse((obj) => visited.push(obj.id));
    expect(visited.length).toBe(0);
  });
});

describe('LambertianShading', () => {
  it('has name "lambertian"', () => {
    const lam = new LambertianShading();
    expect(lam.name).toBe('lambertian');
  });

  it('shade with light facing the surface (NdotL = 1) returns full brightness', () => {
    const lam = new LambertianShading();
    const result = lam.shade({
      normal: { x: 0, y: 1, z: 0 },
      lightDir: { x: 0, y: 1, z: 0 },
      viewDir: { x: 0, y: 0, z: -1 },
      lightColor: { r: 1, g: 1, b: 1, a: 1 },
      materialColor: { r: 0.8, g: 0.6, b: 0.4, a: 1.0 },
      ambientStrength: 0.2,
    });
    // ambient + diffuse = mat * 0.2 + mat * 1 * 1 = mat * 1.2 => clamped to mat (since > 1 clamps)
    expect(result.r).toBeCloseTo(Math.min(1, 0.8 * 0.2 + 0.8 * 1));
    expect(result.g).toBeCloseTo(Math.min(1, 0.6 * 0.2 + 0.6 * 1));
    expect(result.b).toBeCloseTo(Math.min(1, 0.4 * 0.2 + 0.4 * 1));
  });

  it('shade with light behind the surface (NdotL < 0) returns ambient only', () => {
    const lam = new LambertianShading();
    const result = lam.shade({
      normal: { x: 0, y: 1, z: 0 },
      lightDir: { x: 0, y: -1, z: 0 },
      viewDir: { x: 0, y: 0, z: -1 },
      lightColor: { r: 1, g: 1, b: 1, a: 1 },
      materialColor: { r: 0.8, g: 0.6, b: 0.4, a: 1.0 },
      ambientStrength: 0.2,
    });
    // NdotL = -1, clamped to 0, so result = mat * ambient
    expect(result.r).toBeCloseTo(0.8 * 0.2);
    expect(result.g).toBeCloseTo(0.6 * 0.2);
    expect(result.b).toBeCloseTo(0.4 * 0.2);
  });

  it('shade with 45-degree angle returns partial brightness', () => {
    const lam = new LambertianShading();
    // lightDir at 45 degrees to normal: dot(N, L) = cos(45) ~= 0.7071
    const s = Math.SQRT1_2; // ~0.7071
    const result = lam.shade({
      normal: { x: 0, y: 1, z: 0 },
      lightDir: { x: s, y: s, z: 0 },
      viewDir: { x: 0, y: 0, z: -1 },
      lightColor: { r: 1, g: 1, b: 1, a: 1 },
      materialColor: { r: 1.0, g: 1.0, b: 1.0, a: 1.0 },
      ambientStrength: 0.2,
    });
    const expected = Math.min(1, 1.0 * 0.2 + 1.0 * 1.0 * s);
    expect(result.r).toBeCloseTo(expected);
    expect(result.g).toBeCloseTo(expected);
    expect(result.b).toBeCloseTo(expected);
  });

  it('shade with red light on blue material produces dark (no red in blue)', () => {
    const lam = new LambertianShading();
    const result = lam.shade({
      normal: { x: 0, y: 1, z: 0 },
      lightDir: { x: 0, y: 1, z: 0 },
      viewDir: { x: 0, y: 0, z: -1 },
      lightColor: { r: 1, g: 0, b: 0, a: 1 },
      materialColor: { r: 0, g: 0, b: 1, a: 1 },
      ambientStrength: 0.2,
    });
    // Red light * blue material => diffuse r=0*1=0, g=0*0=0, b=1*0=0
    // Ambient: r=0*0.2=0, g=0*0.2=0, b=1*0.2=0.2
    expect(result.r).toBeCloseTo(0);
    expect(result.g).toBeCloseTo(0);
    expect(result.b).toBeCloseTo(0.2);
  });

  it('shade preserves alpha', () => {
    const lam = new LambertianShading();
    const result = lam.shade({
      normal: { x: 0, y: 1, z: 0 },
      lightDir: { x: 0, y: 1, z: 0 },
      viewDir: { x: 0, y: 0, z: -1 },
      lightColor: { r: 1, g: 1, b: 1, a: 1 },
      materialColor: { r: 0.5, g: 0.5, b: 0.5, a: 0.7 },
      ambientStrength: 0.2,
    });
    expect(result.a).toBe(0.7);
  });

  it('vertexShaderSource contains expected GLSL keywords', () => {
    const lam = new LambertianShading();
    const src = lam.vertexShaderSource();
    expect(src).toContain('gl_Position');
    expect(src).toContain('attribute');
    expect(src).toContain('uniform');
    expect(src).toContain('varying');
    expect(src).toContain('aNormal');
  });

  it('fragmentShaderSource contains expected GLSL keywords', () => {
    const lam = new LambertianShading();
    const src = lam.fragmentShaderSource();
    expect(src).toContain('gl_FragColor');
    expect(src).toContain('precision mediump float');
    expect(src).toContain('normalize');
    expect(src).toContain('dot');
    expect(src).toContain('uLightPos');
    expect(src).toContain('uLightColor');
  });

  it('uniforms returns light position and color', () => {
    const lam = new LambertianShading();
    const light = new Light({
      type: 'point',
      position: { x: 5, y: 10, z: 3 },
      color: { r: 1, g: 0.2, b: 0.1, a: 1 },
    });
    const material = createMaterial({ r: 0.5, g: 0.5, b: 0.5, a: 1 });
    const uniforms = lam.uniforms([light], material);
    expect(uniforms.uColor).toEqual([0.5, 0.5, 0.5, 1]);
    expect(uniforms.uLightPos).toEqual([5, 10, 3]);
    expect(uniforms.uLightColor).toEqual([1, 0.2, 0.1]);
    expect(uniforms.uAmbientStrength).toBe(0.2);
  });

  it('uniforms uses defaults when no lights provided', () => {
    const lam = new LambertianShading();
    const material = createMaterial({ r: 1, g: 0, b: 0, a: 1 });
    const uniforms = lam.uniforms([], material);
    expect(uniforms.uLightPos).toEqual([0, 10, 0]);
    expect(uniforms.uLightColor).toEqual([1, 1, 1]);
  });
});

describe('generateTerrain', () => {
  it('produces correct vertex count for given segments', () => {
    const terrain = generateTerrain(10, 10, 5, 4, () => 0);
    // (5+1) * (4+1) = 30 vertices
    expect(terrain.vertexCount).toBe(30);
  });

  it('produces correct index count', () => {
    const terrain = generateTerrain(10, 10, 5, 4, () => 0);
    // 5 * 4 * 2 triangles * 3 indices = 120
    expect(terrain.indexCount).toBe(120);
  });

  it('with colorFn populates mesh.colors', () => {
    const colorFn = () => ({ r: 1, g: 0, b: 0, a: 1 });
    const terrain = generateTerrain(10, 10, 3, 3, () => 0, colorFn);
    expect(terrain.colors).toBeDefined();
    expect(terrain.colors!.length).toBe(terrain.vertexCount * 4);
  });

  it('without colorFn has no colors array', () => {
    const terrain = generateTerrain(10, 10, 3, 3, () => 0);
    expect(terrain.colors).toBeUndefined();
  });
});

describe('sineTerrain', () => {
  it('returns non-zero heights', () => {
    const heightFn = sineTerrain(3, 0.3);
    // Check multiple positions - at least one should be non-zero
    let anyNonZero = false;
    for (let x = -5; x <= 5; x++) {
      for (let z = -5; z <= 5; z++) {
        if (heightFn(x, z) !== 0) {
          anyNonZero = true;
          break;
        }
      }
      if (anyNonZero) break;
    }
    expect(anyNonZero).toBe(true);
  });

  it('height varies across positions', () => {
    const heightFn = sineTerrain(3, 0.3);
    const h1 = heightFn(0, 0);
    const h2 = heightFn(5, 5);
    const h3 = heightFn(-3, 7);
    // At least two of these should differ
    const allSame = (h1 === h2) && (h2 === h3);
    expect(allSame).toBe(false);
  });
});

describe('heightGradientColor', () => {
  it('returns green for low elevations', () => {
    const colorFn = heightGradientColor(0, 10);
    const color = colorFn(0, 0, 1); // t = 0.1, which is < 0.3 => green
    expect(color.g).toBeGreaterThan(color.r);
    expect(color.g).toBeGreaterThan(color.b);
    expect(color.a).toBe(1);
  });

  it('returns white for high elevations', () => {
    const colorFn = heightGradientColor(0, 10);
    const color = colorFn(0, 0, 10); // t = 1.0, which is >= 0.7 => snow/white
    expect(color.r).toBeGreaterThan(0.7);
    expect(color.g).toBeGreaterThan(0.7);
    expect(color.b).toBeGreaterThan(0.7);
    expect(color.a).toBe(1);
  });
});

describe('solidTexture', () => {
  it('returns same color at all UV coordinates', () => {
    const color: Color = { r: 0.3, g: 0.6, b: 0.9, a: 1.0 };
    const tex = solidTexture(color);
    const uvPairs = [[0, 0], [0.5, 0.5], [1, 1], [0.25, 0.75], [0, 1]];
    for (const [u, v] of uvPairs) {
      const sampled = tex.sample(u!, v!);
      expect(sampled.r).toBe(color.r);
      expect(sampled.g).toBe(color.g);
      expect(sampled.b).toBe(color.b);
      expect(sampled.a).toBe(color.a);
    }
  });

  it('has width=1 and height=1', () => {
    const tex = solidTexture({ r: 1, g: 0, b: 0, a: 1 });
    expect(tex.width).toBe(1);
    expect(tex.height).toBe(1);
  });
});

describe('checkerboardTexture', () => {
  it('alternates colors', () => {
    const white: Color = { r: 1, g: 1, b: 1, a: 1 };
    const black: Color = { r: 0, g: 0, b: 0, a: 1 };
    const tex = checkerboardTexture(white, black, 2, 2);

    // (0,0) should be color1 (white)
    const c00 = tex.sample(0, 0);
    expect(c00.r).toBe(1);
    expect(c00.g).toBe(1);
    expect(c00.b).toBe(1);

    // Adjacent tile should be color2 (black)
    const c10 = tex.sample(0.75, 0);
    expect(c10.r).toBe(0);
    expect(c10.g).toBe(0);
    expect(c10.b).toBe(0);
  });

  it('corners: (0,0)=color1, (0.5/tiles, 0)=color2', () => {
    const red: Color = { r: 1, g: 0, b: 0, a: 1 };
    const blue: Color = { r: 0, g: 0, b: 1, a: 1 };
    const tiles = 4;
    const tex = checkerboardTexture(red, blue, tiles, tiles);

    // (0,0) should be color1 (red)
    const corner = tex.sample(0, 0);
    expect(corner.r).toBe(red.r);
    expect(corner.g).toBe(red.g);
    expect(corner.b).toBe(red.b);

    // (0.5/tiles, 0) = (0.125, 0) should be in tile 0 still for U, so color1
    // Actually 0.5/tiles with tiles=4 => u=0.125, floor(0.125*4)=0, so cu=0, cv=0 => color1
    // To get color2 we need the next tile: u that makes floor(u*tiles) odd
    const nextTile = tex.sample(1.0 / tiles + 0.01, 0);
    expect(nextTile.r).toBe(blue.r);
    expect(nextTile.g).toBe(blue.g);
    expect(nextTile.b).toBe(blue.b);
  });

  it('has correct dimensions based on tile count', () => {
    const tex = checkerboardTexture(
      { r: 1, g: 1, b: 1, a: 1 },
      { r: 0, g: 0, b: 0, a: 1 },
      4,
      6,
    );
    expect(tex.width).toBe(4 * 16);
    expect(tex.height).toBe(6 * 16);
  });
});

describe('gradientTexture', () => {
  it('at u=0 returns colorA', () => {
    const colorA: Color = { r: 1, g: 0, b: 0, a: 1 };
    const colorB: Color = { r: 0, g: 0, b: 1, a: 1 };
    const tex = gradientTexture(colorA, colorB);
    const c = tex.sample(0, 0);
    expect(c.r).toBeCloseTo(1);
    expect(c.g).toBeCloseTo(0);
    expect(c.b).toBeCloseTo(0);
    expect(c.a).toBeCloseTo(1);
  });

  it('at u=1 returns colorB', () => {
    const colorA: Color = { r: 1, g: 0, b: 0, a: 1 };
    const colorB: Color = { r: 0, g: 0, b: 1, a: 1 };
    const tex = gradientTexture(colorA, colorB);
    const c = tex.sample(1, 0);
    expect(c.r).toBeCloseTo(0);
    expect(c.g).toBeCloseTo(0);
    expect(c.b).toBeCloseTo(1);
    expect(c.a).toBeCloseTo(1);
  });

  it('at u=0.5 returns midpoint', () => {
    const colorA: Color = { r: 1, g: 0, b: 0, a: 1 };
    const colorB: Color = { r: 0, g: 0, b: 1, a: 0 };
    const tex = gradientTexture(colorA, colorB);
    const c = tex.sample(0.5, 0);
    expect(c.r).toBeCloseTo(0.5);
    expect(c.g).toBeCloseTo(0);
    expect(c.b).toBeCloseTo(0.5);
    expect(c.a).toBeCloseTo(0.5);
  });

  it('has width=256 and height=1', () => {
    const tex = gradientTexture(
      { r: 0, g: 0, b: 0, a: 1 },
      { r: 1, g: 1, b: 1, a: 1 },
    );
    expect(tex.width).toBe(256);
    expect(tex.height).toBe(1);
  });
});

describe('noiseTexture', () => {
  it('returns values between baseColor and noiseColor', () => {
    const base: Color = { r: 0, g: 0, b: 0, a: 1 };
    const noise: Color = { r: 1, g: 1, b: 1, a: 1 };
    const tex = noiseTexture(base, noise, 4);

    for (let i = 0; i < 20; i++) {
      const u = Math.random();
      const v = Math.random();
      const c = tex.sample(u, v);
      expect(c.r).toBeGreaterThanOrEqual(0);
      expect(c.r).toBeLessThanOrEqual(1);
      expect(c.g).toBeGreaterThanOrEqual(0);
      expect(c.g).toBeLessThanOrEqual(1);
      expect(c.b).toBeGreaterThanOrEqual(0);
      expect(c.b).toBeLessThanOrEqual(1);
    }
  });

  it('returns different values at different UVs (not constant)', () => {
    const base: Color = { r: 0, g: 0, b: 0, a: 1 };
    const noise: Color = { r: 1, g: 1, b: 1, a: 1 };
    const tex = noiseTexture(base, noise, 8);

    // Sample many points and check that not all are the same
    const samples: number[] = [];
    for (let i = 0; i < 50; i++) {
      const u = i / 50;
      const v = i / 50;
      samples.push(tex.sample(u, v).r);
    }

    const allSame = samples.every(s => s === samples[0]);
    expect(allSame).toBe(false);
  });

  it('has correct dimensions based on resolution', () => {
    const tex = noiseTexture(
      { r: 0, g: 0, b: 0, a: 1 },
      { r: 1, g: 1, b: 1, a: 1 },
      8,
    );
    expect(tex.width).toBe(8 * 16);
    expect(tex.height).toBe(8 * 16);
  });

  it('alpha is always 1', () => {
    const tex = noiseTexture(
      { r: 0.2, g: 0.3, b: 0.4, a: 0.5 },
      { r: 0.8, g: 0.9, b: 1.0, a: 0.9 },
      4,
    );
    for (let i = 0; i < 10; i++) {
      const c = tex.sample(Math.random(), Math.random());
      expect(c.a).toBe(1);
    }
  });
});

describe('createInputTracker', () => {
  function mockEventTarget(): { addEventListener: Function; removeEventListener: Function; _listeners: Map<string, Function[]> } {
    const listeners = new Map<string, Function[]>();
    return {
      _listeners: listeners,
      addEventListener: (type: string, fn: Function) => {
        if (!listeners.has(type)) listeners.set(type, []);
        listeners.get(type)!.push(fn);
      },
      removeEventListener: (type: string, fn: Function) => {
        const fns = listeners.get(type);
        if (fns) {
          const idx = fns.indexOf(fn);
          if (idx >= 0) fns.splice(idx, 1);
        }
      },
    };
  }

  function mockCanvas(): HTMLCanvasElement {
    const target = mockEventTarget();
    return {
      ...target,
      getBoundingClientRect: () => ({ left: 0, top: 0, right: 800, bottom: 600, width: 800, height: 600, x: 0, y: 0, toJSON: () => ({}) }),
    } as unknown as HTMLCanvasElement;
  }

  it('returns state and cleanup function', () => {
    const canvas = mockCanvas();
    const mockDoc = mockEventTarget();
    const origDoc = (globalThis as Record<string, unknown>).document;
    (globalThis as Record<string, unknown>).document = mockDoc;
    try {
      const tracker = createInputTracker(canvas);
      expect(tracker).toHaveProperty('state');
      expect(tracker).toHaveProperty('cleanup');
      expect(typeof tracker.cleanup).toBe('function');
      tracker.cleanup();
    } finally {
      if (origDoc === undefined) {
        delete (globalThis as Record<string, unknown>).document;
      } else {
        (globalThis as Record<string, unknown>).document = origDoc;
      }
    }
  });

  it('InputState has correct initial values', () => {
    const canvas = mockCanvas();
    const mockDoc = mockEventTarget();
    const origDoc = (globalThis as Record<string, unknown>).document;
    (globalThis as Record<string, unknown>).document = mockDoc;
    try {
      const { state, cleanup } = createInputTracker(canvas);
      expect(state.keysDown).toBeInstanceOf(Set);
      expect(state.keysDown.size).toBe(0);
      expect(state.mouseX).toBe(0);
      expect(state.mouseY).toBe(0);
      expect(state.mouseLeft).toBe(false);
      expect(state.mouseRight).toBe(false);
      expect(state.mouseMiddle).toBe(false);
      expect(state.mouseDeltaX).toBe(0);
      expect(state.mouseDeltaY).toBe(0);
      expect(state.scrollDelta).toBe(0);
      cleanup();
    } finally {
      if (origDoc === undefined) {
        delete (globalThis as Record<string, unknown>).document;
      } else {
        (globalThis as Record<string, unknown>).document = origDoc;
      }
    }
  });
});

describe('resetFrameDeltas', () => {
  it('zeroes mouseDeltaX, mouseDeltaY, and scrollDelta', () => {
    const state: InputState = {
      keysDown: new Set(['w']),
      mouseX: 100,
      mouseY: 200,
      mouseLeft: true,
      mouseRight: false,
      mouseMiddle: false,
      mouseDeltaX: 15,
      mouseDeltaY: -8,
      scrollDelta: 120,
    };
    resetFrameDeltas(state);
    expect(state.mouseDeltaX).toBe(0);
    expect(state.mouseDeltaY).toBe(0);
    expect(state.scrollDelta).toBe(0);
    // Non-delta fields should be unchanged
    expect(state.mouseX).toBe(100);
    expect(state.mouseY).toBe(200);
    expect(state.mouseLeft).toBe(true);
    expect(state.keysDown.has('w')).toBe(true);
  });
});

describe('orbitController', () => {
  it('returns a function', () => {
    const fn = orbitController({ x: 0, y: 0, z: 0 });
    expect(typeof fn).toBe('function');
  });

  it('returned function accepts camera, input, and deltaTime', () => {
    const fn = orbitController({ x: 0, y: 0, z: 0 });
    const cam = new Camera({ position: { x: 0, y: 5, z: 10 } });
    cam.lookAt({ x: 0, y: 0, z: 0 });
    const input: InputState = {
      keysDown: new Set(),
      mouseX: 0, mouseY: 0,
      mouseLeft: false, mouseRight: false, mouseMiddle: false,
      mouseDeltaX: 0, mouseDeltaY: 0,
      scrollDelta: 0,
    };
    expect(() => fn(cam, input, 0.016)).not.toThrow();
  });

  it('accepts custom options', () => {
    const fn = orbitController({ x: 1, y: 2, z: 3 }, {
      orbitSpeed: 0.01,
      zoomSpeed: 0.2,
      minDist: 2,
      maxDist: 500,
    });
    expect(typeof fn).toBe('function');
  });
});

describe('flyController', () => {
  it('returns a function', () => {
    const fn = flyController();
    expect(typeof fn).toBe('function');
  });

  it('returned function accepts camera, input, and deltaTime', () => {
    const fn = flyController();
    const cam = new Camera({ position: { x: 0, y: 0, z: 0 } });
    const input: InputState = {
      keysDown: new Set(),
      mouseX: 0, mouseY: 0,
      mouseLeft: false, mouseRight: false, mouseMiddle: false,
      mouseDeltaX: 0, mouseDeltaY: 0,
      scrollDelta: 0,
    };
    expect(() => fn(cam, input, 0.016)).not.toThrow();
  });

  it('accepts custom options', () => {
    const fn = flyController({ moveSpeed: 20, lookSpeed: 0.005 });
    expect(typeof fn).toBe('function');
  });
});

describe('clampToBounds', () => {
  const bounds: SpaceBounds = {
    min: { x: -10, y: -5, z: -20 },
    max: { x: 10, y: 5, z: 20 },
  };

  it('clamps x/y/z to min/max', () => {
    const result = clampToBounds({ x: 100, y: -50, z: 30 }, bounds);
    expect(result.x).toBe(10);
    expect(result.y).toBe(-5);
    expect(result.z).toBe(20);
  });

  it('passes through positions already inside', () => {
    const pos = { x: 3, y: -2, z: 7 };
    const result = clampToBounds(pos, bounds);
    expect(result.x).toBe(3);
    expect(result.y).toBe(-2);
    expect(result.z).toBe(7);
  });
});

describe('isInBounds', () => {
  const bounds: SpaceBounds = {
    min: { x: -10, y: -10, z: -10 },
    max: { x: 10, y: 10, z: 10 },
  };

  it('returns true for interior point', () => {
    expect(isInBounds({ x: 0, y: 0, z: 0 }, bounds)).toBe(true);
    expect(isInBounds({ x: 5, y: -3, z: 8 }, bounds)).toBe(true);
  });

  it('returns false for exterior point', () => {
    expect(isInBounds({ x: 11, y: 0, z: 0 }, bounds)).toBe(false);
    expect(isInBounds({ x: 0, y: -11, z: 0 }, bounds)).toBe(false);
    expect(isInBounds({ x: 0, y: 0, z: 15 }, bounds)).toBe(false);
  });
});

describe('boundsCenter', () => {
  it('computes correct center', () => {
    const bounds: SpaceBounds = {
      min: { x: -10, y: -6, z: 0 },
      max: { x: 10, y: 4, z: 20 },
    };
    const center = boundsCenter(bounds);
    expect(center.x).toBe(0);
    expect(center.y).toBe(-1);
    expect(center.z).toBe(10);
  });
});

describe('boundsSize', () => {
  it('computes correct dimensions', () => {
    const bounds: SpaceBounds = {
      min: { x: -5, y: 0, z: -3 },
      max: { x: 15, y: 10, z: 7 },
    };
    const size = boundsSize(bounds);
    expect(size.x).toBe(20);
    expect(size.y).toBe(10);
    expect(size.z).toBe(10);
  });
});

describe('renderBounds', () => {
  it('does not crash with null ctx', () => {
    const pipeline = new CpuPipeline();
    const camera = new Camera({ position: { x: 0, y: 5, z: 10 }, near: 0.1, far: 100 });
    camera.lookAt({ x: 0, y: 0, z: 0 });
    const viewport = new Viewport({ x: 0, y: 0, width: 100, height: 100, camera });
    const bounds: SpaceBounds = {
      min: { x: -10, y: -10, z: -10 },
      max: { x: 10, y: 10, z: 10 },
    };
    expect(() => pipeline.renderBounds(camera, viewport, bounds)).not.toThrow();
  });
});

describe('rayIntersectSphere', () => {
  it('ray hits sphere returns distance', () => {
    const ray = { origin: { x: 0, y: 0, z: -10 }, direction: { x: 0, y: 0, z: 1 } };
    const center = { x: 0, y: 0, z: 0 };
    const result = rayIntersectSphere(ray, center, 1);
    expect(result).not.toBeNull();
    expect(result).toBeCloseTo(9); // 10 - 1 = 9
  });

  it('ray misses sphere returns null', () => {
    const ray = { origin: { x: 0, y: 0, z: -10 }, direction: { x: 0, y: 0, z: 1 } };
    const center = { x: 5, y: 5, z: 0 };
    const result = rayIntersectSphere(ray, center, 1);
    expect(result).toBeNull();
  });

  it('ray origin inside sphere returns null (behind)', () => {
    const ray = { origin: { x: 0, y: 0, z: 0 }, direction: { x: 0, y: 0, z: 1 } };
    const center = { x: 0, y: 0, z: 0 };
    const result = rayIntersectSphere(ray, center, 1);
    expect(result).toBeNull();
  });
});

describe('rayIntersectAABB', () => {
  it('ray hits box returns distance', () => {
    const ray = { origin: { x: 0, y: 0, z: -10 }, direction: { x: 0, y: 0, z: 1 } };
    const min = { x: -1, y: -1, z: -1 };
    const max = { x: 1, y: 1, z: 1 };
    const result = rayIntersectAABB(ray, min, max);
    expect(result).not.toBeNull();
    expect(result).toBeCloseTo(9); // 10 - 1 = 9
  });

  it('ray misses box returns null', () => {
    const ray = { origin: { x: 0, y: 0, z: -10 }, direction: { x: 0, y: 0, z: 1 } };
    const min = { x: 5, y: 5, z: 5 };
    const max = { x: 6, y: 6, z: 6 };
    const result = rayIntersectAABB(ray, min, max);
    expect(result).toBeNull();
  });

  it('ray parallel to face misses', () => {
    const ray = { origin: { x: -10, y: 5, z: 0 }, direction: { x: 1, y: 0, z: 0 } };
    const min = { x: -1, y: -1, z: -1 };
    const max = { x: 1, y: 1, z: 1 };
    const result = rayIntersectAABB(ray, min, max);
    expect(result).toBeNull();
  });
});

describe('BoundingSpherePicker', () => {
  it('picks nearest object', () => {
    const picker = new BoundingSpherePicker();
    const obj1 = new SceneObject('near');
    obj1.position = { x: 0, y: 0, z: -5 };
    obj1.mesh = Mesh.createSphere(1);

    const obj2 = new SceneObject('far');
    obj2.position = { x: 0, y: 0, z: -20 };
    obj2.mesh = Mesh.createSphere(1);

    const result = picker.pick(
      { x: 0, y: 0, z: 0 },
      { x: 0, y: 0, z: -1 },
      [obj1, obj2],
    );
    expect(result).toBe(obj1);
  });

  it('returns null for empty array', () => {
    const picker = new BoundingSpherePicker();
    const result = picker.pick(
      { x: 0, y: 0, z: 0 },
      { x: 0, y: 0, z: -1 },
      [],
    );
    expect(result).toBeNull();
  });

  it('skips invisible objects', () => {
    const picker = new BoundingSpherePicker();
    const obj = new SceneObject('hidden');
    obj.visible = false;
    obj.position = { x: 0, y: 0, z: -5 };
    obj.mesh = Mesh.createSphere(1);

    const result = picker.pick(
      { x: 0, y: 0, z: 0 },
      { x: 0, y: 0, z: -1 },
      [obj],
    );
    expect(result).toBeNull();
  });

  it('skips objects without mesh', () => {
    const picker = new BoundingSpherePicker();
    const obj = new SceneObject('noMesh');
    obj.position = { x: 0, y: 0, z: -5 };

    const result = picker.pick(
      { x: 0, y: 0, z: 0 },
      { x: 0, y: 0, z: -1 },
      [obj],
    );
    expect(result).toBeNull();
  });
});

describe('screenToRay', () => {
  it('returns ray with normalized direction', () => {
    const cam = new Camera({ position: { x: 0, y: 0, z: 5 } });
    cam.lookAt({ x: 0, y: 0, z: 0 });
    const vp = new Viewport({ x: 0, y: 0, width: 800, height: 600, camera: cam });

    const ray = screenToRay(400, 300, cam, vp);
    const len = vec3Length(ray.direction);
    expect(len).toBeCloseTo(1, 5);
  });
});

describe('pickAtScreen', () => {
  it('returns picked object', () => {
    const cam = new Camera({ position: { x: 0, y: 0, z: 10 } });
    cam.lookAt({ x: 0, y: 0, z: 0 });
    const vp = new Viewport({ x: 0, y: 0, width: 800, height: 600, camera: cam });

    const obj = new SceneObject('target');
    obj.position = { x: 0, y: 0, z: 0 };
    obj.mesh = Mesh.createSphere(2);

    const picker = new BoundingSpherePicker();
    const result = pickAtScreen(400, 300, cam, vp, [obj], picker);
    expect(result).toBe(obj);
  });
});

describe('AnimationManager', () => {
  it('register adds a binding', () => {
    const mgr = new AnimationManager();
    mgr.register({ objectId: 'obj1', animate: () => {} });
    expect(mgr.getRegisteredIds()).toContain('obj1');
  });

  it('unregister removes a binding', () => {
    const mgr = new AnimationManager();
    mgr.register({ objectId: 'obj1', animate: () => {} });
    mgr.unregister('obj1');
    expect(mgr.getRegisteredIds()).not.toContain('obj1');
  });

  it('pause/resume toggles active', () => {
    const mgr = new AnimationManager();
    mgr.register({ objectId: 'obj1', animate: () => {} });
    expect(mgr.isActive('obj1')).toBe(true);
    mgr.pause('obj1');
    expect(mgr.isActive('obj1')).toBe(false);
    mgr.resume('obj1');
    expect(mgr.isActive('obj1')).toBe(true);
  });

  it('isActive returns correct state', () => {
    const mgr = new AnimationManager();
    expect(mgr.isActive('nonexistent')).toBe(false);
    mgr.register({ objectId: 'obj1', animate: () => {}, active: false });
    expect(mgr.isActive('obj1')).toBe(false);
    mgr.register({ objectId: 'obj2', animate: () => {}, active: true });
    expect(mgr.isActive('obj2')).toBe(true);
  });

  it('getRegisteredIds returns all IDs', () => {
    const mgr = new AnimationManager();
    mgr.register({ objectId: 'a', animate: () => {} });
    mgr.register({ objectId: 'b', animate: () => {} });
    mgr.register({ objectId: 'c', animate: () => {} });
    const ids = mgr.getRegisteredIds();
    expect(ids).toHaveLength(3);
    expect(ids).toContain('a');
    expect(ids).toContain('b');
    expect(ids).toContain('c');
  });

  it('update calls animate on active bindings', () => {
    const mgr = new AnimationManager();
    const obj = new SceneObject('obj1');
    let called = false;
    mgr.register({
      objectId: 'obj1',
      animate: () => { called = true; },
    });
    const scene = new SceneGraph();
    scene.register(obj);
    mgr.update(scene, 1.0, 0.016);
    expect(called).toBe(true);
  });

  it('update skips paused bindings', () => {
    const mgr = new AnimationManager();
    const obj = new SceneObject('obj1');
    let called = false;
    mgr.register({
      objectId: 'obj1',
      animate: () => { called = true; },
    });
    mgr.pause('obj1');
    const scene = new SceneGraph();
    scene.register(obj);
    mgr.update(scene, 1.0, 0.016);
    expect(called).toBe(false);
  });

  it('clear removes all bindings', () => {
    const mgr = new AnimationManager();
    mgr.register({ objectId: 'a', animate: () => {} });
    mgr.register({ objectId: 'b', animate: () => {} });
    mgr.clear();
    expect(mgr.getRegisteredIds()).toHaveLength(0);
  });
});

describe('rotateY', () => {
  it('modifies object rotation', () => {
    const fn = rotateY(Math.PI);
    const obj = new SceneObject('test');
    fn(obj, 1.0, 0.016);
    expect(obj.rotation.y).toBeCloseTo(Math.sin(Math.PI / 2));
    expect(obj.rotation.w).toBeCloseTo(Math.cos(Math.PI / 2));
    expect(obj.rotation.x).toBe(0);
    expect(obj.rotation.z).toBe(0);
  });
});

describe('bob', () => {
  it('modifies object Y position', () => {
    const fn = bob(2, 1, 5);
    const obj = new SceneObject('test');
    obj.position = { x: 3, y: 0, z: 7 };
    fn(obj, Math.PI / 2, 0.016);
    expect(obj.position.y).toBeCloseTo(7);
    expect(obj.position.x).toBe(3);
    expect(obj.position.z).toBe(7);
  });
});

describe('orbit', () => {
  it('modifies object XZ position', () => {
    const fn = orbit(5, 1, 0, 0);
    const obj = new SceneObject('test');
    obj.position = { x: 0, y: 3, z: 0 };
    fn(obj, 0, 0.016);
    expect(obj.position.x).toBeCloseTo(5);
    expect(obj.position.z).toBeCloseTo(0);
    expect(obj.position.y).toBe(3);
  });
});

describe('compose', () => {
  it('applies multiple animations', () => {
    const obj = new SceneObject('test');
    obj.position = { x: 0, y: 0, z: 0 };
    const fn = compose(
      bob(1, 1, 0),
      orbit(3, 1, 0, 0),
    );
    fn(obj, Math.PI / 2, 0.016);
    expect(obj.position.y).toBeCloseTo(1);
    expect(obj.position.x).toBeCloseTo(0, 4);
    expect(obj.position.z).toBeCloseTo(3);
  });
});

describe('applyBoundary', () => {
  const bounds: SpaceBounds = {
    min: { x: -10, y: -10, z: -10 },
    max: { x: 10, y: 10, z: 10 },
  };

  // none mode
  it('none: returns true and position unchanged', () => {
    const obj = new SceneObject('test');
    obj.position = { x: 50, y: 50, z: 50 };
    const result = applyBoundary(obj, bounds, 'none');
    expect(result).toBe(true);
    expect(obj.position).toEqual({ x: 50, y: 50, z: 50 });
  });

  // clamp mode
  it('clamp: clamps to bounds on all axes', () => {
    const obj = new SceneObject('test');
    obj.position = { x: 20, y: -30, z: 15 };
    const result = applyBoundary(obj, bounds, 'clamp');
    expect(result).toBe(true);
    expect(obj.position).toEqual({ x: 10, y: -10, z: 10 });
  });

  it('clamp: position inside bounds unchanged', () => {
    const obj = new SceneObject('test');
    obj.position = { x: 5, y: -3, z: 7 };
    const result = applyBoundary(obj, bounds, 'clamp');
    expect(result).toBe(true);
    expect(obj.position).toEqual({ x: 5, y: -3, z: 7 });
  });

  // wrap mode
  it('wrap: wraps X past max to min', () => {
    const obj = new SceneObject('test');
    obj.position = { x: 13, y: 0, z: 0 };
    applyBoundary(obj, bounds, 'wrap');
    // size.x = 20, x > max(10): x = min(-10) + (13 - 10) % 20 = -10 + 3 = -7
    expect(obj.position.x).toBeCloseTo(-7);
    expect(obj.position.y).toBe(0);
    expect(obj.position.z).toBe(0);
  });

  it('wrap: wraps Y past min to max', () => {
    const obj = new SceneObject('test');
    obj.position = { x: 0, y: -15, z: 0 };
    applyBoundary(obj, bounds, 'wrap');
    // size.y = 20, y < min(-10): y = max(10) - (-10 - (-15)) % 20 = 10 - 5 = 5
    expect(obj.position.y).toBeCloseTo(5);
  });

  it('wrap: wraps Z in both directions', () => {
    const obj = new SceneObject('test');
    obj.position = { x: 0, y: 0, z: 25 };
    applyBoundary(obj, bounds, 'wrap');
    // z > max(10): z = min(-10) + (25 - 10) % 20 = -10 + 15 = 5
    expect(obj.position.z).toBeCloseTo(5);

    obj.position = { x: 0, y: 0, z: -25 };
    applyBoundary(obj, bounds, 'wrap');
    // z < min(-10): z = max(10) - (-10 - (-25)) % 20 = 10 - 15 % 20 = 10 - 15 = -5
    expect(obj.position.z).toBeCloseTo(-5);
  });

  it('wrap: position inside bounds unchanged', () => {
    const obj = new SceneObject('test');
    obj.position = { x: 5, y: -3, z: 8 };
    applyBoundary(obj, bounds, 'wrap');
    expect(obj.position).toEqual({ x: 5, y: -3, z: 8 });
  });

  // bounce mode
  it('bounce: reverses velocity X when hitting max', () => {
    const obj = new SceneObject('test');
    obj.position = { x: 15, y: 0, z: 0 };
    const vel = { x: 5, y: 0, z: 0 };
    applyBoundary(obj, bounds, 'bounce', vel);
    expect(obj.position.x).toBe(10);
    expect(vel.x).toBe(-5);
  });

  it('bounce: reverses velocity Y when hitting min', () => {
    const obj = new SceneObject('test');
    obj.position = { x: 0, y: -15, z: 0 };
    const vel = { x: 0, y: -3, z: 0 };
    applyBoundary(obj, bounds, 'bounce', vel);
    expect(obj.position.y).toBe(-10);
    expect(vel.y).toBe(3);
  });

  it('bounce: position clamped to boundary on bounce', () => {
    const obj = new SceneObject('test');
    obj.position = { x: 20, y: -20, z: 30 };
    const vel = { x: 1, y: -1, z: 1 };
    applyBoundary(obj, bounds, 'bounce', vel);
    expect(obj.position.x).toBe(10);
    expect(obj.position.y).toBe(-10);
    expect(obj.position.z).toBe(10);
  });

  it('bounce: velocity unchanged when inside bounds', () => {
    const obj = new SceneObject('test');
    obj.position = { x: 5, y: 5, z: 5 };
    const vel = { x: 3, y: -2, z: 1 };
    applyBoundary(obj, bounds, 'bounce', vel);
    expect(vel).toEqual({ x: 3, y: -2, z: 1 });
    expect(obj.position).toEqual({ x: 5, y: 5, z: 5 });
  });

  it('bounce: works without velocity parameter (no crash)', () => {
    const obj = new SceneObject('test');
    obj.position = { x: 15, y: 0, z: 0 };
    expect(() => applyBoundary(obj, bounds, 'bounce')).not.toThrow();
    expect(obj.position.x).toBe(10);
  });

  // destroy mode
  it('destroy: returns true for position inside bounds', () => {
    const obj = new SceneObject('test');
    obj.position = { x: 0, y: 0, z: 0 };
    expect(applyBoundary(obj, bounds, 'destroy')).toBe(true);
  });

  it('destroy: returns false for position outside bounds', () => {
    const obj = new SceneObject('test');
    obj.position = { x: 50, y: 0, z: 0 };
    expect(applyBoundary(obj, bounds, 'destroy')).toBe(false);
  });

  it('destroy: returns false when any axis is outside', () => {
    const obj = new SceneObject('test');
    obj.position = { x: 0, y: 0, z: -11 };
    expect(applyBoundary(obj, bounds, 'destroy')).toBe(false);
  });

  it('destroy: position exactly on boundary returns true', () => {
    const obj = new SceneObject('test');
    obj.position = { x: 10, y: -10, z: 10 };
    expect(applyBoundary(obj, bounds, 'destroy')).toBe(true);
  });
});

// ── applyBoundary — extensive ───────────────────────────────────────

describe('applyBoundary — extensive', () => {
  const bounds: SpaceBounds = {
    min: { x: -10, y: -10, z: -10 },
    max: { x: 10, y: 10, z: 10 },
  };

  // === CLAMP MODE ===

  it('clamp: clamps all three axes when all exceed max', () => {
    const obj = new SceneObject('t');
    obj.position = { x: 20, y: 30, z: 40 };
    const result = applyBoundary(obj, bounds, 'clamp');
    expect(result).toBe(true);
    expect(obj.position).toEqual({ x: 10, y: 10, z: 10 });
  });

  it('clamp: clamps all three axes when all below min', () => {
    const obj = new SceneObject('t');
    obj.position = { x: -20, y: -30, z: -40 };
    applyBoundary(obj, bounds, 'clamp');
    expect(obj.position).toEqual({ x: -10, y: -10, z: -10 });
  });

  it('clamp: clamps only the axis that exceeds (others unchanged)', () => {
    const obj = new SceneObject('t');
    obj.position = { x: 5, y: 15, z: -3 };
    applyBoundary(obj, bounds, 'clamp');
    expect(obj.position).toEqual({ x: 5, y: 10, z: -3 });
  });

  it('clamp: position exactly on boundary remains unchanged', () => {
    const obj = new SceneObject('t');
    obj.position = { x: 10, y: -10, z: 10 };
    applyBoundary(obj, bounds, 'clamp');
    expect(obj.position).toEqual({ x: 10, y: -10, z: 10 });
  });

  it('clamp: position at min boundary stays at min', () => {
    const obj = new SceneObject('t');
    obj.position = { x: -10, y: -10, z: -10 };
    applyBoundary(obj, bounds, 'clamp');
    expect(obj.position).toEqual({ x: -10, y: -10, z: -10 });
  });

  it('clamp: position at max boundary stays at max', () => {
    const obj = new SceneObject('t');
    obj.position = { x: 10, y: 10, z: 10 };
    applyBoundary(obj, bounds, 'clamp');
    expect(obj.position).toEqual({ x: 10, y: 10, z: 10 });
  });

  it('clamp: handles negative bounds correctly', () => {
    const negBounds: SpaceBounds = { min: { x: -50, y: -50, z: -50 }, max: { x: -10, y: -10, z: -10 } };
    const obj = new SceneObject('t');
    obj.position = { x: 0, y: -100, z: -30 };
    applyBoundary(obj, negBounds, 'clamp');
    expect(obj.position).toEqual({ x: -10, y: -50, z: -30 });
  });

  it('clamp: returns true', () => {
    const obj = new SceneObject('t');
    obj.position = { x: 999, y: 999, z: 999 };
    expect(applyBoundary(obj, bounds, 'clamp')).toBe(true);
  });

  // === WRAP MODE ===

  it('wrap: wraps X axis past max to min side', () => {
    const obj = new SceneObject('t');
    obj.position = { x: 15, y: 0, z: 0 };
    applyBoundary(obj, bounds, 'wrap');
    // x > 10: x = -10 + (15-10)%20 = -10 + 5 = -5
    expect(obj.position.x).toBeCloseTo(-5);
  });

  it('wrap: wraps X axis past min to max side', () => {
    const obj = new SceneObject('t');
    obj.position = { x: -15, y: 0, z: 0 };
    applyBoundary(obj, bounds, 'wrap');
    // x < -10: x = 10 - (-10-(-15))%20 = 10 - 5 = 5
    expect(obj.position.x).toBeCloseTo(5);
  });

  it('wrap: wraps Y axis', () => {
    const obj = new SceneObject('t');
    obj.position = { x: 0, y: 18, z: 0 };
    applyBoundary(obj, bounds, 'wrap');
    // y > 10: y = -10 + (18-10)%20 = -10 + 8 = -2
    expect(obj.position.y).toBeCloseTo(-2);
  });

  it('wrap: wraps Z axis', () => {
    const obj = new SceneObject('t');
    obj.position = { x: 0, y: 0, z: -14 };
    applyBoundary(obj, bounds, 'wrap');
    // z < -10: z = 10 - (-10-(-14))%20 = 10 - 4 = 6
    expect(obj.position.z).toBeCloseTo(6);
  });

  it('wrap: wraps all three axes at once', () => {
    const obj = new SceneObject('t');
    obj.position = { x: 15, y: -18, z: 25 };
    applyBoundary(obj, bounds, 'wrap');
    expect(obj.position.x).toBeCloseTo(-5);
    // y < -10: y = 10 - (-10-(-18))%20 = 10 - 8 = 2
    expect(obj.position.y).toBeCloseTo(2);
    // z > 10: z = -10 + (25-10)%20 = -10 + 15 = 5
    expect(obj.position.z).toBeCloseTo(5);
  });

  it('wrap: wrapping by exactly one bounds-width lands at min', () => {
    const obj = new SceneObject('t');
    obj.position = { x: 30, y: 0, z: 0 };
    applyBoundary(obj, bounds, 'wrap');
    // x > 10: x = -10 + (30-10)%20 = -10 + 0 = -10
    expect(obj.position.x).toBeCloseTo(-10);
  });

  it('wrap: wrapping by fractional amount lands at correct position', () => {
    const obj = new SceneObject('t');
    obj.position = { x: 12.5, y: 0, z: 0 };
    applyBoundary(obj, bounds, 'wrap');
    // x > 10: x = -10 + (12.5-10)%20 = -10 + 2.5 = -7.5
    expect(obj.position.x).toBeCloseTo(-7.5);
  });

  it('wrap: position inside bounds unchanged', () => {
    const obj = new SceneObject('t');
    obj.position = { x: 3, y: -7, z: 9 };
    applyBoundary(obj, bounds, 'wrap');
    expect(obj.position).toEqual({ x: 3, y: -7, z: 9 });
  });

  it('wrap: wrapping with asymmetric bounds', () => {
    const asymBounds: SpaceBounds = { min: { x: 0, y: 0, z: 0 }, max: { x: 10, y: 20, z: 30 } };
    const obj = new SceneObject('t');
    obj.position = { x: 13, y: -5, z: 35 };
    applyBoundary(obj, asymBounds, 'wrap');
    // x > 10: x = 0 + (13-10)%10 = 3
    expect(obj.position.x).toBeCloseTo(3);
    // y < 0: y = 20 - (0-(-5))%20 = 20 - 5 = 15
    expect(obj.position.y).toBeCloseTo(15);
    // z > 30: z = 0 + (35-30)%30 = 5
    expect(obj.position.z).toBeCloseTo(5);
  });

  it('wrap: returns true', () => {
    const obj = new SceneObject('t');
    obj.position = { x: 999, y: 999, z: 999 };
    expect(applyBoundary(obj, bounds, 'wrap')).toBe(true);
  });

  // === BOUNCE MODE ===

  it('bounce: reverses velocity.x when hitting max X', () => {
    const obj = new SceneObject('t');
    obj.position = { x: 12, y: 0, z: 0 };
    const vel = { x: 4, y: 0, z: 0 };
    applyBoundary(obj, bounds, 'bounce', vel);
    expect(vel.x).toBe(-4);
    expect(obj.position.x).toBe(10);
  });

  it('bounce: reverses velocity.x when hitting min X (uses Math.abs)', () => {
    const obj = new SceneObject('t');
    obj.position = { x: -12, y: 0, z: 0 };
    const vel = { x: -4, y: 0, z: 0 };
    applyBoundary(obj, bounds, 'bounce', vel);
    expect(vel.x).toBe(4);
    expect(obj.position.x).toBe(-10);
  });

  it('bounce: reverses velocity.y when hitting max Y', () => {
    const obj = new SceneObject('t');
    obj.position = { x: 0, y: 15, z: 0 };
    const vel = { x: 0, y: 7, z: 0 };
    applyBoundary(obj, bounds, 'bounce', vel);
    expect(vel.y).toBe(-7);
    expect(obj.position.y).toBe(10);
  });

  it('bounce: reverses velocity.z when hitting min Z', () => {
    const obj = new SceneObject('t');
    obj.position = { x: 0, y: 0, z: -15 };
    const vel = { x: 0, y: 0, z: -6 };
    applyBoundary(obj, bounds, 'bounce', vel);
    expect(vel.z).toBe(6);
    expect(obj.position.z).toBe(-10);
  });

  it('bounce: clamps position to boundary on bounce', () => {
    const obj = new SceneObject('t');
    obj.position = { x: 50, y: -50, z: 50 };
    const vel = { x: 1, y: -1, z: 1 };
    applyBoundary(obj, bounds, 'bounce', vel);
    expect(obj.position).toEqual({ x: 10, y: -10, z: 10 });
  });

  it('bounce: velocity magnitude preserved (only sign flips)', () => {
    const obj = new SceneObject('t');
    obj.position = { x: 15, y: 0, z: 0 };
    const vel = { x: 7.5, y: 3.2, z: -1.1 };
    const origMag = Math.sqrt(vel.x ** 2 + vel.y ** 2 + vel.z ** 2);
    applyBoundary(obj, bounds, 'bounce', vel);
    const newMag = Math.sqrt(vel.x ** 2 + vel.y ** 2 + vel.z ** 2);
    expect(newMag).toBeCloseTo(origMag, 5);
  });

  it('bounce: velocity unchanged when position inside bounds', () => {
    const obj = new SceneObject('t');
    obj.position = { x: 0, y: 0, z: 0 };
    const vel = { x: 5, y: -3, z: 2 };
    applyBoundary(obj, bounds, 'bounce', vel);
    expect(vel).toEqual({ x: 5, y: -3, z: 2 });
  });

  it('bounce: handles zero velocity (no crash)', () => {
    const obj = new SceneObject('t');
    obj.position = { x: 15, y: 0, z: 0 };
    const vel = { x: 0, y: 0, z: 0 };
    expect(() => applyBoundary(obj, bounds, 'bounce', vel)).not.toThrow();
    expect(vel.x).toBe(-0); // -Math.abs(0) === -0
    expect(obj.position.x).toBe(10);
  });

  it('bounce: handles velocity=undefined (no crash)', () => {
    const obj = new SceneObject('t');
    obj.position = { x: 15, y: -15, z: 0 };
    expect(() => applyBoundary(obj, bounds, 'bounce')).not.toThrow();
    expect(obj.position.x).toBe(10);
    expect(obj.position.y).toBe(-10);
  });

  it('bounce: bounces on multiple axes simultaneously', () => {
    const obj = new SceneObject('t');
    obj.position = { x: 15, y: -15, z: 20 };
    const vel = { x: 3, y: -4, z: 5 };
    applyBoundary(obj, bounds, 'bounce', vel);
    expect(vel.x).toBe(-3);
    expect(vel.y).toBe(4);
    expect(vel.z).toBe(-5);
    expect(obj.position).toEqual({ x: 10, y: -10, z: 10 });
  });

  it('bounce: returns true', () => {
    const obj = new SceneObject('t');
    obj.position = { x: 999, y: 999, z: 999 };
    expect(applyBoundary(obj, bounds, 'bounce', { x: 1, y: 1, z: 1 })).toBe(true);
  });

  // === DESTROY MODE ===

  it('destroy: returns true when position inside bounds', () => {
    const obj = new SceneObject('t');
    obj.position = { x: 5, y: -5, z: 3 };
    expect(applyBoundary(obj, bounds, 'destroy')).toBe(true);
  });

  it('destroy: returns false when X exceeds max', () => {
    const obj = new SceneObject('t');
    obj.position = { x: 11, y: 0, z: 0 };
    expect(applyBoundary(obj, bounds, 'destroy')).toBe(false);
  });

  it('destroy: returns false when X below min', () => {
    const obj = new SceneObject('t');
    obj.position = { x: -11, y: 0, z: 0 };
    expect(applyBoundary(obj, bounds, 'destroy')).toBe(false);
  });

  it('destroy: returns false when Y exceeds max', () => {
    const obj = new SceneObject('t');
    obj.position = { x: 0, y: 11, z: 0 };
    expect(applyBoundary(obj, bounds, 'destroy')).toBe(false);
  });

  it('destroy: returns false when Z below min', () => {
    const obj = new SceneObject('t');
    obj.position = { x: 0, y: 0, z: -11 };
    expect(applyBoundary(obj, bounds, 'destroy')).toBe(false);
  });

  it('destroy: returns false when multiple axes outside', () => {
    const obj = new SceneObject('t');
    obj.position = { x: 50, y: -50, z: 50 };
    expect(applyBoundary(obj, bounds, 'destroy')).toBe(false);
  });

  it('destroy: returns true when exactly on boundary', () => {
    const obj = new SceneObject('t');
    obj.position = { x: 10, y: 10, z: 10 };
    expect(applyBoundary(obj, bounds, 'destroy')).toBe(true);
  });

  it('destroy: position is NOT modified (unlike clamp)', () => {
    const obj = new SceneObject('t');
    obj.position = { x: 50, y: -50, z: 30 };
    applyBoundary(obj, bounds, 'destroy');
    // destroy mode uses isInBounds, which does NOT mutate position
    expect(obj.position).toEqual({ x: 50, y: -50, z: 30 });
  });

  // === NONE MODE ===

  it('none: returns true', () => {
    const obj = new SceneObject('t');
    obj.position = { x: 999, y: -999, z: 0 };
    expect(applyBoundary(obj, bounds, 'none')).toBe(true);
  });

  it('none: position unchanged even if outside bounds', () => {
    const obj = new SceneObject('t');
    obj.position = { x: 100, y: -200, z: 300 };
    applyBoundary(obj, bounds, 'none');
    expect(obj.position).toEqual({ x: 100, y: -200, z: 300 });
  });

  it('none: velocity unchanged', () => {
    const obj = new SceneObject('t');
    obj.position = { x: 100, y: 0, z: 0 };
    const vel = { x: 5, y: -3, z: 2 };
    applyBoundary(obj, bounds, 'none', vel);
    expect(vel).toEqual({ x: 5, y: -3, z: 2 });
  });
});

// ── Collision Detection ──────────────────────────────────────────────

describe('collision detection', () => {
  /** Helper: create a SceneObject with a unit box mesh at a given position */
  function makeObj(id: string, pos: { x: number; y: number; z: number }, size = 2): SceneObject {
    const obj = new SceneObject(id);
    obj.position = pos;
    obj.mesh = Mesh.createBox(size, size, size);
    return obj;
  }

  // ── computeBoundingSphereRadius ──────────────────────────────────

  describe('computeBoundingSphereRadius', () => {
    it('returns 0 for object without mesh', () => {
      const obj = new SceneObject('noMesh');
      expect(computeBoundingSphereRadius(obj)).toBe(0);
    });

    it('computes radius from mesh vertices', () => {
      const obj = makeObj('a', { x: 0, y: 0, z: 0 }, 2);
      const r = computeBoundingSphereRadius(obj);
      // Unit box vertices are at +/-1, so max distance from origin = sqrt(1+1+1)
      expect(r).toBeCloseTo(Math.sqrt(3), 5);
    });

    it('accounts for scale', () => {
      const obj = makeObj('a', { x: 0, y: 0, z: 0 }, 2);
      obj.scale = { x: 2, y: 2, z: 2 };
      const r = computeBoundingSphereRadius(obj);
      expect(r).toBeCloseTo(Math.sqrt(3) * 2, 5);
    });
  });

  // ── computeAABB ─────────────────────────────────────────────────

  describe('computeAABB', () => {
    it('returns position for object without mesh', () => {
      const obj = new SceneObject('noMesh');
      obj.position = { x: 5, y: 6, z: 7 };
      const aabb = computeAABB(obj);
      expect(aabb.min).toEqual({ x: 5, y: 6, z: 7 });
      expect(aabb.max).toEqual({ x: 5, y: 6, z: 7 });
    });

    it('computes correct min/max from mesh', () => {
      const obj = makeObj('a', { x: 0, y: 0, z: 0 }, 2);
      const aabb = computeAABB(obj);
      expect(aabb.min.x).toBeCloseTo(-1, 5);
      expect(aabb.min.y).toBeCloseTo(-1, 5);
      expect(aabb.min.z).toBeCloseTo(-1, 5);
      expect(aabb.max.x).toBeCloseTo(1, 5);
      expect(aabb.max.y).toBeCloseTo(1, 5);
      expect(aabb.max.z).toBeCloseTo(1, 5);
    });

    it('accounts for position offset', () => {
      const obj = makeObj('a', { x: 10, y: 20, z: 30 }, 2);
      const aabb = computeAABB(obj);
      expect(aabb.min.x).toBeCloseTo(9, 5);
      expect(aabb.max.x).toBeCloseTo(11, 5);
      expect(aabb.min.y).toBeCloseTo(19, 5);
      expect(aabb.max.y).toBeCloseTo(21, 5);
    });

    it('accounts for scale', () => {
      const obj = makeObj('a', { x: 0, y: 0, z: 0 }, 2);
      obj.scale = { x: 3, y: 1, z: 2 };
      const aabb = computeAABB(obj);
      expect(aabb.min.x).toBeCloseTo(-3, 5);
      expect(aabb.max.x).toBeCloseTo(3, 5);
      expect(aabb.min.y).toBeCloseTo(-1, 5);
      expect(aabb.max.y).toBeCloseTo(1, 5);
      expect(aabb.min.z).toBeCloseTo(-2, 5);
      expect(aabb.max.z).toBeCloseTo(2, 5);
    });
  });

  // ── sphereSphereTest ────────────────────────────────────────────

  describe('sphereSphereTest', () => {
    it('returns null for non-overlapping spheres', () => {
      const a = makeObj('a', { x: 0, y: 0, z: 0 }, 2);
      const b = makeObj('b', { x: 10, y: 0, z: 0 }, 2);
      expect(sphereSphereTest(a, b)).toBeNull();
    });

    it('returns CollisionInfo for overlapping spheres', () => {
      const a = makeObj('a', { x: 0, y: 0, z: 0 }, 2);
      const b = makeObj('b', { x: 1, y: 0, z: 0 }, 2);
      const info = sphereSphereTest(a, b);
      expect(info).not.toBeNull();
      expect(info!.objectA).toBe(a);
      expect(info!.objectB).toBe(b);
    });

    it('overlap distance is correct', () => {
      const a = makeObj('a', { x: 0, y: 0, z: 0 }, 2);
      const b = makeObj('b', { x: 1, y: 0, z: 0 }, 2);
      const info = sphereSphereTest(a, b)!;
      // Both radii = sqrt(3), distance = 1, overlap = 2*sqrt(3) - 1
      expect(info.overlap).toBeCloseTo(2 * Math.sqrt(3) - 1, 5);
    });

    it('normal points from A to B', () => {
      const a = makeObj('a', { x: 0, y: 0, z: 0 }, 2);
      const b = makeObj('b', { x: 2, y: 0, z: 0 }, 2);
      const info = sphereSphereTest(a, b)!;
      expect(info.normal.x).toBeCloseTo(1, 5);
      expect(info.normal.y).toBeCloseTo(0, 5);
      expect(info.normal.z).toBeCloseTo(0, 5);
    });

    it('returns null for distant objects', () => {
      const a = makeObj('a', { x: 0, y: 0, z: 0 }, 2);
      const b = makeObj('b', { x: 100, y: 100, z: 100 }, 2);
      expect(sphereSphereTest(a, b)).toBeNull();
    });

    it('handles coincident positions with fallback normal', () => {
      const a = makeObj('a', { x: 0, y: 0, z: 0 }, 2);
      const b = makeObj('b', { x: 0, y: 0, z: 0 }, 2);
      const info = sphereSphereTest(a, b)!;
      expect(info).not.toBeNull();
      // Fallback normal is (0,1,0)
      expect(info.normal).toEqual({ x: 0, y: 1, z: 0 });
    });
  });

  // ── aabbTest ────────────────────────────────────────────────────

  describe('aabbTest', () => {
    it('returns null for non-overlapping boxes', () => {
      const a = makeObj('a', { x: 0, y: 0, z: 0 }, 2);
      const b = makeObj('b', { x: 10, y: 0, z: 0 }, 2);
      expect(aabbTest(a, b)).toBeNull();
    });

    it('returns CollisionInfo for overlapping boxes', () => {
      const a = makeObj('a', { x: 0, y: 0, z: 0 }, 2);
      const b = makeObj('b', { x: 1, y: 0, z: 0 }, 2);
      const info = aabbTest(a, b);
      expect(info).not.toBeNull();
      expect(info!.objectA).toBe(a);
      expect(info!.objectB).toBe(b);
    });

    it('finds minimum overlap axis', () => {
      // Overlap X=1, Y=2, Z=2 => min axis is X
      const a = makeObj('a', { x: 0, y: 0, z: 0 }, 2);
      const b = makeObj('b', { x: 1, y: 0, z: 0 }, 2);
      const info = aabbTest(a, b)!;
      // X overlap = min(1,2) - max(-1,0) = 1 - 0 = 1
      // Y overlap = min(1,1) - max(-1,-1) = 1 - (-1) = 2
      // Z overlap = min(1,1) - max(-1,-1) = 1 - (-1) = 2
      expect(info.overlap).toBeCloseTo(1, 5);
      expect(info.normal.x).toBe(1);
      expect(info.normal.y).toBe(0);
      expect(info.normal.z).toBe(0);
    });

    it('returns null when separated on one axis', () => {
      const a = makeObj('a', { x: 0, y: 0, z: 0 }, 2);
      const b = makeObj('b', { x: 0, y: 5, z: 0 }, 2);
      expect(aabbTest(a, b)).toBeNull();
    });

    it('handles identical positions', () => {
      const a = makeObj('a', { x: 0, y: 0, z: 0 }, 2);
      const b = makeObj('b', { x: 0, y: 0, z: 0 }, 2);
      const info = aabbTest(a, b)!;
      expect(info).not.toBeNull();
      expect(info.overlap).toBeCloseTo(2, 5);
    });
  });

  // ── CollisionManager ───────────────────────────────────────────

  describe('CollisionManager', () => {
    it('update returns empty array for no collisions', () => {
      const mgr = new CollisionManager();
      const a = makeObj('a', { x: 0, y: 0, z: 0 }, 2);
      const b = makeObj('b', { x: 100, y: 0, z: 0 }, 2);
      const result = mgr.update([a, b]);
      expect(result).toEqual([]);
    });

    it('update detects sphere-sphere collision', () => {
      const mgr = new CollisionManager({ colliderType: 'sphere' });
      const a = makeObj('a', { x: 0, y: 0, z: 0 }, 2);
      const b = makeObj('b', { x: 1, y: 0, z: 0 }, 2);
      const result = mgr.update([a, b]);
      expect(result.length).toBe(1);
      expect(result[0]!.objectA).toBe(a);
      expect(result[0]!.objectB).toBe(b);
    });

    it('update detects aabb collision', () => {
      const mgr = new CollisionManager({ colliderType: 'aabb' });
      const a = makeObj('a', { x: 0, y: 0, z: 0 }, 2);
      const b = makeObj('b', { x: 1, y: 0, z: 0 }, 2);
      const result = mgr.update([a, b]);
      expect(result.length).toBe(1);
    });

    it('update calls response function', () => {
      const hits: CollisionInfo[] = [];
      const mgr = new CollisionManager({
        colliderType: 'sphere',
        response: (info) => hits.push(info),
      });
      const a = makeObj('a', { x: 0, y: 0, z: 0 }, 2);
      const b = makeObj('b', { x: 1, y: 0, z: 0 }, 2);
      mgr.update([a, b]);
      expect(hits.length).toBe(1);
    });

    it('update skips invisible objects', () => {
      const mgr = new CollisionManager();
      const a = makeObj('a', { x: 0, y: 0, z: 0 }, 2);
      const b = makeObj('b', { x: 1, y: 0, z: 0 }, 2);
      b.visible = false;
      const result = mgr.update([a, b]);
      expect(result).toEqual([]);
    });

    it('update skips objects without mesh', () => {
      const mgr = new CollisionManager();
      const a = makeObj('a', { x: 0, y: 0, z: 0 }, 2);
      const b = new SceneObject('b');
      b.position = { x: 0, y: 0, z: 0 };
      const result = mgr.update([a, b]);
      expect(result).toEqual([]);
    });

    it('setResponse updates the callback', () => {
      const mgr = new CollisionManager();
      const hits: CollisionInfo[] = [];
      mgr.setResponse((info) => hits.push(info));
      const a = makeObj('a', { x: 0, y: 0, z: 0 }, 2);
      const b = makeObj('b', { x: 1, y: 0, z: 0 }, 2);
      mgr.update([a, b]);
      expect(hits.length).toBe(1);
    });

    it('setColliderType switches detection method', () => {
      const mgr = new CollisionManager({ colliderType: 'sphere' });
      mgr.setColliderType('aabb');
      const a = makeObj('a', { x: 0, y: 0, z: 0 }, 2);
      const b = makeObj('b', { x: 1, y: 0, z: 0 }, 2);
      const result = mgr.update([a, b]);
      expect(result.length).toBe(1);
      // AABB test should produce overlap of 1 on x-axis
      expect(result[0]!.overlap).toBeCloseTo(1, 5);
    });

    it('getActivePairs returns collision pair keys', () => {
      const mgr = new CollisionManager();
      const a = makeObj('a', { x: 0, y: 0, z: 0 }, 2);
      const b = makeObj('b', { x: 1, y: 0, z: 0 }, 2);
      mgr.update([a, b]);
      const pairs = mgr.getActivePairs();
      expect(pairs).toEqual(['a:b']);
    });

    it('getActivePairs is empty when no collisions', () => {
      const mgr = new CollisionManager();
      const a = makeObj('a', { x: 0, y: 0, z: 0 }, 2);
      const b = makeObj('b', { x: 100, y: 0, z: 0 }, 2);
      mgr.update([a, b]);
      expect(mgr.getActivePairs()).toEqual([]);
    });

    it('clears pairs between updates', () => {
      const mgr = new CollisionManager();
      const a = makeObj('a', { x: 0, y: 0, z: 0 }, 2);
      const b = makeObj('b', { x: 1, y: 0, z: 0 }, 2);
      mgr.update([a, b]);
      expect(mgr.getActivePairs().length).toBe(1);
      // Move b far away
      b.position = { x: 100, y: 0, z: 0 };
      mgr.update([a, b]);
      expect(mgr.getActivePairs().length).toBe(0);
    });
  });
});

// ── collision detection — extensive ─────────────────────────────────

describe('collision detection — extensive', () => {
  /** Helper: create a SceneObject with a box mesh */
  function makeBox(id: string, pos: { x: number; y: number; z: number }, size = 1): SceneObject {
    const obj = new SceneObject(id);
    obj.position = pos;
    obj.mesh = Mesh.createBox(size, size, size);
    return obj;
  }

  /** Helper: create a SceneObject with a sphere mesh */
  function makeSphere(id: string, pos: { x: number; y: number; z: number }, radius = 1): SceneObject {
    const obj = new SceneObject(id);
    obj.position = pos;
    obj.mesh = Mesh.createSphere(radius);
    return obj;
  }

  // === computeBoundingSphereRadius ===

  describe('computeBoundingSphereRadius — extensive', () => {
    it('unit box has radius sqrt(0.75)', () => {
      const obj = makeBox('b', { x: 0, y: 0, z: 0 }, 1);
      const r = computeBoundingSphereRadius(obj);
      // half-extents = 0.5, so max vertex distance = sqrt(0.25+0.25+0.25)
      expect(r).toBeCloseTo(Math.sqrt(0.75), 5);
    });

    it('sphere mesh radius matches creation radius', () => {
      const obj = makeSphere('s', { x: 0, y: 0, z: 0 }, 3);
      const r = computeBoundingSphereRadius(obj);
      expect(r).toBeCloseTo(3, 3);
    });

    it('scale of (2,1,1) uses max scale component', () => {
      const obj = makeBox('b', { x: 0, y: 0, z: 0 }, 1);
      obj.scale = { x: 2, y: 1, z: 1 };
      const r = computeBoundingSphereRadius(obj);
      // max(2,1,1) = 2, radius = sqrt(0.75) * 2
      expect(r).toBeCloseTo(Math.sqrt(0.75) * 2, 5);
    });

    it('empty mesh (0 vertices) returns 0', () => {
      const obj = new SceneObject('empty');
      obj.mesh = new Mesh(new Float32Array(0), new Float32Array(0), new Uint32Array(0));
      expect(computeBoundingSphereRadius(obj)).toBe(0);
    });
  });

  // === computeAABB ===

  describe('computeAABB — extensive', () => {
    it('unit box at origin has min=(-0.5,-0.5,-0.5) max=(0.5,0.5,0.5)', () => {
      const obj = makeBox('b', { x: 0, y: 0, z: 0 }, 1);
      const aabb = computeAABB(obj);
      expect(aabb.min.x).toBeCloseTo(-0.5, 5);
      expect(aabb.min.y).toBeCloseTo(-0.5, 5);
      expect(aabb.min.z).toBeCloseTo(-0.5, 5);
      expect(aabb.max.x).toBeCloseTo(0.5, 5);
      expect(aabb.max.y).toBeCloseTo(0.5, 5);
      expect(aabb.max.z).toBeCloseTo(0.5, 5);
    });

    it('box at position (10,0,0) shifts AABB', () => {
      const obj = makeBox('b', { x: 10, y: 0, z: 0 }, 1);
      const aabb = computeAABB(obj);
      expect(aabb.min.x).toBeCloseTo(9.5, 5);
      expect(aabb.max.x).toBeCloseTo(10.5, 5);
      expect(aabb.min.y).toBeCloseTo(-0.5, 5);
      expect(aabb.max.y).toBeCloseTo(0.5, 5);
    });

    it('scaled box (2x) doubles AABB extents', () => {
      const obj = makeBox('b', { x: 0, y: 0, z: 0 }, 1);
      obj.scale = { x: 2, y: 2, z: 2 };
      const aabb = computeAABB(obj);
      expect(aabb.min.x).toBeCloseTo(-1, 5);
      expect(aabb.max.x).toBeCloseTo(1, 5);
      expect(aabb.min.y).toBeCloseTo(-1, 5);
      expect(aabb.max.y).toBeCloseTo(1, 5);
      expect(aabb.min.z).toBeCloseTo(-1, 5);
      expect(aabb.max.z).toBeCloseTo(1, 5);
    });

    it('sphere AABB is a cube enclosing the sphere', () => {
      const obj = makeSphere('s', { x: 0, y: 0, z: 0 }, 2);
      const aabb = computeAABB(obj);
      expect(aabb.min.x).toBeCloseTo(-2, 1);
      expect(aabb.max.x).toBeCloseTo(2, 1);
      expect(aabb.min.y).toBeCloseTo(-2, 1);
      expect(aabb.max.y).toBeCloseTo(2, 1);
      expect(aabb.min.z).toBeCloseTo(-2, 1);
      expect(aabb.max.z).toBeCloseTo(2, 1);
    });
  });

  // === sphereSphereTest ===

  describe('sphereSphereTest — extensive', () => {
    it('two unit spheres at distance 3 — no collision', () => {
      const a = makeSphere('a', { x: 0, y: 0, z: 0 }, 1);
      const b = makeSphere('b', { x: 3, y: 0, z: 0 }, 1);
      expect(sphereSphereTest(a, b)).toBeNull();
    });

    it('two unit spheres at distance 1 — collision with overlap ~1', () => {
      const a = makeSphere('a', { x: 0, y: 0, z: 0 }, 1);
      const b = makeSphere('b', { x: 1, y: 0, z: 0 }, 1);
      const info = sphereSphereTest(a, b);
      expect(info).not.toBeNull();
      // rA ~ 1, rB ~ 1, dist = 1, overlap = 2 - 1 = 1
      expect(info!.overlap).toBeCloseTo(1, 1);
    });

    it('two spheres just touching (overlap near 0)', () => {
      const a = makeSphere('a', { x: 0, y: 0, z: 0 }, 1);
      const rA = computeBoundingSphereRadius(a);
      const b = makeSphere('b', { x: rA * 2, y: 0, z: 0 }, 1);
      const info = sphereSphereTest(a, b);
      // They should be right at the boundary — null or overlap ~0
      if (info) {
        expect(info.overlap).toBeCloseTo(0, 1);
      }
    });

    it('identical positions — collision, normal defaults to (0,1,0)', () => {
      const a = makeSphere('a', { x: 5, y: 5, z: 5 }, 1);
      const b = makeSphere('b', { x: 5, y: 5, z: 5 }, 1);
      const info = sphereSphereTest(a, b)!;
      expect(info).not.toBeNull();
      expect(info.normal).toEqual({ x: 0, y: 1, z: 0 });
    });

    it('large sphere containing small sphere — collision', () => {
      const a = makeSphere('a', { x: 0, y: 0, z: 0 }, 10);
      const b = makeSphere('b', { x: 1, y: 0, z: 0 }, 0.5);
      const info = sphereSphereTest(a, b);
      expect(info).not.toBeNull();
      expect(info!.overlap).toBeGreaterThan(0);
    });

    it('one object without mesh — no collision (radius 0, positions must overlap)', () => {
      const a = new SceneObject('a');
      a.position = { x: 5, y: 0, z: 0 };
      const b = makeSphere('b', { x: 6, y: 0, z: 0 }, 0.5);
      // rA = 0, rB ~ 0.5, distance = 1, overlap = 0.5 - 1 < 0
      expect(sphereSphereTest(a, b)).toBeNull();
    });

    it('normal is normalized (length near 1)', () => {
      const a = makeSphere('a', { x: 0, y: 0, z: 0 }, 1);
      const b = makeSphere('b', { x: 0.5, y: 0.3, z: 0.1 }, 1);
      const info = sphereSphereTest(a, b)!;
      expect(info).not.toBeNull();
      const len = Math.sqrt(info.normal.x ** 2 + info.normal.y ** 2 + info.normal.z ** 2);
      expect(len).toBeCloseTo(1, 5);
    });

    it('contact point is between the two objects', () => {
      const a = makeSphere('a', { x: 0, y: 0, z: 0 }, 1);
      const b = makeSphere('b', { x: 1, y: 0, z: 0 }, 1);
      const info = sphereSphereTest(a, b)!;
      expect(info).not.toBeNull();
      // Contact point x should be between 0 and 1
      expect(info.contactPoint.x).toBeGreaterThanOrEqual(0);
      expect(info.contactPoint.x).toBeLessThanOrEqual(1);
    });
  });

  // === aabbTest ===

  describe('aabbTest — extensive', () => {
    it('two non-overlapping boxes separated on X — null', () => {
      const a = makeBox('a', { x: 0, y: 0, z: 0 }, 1);
      const b = makeBox('b', { x: 5, y: 0, z: 0 }, 1);
      expect(aabbTest(a, b)).toBeNull();
    });

    it('two non-overlapping boxes separated on Y — null', () => {
      const a = makeBox('a', { x: 0, y: 0, z: 0 }, 1);
      const b = makeBox('b', { x: 0, y: 5, z: 0 }, 1);
      expect(aabbTest(a, b)).toBeNull();
    });

    it('two overlapping boxes — returns info', () => {
      const a = makeBox('a', { x: 0, y: 0, z: 0 }, 2);
      const b = makeBox('b', { x: 1, y: 0, z: 0 }, 2);
      const info = aabbTest(a, b);
      expect(info).not.toBeNull();
      expect(info!.objectA).toBe(a);
      expect(info!.objectB).toBe(b);
    });

    it('overlap axis is the minimum penetration axis', () => {
      // a at origin size 2, b at (0.5, 0, 0) size 2
      // X overlap = min(1, 1.5) - max(-1, -0.5) = 1 - (-0.5) = 1.5
      // Y overlap = min(1, 1) - max(-1, -1) = 2
      // Z overlap = min(1, 1) - max(-1, -1) = 2
      // Min is X at 1.5
      const a = makeBox('a', { x: 0, y: 0, z: 0 }, 2);
      const b = makeBox('b', { x: 0.5, y: 0, z: 0 }, 2);
      const info = aabbTest(a, b)!;
      expect(info.overlap).toBeCloseTo(1.5, 5);
      expect(Math.abs(info.normal.x)).toBe(1);
    });

    it('two boxes touching on one face (overlap near 0)', () => {
      const a = makeBox('a', { x: 0, y: 0, z: 0 }, 2);
      const b = makeBox('b', { x: 2, y: 0, z: 0 }, 2);
      // X: min(1,3) - max(-1,1) = 1 - 1 = 0 => not overlapping
      expect(aabbTest(a, b)).toBeNull();
    });

    it('one box fully inside another — collision', () => {
      const a = makeBox('a', { x: 0, y: 0, z: 0 }, 10);
      const b = makeBox('b', { x: 0, y: 0, z: 0 }, 2);
      const info = aabbTest(a, b)!;
      expect(info).not.toBeNull();
      expect(info.overlap).toBeGreaterThan(0);
    });

    it('two boxes at same position — collision', () => {
      const a = makeBox('a', { x: 3, y: 3, z: 3 }, 2);
      const b = makeBox('b', { x: 3, y: 3, z: 3 }, 2);
      const info = aabbTest(a, b)!;
      expect(info).not.toBeNull();
      expect(info.overlap).toBeCloseTo(2, 5);
    });

    it('boxes separated on Z but overlapping on X,Y — null', () => {
      const a = makeBox('a', { x: 0, y: 0, z: 0 }, 2);
      const b = makeBox('b', { x: 0.5, y: 0.5, z: 10 }, 2);
      expect(aabbTest(a, b)).toBeNull();
    });
  });

  // === CollisionManager ===

  describe('CollisionManager — extensive', () => {
    it('constructor defaults to sphere collider', () => {
      const mgr = new CollisionManager();
      // Verify by checking it works with sphere-based objects
      const a = makeSphere('a', { x: 0, y: 0, z: 0 }, 1);
      const b = makeSphere('b', { x: 0.5, y: 0, z: 0 }, 1);
      const result = mgr.update([a, b]);
      expect(result.length).toBe(1);
    });

    it('constructor accepts aabb collider', () => {
      const mgr = new CollisionManager({ colliderType: 'aabb' });
      const a = makeBox('a', { x: 0, y: 0, z: 0 }, 2);
      const b = makeBox('b', { x: 1, y: 0, z: 0 }, 2);
      const result = mgr.update([a, b]);
      expect(result.length).toBe(1);
    });

    it('update with 0 objects returns empty', () => {
      const mgr = new CollisionManager();
      const result = mgr.update([]);
      expect(result).toEqual([]);
    });

    it('update with 1 object returns empty (need pairs)', () => {
      const mgr = new CollisionManager();
      const a = makeBox('a', { x: 0, y: 0, z: 0 }, 2);
      const result = mgr.update([a]);
      expect(result).toEqual([]);
    });

    it('update with 2 colliding objects returns 1 collision', () => {
      const mgr = new CollisionManager();
      const a = makeBox('a', { x: 0, y: 0, z: 0 }, 2);
      const b = makeBox('b', { x: 0.5, y: 0, z: 0 }, 2);
      const result = mgr.update([a, b]);
      expect(result.length).toBe(1);
    });

    it('update with 3 objects, 2 colliding returns 1 collision', () => {
      const mgr = new CollisionManager();
      const a = makeBox('a', { x: 0, y: 0, z: 0 }, 2);
      const b = makeBox('b', { x: 0.5, y: 0, z: 0 }, 2);
      const c = makeBox('c', { x: 100, y: 0, z: 0 }, 2);
      const result = mgr.update([a, b, c]);
      expect(result.length).toBe(1);
    });

    it('update with 3 objects, all colliding returns 3 collisions (3 pairs)', () => {
      const mgr = new CollisionManager();
      const a = makeBox('a', { x: 0, y: 0, z: 0 }, 2);
      const b = makeBox('b', { x: 0.5, y: 0, z: 0 }, 2);
      const c = makeBox('c', { x: 0.25, y: 0, z: 0 }, 2);
      const result = mgr.update([a, b, c]);
      expect(result.length).toBe(3);
    });

    it('response function called for each collision', () => {
      const calls: CollisionInfo[] = [];
      const mgr = new CollisionManager({
        response: (info) => calls.push(info),
      });
      const a = makeBox('a', { x: 0, y: 0, z: 0 }, 2);
      const b = makeBox('b', { x: 0.5, y: 0, z: 0 }, 2);
      const c = makeBox('c', { x: 0.25, y: 0, z: 0 }, 2);
      mgr.update([a, b, c]);
      expect(calls.length).toBe(3);
    });

    it('response function receives correct CollisionInfo', () => {
      let received: CollisionInfo | null = null;
      const mgr = new CollisionManager({
        response: (info) => { received = info; },
      });
      const a = makeBox('a', { x: 0, y: 0, z: 0 }, 2);
      const b = makeBox('b', { x: 0.5, y: 0, z: 0 }, 2);
      mgr.update([a, b]);
      expect(received).not.toBeNull();
      expect(received!.objectA).toBe(a);
      expect(received!.objectB).toBe(b);
      expect(received!.overlap).toBeGreaterThan(0);
      expect(received!.normal).toBeDefined();
      expect(received!.contactPoint).toBeDefined();
    });

    it('skips invisible objects', () => {
      const mgr = new CollisionManager();
      const a = makeBox('a', { x: 0, y: 0, z: 0 }, 2);
      const b = makeBox('b', { x: 0.5, y: 0, z: 0 }, 2);
      a.visible = false;
      const result = mgr.update([a, b]);
      expect(result).toEqual([]);
    });

    it('skips objects without mesh', () => {
      const mgr = new CollisionManager();
      const a = makeBox('a', { x: 0, y: 0, z: 0 }, 2);
      const b = new SceneObject('b');
      b.position = { x: 0, y: 0, z: 0 };
      const result = mgr.update([a, b]);
      expect(result).toEqual([]);
    });

    it('setColliderType switches from sphere to aabb mid-run', () => {
      const mgr = new CollisionManager({ colliderType: 'sphere' });
      const a = makeBox('a', { x: 0, y: 0, z: 0 }, 2);
      const b = makeBox('b', { x: 1, y: 0, z: 0 }, 2);

      // First update uses sphere
      const r1 = mgr.update([a, b]);
      expect(r1.length).toBe(1);

      // Switch to AABB
      mgr.setColliderType('aabb');
      const r2 = mgr.update([a, b]);
      expect(r2.length).toBe(1);
      // AABB overlap on X = min(1,2) - max(-1,0) = 1
      expect(r2[0]!.overlap).toBeCloseTo(1, 5);
    });

    it('getActivePairs returns correct pair keys after update', () => {
      const mgr = new CollisionManager();
      const a = makeBox('a', { x: 0, y: 0, z: 0 }, 2);
      const b = makeBox('b', { x: 0.5, y: 0, z: 0 }, 2);
      const c = makeBox('c', { x: 100, y: 0, z: 0 }, 2);
      mgr.update([a, b, c]);
      const pairs = mgr.getActivePairs();
      expect(pairs).toEqual(['a:b']);
    });

    it('getActivePairs clears between frames', () => {
      const mgr = new CollisionManager();
      const a = makeBox('a', { x: 0, y: 0, z: 0 }, 2);
      const b = makeBox('b', { x: 0.5, y: 0, z: 0 }, 2);

      mgr.update([a, b]);
      expect(mgr.getActivePairs().length).toBe(1);

      // Second update with no collision
      b.position = { x: 100, y: 0, z: 0 };
      mgr.update([a, b]);
      expect(mgr.getActivePairs().length).toBe(0);
    });

    it('update with non-colliding objects returns empty', () => {
      const mgr = new CollisionManager();
      const a = makeBox('a', { x: 0, y: 0, z: 0 }, 1);
      const b = makeBox('b', { x: 10, y: 0, z: 0 }, 1);
      const c = makeBox('c', { x: 20, y: 0, z: 0 }, 1);
      const result = mgr.update([a, b, c]);
      expect(result).toEqual([]);
    });
  });
});
