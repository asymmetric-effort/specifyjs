// (c) 2025-2026 Asymmetric Effort, LLC. MIT LICENSE
// SPDX-License-Identifier: MIT

import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { HypercubeGraph } from '../src/index';
import { installMockDispatcher, teardownMockDispatcher } from '../../../_test-helpers/mock-dispatcher';

beforeEach(() => installMockDispatcher());
afterEach(() => teardownMockDispatcher());

// ---------------------------------------------------------------------------
// Happy-path tests
// ---------------------------------------------------------------------------

describe('HypercubeGraph — happy path', () => {
  it('renders with default props', () => {
    const el = HypercubeGraph({});
    expect(el).not.toBeNull();
    expect(el.type).toBe('svg');
  });

  it('renders with custom dimension', () => {
    const el = HypercubeGraph({ dimension: 3 });
    expect(el).not.toBeNull();
  });

  it('renders with custom size', () => {
    const el = HypercubeGraph({ width: 400, height: 400 });
    expect(el.props.width).toBe('100%');
  });

  it('renders with custom colors', () => {
    const el = HypercubeGraph({ vertexColors: ['#ff0000', '#00ff00', '#0000ff'] });
    expect(el).not.toBeNull();
  });

  it('renders with auto colors', () => {
    const el = HypercubeGraph({ vertexColors: 'auto' });
    expect(el).not.toBeNull();
  });

  it('renders with labels', () => {
    const el = HypercubeGraph({ showLabels: true, dimension: 2 });
    expect(el).not.toBeNull();
  });

  it('renders with custom edge properties', () => {
    const el = HypercubeGraph({ edgeWidth: 5, edgeColor: '#333' });
    expect(el).not.toBeNull();
  });

  it('renders with custom vertex radius', () => {
    const el = HypercubeGraph({ vertexRadius: 15 });
    expect(el).not.toBeNull();
  });

  it('renders with perspective', () => {
    const el = HypercubeGraph({ perspective: 0.5 });
    expect(el).not.toBeNull();
  });

  it('renders with background color', () => {
    const el = HypercubeGraph({ backgroundColor: '#f0f0f0' });
    expect(el).not.toBeNull();
  });
});

// ---------------------------------------------------------------------------
// Sad-path tests
// ---------------------------------------------------------------------------

describe('HypercubeGraph — sad path', () => {
  it('handles dimension 1', () => {
    const el = HypercubeGraph({ dimension: 1 });
    expect(el).not.toBeNull();
  });

  it('handles zero rotation speed', () => {
    const el = HypercubeGraph({ rotationSpeed: 0 });
    expect(el).not.toBeNull();
  });

  it('handles zero perspective', () => {
    const el = HypercubeGraph({ perspective: 0 });
    expect(el).not.toBeNull();
  });

  it('handles negative scale', () => {
    const el = HypercubeGraph({ scale: -100 });
    expect(el).not.toBeNull();
  });

  it('handles zero vertex radius', () => {
    const el = HypercubeGraph({ vertexRadius: 0 });
    expect(el).not.toBeNull();
  });
});

// ---------------------------------------------------------------------------
// Interaction tests
// ---------------------------------------------------------------------------

describe('HypercubeGraph — interaction', () => {
  it('has grab cursor style for drag interaction', () => {
    const el = HypercubeGraph({});
    expect(el.props.style.cursor).toBe('grab');
  });

  it('has mouse event handlers for drag rotation', () => {
    const el = HypercubeGraph({});
    expect(el.props.onMouseDown).toBeDefined();
    expect(el.props.onMouseMove).toBeDefined();
    expect(el.props.onMouseUp).toBeDefined();
    expect(el.props.onMouseLeave).toBeDefined();
  });

  it('renders correct number of edge elements for dim=2', () => {
    const el = HypercubeGraph({ dimension: 2, rotationSpeed: 0 });
    // dim=2: 4 edges, 4 vertices => 4 line elements + circle/text elements
    const lines = (Array.isArray(el.props.children) ? el.props.children : [el.props.children]).filter((c: any) => c && c.type === 'line');
    expect(lines.length).toBe(4);
  });

  it('renders correct number of vertex elements for dim=2', () => {
    const el = HypercubeGraph({ dimension: 2, rotationSpeed: 0 });
    const circles = (Array.isArray(el.props.children) ? el.props.children : [el.props.children]).filter((c: any) => c && c.type === 'circle');
    expect(circles.length).toBe(4);
  });
});
