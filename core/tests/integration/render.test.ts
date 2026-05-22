import { describe, it, expect, beforeEach, vi } from 'vitest';
import { createElement, Fragment, Component, createContext } from '../../src/index';
import {
  useState,
  useEffect,
  useReducer,
  useMemo,
  useCallback,
  useRef,
  useContext,
  useId,
  useLayoutEffect,
} from '../../src/hooks/index';
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

describe('basic rendering', () => {
  it('renders a simple div with text', () => {
    const root = createRoot(container);
    root.render(createElement('div', null, 'Hello World'));
    expect(container.innerHTML).toBe('<div>Hello World</div>');
  });

  it('renders nested elements', () => {
    const root = createRoot(container);
    root.render(
      createElement(
        'div',
        { className: 'wrapper' },
        createElement('h1', null, 'Title'),
        createElement('p', null, 'Paragraph'),
      ),
    );
    expect(container.querySelector('h1')?.textContent).toBe('Title');
    expect(container.querySelector('p')?.textContent).toBe('Paragraph');
    expect(container.querySelector('.wrapper')).not.toBeNull();
  });

  it('renders text and number children', () => {
    const root = createRoot(container);
    root.render(createElement('span', null, 'Count: ', 42));
    expect(container.innerHTML).toBe('<span>Count: 42</span>');
  });

  it('renders with Fragment', () => {
    const root = createRoot(container);
    root.render(
      createElement(
        Fragment,
        null,
        createElement('span', null, 'A'),
        createElement('span', null, 'B'),
      ),
    );
    expect(container.innerHTML).toBe('<span>A</span><span>B</span>');
  });

  it('renders with className and id', () => {
    const root = createRoot(container);
    root.render(createElement('div', { className: 'my-class', id: 'my-id' }));
    const div = container.firstChild as HTMLElement;
    expect(div.getAttribute('class')).toBe('my-class');
    expect(div.getAttribute('id')).toBe('my-id');
  });

  it('renders inline styles', () => {
    const root = createRoot(container);
    root.render(createElement('div', { style: { color: 'red', fontSize: '16px' } }));
    const div = container.firstChild as HTMLElement;
    expect(div.style.color).toBe('red');
    expect(div.style.fontSize).toBe('16px');
  });

  it('renders dangerouslySetInnerHTML', () => {
    const root = createRoot(container);
    root.render(createElement('div', { dangerouslySetInnerHTML: { __html: '<b>bold</b>' } }));
    expect(container.innerHTML).toBe('<div><b>bold</b></div>');
  });

  it('unmounts cleanly', () => {
    const root = createRoot(container);
    root.render(createElement('div', null, 'content'));
    expect(container.innerHTML).toBe('<div>content</div>');
    root.unmount();
    expect(container.innerHTML).toBe('');
  });
});

describe('function components', () => {
  it('renders a function component', () => {
    function Greeting(props: { name: string }) {
      return createElement('span', null, `Hello, ${props.name}!`);
    }

    const root = createRoot(container);
    root.render(createElement(Greeting, { name: 'World' }));
    expect(container.innerHTML).toBe('<span>Hello, World!</span>');
  });

  it('renders nested function components', () => {
    function Inner() {
      return createElement('em', null, 'inner');
    }
    function Outer() {
      return createElement('div', null, createElement(Inner, null));
    }

    const root = createRoot(container);
    root.render(createElement(Outer, null));
    expect(container.innerHTML).toBe('<div><em>inner</em></div>');
  });

  it('renders component returning null', () => {
    function Empty() {
      return null;
    }

    const root = createRoot(container);
    root.render(createElement(Empty, null));
    expect(container.innerHTML).toBe('');
  });
});

describe('class components', () => {
  it('renders a basic class component', () => {
    class Hello extends Component {
      render() {
        return createElement('div', null, `Hello, ${(this.props as { name: string }).name}`);
      }
    }

    const root = createRoot(container);
    root.render(createElement(Hello, { name: 'Class' }));
    expect(container.innerHTML).toBe('<div>Hello, Class</div>');
  });
});

