import { createElement } from 'specifyjs';
import { Space3D } from '../../../components/viz/3dSpace/src/Space3D';
import { SceneObject } from '../../../components/viz/3dSpace/src/scene-object';
import { Mesh } from '../../../components/viz/3dSpace/src/mesh';
import { createMaterial } from '../../../components/viz/3dSpace/src/material';
import { Camera } from '../../../components/viz/3dSpace/src/camera';

// Create a single red box at origin
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
  return createElement(Space3D, {
    width: 400,
    height: 300,
    objects: [box],
    cameras: [cam],
  });
}
