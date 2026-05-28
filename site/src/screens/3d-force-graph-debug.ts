// Test Space3D component directly — no ForceGraph3D wrapper
import { createElement } from 'specifyjs';
import { useRef, useEffect } from 'specifyjs/hooks';
import { Space3D } from '../../../components/viz/3dSpace/src/Space3D';
import { SceneObject } from '../../../components/viz/3dSpace/src/scene-object';
import { Mesh } from '../../../components/viz/3dSpace/src/mesh';
import { createMaterial } from '../../../components/viz/3dSpace/src/material';
import { Camera } from '../../../components/viz/3dSpace/src/camera';

// Static objects created at module level
const box = new SceneObject('test-box');
box.mesh = Mesh.createBox(2, 2, 2);
box.material = createMaterial({ r: 1, g: 0, b: 0, a: 1 });
box.position = { x: 0, y: 0, z: 0 };

const cam = new Camera({
  position: { x: 0, y: 3, z: 8 },
  fov: Math.PI / 4,
  aspect: 400 / 300,
  near: 0.1,
  far: 100,
});
cam.lookAt({ x: 0, y: 0, z: 0 });

export function ForceGraph3DDebug() {
  // Test 1: Space3D component with static objects
  return createElement('div', {
    style: { padding: '16px' },
  },
    createElement('h2', {
      style: { fontSize: '18px', fontWeight: '600', marginBottom: '8px', color: 'var(--color-text, #0f172a)' },
    }, 'Space3D Component Test'),
    createElement('p', {
      style: { fontSize: '13px', color: 'var(--color-text-muted, #64748b)', marginBottom: '8px' },
    }, 'If you see a red box below, Space3D component works. If blank, Space3D is broken.'),
    createElement(Space3D, {
      width: 400,
      height: 300,
      objects: [box],
      cameras: [cam],
    }),
  );
}
