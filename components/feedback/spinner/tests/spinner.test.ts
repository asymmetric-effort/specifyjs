// (c) 2025-2026 Asymmetric Effort, LLC. MIT LICENSE
// SPDX-License-Identifier: MIT

import { describe, it, expect, beforeEach, afterEach } from '@asymmetric-effort/nogginlessdom';
import { Spinner } from '../src/index';
import { installMockDispatcher, teardownMockDispatcher } from '../../../_test-helpers/mock-dispatcher';

beforeEach(() => installMockDispatcher());
afterEach(() => teardownMockDispatcher());

// ---------------------------------------------------------------------------
// Happy-path tests
// ---------------------------------------------------------------------------

describe('Spinner — happy path', () => {
  it('renders with default props', () => {
    const el = Spinner({});
    expect(el).not.toBeNull();
    expect(el.props.role).toBe('status');
    expect(el.props['aria-label']).toBe('Loading');
  });

  it('renders sm size', () => {
    const el = Spinner({ size: 'sm' });
    expect(el).not.toBeNull();
  });

  it('renders md size', () => {
    const el = Spinner({ size: 'md' });
    expect(el).not.toBeNull();
  });

  it('renders lg size', () => {
    const el = Spinner({ size: 'lg' });
    expect(el).not.toBeNull();
  });

  it('renders with numeric size', () => {
    const el = Spinner({ size: 32 });
    expect(el).not.toBeNull();
  });

  it('renders with custom color', () => {
    const el = Spinner({ color: '#ff0000' });
    expect(el).not.toBeNull();
  });

  it('renders with custom label', () => {
    const el = Spinner({ label: 'Please wait' });
    expect(el.props['aria-label']).toBe('Please wait');
  });

  it('renders with different speeds', () => {
    const slow = Spinner({ speed: 'slow' });
    const fast = Spinner({ speed: 'fast' });
    expect(slow).not.toBeNull();
    expect(fast).not.toBeNull();
  });
});

// ---------------------------------------------------------------------------
// Sad-path tests
// ---------------------------------------------------------------------------

describe('Spinner — sad path', () => {
  it('handles zero numeric size', () => {
    const el = Spinner({ size: 0 });
    expect(el).not.toBeNull();
  });

  it('handles negative numeric size', () => {
    const el = Spinner({ size: -10 });
    expect(el).not.toBeNull();
  });

  it('handles unknown speed value gracefully', () => {
    const el = Spinner({ speed: 'unknown' as any });
    expect(el).not.toBeNull();
  });

  it('handles unknown size string gracefully', () => {
    const el = Spinner({ size: 'xl' as any });
    expect(el).not.toBeNull();
  });

  it('handles zero thickness', () => {
    const el = Spinner({ thickness: 0 });
    expect(el).not.toBeNull();
  });
});

// ---------------------------------------------------------------------------
// Animation tests
// ---------------------------------------------------------------------------

describe('Spinner — animation', () => {
  it('produces a style element with keyframes', () => {
    const el = Spinner({});
    const children = (Array.isArray(el.props.children) ? el.props.children : [el.props.children]);
    // First child should be the style element with keyframes
    const styleChild = children.find((c: any) => c && c.type === 'style');
    expect(styleChild).toBeDefined();
  });

  it('contains an SVG with animation style', () => {
    const el = Spinner({});
    const svgChild = (Array.isArray(el.props.children) ? el.props.children : [el.props.children]).find((c: any) => c && c.type === 'svg');
    expect(svgChild).toBeDefined();
  });

  it('uses a CSS-valid animation name (no colons or special chars)', () => {
    const el = Spinner({});
    const children = (Array.isArray(el.props.children) ? el.props.children : [el.props.children]);
    const styleChild = children.find((c: any) => c && c.type === 'style');
    const svgChild = children.find((c: any) => c && c.type === 'svg');
    const keyframesText = Array.isArray(styleChild.props.children) ? styleChild.props.children[0] : styleChild.props.children;
    const match = keyframesText.match(/@keyframes\s+([\w-]+)/);
    expect(match).not.toBeNull();
    const animName = match![1];
    expect(animName).toMatch(/^[a-zA-Z_-][a-zA-Z0-9_-]*$/);
    expect(svgChild.props.style.animation).toContain(animName);
  });
});
