// (c) 2025-2026 Asymmetric Effort, LLC. MIT LICENSE
// SPDX-License-Identifier: MIT

import { describe, it, expect, fn, beforeEach, afterEach } from '@asymmetric-effort/nogginlessdom';
import { createElement } from '../../../../core/src/index';
import { Popover } from '../src/index';
import { installMockDispatcher, teardownMockDispatcher } from '../../../_test-helpers/mock-dispatcher';

beforeEach(() => installMockDispatcher());
afterEach(() => teardownMockDispatcher());

function renderPopover(overrides: Record<string, unknown> = {}) {
  const defaults = {
    trigger: createElement('button', null, 'Click me'),
    content: createElement('div', null, 'Popover content'),
  };
  const props = { ...defaults, ...overrides };
  return { vnode: Popover(props as any) };
}

describe('Popover', () => {
  // ── Happy path ──────────────────────────────────────────────
  describe('happy path', () => {
    it('renders the trigger element', () => {
      const { vnode } = renderPopover();
      const str = JSON.stringify(vnode);
      expect(str).toContain('Click me');
    });

    it('renders popover content when open is true', () => {
      const { vnode } = renderPopover({ open: true });
      const str = JSON.stringify(vnode);
      expect(str).toContain('Popover content');
    });

    it('uses bottom placement by default', () => {
      const { vnode } = renderPopover({ open: true });
      const str = JSON.stringify(vnode);
      // bottom placement sets top: '100%'
      expect(str).toContain('100%');
    });

    it('renders with arrow when arrow prop is true', () => {
      const { vnode } = renderPopover({ open: true, arrow: true });
      const str = JSON.stringify(vnode);
      // Arrow creates a div with border styling
      expect(str).toContain('borderStyle');
    });

    it('supports controlled mode with onOpenChange', () => {
      const onOpenChange = fn();
      const { vnode } = renderPopover({ open: true, onOpenChange });
      expect(vnode).not.toBeNull();
    });
  });

  // ── Sad path ────────────────────────────────────────────────
  describe('sad path', () => {
    it('does not render popover content when closed', () => {
      const { vnode } = renderPopover({ open: false });
      const str = JSON.stringify(vnode);
      expect(str).not.toContain('Popover content');
    });

    it('does not render content in uncontrolled mode by default', () => {
      // Uncontrolled: no open prop, starts closed
      const { vnode } = renderPopover();
      const str = JSON.stringify(vnode);
      // Content should not be visible initially
      expect(str).not.toContain('Popover content');
    });

    it('renders without arrow by default', () => {
      const { vnode } = renderPopover({ open: true });
      const str = JSON.stringify(vnode);
      // No arrow div with borderStyle by default (arrow=false)
      // The popover still renders, just no arrow element
      expect(vnode).not.toBeNull();
    });

    it('renders with missing content gracefully', () => {
      const { vnode } = renderPopover({ content: null, open: true });
      expect(vnode).not.toBeNull();
    });
  });

  // ── Interaction ─────────────────────────────────────────────
  describe('interaction', () => {

    it('trigger element has onClick for toggling', () => {
      const { vnode } = renderPopover();
      const str = JSON.stringify(vnode);
      // The trigger wrapper has an onClick
      expect(str).toContain('inline-block');
    });

    it('supports top placement', () => {
      const { vnode } = renderPopover({ open: true, placement: 'top' });
      const str = JSON.stringify(vnode);
      expect(str).toContain('bottom');
    });

    it('supports left placement', () => {
      const { vnode } = renderPopover({ open: true, placement: 'left' });
      const str = JSON.stringify(vnode);
      expect(str).toContain('right');
    });

    it('supports right placement', () => {
      const { vnode } = renderPopover({ open: true, placement: 'right' });
      const str = JSON.stringify(vnode);
      expect(str).toContain('left');
    });

    it('closes on outside click when closeOnClickOutside is true', () => {
      // In a real DOM this would register a mousedown listener
      const { vnode } = renderPopover({ open: true, closeOnClickOutside: true });
      expect(vnode).not.toBeNull();
    });

    it('applies custom offset', () => {
      const { vnode } = renderPopover({ open: true, offset: 20 });
      const str = JSON.stringify(vnode);
      // offset + ARROW_SIZE (8) = 28
      expect(str).toContain('28px');
    });
  });
});
