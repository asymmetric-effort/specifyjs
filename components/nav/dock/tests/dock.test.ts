// (c) 2025-2026 Asymmetric Effort, LLC. MIT LICENSE
// SPDX-License-Identifier: MIT

import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { createElement } from '../../../../core/src/index';
import { installMockDispatcher, teardownMockDispatcher } from '../../../_test-helpers/mock-dispatcher';
import { Dock } from '../src/index';
import type { DockProps, DockItem } from '../src/index';

beforeEach(() => { installMockDispatcher(); });
afterEach(() => { teardownMockDispatcher(); });

// -- Fixtures ---------------------------------------------------------------

const sampleItems: DockItem[] = [
  { id: 'files', icon: 'F', label: 'Files', active: true },
  { id: 'terminal', icon: 'T', label: 'Terminal' },
  { id: 'mail', icon: 'M', label: 'Mail', badge: 3 },
];

const disabledItem: DockItem = { id: 'disabled', icon: 'D', label: 'Disabled App', disabled: true };

const imageIconItem: DockItem = { id: 'browser', icon: 'https://example.com/icon.png', label: 'Browser' };
const relativeImageItem: DockItem = { id: 'editor', icon: '/icons/editor.svg', label: 'Editor' };
const dotImageItem: DockItem = { id: 'calc', icon: './icons/calc.png', label: 'Calculator' };

const highBadgeItem: DockItem = { id: 'chat', icon: 'C', label: 'Chat', badge: 150 };
const zeroBadgeItem: DockItem = { id: 'notes', icon: 'N', label: 'Notes', badge: 0 };
const exactBadgeItem: DockItem = { id: 'exact', icon: 'E', label: 'Exact', badge: 99 };

// -- Helper to find child nodes recursively ---------------------------------

function findProps(node: any, predicate: (p: any) => boolean): any[] {
  const results: any[] = [];
  const stack: any[] = [node];
  while (stack.length > 0) {
    const current = stack.pop();
    if (current == null || typeof current !== 'object') continue;
    if (current.props && predicate(current.props)) {
      results.push(current);
    }
    if (current.props?.children) {
      const c = current.props.children;
      if (Array.isArray(c)) {
        for (let i = c.length - 1; i >= 0; i--) stack.push(c[i]);
      } else {
        stack.push(c);
      }
    }
  }
  return results;
}

function findByRole(node: any, role: string): any[] {
  return findProps(node, (p) => p.role === role);
}

function findByTag(node: any, tag: string): any[] {
  const results: any[] = [];
  const stack: any[] = [node];
  while (stack.length > 0) {
    const current = stack.pop();
    if (current == null || typeof current !== 'object') continue;
    if (current.type === tag) results.push(current);
    if (current.props?.children) {
      const c = current.props.children;
      if (Array.isArray(c)) {
        for (let i = c.length - 1; i >= 0; i--) stack.push(c[i]);
      } else {
        stack.push(c);
      }
    }
  }
  return results;
}

function getTextContent(node: any): string {
  if (node == null) return '';
  if (typeof node === 'string') return node;
  if (typeof node === 'number') return String(node);
  let text = '';
  if (node.props?.children) {
    const c = node.props.children;
    if (Array.isArray(c)) {
      for (const child of c) text += getTextContent(child);
    } else {
      text += getTextContent(c);
    }
  }
  return text;
}

// -- Tests ------------------------------------------------------------------

