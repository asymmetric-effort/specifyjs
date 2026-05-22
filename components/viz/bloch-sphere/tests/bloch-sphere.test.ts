// (c) 2025-2026 Asymmetric Effort, LLC. MIT LICENSE
// SPDX-License-Identifier: MIT

import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { createElement } from '../../../../core/src/index';
import { installMockDispatcher, teardownMockDispatcher } from '../../../_test-helpers/mock-dispatcher';
import {
  BlochSphere,
  blochToCartesian,
  cartesianToBloch,
  applyGate,
} from '../src/index';

beforeEach(() => installMockDispatcher());
afterEach(() => teardownMockDispatcher());

describe('blochToCartesian', () => {
  it('converts |0⟩ (north pole) to (0,0,1)', () => {
    const { x, y, z } = blochToCartesian({ theta: 0, phi: 0 });
    expect(z).toBeCloseTo(1);
    expect(x).toBeCloseTo(0);
    expect(y).toBeCloseTo(0);
  });

  it('converts |1⟩ (south pole) to (0,0,-1)', () => {
    const { x, y, z } = blochToCartesian({ theta: Math.PI, phi: 0 });
    expect(z).toBeCloseTo(-1);
    expect(x).toBeCloseTo(0);
  });

  it('converts |+⟩ to (1,0,0)', () => {
    const { x, y, z } = blochToCartesian({ theta: Math.PI / 2, phi: 0 });
    expect(x).toBeCloseTo(1);
    expect(z).toBeCloseTo(0);
  });

  it('converts |+i⟩ to (0,1,0)', () => {
    const { x, y, z } = blochToCartesian({ theta: Math.PI / 2, phi: Math.PI / 2 });
    expect(y).toBeCloseTo(1);
    expect(x).toBeCloseTo(0);
  });
});

describe('cartesianToBloch', () => {
  it('converts (0,0,1) to theta=0', () => {
    const s = cartesianToBloch(0, 0, 1);
    expect(s.theta).toBeCloseTo(0);
  });

  it('converts (0,0,-1) to theta=π', () => {
    const s = cartesianToBloch(0, 0, -1);
    expect(s.theta).toBeCloseTo(Math.PI);
  });

  it('round-trips through cartesian', () => {
    const orig = { theta: 1.2, phi: 2.5 };
    const { x, y, z } = blochToCartesian(orig);
    const back = cartesianToBloch(x, y, z);
    expect(back.theta).toBeCloseTo(orig.theta, 5);
    expect(back.phi).toBeCloseTo(orig.phi, 5);
  });

  it('handles zero vector', () => {
    const s = cartesianToBloch(0, 0, 0);
    expect(s.theta).toBe(0);
    expect(s.phi).toBe(0);
  });
});

describe('applyGate', () => {
  it('X gate flips |0⟩ to |1⟩', () => {
    const result = applyGate({ theta: 0, phi: 0 }, { gate: 'X' });
    expect(result.theta).toBeCloseTo(Math.PI);
  });

  it('X gate flips |1⟩ back to |0⟩', () => {
    const result = applyGate({ theta: Math.PI, phi: 0 }, { gate: 'X' });
    expect(result.theta).toBeCloseTo(0, 4);
  });

  it('Z gate leaves |0⟩ unchanged', () => {
    const result = applyGate({ theta: 0, phi: 0 }, { gate: 'Z' });
    expect(result.theta).toBeCloseTo(0);
  });

  it('H gate maps |0⟩ to |+⟩', () => {
    const result = applyGate({ theta: 0, phi: 0 }, { gate: 'H' });
    const { x, z } = blochToCartesian(result);
    expect(x).toBeCloseTo(1, 4);
    expect(z).toBeCloseTo(0, 4);
  });

  it('S gate is π/2 rotation around Z', () => {
    const state = { theta: Math.PI / 2, phi: 0 }; // |+⟩
    const result = applyGate(state, { gate: 'S' });
    const { y } = blochToCartesian(result);
    expect(y).toBeCloseTo(1, 4); // should be |+i⟩
  });

  it('Rx with custom angle rotates around X', () => {
    const result = applyGate({ theta: 0, phi: 0 }, { gate: 'Rx', angle: Math.PI / 2 });
    expect(result.theta).toBeGreaterThan(0);
  });

  it('Rz rotates around Z axis', () => {
    const state = { theta: Math.PI / 2, phi: 0 };
    const result = applyGate(state, { gate: 'Rz', angle: Math.PI / 2 });
    expect(result.phi).toBeCloseTo(Math.PI / 2, 4);
  });
});

describe('BlochSphere component', () => {
  it('renders an SVG element', () => {
    const el = BlochSphere({});
    expect(el).not.toBeNull();
    expect(el.type).toBe('svg');
  });

  it('renders with custom state', () => {
    const el = BlochSphere({ state: { theta: Math.PI / 2, phi: 0 } });
    expect(el).not.toBeNull();
  });

  it('renders with title', () => {
    const el = BlochSphere({ title: 'Qubit State' });
    expect(el).not.toBeNull();
  });

  it('renders responsive width', () => {
    const el = BlochSphere({});
    expect(el.props.width).toBe('100%');
  });

  it('has viewBox', () => {
    const el = BlochSphere({ width: 500, height: 500 });
    expect(el.props.viewBox).toBe('0 0 500 500');
  });

  it('has aria-label', () => {
    const el = BlochSphere({});
    expect(el.props['aria-label']).toContain('Bloch sphere');
  });

  it('renders with wireframe disabled', () => {
    const el = BlochSphere({ showWireframe: false });
    expect(el).not.toBeNull();
  });

  it('renders with labels disabled', () => {
    const el = BlochSphere({ showLabels: false });
    expect(el).not.toBeNull();
  });

  it('renders with trail disabled', () => {
    const el = BlochSphere({ showTrail: false });
    expect(el).not.toBeNull();
  });

  it('renders with background color', () => {
    const el = BlochSphere({ backgroundColor: '#0f172a' });
    expect(el).not.toBeNull();
  });

  it('renders non-interactive', () => {
    const el = BlochSphere({ interactive: false, zoomable: false });
    expect(el.props.onMouseDown).toBeUndefined();
    expect(el.props.onWheel).toBeUndefined();
  });
});
