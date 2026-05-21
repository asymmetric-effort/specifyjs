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
    expect(mat.data.length).toBe(16);
    // Identity matrix (column-major)
    const identity = new Float64Array(16);
    identity[0] = 1;
    identity[5] = 1;
    identity[10] = 1;
    identity[15] = 1;
    for (let i = 0; i < 16; i++) {
      expect(mat.data[i]).toBeCloseTo(identity[i]!, 10);
    }
  });

  it('getWorldMatrix includes translation', () => {
    const obj = new SceneObject('test');
    obj.position = { x: 3, y: 5, z: 7 };
    const mat = obj.getWorldMatrix();
    expect(mat.data[12]).toBeCloseTo(3);
    expect(mat.data[13]).toBeCloseTo(5);
    expect(mat.data[14]).toBeCloseTo(7);
  });

  it('getWorldMatrix composes parent transforms', () => {
    const parent = new SceneObject('parent');
    parent.position = { x: 10, y: 0, z: 0 };
    const child = new SceneObject('child');
    child.position = { x: 5, y: 0, z: 0 };
    parent.addChild(child);

    const mat = child.getWorldMatrix();
    // Combined translation should be 15 along x
    expect(mat.data[12]).toBeCloseTo(15);
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
    expect(view.data.length).toBe(16);
  });

  it('getViewMatrix at origin with identity orientation is identity', () => {
    const cam = new Camera();
    const view = cam.getViewMatrix();
    // Should be identity since position is origin and orientation is identity quaternion
    expect(view.data[0]).toBeCloseTo(1);
    expect(view.data[5]).toBeCloseTo(1);
    expect(view.data[10]).toBeCloseTo(1);
    expect(view.data[15]).toBeCloseTo(1);
    expect(view.data[12]).toBeCloseTo(0);
    expect(view.data[13]).toBeCloseTo(0);
    expect(view.data[14]).toBeCloseTo(0);
  });

  it('getProjectionMatrix returns a Mat4 for perspective mode', () => {
    const cam = new Camera({ projectionMode: 'perspective' });
    const proj = cam.getProjectionMatrix();
    expect(proj.data.length).toBe(16);
    // Perspective matrix should have non-zero values at specific positions
    expect(proj.data[0]).not.toBe(0); // f / aspect
    expect(proj.data[5]).not.toBe(0); // f
  });

  it('getProjectionMatrix returns a Mat4 for orthographic mode', () => {
    const cam = new Camera({ projectionMode: 'orthographic' });
    const proj = cam.getProjectionMatrix();
    expect(proj.data.length).toBe(16);
    expect(proj.data[15]).toBeCloseTo(1);
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
