// (c) 2025-2026 Asymmetric Effort, LLC. MIT LICENSE
// SPDX-License-Identifier: MIT

import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import {
  registerComponentInstance,
  resolveComponentId,
  getComponentTypeTable,
  getComponentName,
  resetComponentRegistry,
  setComponentIdsEnabled,
} from '../../../src/shared/component-registry';

describe('Component Registry', () => {
  beforeEach(() => {
    setComponentIdsEnabled(true);
    resetComponentRegistry();
  });

  describe('registerComponentInstance', () => {
    it('returns compact ID for first instance', () => {
      const id = registerComponentInstance('Toggle');
      expect(id).toBe('s-0-0');
    });

    it('increments instance ID for same type', () => {
      const id1 = registerComponentInstance('Toggle');
      const id2 = registerComponentInstance('Toggle');
      const id3 = registerComponentInstance('Toggle');
      expect(id1).toBe('s-0-0');
      expect(id2).toBe('s-0-1');
      expect(id3).toBe('s-0-2');
    });

    it('assigns different type indices to different components', () => {
      const id1 = registerComponentInstance('Toggle');
      const id2 = registerComponentInstance('Button');
      const id3 = registerComponentInstance('DataGrid');
      expect(id1).toBe('s-0-0');
      expect(id2).toBe('s-1-0');
      expect(id3).toBe('s-2-0');
    });

    it('handles many component types', () => {
      for (let i = 0; i < 100; i++) {
        const id = registerComponentInstance(`Component${i}`);
        expect(id).toBe(`s-${i}-0`);
      }
    });

    it('handles many instances of same type', () => {
      for (let i = 0; i < 100; i++) {
        const id = registerComponentInstance('Button');
        expect(id).toBe(`s-0-${i}`);
      }
    });
  });

  describe('resolveComponentId', () => {
    it('resolves a valid ID', () => {
      registerComponentInstance('Toggle');
      const result = resolveComponentId('s-0-0');
      expect(result).toEqual({ typeName: 'Toggle', typeIndex: 0, instanceId: 0 });
    });

    it('resolves multiple instances', () => {
      registerComponentInstance('DataGrid');
      registerComponentInstance('DataGrid');
      registerComponentInstance('DataGrid');
      const result = resolveComponentId('s-0-2');
      expect(result).toEqual({ typeName: 'DataGrid', typeIndex: 0, instanceId: 2 });
    });

    it('resolves different types', () => {
      registerComponentInstance('Toggle');
      registerComponentInstance('Button');
      const result = resolveComponentId('s-1-0');
      expect(result).toEqual({ typeName: 'Button', typeIndex: 1, instanceId: 0 });
    });

    it('returns null for invalid format', () => {
      expect(resolveComponentId('invalid')).toBeNull();
      expect(resolveComponentId('')).toBeNull();
      expect(resolveComponentId('s-abc-def')).toBeNull();
    });

    it('returns null for unknown type index', () => {
      expect(resolveComponentId('s-99-0')).toBeNull();
    });
  });

  describe('getComponentTypeTable', () => {
    it('returns empty table initially', () => {
      const table = getComponentTypeTable();
      expect(table.size).toBe(0);
    });

    it('returns registered types', () => {
      registerComponentInstance('Toggle');
      registerComponentInstance('Button');
      const table = getComponentTypeTable();
      expect(table.size).toBe(2);
      expect(table.get('Toggle')?.index).toBe(0);
      expect(table.get('Button')?.index).toBe(1);
    });

    it('tracks instance counts', () => {
      registerComponentInstance('Toggle');
      registerComponentInstance('Toggle');
      registerComponentInstance('Toggle');
      const table = getComponentTypeTable();
      expect(table.get('Toggle')?.instanceCount).toBe(3);
    });
  });

  describe('getComponentName', () => {
    it('returns string types as-is', () => {
      expect(getComponentName('div')).toBe('div');
      expect(getComponentName('span')).toBe('span');
    });

    it('returns function name', () => {
      function MyComponent() {}
      expect(getComponentName(MyComponent)).toBe('MyComponent');
    });

    it('returns Anonymous for unnamed functions', () => {
      expect(getComponentName(() => {})).toBe('Anonymous');
    });

    it('returns Unknown for null/undefined', () => {
      expect(getComponentName(null)).toBe('Unknown');
      expect(getComponentName(undefined)).toBe('Unknown');
    });

    it('returns Component for other types', () => {
      expect(getComponentName(42)).toBe('Component');
      expect(getComponentName({})).toBe('Component');
    });
  });

  describe('global lookup table', () => {
    it('sets __SPECIFYJS_COMPONENTS__ on globalThis', () => {
      registerComponentInstance('Toggle');
      registerComponentInstance('Button');
      const lookup = (globalThis as unknown as Record<string, unknown>)
        .__SPECIFYJS_COMPONENTS__ as Record<number, string>;
      expect(lookup[0]).toBe('Toggle');
      expect(lookup[1]).toBe('Button');
    });
  });

  describe('resetComponentRegistry', () => {
    it('clears all registrations', () => {
      registerComponentInstance('Toggle');
      registerComponentInstance('Button');
      resetComponentRegistry();
      const table = getComponentTypeTable();
      expect(table.size).toBe(0);
    });

    it('resets type indices', () => {
      registerComponentInstance('Toggle');
      resetComponentRegistry();
      const id = registerComponentInstance('Button');
      expect(id).toBe('s-0-0');
    });
  });

  describe('setComponentIdsEnabled', () => {
    it('returns empty string when disabled', () => {
      setComponentIdsEnabled(false);
      const id = registerComponentInstance('Toggle');
      expect(id).toBe('');
      setComponentIdsEnabled(true);
    });

    it('returns valid ID when re-enabled', () => {
      setComponentIdsEnabled(false);
      registerComponentInstance('Toggle');
      setComponentIdsEnabled(true);
      const id = registerComponentInstance('Button');
      expect(id).toBe('s-0-0');
    });
  });
});
