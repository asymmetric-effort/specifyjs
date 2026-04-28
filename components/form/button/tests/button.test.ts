// (c) 2025-2026 Asymmetric Effort, LLC. MIT LICENSE
// SPDX-License-Identifier: MIT

import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { createElement } from '../../../../core/src/index';
import { installMockDispatcher, teardownMockDispatcher } from '../../../_test-helpers/mock-dispatcher';
import { Button } from '../src/index';

beforeEach(() => { installMockDispatcher(); });
afterEach(() => { teardownMockDispatcher(); });

describe('Button', () => {
  it('renders with text children', () => {
    const el = Button({ children: 'Click me' });
    expect(el).not.toBeNull();
    expect(el.props.type).toBe('button');
  });

  it('renders with primary variant', () => {
    const el = Button({ children: 'Primary', variant: 'primary' });
    expect(el).not.toBeNull();
    expect(el.props.style.backgroundColor).toBe('#3b82f6');
    expect(el.props.style.color).toBe('white');
  });

  it('renders with danger variant', () => {
    const el = Button({ children: 'Delete', variant: 'danger' });
    expect(el.props.style.backgroundColor).toBe('#ef4444');
  });

  it('renders disabled', () => {
    const el = Button({ children: 'Disabled', disabled: true });
    expect(el.props.disabled).toBe(true);
    expect(el.props.style.opacity).toBe('0.5');
  });

  it('renders small size', () => {
    const el = Button({ children: 'Small', size: 'sm' });
    expect(el.props.style.fontSize).toBe('12px');
  });

  it('renders large size', () => {
    const el = Button({ children: 'Large', size: 'lg' });
    expect(el.props.style.fontSize).toBe('15px');
  });

  it('renders full width', () => {
    const el = Button({ children: 'Full', fullWidth: true });
    expect(el.props.style.width).toBe('100%');
  });

  it('renders active state', () => {
    const el = Button({ children: 'Active', active: true });
    expect(el.props.style.backgroundColor).toBe('#3b82f6');
    expect(el.props.style.color).toBe('white');
    expect(el.props['aria-pressed']).toBe('true');
  });

  it('renders with ariaLabel', () => {
    const el = Button({ children: 'X', ariaLabel: 'Close' });
    expect(el.props['aria-label']).toBe('Close');
  });

  it('defaults to secondary variant and md size', () => {
    const el = Button({ children: 'Default' });
    expect(el.props.style.fontSize).toBe('13px');
  });

  it('applies custom style overrides', () => {
    const el = Button({ children: 'Custom', style: { marginTop: '8px' } });
    expect(el.props.style.marginTop).toBe('8px');
  });

  it('renders submit type', () => {
    const el = Button({ children: 'Submit', type: 'submit' });
    expect(el.props.type).toBe('submit');
  });
});
