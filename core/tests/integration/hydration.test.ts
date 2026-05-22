/**
 * Integration tests for hydrateRoot — verifying DOM node reuse.
 */
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { createElement } from '../../src/index';
import { hydrateRoot } from '../../src/dom/create-root';
import { renderToString } from '../../src/server/render-to-string';
import { useState, useEffect } from '../../src/hooks/index';
import { Component } from '../../src/components/component';

let container: HTMLDivElement;

beforeEach(() => {
  container = document.createElement('div');
  document.body.appendChild(container);
  return () => {
    document.body.removeChild(container);
  };
});

describe('hydrateRoot — DOM reuse', () => {
  it('reuses existing DOM elements', () => {
    // Server-render
    const html = renderToString(createElement('div', { id: 'app' }, 'Hello'));
    container.innerHTML = html;

    const existingDiv = container.querySelector('#app')!;
    expect(existingDiv).toBeTruthy();

    // Hydrate
    const root = hydrateRoot(container, createElement('div', { id: 'app' }, 'Hello'));

    // The same DOM element should be reused (reference equality)
    const hydratedDiv = container.querySelector('#app')!;
    expect(hydratedDiv).toBe(existingDiv);
    root.unmount();
  });

  it('reuses nested DOM elements', () => {
    const vdom = createElement(
      'div',
      null,
      createElement('h1', null, 'Title'),
      createElement('p', null, 'Content'),
    );
    container.innerHTML = renderToString(vdom);

    const existingH1 = container.querySelector('h1')!;
    const existingP = container.querySelector('p')!;

    const root = hydrateRoot(container, vdom);

    expect(container.querySelector('h1')).toBe(existingH1);
    expect(container.querySelector('p')).toBe(existingP);
    root.unmount();
  });

  it('preserves text content', () => {
    container.innerHTML = '<span>hello world</span>';
    const vdom = createElement('span', null, 'hello world');

    const existingSpan = container.querySelector('span')!;
    const root = hydrateRoot(container, vdom);

    expect(container.querySelector('span')).toBe(existingSpan);
    expect(container.textContent).toBe('hello world');
    root.unmount();
  });

  it('attaches event handlers during hydration', () => {
    const handler = vi.fn();
    const vdom = createElement('button', { onClick: handler }, 'Click me');
    container.innerHTML = renderToString(vdom);

    const root = hydrateRoot(container, vdom);

    // Click the hydrated button
    const button = container.querySelector('button')!;
    button.click();
    expect(handler).toHaveBeenCalledOnce();
    root.unmount();
  });

  it('hydrates function components', () => {
    function Greeting({ name }: { name: string }) {
      return createElement('div', null, createElement('span', null, `Hello, ${name}!`));
    }
    // Pre-populate with matching server HTML
    container.innerHTML = '<div><span>Hello, World!</span></div>';
    const existingDiv = container.querySelector('div')!;

    const root = hydrateRoot(container, createElement(Greeting, { name: 'World' }));

    expect(container.querySelector('div')).toBe(existingDiv);
    expect(container.textContent).toBe('Hello, World!');
    root.unmount();
  });

  it('hydrates class components', () => {
    class MyComp extends Component<{ value: string }> {
      render() {
        return createElement('em', null, this.props.value);
      }
    }
    container.innerHTML = '<em>test</em>';
    const existingEm = container.querySelector('em')!;

    const root = hydrateRoot(container, createElement(MyComp, { value: 'test' }));

    expect(container.querySelector('em')).toBe(existingEm);
    expect(container.textContent).toBe('test');
    root.unmount();
  });

  it('hydrates with state — state works after hydration', async () => {
    let setCount: (v: number) => void;
    function Counter() {
      const [count, sc] = useState(0);
      setCount = sc;
      return createElement('div', null, String(count));
    }
    container.innerHTML = '<div>0</div>';

    const root = hydrateRoot(container, createElement(Counter, null));
    expect(container.textContent).toBe('0');

    // State updates should work after hydration
    setCount!(5);
    await new Promise((r) => setTimeout(r, 50));
    expect(container.textContent).toBe('5');
    root.unmount();
  });
});

describe('hydrateRoot — mismatch handling', () => {
  it('handles extra server content gracefully', () => {
    // Server has more content than client
    container.innerHTML = '<div>server</div><p>extra</p>';
    const root = hydrateRoot(container, createElement('div', null, 'client'));
    // Should still render correctly
    expect(container.querySelector('div')).toBeTruthy();
    root.unmount();
  });

  it('handles missing server content', () => {
    // Server has less content than client expects
    container.innerHTML = '';
    const root = hydrateRoot(
      container,
      createElement('div', null, createElement('span', null, 'new')),
    );
    // Should create the missing content
    expect(container.querySelector('span')).toBeTruthy();
    expect(container.textContent).toContain('new');
    root.unmount();
  });

  it('subsequent renders after hydration work normally', async () => {
    let setText: (v: string) => void;
    function App() {
      const [text, st] = useState('initial');
      setText = st;
      return createElement('div', null, text);
    }
    container.innerHTML = '<div>initial</div>';
    const root = hydrateRoot(container, createElement(App, null));
    expect(container.textContent).toBe('initial');

    // Re-renders should work normally (not in hydration mode)
    setText!('updated');
    await new Promise((r) => setTimeout(r, 50));
    expect(container.textContent).toBe('updated');
    root.unmount();
  });
});
