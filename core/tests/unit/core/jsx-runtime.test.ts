import { describe, it, expect } from 'vitest';
import { jsx, jsxs, Fragment } from '../../../src/jsx-runtime';
import { jsxDEV, Fragment as DevFragment } from '../../../src/jsx-dev-runtime';
import { SPEC_ELEMENT_TYPE, SPEC_FRAGMENT_TYPE } from '../../../src/shared/types';

describe('jsx-runtime', () => {
  describe('jsx', () => {
    it('creates an element with type and props', () => {
      const el = jsx('div', { id: 'test', children: 'hello' });
      expect(el.$$typeof).toBe(SPEC_ELEMENT_TYPE);
      expect(el.type).toBe('div');
      expect(el.props.id).toBe('test');
    });

    it('extracts key from config', () => {
      const el = jsx('div', { key: 'my-key', className: 'x' });
      expect(el.key).toBe('my-key');
    });

    it('prefers maybeKey parameter over config.key', () => {
      const el = jsx('div', { key: 'config-key' }, 'param-key');
      expect(el.key).toBe('param-key');
    });

    it('key is null when neither provided', () => {
      const el = jsx('div', { className: 'x' });
      // createElement coerces key to string, so null key becomes 'null' through createElement
      // The jsx function passes key=null which createElement converts
      expect(el.key).toBeNull();
    });

    it('passes children through in props', () => {
      const el = jsx('div', { children: 'text content' });
      expect(el.props.children).toBe('text content');
    });

    it('works with function components', () => {
      const Comp = (props: { name: string }) => null;
      const el = jsx(Comp, { name: 'test', children: null });
      expect(el.type).toBe(Comp);
      expect(el.props.name).toBe('test');
    });

    it('works with Fragment', () => {
      const el = jsx(Fragment, { children: ['a', 'b'] });
      expect(el.type).toBe(SPEC_FRAGMENT_TYPE);
    });
  });

  describe('jsxs', () => {
    it('is the same function as jsx', () => {
      expect(jsxs).toBe(jsx);
    });

    it('creates elements identically to jsx', () => {
      const el = jsxs('ul', { children: ['a', 'b', 'c'] });
      expect(el.$$typeof).toBe(SPEC_ELEMENT_TYPE);
      expect(el.type).toBe('ul');
    });
  });

  describe('Fragment export', () => {
    it('exports Fragment symbol', () => {
      expect(Fragment).toBe(SPEC_FRAGMENT_TYPE);
    });
  });
});

describe('jsx-dev-runtime', () => {
  it('jsxDEV creates elements like jsx', () => {
    const el = jsxDEV('span', { children: 'dev' });
    expect(el.$$typeof).toBe(SPEC_ELEMENT_TYPE);
    expect(el.type).toBe('span');
  });

  it('exports Fragment', () => {
    expect(DevFragment).toBe(SPEC_FRAGMENT_TYPE);
  });
});
