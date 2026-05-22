// (c) 2025-2026 Asymmetric Effort, LLC. MIT LICENSE
// SPDX-License-Identifier: MIT

import { describe, it, expect, beforeEach, fn } from '@asymmetric-effort/nogginlessdom';
import { DraggableWindow } from '../src/index';
import { createElement } from '../../../../core/src/index';
import { createRoot } from '../../../../core/src/dom/create-root';

let container: HTMLDivElement;

beforeEach(() => {
  container = document.createElement('div');
  // Give the container dimensions so boundary clamping works
  Object.defineProperty(container, 'clientWidth', { value: 1024, configurable: true });
  Object.defineProperty(container, 'clientHeight', { value: 768, configurable: true });
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

// ---------------------------------------------------------------------------
// Rendering & Props
// ---------------------------------------------------------------------------

describe('DraggableWindow', () => {
  describe('basic rendering', () => {
    it('renders with required props only', () => {
      render(createElement(DraggableWindow, { id: 'win1', title: 'Test Window' }));
      const el = container.querySelector('.draggable-window') as HTMLElement;
      expect(el).toBeTruthy();
      expect(el.id).toBe('draggable-window-win1');
    });

    it('renders title text', () => {
      render(createElement(DraggableWindow, { id: 'w', title: 'My Title' }));
      const titleEl = container.querySelector('.draggable-window__title-text') as HTMLElement;
      expect(titleEl).toBeTruthy();
      expect(titleEl.textContent).toBe('My Title');
    });

    it('renders children in the body', () => {
      render(
        createElement(
          DraggableWindow,
          { id: 'w', title: 'T' },
          createElement('p', null, 'Body content'),
        ),
      );
      const body = container.querySelector('.draggable-window__body') as HTMLElement;
      expect(body.textContent).toBe('Body content');
    });

    it('renders with emoji icon', () => {
      render(createElement(DraggableWindow, { id: 'w', title: 'T', icon: '📁' }));
      const iconEl = container.querySelector('.draggable-window__icon') as HTMLElement;
      expect(iconEl).toBeTruthy();
      expect(iconEl.tagName).toBe('SPAN');
      expect(iconEl.textContent).toBe('📁');
    });

    it('renders with URL icon as img', () => {
      render(
        createElement(DraggableWindow, {
          id: 'w',
          title: 'T',
          icon: 'https://example.com/icon.png',
        }),
      );
      const iconEl = container.querySelector('.draggable-window__icon') as HTMLElement;
      expect(iconEl).toBeTruthy();
      expect(iconEl.tagName).toBe('IMG');
    });

    it('does not render icon when not provided', () => {
      render(createElement(DraggableWindow, { id: 'w', title: 'T' }));
      expect(container.querySelector('.draggable-window__icon')).toBeFalsy();
    });
  });

  // ---------------------------------------------------------------------------
  // Window control buttons
  // ---------------------------------------------------------------------------

  describe('window control buttons', () => {
    it('renders minimize button with aria-label', () => {
      render(createElement(DraggableWindow, { id: 'w', title: 'T' }));
      const btn = container.querySelector('.draggable-window__btn-minimize') as HTMLElement;
      expect(btn).toBeTruthy();
      expect(btn.getAttribute('aria-label')).toBe('Minimize');
    });

    it('renders maximize button with aria-label', () => {
      render(createElement(DraggableWindow, { id: 'w', title: 'T' }));
      const btn = container.querySelector('.draggable-window__btn-maximize') as HTMLElement;
      expect(btn).toBeTruthy();
      expect(btn.getAttribute('aria-label')).toBe('Maximize');
    });

    it('renders restore label when maximized', () => {
      render(
        createElement(DraggableWindow, { id: 'w', title: 'T', windowState: 'maximized' }),
      );
      const btn = container.querySelector('.draggable-window__btn-maximize') as HTMLElement;
      expect(btn.getAttribute('aria-label')).toBe('Restore');
    });

    it('renders close button with aria-label', () => {
      render(createElement(DraggableWindow, { id: 'w', title: 'T' }));
      const btn = container.querySelector('.draggable-window__btn-close') as HTMLElement;
      expect(btn).toBeTruthy();
      expect(btn.getAttribute('aria-label')).toBe('Close');
    });

    it('calls onClose when close button is clicked', async () => {
      const onClose = fn();
      render(createElement(DraggableWindow, { id: 'w', title: 'T', onClose }));
      const btn = container.querySelector('.draggable-window__btn-close') as HTMLElement;
      btn.dispatchEvent(new MouseEvent('click', { bubbles: true }));
      await new Promise((r) => setTimeout(r, 20));
      expect(onClose).toHaveBeenCalledTimes(1);
    });

    it('calls onMinimize when minimize button is clicked', async () => {
      const onMinimize = fn();
      render(createElement(DraggableWindow, { id: 'w', title: 'T', onMinimize }));
      const btn = container.querySelector('.draggable-window__btn-minimize') as HTMLElement;
      btn.dispatchEvent(new MouseEvent('click', { bubbles: true }));
      await new Promise((r) => setTimeout(r, 20));
      expect(onMinimize).toHaveBeenCalledTimes(1);
    });

    it('calls onMaximize when maximize button is clicked', async () => {
      const onMaximize = fn();
      render(createElement(DraggableWindow, { id: 'w', title: 'T', onMaximize }));
      const btn = container.querySelector('.draggable-window__btn-maximize') as HTMLElement;
      btn.dispatchEvent(new MouseEvent('click', { bubbles: true }));
      await new Promise((r) => setTimeout(r, 20));
      expect(onMaximize).toHaveBeenCalledTimes(1);
    });
  });

  // ---------------------------------------------------------------------------
  // ARIA / Accessibility
  // ---------------------------------------------------------------------------

  describe('accessibility', () => {
    it('has role="dialog" on the window container', () => {
      render(createElement(DraggableWindow, { id: 'w', title: 'Test' }));
      const el = container.querySelector('.draggable-window') as HTMLElement;
      expect(el.getAttribute('role')).toBe('dialog');
    });

    it('has aria-label matching the title', () => {
      render(createElement(DraggableWindow, { id: 'w', title: 'My Window' }));
      const el = container.querySelector('.draggable-window') as HTMLElement;
      expect(el.getAttribute('aria-label')).toBe('My Window');
    });

    it('title bar has role="toolbar"', () => {
      render(createElement(DraggableWindow, { id: 'w', title: 'T' }));
      const bar = container.querySelector('.draggable-window__title-bar') as HTMLElement;
      expect(bar.getAttribute('role')).toBe('toolbar');
    });

    it('title bar has aria-label with window controls text', () => {
      render(createElement(DraggableWindow, { id: 'w', title: 'My App' }));
      const bar = container.querySelector('.draggable-window__title-bar') as HTMLElement;
      expect(bar.getAttribute('aria-label')).toBe('My App window controls');
    });
  });

  // ---------------------------------------------------------------------------
  // Default values
  // ---------------------------------------------------------------------------

  describe('default values', () => {
    it('defaults to normal window state', () => {
      render(createElement(DraggableWindow, { id: 'w', title: 'T' }));
      const el = container.querySelector('.draggable-window') as HTMLElement;
      expect(el.classList.contains('draggable-window--normal')).toBe(true);
    });

    it('defaults to focused', () => {
      render(createElement(DraggableWindow, { id: 'w', title: 'T' }));
      const el = container.querySelector('.draggable-window') as HTMLElement;
      expect(el.classList.contains('draggable-window--focused')).toBe(true);
    });

    it('defaults to resizable (resize handles present)', () => {
      render(createElement(DraggableWindow, { id: 'w', title: 'T' }));
      const handles = container.querySelectorAll('.draggable-window__resize-handle');
      expect(handles.length).toBe(8);
    });

    it('defaults to draggable (grab cursor on title bar)', () => {
      render(createElement(DraggableWindow, { id: 'w', title: 'T' }));
      const bar = container.querySelector('.draggable-window__title-bar') as HTMLElement;
      expect(bar.style.cursor).toBe('grab');
    });

    it('applies default position', () => {
      render(createElement(DraggableWindow, { id: 'w', title: 'T' }));
      const el = container.querySelector('.draggable-window') as HTMLElement;
      expect(el.style.left).toBe('50px');
      expect(el.style.top).toBe('50px');
    });

    it('applies default size', () => {
      render(createElement(DraggableWindow, { id: 'w', title: 'T' }));
      const el = container.querySelector('.draggable-window') as HTMLElement;
      expect(el.style.width).toBe('400px');
      expect(el.style.height).toBe('300px');
    });
  });

  // ---------------------------------------------------------------------------
  // Custom position & size
  // ---------------------------------------------------------------------------

  describe('custom position and size', () => {
    it('applies custom defaultPosition', () => {
      render(
        createElement(DraggableWindow, {
          id: 'w',
          title: 'T',
          defaultPosition: { x: 100, y: 200 },
        }),
      );
      const el = container.querySelector('.draggable-window') as HTMLElement;
      expect(el.style.left).toBe('100px');
      expect(el.style.top).toBe('200px');
    });

    it('applies custom defaultSize', () => {
      render(
        createElement(DraggableWindow, {
          id: 'w',
          title: 'T',
          defaultSize: { width: 600, height: 400 },
        }),
      );
      const el = container.querySelector('.draggable-window') as HTMLElement;
      expect(el.style.width).toBe('600px');
      expect(el.style.height).toBe('400px');
    });
  });

  // ---------------------------------------------------------------------------
  // Window states
  // ---------------------------------------------------------------------------

  describe('window states', () => {
    it('minimized state renders nothing', () => {
      render(
        createElement(DraggableWindow, { id: 'w', title: 'T', windowState: 'minimized' }),
      );
      expect(container.querySelector('.draggable-window')).toBeFalsy();
    });

    it('maximized state fills container (100%)', () => {
      render(
        createElement(DraggableWindow, { id: 'w', title: 'T', windowState: 'maximized' }),
      );
      const el = container.querySelector('.draggable-window') as HTMLElement;
      expect(el.style.width).toBe('100%');
      expect(el.style.height).toBe('100%');
      // jsdom normalizes '0' to '0px'
      expect(el.style.top).toBe('0px');
      expect(el.style.left).toBe('0px');
    });

    it('maximized state has no border radius', () => {
      render(
        createElement(DraggableWindow, { id: 'w', title: 'T', windowState: 'maximized' }),
      );
      const el = container.querySelector('.draggable-window') as HTMLElement;
      // jsdom normalizes '0' to '0px'
      expect(el.style.borderRadius).toBe('0px');
    });

    it('maximized state has no resize handles', () => {
      render(
        createElement(DraggableWindow, { id: 'w', title: 'T', windowState: 'maximized' }),
      );
      const handles = container.querySelectorAll('.draggable-window__resize-handle');
      expect(handles.length).toBe(0);
    });

    it('normal state has proper class', () => {
      render(createElement(DraggableWindow, { id: 'w', title: 'T', windowState: 'normal' }));
      const el = container.querySelector('.draggable-window') as HTMLElement;
      expect(el.classList.contains('draggable-window--normal')).toBe(true);
    });

    it('maximized state has proper class', () => {
      render(
        createElement(DraggableWindow, { id: 'w', title: 'T', windowState: 'maximized' }),
      );
      const el = container.querySelector('.draggable-window') as HTMLElement;
      expect(el.classList.contains('draggable-window--maximized')).toBe(true);
    });
  });

  // ---------------------------------------------------------------------------
  // Focused / Unfocused
  // ---------------------------------------------------------------------------

  describe('focus styling', () => {
    it('focused window has focused class', () => {
      render(createElement(DraggableWindow, { id: 'w', title: 'T', focused: true }));
      const el = container.querySelector('.draggable-window') as HTMLElement;
      expect(el.classList.contains('draggable-window--focused')).toBe(true);
    });

    it('unfocused window has unfocused class', () => {
      render(createElement(DraggableWindow, { id: 'w', title: 'T', focused: false }));
      const el = container.querySelector('.draggable-window') as HTMLElement;
      expect(el.classList.contains('draggable-window--unfocused')).toBe(true);
    });

    it('unfocused title bar has dimmed opacity', () => {
      render(createElement(DraggableWindow, { id: 'w', title: 'T', focused: false }));
      const bar = container.querySelector('.draggable-window__title-bar') as HTMLElement;
      expect(bar.style.opacity).toBe('0.6');
    });

    it('focused title bar has full opacity', () => {
      render(createElement(DraggableWindow, { id: 'w', title: 'T', focused: true }));
      const bar = container.querySelector('.draggable-window__title-bar') as HTMLElement;
      expect(bar.style.opacity).toBe('1');
    });

    it('calls onFocus when window is clicked', async () => {
      const onFocus = fn();
      render(createElement(DraggableWindow, { id: 'w', title: 'T', onFocus }));
      const el = container.querySelector('.draggable-window') as HTMLElement;
      el.dispatchEvent(new MouseEvent('mousedown', { bubbles: true }));
      await new Promise((r) => setTimeout(r, 20));
      expect(onFocus).toHaveBeenCalledTimes(1);
    });
  });

  // ---------------------------------------------------------------------------
  // Resizable prop
  // ---------------------------------------------------------------------------

  describe('resizable prop', () => {
    it('renders 8 resize handles when resizable (default)', () => {
      render(createElement(DraggableWindow, { id: 'w', title: 'T' }));
      const handles = container.querySelectorAll('.draggable-window__resize-handle');
      expect(handles.length).toBe(8);
    });

    it('renders no resize handles when resizable is false', () => {
      render(createElement(DraggableWindow, { id: 'w', title: 'T', resizable: false }));
      const handles = container.querySelectorAll('.draggable-window__resize-handle');
      expect(handles.length).toBe(0);
    });

    it('resize handles have correct cursor styles', () => {
      render(createElement(DraggableWindow, { id: 'w', title: 'T' }));
      const nHandle = container.querySelector('.draggable-window__resize-n') as HTMLElement;
      expect(nHandle.style.cursor).toBe('n-resize');
      const seHandle = container.querySelector('.draggable-window__resize-se') as HTMLElement;
      expect(seHandle.style.cursor).toBe('se-resize');
      const swHandle = container.querySelector('.draggable-window__resize-sw') as HTMLElement;
      expect(swHandle.style.cursor).toBe('sw-resize');
    });

    it('all 8 direction handles are present', () => {
      render(createElement(DraggableWindow, { id: 'w', title: 'T' }));
      const dirs = ['n', 's', 'e', 'w', 'ne', 'nw', 'se', 'sw'];
      for (const d of dirs) {
        const handle = container.querySelector(`.draggable-window__resize-${d}`);
        expect(handle).toBeTruthy();
      }
    });
  });

  // ---------------------------------------------------------------------------
  // Draggable prop
  // ---------------------------------------------------------------------------

  describe('draggable prop', () => {
    it('title bar cursor is grab when draggable', () => {
      render(createElement(DraggableWindow, { id: 'w', title: 'T', draggable: true }));
      const bar = container.querySelector('.draggable-window__title-bar') as HTMLElement;
      expect(bar.style.cursor).toBe('grab');
    });

    it('title bar cursor is default when not draggable', () => {
      render(createElement(DraggableWindow, { id: 'w', title: 'T', draggable: false }));
      const bar = container.querySelector('.draggable-window__title-bar') as HTMLElement;
      expect(bar.style.cursor).toBe('default');
    });

    it('title bar cursor is default when maximized', () => {
      render(
        createElement(DraggableWindow, {
          id: 'w',
          title: 'T',
          draggable: true,
          windowState: 'maximized',
        }),
      );
      const bar = container.querySelector('.draggable-window__title-bar') as HTMLElement;
      expect(bar.style.cursor).toBe('default');
    });
  });

  // ---------------------------------------------------------------------------
  // zIndex
  // ---------------------------------------------------------------------------

  describe('zIndex', () => {
    it('applies zIndex when provided', () => {
      render(createElement(DraggableWindow, { id: 'w', title: 'T', zIndex: 500 }));
      const el = container.querySelector('.draggable-window') as HTMLElement;
      expect(el.style.zIndex).toBe('500');
    });

    it('does not set zIndex when not provided', () => {
      render(createElement(DraggableWindow, { id: 'w', title: 'T' }));
      const el = container.querySelector('.draggable-window') as HTMLElement;
      expect(el.style.zIndex).toBe('');
    });
  });

  // ---------------------------------------------------------------------------
  // Escape key
  // ---------------------------------------------------------------------------

  describe('escape key', () => {
    it('fires onClose when Escape is pressed and window is focused', async () => {
      const onClose = fn();
      render(createElement(DraggableWindow, { id: 'w', title: 'T', focused: true, onClose }));
      document.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape', bubbles: true }));
      await new Promise((r) => setTimeout(r, 20));
      expect(onClose).toHaveBeenCalledTimes(1);
    });

    it('does not fire onClose when Escape is pressed and window is unfocused', async () => {
      const onClose = fn();
      render(
        createElement(DraggableWindow, { id: 'w', title: 'T', focused: false, onClose }),
      );
      document.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape', bubbles: true }));
      await new Promise((r) => setTimeout(r, 20));
      expect(onClose).not.toHaveBeenCalled();
    });
  });

  // ---------------------------------------------------------------------------
  // Double-click title bar
  // ---------------------------------------------------------------------------

  describe('double-click title bar', () => {
    it('calls onMaximize on double-click', async () => {
      const onMaximize = fn();
      render(createElement(DraggableWindow, { id: 'w', title: 'T', onMaximize }));
      const bar = container.querySelector('.draggable-window__title-bar') as HTMLElement;
      bar.dispatchEvent(new MouseEvent('dblclick', { bubbles: true }));
      await new Promise((r) => setTimeout(r, 20));
      expect(onMaximize).toHaveBeenCalledTimes(1);
    });
  });

  // ---------------------------------------------------------------------------
  // Styling
  // ---------------------------------------------------------------------------

  describe('styling', () => {
    it('focused window has stronger box shadow', () => {
      render(createElement(DraggableWindow, { id: 'w', title: 'T', focused: true }));
      const el = container.querySelector('.draggable-window') as HTMLElement;
      expect(el.style.boxShadow).toContain('0.4');
    });

    it('unfocused window has lighter box shadow', () => {
      render(createElement(DraggableWindow, { id: 'w', title: 'T', focused: false }));
      const el = container.querySelector('.draggable-window') as HTMLElement;
      expect(el.style.boxShadow).toContain('0.2');
    });

    it('normal state has border radius', () => {
      render(createElement(DraggableWindow, { id: 'w', title: 'T', windowState: 'normal' }));
      const el = container.querySelector('.draggable-window') as HTMLElement;
      expect(el.style.borderRadius).toBe('6px');
    });

    it('window has position absolute', () => {
      render(createElement(DraggableWindow, { id: 'w', title: 'T' }));
      const el = container.querySelector('.draggable-window') as HTMLElement;
      expect(el.style.position).toBe('absolute');
    });

    it('body has overflow auto for scrollable content', () => {
      render(createElement(DraggableWindow, { id: 'w', title: 'T' }));
      const body = container.querySelector('.draggable-window__body') as HTMLElement;
      expect(body.style.overflow).toBe('auto');
    });
  });

  // ---------------------------------------------------------------------------
  // Edge cases
  // ---------------------------------------------------------------------------

  describe('edge cases', () => {
    it('renders with no children', () => {
      render(createElement(DraggableWindow, { id: 'w', title: 'T' }));
      const body = container.querySelector('.draggable-window__body') as HTMLElement;
      expect(body).toBeTruthy();
    });

    it('renders with no callbacks', () => {
      render(createElement(DraggableWindow, { id: 'w', title: 'T' }));
      // Should not throw -- click buttons with no handlers
      const closeBtn = container.querySelector('.draggable-window__btn-close') as HTMLElement;
      closeBtn.dispatchEvent(new MouseEvent('click', { bubbles: true }));
      expect(container.querySelector('.draggable-window')).toBeTruthy();
    });

    it('renders with all props set', () => {
      render(
        createElement(
          DraggableWindow,
          {
            id: 'full',
            title: 'Full Window',
            icon: '🔧',
            defaultPosition: { x: 10, y: 20 },
            defaultSize: { width: 500, height: 400 },
            minSize: { width: 100, height: 100 },
            maxSize: { width: 800, height: 600 },
            resizable: true,
            draggable: true,
            windowState: 'normal',
            focused: true,
            zIndex: 10,
            onClose: fn(),
            onMinimize: fn(),
            onMaximize: fn(),
            onFocus: fn(),
            onMove: fn(),
            onResize: fn(),
          },
          createElement('div', null, 'full content'),
        ),
      );
      const el = container.querySelector('.draggable-window') as HTMLElement;
      expect(el).toBeTruthy();
      expect(el.style.zIndex).toBe('10');
      expect(el.style.left).toBe('10px');
      expect(el.style.top).toBe('20px');
      expect(el.style.width).toBe('500px');
      expect(el.style.height).toBe('400px');
    });

    it('data:URI icon renders as img', () => {
      render(
        createElement(DraggableWindow, {
          id: 'w',
          title: 'T',
          icon: 'data:image/png;base64,abc',
        }),
      );
      const iconEl = container.querySelector('.draggable-window__icon') as HTMLElement;
      expect(iconEl.tagName).toBe('IMG');
    });

    it('path icon renders as img', () => {
      render(
        createElement(DraggableWindow, { id: 'w', title: 'T', icon: '/icons/app.svg' }),
      );
      const iconEl = container.querySelector('.draggable-window__icon') as HTMLElement;
      expect(iconEl.tagName).toBe('IMG');
    });
  });
});
