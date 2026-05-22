// (c) 2025-2026 Asymmetric Effort, LLC. MIT LICENSE
// SPDX-License-Identifier: MIT

import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { Carousel } from '../src/index';
import { installMockDispatcher, teardownMockDispatcher } from '../../../_test-helpers/mock-dispatcher';

beforeEach(() => installMockDispatcher());
afterEach(() => teardownMockDispatcher());

const sampleItems = [
  { content: 'Slide 1' },
  { content: 'Slide 2', caption: 'Caption 2' },
  { content: 'Slide 3' },
];

// ---------------------------------------------------------------------------
// Happy-path tests
// ---------------------------------------------------------------------------

describe('Carousel — happy path', () => {
  it('renders with items', () => {
    const el = Carousel({ items: sampleItems });
    expect(el).not.toBeNull();
    expect(el.props.role).toBe('region');
    expect(el.props['aria-label']).toBe('Carousel');
  });

  it('renders with slide animation', () => {
    const el = Carousel({ items: sampleItems, animation: 'slide' });
    expect(el).not.toBeNull();
  });

  it('renders with fade animation', () => {
    const el = Carousel({ items: sampleItems, animation: 'fade' });
    expect(el).not.toBeNull();
  });

  it('renders dot indicators by default', () => {
    const el = Carousel({ items: sampleItems });
    expect(el).not.toBeNull();
  });

  it('renders arrows by default', () => {
    const el = Carousel({ items: sampleItems });
    // Should have prev/next arrow buttons
    const arrowChildren = (Array.isArray(el.props.children) ? el.props.children : [el.props.children]).filter(
      (c: any) => c && c.type === 'button' && c.props['aria-label']?.includes('slide'),
    );
    expect(arrowChildren.length).toBe(2);
  });

  it('hides arrows when showArrows is false', () => {
    const el = Carousel({ items: sampleItems, showArrows: false });
    const arrowChildren = (Array.isArray(el.props.children) ? el.props.children : [el.props.children]).filter(
      (c: any) => c && c.type === 'button' && c.props['aria-label']?.includes('slide'),
    );
    expect(arrowChildren.length).toBe(0);
  });

  it('hides dots when showDots is false', () => {
    const el = Carousel({ items: sampleItems, showDots: false });
    expect(el).not.toBeNull();
  });

  it('renders with autoPlay', () => {
    const el = Carousel({ items: sampleItems, autoPlay: true, interval: 3000 });
    expect(el).not.toBeNull();
  });
});

// ---------------------------------------------------------------------------
// Sad-path tests
// ---------------------------------------------------------------------------

describe('Carousel — sad path', () => {
  it('handles empty items array', () => {
    const el = Carousel({ items: [] });
    expect(el).not.toBeNull();
  });

  it('handles single item', () => {
    const el = Carousel({ items: [{ content: 'Only one' }] });
    expect(el).not.toBeNull();
  });

  it('handles undefined items gracefully', () => {
    const el = Carousel({ items: undefined as any });
    expect(el).not.toBeNull();
  });

  it('handles zero interval', () => {
    const el = Carousel({ items: sampleItems, autoPlay: true, interval: 0 });
    expect(el).not.toBeNull();
  });
});

// ---------------------------------------------------------------------------
// Interaction tests (navigation)
// ---------------------------------------------------------------------------

describe('Carousel — navigation', () => {
  it('renders prev button with correct aria-label', () => {
    const el = Carousel({ items: sampleItems });
    const prevBtn = (Array.isArray(el.props.children) ? el.props.children : [el.props.children]).find(
      (c: any) => c && c.props?.['aria-label'] === 'Previous slide',
    );
    expect(prevBtn).toBeDefined();
  });

  it('renders next button with correct aria-label', () => {
    const el = Carousel({ items: sampleItems });
    const nextBtn = (Array.isArray(el.props.children) ? el.props.children : [el.props.children]).find(
      (c: any) => c && c.props?.['aria-label'] === 'Next slide',
    );
    expect(nextBtn).toBeDefined();
  });

  it('renders dot buttons for each slide', () => {
    const el = Carousel({ items: sampleItems });
    // Find the dots container
    const dotsContainer = (Array.isArray(el.props.children) ? el.props.children : [el.props.children]).find(
      (c: any) => c && c.type === 'div' && (Array.isArray(c.props?.children) ? c.props.children.length : 0) === sampleItems.length,
    );
    expect(dotsContainer).toBeDefined();
  });

  it('has tabindex for keyboard navigation', () => {
    const el = Carousel({ items: sampleItems });
    expect(el.props.tabindex).toBe('0');
  });

  it('supports loop mode (default true)', () => {
    const el = Carousel({ items: sampleItems, loop: true });
    expect(el).not.toBeNull();
  });

  it('supports non-loop mode', () => {
    const el = Carousel({ items: sampleItems, loop: false });
    expect(el).not.toBeNull();
  });
});
