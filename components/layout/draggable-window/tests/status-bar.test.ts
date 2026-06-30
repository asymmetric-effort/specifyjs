// (c) 2025-2026 Asymmetric Effort, LLC. MIT LICENSE
// SPDX-License-Identifier: MIT

import { describe, it, expect, vi, beforeEach } from '@asymmetric-effort/nogginlessdom';
import { StatusBar } from '../src/StatusBar';
import { DraggableWindow } from '../src/index';
import { createElement } from 'specifyjs';
import { createRoot } from 'specifyjs/dom';

let container: HTMLDivElement;

beforeEach(() => {
  container = document.createElement('div');
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
// StatusBar component tests
// ---------------------------------------------------------------------------

describe('StatusBar', () => {
  describe('basic rendering', () => {
    it('renders with items showing correct labels', () => {
      render(createElement(StatusBar, {
        items: [
          { key: 'lang', label: 'TypeScript' },
          { key: 'line', label: 'Ln 42, Col 8' },
        ],
      }));
      const bar = container.querySelector('.status-bar') as HTMLElement;
      expect(bar).toBeTruthy();
      expect(bar.textContent).toContain('TypeScript');
      expect(bar.textContent).toContain('Ln 42, Col 8');
    });

    it('renders with role="status" and aria-label', () => {
      render(createElement(StatusBar, {
        items: [{ key: 'a', label: 'Test' }],
      }));
      const bar = container.querySelector('.status-bar') as HTMLElement;
      expect(bar.getAttribute('role')).toBe('status');
      expect(bar.getAttribute('aria-label')).toBe('Status bar');
    });

    it('renders empty items without error', () => {
      render(createElement(StatusBar, { items: [] }));
      const bar = container.querySelector('.status-bar') as HTMLElement;
      expect(bar).toBeTruthy();
    });
  });

  describe('left/right alignment grouping', () => {
    it('groups left-aligned items in the left container', () => {
      render(createElement(StatusBar, {
        items: [
          { key: 'a', label: 'Left Item' },
          { key: 'b', label: 'Also Left', align: 'left' },
        ],
      }));
      const leftGroup = container.querySelector('.status-bar__left') as HTMLElement;
      expect(leftGroup.textContent).toContain('Left Item');
      expect(leftGroup.textContent).toContain('Also Left');
    });

    it('groups right-aligned items in the right container', () => {
      render(createElement(StatusBar, {
        items: [
          { key: 'a', label: 'Right Item', align: 'right' },
        ],
      }));
      const rightGroup = container.querySelector('.status-bar__right') as HTMLElement;
      expect(rightGroup.textContent).toContain('Right Item');
      const leftGroup = container.querySelector('.status-bar__left') as HTMLElement;
      expect(leftGroup.textContent).not.toContain('Right Item');
    });

    it('separates left and right items correctly', () => {
      render(createElement(StatusBar, {
        items: [
          { key: 'l1', label: 'Left One' },
          { key: 'r1', label: 'Right One', align: 'right' },
          { key: 'l2', label: 'Left Two', align: 'left' },
          { key: 'r2', label: 'Right Two', align: 'right' },
        ],
      }));
      const leftGroup = container.querySelector('.status-bar__left') as HTMLElement;
      const rightGroup = container.querySelector('.status-bar__right') as HTMLElement;
      expect(leftGroup.textContent).toContain('Left One');
      expect(leftGroup.textContent).toContain('Left Two');
      expect(rightGroup.textContent).toContain('Right One');
      expect(rightGroup.textContent).toContain('Right Two');
    });

    it('defaults align to left when not specified', () => {
      render(createElement(StatusBar, {
        items: [{ key: 'a', label: 'Default Align' }],
      }));
      const leftGroup = container.querySelector('.status-bar__left') as HTMLElement;
      expect(leftGroup.textContent).toContain('Default Align');
    });
  });

  describe('onClick behavior', () => {
    it('items with onClick have pointer cursor', () => {
      const onClick = vi.fn();
      render(createElement(StatusBar, {
        items: [{ key: 'click', label: 'Clickable', onClick }],
      }));
      const item = container.querySelector('.status-bar__item--clickable') as HTMLElement;
      expect(item).toBeTruthy();
      expect(item.style.cursor).toBe('pointer');
    });

    it('items without onClick have default cursor', () => {
      render(createElement(StatusBar, {
        items: [{ key: 'static', label: 'Static' }],
      }));
      const item = container.querySelector('.status-bar__item') as HTMLElement;
      expect(item.style.cursor).toBe('default');
      expect(item.classList.contains('status-bar__item--clickable')).toBe(false);
    });

    it('calls onClick when item is clicked', async () => {
      const onClick = vi.fn();
      render(createElement(StatusBar, {
        items: [{ key: 'btn', label: 'Click Me', onClick }],
      }));
      const item = container.querySelector('.status-bar__item--clickable') as HTMLElement;
      item.dispatchEvent(new MouseEvent('click', { bubbles: true }));
      await new Promise((r) => setTimeout(r, 20));
      expect(onClick).toHaveBeenCalledTimes(1);
    });
  });

  describe('icon rendering', () => {
    it('renders icon when provided', () => {
      render(createElement(StatusBar, {
        items: [{ key: 'a', label: 'TypeScript', icon: '\u{1F4DD}' }],
      }));
      const iconEl = container.querySelector('.status-bar__item-icon') as HTMLElement;
      expect(iconEl).toBeTruthy();
      expect(iconEl.textContent).toBe('\u{1F4DD}');
    });

    it('does not render icon element when icon is not provided', () => {
      render(createElement(StatusBar, {
        items: [{ key: 'a', label: 'No Icon' }],
      }));
      const iconEl = container.querySelector('.status-bar__item-icon');
      expect(iconEl).toBeFalsy();
    });

    it('renders icon alongside label', () => {
      render(createElement(StatusBar, {
        items: [{ key: 'a', label: 'Live', icon: '\u25CF' }],
      }));
      const item = container.querySelector('.status-bar__item') as HTMLElement;
      expect(item.textContent).toContain('\u25CF');
      expect(item.textContent).toContain('Live');
    });
  });

  describe('custom styling', () => {
    it('applies custom backgroundColor', () => {
      render(createElement(StatusBar, {
        items: [{ key: 'a', label: 'Test' }],
        backgroundColor: '#ff0000',
      }));
      const bar = container.querySelector('.status-bar') as HTMLElement;
      // nogginlessdom stores hex as-is; jsdom normalizes to rgb
      expect(bar.style.backgroundColor).toContain('ff0000');
    });

    it('applies custom color', () => {
      render(createElement(StatusBar, {
        items: [{ key: 'a', label: 'Test' }],
        color: '#000000',
      }));
      const bar = container.querySelector('.status-bar') as HTMLElement;
      expect(bar.style.color).toContain('000000');
    });

    it('applies custom height', () => {
      render(createElement(StatusBar, {
        items: [{ key: 'a', label: 'Test' }],
        height: 30,
      }));
      const bar = container.querySelector('.status-bar') as HTMLElement;
      expect(bar.style.height).toBe('30px');
    });

    it('uses default backgroundColor when not specified', () => {
      render(createElement(StatusBar, {
        items: [{ key: 'a', label: 'Test' }],
      }));
      const bar = container.querySelector('.status-bar') as HTMLElement;
      expect(bar.style.backgroundColor).toContain('007acc');
    });

    it('uses default color when not specified', () => {
      render(createElement(StatusBar, {
        items: [{ key: 'a', label: 'Test' }],
      }));
      const bar = container.querySelector('.status-bar') as HTMLElement;
      expect(bar.style.color).toContain('ffffff');
    });

    it('uses default height of 22px when not specified', () => {
      render(createElement(StatusBar, {
        items: [{ key: 'a', label: 'Test' }],
      }));
      const bar = container.querySelector('.status-bar') as HTMLElement;
      expect(bar.style.height).toBe('22px');
    });
  });
});

// ---------------------------------------------------------------------------
// DraggableWindow + StatusBar integration tests
// ---------------------------------------------------------------------------

describe('DraggableWindow with StatusBar', () => {
  it('renders StatusBar when statusBar prop is provided', () => {
    render(createElement(DraggableWindow, {
      id: 'w1',
      title: 'Test',
      statusBar: {
        items: [
          { key: 'lang', label: 'TypeScript' },
          { key: 'line', label: 'Ln 1, Col 1', align: 'right' },
        ],
      },
    }));
    const statusBar = container.querySelector('.status-bar') as HTMLElement;
    expect(statusBar).toBeTruthy();
    expect(statusBar.textContent).toContain('TypeScript');
    expect(statusBar.textContent).toContain('Ln 1, Col 1');
  });

  it('does not render StatusBar when statusBar prop is false', () => {
    render(createElement(DraggableWindow, {
      id: 'w2',
      title: 'Test',
      statusBar: false,
    }));
    const statusBar = container.querySelector('.status-bar');
    expect(statusBar).toBeFalsy();
  });

  it('does not render StatusBar when statusBar prop is undefined', () => {
    render(createElement(DraggableWindow, {
      id: 'w3',
      title: 'Test',
    }));
    const statusBar = container.querySelector('.status-bar');
    expect(statusBar).toBeFalsy();
  });

  it('renders StatusBar with custom styling inside DraggableWindow', () => {
    render(createElement(DraggableWindow, {
      id: 'w4',
      title: 'Styled',
      statusBar: {
        items: [{ key: 'a', label: 'Info' }],
        backgroundColor: '#333333',
        color: '#cccccc',
        height: 28,
      },
    }));
    const statusBar = container.querySelector('.status-bar') as HTMLElement;
    expect(statusBar).toBeTruthy();
    expect(statusBar.style.height).toBe('28px');
  });

  it('renders body and StatusBar as siblings within the window', () => {
    render(createElement(DraggableWindow, {
      id: 'w5',
      title: 'Layout',
      statusBar: {
        items: [{ key: 'a', label: 'Ready' }],
      },
    }, createElement('p', null, 'Body content')));
    const body = container.querySelector('.draggable-window__body') as HTMLElement;
    const statusBar = container.querySelector('.status-bar') as HTMLElement;
    expect(body).toBeTruthy();
    expect(statusBar).toBeTruthy();
    expect(body.textContent).toBe('Body content');
    expect(statusBar.textContent).toContain('Ready');
  });

  it('StatusBar has flexShrink 0 to not collapse', () => {
    render(createElement(DraggableWindow, {
      id: 'w6',
      title: 'Flex',
      statusBar: {
        items: [{ key: 'a', label: 'Fixed' }],
      },
    }));
    const statusBar = container.querySelector('.status-bar') as HTMLElement;
    expect(statusBar.style.flexShrink).toBe('0');
  });

  it('body retains flex 1 when StatusBar is present', () => {
    render(createElement(DraggableWindow, {
      id: 'w7',
      title: 'Flex',
      statusBar: {
        items: [{ key: 'a', label: 'Bar' }],
      },
    }));
    const body = container.querySelector('.draggable-window__body') as HTMLElement;
    expect(body.style.flex).toBe('1');
  });
});
