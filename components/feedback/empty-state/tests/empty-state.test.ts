// (c) 2025-2026 Asymmetric Effort, LLC. MIT LICENSE
// SPDX-License-Identifier: MIT

import { describe, it, expect, vi } from 'vitest';
import { EmptyState } from '../src/index';

// ---------------------------------------------------------------------------
// Happy-path tests
// ---------------------------------------------------------------------------

describe('EmptyState — happy path', () => {
  it('renders with default props', () => {
    const el = EmptyState({});
    expect(el).not.toBeNull();
    expect(el.type).toBe('div');
  });

  it('renders with icon', () => {
    const el = EmptyState({ icon: '📭' });
    expect(el).not.toBeNull();
  });

  it('renders with title', () => {
    const el = EmptyState({ title: 'No items found' });
    expect(el).not.toBeNull();
  });

  it('renders with description', () => {
    const el = EmptyState({ description: 'Try adjusting your filters' });
    expect(el).not.toBeNull();
  });

  it('renders with all props', () => {
    const onClick = vi.fn();
    const el = EmptyState({
      icon: '🔍',
      title: 'No results',
      description: 'Try a different search',
      action: { label: 'Clear filters', onClick },
    });
    expect(el).not.toBeNull();
  });

  it('renders with image', () => {
    const el = EmptyState({ image: 'https://example.com/empty.svg', title: 'Empty' });
    expect(el).not.toBeNull();
  });

  it('renders with action button', () => {
    const onClick = vi.fn();
    const el = EmptyState({ action: { label: 'Create new', onClick } });
    expect(el).not.toBeNull();
  });
});

// ---------------------------------------------------------------------------
// Sad-path tests
// ---------------------------------------------------------------------------

describe('EmptyState — sad path', () => {
  it('renders with no props at all', () => {
    const el = EmptyState({});
    expect(el).not.toBeNull();
    expect(el.type).toBe('div');
  });

  it('handles undefined icon', () => {
    const el = EmptyState({ icon: undefined });
    expect(el).not.toBeNull();
  });

  it('handles empty string title', () => {
    const el = EmptyState({ title: '' });
    expect(el).not.toBeNull();
  });

  it('handles empty string description', () => {
    const el = EmptyState({ description: '' });
    expect(el).not.toBeNull();
  });
});

// ---------------------------------------------------------------------------
// Interaction tests
// ---------------------------------------------------------------------------

describe('EmptyState — interaction', () => {
  it('action button has correct label', () => {
    const onClick = vi.fn();
    const el = EmptyState({ action: { label: 'Add item', onClick } });
    // Find button child
    const button = (Array.isArray(el.props.children) ? el.props.children : [el.props.children]).find((c: any) => c && c.type === 'button');
    expect(button).toBeDefined();
    expect(button.props.children).toContain('Add item');
  });

  it('renders image element when image prop provided', () => {
    const el = EmptyState({ image: 'https://example.com/img.png' });
    const img = (Array.isArray(el.props.children) ? el.props.children : [el.props.children]).find((c: any) => c && c.type === 'img');
    expect(img).toBeDefined();
    expect(img.props.src).toBe('https://example.com/img.png');
  });

  it('does not render image when not provided', () => {
    const el = EmptyState({ title: 'Empty' });
    const img = (Array.isArray(el.props.children) ? el.props.children : [el.props.children]).find((c: any) => c && c.type === 'img');
    expect(img).toBeFalsy();
  });
});
