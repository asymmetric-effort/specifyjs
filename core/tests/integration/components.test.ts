import { describe, it, expect, beforeEach, vi } from 'vitest';
import {
  createElement,
  Component,
  PureComponent,
  Fragment,
  createRef,
  createContext,
} from '../../src/index';
import { useState, useEffect, useRef } from '../../src/hooks/index';
import { createRoot } from '../../src/dom/create-root';
import { forwardRef } from '../../src/core/forward-ref';
import { memo } from '../../src/core/memo';
import { createPortal } from '../../src/dom/create-portal';

let container: HTMLDivElement;

beforeEach(() => {
  container = document.createElement('div');
  document.body.appendChild(container);
  return () => {
    document.body.removeChild(container);
  };
});

describe('class component lifecycle', () => {
  it('calls componentDidMount on first render', () => {
    const didMount = vi.fn();

    class MyComp extends Component {
      componentDidMount() {
        didMount();
      }
      render() {
        return createElement('div', null, 'mounted');
      }
    }

    const root = createRoot(container);
    root.render(createElement(MyComp, null));
    expect(didMount).toHaveBeenCalledTimes(1);
    expect(container.innerHTML).toBe('<div>mounted</div>');
  });

  it('calls componentDidUpdate on re-render', () => {
    const didUpdate = vi.fn();

    class MyComp extends Component<{ value: number }> {
      componentDidUpdate() {
        didUpdate();
      }
      render() {
        return createElement('div', null, `Value: ${this.props.value}`);
      }
    }

    const root = createRoot(container);
    root.render(createElement(MyComp, { value: 1 }));
    expect(didUpdate).not.toHaveBeenCalled();

    root.render(createElement(MyComp, { value: 2 }));
    expect(didUpdate).toHaveBeenCalledTimes(1);
    expect(container.innerHTML).toBe('<div>Value: 2</div>');
  });

  it('calls componentWillUnmount on unmount', () => {
    const willUnmount = vi.fn();

    class MyComp extends Component {
      componentWillUnmount() {
        willUnmount();
      }
      render() {
        return createElement('div', null, 'bye');
      }
    }

    const root = createRoot(container);
    root.render(createElement(MyComp, null));
    expect(willUnmount).not.toHaveBeenCalled();

    root.unmount();
    expect(willUnmount).toHaveBeenCalledTimes(1);
  });
});

describe('PureComponent', () => {
  it('renders with props', () => {
    class Pure extends PureComponent<{ name: string }> {
      render() {
        return createElement('div', null, `Hi ${this.props.name}`);
      }
    }

    const root = createRoot(container);
    root.render(createElement(Pure, { name: 'Pure' }));
    expect(container.innerHTML).toBe('<div>Hi Pure</div>');
  });
});

describe('memo component', () => {
  it('skips re-render when props are equal', () => {
    const renderCount = vi.fn();

    function Inner(props: { value: number }) {
      renderCount();
      return createElement('span', null, String(props.value));
    }
    const Memoized = memo(Inner);

    const root = createRoot(container);

    // First render
    root.render(createElement(Memoized as unknown as () => null, { value: 1 }));
    expect(renderCount).toHaveBeenCalledTimes(1);

    // Same props -> should skip
    root.render(createElement(Memoized as unknown as () => null, { value: 1 }));
    expect(renderCount).toHaveBeenCalledTimes(1);

    // Different props -> should re-render
    root.render(createElement(Memoized as unknown as () => null, { value: 2 }));
    expect(renderCount).toHaveBeenCalledTimes(2);
    expect(container.innerHTML).toBe('<span>2</span>');
  });

  it('uses custom compare function', () => {
    const renderCount = vi.fn();

    function Inner(props: { a: number; b: number }) {
      renderCount();
      return createElement('span', null, String(props.a + props.b));
    }

    const Memoized = memo(Inner, (prev, next) => prev.a === next.a);

    const root = createRoot(container);
    root.render(createElement(Memoized as unknown as () => null, { a: 1, b: 10 }));
    expect(renderCount).toHaveBeenCalledTimes(1);

    // a is same, b differs -> compare returns true -> skip
    root.render(createElement(Memoized as unknown as () => null, { a: 1, b: 20 }));
    expect(renderCount).toHaveBeenCalledTimes(1);

    // a differs -> compare returns false -> re-render
    root.render(createElement(Memoized as unknown as () => null, { a: 2, b: 20 }));
    expect(renderCount).toHaveBeenCalledTimes(2);
  });
});

describe('forwardRef component', () => {
  it('passes ref through to child', () => {
    const FancyInput = forwardRef((_props, ref) => {
      return createElement('input', { ref, type: 'text', className: 'fancy' });
    });

    const root = createRoot(container);
    root.render(createElement(FancyInput as unknown as () => null, null));
    expect(container.querySelector('input.fancy')).not.toBeNull();
  });

  it('renders with props', () => {
    const FancyButton = forwardRef((props: { label: string }, _ref) => {
      return createElement('button', null, props.label);
    });

    const root = createRoot(container);
    root.render(createElement(FancyButton as unknown as () => null, { label: 'Click Me' }));
    expect(container.innerHTML).toBe('<button>Click Me</button>');
  });
});

