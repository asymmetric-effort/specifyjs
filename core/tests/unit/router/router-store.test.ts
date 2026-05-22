import { describe, it, expect, vi, beforeEach } from 'vitest';
import {
  subscribe,
  getSnapshot,
  getServerSnapshot,
  navigate,
  __resetSnapshot,
} from '../../../src/router/router-store';

describe('router-store', () => {
  beforeEach(() => {
    window.location.hash = '';
    __resetSnapshot();
  });

  it('getSnapshot returns current pathname', () => {
    const snapshot = getSnapshot();
    expect(snapshot.pathname).toBe('/');
  });

  it('getServerSnapshot returns root', () => {
    const snapshot = getServerSnapshot();
    expect(snapshot.pathname).toBe('/');
    expect(snapshot.hash).toBe('');
  });

  it('subscribe registers a listener', () => {
    const listener = vi.fn();
    const unsub = subscribe(listener);
    navigate('/test');
    // Listener called via hashchange
    expect(listener).toHaveBeenCalled();
    unsub();
  });

  it('unsubscribe removes listener', () => {
    const listener = vi.fn();
    const unsub = subscribe(listener);
    unsub();
    navigate('/after-unsub');
    // Wait a tick for any async events
    expect(listener).not.toHaveBeenCalled();
  });

  it('navigate updates hash', () => {
    navigate('/about');
    expect(window.location.hash).toBe('#/about');
  });

  it('navigate with replace uses replaceState', () => {
    const spy = vi.spyOn(window.history, 'replaceState');
    navigate('/replaced', { replace: true });
    expect(spy).toHaveBeenCalled();
    spy.mockRestore();
  });

  it('navigate with # prefix works', () => {
    navigate('#/prefixed');
    expect(window.location.hash).toBe('#/prefixed');
  });

  it('snapshot updates after navigate', () => {
    navigate('/new-path');
    const snapshot = getSnapshot();
    expect(snapshot.pathname).toBe('/new-path');
  });
});