describe('hooks - useState', () => {
  it('renders with initial state', () => {
    function Counter() {
      const [count] = useState(0);
      return createElement('div', null, `Count: ${count}`);
    }

    const root = createRoot(container);
    root.render(createElement(Counter, null));
    expect(container.innerHTML).toBe('<div>Count: 0</div>');
  });

  it('accepts initializer function', () => {
    function Counter() {
      const [count] = useState(() => 10);
      return createElement('div', null, `Count: ${count}`);
    }

    const root = createRoot(container);
    root.render(createElement(Counter, null));
    expect(container.innerHTML).toBe('<div>Count: 10</div>');
  });
});

describe('hooks - useReducer', () => {
  it('renders with initial reducer state', () => {
    function Counter() {
      const [state] = useReducer((s: number, a: string) => (a === 'inc' ? s + 1 : s), 5);
      return createElement('div', null, `Count: ${state}`);
    }

    const root = createRoot(container);
    root.render(createElement(Counter, null));
    expect(container.innerHTML).toBe('<div>Count: 5</div>');
  });

  it('accepts init function', () => {
    function Counter() {
      const [state] = useReducer(
        (s: number) => s,
        10,
        (arg: number) => arg * 2,
      );
      return createElement('div', null, `Count: ${state}`);
    }

    const root = createRoot(container);
    root.render(createElement(Counter, null));
    expect(container.innerHTML).toBe('<div>Count: 20</div>');
  });
});

describe('hooks - useMemo and useCallback', () => {
  it('useMemo computes and memoizes', () => {
    const factory = vi.fn(() => 42);

    function Comp() {
      const value = useMemo(factory, []);
      return createElement('div', null, `Value: ${value}`);
    }

    const root = createRoot(container);
    root.render(createElement(Comp, null));
    expect(container.innerHTML).toBe('<div>Value: 42</div>');
    expect(factory).toHaveBeenCalledTimes(1);
  });

  it('useCallback returns stable reference', () => {
    let savedFn: unknown;

    function Comp() {
      const fn = useCallback(() => 'hello', []);
      savedFn = fn;
      return createElement('div', null, 'ok');
    }

    const root = createRoot(container);
    root.render(createElement(Comp, null));
    expect(typeof savedFn).toBe('function');
  });
});

describe('hooks - useRef', () => {
  it('returns a stable ref object', () => {
    let ref: { current: number | undefined } | undefined;

    function Comp() {
      ref = useRef(42);
      return createElement('div', null, `Ref: ${ref.current}`);
    }

    const root = createRoot(container);
    root.render(createElement(Comp, null));
    expect(container.innerHTML).toBe('<div>Ref: 42</div>');
    expect(ref!.current).toBe(42);
  });
});

describe('hooks - useContext', () => {
  it('reads default context value', () => {
    const ThemeContext = createContext('light');

    function Display() {
      const theme = useContext(ThemeContext);
      return createElement('div', null, `Theme: ${theme}`);
    }

    const root = createRoot(container);
    root.render(createElement(Display, null));
    expect(container.innerHTML).toBe('<div>Theme: light</div>');
  });
});

describe('hooks - useId', () => {
  it('generates a unique id', () => {
    let id1: string | undefined;
    let id2: string | undefined;

    function Comp1() {
      id1 = useId();
      return createElement('div', { id: id1 }, 'A');
    }
    function Comp2() {
      id2 = useId();
      return createElement('div', { id: id2 }, 'B');
    }

    const root = createRoot(container);
    root.render(
      createElement(Fragment, null, createElement(Comp1, null), createElement(Comp2, null)),
    );

    expect(id1).toBeDefined();
    expect(id2).toBeDefined();
    expect(id1).not.toBe(id2);
    expect(id1!.startsWith(':l')).toBe(true);
  });
});

describe('hooks - useEffect', () => {
  it('runs effect after render', () => {
    const effectFn = vi.fn();

    function Comp() {
      useEffect(effectFn, []);
      return createElement('div', null, 'effect test');
    }

    const root = createRoot(container);
    root.render(createElement(Comp, null));
    expect(effectFn).toHaveBeenCalledTimes(1);
  });

  it('runs cleanup on unmount', () => {
    const cleanup = vi.fn();
    const effectFn = vi.fn(() => cleanup);

    function Comp() {
      useEffect(effectFn, []);
      return createElement('div', null, 'cleanup test');
    }

    const root = createRoot(container);
    root.render(createElement(Comp, null));
    expect(effectFn).toHaveBeenCalledTimes(1);
    expect(cleanup).not.toHaveBeenCalled();

    root.unmount();
    expect(cleanup).toHaveBeenCalledTimes(1);
  });
});

