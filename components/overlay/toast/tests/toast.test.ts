// (c) 2025-2026 Asymmetric Effort, LLC. MIT LICENSE
// SPDX-License-Identifier: MIT

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { createToaster } from '../src/index';
import type { Toaster, ToastItem } from '../src/index';

describe('Toast / createToaster', () => {
  let toaster: Toaster;

  beforeEach(() => {
    toaster = createToaster({ position: 'top-right', maxToasts: 5, defaultDuration: 4000 });
  });

  // ── Happy path ──────────────────────────────────────────────
  describe('happy path', () => {
    it('creates a toaster with default config', () => {
      const t = createToaster();
      expect(t.config.position).toBe('top-right');
      expect(t.config.maxToasts).toBe(5);
      expect(t.config.defaultDuration).toBe(4000);
    });

    it('adds a toast and returns an id', () => {
      const id = toaster.toast('Hello');
      expect(typeof id).toBe('string');
      expect(id.length).toBeGreaterThan(0);
    });

    it('getToasts returns the added toast', () => {
      toaster.toast('Test message');
      const toasts = toaster.getToasts();
      expect(toasts).toHaveLength(1);
      expect(toasts[0]!.message).toBe('Test message');
    });

    it('toast has correct default type', () => {
      toaster.toast('Info toast');
      expect(toaster.getToasts()[0]!.type).toBe('info');
    });

    it('toast respects type option', () => {
      toaster.toast('Error!', { type: 'error' });
      expect(toaster.getToasts()[0]!.type).toBe('error');
    });

    it('toast respects custom duration', () => {
      toaster.toast('Quick', { duration: 1000 });
      expect(toaster.getToasts()[0]!.duration).toBe(1000);
    });

    it('dismiss removes a specific toast', () => {
      const id = toaster.toast('To remove');
      toaster.toast('To keep');
      toaster.dismiss(id);
      const toasts = toaster.getToasts();
      expect(toasts).toHaveLength(1);
      expect(toasts[0]!.message).toBe('To keep');
    });

    it('dismissAll removes all toasts', () => {
      toaster.toast('One');
      toaster.toast('Two');
      toaster.toast('Three');
      toaster.dismissAll();
      expect(toaster.getToasts()).toHaveLength(0);
    });
  });

  // ── Sad path ────────────────────────────────────────────────
  describe('sad path', () => {
    it('getToasts returns empty array initially', () => {
      expect(toaster.getToasts()).toHaveLength(0);
    });

    it('dismiss with invalid id does not crash', () => {
      toaster.toast('Existing');
      toaster.dismiss('nonexistent-id');
      expect(toaster.getToasts()).toHaveLength(1);
    });

    it('dismissAll on empty toaster does not crash', () => {
      toaster.dismissAll();
      expect(toaster.getToasts()).toHaveLength(0);
    });

    it('respects maxToasts limit', () => {
      const t = createToaster({ maxToasts: 3 });
      t.toast('1');
      t.toast('2');
      t.toast('3');
      t.toast('4');
      expect(t.getToasts()).toHaveLength(3);
    });

    it('newest toast is first in the list', () => {
      toaster.toast('Old');
      toaster.toast('New');
      expect(toaster.getToasts()[0]!.message).toBe('New');
    });
  });

  // ── Interaction ─────────────────────────────────────────────
  describe('interaction', () => {
    it('subscribe listener is called on toast', () => {
      const listener = vi.fn();
      toaster.subscribe(listener);
      toaster.toast('Notify');
      expect(listener).toHaveBeenCalledTimes(1);
    });

    it('subscribe listener is called on dismiss', () => {
      const listener = vi.fn();
      toaster.subscribe(listener);
      const id = toaster.toast('Temp');
      listener.mockClear();
      toaster.dismiss(id);
      expect(listener).toHaveBeenCalledTimes(1);
    });

    it('unsubscribe stops notifications', () => {
      const listener = vi.fn();
      const unsub = toaster.subscribe(listener);
      unsub();
      toaster.toast('Ignored');
      expect(listener).not.toHaveBeenCalled();
    });

    it('toast with action stores the action', () => {
      const action = { label: 'Undo', onClick: vi.fn() };
      toaster.toast('With action', { action });
      const t = toaster.getToasts()[0]!;
      expect(t.action).toBeDefined();
      expect(t.action!.label).toBe('Undo');
    });

    it('supports all toast types', () => {
      const types = ['info', 'success', 'warning', 'error'] as const;
      for (const type of types) {
        const t = createToaster();
        t.toast(`${type} message`, { type });
        expect(t.getToasts()[0]!.type).toBe(type);
      }
    });

    it('supports all position configurations', () => {
      const positions = [
        'top-right', 'top-left', 'bottom-right',
        'bottom-left', 'top-center', 'bottom-center',
      ] as const;
      for (const position of positions) {
        const t = createToaster({ position });
        expect(t.config.position).toBe(position);
      }
    });
  });
});
