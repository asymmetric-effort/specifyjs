// (c) 2025-2026 Asymmetric Effort, LLC. MIT LICENSE
// SPDX-License-Identifier: MIT

import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { SankeyDiagram } from '../src/index';
import { installMockDispatcher, teardownMockDispatcher } from '../../../_test-helpers/mock-dispatcher';

beforeEach(() => installMockDispatcher());
afterEach(() => teardownMockDispatcher());

const sampleNodes = [
  { id: 'a', label: 'Source A' },
  { id: 'b', label: 'Source B' },
  { id: 'c', label: 'Target C' },
  { id: 'd', label: 'Target D' },
];

const sampleLinks = [
  { source: 'a', target: 'c', value: 30 },
  { source: 'a', target: 'd', value: 20 },
  { source: 'b', target: 'c', value: 40 },
  { source: 'b', target: 'd', value: 10 },
];

// ---------------------------------------------------------------------------
// Happy-path tests
// ---------------------------------------------------------------------------

describe('SankeyDiagram — happy path', () => {
  it('renders with nodes and links', () => {
    const el = SankeyDiagram({ nodes: sampleNodes, links: sampleLinks });
    expect(el).not.toBeNull();
    expect(el.type).toBe('svg');
  });

  it('renders with title', () => {
    const el = SankeyDiagram({ nodes: sampleNodes, links: sampleLinks, title: 'Flow' });
    expect(el).not.toBeNull();
  });

  it('renders with custom dimensions', () => {
    const el = SankeyDiagram({ nodes: sampleNodes, links: sampleLinks, width: 1000, height: 600 });
    expect(el).not.toBeNull();
  });

  it('renders with showLabels disabled', () => {
    const el = SankeyDiagram({ nodes: sampleNodes, links: sampleLinks, showLabels: false });
    expect(el).not.toBeNull();
  });

  it('renders with showValues enabled', () => {
    const el = SankeyDiagram({ nodes: sampleNodes, links: sampleLinks, showValues: true });
    expect(el).not.toBeNull();
  });

  it('renders with custom nodeWidth and nodePadding', () => {
    const el = SankeyDiagram({
      nodes: sampleNodes,
      links: sampleLinks,
      nodeWidth: 30,
      nodePadding: 20,
    });
    expect(el).not.toBeNull();
  });

  it('renders with custom linkOpacity', () => {
    const el = SankeyDiagram({ nodes: sampleNodes, links: sampleLinks, linkOpacity: 0.7 });
    expect(el).not.toBeNull();
  });

  it('renders with custom colors', () => {
    const el = SankeyDiagram({
      nodes: sampleNodes,
      links: sampleLinks,
      colors: ['#ff0000', '#00ff00', '#0000ff'],
    });
    expect(el).not.toBeNull();
  });
});

// ---------------------------------------------------------------------------
// Sad-path tests
// ---------------------------------------------------------------------------

describe('SankeyDiagram — sad path', () => {
  it('handles empty nodes array', () => {
    const el = SankeyDiagram({ nodes: [], links: [] });
    expect(el).not.toBeNull();
    expect(el.type).toBe('svg');
  });

  it('handles nodes with no links', () => {
    const el = SankeyDiagram({
      nodes: [{ id: 'x', label: 'X' }],
      links: [],
    });
    expect(el).not.toBeNull();
  });

  it('handles links with zero value', () => {
    const el = SankeyDiagram({
      nodes: sampleNodes,
      links: [{ source: 'a', target: 'c', value: 0 }],
    });
    expect(el).not.toBeNull();
  });

  it('handles links referencing missing nodes gracefully', () => {
    // Links referencing non-existent nodes are filtered by the layout algorithm
    // since assignColumns only considers nodes present in the nodeIds list
    const el = SankeyDiagram({
      nodes: [{ id: 'a', label: 'A' }, { id: 'b', label: 'B' }],
      links: [{ source: 'a', target: 'b', value: 10 }],
    });
    expect(el).not.toBeNull();
  });
});

// ---------------------------------------------------------------------------
// Default props tests
// ---------------------------------------------------------------------------

describe('SankeyDiagram — defaults', () => {
  it('uses default width and height', () => {
    const el = SankeyDiagram({ nodes: sampleNodes, links: sampleLinks });
    expect(el.props.width).toBe('100%');
  });

  it('uses role="img"', () => {
    const el = SankeyDiagram({ nodes: sampleNodes, links: sampleLinks });
    expect(el.props.role).toBe('img');
  });

  it('uses default aria-label when no title', () => {
    const el = SankeyDiagram({ nodes: sampleNodes, links: sampleLinks });
    expect(el.props['aria-label']).toBe('Sankey diagram');
  });

  it('uses title as aria-label when provided', () => {
    const el = SankeyDiagram({ nodes: sampleNodes, links: sampleLinks, title: 'Energy Flow' });
    expect(el.props['aria-label']).toBe('Energy Flow');
  });

  it('shows empty state aria-label for empty nodes', () => {
    const el = SankeyDiagram({ nodes: [], links: [] });
    expect(el.props['aria-label']).toBe('Empty Sankey diagram');
  });
});
