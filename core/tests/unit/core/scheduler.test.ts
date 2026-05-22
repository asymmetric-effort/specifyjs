import { describe, it, expect, vi, beforeEach } from 'vitest';
import {
  scheduleUpdate,
  batchUpdates,
  flushPendingTasks,
  isBatching,
} from '../../../src/core/scheduler';

describe('scheduler', () => {
  describe('scheduleUpdate', () => {
    it('executes task immediately when not batching', () => {
      const task = vi.fn();
      scheduleUpdate(task);
      expect(task).toHaveBeenCalledTimes(1);
    });

    it('defers task when batching', () => {
      const task = vi.fn();
      batchUpdates(() => {
        scheduleUpdate(task);
        expect(task).not.toHaveBeenCalled();
      });
      expect(task).toHaveBeenCalledTimes(1);
    });
  });

  describe('batchUpdates', () => {
    it('defers all updates until batch completes', () => {
      const order: number[] = [];

      batchUpdates(() => {
        scheduleUpdate(() => order.push(1));
        scheduleUpdate(() => order.push(2));
        scheduleUpdate(() => order.push(3));
        expect(order).toEqual([]);
      });

      expect(order).toEqual([1, 2, 3]);
    });

    it('returns the callback return value', () => {
      const result = batchUpdates(() => 42);
      expect(result).toBe(42);
    });

    it('handles nested batches', () => {
      const order: number[] = [];

      batchUpdates(() => {
        scheduleUpdate(() => order.push(1));
        batchUpdates(() => {
          scheduleUpdate(() => order.push(2));
        });
        // Inner batch doesn't flush — outer batch is still open
        scheduleUpdate(() => order.push(3));
        expect(order).toEqual([]);
      });

      expect(order).toEqual([1, 2, 3]);
    });

    it('flushes pending tasks even if callback throws', () => {
      const task = vi.fn();
      expect(() => {
        batchUpdates(() => {
          scheduleUpdate(task);
          throw new Error('fail');
        });
      }).toThrow('fail');
      expect(task).toHaveBeenCalledTimes(1);
    });
  });

  describe('isBatching', () => {
    it('returns false normally', () => {
      expect(isBatching()).toBe(false);
    });

    it('returns true inside batchUpdates', () => {
      batchUpdates(() => {
        expect(isBatching()).toBe(true);
      });
    });
  });

  describe('flushPendingTasks', () => {
    it('flushes all pending tasks', () => {
      const tasks: number[] = [];

      batchUpdates(() => {
        scheduleUpdate(() => tasks.push(1));
        scheduleUpdate(() => tasks.push(2));
        // Flush manually before batch ends
        flushPendingTasks();
        expect(tasks).toEqual([1, 2]);
      });
    });

    it('is no-op when no pending tasks', () => {
      expect(() => flushPendingTasks()).not.toThrow();
    });
  });
});
