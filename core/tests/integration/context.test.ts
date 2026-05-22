import { describe, it, expect, beforeEach } from 'vitest';
import { createElement, createContext, Fragment } from '../../src/index';
import { useContext } from '../../src/hooks/index';
import { createRoot } from '../../src/dom/create-root';

let container: HTMLDivElement;

beforeEach(() => {
  container = document.createElement('div');
  document.body.appendChild(container);
  return () => {
    document.body.removeChild(container);
  };
});

describe('Context rendering', () => {
  it('reads default context when no Provider', () => {
    const Ctx = createContext('default-val');

    function Reader() {
      const val = useContext(Ctx);
      return createElement('span', null, val);
    }

    const root = createRoot(container);
    root.render(createElement(Reader, null));
    expect(container.innerHTML).toBe('<span>default-val</span>');
  });

  it('reads provided value from Provider', () => {
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
    expect(container.innerHTML).toBe('<span>provided</span>');
  });

  it('nested providers: inner value wins', () => {
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
    expect(container.innerHTML).toBe('<span>level-2</span>');
  });

  it('context with object values', () => {
    const ThemeCtx = createContext({ color: 'blue', size: 12 });

    function Display() {
      const theme = useContext(ThemeCtx);
      return createElement('div', null, `${theme.color}-${theme.size}`);
    }

    const root = createRoot(container);
    root.render(
      createElement(
        ThemeCtx.Provider as unknown as () => null,
        { value: { color: 'red', size: 24 } },
        createElement(Display, null),
      ),
    );
    expect(container.innerHTML).toBe('<div>red-24</div>');
  });

  it('multiple independent contexts', () => {
    const CtxA = createContext('A-default');
    const CtxB = createContext('B-default');

    function Reader() {
      const a = useContext(CtxA);
      const b = useContext(CtxB);
      return createElement('div', null, `${a}+${b}`);
    }

    const root = createRoot(container);
    root.render(
      createElement(
        CtxA.Provider as unknown as () => null,
        { value: 'A-provided' },
        createElement(
          CtxB.Provider as unknown as () => null,
          { value: 'B-provided' },
          createElement(Reader, null),
        ),
      ),
    );
    expect(container.innerHTML).toBe('<div>A-provided+B-provided</div>');
  });

  it('context with null value', () => {
    const Ctx = createContext<string | null>('not-null');

    function Reader() {
      const val = useContext(Ctx);
      return createElement('span', null, val === null ? 'IS_NULL' : val);
    }

    const root = createRoot(container);
    root.render(
      createElement(
        Ctx.Provider as unknown as () => null,
        { value: null },
        createElement(Reader, null),
      ),
    );
    expect(container.innerHTML).toBe('<span>IS_NULL</span>');
  });
});
