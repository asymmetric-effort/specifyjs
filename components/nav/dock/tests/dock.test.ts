// (c) 2025-2026 Asymmetric Effort, LLC. MIT LICENSE
// SPDX-License-Identifier: MIT

import { describe, it, expect, beforeEach, afterEach } from '@asymmetric-effort/nogginlessdom';
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

/**
 * Find DockItemComponent elements -- they are function-type elements
 * with an `item` prop containing an object with an `id` field.
 */
function findItemComponents(node: any): any[] {
  return findProps(node, (p) => p.item !== undefined && typeof p.item === 'object' && 'id' in p.item);
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
    it('renders a DockItemComponent for each item', () => {
      const el = Dock({ items: sampleItems });
      const itemComps = findItemComponents(el);
      expect(itemComps.length).toBe(sampleItems.length);
    });

    it('renders empty dock with no items', () => {
      const el = Dock({ items: [] });
      const itemComps = findItemComponents(el);
      expect(itemComps.length).toBe(0);
    });

    it('renders single item', () => {
      const el = Dock({ items: [sampleItems[0]] });
      const itemComps = findItemComponents(el);
      expect(itemComps.length).toBe(1);
    });
  });

  // -- Icon rendering -------------------------------------------------------

  describe('icon rendering', () => {
    it('passes text/emoji icon to item component', () => {
      const el = Dock({ items: [sampleItems[0]] });
      const itemComps = findItemComponents(el);
      expect(itemComps[0].props.item.icon).toBe('F');
    });

    it('passes http URL icon to item component', () => {
      const el = Dock({ items: [imageIconItem] });
      const itemComps = findItemComponents(el);
      expect(itemComps[0].props.item.icon).toBe('https://example.com/icon.png');
    });

    it('passes absolute path icon to item component', () => {
      const el = Dock({ items: [relativeImageItem] });
      const itemComps = findItemComponents(el);
      expect(itemComps[0].props.item.icon).toBe('/icons/editor.svg');
    });

    it('passes dot-relative path icon to item component', () => {
      const el = Dock({ items: [dotImageItem] });
      const itemComps = findItemComponents(el);
      expect(itemComps[0].props.item.icon).toBe('./icons/calc.png');
    });

    it('passes iconSize to item components', () => {
      const el = Dock({ items: [imageIconItem], iconSize: 48 });
      const itemComps = findItemComponents(el);
      expect(itemComps[0].props.iconSize).toBe(48);
    });

    it('defaults iconSize to 36', () => {
      const el = Dock({ items: [imageIconItem] });
      const itemComps = findItemComponents(el);
      expect(itemComps[0].props.iconSize).toBe(36);
    });

    it('passes custom iconSize to item components', () => {
      const el = Dock({ items: [sampleItems[0]], iconSize: 50 });
      const itemComps = findItemComponents(el);
      expect(itemComps[0].props.iconSize).toBe(50);
    });
  });

  // -- Badges ---------------------------------------------------------------

  describe('badges', () => {
    it('passes badge count via item prop', () => {
      const el = Dock({ items: [sampleItems[2]] }); // mail, badge: 3
      const itemComps = findItemComponents(el);
      expect(itemComps[0].props.item.badge).toBe(3);
    });

    it('passes high badge count via item prop', () => {
      const el = Dock({ items: [highBadgeItem] }); // badge: 150
      const itemComps = findItemComponents(el);
      expect(itemComps[0].props.item.badge).toBe(150);
    });

    it('passes zero badge via item prop', () => {
      const el = Dock({ items: [zeroBadgeItem] });
      const itemComps = findItemComponents(el);
      expect(itemComps[0].props.item.badge).toBe(0);
    });

    it('passes exact 99 badge via item prop', () => {
      const el = Dock({ items: [exactBadgeItem] });
      const itemComps = findItemComponents(el);
      expect(itemComps[0].props.item.badge).toBe(99);
    });

    it('item without badge has undefined badge', () => {
      const el = Dock({ items: [sampleItems[1]] }); // terminal, no badge
      const itemComps = findItemComponents(el);
      expect(itemComps[0].props.item.badge).toBeUndefined();
    });

    it('passes item label for aria-label generation', () => {
      const el = Dock({ items: [sampleItems[2]] }); // mail, badge: 3
      const itemComps = findItemComponents(el);
      expect(itemComps[0].props.item.label).toBe('Mail');
      expect(itemComps[0].props.item.badge).toBe(3);
    });

    it('item without badge has plain label', () => {
      const el = Dock({ items: [sampleItems[1]] }); // terminal, no badge
      const itemComps = findItemComponents(el);
      expect(itemComps[0].props.item.label).toBe('Terminal');
      expect(itemComps[0].props.item.badge).toBeUndefined();
    });
  });

  // -- Active indicators ----------------------------------------------------

  describe('active indicators', () => {
    it('passes active=true for active items', () => {
      const el = Dock({ items: [sampleItems[0]] }); // files, active: true
      const itemComps = findItemComponents(el);
      expect(itemComps[0].props.item.active).toBe(true);
    });

    it('passes active=undefined for inactive items', () => {
      const el = Dock({ items: [sampleItems[1]] }); // terminal, not active
      const itemComps = findItemComponents(el);
      expect(itemComps[0].props.item.active).toBeUndefined();
    });

    it('passes position to item components for active dot placement', () => {
      const el = Dock({ items: [sampleItems[0]], position: 'left' });
      const itemComps = findItemComponents(el);
      expect(itemComps[0].props.position).toBe('left');
    });

    it('passes right position to item components', () => {
      const el = Dock({ items: [sampleItems[0]], position: 'right' });
      const itemComps = findItemComponents(el);
      expect(itemComps[0].props.position).toBe('right');
    });

    it('passes orientation to item components for active dot direction', () => {
      const el = Dock({ items: [sampleItems[0]], orientation: 'horizontal', position: 'top' });
      const itemComps = findItemComponents(el);
      expect(itemComps[0].props.orientation).toBe('horizontal');
      expect(itemComps[0].props.position).toBe('top');
    });

    it('passes bottom position for horizontal bottom', () => {
      const el = Dock({ items: [sampleItems[0]], orientation: 'horizontal', position: 'bottom' });
      const itemComps = findItemComponents(el);
      expect(itemComps[0].props.position).toBe('bottom');
    });
  });

  // -- Disabled state -------------------------------------------------------

  describe('disabled state', () => {
    it('passes disabled=true to item component', () => {
      const el = Dock({ items: [disabledItem] });
      const itemComps = findItemComponents(el);
      expect(itemComps[0].props.item.disabled).toBe(true);
    });

    it('does not set disabled on enabled items', () => {
      const el = Dock({ items: [sampleItems[0]] });
      const itemComps = findItemComponents(el);
      expect(itemComps[0].props.item.disabled).toBeUndefined();
    });

    it('enabled items have no disabled flag', () => {
      const el = Dock({ items: [sampleItems[0]] });
      const itemComps = findItemComponents(el);
      expect(itemComps[0].props.item.disabled).toBeFalsy();
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
    it('passes onItemClick handler to item components', () => {
      const handler = () => {};
      const el = Dock({ items: sampleItems, onItemClick: handler });
      const itemComps = findItemComponents(el);
      expect(itemComps[0].props.onItemClick).toBe(handler);
    });

    it('passes onItemContextMenu handler to item components', () => {
      const handler = () => {};
      const el = Dock({ items: sampleItems, onItemContextMenu: handler });
      const itemComps = findItemComponents(el);
      expect(itemComps[0].props.onItemContextMenu).toBe(handler);
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

    it('item components receive correct props for styling', () => {
      const el = Dock({ items: sampleItems });
      const itemComps = findItemComponents(el);
      // Each item component receives the item data needed for styling
      expect(itemComps[0].props.item).toBeDefined();
      expect(itemComps[0].props.iconSize).toBeDefined();
    });
  });

  // -- Keyboard navigation --------------------------------------------------

  describe('keyboard navigation', () => {
    it('item components receive item id for keyboard navigation', () => {
      const el = Dock({ items: sampleItems });
      const itemComps = findItemComponents(el);
      expect(itemComps[0].props.item.id).toBe('files');
      expect(itemComps[1].props.item.id).toBe('terminal');
      expect(itemComps[2].props.item.id).toBe('mail');
    });
  });

  // -- Accessibility --------------------------------------------------------

  describe('accessibility', () => {
    it('each item component receives its label', () => {
      const el = Dock({ items: [sampleItems[1]] }); // terminal
      const itemComps = findItemComponents(el);
      expect(itemComps[0].props.item.label).toBe('Terminal');
    });

    it('badged item component has badge count', () => {
      const el = Dock({ items: [sampleItems[2]] }); // mail, badge: 3
      const itemComps = findItemComponents(el);
      expect(itemComps[0].props.item.badge).toBe(3);
    });

    it('high badge count item has correct badge value', () => {
      const el = Dock({ items: [highBadgeItem] }); // badge: 150
      const itemComps = findItemComponents(el);
      expect(itemComps[0].props.item.badge).toBe(150);
    });

    it('zero badge item has badge=0', () => {
      const el = Dock({ items: [zeroBadgeItem] }); // badge: 0
      const itemComps = findItemComponents(el);
      expect(itemComps[0].props.item.badge).toBe(0);
    });

    it('image icon items have label for alt text', () => {
      const el = Dock({ items: [imageIconItem] });
      const itemComps = findItemComponents(el);
      expect(itemComps[0].props.item.label).toBe('Browser');
    });

    it('text icon items are passed with icon data', () => {
      const el = Dock({ items: [sampleItems[0]] }); // files, text icon 'F'
      const itemComps = findItemComponents(el);
      expect(itemComps[0].props.item.icon).toBe('F');
    });

    it('active item passes active flag', () => {
      const el = Dock({ items: [sampleItems[0]] }); // active
      const itemComps = findItemComponents(el);
      expect(itemComps[0].props.item.active).toBe(true);
    });
  });

  // -- Edge cases -----------------------------------------------------------

  describe('edge cases', () => {
    it('handles items with both active and badge', () => {
      const item: DockItem = { id: 'combo', icon: 'X', label: 'Combo', active: true, badge: 5 };
      const el = Dock({ items: [item] });
      const itemComps = findItemComponents(el);
      expect(itemComps[0].props.item.active).toBe(true);
      expect(itemComps[0].props.item.badge).toBe(5);
    });

    it('handles items with both disabled and active', () => {
      const item: DockItem = { id: 'da', icon: 'X', label: 'DisabledActive', active: true, disabled: true };
      const el = Dock({ items: [item] });
      const itemComps = findItemComponents(el);
      expect(itemComps[0].props.item.disabled).toBe(true);
      expect(itemComps[0].props.item.active).toBe(true);
    });

    it('handles items with disabled and badge', () => {
      const item: DockItem = { id: 'db', icon: 'X', label: 'DisabledBadge', badge: 7, disabled: true };
      const el = Dock({ items: [item] });
      const itemComps = findItemComponents(el);
      expect(itemComps[0].props.item.disabled).toBe(true);
      expect(itemComps[0].props.item.badge).toBe(7);
    });

    it('handles many items', () => {
      const manyItems: DockItem[] = [];
      for (let i = 0; i < 20; i++) {
        manyItems.push({ id: `item-${i}`, icon: String(i % 10), label: `Item ${i}` });
      }
      const el = Dock({ items: manyItems });
      const itemComps = findItemComponents(el);
      expect(itemComps.length).toBe(20);
    });

    it('trailing separator with two items renders separator', () => {
      const twoItems = [sampleItems[0], sampleItems[1]];
      const el = Dock({ items: twoItems, showTrailingSeparator: true });
      const seps = findByRole(el, 'separator');
      expect(seps.length).toBe(1);
    });

    it('badge of exactly 1 is passed through item prop', () => {
      const item: DockItem = { id: 'one', icon: 'O', label: 'One', badge: 1 };
      const el = Dock({ items: [item] });
      const itemComps = findItemComponents(el);
      expect(itemComps[0].props.item.badge).toBe(1);
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
      const itemComps = findItemComponents(el);
      expect(itemComps[0].props.iconSize).toBe(36);
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
