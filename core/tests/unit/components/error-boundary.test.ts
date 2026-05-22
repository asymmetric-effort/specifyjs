import { describe, it, expect } from 'vitest';
import { ErrorBoundary } from '../../../src/components/error-boundary';

describe('ErrorBoundary', () => {
  it('constructs with default state', () => {
    const eb = new ErrorBoundary({});
    expect(eb.state.hasError).toBe(false);
    expect(eb.state.error).toBeNull();
  });

  it('getDerivedStateFromError returns hasError true', () => {
    const result = ErrorBoundary.getDerivedStateFromError(new Error('test'));
    expect(result).toEqual({ hasError: true, error: expect.any(Error) });
  });

  it('renders children when no error', () => {
    const eb = new ErrorBoundary({ children: 'child content' });
    expect(eb.render()).toBe('child content');
  });

  it('renders fallback when hasError is true', () => {
    const eb = new ErrorBoundary({ fallback: 'fallback content' });
    eb.state = { hasError: true, error: new Error('boom') };
    expect(eb.render()).toBe('fallback content');
  });

  it('renders null when hasError and no fallback', () => {
    const eb = new ErrorBoundary({});
    eb.state = { hasError: true, error: new Error('boom') };
    expect(eb.render()).toBeNull();
  });

  it('renders null when no children', () => {
    const eb = new ErrorBoundary({});
    expect(eb.render()).toBeNull();
  });

  it('componentDidCatch calls onError prop', () => {
    let capturedError: unknown = null;
    const onError = (err: unknown) => {
      capturedError = err;
    };
    const eb = new ErrorBoundary({ onError });
    const error = new Error('caught');
    eb.componentDidCatch(error, { componentStack: '' });
    expect(capturedError).toBe(error);
  });

  it('componentDidCatch is safe when no onError prop', () => {
    const eb = new ErrorBoundary({});
    expect(() => {
      eb.componentDidCatch(new Error('no handler'), { componentStack: '' });
    }).not.toThrow();
  });
});
