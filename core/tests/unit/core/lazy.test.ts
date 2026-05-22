import { describe, it, expect } from 'vitest';
import { lazy } from '../../../src/index';
import { SPEC_LAZY_TYPE } from '../../../src/shared/types';

describe('lazy', () => {
  it('creates a Lazy component with correct $$typeof', () => {
    const lazyComp = lazy(() => Promise.resolve({ default: () => null }));
    expect(lazyComp.$$typeof).toBe(SPEC_LAZY_TYPE);
  });

  it('starts in pending status', () => {
    const lazyComp = lazy(() => Promise.resolve({ default: () => null }));
    expect(lazyComp._payload._status).toBe('pending');
  });

  it('throws the promise on first init (for Suspense)', () => {
    const promise = Promise.resolve({ default: () => null });
    const lazyComp = lazy(() => promise);
    expect(() => lazyComp._init()).toThrow();
  });

  it('resolves to the component after promise resolves', async () => {
    const Comp = () => null;
    const lazyComp = lazy(() => Promise.resolve({ default: Comp }));

    try {
      lazyComp._init();
    } catch {
      // expected: throws promise
    }

    await new Promise((r) => setTimeout(r, 10));
    expect(lazyComp._payload._status).toBe('resolved');
    expect(lazyComp._init()).toBe(Comp);
  });

  it('stores rejection error after promise rejects', async () => {
    const error = new Error('load failed');
    const lazyComp = lazy(() => Promise.reject(error));

    try {
      lazyComp._init();
    } catch {
      // expected
    }

    await new Promise((r) => setTimeout(r, 10));
    expect(lazyComp._payload._status).toBe('rejected');
    expect(() => lazyComp._init()).toThrow('load failed');
  });
});
