import { createElement } from 'specifyjs';
import { ForceGraph3D } from '../../../components/viz/3d-force-graph/src/index';

// Generate N nodes and edges to find the threshold
const N = 35;
const NODES: any[] = [];
for (let i = 0; i < N; i++) {
  NODES.push({
    id: `n${i}`,
    label: `Node ${i}`,
    size: 1,
    color: { r: Math.random(), g: Math.random(), b: Math.random(), a: 1 },
  });
}

const EDGES: any[] = [];
for (let i = 0; i < N - 1; i++) {
  EDGES.push({ source: `n${i}`, target: `n${i + 1}` });
}
// Add some cross-links
for (let i = 0; i < Math.min(N * 2, 80); i++) {
  const a = Math.floor(Math.random() * N);
  const b = Math.floor(Math.random() * N);
  if (a !== b) EDGES.push({ source: `n${a}`, target: `n${b}` });
}

export function ForceGraph3DDebug() {
  return createElement(ForceGraph3D, {
    width: 400,
    height: 300,
    nodes: NODES,
    edges: EDGES,
  });
}
