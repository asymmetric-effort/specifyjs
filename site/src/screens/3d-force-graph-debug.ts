import { createElement } from 'specifyjs';
import { useRef, useEffect } from 'specifyjs/hooks';
import { SceneObject } from '../../../components/viz/3dSpace/src/scene-object';
import { SceneGraph } from '../../../components/viz/3dSpace/src/scene-graph';
import { Mesh } from '../../../components/viz/3dSpace/src/mesh';
import { createMaterial } from '../../../components/viz/3dSpace/src/material';
import { Camera } from '../../../components/viz/3dSpace/src/camera';
import { Viewport } from '../../../components/viz/3dSpace/src/viewport';
import { CpuPipeline } from '../../../components/viz/3dSpace/src/cpu-pipeline';
import { FlatShading } from '../../../components/viz/3dSpace/src/lighting-model';

export function ForceGraph3DDebug() {
  const initRef = useRef(false);
  const rafRef = useRef(0);

  const containerRef = (node: HTMLDivElement | null) => {
    if (!node || initRef.current) return;
    initRef.current = true;

    const canvas = document.createElement('canvas');
    canvas.width = 400;
    canvas.height = 300;
    canvas.style.display = 'block';
    canvas.style.backgroundColor = '#0a0f1f';
    node.appendChild(canvas);

    const scene = new SceneGraph();

    // Red box at origin
    const box = new SceneObject('box');
    box.mesh = Mesh.createBox(2, 2, 2);
    box.material = createMaterial({ r: 1, g: 0, b: 0, a: 1 });
    box.position = { x: 0, y: 0, z: 0 };
    scene.register(box);

    // Green sphere offset
    const sphere = new SceneObject('sphere');
    sphere.mesh = Mesh.createSphere(1, 16, 16);
    sphere.material = createMaterial({ r: 0, g: 1, b: 0, a: 1 });
    sphere.position = { x: 3, y: 0, z: 0 };
    scene.register(sphere);

    const cam = new Camera({
      position: { x: 0, y: 5, z: 10 },
      fov: Math.PI / 4,
      aspect: 400 / 300,
      near: 0.1,
      far: 100,
    });
    cam.lookAt({ x: 0, y: 0, z: 0 });

    const vp = new Viewport({ x: 0, y: 0, width: 400, height: 300, camera: cam });
    const pipeline = new CpuPipeline();
    pipeline.initialize(canvas);
    const lighting = new FlatShading();

    let lastTime = performance.now();
    const frame = (timestamp: number) => {
      const dt = (timestamp - lastTime) / 1000;
      lastTime = timestamp;

      // Rotate box slowly
      const q = box.rotation;
      const angle = dt * 0.5;
      const sinA = Math.sin(angle / 2);
      const cosA = Math.cos(angle / 2);
      box.rotation = {
        x: q.x * cosA + q.w * sinA * 0,
        y: q.y * cosA + q.w * sinA * 1 * sinA,
        z: q.z * cosA,
        w: q.w * cosA - (q.x * 0 + q.y * sinA + q.z * 0) * sinA,
      };

      pipeline.render(scene, cam, vp, lighting);
      rafRef.current = requestAnimationFrame(frame);
    };
    rafRef.current = requestAnimationFrame(frame);
  };

  return createElement('div', { ref: containerRef });
}
