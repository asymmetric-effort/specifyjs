// (c) 2025-2026 Asymmetric Effort, LLC. MIT LICENSE
// SPDX-License-Identifier: MIT

import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { ProgressBar } from '../src/index';
import { installMockDispatcher, teardownMockDispatcher } from '../../../_test-helpers/mock-dispatcher';

beforeEach(() => installMockDispatcher());
afterEach(() => teardownMockDispatcher());

// ---------------------------------------------------------------------------
// Happy-path tests
// ---------------------------------------------------------------------------

describe('ProgressBar — happy path', () => {
  it('renders with default props', () => {
    const el = ProgressBar({});
    expect(el).not.toBeNull();
    expect(el.props.role).toBe('progressbar');
    expect(el.props['aria-valuemin']).toBe('0');
    expect(el.props['aria-valuemax']).toBe('100');
  });

  it('renders bar variant by default', () => {
    const el = ProgressBar({ value: 50 });
    expect(el.props['aria-valuenow']).toBe('50');
  });

  it('renders circular variant', () => {
    const el = ProgressBar({ variant: 'circular', value: 75, size: 64 });
    expect(el.props.role).toBe('progressbar');
    expect(el.props['aria-valuenow']).toBe('75');
  });

  it('shows label when showLabel is true', () => {
    const el = ProgressBar({ value: 42, showLabel: true });
    expect(el.props['aria-valuenow']).toBe('42');
  });

  it('renders with custom colors', () => {
    const el = ProgressBar({ value: 30, color: '#ff0000', backgroundColor: '#000000' });
    expect(el).not.toBeNull();
  });

  it('renders indeterminate mode', () => {
    const el = ProgressBar({ indeterminate: true });
    expect(el.props['aria-valuenow']).toBeUndefined();
  });

  it('renders animated bar', () => {
    const el = ProgressBar({ value: 60, animated: true });
    expect(el).not.toBeNull();
  });

  it('renders animated circular', () => {
    const el = ProgressBar({ variant: 'circular', value: 60, animated: true });
    expect(el).not.toBeNull();
  });
});

// ---------------------------------------------------------------------------
// Sad-path tests
// ---------------------------------------------------------------------------

describe('ProgressBar — sad path', () => {
  it('clamps value above max to max', () => {
    const el = ProgressBar({ value: 200, max: 100 });
    expect(el.props['aria-valuenow']).toBe('100');
  });

  it('clamps negative value to zero', () => {
    const el = ProgressBar({ value: -50 });
    expect(el.props['aria-valuenow']).toBe('0');
  });

  it('handles zero max gracefully', () => {
    const el = ProgressBar({ value: 50, max: 0 });
    expect(el.props['aria-valuenow']).toBe('0');
  });

  it('handles missing value prop', () => {
    const el = ProgressBar({});
    expect(el.props['aria-valuenow']).toBe('0');
  });

  it('handles negative max gracefully', () => {
    const el = ProgressBar({ value: 50, max: -10 });
    expect(el).not.toBeNull();
  });
});

// ---------------------------------------------------------------------------
// Interaction tests
// ---------------------------------------------------------------------------

describe('ProgressBar — interaction', () => {
  it('progress updates when value changes', () => {
    const el1 = ProgressBar({ value: 25 });
    const el2 = ProgressBar({ value: 75 });
    expect(el1.props['aria-valuenow']).toBe('25');
    expect(el2.props['aria-valuenow']).toBe('75');
  });

  it('switches between bar and circular variants', () => {
    const bar = ProgressBar({ value: 50, variant: 'bar' });
    const circ = ProgressBar({ value: 50, variant: 'circular' });
    expect(bar).not.toBeNull();
    expect(circ).not.toBeNull();
  });

  it('indeterminate circular spins', () => {
    const el = ProgressBar({ variant: 'circular', indeterminate: true });
    expect(el.props['aria-valuenow']).toBeUndefined();
  });
});
