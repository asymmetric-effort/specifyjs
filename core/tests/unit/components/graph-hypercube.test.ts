import { describe, it, expect } from 'vitest';
import {
  generateVertices,
  generateEdges,
  generateHypercube,
  buildRotationMatrix,
  transformVec,
  projectTo2D,
  numRotationAngles,
  generatePalette,
} from '../../../../components/viz/graph/src/hypercube';

describe('generateVertices', () => {
  it('generates 4 vertices for dimension 2 (square)', () => {
    const verts = generateVertices(2);
    expect(verts).toHaveLength(4);
    // Each vertex has 2 coordinates, each ±1
    for (const v of verts) {
      expect(v.coords).toHaveLength(2);
      for (const c of v.coords) {
        expect(Math.abs(c)).toBe(1);
      }
    }
  });

  it('generates 8 vertices for dimension 3 (cube)', () => {
    const verts = generateVertices(3);
    expect(verts).toHaveLength(8);
  });

  it('generates 16 vertices for dimension 4 (tesseract)', () => {
    const verts = generateVertices(4);
    expect(verts).toHaveLength(16);
  });

  it('generates 2 vertices for dimension 1 (line segment)', () => {
    const verts = generateVertices(1);
    expect(verts).toHaveLength(2);
    expect(verts[0]!.coords).toEqual([-1]);
    expect(verts[1]!.coords).toEqual([1]);
  });

  it('generates 64 vertices for dimension 6', () => {
    expect(generateVertices(6)).toHaveLength(64);
  });

  it('all vertices are unique', () => {
    const verts = generateVertices(4);
    const strs = verts.map((v) => v.coords.join(','));
    expect(new Set(strs).size).toBe(16);
  });
});

describe('generateEdges', () => {
  it('generates 4 edges for dimension 2 (square)', () => {
    const edges = generateEdges(2);
    expect(edges).toHaveLength(4);
  });

  it('generates 12 edges for dimension 3 (cube)', () => {
    const edges = generateEdges(3);
    expect(edges).toHaveLength(12);
  });

  it('generates 32 edges for dimension 4 (tesseract)', () => {
    const edges = generateEdges(4);
    expect(edges).toHaveLength(32);
  });

  it('generates n * 2^(n-1) edges', () => {
    for (let n = 1; n <= 6; n++) {
      const edges = generateEdges(n);
      const expected = n * Math.pow(2, n - 1);
      expect(edges).toHaveLength(expected);
    }
  });

  it('no duplicate edges', () => {
    const edges = generateEdges(4);
    const keys = edges.map((e) => `${e.source}-${e.target}`);
    expect(new Set(keys).size).toBe(keys.length);
  });

  it('source < target for all edges', () => {
    const edges = generateEdges(4);
    for (const e of edges) {
      expect(e.source).toBeLessThan(e.target);
    }
  });

  it('connected vertices differ by exactly one bit', () => {
    const edges = generateEdges(3);
    for (const e of edges) {
      const xor = e.source ^ e.target;
      // Exactly one bit set = power of 2
      expect(xor & (xor - 1)).toBe(0);
      expect(xor).toBeGreaterThan(0);
    }
  });
});

describe('numRotationAngles', () => {
  it('returns C(n,2) for each dimension', () => {
    expect(numRotationAngles(2)).toBe(1);
    expect(numRotationAngles(3)).toBe(3);
    expect(numRotationAngles(4)).toBe(6);
    expect(numRotationAngles(5)).toBe(10);
    expect(numRotationAngles(6)).toBe(15);
  });
});

describe('buildRotationMatrix', () => {
  it('returns identity for zero angles', () => {
    const mat = buildRotationMatrix(3, [0, 0, 0]);
    expect(mat).toHaveLength(3);
    for (let i = 0; i < 3; i++) {
      for (let j = 0; j < 3; j++) {
        expect(mat[i]![j]).toBeCloseTo(i === j ? 1 : 0, 10);
      }
    }
  });

  it('returns correct 2D rotation', () => {
    const theta = Math.PI / 4; // 45 degrees
    const mat = buildRotationMatrix(2, [theta]);
    const c = Math.cos(theta);
    const s = Math.sin(theta);
    expect(mat[0]![0]).toBeCloseTo(c);
    expect(mat[0]![1]).toBeCloseTo(-s);
    expect(mat[1]![0]).toBeCloseTo(s);
    expect(mat[1]![1]).toBeCloseTo(c);
  });

  it('handles missing angles (defaults to 0)', () => {
    const mat = buildRotationMatrix(3, []); // no rotations
    // Should be identity
    for (let i = 0; i < 3; i++) {
      expect(mat[i]![i]).toBeCloseTo(1);
    }
  });
});

