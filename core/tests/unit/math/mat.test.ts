// (c) 2025-2026 Asymmetric Effort, LLC. MIT LICENSE
// SPDX-License-Identifier: MIT

import { describe, it, expect } from '@asymmetric-effort/nogginlessdom';
import {
  matN,
  matNIdentity,
  matNGet,
  matNSet,
  matNMultiply,
  matNMultiplyVec,
  matNTranspose,
  matNScale,
  matNAdd,
  matNCopy,
  matNFromArray,
} from '../../../../components/math/src/index';

describe('MatN', () => {
  it('should create a zero-initialized NxN matrix', () => {
    const m = matN(3);
    expect(m.size).toBe(3);
    for (let i = 0; i < 9; i++) {
      expect(m.data[i]).toBe(0);
    }
  });

  it('should create a 1x1 zero matrix', () => {
    const m = matN(1);
    expect(m.size).toBe(1);
    expect(m.data[0]).toBe(0);
  });

  it('should create an NxN identity matrix', () => {
    const m = matNIdentity(3);
    expect(m.size).toBe(3);
    for (let i = 0; i < 3; i++) {
      for (let j = 0; j < 3; j++) {
        expect(matNGet(m, i, j)).toBe(i === j ? 1 : 0);
      }
    }
  });

  it('should create a 1x1 identity matrix', () => {
    const m = matNIdentity(1);
    expect(matNGet(m, 0, 0)).toBe(1);
  });

  it('should get the value at a given row and column', () => {
    const m = matNFromArray(2, [1, 2, 3, 4]);
    expect(matNGet(m, 0, 0)).toBe(1);
    expect(matNGet(m, 0, 1)).toBe(2);
    expect(matNGet(m, 1, 0)).toBe(3);
    expect(matNGet(m, 1, 1)).toBe(4);
  });

  it('should set the value at a given row and column immutably', () => {
    const m = matN(2);
    const m2 = matNSet(m, 0, 1, 42);
    expect(matNGet(m2, 0, 1)).toBe(42);
    // original unchanged
    expect(matNGet(m, 0, 1)).toBe(0);
  });

  it('should multiply two identity matrices and get identity', () => {
    const I = matNIdentity(3);
    const result = matNMultiply(I, I);
    for (let i = 0; i < 3; i++) {
      for (let j = 0; j < 3; j++) {
        expect(matNGet(result, i, j)).toBeCloseTo(i === j ? 1 : 0);
      }
    }
  });

  it('should return A when multiplying identity * A', () => {
    const I = matNIdentity(2);
    const A = matNFromArray(2, [5, 6, 7, 8]);
    const result = matNMultiply(I, A);
    expect(matNGet(result, 0, 0)).toBeCloseTo(5);
    expect(matNGet(result, 0, 1)).toBeCloseTo(6);
    expect(matNGet(result, 1, 0)).toBeCloseTo(7);
    expect(matNGet(result, 1, 1)).toBeCloseTo(8);
  });

  it('should multiply two 2x2 matrices correctly', () => {
    // [1 2] * [5 6] = [1*5+2*7  1*6+2*8] = [19 22]
    // [3 4]   [7 8]   [3*5+4*7  3*6+4*8]   [43 50]
    const A = matNFromArray(2, [1, 2, 3, 4]);
    const B = matNFromArray(2, [5, 6, 7, 8]);
    const result = matNMultiply(A, B);
    expect(matNGet(result, 0, 0)).toBeCloseTo(19);
    expect(matNGet(result, 0, 1)).toBeCloseTo(22);
    expect(matNGet(result, 1, 0)).toBeCloseTo(43);
    expect(matNGet(result, 1, 1)).toBeCloseTo(50);
  });

  it('should multiply a 1x1 matrix', () => {
    const A = matNFromArray(1, [3]);
    const B = matNFromArray(1, [4]);
    const result = matNMultiply(A, B);
    expect(matNGet(result, 0, 0)).toBeCloseTo(12);
  });

  it('should multiply identity matrix by a vector and return the vector', () => {
    const I = matNIdentity(3);
    const v = new Float64Array([1, 2, 3]);
    const result = matNMultiplyVec(I, v);
    expect(result[0]).toBeCloseTo(1);
    expect(result[1]).toBeCloseTo(2);
    expect(result[2]).toBeCloseTo(3);
  });

  it('should multiply a matrix by a vector', () => {
    // [1 2] * [3] = [1*3+2*4] = [11]
    // [5 6]   [4]   [5*3+6*4]   [39]
    const m = matNFromArray(2, [1, 2, 5, 6]);
    const v = new Float64Array([3, 4]);
    const result = matNMultiplyVec(m, v);
    expect(result[0]).toBeCloseTo(11);
    expect(result[1]).toBeCloseTo(39);
  });

  it('should transpose a matrix', () => {
    // [1 2 3]T = [1 4]
    // [4 5 6]    [2 5]
    //            [3 6]
    const m = matNFromArray(2, [1, 2, 3, 4]);
    const t = matNTranspose(m);
    expect(matNGet(t, 0, 0)).toBe(1);
    expect(matNGet(t, 0, 1)).toBe(3);
    expect(matNGet(t, 1, 0)).toBe(2);
    expect(matNGet(t, 1, 1)).toBe(4);
  });

  it('should transpose an identity matrix and get identity', () => {
    const I = matNIdentity(3);
    const t = matNTranspose(I);
    for (let i = 0; i < 3; i++) {
      for (let j = 0; j < 3; j++) {
        expect(matNGet(t, i, j)).toBe(i === j ? 1 : 0);
      }
    }
  });

  it('should scale every element of a matrix', () => {
    const m = matNFromArray(2, [1, 2, 3, 4]);
    const result = matNScale(m, 3);
    expect(matNGet(result, 0, 0)).toBe(3);
    expect(matNGet(result, 0, 1)).toBe(6);
    expect(matNGet(result, 1, 0)).toBe(9);
    expect(matNGet(result, 1, 1)).toBe(12);
  });

  it('should scale a matrix by zero', () => {
    const m = matNFromArray(2, [1, 2, 3, 4]);
    const result = matNScale(m, 0);
    for (let i = 0; i < 4; i++) {
      expect(result.data[i]).toBe(0);
    }
  });

  it('should add two matrices element-wise', () => {
    const A = matNFromArray(2, [1, 2, 3, 4]);
    const B = matNFromArray(2, [10, 20, 30, 40]);
    const result = matNAdd(A, B);
    expect(matNGet(result, 0, 0)).toBe(11);
    expect(matNGet(result, 0, 1)).toBe(22);
    expect(matNGet(result, 1, 0)).toBe(33);
    expect(matNGet(result, 1, 1)).toBe(44);
  });

  it('should add a matrix with a zero matrix to get the original', () => {
    const A = matNFromArray(2, [5, 6, 7, 8]);
    const Z = matN(2);
    const result = matNAdd(A, Z);
    expect(matNGet(result, 0, 0)).toBe(5);
    expect(matNGet(result, 0, 1)).toBe(6);
    expect(matNGet(result, 1, 0)).toBe(7);
    expect(matNGet(result, 1, 1)).toBe(8);
  });

  it('should create a deep copy of a matrix', () => {
    const m = matNFromArray(2, [1, 2, 3, 4]);
    const c = matNCopy(m);
    expect(c.size).toBe(m.size);
    expect(matNGet(c, 0, 0)).toBe(1);
    expect(matNGet(c, 1, 1)).toBe(4);
    // verify deep copy: mutating copy should not affect original
    c.data[0] = 99;
    expect(matNGet(m, 0, 0)).toBe(1);
  });

  it('should create a matrix from a flat array', () => {
    const m = matNFromArray(3, [1, 2, 3, 4, 5, 6, 7, 8, 9]);
    expect(m.size).toBe(3);
    expect(matNGet(m, 0, 0)).toBe(1);
    expect(matNGet(m, 1, 1)).toBe(5);
    expect(matNGet(m, 2, 2)).toBe(9);
  });

  it('should pad with zeros when fromArray receives fewer values', () => {
    const m = matNFromArray(2, [1]);
    expect(matNGet(m, 0, 0)).toBe(1);
    expect(matNGet(m, 0, 1)).toBe(0);
    expect(matNGet(m, 1, 0)).toBe(0);
    expect(matNGet(m, 1, 1)).toBe(0);
  });

  it('should handle fromArray with more values than needed (truncates)', () => {
    const m = matNFromArray(1, [7, 8, 9]);
    expect(m.size).toBe(1);
    expect(matNGet(m, 0, 0)).toBe(7);
    expect(m.data.length).toBe(1);
  });
});
