// @vitest-environment node
// (c) 2025-2026 Asymmetric Effort, LLC. MIT LICENSE
// SPDX-License-Identifier: MIT

import { describe, it, expect } from 'vitest';
import { Mesh } from '../src/mesh';
import { SceneObject } from '../src/scene-object';
import { Camera } from '../src/camera';
import { SceneGraph } from '../src/scene-graph';
import { FlatShading } from '../src/lighting-model';
import { DefaultObjectPicker } from '../src/types';
import { Light } from '../src/light';
import { Viewport } from '../src/viewport';
import { createMaterial } from '../src/material';
import type { Color, ShadeParams } from '../src/types';

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
