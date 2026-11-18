import { describe, it, expect, vi, beforeEach } from '@asymmetric-effort/nogginlessdom';
import { useBreakpoint, useBreakpointValue } from '../../../src/hooks/use-breakpoint';
import { __resetBreakpoints, configureBreakpoints } from '../../../src/hooks/breakpoints';
import { createElement } from '../../../src/index';
import { createRoot } from '../../../src/dom/create-root';

let container: HTMLDivElement;

beforeEach(() => {
  __resetBreakpoints();
  container = document.createElement('div');
  document.body.appendChild(container);
  return () => {
    document.body.removeChild(container);
  };
});

describe('useBreakpoint', () => {
  it('is a function', () => {
    expect(typeof useBreakpoint).toBe('function');
  });

  it('returns a valid breakpoint string when rendered', () => {
    let bp: string | undefined;
    function Comp() {
      bp = useBreakpoint();
      return createElement('div', null, 'test');
    }
    const root = createRoot(container);
    root.render(createElement(Comp, null));
    expect(['xs', 'sm', 'md', 'lg', 'xl', '2xl']).toContain(bp);
    root.unmount();
  });

  it('returns xs when no media queries match', () => {
    // In test env without real matchMedia, all queries return false → xs
    let bp: string | undefined;
    const originalMatchMedia = (window as any).matchMedia;
    (window as any).matchMedia = vi.fn(() => ({
      matches: false,
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
    }));

    function Comp() {
      bp = useBreakpoint();
      return createElement('div', null, 'test');
    }
    const root = createRoot(container);
    root.render(createElement(Comp, null));
    expect(bp).toBe('xs');
    root.unmount();
    (window as any).matchMedia = originalMatchMedia;
  });

  it('returns the largest matching breakpoint', () => {
    let bp: string | undefined;
    const originalMatchMedia = (window as any).matchMedia;
    // Simulate a 1024px viewport: lg matches, xl and 2xl don't
    (window as any).matchMedia = vi.fn((query: string) => ({
      matches:
        query === '(min-width: 0px)' ||
        query === '(min-width: 640px)' ||
        query === '(min-width: 768px)' ||
        query === '(min-width: 1024px)',
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
    }));

    function Comp() {
      bp = useBreakpoint();
      return createElement('div', null, 'test');
    }
    const root = createRoot(container);
    root.render(createElement(Comp, null));
    expect(bp).toBe('lg');
    root.unmount();
    (window as any).matchMedia = originalMatchMedia;
  });
});

describe('useBreakpointValue', () => {
  it('is a function', () => {
    expect(typeof useBreakpointValue).toBe('function');
  });

  it('returns the value for the current breakpoint', () => {
    let value: string | undefined;
    const originalMatchMedia = (window as any).matchMedia;
    // Simulate md breakpoint
    (window as any).matchMedia = vi.fn((query: string) => ({
      matches:
        query === '(min-width: 0px)' ||
        query === '(min-width: 640px)' ||
        query === '(min-width: 768px)',
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
    }));

    function Comp() {
      value = useBreakpointValue({ xs: 'extra-small', sm: 'small', md: 'medium', lg: 'large' });
      return createElement('div', null, 'test');
    }
    const root = createRoot(container);
    root.render(createElement(Comp, null));
    expect(value).toBe('medium');
    root.unmount();
    (window as any).matchMedia = originalMatchMedia;
  });

  it('falls back to smaller breakpoint value if current is not defined', () => {
    let value: string | undefined;
    const originalMatchMedia = (window as any).matchMedia;
    // Simulate md breakpoint, but no md value provided
    (window as any).matchMedia = vi.fn((query: string) => ({
      matches:
        query === '(min-width: 0px)' ||
        query === '(min-width: 640px)' ||
        query === '(min-width: 768px)',
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
    }));

    function Comp() {
      value = useBreakpointValue({ xs: 'extra-small', lg: 'large' });
      return createElement('div', null, 'test');
    }
    const root = createRoot(container);
    root.render(createElement(Comp, null));
    // md not defined, falls back to sm (not defined), then xs
    expect(value).toBe('extra-small');
    root.unmount();
    (window as any).matchMedia = originalMatchMedia;
  });

  it('returns undefined when no values match', () => {
    let value: number | undefined;
    const originalMatchMedia = (window as any).matchMedia;
    (window as any).matchMedia = vi.fn(() => ({
      matches: false,
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
    }));

    function Comp() {
      // xs is the fallback, but we don't provide xs
      value = useBreakpointValue({ md: 10, lg: 20 });
      return createElement('div', null, 'test');
    }
    const root = createRoot(container);
    root.render(createElement(Comp, null));
    // Current is xs, no xs/sm defined → undefined
    expect(value).toBeUndefined();
    root.unmount();
    (window as any).matchMedia = originalMatchMedia;
  });
});
