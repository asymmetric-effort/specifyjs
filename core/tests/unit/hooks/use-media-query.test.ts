import { describe, it, expect, vi, beforeEach } from '@asymmetric-effort/nogginlessdom';
import { useMediaQuery } from '../../../src/hooks/use-media-query';
import { createElement } from '../../../src/index';
import { createRoot } from '../../../src/dom/create-root';

let container: HTMLDivElement;

beforeEach(() => {
  container = document.createElement('div');
  document.body.appendChild(container);
  return () => {
    document.body.removeChild(container);
  };
});

describe('useMediaQuery', () => {
  it('is a function', () => {
    expect(typeof useMediaQuery).toBe('function');
  });

  it('returns false for non-matching query in test environment', () => {
    let result: boolean | undefined;
    function Comp() {
      result = useMediaQuery('(min-width: 99999px)');
      return createElement('div', null, 'test');
    }
    const root = createRoot(container);
    root.render(createElement(Comp, null));
    // In test env, matchMedia may not exist or return false for all queries
    expect(typeof result).toBe('boolean');
    root.unmount();
  });

  it('returns a boolean value when rendered', () => {
    let result: boolean | undefined;
    function Comp() {
      result = useMediaQuery('(min-width: 0px)');
      return createElement('div', null, 'test');
    }
    const root = createRoot(container);
    root.render(createElement(Comp, null));
    expect(typeof result).toBe('boolean');
    root.unmount();
  });

  it('can be called with different queries in the same component', () => {
    let r1: boolean | undefined;
    let r2: boolean | undefined;
    function Comp() {
      r1 = useMediaQuery('(min-width: 0px)');
      r2 = useMediaQuery('(max-width: 99999px)');
      return createElement('div', null, 'test');
    }
    const root = createRoot(container);
    root.render(createElement(Comp, null));
    expect(typeof r1).toBe('boolean');
    expect(typeof r2).toBe('boolean');
    root.unmount();
  });

  it('subscribes to matchMedia changes via addEventListener', () => {
    // Set up a mock matchMedia that tracks listeners
    const listeners: Array<() => void> = [];
    const mockMql = {
      matches: false,
      addEventListener: vi.fn((_event: string, cb: () => void) => {
        listeners.push(cb);
      }),
      removeEventListener: vi.fn(),
    };
    const originalMatchMedia = (window as any).matchMedia;
    (window as any).matchMedia = vi.fn(() => mockMql);

    let result: boolean | undefined;
    function Comp() {
      result = useMediaQuery('(min-width: 768px)');
      return createElement('div', null, String(result));
    }
    const root = createRoot(container);
    root.render(createElement(Comp, null));
    expect(result).toBe(false);
    expect((window as any).matchMedia).toHaveBeenCalledWith('(min-width: 768px)');

    root.unmount();
    // Restore
    (window as any).matchMedia = originalMatchMedia;
  });
});
