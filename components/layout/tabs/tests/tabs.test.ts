// (c) 2025-2026 Asymmetric Effort, LLC. MIT LICENSE
// SPDX-License-Identifier: MIT

import { describe, it, expect, beforeEach, vi } from 'vitest';
import { Tabs } from '../src/index';
import type { TabDefinition } from '../src/index';
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

function makeTabs(overrides?: Partial<TabDefinition>[]): TabDefinition[] {
  const defaults: TabDefinition[] = [
    { id: 'tab1', label: 'Tab One', content: createElement('div', null, 'Content 1') },
    { id: 'tab2', label: 'Tab Two', content: createElement('div', null, 'Content 2') },
    { id: 'tab3', label: 'Tab Three', content: createElement('div', null, 'Content 3') },
  ];
  if (overrides) {
    return defaults.map((t, i) => ({ ...t, ...(overrides[i] ?? {}) }));
  }
  return defaults;
}

describe('Tabs', () => {
  describe('happy paths', () => {
    it('renders with default props', () => {
      render(createElement(Tabs, { tabs: makeTabs() }));
      const el = container.querySelector('.tabs') as HTMLElement;
      expect(el).toBeTruthy();
      expect(el.classList.contains('tabs--top')).toBe(true);
      expect(el.classList.contains('tabs--line')).toBe(true);
    });

    it('renders tab buttons for each tab', () => {
      render(createElement(Tabs, { tabs: makeTabs() }));
      const buttons = container.querySelectorAll('[role="tab"]');
      expect(buttons.length).toBe(3);
    });

    it('renders tablist with correct role', () => {
      render(createElement(Tabs, { tabs: makeTabs() }));
      const tablist = container.querySelector('[role="tablist"]') as HTMLElement;
      expect(tablist).toBeTruthy();
    });

    it('renders tabpanel with correct role', () => {
      render(createElement(Tabs, { tabs: makeTabs() }));
      const panel = container.querySelector('[role="tabpanel"]') as HTMLElement;
      expect(panel).toBeTruthy();
    });

    it('first enabled tab is active by default', () => {
      render(createElement(Tabs, { tabs: makeTabs() }));
      const panel = container.querySelector('[role="tabpanel"]') as HTMLElement;
      expect(panel.textContent).toBe('Content 1');
    });

    it('renders with controlled activeTab', () => {
      render(createElement(Tabs, { tabs: makeTabs(), activeTab: 'tab2' }));
      const panel = container.querySelector('[role="tabpanel"]') as HTMLElement;
      expect(panel.textContent).toBe('Content 2');
    });

    it('switches tab on click', async () => {
      render(createElement(Tabs, { tabs: makeTabs() }));
      const buttons = container.querySelectorAll('[role="tab"]');
      (buttons[1] as HTMLElement).click();
      await new Promise((r) => setTimeout(r, 20));
      const panel = container.querySelector('[role="tabpanel"]') as HTMLElement;
      expect(panel.textContent).toBe('Content 2');
    });

    it('calls onChange on tab switch', () => {
      const onChange = vi.fn();
      render(createElement(Tabs, { tabs: makeTabs(), onChange }));
      const buttons = container.querySelectorAll('[role="tab"]');
      (buttons[2] as HTMLElement).click();
      expect(onChange).toHaveBeenCalledWith('tab3');
    });

    it('renders with position bottom', () => {
      render(createElement(Tabs, { tabs: makeTabs(), position: 'bottom' }));
      const el = container.querySelector('.tabs--bottom') as HTMLElement;
      expect(el).toBeTruthy();
      expect(el.style.flexDirection).toBe('column-reverse');
    });

    it('renders with position left', () => {
      render(createElement(Tabs, { tabs: makeTabs(), position: 'left' }));
      const el = container.querySelector('.tabs--left') as HTMLElement;
      expect(el).toBeTruthy();
      expect(el.style.flexDirection).toBe('row');
    });

    it('renders with position right', () => {
      render(createElement(Tabs, { tabs: makeTabs(), position: 'right' }));
      const el = container.querySelector('.tabs--right') as HTMLElement;
      expect(el).toBeTruthy();
      expect(el.style.flexDirection).toBe('row-reverse');
    });

    it('renders with variant card', () => {
      render(createElement(Tabs, { tabs: makeTabs(), variant: 'card' }));
      expect(container.querySelector('.tabs--card')).toBeTruthy();
    });

    it('renders with variant pill', () => {
      render(createElement(Tabs, { tabs: makeTabs(), variant: 'pill' }));
      expect(container.querySelector('.tabs--pill')).toBeTruthy();
    });

    it('renders tab icons when provided', () => {
      const tabs = makeTabs([{ icon: createElement('span', { className: 'icon-1' }, '*') }]);
      render(createElement(Tabs, { tabs }));
      expect(container.querySelector('.tabs__tab-icon')).toBeTruthy();
    });

    it('active tab has aria-selected true', () => {
      render(createElement(Tabs, { tabs: makeTabs() }));
      const buttons = container.querySelectorAll('[role="tab"]');
      expect((buttons[0] as HTMLElement).getAttribute('aria-selected')).toBe('true');
      expect((buttons[1] as HTMLElement).getAttribute('aria-selected')).toBe('false');
    });

    it('active tab has tabIndex 0, others -1', () => {
      render(createElement(Tabs, { tabs: makeTabs() }));
      const buttons = container.querySelectorAll('[role="tab"]');
      expect((buttons[0] as HTMLElement).getAttribute('tabindex')).toBe('0');
      expect((buttons[1] as HTMLElement).getAttribute('tabindex')).toBe('-1');
    });

    it('tablist has aria-orientation horizontal for top/bottom', () => {
      render(createElement(Tabs, { tabs: makeTabs(), position: 'top' }));
      const tablist = container.querySelector('[role="tablist"]') as HTMLElement;
      expect(tablist.getAttribute('aria-orientation')).toBe('horizontal');
    });

    it('tablist has aria-orientation vertical for left/right', () => {
      render(createElement(Tabs, { tabs: makeTabs(), position: 'left' }));
      const tablist = container.querySelector('[role="tablist"]') as HTMLElement;
      expect(tablist.getAttribute('aria-orientation')).toBe('vertical');
    });

    it('renders with all props set', () => {
      const onChange = vi.fn();
      render(createElement(Tabs, {
        tabs: makeTabs(),
        activeTab: 'tab3',
        onChange,
        position: 'left',
        variant: 'pill',
        className: 'my-tabs',
        style: { minHeight: '300px' },
      }));
      const el = container.querySelector('.tabs.my-tabs') as HTMLElement;
      expect(el).toBeTruthy();
      expect(el.style.minHeight).toBe('300px');
    });
  });

  describe('disabled tabs', () => {
    it('disabled tab has aria-disabled', () => {
      const tabs = makeTabs([{}, { disabled: true }, {}]);
      render(createElement(Tabs, { tabs }));
      const buttons = container.querySelectorAll('[role="tab"]');
      expect((buttons[1] as HTMLElement).getAttribute('aria-disabled')).toBe('true');
    });

    it('disabled tab has reduced opacity', () => {
      const tabs = makeTabs([{}, { disabled: true }, {}]);
      render(createElement(Tabs, { tabs }));
      const buttons = container.querySelectorAll('[role="tab"]');
      expect((buttons[1] as HTMLElement).style.opacity).toBe('0.5');
    });

    it('clicking disabled tab does not switch', () => {
      const tabs = makeTabs([{}, { disabled: true }, {}]);
      render(createElement(Tabs, { tabs }));
      const buttons = container.querySelectorAll('[role="tab"]');
      (buttons[1] as HTMLElement).click();
      const panel = container.querySelector('[role="tabpanel"]') as HTMLElement;
      expect(panel.textContent).toBe('Content 1');
    });

    it('first enabled tab is selected when first tab is disabled', () => {
      const tabs = makeTabs([{ disabled: true }, {}, {}]);
      render(createElement(Tabs, { tabs }));
      const panel = container.querySelector('[role="tabpanel"]') as HTMLElement;
      expect(panel.textContent).toBe('Content 2');
    });
  });

  describe('keyboard navigation', () => {
    it('ArrowRight moves to next tab', async () => {
      render(createElement(Tabs, { tabs: makeTabs() }));
      const buttons = container.querySelectorAll('[role="tab"]');
      const event = new KeyboardEvent('keydown', { key: 'ArrowRight', bubbles: true });
      (buttons[0] as HTMLElement).dispatchEvent(event);
      await new Promise((r) => setTimeout(r, 20));
      const panel = container.querySelector('[role="tabpanel"]') as HTMLElement;
      expect(panel.textContent).toBe('Content 2');
    });

    it('ArrowLeft moves to previous tab', async () => {
      render(createElement(Tabs, { tabs: makeTabs() }));
      // Navigate to tab2 first via click (uncontrolled mode)
      const buttons = container.querySelectorAll('[role="tab"]');
      (buttons[1] as HTMLElement).click();
      await new Promise((r) => setTimeout(r, 20));
      // Now press ArrowLeft to go back to tab1
      const updatedButtons = container.querySelectorAll('[role="tab"]');
      const event = new KeyboardEvent('keydown', { key: 'ArrowLeft', bubbles: true });
      (updatedButtons[1] as HTMLElement).dispatchEvent(event);
      await new Promise((r) => setTimeout(r, 20));
      const panel = container.querySelector('[role="tabpanel"]') as HTMLElement;
      expect(panel.textContent).toBe('Content 1');
    });

    it('Home selects first tab', async () => {
      render(createElement(Tabs, { tabs: makeTabs() }));
      // Navigate to tab3 first via click (uncontrolled mode)
      const buttons = container.querySelectorAll('[role="tab"]');
      (buttons[2] as HTMLElement).click();
      await new Promise((r) => setTimeout(r, 20));
      // Now press Home to go to first tab
      const updatedButtons = container.querySelectorAll('[role="tab"]');
      const event = new KeyboardEvent('keydown', { key: 'Home', bubbles: true });
      (updatedButtons[2] as HTMLElement).dispatchEvent(event);
      await new Promise((r) => setTimeout(r, 20));
      const panel = container.querySelector('[role="tabpanel"]') as HTMLElement;
      expect(panel.textContent).toBe('Content 1');
    });

    it('End selects last tab', async () => {
      render(createElement(Tabs, { tabs: makeTabs() }));
      const buttons = container.querySelectorAll('[role="tab"]');
      const event = new KeyboardEvent('keydown', { key: 'End', bubbles: true });
      (buttons[0] as HTMLElement).dispatchEvent(event);
      await new Promise((r) => setTimeout(r, 20));
      const panel = container.querySelector('[role="tabpanel"]') as HTMLElement;
      expect(panel.textContent).toBe('Content 3');
    });

    it('ArrowRight wraps from last to first', async () => {
      render(createElement(Tabs, { tabs: makeTabs() }));
      // Navigate to tab3 first via click (uncontrolled mode)
      const buttons = container.querySelectorAll('[role="tab"]');
      (buttons[2] as HTMLElement).click();
      await new Promise((r) => setTimeout(r, 20));
      // Now press ArrowRight to wrap to first tab
      const updatedButtons = container.querySelectorAll('[role="tab"]');
      const event = new KeyboardEvent('keydown', { key: 'ArrowRight', bubbles: true });
      (updatedButtons[2] as HTMLElement).dispatchEvent(event);
      await new Promise((r) => setTimeout(r, 20));
      const panel = container.querySelector('[role="tabpanel"]') as HTMLElement;
      expect(panel.textContent).toBe('Content 1');
    });

    it('ArrowLeft wraps from first to last', async () => {
      render(createElement(Tabs, { tabs: makeTabs() }));
      const buttons = container.querySelectorAll('[role="tab"]');
      const event = new KeyboardEvent('keydown', { key: 'ArrowLeft', bubbles: true });
      (buttons[0] as HTMLElement).dispatchEvent(event);
      await new Promise((r) => setTimeout(r, 20));
      const panel = container.querySelector('[role="tabpanel"]') as HTMLElement;
      expect(panel.textContent).toBe('Content 3');
    });

    it('vertical tabs use ArrowUp/ArrowDown', async () => {
      render(createElement(Tabs, { tabs: makeTabs(), position: 'left' }));
      const buttons = container.querySelectorAll('[role="tab"]');
      const event = new KeyboardEvent('keydown', { key: 'ArrowDown', bubbles: true });
      (buttons[0] as HTMLElement).dispatchEvent(event);
      await new Promise((r) => setTimeout(r, 20));
      const panel = container.querySelector('[role="tabpanel"]') as HTMLElement;
      expect(panel.textContent).toBe('Content 2');
    });
  });

  describe('sad paths', () => {
    it('renders with empty tabs array', () => {
      render(createElement(Tabs, { tabs: [] }));
      const buttons = container.querySelectorAll('[role="tab"]');
      expect(buttons.length).toBe(0);
    });

    it('renders with all tabs disabled', () => {
      const tabs: TabDefinition[] = [
        { id: 't1', label: 'A', disabled: true, content: 'A' },
        { id: 't2', label: 'B', disabled: true, content: 'B' },
      ];
      render(createElement(Tabs, { tabs }));
      // Should render without crashing
      expect(container.querySelector('.tabs')).toBeTruthy();
    });

    it('handles activeTab that does not exist', () => {
      render(createElement(Tabs, { tabs: makeTabs(), activeTab: 'nonexistent' }));
      const panel = container.querySelector('[role="tabpanel"]') as HTMLElement;
      // Panel should render but content may be empty
      expect(panel).toBeTruthy();
    });

    it('single tab renders correctly', () => {
      const tabs: TabDefinition[] = [
        { id: 'only', label: 'Only', content: createElement('div', null, 'solo') },
      ];
      render(createElement(Tabs, { tabs }));
      expect(container.querySelectorAll('[role="tab"]').length).toBe(1);
    });
  });
});