describe('Fragment', () => {
  it('renders children without wrapper', () => {
    const root = createRoot(container);
    root.render(
      createElement(
        Fragment,
        null,
        createElement('span', null, 'A'),
        createElement('span', null, 'B'),
        createElement('span', null, 'C'),
      ),
    );
    expect(container.innerHTML).toBe('<span>A</span><span>B</span><span>C</span>');
  });

  it('handles nested fragments', () => {
    const root = createRoot(container);
    root.render(
      createElement(
        Fragment,
        null,
        createElement(Fragment, null, createElement('span', null, 'deep')),
      ),
    );
    expect(container.innerHTML).toBe('<span>deep</span>');
  });

  it('handles empty fragment', () => {
    const root = createRoot(container);
    root.render(createElement(Fragment, null));
    expect(container.innerHTML).toBe('');
  });
});

describe('lists with keys', () => {
  it('renders a keyed list', () => {
    const root = createRoot(container);
    const items = ['apple', 'banana', 'cherry'];

    root.render(
      createElement('ul', null, ...items.map((item) => createElement('li', { key: item }, item))),
    );

    expect(container.querySelectorAll('li')).toHaveLength(3);
    expect(container.querySelectorAll('li')[0]?.textContent).toBe('apple');
    expect(container.querySelectorAll('li')[2]?.textContent).toBe('cherry');
  });

  it('handles list reorder', () => {
    const root = createRoot(container);

    root.render(
      createElement(
        'ul',
        null,
        createElement('li', { key: 'a' }, 'A'),
        createElement('li', { key: 'b' }, 'B'),
        createElement('li', { key: 'c' }, 'C'),
      ),
    );

    root.render(
      createElement(
        'ul',
        null,
        createElement('li', { key: 'c' }, 'C'),
        createElement('li', { key: 'a' }, 'A'),
        createElement('li', { key: 'b' }, 'B'),
      ),
    );

    const lis = container.querySelectorAll('li');
    expect(lis[0]?.textContent).toBe('C');
    expect(lis[1]?.textContent).toBe('A');
    expect(lis[2]?.textContent).toBe('B');
  });

  it('handles list item removal', () => {
    const root = createRoot(container);

    root.render(
      createElement(
        'ul',
        null,
        createElement('li', { key: 'a' }, 'A'),
        createElement('li', { key: 'b' }, 'B'),
        createElement('li', { key: 'c' }, 'C'),
      ),
    );
    expect(container.querySelectorAll('li')).toHaveLength(3);

    root.render(
      createElement(
        'ul',
        null,
        createElement('li', { key: 'a' }, 'A'),
        createElement('li', { key: 'c' }, 'C'),
      ),
    );
    expect(container.querySelectorAll('li')).toHaveLength(2);
    expect(container.querySelectorAll('li')[1]?.textContent).toBe('C');
  });
});

describe('nested component trees', () => {
  it('renders a complex nested tree', () => {
    function Header() {
      return createElement('header', null, createElement('h1', null, 'Title'));
    }

    function ListItem(props: { text: string }) {
      return createElement('li', null, props.text);
    }

    function Content() {
      const items = ['One', 'Two', 'Three'];
      return createElement(
        'ul',
        null,
        ...items.map((t) => createElement(ListItem, { key: t, text: t })),
      );
    }

    function App() {
      return createElement(
        'div',
        { className: 'app' },
        createElement(Header, null),
        createElement(Content, null),
      );
    }

    const root = createRoot(container);
    root.render(createElement(App, null));

    expect(container.querySelector('header h1')?.textContent).toBe('Title');
    expect(container.querySelectorAll('li')).toHaveLength(3);
    expect(container.querySelector('.app')).not.toBeNull();
  });
});

describe('conditional rendering', () => {
  it('conditionally renders based on props', () => {
    function Cond(props: { show: boolean }) {
      return props.show ? createElement('span', null, 'visible') : null;
    }

    const root = createRoot(container);
    root.render(createElement(Cond, { show: true }));
    expect(container.innerHTML).toBe('<span>visible</span>');

    root.render(createElement(Cond, { show: false }));
    expect(container.innerHTML).toBe('');
  });

  it('handles ternary between different element types', () => {
    function Toggle(props: { on: boolean }) {
      return props.on ? createElement('button', null, 'ON') : createElement('span', null, 'OFF');
    }

    const root = createRoot(container);
    root.render(createElement(Toggle, { on: true }));
    expect(container.innerHTML).toBe('<button>ON</button>');

    root.render(createElement(Toggle, { on: false }));
    expect(container.innerHTML).toBe('<span>OFF</span>');
  });
});
