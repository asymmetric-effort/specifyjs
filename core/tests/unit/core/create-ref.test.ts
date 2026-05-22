import { describe, it, expect } from 'vitest';
import { createRef } from '../../../src/index';

describe('createRef', () => {
  it('creates a ref with current set to null', () => {
    const ref = createRef();
    expect(ref.current).toBeNull();
  });

  it('has a mutable current property', () => {
    const ref = createRef<HTMLDivElement>();
    expect(ref.current).toBeNull();
    ref.current = document.createElement('div');
    expect(ref.current).toBeInstanceOf(HTMLDivElement);
  });

  it('creates distinct ref objects each time', () => {
    const ref1 = createRef();
    const ref2 = createRef();
    expect(ref1).not.toBe(ref2);
  });
});
