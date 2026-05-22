import { describe, it, expect, beforeEach, vi } from 'vitest';
import { createElement, Fragment, Component, createContext } from '../../src/index';
import { useState, useEffect } from '../../src/hooks/index';
import { createRoot } from '../../src/dom/create-root';
import { renderToString, renderToStaticMarkup } from '../../src/server/render-to-string';

let container: HTMLDivElement;

beforeEach(() => {
  container = document.createElement('div');
  document.body.appendChild(container);
  return () => {
    document.body.removeChild(container);
  };
});

describe('deeply nested component trees', () => {
  it('renders 5 levels deep', () => {
    function L5() {
      return createElement('span', null, 'leaf');
    }
    function L4() {
      return createElement('div', null, createElement(L5, null));
    }
    function L3() {
      return createElement('div', null, createElement(L4, null));
    }
    function L2() {
      return createElement('div', null, createElement(L3, null));
    }
    function L1() {
      return createElement('div', null, createElement(L2, null));
    }

    const root = createRoot(container);
    root.render(createElement(L1, null));
    expect(container.querySelector('span')?.textContent).toBe('leaf');
  });
});

describe('sibling traversal edge cases', () => {
  it('handles mixed host and component siblings', () => {
    function Inline() {
      return createElement('em', null, 'inline');
    }

    const root = createRoot(container);
    root.render(
      createElement(
        'div',
        null,
        createElement('span', null, 'text'),
        createElement(Inline, null),
        createElement('b', null, 'bold'),
      ),
    );
    expect(container.querySelector('em')?.textContent).toBe('inline');
    expect(container.querySelector('b')?.textContent).toBe('bold');
  });

  it('handles fragments as siblings', () => {
    const root = createRoot(container);
    root.render(
      createElement(
        'div',
        null,
        createElement(
          Fragment,
          null,
          createElement('span', null, 'a'),
          createElement('span', null, 'b'),
        ),
        createElement('p', null, 'c'),
      ),
    );
    const spans = container.querySelectorAll('span');
    expect(spans).toHaveLength(2);
    expect(container.querySelector('p')?.textContent).toBe('c');
  });
});

describe('class component state', () => {
  it('class component with initial state', () => {
    class Stateful extends Component<{}, { count: number }> {
      constructor(props: {}) {
        super(props);
        this.state = { count: 42 };
      }
      render() {
        return createElement('div', null, `Count: ${this.state.count}`);
      }
    }

    const root = createRoot(container);
    root.render(createElement(Stateful, null));
    expect(container.innerHTML).toBe('<div>Count: 42</div>');
  });
});

describe('attribute edge cases', () => {
  it('renders data- attributes', () => {
    const root = createRoot(container);
    root.render(createElement('div', { 'data-testid': 'my-el', 'data-value': '123' }));
    const div = container.firstChild as HTMLElement;
    expect(div.getAttribute('data-testid')).toBe('my-el');
    expect(div.getAttribute('data-value')).toBe('123');
  });

  it('renders aria- attributes', () => {
    const root = createRoot(container);
    root.render(createElement('button', { 'aria-label': 'Close', 'aria-hidden': 'false' }));
    const btn = container.firstChild as HTMLElement;
    expect(btn.getAttribute('aria-label')).toBe('Close');
  });

  it('removes className when removed from props', () => {
    const root = createRoot(container);
    root.render(createElement('div', { className: 'old' }));
    expect((container.firstChild as HTMLElement).getAttribute('class')).toBe('old');

    root.render(createElement('div', {}));
    expect((container.firstChild as HTMLElement).hasAttribute('class')).toBe(false);
  });

  it('removes style when removed from props', () => {
    const root = createRoot(container);
    root.render(createElement('div', { style: { color: 'red' } }));
    root.render(createElement('div', {}));
    expect((container.firstChild as HTMLElement).hasAttribute('style')).toBe(false);
  });
});

describe('SSR edge cases', () => {
  it('renders value attribute on input', () => {
    const html = renderToString(createElement('input', { value: 'hello', type: 'text' }));
    expect(html).toContain('value="hello"');
  });

  it('renders checked attribute on checkbox', () => {
    const html = renderToString(createElement('input', { checked: true, type: 'checkbox' }));
    expect(html).toContain('checked');
  });

  it('renders selected attribute', () => {
    const html = renderToString(createElement('option', { selected: true }, 'opt'));
    expect(html).toContain('selected');
  });

  it('handles style with zero value', () => {
    const html = renderToString(createElement('div', { style: { margin: 0 } }));
    expect(html).toContain('margin:0');
  });

  it('handles style with null value', () => {
    const html = renderToString(
      createElement('div', { style: { color: null as unknown as string } }),
    );
    // null value should be skipped
    expect(html).toBe('<div style=""></div>');
  });

  it('renderToStaticMarkup with function component', () => {
    function Comp() {
      return createElement('b', null, 'static');
    }
    expect(renderToStaticMarkup(createElement(Comp, null))).toBe('<b>static</b>');
  });
});

describe('reconciler edge cases', () => {
  it('handles switching from text to element to text', () => {
    const root = createRoot(container);
    root.render(createElement('div', null, 'text'));
    expect(container.innerHTML).toBe('<div>text</div>');

    root.render(createElement('div', null, createElement('span', null, 'element')));
    expect(container.innerHTML).toBe('<div><span>element</span></div>');

    root.render(createElement('div', null, 'back to text'));
    expect(container.innerHTML).toBe('<div>back to text</div>');
  });

  it('handles empty array children', () => {
    const root = createRoot(container);
    root.render(createElement('div', null, ...[]));
    expect(container.innerHTML).toBe('<div></div>');
  });

  it('handles replacing all children with empty', () => {
    const root = createRoot(container);
    root.render(
      createElement(
        'ul',
        null,
        createElement('li', { key: 'a' }, 'A'),
        createElement('li', { key: 'b' }, 'B'),
      ),
    );
    expect(container.querySelectorAll('li')).toHaveLength(2);

    root.render(createElement('ul', null));
    expect(container.querySelectorAll('li')).toHaveLength(0);
  });
});

describe('unmount with effects cleanup', () => {
  it('cleans up all effects on unmount', () => {
    const cleanup1 = vi.fn();
    const cleanup2 = vi.fn();

    function Child1() {
      useEffect(() => cleanup1, []);
      return createElement('div', null, 'c1');
    }
    function Child2() {
      useEffect(() => cleanup2, []);
      return createElement('div', null, 'c2');
    }

    const root = createRoot(container);
    root.render(
      createElement(Fragment, null, createElement(Child1, null), createElement(Child2, null)),
    );
    expect(cleanup1).not.toHaveBeenCalled();
    expect(cleanup2).not.toHaveBeenCalled();

    root.unmount();
    expect(cleanup1).toHaveBeenCalledTimes(1);
    expect(cleanup2).toHaveBeenCalledTimes(1);
  });
});

describe('context provider in SSR', () => {
  it('restores context after nested providers', () => {
    const Ctx = createContext('root');

    function Inner() {
      return createElement('span', null, Ctx._currentValue);
    }

    const html = renderToString(
      createElement(
        Ctx.Provider as unknown as () => null,
        { value: 'outer' },
        createElement(
          Ctx.Provider as unknown as () => null,
          { value: 'inner' },
          createElement(Inner, null),
        ),
        createElement(Inner, null),
      ),
    );
    // After inner provider, outer should be restored
    expect(html).toContain('<span>inner</span>');
    // The second Inner should see 'outer'
    expect(html).toBe('<span>inner</span><span>outer</span>');
  });
});
