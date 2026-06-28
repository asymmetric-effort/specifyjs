/**
 * Snapshot tests for component DOM output (#92)
 *
 * Uses toMatchSnapshot and toMatchInlineSnapshot from nogginlessdom
 * to replace fragile innerHTML string comparisons with snapshot-based
 * regression detection for key components.
 */
import { describe, it, expect, beforeEach } from '@asymmetric-effort/nogginlessdom';
import { createElement, Fragment, Component, PureComponent, createContext } from '../../src/index';
import { useState, useContext, useRef, useMemo } from '../../src/hooks/index';
import { createRoot } from '../../src/dom/create-root';
import { memo } from '../../src/core/memo';
import { forwardRef } from '../../src/core/forward-ref';

let container: HTMLDivElement;

beforeEach(() => {
  container = document.createElement('div');
  document.body.appendChild(container);
  return () => {
    document.body.removeChild(container);
  };
});

// ---------------------------------------------------------------------------
// 1. Basic element rendering — snapshot the DOM output
// ---------------------------------------------------------------------------
describe('snapshot: basic rendering', () => {
  it('simple div with text matches snapshot', () => {
    const root = createRoot(container);
    root.render(createElement('div', null, 'Hello World'));
    expect(container.innerHTML).toMatchInlineSnapshot('"<div>Hello World</div>"');
  });

  it('nested elements match snapshot', () => {
    const root = createRoot(container);
    root.render(
      createElement(
        'div',
        { className: 'wrapper' },
        createElement('h1', null, 'Title'),
        createElement('p', null, 'Paragraph'),
      ),
    );
    expect(container.innerHTML).toMatchSnapshot('nested-elements');
  });

  it('fragment rendering matches snapshot', () => {
    const root = createRoot(container);
    root.render(
      createElement(
        Fragment,
        null,
        createElement('span', null, 'A'),
        createElement('span', null, 'B'),
      ),
    );
    expect(container.innerHTML).toMatchInlineSnapshot('"<span>A</span><span>B</span>"');
  });

  it('element with className and id matches snapshot', () => {
    const root = createRoot(container);
    root.render(createElement('div', { className: 'my-class', id: 'my-id' }));
    expect(container.innerHTML).toMatchSnapshot('div-with-class-and-id');
  });

  it('inline styles match snapshot', () => {
    const root = createRoot(container);
    root.render(createElement('div', { style: { color: 'red', fontSize: '16px' } }));
    expect(container.innerHTML).toMatchSnapshot('div-with-inline-styles');
  });

  it('dangerouslySetInnerHTML matches snapshot', () => {
    const root = createRoot(container);
    root.render(createElement('div', { dangerouslySetInnerHTML: { __html: '<b>bold</b>' } }));
    expect(container.innerHTML).toMatchInlineSnapshot('"<div><b>bold</b></div>"');
  });
});

// ---------------------------------------------------------------------------
// 2. Function components — snapshot output
// ---------------------------------------------------------------------------
describe('snapshot: function components', () => {
  it('simple function component matches snapshot', () => {
    function Greeting(props: { name: string }) {
      return createElement('span', null, `Hello, ${props.name}!`);
    }

    const root = createRoot(container);
    root.render(createElement(Greeting, { name: 'World' }));
    expect(container.innerHTML).toMatchInlineSnapshot('"<span>Hello, World!</span>"');
  });

  it('nested function components match snapshot', () => {
    function Inner() {
      return createElement('em', null, 'inner');
    }
    function Outer() {
      return createElement('div', null, createElement(Inner, null));
    }

    const root = createRoot(container);
    root.render(createElement(Outer, null));
    expect(container.innerHTML).toMatchSnapshot('nested-function-components');
  });

  it('component returning null produces empty snapshot', () => {
    function Empty() {
      return null;
    }

    const root = createRoot(container);
    root.render(createElement(Empty, null));
    expect(container.innerHTML).toMatchInlineSnapshot('""');
  });
});

// ---------------------------------------------------------------------------
// 3. Class components — snapshot output
// ---------------------------------------------------------------------------
describe('snapshot: class components', () => {
  it('basic class component matches snapshot', () => {
    class Hello extends Component {
      render() {
        return createElement('div', null, `Hello, ${(this.props as { name: string }).name}`);
      }
    }

    const root = createRoot(container);
    root.render(createElement(Hello, { name: 'Class' }));
    expect(container.innerHTML).toMatchSnapshot('class-component-hello');
  });

  it('PureComponent matches snapshot', () => {
    class Pure extends PureComponent<{ name: string }> {
      render() {
        return createElement('div', null, `Hi ${this.props.name}`);
      }
    }

    const root = createRoot(container);
    root.render(createElement(Pure, { name: 'Pure' }));
    expect(container.innerHTML).toMatchInlineSnapshot('"<div>Hi Pure</div>"');
  });
});

