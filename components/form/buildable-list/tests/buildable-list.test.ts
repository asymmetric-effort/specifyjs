// (c) 2025-2026 Asymmetric Effort, LLC. MIT LICENSE
// SPDX-License-Identifier: MIT

import { describe, it, expect, vi } from '@asymmetric-effort/nogginlessdom';
import { BuildableList } from '../src/index';
import { createElement } from 'specifyjs';
import { createRoot } from 'specifyjs/dom';

function render(vnode: unknown): HTMLElement {
  const container = document.createElement('div');
  const root = createRoot(container);
  root.render(vnode as any);
  return container;
}

const flush = () => new Promise((r) => setTimeout(r, 10));

describe('BuildableList', () => {
  describe('rendering', () => {
    it('renders with empty value', () => {
      const el = render(createElement(BuildableList, { value: [], onChange: vi.fn() }));
      const list = el.querySelector('[role="list"]');
      expect(list).toBeTruthy();
      const items = el.querySelectorAll('[role="listitem"]');
      expect(items.length).toBe(0);
    });

    it('renders list items', () => {
      const el = render(
        createElement(BuildableList, { value: ['alpha', 'beta', 'gamma'], onChange: vi.fn() }),
      );
      const items = el.querySelectorAll('[role="listitem"]');
      expect(items.length).toBe(3);
      expect(items[0].textContent).toBe('alpha');
      expect(items[1].textContent).toBe('beta');
      expect(items[2].textContent).toBe('gamma');
    });

    it('deduplicates value prop', () => {
      const el = render(
        createElement(BuildableList, { value: ['a', 'b', 'a'], onChange: vi.fn() }),
      );
      const items = el.querySelectorAll('[role="listitem"]');
      expect(items.length).toBe(2);
    });

    it('renders with label', () => {
      const el = render(
        createElement(BuildableList, { value: [], onChange: vi.fn(), label: 'Tags' }),
      );
      const label = el.querySelector('label');
      expect(label).toBeTruthy();
      expect(label!.textContent).toContain('Tags');
    });
  });

  describe('add button', () => {
    it('has a + button present', () => {
      const el = render(createElement(BuildableList, { value: [], onChange: vi.fn() }));
      const btn = el.querySelector('button[aria-label="Add item"]');
      expect(btn).toBeTruthy();
      expect(btn!.textContent).toBe('+');
    });

    it('clicking + opens the input', async () => {
      const el = render(createElement(BuildableList, { value: [], onChange: vi.fn() }));
      const btn = el.querySelector('button[aria-label="Add item"]') as HTMLButtonElement;
      btn.click();
      await flush();
      const input = el.querySelector('.buildable-list__input-row input') as HTMLInputElement;
      expect(input).toBeTruthy();
    });
  });

  describe('adding items', () => {
    it('adding an item calls onChange with appended value', async () => {
      const handler = vi.fn();
      const el = render(
        createElement(BuildableList, { value: ['existing'], onChange: handler }),
      );
      // Open add input
      const addBtn = el.querySelector('button[aria-label="Add item"]') as HTMLButtonElement;
      addBtn.click();
      await flush();
      // Type in input
      const input = el.querySelector('.buildable-list__input-row input') as HTMLInputElement;
      input.value = 'new-item';
      input.dispatchEvent(new Event('input', { bubbles: true }));
      await flush();
      // Click OK
      const okBtn = el.querySelector('button[aria-label="Confirm"]') as HTMLButtonElement;
      okBtn.click();
      expect(handler).toHaveBeenCalledWith(['existing', 'new-item']);
    });

    it('duplicate items are rejected', async () => {
      const handler = vi.fn();
      const el = render(
        createElement(BuildableList, { value: ['dup'], onChange: handler }),
      );
      const addBtn = el.querySelector('button[aria-label="Add item"]') as HTMLButtonElement;
      addBtn.click();
      await flush();
      const input = el.querySelector('.buildable-list__input-row input') as HTMLInputElement;
      input.value = 'dup';
      input.dispatchEvent(new Event('input', { bubbles: true }));
      await flush();
      const okBtn = el.querySelector('button[aria-label="Confirm"]') as HTMLButtonElement;
      okBtn.click();
      expect(handler).not.toHaveBeenCalled();
    });

    it('empty input is not added', async () => {
      const handler = vi.fn();
      const el = render(
        createElement(BuildableList, { value: [], onChange: handler }),
      );
      const addBtn = el.querySelector('button[aria-label="Add item"]') as HTMLButtonElement;
      addBtn.click();
      await flush();
      const okBtn = el.querySelector('button[aria-label="Confirm"]') as HTMLButtonElement;
      okBtn.click();
      expect(handler).not.toHaveBeenCalled();
    });

    it('trims whitespace from input', async () => {
      const handler = vi.fn();
      const el = render(
        createElement(BuildableList, { value: [], onChange: handler }),
      );
      const addBtn = el.querySelector('button[aria-label="Add item"]') as HTMLButtonElement;
      addBtn.click();
      await flush();
      const input = el.querySelector('.buildable-list__input-row input') as HTMLInputElement;
      input.value = '  trimmed  ';
      input.dispatchEvent(new Event('input', { bubbles: true }));
      await flush();
      const okBtn = el.querySelector('button[aria-label="Confirm"]') as HTMLButtonElement;
      okBtn.click();
      expect(handler).toHaveBeenCalledWith(['trimmed']);
    });
  });

  describe('editing items', () => {
    it('clicking an item opens it for editing', async () => {
      const el = render(
        createElement(BuildableList, { value: ['editable'], onChange: vi.fn() }),
      );
      const item = el.querySelector('[role="listitem"]') as HTMLElement;
      item.click();
      await flush();
      const input = el.querySelector('.buildable-list__input-row input') as HTMLInputElement;
      expect(input).toBeTruthy();
      expect(input.value).toBe('editable');
    });

    it('editing and confirming calls onChange with updated value', async () => {
      const handler = vi.fn();
      const el = render(
        createElement(BuildableList, { value: ['old', 'keep'], onChange: handler }),
      );
      const items = el.querySelectorAll('[role="listitem"]');
      (items[0] as HTMLElement).click();
      await flush();
      const input = el.querySelector('.buildable-list__input-row input') as HTMLInputElement;
      input.value = 'new';
      input.dispatchEvent(new Event('input', { bubbles: true }));
      await flush();
      const okBtn = el.querySelector('button[aria-label="Confirm"]') as HTMLButtonElement;
      okBtn.click();
      expect(handler).toHaveBeenCalledWith(['new', 'keep']);
    });

    it('editing to a duplicate is rejected', async () => {
      const handler = vi.fn();
      const el = render(
        createElement(BuildableList, { value: ['a', 'b'], onChange: handler }),
      );
      const items = el.querySelectorAll('[role="listitem"]');
      (items[0] as HTMLElement).click();
      await flush();
      const input = el.querySelector('.buildable-list__input-row input') as HTMLInputElement;
      input.value = 'b';
      input.dispatchEvent(new Event('input', { bubbles: true }));
      await flush();
      const okBtn = el.querySelector('button[aria-label="Confirm"]') as HTMLButtonElement;
      okBtn.click();
      expect(handler).not.toHaveBeenCalled();
    });

    it('editing to same value closes input without calling onChange', async () => {
      const handler = vi.fn();
      const el = render(
        createElement(BuildableList, { value: ['same'], onChange: handler }),
      );
      const item = el.querySelector('[role="listitem"]') as HTMLElement;
      item.click();
      await flush();
      const okBtn = el.querySelector('button[aria-label="Confirm"]') as HTMLButtonElement;
      okBtn.click();
      expect(handler).not.toHaveBeenCalled();
    });
  });

  describe('deleting items', () => {
    it('deleting an item calls onChange without that item', async () => {
      const handler = vi.fn();
      const el = render(
        createElement(BuildableList, { value: ['keep', 'remove'], onChange: handler }),
      );
      const items = el.querySelectorAll('[role="listitem"]');
      (items[1] as HTMLElement).click();
      await flush();
      const deleteBtn = el.querySelector('button[aria-label="Delete"]') as HTMLButtonElement;
      expect(deleteBtn).toBeTruthy();
      deleteBtn.click();
      expect(handler).toHaveBeenCalledWith(['keep']);
    });

    it('delete button is only shown in edit mode', async () => {
      const el = render(
        createElement(BuildableList, { value: ['item'], onChange: vi.fn() }),
      );
      // Open add mode
      const addBtn = el.querySelector('button[aria-label="Add item"]') as HTMLButtonElement;
      addBtn.click();
      await flush();
      const deleteBtn = el.querySelector('button[aria-label="Delete"]');
      expect(deleteBtn).toBeFalsy();
    });
  });

  describe('disabled state', () => {
    it('disabled prevents interaction', () => {
      const handler = vi.fn();
      const el = render(
        createElement(BuildableList, { value: ['item'], onChange: handler, disabled: true }),
      );
      // Add button should be disabled
      const addBtn = el.querySelector('button[aria-label="Add item"]') as HTMLButtonElement;
      expect(addBtn.getAttribute('disabled')).toBe('');
    });

    it('disabled items are not clickable', async () => {
      const el = render(
        createElement(BuildableList, { value: ['item'], onChange: vi.fn(), disabled: true }),
      );
      const item = el.querySelector('[role="listitem"]') as HTMLElement;
      item.click();
      await flush();
      const input = el.querySelector('.buildable-list__input-row input');
      expect(input).toBeFalsy();
    });
  });

  describe('orientation', () => {
    it('horizontal orientation renders with delimiter', () => {
      const el = render(
        createElement(BuildableList, {
          value: ['a', 'b', 'c'],
          onChange: vi.fn(),
          orientation: 'horizontal',
        }),
      );
      const list = el.querySelector('[role="list"]') as HTMLElement;
      expect(list.style.flexDirection).toBe('row');
      // Should have delimiter spans between items
      const delimiters = list.querySelectorAll('[aria-hidden="true"]');
      expect(delimiters.length).toBe(2);
      expect(delimiters[0].textContent).toBe(', ');
    });

    it('horizontal orientation uses custom delimiter', () => {
      const el = render(
        createElement(BuildableList, {
          value: ['a', 'b'],
          onChange: vi.fn(),
          orientation: 'horizontal',
          delimiter: ' | ',
        }),
      );
      const delimiters = el.querySelectorAll('[aria-hidden="true"]');
      expect(delimiters.length).toBe(1);
      expect(delimiters[0].textContent).toBe(' | ');
    });

    it('vertical orientation renders items in column', () => {
      const el = render(
        createElement(BuildableList, {
          value: ['a', 'b'],
          onChange: vi.fn(),
          orientation: 'vertical',
        }),
      );
      const list = el.querySelector('[role="list"]') as HTMLElement;
      expect(list.style.flexDirection).toBe('column');
      // No delimiter spans in vertical mode
      const delimiters = list.querySelectorAll('[aria-hidden="true"]');
      expect(delimiters.length).toBe(0);
    });
  });

  describe('inputPosition', () => {
    it('inputPosition below places input after list', async () => {
      const el = render(
        createElement(BuildableList, {
          value: ['item'],
          onChange: vi.fn(),
          inputPosition: 'below',
        }),
      );
      const addBtn = el.querySelector('button[aria-label="Add item"]') as HTMLButtonElement;
      addBtn.click();
      await flush();
      const container = el.querySelector('.buildable-list') as HTMLElement;
      const children = Array.from(container.children);
      // Input row should be the last child
      const inputRow = el.querySelector('.buildable-list__input-row') as HTMLElement;
      expect(inputRow).toBeTruthy();
      expect(children[children.length - 1]).toBe(inputRow);
    });

    it('inputPosition above places input before list', async () => {
      const el = render(
        createElement(BuildableList, {
          value: ['item'],
          onChange: vi.fn(),
          inputPosition: 'above',
        }),
      );
      const addBtn = el.querySelector('button[aria-label="Add item"]') as HTMLButtonElement;
      addBtn.click();
      await flush();
      const container = el.querySelector('.buildable-list') as HTMLElement;
      const children = Array.from(container.children);
      const inputRow = el.querySelector('.buildable-list__input-row') as HTMLElement;
      expect(inputRow).toBeTruthy();
      expect(children[0]).toBe(inputRow);
    });
  });

  describe('maxItems', () => {
    it('maxItems prevents adding beyond limit', () => {
      const handler = vi.fn();
      const el = render(
        createElement(BuildableList, {
          value: ['a', 'b'],
          onChange: handler,
          maxItems: 2,
        }),
      );
      const addBtn = el.querySelector('button[aria-label="Add item"]') as HTMLButtonElement;
      expect(addBtn.getAttribute('disabled')).toBe('');
    });

    it('maxItems allows adding when under limit', () => {
      const el = render(
        createElement(BuildableList, {
          value: ['a'],
          onChange: vi.fn(),
          maxItems: 3,
        }),
      );
      const addBtn = el.querySelector('button[aria-label="Add item"]') as HTMLButtonElement;
      expect(addBtn.getAttribute('disabled')).toBe(null);
    });
  });

  describe('keyboard', () => {
    it('Enter submits the input', async () => {
      const handler = vi.fn();
      const el = render(
        createElement(BuildableList, { value: [], onChange: handler }),
      );
      const addBtn = el.querySelector('button[aria-label="Add item"]') as HTMLButtonElement;
      addBtn.click();
      await flush();
      const input = el.querySelector('.buildable-list__input-row input') as HTMLInputElement;
      input.value = 'via-enter';
      input.dispatchEvent(new Event('input', { bubbles: true }));
      await flush();
      input.dispatchEvent(new KeyboardEvent('keydown', { key: 'Enter', bubbles: true }));
      expect(handler).toHaveBeenCalledWith(['via-enter']);
    });

    it('Escape cancels the input', async () => {
      const el = render(
        createElement(BuildableList, { value: [], onChange: vi.fn() }),
      );
      const addBtn = el.querySelector('button[aria-label="Add item"]') as HTMLButtonElement;
      addBtn.click();
      await flush();
      let input = el.querySelector('.buildable-list__input-row input') as HTMLInputElement;
      expect(input).toBeTruthy();
      input.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape', bubbles: true }));
      await flush();
      input = el.querySelector('.buildable-list__input-row input') as HTMLInputElement;
      expect(input).toBeFalsy();
    });

    it('+ key on container opens add input', async () => {
      const el = render(
        createElement(BuildableList, { value: [], onChange: vi.fn() }),
      );
      const container = el.querySelector('.buildable-list') as HTMLElement;
      container.dispatchEvent(new KeyboardEvent('keydown', { key: '+', bubbles: true }));
      await flush();
      const input = el.querySelector('.buildable-list__input-row input');
      expect(input).toBeTruthy();
    });

    it('Tab navigates between list items', () => {
      const el = render(
        createElement(BuildableList, { value: ['a', 'b', 'c'], onChange: vi.fn() }),
      );
      const items = el.querySelectorAll('[role="listitem"]');
      expect(items.length).toBe(3);
      for (let i = 0; i < items.length; i++) {
        // Items should be focusable — tabIndex prop is set on the element
        const tabVal = (items[i] as HTMLElement).getAttribute('tabIndex') ?? (items[i] as HTMLElement).getAttribute('tabindex');
        expect(tabVal).toBe('0');
      }
    });
  });

  describe('ARIA attributes', () => {
    it('list has role="list"', () => {
      const el = render(
        createElement(BuildableList, { value: ['a'], onChange: vi.fn() }),
      );
      expect(el.querySelector('[role="list"]')).toBeTruthy();
    });

    it('items have role="listitem"', () => {
      const el = render(
        createElement(BuildableList, { value: ['a'], onChange: vi.fn() }),
      );
      expect(el.querySelector('[role="listitem"]')).toBeTruthy();
    });

    it('add button has aria-label="Add item"', () => {
      const el = render(
        createElement(BuildableList, { value: [], onChange: vi.fn() }),
      );
      expect(el.querySelector('[aria-label="Add item"]')).toBeTruthy();
    });

    it('confirm button has aria-label="Confirm"', async () => {
      const el = render(
        createElement(BuildableList, { value: [], onChange: vi.fn() }),
      );
      const addBtn = el.querySelector('button[aria-label="Add item"]') as HTMLButtonElement;
      addBtn.click();
      await flush();
      expect(el.querySelector('[aria-label="Confirm"]')).toBeTruthy();
    });

    it('delete button has aria-label="Delete"', async () => {
      const el = render(
        createElement(BuildableList, { value: ['item'], onChange: vi.fn() }),
      );
      const item = el.querySelector('[role="listitem"]') as HTMLElement;
      item.click();
      await flush();
      expect(el.querySelector('[aria-label="Delete"]')).toBeTruthy();
    });
  });

  describe('placeholder', () => {
    it('uses default placeholder', async () => {
      const el = render(
        createElement(BuildableList, { value: [], onChange: vi.fn() }),
      );
      const addBtn = el.querySelector('button[aria-label="Add item"]') as HTMLButtonElement;
      addBtn.click();
      await flush();
      const input = el.querySelector('.buildable-list__input-row input') as HTMLInputElement;
      expect(input).toBeTruthy();
      expect(input.getAttribute('placeholder')).toBe('Add item...');
    });

    it('uses custom placeholder', async () => {
      const el = render(
        createElement(BuildableList, { value: [], onChange: vi.fn(), placeholder: 'Enter tag' }),
      );
      const addBtn = el.querySelector('button[aria-label="Add item"]') as HTMLButtonElement;
      addBtn.click();
      await flush();
      const input = el.querySelector('.buildable-list__input-row input') as HTMLInputElement;
      expect(input).toBeTruthy();
      expect(input.getAttribute('placeholder')).toBe('Enter tag');
    });
  });
});
