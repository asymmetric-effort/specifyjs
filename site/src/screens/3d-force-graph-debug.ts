import { createElement } from 'specifyjs';
import { ForceGraph3D } from '../../../components/viz/3d-force-graph/src/index';

const NODES = [
  { id: 'A', label: 'A', size: 2, color: { r: 1, g: 0, b: 0, a: 1 } },
  { id: 'B', label: 'B', size: 2, color: { r: 0, g: 0, b: 1, a: 1 } },
];

const EDGES = [
  { source: 'A', target: 'B' },
];

export function ForceGraph3DDebug() {
  return createElement(ForceGraph3D, {
    width: 400,
    height: 300,
    nodes: NODES,
    edges: EDGES,
  });
}
