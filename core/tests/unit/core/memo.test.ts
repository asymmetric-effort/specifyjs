import { describe, it, expect } from 'vitest';
import { memo } from '../../../src/index';
import { SPEC_MEMO_TYPE } from '../../../src/shared/types';

describe('memo', () => {
  it('creates a Memo component with correct $$typeof', () => {
    const Comp = () => null;
    const memoized = memo(Comp);
    expect(memoized.$$typeof).toBe(SPEC_MEMO_TYPE);
  });

  it('stores the original component as type', () => {
    const Comp = () => null;
    const memoized = memo(Comp);
    expect(memoized.type).toBe(Comp);
  });

  it('defaults compare to null', () => {
    const Comp = () => null;
    const memoized = memo(Comp);
    expect(memoized.compare).toBeNull();
  });

  it('stores custom compare function', () => {
    const Comp = () => null;
    const compare = () => true;
    const memoized = memo(Comp, compare);
    expect(memoized.compare).toBe(compare);
  });

  it('uses component name as displayName', () => {
    function MyWidget() {
      return null;
    }
    const memoized = memo(MyWidget);
    expect(memoized.displayName).toBe('MyWidget');
  });
});
