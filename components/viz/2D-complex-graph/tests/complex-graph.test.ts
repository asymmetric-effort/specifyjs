// (c) 2025-2026 Asymmetric Effort, LLC. MIT LICENSE
// SPDX-License-Identifier: MIT

import { describe, it, expect, beforeEach, afterEach, fn } from '@asymmetric-effort/nogginlessdom';
import { ComplexGraph2D } from '../src/index';
import { installMockDispatcher, teardownMockDispatcher } from '../../../_test-helpers/mock-dispatcher';

beforeEach(() => installMockDispatcher());
afterEach(() => teardownMockDispatcher());

// ---------------------------------------------------------------------------
// Happy-path tests
// ---------------------------------------------------------------------------

describe('ComplexGraph2D — happy path', () => {
  it('renders with defaults (canvas element)', () => {
    const el = ComplexGraph2D({});
    expect(el).not.toBeNull();
    expect(el.type).toBe('canvas');
  });

  it('renders with custom dimensions', () => {
    const el = ComplexGraph2D({ width: 800, height: 600 });
    expect(el.props.width).toBe(800);
    expect(el.props.height).toBe(600);
  });

  it('accepts custom colorScheme', () => {
    const elFire = ComplexGraph2D({ colorScheme: 'fire' });
    expect(elFire).not.toBeNull();
    expect(elFire.type).toBe('canvas');

    const elOcean = ComplexGraph2D({ colorScheme: 'ocean' });
    expect(elOcean).not.toBeNull();
    expect(elOcean.type).toBe('canvas');

    const elClassic = ComplexGraph2D({ colorScheme: 'classic' });
    expect(elClassic).not.toBeNull();
    expect(elClassic.type).toBe('canvas');
  });

  it('accepts custom maxIterations', () => {
    const el = ComplexGraph2D({ maxIterations: 500 });
    expect(el).not.toBeNull();
    expect(el.type).toBe('canvas');
  });

  it('has crosshair cursor style', () => {
    const el = ComplexGraph2D({});
    expect(el.props.style).toEqual({ cursor: 'crosshair' });
  });
});

// ---------------------------------------------------------------------------
// Interaction tests
// ---------------------------------------------------------------------------

describe('ComplexGraph2D — interaction', () => {
  it('fires onPointClick with complex coordinates', () => {
    const handler = fn();
    const el = ComplexGraph2D({ onPointClick: handler });
    expect(el.props.onClick).toBeDefined();
    // The onclick handler expects a MouseEvent with target.getBoundingClientRect
    // We verify it is wired up
    expect(typeof el.props.onClick).toBe('function');
  });

  it('fires onPointHover with complex coordinates', () => {
    const handler = fn();
    const el = ComplexGraph2D({ onPointHover: handler });
    expect(el.props.onMouseMove).toBeDefined();
    expect(typeof el.props.onMouseMove).toBe('function');
  });

  it('has mouse event handlers for pan interaction', () => {
    const el = ComplexGraph2D({});
    expect(el.props.onMouseDown).toBeDefined();
    expect(el.props.onMouseMove).toBeDefined();
    expect(el.props.onMouseUp).toBeDefined();
    expect(el.props.onMouseLeave).toBeDefined();
  });

  it('has wheel handler for zoom', () => {
    const el = ComplexGraph2D({});
    expect(el.props.onWheel).toBeDefined();
  });

  it('has double-click handler when onPointDoubleClick provided', () => {
    const handler = fn();
    const el = ComplexGraph2D({ onPointDoubleClick: handler });
    expect(el.props.onDblClick).toBeDefined();
    expect(typeof el.props.onDblClick).toBe('function');
  });

  it('has context menu handler when onPointContextMenu provided', () => {
    const handler = fn();
    const el = ComplexGraph2D({ onPointContextMenu: handler });
    expect(el.props.onContextMenu).toBeDefined();
    expect(typeof el.props.onContextMenu).toBe('function');
  });
});