describe('transformVec', () => {
  it('identity transform preserves vector', () => {
    const mat = buildRotationMatrix(3, [0, 0, 0]);
    const v = { coords: [1, 2, 3] };
    const result = transformVec(mat, v);
    expect(result[0]).toBeCloseTo(1);
    expect(result[1]).toBeCloseTo(2);
    expect(result[2]).toBeCloseTo(3);
  });

  it('90-degree 2D rotation swaps axes', () => {
    const mat = buildRotationMatrix(2, [Math.PI / 2]);
    const v = { coords: [1, 0] };
    const result = transformVec(mat, v);
    expect(result[0]).toBeCloseTo(0);
    expect(result[1]).toBeCloseTo(1);
  });
});

describe('projectTo2D', () => {
  it('returns first two coords with no perspective', () => {
    const result = projectTo2D([3, 7, 1, 2], 0);
    expect(result.x).toBe(3);
    expect(result.y).toBe(7);
  });

  it('computes depth as average of remaining coords', () => {
    const result = projectTo2D([0, 0, 4, 6], 0);
    expect(result.depth).toBe(5);
  });

  it('perspective scales by depth', () => {
    const near = projectTo2D([1, 0, -1], 0.5);
    const far = projectTo2D([1, 0, 1], 0.5);
    expect(Math.abs(near.x)).toBeGreaterThan(Math.abs(far.x));
  });

  it('handles 2D input (no depth dimensions)', () => {
    const result = projectTo2D([5, 10], 0);
    expect(result.x).toBe(5);
    expect(result.y).toBe(10);
    expect(result.depth).toBe(0);
  });
});

describe('generateHypercube', () => {
  it('returns correct vertex and edge counts for dim 3', () => {
    const data = generateHypercube(3);
    expect(data.vertices).toHaveLength(8);
    expect(data.edges).toHaveLength(12);
    expect(data.dimension).toBe(3);
  });

  it('returns correct counts for dim 4', () => {
    const data = generateHypercube(4);
    expect(data.vertices).toHaveLength(16);
    expect(data.edges).toHaveLength(32);
  });

  it('vertices have x, y, depth fields', () => {
    const data = generateHypercube(3);
    for (const v of data.vertices) {
      expect(typeof v.x).toBe('number');
      expect(typeof v.y).toBe('number');
      expect(typeof v.depth).toBe('number');
      expect(v.id).toBeGreaterThanOrEqual(0);
    }
  });

  it('applies scale factor', () => {
    const small = generateHypercube(3, [], 0, 1);
    const big = generateHypercube(3, [], 0, 100);
    // Vertices in `big` should be ~100x further from origin
    const smallMax = Math.max(...small.vertices.map((v) => Math.abs(v.x)));
    const bigMax = Math.max(...big.vertices.map((v) => Math.abs(v.x)));
    expect(bigMax / smallMax).toBeCloseTo(100, 0);
  });

  it('different angles produce different projections', () => {
    const a = generateHypercube(3, [0, 0, 0], 0, 100);
    const b = generateHypercube(3, [1, 0.5, 0.3], 0, 100);
    // At least one vertex should have moved
    const moved = a.vertices.some(
      (v, i) => Math.abs(v.x - b.vertices[i]!.x) > 0.01 || Math.abs(v.y - b.vertices[i]!.y) > 0.01,
    );
    expect(moved).toBe(true);
  });
});

describe('generatePalette', () => {
  it('generates correct number of colors', () => {
    expect(generatePalette(5)).toHaveLength(5);
    expect(generatePalette(16)).toHaveLength(16);
  });

  it('generates valid HSL strings', () => {
    const colors = generatePalette(4);
    for (const c of colors) {
      expect(c).toMatch(/^hsl\(\d+, \d+%, \d+%\)$/);
    }
  });

  it('generates distinct hues', () => {
    const colors = generatePalette(4);
    const hues = colors.map((c) => parseInt(c.match(/\d+/)![0]));
    expect(new Set(hues).size).toBe(4);
  });
});
