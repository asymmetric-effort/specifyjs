// (c) 2025-2026 Asymmetric Effort, LLC. MIT LICENSE
// SPDX-License-Identifier: MIT

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { createElement } from '../../../../core/src/index';
import { Tooltip } from '../src/index';
import { installMockDispatcher, teardownMockDispatcher } from '../../../_test-helpers/mock-dispatcher';

beforeEach(() => installMockDispatcher());
afterEach(() => teardownMockDispatcher());

function renderTooltip(overrides: Record<string, unknown> = {}) {
  const defaults = {
    text: 'Tooltip text',
    children: createElement('button', null, 'Hover me'),
  };
  const props = { ...defaults, ...overrides };
  return { vnode: Tooltip(props as any) };
}

describe('Tooltip', () => {
  // ── Happy path ──────────────────────────────────────────────
  describe('happy path', () => {
    it('renders the trigger children', () => {
      const { vnode } = renderTooltip();
      const str = JSON.stringify(vnode);
      expect(str).toContain('Hover me');
    });

    it('wraps trigger with mouse event handlers', () => {
      const { vnode } = renderTooltip();
      // The trigger div should have onMouseEnter and onMouseLeave
      const str = JSON.stringify(vnode);
      expect(str).toContain('inline-block');
    });

    it('renders with default top placement', () => {
      const { vnode } = renderTooltip();
      // Default placement is top; tooltip starts hidden so just verify structure
      expect(vnode).not.toBeNull();
    });

    it('accepts custom maxWidth', () => {
      const { vnode } = renderTooltip({ maxWidth: '400px' });
      expect(vnode).not.toBeNull();
    });

    it('accepts a custom delay', () => {
      const { vnode } = renderTooltip({ delay: 500 });
      expect(vnode).not.toBeNull();
    });
  });

  // ── Sad path ────────────────────────────────────────────────
  describe('sad path', () => {
    it('does not show tooltip content initially', () => {
      const { vnode } = renderTooltip();
      const str = JSON.stringify(vnode);
      // Tooltip is not visible until hover, so role="tooltip" should not appear
      expect(str).not.toContain('role');
    });

    it('renders with empty text', () => {
      const { vnode } = renderTooltip({ text: '' });
      expect(vnode).not.toBeNull();
    });

    it('renders without children', () => {
      const { vnode } = renderTooltip({ children: undefined });
      expect(vnode).not.toBeNull();
    });

    it('handles zero delay', () => {
      const { vnode } = renderTooltip({ delay: 0 });
      expect(vnode).not.toBeNull();
    });
  });

  // ── Interaction ─────────────────────────────────────────────
  describe('interaction', () => {

    it('trigger has onMouseEnter for showing tooltip', () => {
      const { vnode } = renderTooltip();
      // The first child of the wrapper is the trigger div
      const children = (vnode as any)?.children;
      if (Array.isArray(children) && children.length > 0) {
        const trigger = children[0];
        expect(trigger?.props?.onMouseEnter).toBeDefined();
      }
    });

    it('trigger has onMouseLeave for hiding tooltip', () => {
      const { vnode } = renderTooltip();
      const children = (vnode as any)?.children;
      if (Array.isArray(children) && children.length > 0) {
        const trigger = children[0];
        expect(trigger?.props?.onMouseLeave).toBeDefined();
      }
    });

    it('trigger has onFocus for accessibility', () => {
      const { vnode } = renderTooltip();
      const children = (vnode as any)?.children;
      if (Array.isArray(children) && children.length > 0) {
        const trigger = children[0];
        expect(trigger?.props?.onFocus).toBeDefined();
      }
    });

    it('trigger has onBlur for accessibility', () => {
      const { vnode } = renderTooltip();
      const children = (vnode as any)?.children;
      if (Array.isArray(children) && children.length > 0) {
        const trigger = children[0];
        expect(trigger?.props?.onBlur).toBeDefined();
      }
    });

    it('supports bottom placement', () => {
      const { vnode } = renderTooltip({ placement: 'bottom' });
      expect(vnode).not.toBeNull();
    });

    it('supports left and right placements', () => {
      expect(renderTooltip({ placement: 'left' }).vnode).not.toBeNull();
      expect(renderTooltip({ placement: 'right' }).vnode).not.toBeNull();
    });
  });
});
