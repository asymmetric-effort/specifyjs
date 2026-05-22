// (c) 2025-2026 Asymmetric Effort, LLC. MIT LICENSE
// SPDX-License-Identifier: MIT

import { describe, it, expect } from 'vitest';
import { VizWrapper } from '../src/index';

// ---------------------------------------------------------------------------
// Happy-path tests
// ---------------------------------------------------------------------------

describe('VizWrapper — happy path', () => {
  it('renders with default props', () => {
    const el = VizWrapper({});
    expect(el).not.toBeNull();
    expect(el.type).toBe('div');
  });

  it('renders with title', () => {
    const el = VizWrapper({ title: 'My Chart' });
    expect(el).not.toBeNull();
  });

  it('renders with legend items', () => {
    const el = VizWrapper({
      legend: [
        { label: 'Series A', color: '#ff0000' },
        { label: 'Series B', color: '#0000ff' },
      ],
    });
    expect(el).not.toBeNull();
  });

  it('renders with children', () => {
    const el = VizWrapper({ children: 'Chart content' });
    expect(el).not.toBeNull();
  });

  it('renders with custom dimensions', () => {
    const el = VizWrapper({ width: 800, height: 400 });
    expect(el).not.toBeNull();
  });

  it('renders with string dimensions', () => {
    const el = VizWrapper({ width: '100%', height: 'auto' });
    expect(el).not.toBeNull();
  });

  it('renders with title at different positions', () => {
    const top = VizWrapper({ title: 'Top', titlePosition: 'top' });
    const bottom = VizWrapper({ title: 'Bottom', titlePosition: 'bottom' });
    const left = VizWrapper({ title: 'Left', titlePosition: 'left' });
    const right = VizWrapper({ title: 'Right', titlePosition: 'right' });
    expect(top).not.toBeNull();
    expect(bottom).not.toBeNull();
    expect(left).not.toBeNull();
    expect(right).not.toBeNull();
  });

  it('renders with legend at different positions', () => {
    const legend = [{ label: 'A', color: '#f00' }];
    const top = VizWrapper({ legend, legendPosition: 'top' });
    const bottom = VizWrapper({ legend, legendPosition: 'bottom' });
    const left = VizWrapper({ legend, legendPosition: 'left' });
    const right = VizWrapper({ legend, legendPosition: 'right' });
    expect(top).not.toBeNull();
    expect(bottom).not.toBeNull();
    expect(left).not.toBeNull();
    expect(right).not.toBeNull();
  });

  it('renders legend with different shapes', () => {
    const el = VizWrapper({
      legend: [
        { label: 'Circle', color: '#f00', shape: 'circle' },
        { label: 'Square', color: '#0f0', shape: 'square' },
        { label: 'Line', color: '#00f', shape: 'line' },
      ],
    });
    expect(el).not.toBeNull();
  });
});

// ---------------------------------------------------------------------------
// Sad-path tests
// ---------------------------------------------------------------------------

describe('VizWrapper — sad path', () => {
  it('handles empty legend array', () => {
    const el = VizWrapper({ legend: [] });
    expect(el).not.toBeNull();
  });

  it('handles no title', () => {
    const el = VizWrapper({ title: undefined });
    expect(el).not.toBeNull();
  });

  it('handles zero dimensions', () => {
    const el = VizWrapper({ width: 0, height: 0 });
    expect(el).not.toBeNull();
  });

  it('handles missing children', () => {
    const el = VizWrapper({});
    expect(el).not.toBeNull();
  });
});

// ---------------------------------------------------------------------------
// Interaction tests
// ---------------------------------------------------------------------------

describe('VizWrapper — layout', () => {
  it('applies custom background color', () => {
    const el = VizWrapper({ backgroundColor: '#f0f0f0' });
    expect(el.props.style.backgroundColor).toBe('#f0f0f0');
  });

  it('applies custom border', () => {
    const el = VizWrapper({ border: '2px solid red' });
    expect(el.props.style.border).toBe('2px solid red');
  });

  it('applies CSS contain property', () => {
    const el = VizWrapper({ contain: 'layout' });
    expect(el.props.style.contain).toBe('layout');
  });

  it('applies custom className', () => {
    const el = VizWrapper({ className: 'my-chart' });
    expect(el.props.className).toContain('my-chart');
  });

  it('merges extra style', () => {
    const el = VizWrapper({ style: { opacity: '0.5' } });
    expect(el.props.style.opacity).toBe('0.5');
  });
});
