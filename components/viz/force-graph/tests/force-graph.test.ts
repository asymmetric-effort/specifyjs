// (c) 2025-2026 Asymmetric Effort, LLC. MIT LICENSE
// SPDX-License-Identifier: MIT

import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { ForceGraph } from '../src/index';
import { installMockDispatcher, teardownMockDispatcher } from '../../../_test-helpers/mock-dispatcher';

beforeEach(() => installMockDispatcher());
afterEach(() => teardownMockDispatcher());

const sampleNodes = [
  { id: 'a', label: 'Node A' },
  { id: 'b', label: 'Node B' },
  { id: 'c', label: 'Node C' },
];

const sampleEdges = [
  { source: 'a', target: 'b' },
  { source: 'b', target: 'c' },
];

// ---------------------------------------------------------------------------
// Happy-path tests
// ---------------------------------------------------------------------------

describe('ForceGraph — happy path', () => {
  it('renders with nodes and edges', () => {
    const el = ForceGraph({ nodes: sampleNodes, edges: sampleEdges });
    expect(el).not.toBeNull();
    expect(el.type).toBe('svg');
  });

  it('renders with title', () => {
    const el = ForceGraph({ nodes: sampleNodes, edges: sampleEdges, title: 'My Graph' });
    expect(el).not.toBeNull();
  });

  it('renders with custom dimensions', () => {
    const el = ForceGraph({ nodes: sampleNodes, edges: sampleEdges, width: 800, height: 600 });
    expect(el).not.toBeNull();
  });

  it('renders with showLabels disabled', () => {
    const el = ForceGraph({ nodes: sampleNodes, edges: sampleEdges, showLabels: false });
    expect(el).not.toBeNull();
  });

  it('renders with showArrows enabled', () => {
    const el = ForceGraph({ nodes: sampleNodes, edges: sampleEdges, showArrows: true });
    expect(el).not.toBeNull();
  });

  it('renders with custom node radius', () => {
    const el = ForceGraph({ nodes: sampleNodes, edges: sampleEdges, nodeRadius: 20 });
    expect(el).not.toBeNull();
  });

  it('renders with custom edge properties', () => {
    const el = ForceGraph({
      nodes: sampleNodes,
      edges: sampleEdges,
      edgeColor: '#ff0000',
      edgeWidth: 3,
    });
    expect(el).not.toBeNull();
  });

  it('renders with animate disabled', () => {
    const el = ForceGraph({ nodes: sampleNodes, edges: sampleEdges, animate: false });
    expect(el).not.toBeNull();
  });

  it('renders with weighted edges', () => {
    const edges = [
      { source: 'a', target: 'b', weight: 2 },
      { source: 'b', target: 'c', weight: 0.5 },
    ];
    const el = ForceGraph({ nodes: sampleNodes, edges });
    expect(el).not.toBeNull();
  });

  it('renders with custom force parameters', () => {
    const el = ForceGraph({
      nodes: sampleNodes,
      edges: sampleEdges,
      repulsionForce: 500,
      attractionForce: 0.05,
      damping: 0.8,
      edgeLength: 150,
    });
    expect(el).not.toBeNull();
  });
});

// ---------------------------------------------------------------------------
// Sad-path tests
// ---------------------------------------------------------------------------

describe('ForceGraph — sad path', () => {
  it('handles empty nodes array', () => {
    const el = ForceGraph({ nodes: [], edges: [] });
    expect(el).not.toBeNull();
    expect(el.type).toBe('svg');
  });

  it('handles single node with no edges', () => {
    const el = ForceGraph({ nodes: [{ id: 'solo' }], edges: [] });
    expect(el).not.toBeNull();
  });

  it('handles edges referencing missing nodes', () => {
    const el = ForceGraph({
      nodes: [{ id: 'a' }],
      edges: [{ source: 'a', target: 'missing' }],
    });
    expect(el).not.toBeNull();
  });

  it('handles nodes with fixed positions', () => {
    const nodes = [
      { id: 'a', x: 100, y: 100, fixed: true },
      { id: 'b', x: 200, y: 200 },
    ];
    const el = ForceGraph({ nodes, edges: [{ source: 'a', target: 'b' }] });
    expect(el).not.toBeNull();
  });
});

// ---------------------------------------------------------------------------
// Default props tests
// ---------------------------------------------------------------------------

describe('ForceGraph — defaults', () => {
  it('uses default width and height', () => {
    const el = ForceGraph({ nodes: sampleNodes, edges: sampleEdges });
    expect(el.props.width).toBe('600');
    expect(el.props.height).toBe('400');
  });

  it('uses role="img"', () => {
    const el = ForceGraph({ nodes: sampleNodes, edges: sampleEdges });
    expect(el.props.role).toBe('img');
  });

  it('uses default aria-label when no title', () => {
    const el = ForceGraph({ nodes: sampleNodes, edges: sampleEdges });
    expect(el.props['aria-label']).toBe('Force-directed graph');
  });

  it('uses title as aria-label when provided', () => {
    const el = ForceGraph({ nodes: sampleNodes, edges: sampleEdges, title: 'Network' });
    expect(el.props['aria-label']).toBe('Network');
  });

  it('shows empty state aria-label for empty nodes', () => {
    const el = ForceGraph({ nodes: [], edges: [] });
    expect(el.props['aria-label']).toBe('Empty force-directed graph');
  });
});
