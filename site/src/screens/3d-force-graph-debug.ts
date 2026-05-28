// Minimal test: exact same pattern as the working 3dSpace demo
import { createElement } from 'specifyjs';
import { useEffect, useRef } from 'specifyjs/hooks';
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

const W = 400;
const H = 300;

export function ForceGraph3DDebug() {
  const initializedRef = useRef(false);
  const cleanupRef = useRef<(() => void) | null>(null);

  const containerCallback = (node: HTMLDivElement | null) => {
    if (!node || initializedRef.current) return;
    initializedRef.current = true;

    const canvas = document.createElement('canvas');
    canvas.width = W;
    canvas.height = H;
    canvas.style.display = 'block';
    canvas.style.backgroundColor = '#0f172a';
    canvas.style.width = '100%';
    canvas.style.maxWidth = `${W}px`;
    node.appendChild(canvas);

    const scene = new SceneGraph();
    const mesh = Mesh.createBox(1, 1, 1);

    const box = new SceneObject('red-box');
    box.position = { x: 0, y: 0, z: 0 };
    box.mesh = mesh;
    box.material = createMaterial({ r: 1, g: 0, b: 0, a: 1 });
    scene.register(box);

    const cam = new Camera({
      position: { x: 0, y: 3, z: 8 },
      fov: Math.PI / 4,
      aspect: W / H,
      near: 0.1,
      far: 100,
    });
    cam.lookAt({ x: 0, y: 0, z: 0 });

    const vp = new Viewport({ x: 0, y: 0, width: W, height: H, camera: cam });
    const pipeline = new CpuPipeline();
    pipeline.initialize(canvas);
    const lighting = new FlatShading();

    let lastTime = performance.now();
    let raf = 0;

    const frame = (timestamp: number) => {
      const _dt = (timestamp - lastTime) / 1000;
      lastTime = timestamp;
      pipeline.render(scene, cam, vp, lighting);
      raf = requestAnimationFrame(frame);
    };
    raf = requestAnimationFrame(frame);

    cleanupRef.current = () => {
      cancelAnimationFrame(raf);
      pipeline.dispose();
    };
  };

  useEffect(() => {
    return () => {
      if (cleanupRef.current) cleanupRef.current();
    };
  }, []);

  return createElement('div', {
    style: { display: 'flex', height: '100%', padding: '16px', boxSizing: 'border-box' },
  },
    createElement('div', { style: { flex: '1', minHeight: '300px' } },
      createElement('h2', {
        style: { fontSize: '18px', fontWeight: '600', marginBottom: '8px', color: 'var(--color-text, #0f172a)' },
      }, '3D Force Graph Debug'),
      createElement('div', {
        ref: containerCallback,
        style: { width: '100%', maxWidth: `${W}px`, height: `${H}px`, backgroundColor: '#0f172a' },
      }),
    ),
  );
}
