import { describe, it, expect, beforeEach } from '@asymmetric-effort/nogginlessdom';
import { useWindowSize, __resetWindowSize } from '../../../src/hooks/use-window-size';
import type { WindowSize } from '../../../src/hooks/use-window-size';
import { createElement } from '../../../src/index';
import { createRoot } from '../../../src/dom/create-root';

let container: HTMLDivElement;

beforeEach(() => {
  __resetWindowSize();
  container = document.createElement('div');
  document.body.appendChild(container);
  return () => {
    document.body.removeChild(container);
  };
});

describe('useWindowSize', () => {
  it('is a function', () => {
    expect(typeof useWindowSize).toBe('function');
  });

  it('returns an object with width and height', () => {
    let size: WindowSize | undefined;
    function Comp() {
      size = useWindowSize();
      return createElement('div', null, 'test');
    }
    const root = createRoot(container);
    root.render(createElement(Comp, null));
    expect(size).toBeDefined();
    expect(typeof size!.width).toBe('number');
    expect(typeof size!.height).toBe('number');
    root.unmount();
  });

  it('returns current window dimensions', () => {
    let size: WindowSize | undefined;
    function Comp() {
      size = useWindowSize();
      return createElement('div', null, 'test');
    }
    const root = createRoot(container);
    root.render(createElement(Comp, null));
    // In test env, innerWidth/innerHeight may be 0 or defined values
    expect(size!.width).toBe(window.innerWidth);
    expect(size!.height).toBe(window.innerHeight);
    root.unmount();
  });

  it('__resetWindowSize resets to current window dimensions', () => {
    // Just verify it does not throw
    __resetWindowSize();
  });

  it('returns same snapshot reference on consecutive renders without resize', () => {
    const sizes: WindowSize[] = [];
    function Comp() {
      sizes.push(useWindowSize());
      return createElement('div', null, 'test');
    }
    const root = createRoot(container);
    root.render(createElement(Comp, null));
    root.render(createElement(Comp, null));
    // Same snapshot object should be returned (no resize happened)
    expect(sizes[0]).toBe(sizes[1]);
    root.unmount();
  });
});

describe('WindowSize type', () => {
  it('has the expected shape', () => {
    const size: WindowSize = { width: 100, height: 200 };
    expect(size.width).toBe(100);
    expect(size.height).toBe(200);
  });
});