describe('hooks - useLayoutEffect', () => {
  it('runs layout effect synchronously after render', () => {
    const layoutFn = vi.fn();

    function Comp() {
      useLayoutEffect(layoutFn, []);
      return createElement('div', null, 'layout');
    }

    const root = createRoot(container);
    root.render(createElement(Comp, null));
    expect(layoutFn).toHaveBeenCalledTimes(1);
  });
});

describe('event handling', () => {
  it('handles onClick', () => {
    const handler = vi.fn();

    const root = createRoot(container);
    root.render(createElement('button', { onClick: handler }, 'Click'));

    const button = container.querySelector('button')!;
    button.click();
    expect(handler).toHaveBeenCalledTimes(1);
  });

  it('handles onChange on input', () => {
    const handler = vi.fn();

    const root = createRoot(container);
    root.render(createElement('input', { onChange: handler, type: 'text' }));

    const input = container.querySelector('input')!;
    input.dispatchEvent(new Event('change'));
    expect(handler).toHaveBeenCalledTimes(1);
  });
});

describe('updates and re-renders', () => {
  it('re-renders with new props', () => {
    function Greeting(props: { name: string }) {
      return createElement('span', null, `Hi ${props.name}`);
    }

    const root = createRoot(container);
    root.render(createElement(Greeting, { name: 'Alice' }));
    expect(container.innerHTML).toBe('<span>Hi Alice</span>');

    root.render(createElement(Greeting, { name: 'Bob' }));
    expect(container.innerHTML).toBe('<span>Hi Bob</span>');
  });

  it('updates text content', () => {
    const root = createRoot(container);
    root.render(createElement('div', null, 'old'));
    expect(container.innerHTML).toBe('<div>old</div>');

    root.render(createElement('div', null, 'new'));
    expect(container.innerHTML).toBe('<div>new</div>');
  });

  it('adds and removes children', () => {
    const root = createRoot(container);

    root.render(createElement('ul', null, createElement('li', { key: 'a' }, 'A')));
    expect(container.querySelectorAll('li')).toHaveLength(1);

    root.render(
      createElement(
        'ul',
        null,
        createElement('li', { key: 'a' }, 'A'),
        createElement('li', { key: 'b' }, 'B'),
      ),
    );
    expect(container.querySelectorAll('li')).toHaveLength(2);
  });

  it('handles type change (div -> span)', () => {
    const root = createRoot(container);

    root.render(createElement('div', null, 'content'));
    expect(container.firstChild?.nodeName).toBe('DIV');

    root.render(createElement('span', null, 'content'));
    expect(container.firstChild?.nodeName).toBe('SPAN');
  });
});

describe('memo', () => {
  it('renders a memo component', () => {
    const renderFn = vi.fn((props: { value: number }) =>
      createElement('div', null, `Value: ${props.value}`),
    );
    const MemoComp = memo(renderFn);

    const root = createRoot(container);
    root.render(createElement(MemoComp as unknown as () => null, { value: 1 }));
    expect(container.innerHTML).toBe('<div>Value: 1</div>');
    expect(renderFn).toHaveBeenCalledTimes(1);
  });
});

describe('forwardRef', () => {
  it('renders a forwardRef component', () => {
    const FancyInput = forwardRef((_props, _ref) => {
      return createElement('input', { type: 'text', className: 'fancy' });
    });

    const root = createRoot(container);
    root.render(createElement(FancyInput as unknown as () => null, null));
    expect(container.querySelector('input.fancy')).not.toBeNull();
  });
});

describe('error cases', () => {
  it('createRoot throws for null container', () => {
    expect(() => createRoot(null as unknown as Element)).toThrow();
  });

  it('createRoot throws for non-element', () => {
    expect(() => createRoot('not-an-element' as unknown as Element)).toThrow();
  });
});
