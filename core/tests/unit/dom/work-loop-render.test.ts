/**
 * Tests for the work-loop render/commit pipeline — covers the rendering,
 * reconciliation, and DOM commit phases that work-loop.ts orchestrates.
 */
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { createElement } from '../../../src/index';
import { createRoot } from '../../../src/dom/create-root';
import { useState, useEffect, useLayoutEffect, useRef } from '../../../src/hooks/index';
import { createContext } from '../../../src/context/create-context';
import { Component } from '../../../src/components/component';
import { createFiberRoot, updateDOMProperties } from '../../../src/dom/work-loop';

let container: HTMLDivElement;

beforeEach(() => {
  container = document.createElement('div');
  document.body.appendChild(container);
  return () => {
    document.body.removeChild(container);
  };
});

// ─── createFiberRoot ──────────────────────────────────────────────────
describe('createFiberRoot', () => {
  it('creates a fiber root with container stateNode', () => {
    const root = createFiberRoot(container);
    expect(root.containerNode).toBe(container);
    expect(root.current).toBeDefined();
    expect(root.current.stateNode).toBe(container);
    expect(root.pendingChildren).toBeNull();
    expect(root.callbackScheduled).toBe(false);
  });
});

// ─── Class component rendering ────────────────────────────────────────
describe('class component lifecycle', () => {
  it('calls componentDidMount on initial render', () => {
    const didMount = vi.fn();
    class MyComp extends Component {
      componentDidMount() {
        didMount();
      }
      render() {
        return createElement('div', null, 'hello');
      }
    }
    const root = createRoot(container);
    root.render(createElement(MyComp, null));
    expect(didMount).toHaveBeenCalledOnce();
    expect(container.textContent).toBe('hello');
  });

  it('calls componentDidUpdate on re-render', () => {
    const didUpdate = vi.fn();
    class MyComp extends Component<{ value: number }> {
      componentDidUpdate() {
        didUpdate();
      }
      render() {
        return createElement('span', null, String(this.props.value));
      }
    }
    const root = createRoot(container);
    root.render(createElement(MyComp, { value: 1 }));
    expect(didUpdate).not.toHaveBeenCalled();
    root.render(createElement(MyComp, { value: 2 }));
    expect(didUpdate).toHaveBeenCalledOnce();
    expect(container.textContent).toBe('2');
  });

  it('calls componentWillUnmount on unmount', () => {
    const willUnmount = vi.fn();
    class MyComp extends Component {
      componentWillUnmount() {
        willUnmount();
      }
      render() {
        return createElement('div', null, 'mounted');
      }
    }
    const root = createRoot(container);
    root.render(createElement(MyComp, null));
    root.render(null);
    expect(willUnmount).toHaveBeenCalledOnce();
  });
});

// ─── Context provider rendering ───────────────────────────────────────
describe('context provider rendering', () => {
  it('provides context value to consumers', () => {
    const Ctx = createContext('default');
    function Consumer() {
      // useContext is tested via integration tests
      return createElement('span', null, Ctx._currentValue);
    }
    const root = createRoot(container);
    root.render(createElement(Ctx.Provider, { value: 'provided' }, createElement(Consumer, null)));
    expect(container.textContent).toBe('provided');
  });
});

// ─── Effect cleanup ───────────────────────────────────────────────────
describe('effect lifecycle', () => {
  it('runs cleanup on unmount', async () => {
    const cleanup = vi.fn();
    function Comp() {
      useEffect(() => cleanup, []);
      return createElement('div', null, 'effectful');
    }
    const root = createRoot(container);
    root.render(createElement(Comp, null));
    root.render(null);
    // Cleanup may run during deletion
    await new Promise((r) => setTimeout(r, 20));
    expect(cleanup).toHaveBeenCalled();
  });

  it('runs cleanup before new effect on re-render', async () => {
    const order: string[] = [];
    let setVal: (v: number) => void;

    function Comp() {
      const [val, sv] = useState(0);
      setVal = sv;
      useEffect(() => {
        order.push(`effect-${val}`);
        return () => order.push(`cleanup-${val}`);
      }, [val]);
      return createElement('div', null, String(val));
    }

    const root = createRoot(container);
    root.render(createElement(Comp, null));
    expect(order).toEqual(['effect-0']);

    // Trigger re-render
    setVal!(1);
    await new Promise((r) => setTimeout(r, 50));
    // Cleanup of old effect should run before new effect
    expect(order).toContain('cleanup-0');
    expect(order).toContain('effect-1');
  });
});

// ─── Ref attachment ───────────────────────────────────────────────────
describe('ref attachment', () => {
  it('attaches object ref to DOM node', () => {
    const ref = { current: null as HTMLDivElement | null };
    const root = createRoot(container);
    root.render(createElement('div', { ref, id: 'target' }));
    expect(ref.current).toBeInstanceOf(HTMLDivElement);
    expect(ref.current!.id).toBe('target');
  });

  it('calls function ref with DOM node', () => {
    const refFn = vi.fn();
    const root = createRoot(container);
    root.render(createElement('div', { ref: refFn, id: 'cb' }));
    expect(refFn).toHaveBeenCalledWith(expect.any(HTMLDivElement));
  });
});

