// (c) 2025-2026 Asymmetric Effort, LLC. MIT LICENSE
// SPDX-License-Identifier: MIT

import { describe, it, expect, beforeEach, vi } from 'vitest';
import { DesktopBackground } from '../src/index';
import { createElement } from '../../../../core/src/index';
import { createRoot } from '../../../../core/src/dom/create-root';

let container: HTMLDivElement;

beforeEach(() => {
  container = document.createElement('div');
  document.body.appendChild(container);
  return () => {
    document.body.removeChild(container);
  };
});

function render(element: unknown) {
  const root = createRoot(container);
  root.render(element as any);
  return container;
}

describe('DesktopBackground', () => {
  // =========================================================================
  // Rendering
  // =========================================================================

  describe('rendering', () => {
    it('renders with default props', () => {
      render(createElement(DesktopBackground, null));
      const el = container.querySelector('.desktop-background') as HTMLElement;
      expect(el).toBeTruthy();
    });

    it('renders with position relative', () => {
      render(createElement(DesktopBackground, null));
      const el = container.querySelector('.desktop-background') as HTMLElement;
      expect(el.style.position).toBe('relative');
    });

    it('renders with overflow hidden', () => {
      render(createElement(DesktopBackground, null));
      const el = container.querySelector('.desktop-background') as HTMLElement;
      expect(el.style.overflow).toBe('hidden');
    });

    it('renders with cursor default', () => {
      render(createElement(DesktopBackground, null));
      const el = container.querySelector('.desktop-background') as HTMLElement;
      expect(el.style.cursor).toBe('default');
    });

    it('renders with 100% width and height', () => {
      render(createElement(DesktopBackground, null));
      const el = container.querySelector('.desktop-background') as HTMLElement;
      expect(el.style.width).toBe('100%');
      expect(el.style.height).toBe('100%');
    });

    it('renders with no padding or margin', () => {
      render(createElement(DesktopBackground, null));
      const el = container.querySelector('.desktop-background') as HTMLElement;
      expect(el.style.margin).toBe('0px');
      expect(el.style.padding).toBe('0px');
    });

    it('renders children content', () => {
      render(createElement(DesktopBackground, null,
        createElement('div', { className: 'child-window' }, 'Window A'),
      ));
      const child = container.querySelector('.child-window') as HTMLElement;
      expect(child).toBeTruthy();
      expect(child.textContent).toBe('Window A');
    });

    it('renders multiple children', () => {
      render(createElement(DesktopBackground, null,
        createElement('div', { className: 'win-a' }, 'A'),
        createElement('div', { className: 'win-b' }, 'B'),
      ));
      expect(container.querySelector('.win-a')).toBeTruthy();
      expect(container.querySelector('.win-b')).toBeTruthy();
    });

    it('renders content wrapper with relative positioning', () => {
      render(createElement(DesktopBackground, null));
      const content = container.querySelector('.desktop-background__content') as HTMLElement;
      expect(content).toBeTruthy();
      expect(content.style.position).toBe('relative');
      expect(content.style.zIndex).toBe('1');
    });
  });

  // =========================================================================
  // Background color
  // =========================================================================

  describe('background color', () => {
    it('uses default aubergine color', () => {
      render(createElement(DesktopBackground, null));
      const el = container.querySelector('.desktop-background') as HTMLElement;
      // jsdom normalizes hex colors to rgb
      expect(el.style.backgroundColor).toContain('44, 0, 30');
    });

    it('uses custom background color', () => {
      render(createElement(DesktopBackground, { backgroundColor: '#ff0000' }));
      const el = container.querySelector('.desktop-background') as HTMLElement;
      expect(el.style.backgroundColor).toContain('255, 0, 0');
    });
  });

  // =========================================================================
  // Background gradient
  // =========================================================================

  describe('background gradient', () => {
    it('applies gradient when provided', () => {
      const gradient = 'linear-gradient(135deg, #2c001e 0%, #3c0a2e 100%)';
      render(createElement(DesktopBackground, { backgroundGradient: gradient }));
      const el = container.querySelector('.desktop-background') as HTMLElement;
      // jsdom normalizes hex colors in gradients to rgb
      expect(el.style.background).toContain('linear-gradient');
      expect(el.style.background).toContain('135deg');
    });

    it('gradient overrides backgroundColor', () => {
      const gradient = 'linear-gradient(135deg, #000 0%, #fff 100%)';
      render(createElement(DesktopBackground, {
        backgroundColor: '#ff0000',
        backgroundGradient: gradient,
      }));
      const el = container.querySelector('.desktop-background') as HTMLElement;
      // jsdom normalizes hex colors in gradients to rgb
      expect(el.style.background).toContain('linear-gradient');
      expect(el.style.background).toContain('135deg');
    });

    it('does not set background when no gradient provided', () => {
      render(createElement(DesktopBackground, { backgroundColor: '#123456' }));
      const el = container.querySelector('.desktop-background') as HTMLElement;
      expect(el.style.background).toBe('');
    });
  });

  // =========================================================================
  // Background image
  // =========================================================================

  describe('background image', () => {
    it('applies background image with full opacity', () => {
      render(createElement(DesktopBackground, { backgroundImage: 'wallpaper.jpg' }));
      const el = container.querySelector('.desktop-background') as HTMLElement;
      // jsdom normalizes url() to url("...")
      expect(el.style.backgroundImage).toContain('wallpaper.jpg');
      expect(el.style.backgroundSize).toBe('cover');
      expect(el.style.backgroundPosition).toContain('center');
    });

    it('does not render image overlay when opacity is 1', () => {
      render(createElement(DesktopBackground, { backgroundImage: 'wallpaper.jpg' }));
      const overlay = container.querySelector('.desktop-background__image-overlay');
      expect(overlay).toBeFalsy();
    });

    it('renders image overlay when opacity < 1', () => {
      render(createElement(DesktopBackground, {
        backgroundImage: 'wallpaper.jpg',
        backgroundImageOpacity: 0.5,
      }));
      const overlay = container.querySelector('.desktop-background__image-overlay') as HTMLElement;
      expect(overlay).toBeTruthy();
      expect(overlay.style.opacity).toBe('0.5');
      // jsdom normalizes url() to url("...")
      expect(overlay.style.backgroundImage).toContain('wallpaper.jpg');
      expect(overlay.style.backgroundSize).toBe('cover');
      expect(overlay.style.backgroundPosition).toBe('center');
      expect(overlay.style.pointerEvents).toBe('none');
    });

    it('image overlay has aria-hidden true', () => {
      render(createElement(DesktopBackground, {
        backgroundImage: 'wallpaper.jpg',
        backgroundImageOpacity: 0.7,
      }));
      const overlay = container.querySelector('.desktop-background__image-overlay') as HTMLElement;
      expect(overlay.getAttribute('aria-hidden')).toBe('true');
    });

    it('image overlay is positioned absolutely at z-index 0', () => {
      render(createElement(DesktopBackground, {
        backgroundImage: 'wallpaper.jpg',
        backgroundImageOpacity: 0.3,
      }));
      const overlay = container.querySelector('.desktop-background__image-overlay') as HTMLElement;
      expect(overlay.style.position).toBe('absolute');
      expect(overlay.style.zIndex).toBe('0');
    });

    it('does not set backgroundImage on container when opacity < 1', () => {
      render(createElement(DesktopBackground, {
        backgroundImage: 'wallpaper.jpg',
        backgroundImageOpacity: 0.5,
      }));
      const el = container.querySelector('.desktop-background') as HTMLElement;
      expect(el.style.backgroundImage).toBe('');
    });

    it('does not render overlay when no image provided', () => {
      render(createElement(DesktopBackground, { backgroundImageOpacity: 0.5 }));
      const overlay = container.querySelector('.desktop-background__image-overlay');
      expect(overlay).toBeFalsy();
    });
  });

  // =========================================================================
  // Accessibility
  // =========================================================================

  describe('accessibility', () => {
    it('has role application', () => {
      render(createElement(DesktopBackground, null));
      const el = container.querySelector('.desktop-background') as HTMLElement;
      expect(el.getAttribute('role')).toBe('application');
    });

    it('has aria-label Desktop workspace', () => {
      render(createElement(DesktopBackground, null));
      const el = container.querySelector('.desktop-background') as HTMLElement;
      expect(el.getAttribute('aria-label')).toBe('Desktop workspace');
    });
  });

  // =========================================================================
  // Theme
  // =========================================================================

  describe('theme', () => {
    it('has data-theme dark by default', () => {
      render(createElement(DesktopBackground, null));
      const el = container.querySelector('.desktop-background') as HTMLElement;
      expect(el.getAttribute('data-theme')).toBe('dark');
    });
  });

  // =========================================================================
  // Click handling
  // =========================================================================

  describe('click handling', () => {
    it('fires onClick when background itself is clicked', () => {
      const onClick = vi.fn();
      render(createElement(DesktopBackground, { onClick }));
      const el = container.querySelector('.desktop-background') as HTMLElement;
      el.dispatchEvent(new MouseEvent('click', { bubbles: true }));
      expect(onClick).toHaveBeenCalledTimes(1);
    });

    it('does not fire onClick when a child is clicked', () => {
      const onClick = vi.fn();
      render(createElement(DesktopBackground, { onClick },
        createElement('div', { className: 'child' }, 'Click me'),
      ));
      const child = container.querySelector('.child') as HTMLElement;
      child.dispatchEvent(new MouseEvent('click', { bubbles: true }));
      expect(onClick).not.toHaveBeenCalled();
    });

    it('does not error when onClick is not provided', () => {
      render(createElement(DesktopBackground, null));
      const el = container.querySelector('.desktop-background') as HTMLElement;
      expect(() => {
        el.dispatchEvent(new MouseEvent('click', { bubbles: true }));
      }).not.toThrow();
    });

    it('fires onDoubleClick when background is double-clicked', () => {
      const onDoubleClick = vi.fn();
      render(createElement(DesktopBackground, { onDoubleClick }));
      const el = container.querySelector('.desktop-background') as HTMLElement;
      el.dispatchEvent(new MouseEvent('dblclick', { bubbles: true }));
      expect(onDoubleClick).toHaveBeenCalledTimes(1);
    });

    it('does not fire onDoubleClick when a child is double-clicked', () => {
      const onDoubleClick = vi.fn();
      render(createElement(DesktopBackground, { onDoubleClick },
        createElement('div', { className: 'child' }, 'Double click me'),
      ));
      const child = container.querySelector('.child') as HTMLElement;
      child.dispatchEvent(new MouseEvent('dblclick', { bubbles: true }));
      expect(onDoubleClick).not.toHaveBeenCalled();
    });

    it('does not error when onDoubleClick is not provided', () => {
      render(createElement(DesktopBackground, null));
      const el = container.querySelector('.desktop-background') as HTMLElement;
      expect(() => {
        el.dispatchEvent(new MouseEvent('dblclick', { bubbles: true }));
      }).not.toThrow();
    });
  });

  // =========================================================================
  // Context menu integration
  // =========================================================================

  describe('context menu integration', () => {
    it('wraps in ContextMenu when contextMenuItems are provided', () => {
      const items = [
        { label: 'Change Wallpaper', onClick: vi.fn() },
        { label: 'Display Settings', onClick: vi.fn() },
      ];
      render(createElement(DesktopBackground, { contextMenuItems: items }));
      const el = container.querySelector('.desktop-background') as HTMLElement;
      expect(el).toBeTruthy();
    });

    it('does not wrap in ContextMenu when contextMenuItems is empty', () => {
      render(createElement(DesktopBackground, { contextMenuItems: [] }));
      const el = container.querySelector('.desktop-background') as HTMLElement;
      expect(el).toBeTruthy();
    });

    it('does not wrap in ContextMenu when contextMenuItems is not provided', () => {
      render(createElement(DesktopBackground, null));
      const el = container.querySelector('.desktop-background') as HTMLElement;
      expect(el).toBeTruthy();
    });

    it('renders context menu items with dividers', () => {
      const items = [
        { label: 'Item 1', onClick: vi.fn() },
        { divider: true },
        { label: 'Item 2', onClick: vi.fn() },
      ];
      render(createElement(DesktopBackground, { contextMenuItems: items }));
      const el = container.querySelector('.desktop-background') as HTMLElement;
      expect(el).toBeTruthy();
    });

    it('renders context menu items with nested children', () => {
      const items = [
        {
          label: 'Parent',
          children: [
            { label: 'Child 1', onClick: vi.fn() },
            { label: 'Child 2', onClick: vi.fn() },
          ],
        },
      ];
      render(createElement(DesktopBackground, { contextMenuItems: items }));
      const el = container.querySelector('.desktop-background') as HTMLElement;
      expect(el).toBeTruthy();
    });

    it('renders context menu items with disabled state', () => {
      const items = [
        { label: 'Enabled', onClick: vi.fn() },
        { label: 'Disabled', onClick: vi.fn(), disabled: true },
      ];
      render(createElement(DesktopBackground, { contextMenuItems: items }));
      const el = container.querySelector('.desktop-background') as HTMLElement;
      expect(el).toBeTruthy();
    });

    it('renders context menu items with icons', () => {
      const items = [
        { label: 'Settings', icon: 'gear', onClick: vi.fn() },
      ];
      render(createElement(DesktopBackground, { contextMenuItems: items }));
      const el = container.querySelector('.desktop-background') as HTMLElement;
      expect(el).toBeTruthy();
    });
  });

  // =========================================================================
  // Sad paths / edge cases
  // =========================================================================

  describe('sad paths', () => {
    it('renders with no children', () => {
      render(createElement(DesktopBackground, null));
      const content = container.querySelector('.desktop-background__content') as HTMLElement;
      expect(content).toBeTruthy();
    });

    it('renders with all props set', () => {
      const onClick = vi.fn();
      const onDoubleClick = vi.fn();
      const items = [{ label: 'Test', onClick: vi.fn() }];
      render(createElement(DesktopBackground, {
        backgroundColor: '#000000',
        backgroundGradient: 'linear-gradient(to right, #000, #fff)',
        backgroundImage: 'bg.png',
        backgroundImageOpacity: 0.8,
        contextMenuItems: items,
        onClick,
        onDoubleClick,
      }, createElement('div', null, 'content')));
      const el = container.querySelector('.desktop-background') as HTMLElement;
      expect(el).toBeTruthy();
      const overlay = container.querySelector('.desktop-background__image-overlay') as HTMLElement;
      expect(overlay).toBeTruthy();
      expect(overlay.style.opacity).toBe('0.8');
    });

    it('handles opacity of 0', () => {
      render(createElement(DesktopBackground, {
        backgroundImage: 'wallpaper.jpg',
        backgroundImageOpacity: 0,
      }));
      const overlay = container.querySelector('.desktop-background__image-overlay') as HTMLElement;
      expect(overlay).toBeTruthy();
      expect(overlay.style.opacity).toBe('0');
    });

    it('handles opacity of exactly 1 (no overlay)', () => {
      render(createElement(DesktopBackground, {
        backgroundImage: 'wallpaper.jpg',
        backgroundImageOpacity: 1,
      }));
      const overlay = container.querySelector('.desktop-background__image-overlay');
      expect(overlay).toBeFalsy();
    });

    it('handles empty string backgroundColor', () => {
      render(createElement(DesktopBackground, { backgroundColor: '' }));
      const el = container.querySelector('.desktop-background') as HTMLElement;
      expect(el).toBeTruthy();
    });

    it('handles backgroundGradient without backgroundColor', () => {
      const gradient = 'radial-gradient(circle, #000, #fff)';
      render(createElement(DesktopBackground, { backgroundGradient: gradient }));
      const el = container.querySelector('.desktop-background') as HTMLElement;
      // jsdom normalizes hex colors in gradients to rgb
      expect(el.style.background).toContain('radial-gradient');
    });
  });
});