describe('Dock', () => {
  // -- Container / ARIA structure -------------------------------------------

  describe('container structure', () => {
    it('renders with role="toolbar"', () => {
      const el = Dock({ items: sampleItems });
      expect(el).not.toBeNull();
      expect(el.props.role).toBe('toolbar');
    });

    it('has aria-label "Application launcher"', () => {
      const el = Dock({ items: sampleItems });
      expect(el.props['aria-label']).toBe('Application launcher');
    });

    it('has aria-orientation matching orientation prop', () => {
      const v = Dock({ items: sampleItems, orientation: 'vertical' });
      expect(v.props['aria-orientation']).toBe('vertical');
      const h = Dock({ items: sampleItems, orientation: 'horizontal' });
      expect(h.props['aria-orientation']).toBe('horizontal');
    });

    it('defaults to vertical orientation', () => {
      const el = Dock({ items: sampleItems });
      expect(el.props['aria-orientation']).toBe('vertical');
      expect(el.props.style.flexDirection).toBe('column');
    });

    it('uses row flex direction for horizontal orientation', () => {
      const el = Dock({ items: sampleItems, orientation: 'horizontal' });
      expect(el.props.style.flexDirection).toBe('row');
    });

    it('defaults position to left', () => {
      const el = Dock({ items: sampleItems });
      // no transform when not auto-hiding
      expect(el.props.style.transform).toBeUndefined();
    });
  });

  // -- Item rendering -------------------------------------------------------

  describe('item rendering', () => {
    it('renders a button for each item', () => {
      const el = Dock({ items: sampleItems });
      const buttons = findByRole(el, 'button');
      expect(buttons.length).toBe(sampleItems.length);
    });

    it('renders empty dock with no items', () => {
      const el = Dock({ items: [] });
      const buttons = findByRole(el, 'button');
      expect(buttons.length).toBe(0);
    });

    it('renders single item', () => {
      const el = Dock({ items: [sampleItems[0]] });
      const buttons = findByRole(el, 'button');
      expect(buttons.length).toBe(1);
    });
  });

  // -- Icon rendering -------------------------------------------------------

  describe('icon rendering', () => {
    it('renders text/emoji icons as span', () => {
      const el = Dock({ items: [sampleItems[0]] });
      const text = getTextContent(el);
      expect(text).toContain('F');
    });

    it('renders http URL icons as img elements', () => {
      const el = Dock({ items: [imageIconItem] });
      const imgs = findByTag(el, 'img');
      expect(imgs.length).toBe(1);
      expect(imgs[0].props.src).toBe('https://example.com/icon.png');
      expect(imgs[0].props.alt).toBe('Browser');
    });

    it('renders absolute path icons as img elements', () => {
      const el = Dock({ items: [relativeImageItem] });
      const imgs = findByTag(el, 'img');
      expect(imgs.length).toBe(1);
      expect(imgs[0].props.src).toBe('/icons/editor.svg');
    });

    it('renders dot-relative path icons as img elements', () => {
      const el = Dock({ items: [dotImageItem] });
      const imgs = findByTag(el, 'img');
      expect(imgs.length).toBe(1);
      expect(imgs[0].props.src).toBe('./icons/calc.png');
    });

    it('uses iconSize for icon dimensions', () => {
      const el = Dock({ items: [imageIconItem], iconSize: 48 });
      const imgs = findByTag(el, 'img');
      expect(imgs[0].props.style.width).toBe('48px');
      expect(imgs[0].props.style.height).toBe('48px');
    });

    it('defaults iconSize to 36', () => {
      const el = Dock({ items: [imageIconItem] });
      const imgs = findByTag(el, 'img');
      expect(imgs[0].props.style.width).toBe('36px');
      expect(imgs[0].props.style.height).toBe('36px');
    });

    it('text icon container uses iconSize', () => {
      const el = Dock({ items: [sampleItems[0]], iconSize: 50 });
      // The span containing the text icon should have the size
      const spans = findProps(el, (p) => p.style?.width === '50px' && p.style?.height === '50px' && p['aria-hidden'] === 'true');
      expect(spans.length).toBeGreaterThan(0);
    });
  });

  // -- Badges ---------------------------------------------------------------

  describe('badges', () => {
    it('renders badge with count', () => {
      const el = Dock({ items: [sampleItems[2]] }); // mail, badge: 3
      const text = getTextContent(el);
      expect(text).toContain('3');
    });

    it('caps badge at 99+', () => {
      const el = Dock({ items: [highBadgeItem] }); // badge: 150
      const text = getTextContent(el);
      expect(text).toContain('99+');
      expect(text).not.toContain('150');
    });

    it('does not render badge when count is 0', () => {
      const el = Dock({ items: [zeroBadgeItem] });
      // Find badge spans (bg color indicator)
      const badges = findProps(el, (p) => p['aria-hidden'] === 'true' && p.style?.borderRadius === '7px');
      expect(badges.length).toBe(0);
    });

    it('renders badge at exactly 99 without plus', () => {
      const el = Dock({ items: [exactBadgeItem] });
      const text = getTextContent(el);
      expect(text).toContain('99');
      expect(text).not.toContain('99+');
    });

    it('does not render badge when badge is undefined', () => {
      const el = Dock({ items: [sampleItems[1]] }); // terminal, no badge
      const badges = findProps(el, (p) => p['aria-hidden'] === 'true' && p.style?.borderRadius === '7px');
      expect(badges.length).toBe(0);
    });

    it('badge aria-label includes unread count', () => {
      const el = Dock({ items: [sampleItems[2]] }); // mail, badge: 3
      const buttons = findByRole(el, 'button');
      const mailButton = buttons.find((b: any) => b.props['data-dock-item-id'] === 'mail');
      expect(mailButton).toBeTruthy();
      expect(mailButton.props['aria-label']).toBe('Mail, 3 unread');
    });

    it('aria-label has no unread text when badge is absent', () => {
      const el = Dock({ items: [sampleItems[1]] }); // terminal, no badge
      const buttons = findByRole(el, 'button');
      const termButton = buttons.find((b: any) => b.props['data-dock-item-id'] === 'terminal');
      expect(termButton.props['aria-label']).toBe('Terminal');
    });
  });

  // -- Active indicators ----------------------------------------------------

  describe('active indicators', () => {
    it('renders active dot for active items', () => {
      const el = Dock({ items: [sampleItems[0]] }); // files, active: true
      // active dot: a span with borderRadius 50%
      const dots = findProps(el, (p) => p['aria-hidden'] === 'true' && p.style?.borderRadius === '50%');
      expect(dots.length).toBe(1);
    });

    it('does not render active dot for inactive items', () => {
      const el = Dock({ items: [sampleItems[1]] }); // terminal, not active
      const dots = findProps(el, (p) => p['aria-hidden'] === 'true' && p.style?.borderRadius === '50%');
      expect(dots.length).toBe(0);
    });

    it('sets aria-pressed="true" for active items', () => {
      const el = Dock({ items: [sampleItems[0]] }); // files, active: true
      const buttons = findByRole(el, 'button');
      expect(buttons[0].props['aria-pressed']).toBe('true');
    });

    it('sets aria-pressed="false" for inactive items', () => {
      const el = Dock({ items: [sampleItems[1]] }); // terminal
      const buttons = findByRole(el, 'button');
      expect(buttons[0].props['aria-pressed']).toBe('false');
    });

    it('active dot is on left edge for vertical left position', () => {
      const el = Dock({ items: [sampleItems[0]], position: 'left' });
      const dots = findProps(el, (p) => p['aria-hidden'] === 'true' && p.style?.borderRadius === '50%');
      expect(dots[0].props.style.left).toBe('0');
    });

    it('active dot is on right edge for vertical right position', () => {
      const el = Dock({ items: [sampleItems[0]], position: 'right' });
      const dots = findProps(el, (p) => p['aria-hidden'] === 'true' && p.style?.borderRadius === '50%');
      expect(dots[0].props.style.right).toBe('0');
    });

    it('active dot is on bottom edge for horizontal top position', () => {
      const el = Dock({ items: [sampleItems[0]], orientation: 'horizontal', position: 'top' });
      const dots = findProps(el, (p) => p['aria-hidden'] === 'true' && p.style?.borderRadius === '50%');
      expect(dots[0].props.style.bottom).toBe('0');
    });

    it('active dot is on top edge for horizontal bottom position', () => {
      const el = Dock({ items: [sampleItems[0]], orientation: 'horizontal', position: 'bottom' });
      const dots = findProps(el, (p) => p['aria-hidden'] === 'true' && p.style?.borderRadius === '50%');
      expect(dots[0].props.style.top).toBe('0');
    });
  });

  // -- Disabled state -------------------------------------------------------

  describe('disabled state', () => {
    it('renders disabled item with reduced opacity', () => {
      const el = Dock({ items: [disabledItem] });
      const buttons = findByRole(el, 'button');
      expect(buttons[0].props.style.opacity).toBe('0.4');
    });

    it('sets pointer-events none on disabled items', () => {
      const el = Dock({ items: [disabledItem] });
      const buttons = findByRole(el, 'button');
      expect(buttons[0].props.style.pointerEvents).toBe('none');
    });

    it('sets aria-disabled="true" on disabled items', () => {
      const el = Dock({ items: [disabledItem] });
      const buttons = findByRole(el, 'button');
      expect(buttons[0].props['aria-disabled']).toBe('true');
    });

    it('sets tabIndex to -1 on disabled items', () => {
      const el = Dock({ items: [disabledItem] });
      const buttons = findByRole(el, 'button');
      expect(buttons[0].props.tabIndex).toBe(-1);
    });

    it('does not set aria-disabled on enabled items', () => {
      const el = Dock({ items: [sampleItems[0]] });
      const buttons = findByRole(el, 'button');
      expect(buttons[0].props['aria-disabled']).toBeUndefined();
    });

    it('sets tabIndex to 0 on enabled items', () => {
      const el = Dock({ items: [sampleItems[0]] });
      const buttons = findByRole(el, 'button');
      expect(buttons[0].props.tabIndex).toBe(0);
    });

    it('enabled items have full opacity', () => {
      const el = Dock({ items: [sampleItems[0]] });
      const buttons = findByRole(el, 'button');
      expect(buttons[0].props.style.opacity).toBe('1');
    });
  });

  // -- Orientation and position ---------------------------------------------

  describe('orientation and position', () => {
    it('vertical orientation uses column flex direction', () => {
      const el = Dock({ items: sampleItems, orientation: 'vertical' });
      expect(el.props.style.flexDirection).toBe('column');
    });

    it('horizontal orientation uses row flex direction', () => {
      const el = Dock({ items: sampleItems, orientation: 'horizontal' });
      expect(el.props.style.flexDirection).toBe('row');
    });

    it('supports all four positions without error', () => {
      const positions: Array<'left' | 'right' | 'top' | 'bottom'> = ['left', 'right', 'top', 'bottom'];
      for (const pos of positions) {
        const el = Dock({ items: sampleItems, position: pos });
        expect(el).not.toBeNull();
        expect(el.props.role).toBe('toolbar');
      }
    });
  });

  // -- Auto-hide behavior ---------------------------------------------------

  describe('auto-hide', () => {
    it('when autoHide=false, does not apply hide transform', () => {
      const el = Dock({ items: sampleItems, autoHide: false });
      expect(el.props.style.transform).toBeUndefined();
      expect(el.props.style.opacity).toBeUndefined();
    });

    it('when autoHide=true, applies translateX(-100%) for left position', () => {
      const el = Dock({ items: sampleItems, autoHide: true, position: 'left' });
      expect(el.props.style.transform).toBe('translateX(-100%)');
      expect(el.props.style.opacity).toBe('0');
    });

    it('when autoHide=true, applies translateX(100%) for right position', () => {
      const el = Dock({ items: sampleItems, autoHide: true, position: 'right' });
      expect(el.props.style.transform).toBe('translateX(100%)');
    });

    it('when autoHide=true, applies translateY(-100%) for top position', () => {
      const el = Dock({ items: sampleItems, autoHide: true, position: 'top' });
      expect(el.props.style.transform).toBe('translateY(-100%)');
    });

    it('when autoHide=true, applies translateY(100%) for bottom position', () => {
      const el = Dock({ items: sampleItems, autoHide: true, position: 'bottom' });
      expect(el.props.style.transform).toBe('translateY(100%)');
    });

    it('renders trigger strip when auto-hidden (left)', () => {
      const el = Dock({ items: sampleItems, autoHide: true, position: 'left' });
      const triggers = findProps(el, (p) => p['aria-hidden'] === 'true' && p.style?.width === '4px' && p.style?.position === 'absolute');
      expect(triggers.length).toBe(1);
    });

    it('renders trigger strip when auto-hidden (right)', () => {
      const el = Dock({ items: sampleItems, autoHide: true, position: 'right' });
      const triggers = findProps(el, (p) => p['aria-hidden'] === 'true' && p.style?.width === '4px' && p.style?.position === 'absolute');
      expect(triggers.length).toBe(1);
    });

    it('renders trigger strip when auto-hidden (top)', () => {
      const el = Dock({ items: sampleItems, autoHide: true, position: 'top' });
      const triggers = findProps(el, (p) => p['aria-hidden'] === 'true' && p.style?.height === '4px' && p.style?.position === 'absolute');
      expect(triggers.length).toBe(1);
    });

    it('renders trigger strip when auto-hidden (bottom)', () => {
      const el = Dock({ items: sampleItems, autoHide: true, position: 'bottom' });
      const triggers = findProps(el, (p) => p['aria-hidden'] === 'true' && p.style?.height === '4px' && p.style?.position === 'absolute');
      expect(triggers.length).toBe(1);
    });

    it('defaults autoHide to false', () => {
      const el = Dock({ items: sampleItems });
      expect(el.props.style.transform).toBeUndefined();
    });
  });

  // -- Trailing separator ---------------------------------------------------

  describe('trailing separator', () => {
    it('renders separator when showTrailingSeparator=true and more than one item', () => {
      const el = Dock({ items: sampleItems, showTrailingSeparator: true });
      const seps = findByRole(el, 'separator');
      expect(seps.length).toBe(1);
    });

    it('does not render separator when showTrailingSeparator=false', () => {
      const el = Dock({ items: sampleItems, showTrailingSeparator: false });
      const seps = findByRole(el, 'separator');
      expect(seps.length).toBe(0);
    });

    it('does not render separator with single item', () => {
      const el = Dock({ items: [sampleItems[0]], showTrailingSeparator: true });
      const seps = findByRole(el, 'separator');
      expect(seps.length).toBe(0);
    });

    it('separator is vertical line for vertical orientation', () => {
      const el = Dock({ items: sampleItems, showTrailingSeparator: true, orientation: 'vertical' });
      const seps = findByRole(el, 'separator');
      expect(seps[0].props.style.height).toBe('1px');
      expect(seps[0].props.style.width).toBe('60%');
    });

    it('separator is horizontal line for horizontal orientation', () => {
      const el = Dock({ items: sampleItems, showTrailingSeparator: true, orientation: 'horizontal' });
      const seps = findByRole(el, 'separator');
      expect(seps[0].props.style.width).toBe('1px');
      expect(seps[0].props.style.height).toBe('60%');
    });

    it('defaults showTrailingSeparator to false', () => {
      const el = Dock({ items: sampleItems });
      const seps = findByRole(el, 'separator');
      expect(seps.length).toBe(0);
    });
  });

  // -- Event handlers -------------------------------------------------------

  describe('event handlers', () => {
    it('provides onClick handler on item buttons', () => {
      const handler = () => {};
      const el = Dock({ items: sampleItems, onItemClick: handler });
      const buttons = findByRole(el, 'button');
      expect(buttons[0].props.onClick).toBeDefined();
      expect(typeof buttons[0].props.onClick).toBe('function');
    });

    it('provides onContextMenu handler on item buttons', () => {
      const handler = () => {};
      const el = Dock({ items: sampleItems, onItemContextMenu: handler });
      const buttons = findByRole(el, 'button');
      expect(buttons[0].props.onContextMenu).toBeDefined();
      expect(typeof buttons[0].props.onContextMenu).toBe('function');
    });

    it('has onMouseEnter and onMouseLeave on container for auto-hide', () => {
      const el = Dock({ items: sampleItems, autoHide: true });
      expect(typeof el.props.onMouseEnter).toBe('function');
      expect(typeof el.props.onMouseLeave).toBe('function');
    });

    it('has onKeyDown on container for keyboard navigation', () => {
      const el = Dock({ items: sampleItems });
      expect(typeof el.props.onKeyDown).toBe('function');
    });
  });

  // -- Children prop --------------------------------------------------------

  describe('children prop', () => {
    it('renders children at end of dock', () => {
      const child = createElement('div', { 'data-testid': 'custom-child' }, 'Apps');
      const el = Dock({ items: sampleItems, children: child });
      const text = getTextContent(el);
      expect(text).toContain('Apps');
    });

    it('works without children', () => {
      const el = Dock({ items: sampleItems });
      expect(el).not.toBeNull();
    });
  });

  // -- Styling --------------------------------------------------------------

  describe('styling', () => {
    it('uses CSS custom property for background', () => {
      const el = Dock({ items: sampleItems });
      expect(el.props.style.backgroundColor).toContain('var(--dock-bg');
    });

    it('uses CSS custom property for border', () => {
      const el = Dock({ items: sampleItems });
      expect(el.props.style.border).toContain('var(--dock-border');
    });

    it('has 200ms transition for auto-hide animation', () => {
      const el = Dock({ items: sampleItems });
      expect(el.props.style.transition).toContain('200ms');
    });

    it('item buttons have border-radius', () => {
      const el = Dock({ items: sampleItems });
      const buttons = findByRole(el, 'button');
      expect(buttons[0].props.style.borderRadius).toBe('8px');
    });
  });

  // -- Keyboard navigation --------------------------------------------------

  describe('keyboard navigation', () => {
    it('item buttons are focusable (tabIndex=0)', () => {
      const el = Dock({ items: sampleItems });
      const buttons = findByRole(el, 'button');
      for (const btn of buttons) {
        if (!btn.props['aria-disabled']) {
          expect(btn.props.tabIndex).toBe(0);
        }
      }
    });

    it('each item has data-dock-item-id for keyboard navigation targeting', () => {
      const el = Dock({ items: sampleItems });
      const buttons = findByRole(el, 'button');
      expect(buttons[0].props['data-dock-item-id']).toBe('files');
      expect(buttons[1].props['data-dock-item-id']).toBe('terminal');
      expect(buttons[2].props['data-dock-item-id']).toBe('mail');
    });
  });

  // -- Accessibility --------------------------------------------------------

  describe('accessibility', () => {
    it('each item has aria-label with its label text', () => {
      const el = Dock({ items: [sampleItems[1]] }); // terminal
      const buttons = findByRole(el, 'button');
      expect(buttons[0].props['aria-label']).toBe('Terminal');
    });

    it('badged item aria-label includes unread count', () => {
      const el = Dock({ items: [sampleItems[2]] }); // mail, badge: 3
      const buttons = findByRole(el, 'button');
      expect(buttons[0].props['aria-label']).toBe('Mail, 3 unread');
    });

    it('high badge count aria-label uses actual count', () => {
      const el = Dock({ items: [highBadgeItem] }); // badge: 150
      const buttons = findByRole(el, 'button');
      expect(buttons[0].props['aria-label']).toBe('Chat, 150 unread');
    });

    it('zero badge item has plain label', () => {
      const el = Dock({ items: [zeroBadgeItem] }); // badge: 0
      const buttons = findByRole(el, 'button');
      expect(buttons[0].props['aria-label']).toBe('Notes');
    });

    it('img icons have alt text', () => {
      const el = Dock({ items: [imageIconItem] });
      const imgs = findByTag(el, 'img');
      expect(imgs[0].props.alt).toBe('Browser');
    });

    it('text icon spans are aria-hidden', () => {
      const el = Dock({ items: [sampleItems[0]] }); // files, text icon 'F'
      const hiddenSpans = findProps(el, (p) => p['aria-hidden'] === 'true' && p.style?.display === 'flex');
      expect(hiddenSpans.length).toBeGreaterThan(0);
    });

    it('badge elements are aria-hidden', () => {
      const el = Dock({ items: [sampleItems[2]] });
      const badges = findProps(el, (p) => p['aria-hidden'] === 'true' && p.style?.borderRadius === '7px');
      expect(badges.length).toBe(1);
    });

    it('active dot is aria-hidden', () => {
      const el = Dock({ items: [sampleItems[0]] }); // active
      const dots = findProps(el, (p) => p['aria-hidden'] === 'true' && p.style?.borderRadius === '50%');
      expect(dots.length).toBe(1);
    });
  });

  // -- Edge cases -----------------------------------------------------------

  describe('edge cases', () => {
    it('handles items with both active and badge', () => {
      const item: DockItem = { id: 'combo', icon: 'X', label: 'Combo', active: true, badge: 5 };
      const el = Dock({ items: [item] });
      const dots = findProps(el, (p) => p['aria-hidden'] === 'true' && p.style?.borderRadius === '50%');
      expect(dots.length).toBe(1); // active dot
      const text = getTextContent(el);
      expect(text).toContain('5'); // badge
    });

    it('handles items with both disabled and active', () => {
      const item: DockItem = { id: 'da', icon: 'X', label: 'DisabledActive', active: true, disabled: true };
      const el = Dock({ items: [item] });
      const buttons = findByRole(el, 'button');
      expect(buttons[0].props['aria-disabled']).toBe('true');
      expect(buttons[0].props['aria-pressed']).toBe('true');
    });

    it('handles items with disabled and badge', () => {
      const item: DockItem = { id: 'db', icon: 'X', label: 'DisabledBadge', badge: 7, disabled: true };
      const el = Dock({ items: [item] });
      const buttons = findByRole(el, 'button');
      expect(buttons[0].props.style.opacity).toBe('0.4');
      const text = getTextContent(el);
      expect(text).toContain('7');
    });

    it('handles many items', () => {
      const manyItems: DockItem[] = [];
      for (let i = 0; i < 20; i++) {
        manyItems.push({ id: `item-${i}`, icon: String(i % 10), label: `Item ${i}` });
      }
      const el = Dock({ items: manyItems });
      const buttons = findByRole(el, 'button');
      expect(buttons.length).toBe(20);
    });

    it('trailing separator with two items renders separator', () => {
      const twoItems = [sampleItems[0], sampleItems[1]];
      const el = Dock({ items: twoItems, showTrailingSeparator: true });
      const seps = findByRole(el, 'separator');
      expect(seps.length).toBe(1);
    });

    it('badge of exactly 1 renders as "1"', () => {
      const item: DockItem = { id: 'one', icon: 'O', label: 'One', badge: 1 };
      const el = Dock({ items: [item] });
      const text = getTextContent(el);
      expect(text).toContain('1');
    });
  });

  // -- Default props --------------------------------------------------------

  describe('default props', () => {
    it('defaults orientation to vertical', () => {
      const el = Dock({ items: sampleItems });
      expect(el.props['aria-orientation']).toBe('vertical');
    });

    it('defaults iconSize to 36', () => {
      const el = Dock({ items: [imageIconItem] });
      const imgs = findByTag(el, 'img');
      expect(imgs[0].props.style.width).toBe('36px');
    });

    it('defaults autoHide to false', () => {
      const el = Dock({ items: sampleItems });
      // Should not have hide transform
      expect(el.props.style.opacity).toBeUndefined();
    });

    it('defaults showTrailingSeparator to false', () => {
      const el = Dock({ items: sampleItems });
      const seps = findByRole(el, 'separator');
      expect(seps.length).toBe(0);
    });
  });
});