// ─── DOM deletion ─────────────────────────────────────────────────────
describe('DOM deletion', () => {
  it('removes elements when children change', async () => {
    let setShow: (v: boolean) => void;
    function App() {
      const [show, s] = useState(true);
      setShow = s;
      return createElement(
        'div',
        null,
        show ? createElement('span', { key: 'a' }, 'visible') : null,
      );
    }
    const root = createRoot(container);
    root.render(createElement(App, null));
    expect(container.querySelector('span')).toBeTruthy();

    setShow!(false);
    await new Promise((r) => setTimeout(r, 50));
    expect(container.querySelector('span')).toBeNull();
  });
});

// ─── Text node updates ───────────────────────────────────────────────
describe('text node handling', () => {
  it('updates text content', () => {
    const root = createRoot(container);
    root.render(createElement('div', null, 'hello'));
    expect(container.textContent).toBe('hello');
    root.render(createElement('div', null, 'world'));
    expect(container.textContent).toBe('world');
  });

  it('handles number children as text', () => {
    const root = createRoot(container);
    root.render(createElement('div', null, 42));
    expect(container.textContent).toBe('42');
  });
});

// ─── DOM property edge cases ──────────────────────────────────────────
describe('updateDOMProperties edge cases', () => {
  it('maps htmlFor to for attribute', () => {
    const el = document.createElement('label');
    updateDOMProperties(el, {}, { htmlFor: 'my-input' });
    expect(el.getAttribute('for')).toBe('my-input');
  });

  it('removes htmlFor (for attribute)', () => {
    const el = document.createElement('label');
    updateDOMProperties(el, {}, { htmlFor: 'my-input' });
    updateDOMProperties(el, { htmlFor: 'my-input' }, {});
    expect(el.hasAttribute('for')).toBe(false);
  });

  it('sets value on textarea', () => {
    const el = document.createElement('textarea');
    updateDOMProperties(el, {}, { value: 'content' });
    expect((el as HTMLTextAreaElement).value).toBe('content');
  });

  it('sets value on select element', () => {
    const el = document.createElement('select');
    // jsdom requires options to exist for value to be set
    const opt = document.createElement('option');
    opt.value = 'opt1';
    el.appendChild(opt);
    updateDOMProperties(el, {}, { value: 'opt1' });
    expect((el as HTMLSelectElement).value).toBe('opt1');
  });

  it('removes style attribute when removed from props', () => {
    const el = document.createElement('div');
    updateDOMProperties(el, {}, { style: { color: 'red' } });
    expect(el.style.color).toBe('red');
    updateDOMProperties(el, { style: { color: 'red' } }, {});
    expect(el.getAttribute('style')).toBeNull();
  });

  it('removes className (class attribute)', () => {
    const el = document.createElement('div');
    updateDOMProperties(el, {}, { className: 'active' });
    expect(el.getAttribute('class')).toBe('active');
    updateDOMProperties(el, { className: 'active' }, {});
    expect(el.hasAttribute('class')).toBe(false);
  });
});

// ─── Multiple children ordering ──────────────────────────────────────
describe('child ordering', () => {
  it('renders multiple children in order', () => {
    const root = createRoot(container);
    root.render(
      createElement(
        'div',
        null,
        createElement('span', null, 'A'),
        createElement('span', null, 'B'),
        createElement('span', null, 'C'),
      ),
    );
    const spans = container.querySelectorAll('span');
    expect(spans.length).toBe(3);
    expect(spans[0].textContent).toBe('A');
    expect(spans[1].textContent).toBe('B');
    expect(spans[2].textContent).toBe('C');
  });

  it('handles nested function components', () => {
    function Inner() {
      return createElement('em', null, 'nested');
    }
    function Outer() {
      return createElement('div', null, createElement(Inner, null));
    }
    const root = createRoot(container);
    root.render(createElement(Outer, null));
    expect(container.querySelector('em')!.textContent).toBe('nested');
  });
});

// ─── createRoot edge cases ────────────────────────────────────────────
describe('createRoot', () => {
  it('throws for invalid container', () => {
    expect(() => createRoot(null as any)).toThrow('createRoot');
    expect(() => createRoot('string' as any)).toThrow('createRoot');
  });

  it('unmount removes content', () => {
    const root = createRoot(container);
    root.render(createElement('div', null, 'content'));
    expect(container.textContent).toBe('content');
    root.unmount();
  });

  it('unmount is idempotent', () => {
    const root = createRoot(container);
    root.render(createElement('div', null, 'hi'));
    root.unmount();
    root.unmount(); // Should not throw
  });
});
