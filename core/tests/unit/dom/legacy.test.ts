import { describe, it, expect, beforeEach, vi } from 'vitest';
import { render, hydrate, unmountComponentAtNode } from '../../../src/dom/legacy';
import { createElement } from '../../../src/index';

let container: HTMLDivElement;

beforeEach(() => {
  container = document.createElement('div');
  document.body.appendChild(container);
  return () => {
    document.body.removeChild(container);
  };
});

describe('legacy render', () => {
  it('renders an element into a container', () => {
    render(createElement('div', null, 'legacy'), container);
    expect(container.innerHTML).toBe('<div>legacy</div>');
  });

  it('updates on subsequent renders', () => {
    render(createElement('div', null, 'first'), container);
    expect(container.innerHTML).toBe('<div>first</div>');

    render(createElement('div', null, 'second'), container);
    expect(container.innerHTML).toBe('<div>second</div>');
  });

  it('reuses the root across calls', () => {
    render(createElement('span', null, 'a'), container);
    render(createElement('span', null, 'b'), container);
    // If root is reused, the span should update not double-render
    expect(container.querySelectorAll('span')).toHaveLength(1);
    expect(container.innerHTML).toBe('<span>b</span>');
  });

  it('calls callback after render', async () => {
    const callback = vi.fn();
    render(createElement('div', null, 'cb'), container, callback);
    // Callback is async via Promise.resolve().then
    await new Promise((r) => setTimeout(r, 10));
    expect(callback).toHaveBeenCalledTimes(1);
  });

  it('works without callback', () => {
    expect(() => {
      render(createElement('div', null, 'no-cb'), container);
    }).not.toThrow();
  });
});

describe('legacy hydrate', () => {
  it('hydrates existing content', () => {
    container.innerHTML = '<div>server</div>';
    hydrate(createElement('div', null, 'server'), container);
    // Should not throw
    expect(container.querySelector('div')).not.toBeNull();
  });

  it('calls callback after hydrate', async () => {
    const callback = vi.fn();
    hydrate(createElement('div', null, 'hydrate'), container, callback);
    await new Promise((r) => setTimeout(r, 10));
    expect(callback).toHaveBeenCalledTimes(1);
  });

  it('works without callback', () => {
    expect(() => {
      hydrate(createElement('div', null, 'no-cb'), container);
    }).not.toThrow();
  });
});

describe('unmountComponentAtNode', () => {
  it('returns true when a root exists', () => {
    render(createElement('div', null, 'mounted'), container);
    expect(unmountComponentAtNode(container)).toBe(true);
  });

  it('returns false when no root exists', () => {
    expect(unmountComponentAtNode(container)).toBe(false);
  });

  it('clears the container', () => {
    render(createElement('div', null, 'clear-me'), container);
    expect(container.innerHTML).toBe('<div>clear-me</div>');
    unmountComponentAtNode(container);
    expect(container.innerHTML).toBe('');
  });

  it('returns false on second call (root already removed)', () => {
    render(createElement('div', null, 'once'), container);
    expect(unmountComponentAtNode(container)).toBe(true);
    expect(unmountComponentAtNode(container)).toBe(false);
  });
});
