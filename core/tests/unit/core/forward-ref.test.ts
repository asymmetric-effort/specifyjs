import { describe, it, expect } from 'vitest';
import { forwardRef } from '../../../src/index';
import { SPEC_FORWARD_REF_TYPE } from '../../../src/shared/types';

describe('forwardRef', () => {
  it('creates a ForwardRef component with the correct $$typeof', () => {
    const render = () => null;
    const comp = forwardRef(render);
    expect(comp.$$typeof).toBe(SPEC_FORWARD_REF_TYPE);
  });

  it('stores the render function', () => {
    const render = () => null;
    const comp = forwardRef(render);
    expect(comp.render).toBe(render);
  });

  it('uses function name as displayName', () => {
    function MyInput() {
      return null;
    }
    const comp = forwardRef(MyInput);
    expect(comp.displayName).toBe('MyInput');
  });

  it('falls back to ForwardRef for anonymous functions', () => {
    const comp = forwardRef(() => null);
    expect(comp.displayName).toBe('ForwardRef');
  });
});
