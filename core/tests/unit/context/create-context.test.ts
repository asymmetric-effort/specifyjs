import { describe, it, expect } from 'vitest';
import { createContext } from '../../../src/index';
import { SPEC_PROVIDER_TYPE, SPEC_CONSUMER_TYPE } from '../../../src/shared/types';

describe('createContext', () => {
  it('creates a context with the default value', () => {
    const ctx = createContext('default');
    expect(ctx._currentValue).toBe('default');
    expect(ctx._defaultValue).toBe('default');
  });

  it('has Provider and Consumer', () => {
    const ctx = createContext(0);
    expect(ctx.Provider).toBeDefined();
    expect(ctx.Consumer).toBeDefined();
  });

  it('Provider has correct $$typeof', () => {
    const ctx = createContext(42);
    const provider = ctx.Provider as unknown as { $$typeof: symbol };
    expect(provider.$$typeof).toBe(SPEC_PROVIDER_TYPE);
  });

  it('Consumer has correct $$typeof', () => {
    const ctx = createContext(42);
    const consumer = ctx.Consumer as unknown as { $$typeof: symbol };
    expect(consumer.$$typeof).toBe(SPEC_CONSUMER_TYPE);
  });

  it('Provider references back to the context', () => {
    const ctx = createContext(42);
    expect((ctx.Provider as unknown as { _context: typeof ctx })._context).toBe(ctx);
  });

  it('Consumer references back to the context', () => {
    const ctx = createContext(42);
    expect((ctx.Consumer as unknown as { _context: typeof ctx })._context).toBe(ctx);
  });

  it('handles complex default values', () => {
    const defaultVal = { theme: 'dark', locale: 'en' };
    const ctx = createContext(defaultVal);
    expect(ctx._currentValue).toBe(defaultVal);
  });

  it('handles null default value', () => {
    const ctx = createContext(null);
    expect(ctx._currentValue).toBeNull();
  });

  it('handles undefined default value', () => {
    const ctx = createContext(undefined);
    expect(ctx._currentValue).toBeUndefined();
  });
});
