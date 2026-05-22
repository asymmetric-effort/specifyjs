import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import {
  connectDevTools,
  isDevToolsConnected,
  notifyDevToolsOfCommit,
  notifyDevToolsOfUnmount,
} from '../../../src/devtools/index';

describe('DevTools integration', () => {
  afterEach(() => {
    // Clean up global hook
    delete (globalThis as unknown as Record<string, unknown>).__SPECIFY_DEVTOOLS_GLOBAL_HOOK__;
  });

  it('isDevToolsConnected returns false when no hook is present', () => {
    expect(isDevToolsConnected()).toBe(false);
  });

  it('connects when global hook exists', () => {
    (globalThis as unknown as Record<string, unknown>).__SPECIFY_DEVTOOLS_GLOBAL_HOOK__ = {
      supportsFiber: true,
    };
    connectDevTools();
    expect(isDevToolsConnected()).toBe(true);
  });

  it('notifyDevToolsOfCommit calls onCommitFiberRoot', () => {
    const onCommit = vi.fn();
    (globalThis as unknown as Record<string, unknown>).__SPECIFY_DEVTOOLS_GLOBAL_HOOK__ = {
      onCommitFiberRoot: onCommit,
    };
    connectDevTools();

    notifyDevToolsOfCommit({ id: 'root-1' });
    expect(onCommit).toHaveBeenCalledWith({ id: 'root-1' });
  });

  it('notifyDevToolsOfUnmount calls onCommitFiberUnmount', () => {
    const onUnmount = vi.fn();
    (globalThis as unknown as Record<string, unknown>).__SPECIFY_DEVTOOLS_GLOBAL_HOOK__ = {
      onCommitFiberUnmount: onUnmount,
    };
    connectDevTools();

    const fiber = { tag: 0 } as Parameters<typeof notifyDevToolsOfUnmount>[0];
    notifyDevToolsOfUnmount(fiber);
    expect(onUnmount).toHaveBeenCalledWith(fiber);
  });

  it('does not throw when devtools not connected', () => {
    expect(() => notifyDevToolsOfCommit({})).not.toThrow();
    expect(() =>
      notifyDevToolsOfUnmount({} as Parameters<typeof notifyDevToolsOfUnmount>[0]),
    ).not.toThrow();
  });
});
