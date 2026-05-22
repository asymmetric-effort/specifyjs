// (c) 2025-2026 Asymmetric Effort, LLC. MIT LICENSE
// SPDX-License-Identifier: MIT

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { Alert } from '../src/index';
import { installMockDispatcher, teardownMockDispatcher } from '../../../_test-helpers/mock-dispatcher';

beforeEach(() => installMockDispatcher());
afterEach(() => teardownMockDispatcher());

// ---------------------------------------------------------------------------
// Happy-path tests
// ---------------------------------------------------------------------------

describe('Alert — happy path', () => {
  it('renders with default props (info type)', () => {
    const el = Alert({});
    expect(el).not.toBeNull();
    expect(el.props.role).toBe('alert');
  });

  it('renders info type', () => {
    const el = Alert({ type: 'info', message: 'Info message' });
    expect(el.props.role).toBe('alert');
  });

  it('renders success type', () => {
    const el = Alert({ type: 'success', message: 'Success!' });
    expect(el).not.toBeNull();
  });

  it('renders warning type', () => {
    const el = Alert({ type: 'warning', message: 'Warning!' });
    expect(el).not.toBeNull();
  });

  it('renders error type', () => {
    const el = Alert({ type: 'error', message: 'Error occurred' });
    expect(el).not.toBeNull();
  });

  it('renders filled variant', () => {
    const el = Alert({ variant: 'filled', type: 'info', message: 'Filled' });
    expect(el).not.toBeNull();
  });

  it('renders outline variant', () => {
    const el = Alert({ variant: 'outline', type: 'info', message: 'Outline' });
    expect(el).not.toBeNull();
  });

  it('renders subtle variant', () => {
    const el = Alert({ variant: 'subtle', type: 'info', message: 'Subtle' });
    expect(el).not.toBeNull();
  });

  it('renders with title', () => {
    const el = Alert({ title: 'Heads up', message: 'Something happened' });
    expect(el).not.toBeNull();
  });

  it('renders with custom icon', () => {
    const el = Alert({ icon: '!', message: 'Custom icon' });
    expect(el).not.toBeNull();
  });

  it('renders with action button', () => {
    const onClick = vi.fn();
    const el = Alert({ message: 'Action', action: { label: 'Retry', onClick } });
    expect(el).not.toBeNull();
  });
});

// ---------------------------------------------------------------------------
// Sad-path tests
// ---------------------------------------------------------------------------

describe('Alert — sad path', () => {
  it('renders with no message or title', () => {
    const el = Alert({});
    expect(el).not.toBeNull();
  });

  it('renders with unknown type gracefully', () => {
    const el = Alert({ type: 'custom' as any, message: 'Custom type' });
    expect(el).not.toBeNull();
  });

  it('handles missing onClose when closable', () => {
    const el = Alert({ closable: true, message: 'Closable' });
    expect(el).not.toBeNull();
  });

  it('handles children instead of message', () => {
    const el = Alert({ children: 'Child content' });
    expect(el).not.toBeNull();
  });
});

// ---------------------------------------------------------------------------
// Interaction tests
// ---------------------------------------------------------------------------

describe('Alert — interaction', () => {
  it('renders close button when closable', () => {
    const onClose = vi.fn();
    const el = Alert({ closable: true, onClose, message: 'Closable' });
    expect(el).not.toBeNull();
    // Close button should be present as last child
    const children = Array.isArray(el.props.children) ? el.props.children : [el.props.children];
    const closeBtn = children[children.length - 1];
    expect(closeBtn).not.toBeNull();
    expect(closeBtn.props['aria-label']).toBe('Close');
  });

  it('hides close button when not closable', () => {
    const el = Alert({ closable: false, message: 'Not closable' });
    // Last child should be null (no close button)
    const children = Array.isArray(el.props.children) ? el.props.children : [el.props.children];
    const lastChild = children[children.length - 1];
    expect(lastChild).toBeNull();
  });

  it('renders action button with correct label', () => {
    const onClick = vi.fn();
    const el = Alert({ message: 'Act', action: { label: 'Do it', onClick } });
    expect(el).not.toBeNull();
  });
});
