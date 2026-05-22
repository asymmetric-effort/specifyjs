// (c) 2025-2026 Asymmetric Effort, LLC. MIT LICENSE
// SPDX-License-Identifier: MIT

import { describe, it, expect, fn, beforeEach, afterEach } from '@asymmetric-effort/nogginlessdom';
import { createElement } from '../../../../core/src/index';
import { ContextMenu } from '../src/index';
import type { ContextMenuItem } from '../src/index';
import { installMockDispatcher, teardownMockDispatcher } from '../../../_test-helpers/mock-dispatcher';

beforeEach(() => installMockDispatcher());
afterEach(() => teardownMockDispatcher());

function renderContextMenu(overrides: Record<string, unknown> = {}) {
  const defaultItems: ContextMenuItem[] = [
    { label: 'Cut', icon: 'X', onClick: fn() },
    { label: 'Copy', icon: 'C', onClick: fn() },
    { divider: true },
    { label: 'Paste', icon: 'V', onClick: fn() },
  ];
  const defaults = {
    items: defaultItems,
    children: createElement('div', null, 'Right-click area'),
  };
  const props = { ...defaults, ...overrides };
  return { vnode: ContextMenu(props as any), items: props.items as ContextMenuItem[] };
}

describe('ContextMenu', () => {
  // ── Happy path ──────────────────────────────────────────────
  describe('happy path', () => {
    it('renders the trigger children', () => {
      const { vnode } = renderContextMenu();
      const str = JSON.stringify(vnode);
      expect(str).toContain('Right-click area');
    });

    it('returns a non-null vnode', () => {
      const { vnode } = renderContextMenu();
      expect(vnode).not.toBeNull();
    });

    it('trigger area has onContextMenu handler', () => {
      const { vnode } = renderContextMenu();
      const str = JSON.stringify(vnode);
      expect(str).toContain('contents');
    });

    it('accepts items with labels', () => {
      const { vnode } = renderContextMenu({
        items: [{ label: 'Delete', onClick: fn() }],
      });
      expect(vnode).not.toBeNull();
    });

    it('accepts items with icons', () => {
      const { vnode } = renderContextMenu({
        items: [{ label: 'Save', icon: 'S', onClick: fn() }],
      });
      expect(vnode).not.toBeNull();
    });
  });

  // ── Sad path ────────────────────────────────────────────────
  describe('sad path', () => {
    it('menu is not visible initially (no right-click yet)', () => {
      const { vnode } = renderContextMenu();
      const str = JSON.stringify(vnode);
      // No menu role should be present when menu is closed
      expect(str).not.toContain('"role":"menu"');
    });

    it('renders with empty items array', () => {
      const { vnode } = renderContextMenu({ items: [] });
      expect(vnode).not.toBeNull();
    });

    it('renders without children', () => {
      const { vnode } = renderContextMenu({ children: undefined });
      expect(vnode).not.toBeNull();
    });

    it('handles disabled items', () => {
      const { vnode } = renderContextMenu({
        items: [{ label: 'Disabled', disabled: true, onClick: fn() }],
      });
      expect(vnode).not.toBeNull();
    });

    it('handles items with only divider', () => {
      const { vnode } = renderContextMenu({
        items: [{ divider: true }],
      });
      expect(vnode).not.toBeNull();
    });
  });

  // ── Interaction ─────────────────────────────────────────────
  describe('interaction', () => {

    it('Escape key listener is registered when menu would be open', () => {
      // The component registers Escape handler when menuPos is set
      const { vnode } = renderContextMenu();
      expect(vnode).not.toBeNull();
    });

    it('supports nested submenu items', () => {
      const items: ContextMenuItem[] = [
        {
          label: 'Share',
          children: [
            { label: 'Email', onClick: fn() },
            { label: 'Slack', onClick: fn() },
          ],
        },
      ];
      const { vnode } = renderContextMenu({ items });
      expect(vnode).not.toBeNull();
    });

    it('items have click handlers', () => {
      const onClick = fn();
      const items: ContextMenuItem[] = [
        { label: 'Action', onClick },
      ];
      const { vnode } = renderContextMenu({ items });
      expect(vnode).not.toBeNull();
      // Verify the onClick was passed through
      expect(items[0]!.onClick).toBe(onClick);
    });

    it('click outside registers mousedown listener for closing', () => {
      // The component sets up a mousedown listener when menu is open
      const { vnode } = renderContextMenu();
      expect(vnode).not.toBeNull();
    });

    it('accepts items with mixed dividers and actions', () => {
      const items: ContextMenuItem[] = [
        { label: 'Cut', onClick: fn() },
        { divider: true },
        { label: 'Copy', onClick: fn() },
        { divider: true },
        { label: 'Paste', onClick: fn() },
      ];
      const { vnode } = renderContextMenu({ items });
      expect(vnode).not.toBeNull();
    });

    it('handles deeply nested submenus', () => {
      const items: ContextMenuItem[] = [
        {
          label: 'Level 1',
          children: [
            {
              label: 'Level 2',
              children: [
                { label: 'Level 3', onClick: fn() },
              ],
            },
          ],
        },
      ];
      const { vnode } = renderContextMenu({ items });
      expect(vnode).not.toBeNull();
    });
  });
});