// ---------------------------------------------------------------------------
// 4. Context rendering — snapshot output
// ---------------------------------------------------------------------------
describe('snapshot: context rendering', () => {
  it('default context value matches snapshot', () => {
    const Ctx = createContext('default-val');

    function Reader() {
      const val = useContext(Ctx);
      return createElement('span', null, val);
    }

    const root = createRoot(container);
    root.render(createElement(Reader, null));
    expect(container.innerHTML).toMatchInlineSnapshot('"<span>default-val</span>"');
  });

  it('provided context value matches snapshot', () => {
    const Ctx = createContext('default');

    function Reader() {
      const val = useContext(Ctx);
      return createElement('span', null, val);
    }

    const root = createRoot(container);
    root.render(
      createElement(
        Ctx.Provider as unknown as () => null,
        { value: 'provided' },
        createElement(Reader, null),
      ),
    );
    expect(container.innerHTML).toMatchSnapshot('context-provided-value');
  });

  it('nested providers — inner value wins — matches snapshot', () => {
    const Ctx = createContext('outer');

    function Reader() {
      const val = useContext(Ctx);
      return createElement('span', null, val);
    }

    const root = createRoot(container);
    root.render(
      createElement(
        Ctx.Provider as unknown as () => null,
        { value: 'level-1' },
        createElement(
          Ctx.Provider as unknown as () => null,
          { value: 'level-2' },
          createElement(Reader, null),
        ),
      ),
    );
    expect(container.innerHTML).toMatchSnapshot('nested-context-providers');
  });
});

// ---------------------------------------------------------------------------
// 5. Advanced patterns — memo, forwardRef, hooks
// ---------------------------------------------------------------------------
describe('snapshot: advanced component patterns', () => {
  it('memo component matches snapshot', () => {
    const MemoComp = memo((props: { value: number }) =>
      createElement('div', null, `Value: ${props.value}`),
    );

    const root = createRoot(container);
    root.render(createElement(MemoComp as unknown as () => null, { value: 42 }));
    expect(container.innerHTML).toMatchInlineSnapshot('"<div>Value: 42</div>"');
  });

  it('forwardRef component matches snapshot', () => {
    const FancyInput = forwardRef((_props, _ref) => {
      return createElement('input', { type: 'text', className: 'fancy' });
    });

    const root = createRoot(container);
    root.render(createElement(FancyInput as unknown as () => null, null));
    expect(container.innerHTML).toMatchSnapshot('forwardRef-fancy-input');
  });

  it('useState component matches snapshot', () => {
    function Counter() {
      const [count] = useState(0);
      return createElement('div', null, `Count: ${count}`);
    }

    const root = createRoot(container);
    root.render(createElement(Counter, null));
    expect(container.innerHTML).toMatchInlineSnapshot('"<div>Count: 0</div>"');
  });

  it('useRef component matches snapshot', () => {
    function RefComp() {
      const ref = useRef(42);
      return createElement('div', null, `Ref: ${ref.current}`);
    }

    const root = createRoot(container);
    root.render(createElement(RefComp, null));
    expect(container.innerHTML).toMatchInlineSnapshot('"<div>Ref: 42</div>"');
  });

  it('useMemo component matches snapshot', () => {
    function MemoizedComp() {
      const value = useMemo(() => 'computed', []);
      return createElement('div', null, `Result: ${value}`);
    }

    const root = createRoot(container);
    root.render(createElement(MemoizedComp, null));
    expect(container.innerHTML).toMatchInlineSnapshot('"<div>Result: computed</div>"');
  });
});

// ---------------------------------------------------------------------------
// 6. Complex component trees — snapshot to catch structural regressions
// ---------------------------------------------------------------------------
describe('snapshot: complex component trees', () => {
  it('list rendering matches snapshot', () => {
    const items = ['alpha', 'beta', 'gamma'];
    const root = createRoot(container);
    root.render(
      createElement('ul', null, ...items.map((item) => createElement('li', { key: item }, item))),
    );
    expect(container.innerHTML).toMatchSnapshot('list-rendering');
  });

  it('deeply nested component tree matches snapshot', () => {
    function Card(props: { title: string; children?: unknown }) {
      return createElement(
        'div',
        { className: 'card' },
        createElement('h2', null, props.title),
        createElement('div', { className: 'card-body' }, props.children),
      );
    }

    function App() {
      return createElement(
        'main',
        null,
        createElement(
          Card as unknown as () => null,
          { title: 'First' },
          createElement('p', null, 'First card content'),
        ),
        createElement(
          Card as unknown as () => null,
          { title: 'Second' },
          createElement('p', null, 'Second card content'),
        ),
      );
    }

    const root = createRoot(container);
    root.render(createElement(App, null));
    expect(container.innerHTML).toMatchSnapshot('deeply-nested-component-tree');
  });

  it('re-render produces correct updated snapshot', () => {
    function Greeting(props: { name: string }) {
      return createElement('span', null, `Hi ${props.name}`);
    }

    const root = createRoot(container);
    root.render(createElement(Greeting, { name: 'Alice' }));
    expect(container.innerHTML).toMatchInlineSnapshot('"<span>Hi Alice</span>"');

    root.render(createElement(Greeting, { name: 'Bob' }));
    expect(container.innerHTML).toMatchInlineSnapshot('"<span>Hi Bob</span>"');
  });

  it('unmount produces empty snapshot', () => {
    const root = createRoot(container);
    root.render(createElement('div', null, 'content'));
    root.unmount();
    expect(container.innerHTML).toMatchInlineSnapshot('""');
  });
});
