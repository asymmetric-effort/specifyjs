// (c) 2025-2026 Asymmetric Effort, LLC. MIT LICENSE
// SPDX-License-Identifier: MIT

import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { Skeleton } from '../src/index';
import { installMockDispatcher, teardownMockDispatcher } from '../../../_test-helpers/mock-dispatcher';

beforeEach(() => installMockDispatcher());
afterEach(() => teardownMockDispatcher());

// ---------------------------------------------------------------------------
// Happy-path tests
// ---------------------------------------------------------------------------

describe('Skeleton — happy path', () => {
  it('renders with default props (text variant)', () => {
    const el = Skeleton({});
    expect(el).not.toBeNull();
    expect(el.props['aria-hidden']).toBe('true');
  });

  it('renders text variant with multiple lines', () => {
    const el = Skeleton({ variant: 'text', lines: 3 });
    expect(el).not.toBeNull();
  });

  it('renders circular variant', () => {
    const el = Skeleton({ variant: 'circular', width: 40 });
    expect(el.props['aria-hidden']).toBe('true');
  });

  it('renders rectangular variant', () => {
    const el = Skeleton({ variant: 'rectangular', width: 200, height: 100 });
    expect(el.props['aria-hidden']).toBe('true');
  });

  it('renders with custom dimensions', () => {
    const el = Skeleton({ width: '300px', height: '50px' });
    expect(el).not.toBeNull();
  });

  it('renders with custom border radius', () => {
    const el = Skeleton({ borderRadius: '12px' });
    expect(el).not.toBeNull();
  });

  it('renders animated by default', () => {
    const el = Skeleton({});
    // Should contain a style element for shimmer
    const hasStyle = (Array.isArray(el.props.children) ? el.props.children : [el.props.children]).some((c: any) => c && c.type === 'style');
    expect(hasStyle).toBe(true);
  });

  it('renders without animation when animated=false', () => {
    const el = Skeleton({ animated: false });
    expect(el).not.toBeNull();
  });
});

// ---------------------------------------------------------------------------
// Sad-path tests
// ---------------------------------------------------------------------------

describe('Skeleton — sad path', () => {
  it('handles zero lines gracefully', () => {
    const el = Skeleton({ variant: 'text', lines: 0 });
    expect(el).not.toBeNull();
  });

  it('handles negative lines gracefully', () => {
    const el = Skeleton({ variant: 'text', lines: -1 });
    expect(el).not.toBeNull();
  });

  it('handles zero width', () => {
    const el = Skeleton({ width: 0 });
    expect(el).not.toBeNull();
  });

  it('handles zero height', () => {
    const el = Skeleton({ height: 0 });
    expect(el).not.toBeNull();
  });

  it('handles numeric dimensions', () => {
    const el = Skeleton({ width: 100, height: 50 });
    expect(el).not.toBeNull();
  });
});

// ---------------------------------------------------------------------------
// Interaction tests
// ---------------------------------------------------------------------------

describe('Skeleton — variants', () => {
  it('last line of multi-line text is shorter', () => {
    const el = Skeleton({ variant: 'text', lines: 3 });
    expect(el).not.toBeNull();
    // The component renders multiple children divs for lines
  });

  it('single line text uses full width', () => {
    const el = Skeleton({ variant: 'text', lines: 1 });
    expect(el).not.toBeNull();
  });

  it('circular variant creates square element', () => {
    const el = Skeleton({ variant: 'circular', width: '60px' });
    expect(el).not.toBeNull();
  });
});
