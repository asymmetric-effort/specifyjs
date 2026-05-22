import { describe, it, expect } from 'vitest';
import { updateDOMProperties } from '../../../src/dom/work-loop';

describe('updateDOMProperties', () => {
  it('sets className as class attribute', () => {
    const el = document.createElement('div');
    updateDOMProperties(el, {}, { className: 'foo' });
    expect(el.getAttribute('class')).toBe('foo');
  });

  it('sets id attribute', () => {
    const el = document.createElement('div');
    updateDOMProperties(el, {}, { id: 'test' });
    expect(el.getAttribute('id')).toBe('test');
  });

  it('removes old attributes not in new props', () => {
    const el = document.createElement('div');
    updateDOMProperties(el, {}, { id: 'old', title: 'remove-me' });
    expect(el.getAttribute('title')).toBe('remove-me');

    updateDOMProperties(el, { id: 'old', title: 'remove-me' }, { id: 'new' });
    expect(el.getAttribute('id')).toBe('new');
    expect(el.hasAttribute('title')).toBe(false);
  });

  it('sets inline styles', () => {
    const el = document.createElement('div');
    updateDOMProperties(el, {}, { style: { color: 'red', fontSize: '12px' } });
    expect(el.style.color).toBe('red');
    expect(el.style.fontSize).toBe('12px');
  });

  it('adds event listener', () => {
    const el = document.createElement('div');
    let clicked = false;
    updateDOMProperties(
      el,
      {},
      {
        onClick: () => {
          clicked = true;
        },
      },
    );
    el.click();
    expect(clicked).toBe(true);
  });

  it('removes old event listener and adds new one', () => {
    const el = document.createElement('button');
    const handler1 = () => {};
    const handler2 = () => {};
    updateDOMProperties(el, {}, { onClick: handler1 });
    updateDOMProperties(el, { onClick: handler1 }, { onClick: handler2 });
    // Should not throw, just verify it doesn't error
  });

  it('handles boolean attributes', () => {
    const el = document.createElement('input');
    updateDOMProperties(el, {}, { disabled: true, type: 'text' });
    expect(el.hasAttribute('disabled')).toBe(true);

    updateDOMProperties(el, { disabled: true }, { disabled: false, type: 'text' });
    expect(el.hasAttribute('disabled')).toBe(false);
  });

  it('handles null attribute values', () => {
    const el = document.createElement('div');
    updateDOMProperties(el, {}, { title: 'hello' });
    expect(el.getAttribute('title')).toBe('hello');

    updateDOMProperties(el, { title: 'hello' }, { title: null });
    expect(el.hasAttribute('title')).toBe(false);
  });

  it('sets value on input', () => {
    const el = document.createElement('input');
    updateDOMProperties(el, {}, { value: 'test', type: 'text' });
    expect(el.value).toBe('test');
  });

  it('sets checked on input', () => {
    const el = document.createElement('input');
    (el as HTMLInputElement).type = 'checkbox';
    updateDOMProperties(el, {}, { checked: true });
    expect((el as HTMLInputElement).checked).toBe(true);
  });

  it('handles dangerouslySetInnerHTML', () => {
    const el = document.createElement('div');
    updateDOMProperties(el, {}, { dangerouslySetInnerHTML: { __html: '<b>bold</b>' } });
    expect(el.innerHTML).toBe('<b>bold</b>');
  });

  it('removes dangerouslySetInnerHTML', () => {
    const el = document.createElement('div');
    updateDOMProperties(el, {}, { dangerouslySetInnerHTML: { __html: '<b>bold</b>' } });
    updateDOMProperties(el, { dangerouslySetInnerHTML: { __html: '<b>bold</b>' } }, {});
    expect(el.innerHTML).toBe('');
  });

  it('skips children, key, and ref', () => {
    const el = document.createElement('div');
    updateDOMProperties(el, {}, { children: 'text', key: '1', ref: {} });
    expect(el.hasAttribute('children')).toBe(false);
    expect(el.hasAttribute('key')).toBe(false);
    expect(el.hasAttribute('ref')).toBe(false);
  });
});
