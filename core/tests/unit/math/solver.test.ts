// (c) 2025-2026 Asymmetric Effort, LLC. MIT LICENSE
// SPDX-License-Identifier: MIT

import { describe, it, expect } from 'vitest';
import {
  matNFromArray,
  matNIdentity,
  matNMultiply,
  matNMultiplyVec,
  matNGet,
  matN,
  solve,
  luDecompose,
  luSolve,
  determinant,
  inverse,
} from '../../../src/math/index';

describe('solve', () => {
  it('should solve a simple 2x2 system', () => {
    // 2x + y = 5, x + 3y = 10 => x = 1, y = 3
    const A = matNFromArray(2, [2, 1, 1, 3]);
    const b = new Float64Array([5, 10]);
    const x = solve(A, b);
    expect(x).not.toBeNull();
    expect(x![0]).toBeCloseTo(1);
    expect(x![1]).toBeCloseTo(3);
  });

  it('should solve a 3x3 system', () => {
    // x + y + z = 6, 2y + 5z = -4, 2x + 5y - z = 27
    // => x = 5, y = 3, z = -2
    const A = matNFromArray(3, [1, 1, 1, 0, 2, 5, 2, 5, -1]);
    const b = new Float64Array([6, -4, 27]);
    const x = solve(A, b);
    expect(x).not.toBeNull();
    expect(x![0]).toBeCloseTo(5);
    expect(x![1]).toBeCloseTo(3);
    expect(x![2]).toBeCloseTo(-2);
  });

  it('should return null for a singular matrix', () => {
    const A = matNFromArray(2, [1, 2, 2, 4]);
    const b = new Float64Array([3, 6]);
    expect(solve(A, b)).toBeNull();
  });

  it('should return x = b for identity matrix', () => {
    const I = matNIdentity(3);
    const b = new Float64Array([7, 8, 9]);
    const x = solve(I, b);
    expect(x).not.toBeNull();
    expect(x![0]).toBeCloseTo(7);
    expect(x![1]).toBeCloseTo(8);
    expect(x![2]).toBeCloseTo(9);
  });

  it('should solve a 1x1 system', () => {
    const A = matNFromArray(1, [5]);
    const b = new Float64Array([15]);
    const x = solve(A, b);
    expect(x).not.toBeNull();
    expect(x![0]).toBeCloseTo(3);
  });

  it('should return null for an all-zeros matrix', () => {
    const A = matN(2);
    const b = new Float64Array([1, 2]);
    expect(solve(A, b)).toBeNull();
  });
});

describe('luDecompose', () => {
  it('should decompose a 2x2 matrix such that PA = LU', () => {
    const A = matNFromArray(2, [4, 3, 6, 3]);
    const decomp = luDecompose(A);
    expect(decomp).not.toBeNull();
    const { L, U, P } = decomp!;

    // Verify L * U equals the permuted A
    const LU = matNMultiply(L, U);
    for (let i = 0; i < 2; i++) {
      for (let j = 0; j < 2; j++) {
        // PA[i][j] = A[P[i]][j]
        const paVal = matNGet(A, P[i]!, j);
        expect(matNGet(LU, i, j)).toBeCloseTo(paVal);
      }
    }
  });

  it('should decompose a 3x3 matrix such that PA = LU', () => {
    const A = matNFromArray(3, [2, 1, 1, 4, 3, 3, 8, 7, 9]);
    const decomp = luDecompose(A);
    expect(decomp).not.toBeNull();
    const { L, U, P } = decomp!;

    const LU = matNMultiply(L, U);
    for (let i = 0; i < 3; i++) {
      for (let j = 0; j < 3; j++) {
        const paVal = matNGet(A, P[i]!, j);
        expect(matNGet(LU, i, j)).toBeCloseTo(paVal);
      }
    }
  });

  it('should return null for a singular matrix', () => {
    const A = matNFromArray(2, [1, 2, 2, 4]);
    expect(luDecompose(A)).toBeNull();
  });

  it('should return null for a zero-size matrix', () => {
    const A = matN(0);
    expect(luDecompose(A)).toBeNull();
  });

  it('should produce L with unit diagonal', () => {
    const A = matNFromArray(3, [1, 2, 3, 4, 5, 6, 7, 8, 10]);
    const decomp = luDecompose(A);
    expect(decomp).not.toBeNull();
    for (let i = 0; i < 3; i++) {
      expect(matNGet(decomp!.L, i, i)).toBeCloseTo(1);
    }
  });
});

describe('luSolve', () => {
  it('should solve using pre-decomposed L, U, P', () => {
    const A = matNFromArray(2, [2, 1, 1, 3]);
    const decomp = luDecompose(A)!;
    const b = new Float64Array([5, 10]);
    const x = luSolve(decomp.L, decomp.U, decomp.P, b);
    expect(x[0]).toBeCloseTo(1);
    expect(x[1]).toBeCloseTo(3);
  });

  it('should solve multiple right-hand sides with same decomposition', () => {
    const A = matNFromArray(2, [1, 2, 3, 4]);
    const decomp = luDecompose(A)!;

    const b1 = new Float64Array([5, 11]);
    const x1 = luSolve(decomp.L, decomp.U, decomp.P, b1);
    // Verify A * x1 = b1
    const check1 = matNMultiplyVec(A, x1);
    expect(check1[0]).toBeCloseTo(5);
    expect(check1[1]).toBeCloseTo(11);

    const b2 = new Float64Array([1, 1]);
    const x2 = luSolve(decomp.L, decomp.U, decomp.P, b2);
    const check2 = matNMultiplyVec(A, x2);
    expect(check2[0]).toBeCloseTo(1);
    expect(check2[1]).toBeCloseTo(1);
  });
});

describe('determinant', () => {
  it('should compute determinant of a 2x2 matrix', () => {
    // det([3 8; 4 6]) = 3*6 - 8*4 = -14
    const A = matNFromArray(2, [3, 8, 4, 6]);
    expect(determinant(A)).toBeCloseTo(-14);
  });

  it('should compute determinant of a 3x3 matrix', () => {
    // det([6 1 1; 4 -2 5; 2 8 7]) = 6(-14-40) - 1(28-10) + 1(32+4) = -306
    const A = matNFromArray(3, [6, 1, 1, 4, -2, 5, 2, 8, 7]);
    expect(determinant(A)).toBeCloseTo(-306);
  });

  it('should return 1 for the determinant of an identity matrix', () => {
    expect(determinant(matNIdentity(1))).toBeCloseTo(1);
    expect(determinant(matNIdentity(3))).toBeCloseTo(1);
    expect(determinant(matNIdentity(5))).toBeCloseTo(1);
  });

  it('should return 0 for the determinant of a singular matrix', () => {
    const A = matNFromArray(2, [1, 2, 2, 4]);
    expect(determinant(A)).toBe(0);
  });

  it('should return 0 for an all-zeros matrix', () => {
    expect(determinant(matN(3))).toBe(0);
  });

  it('should compute determinant of a 1x1 matrix', () => {
    const A = matNFromArray(1, [7]);
    expect(determinant(A)).toBeCloseTo(7);
  });

  it('should return 1 for a 0x0 (empty) matrix', () => {
    const A = matN(0);
    expect(determinant(A)).toBe(1);
  });
});

describe('inverse', () => {
  it('should invert a 2x2 matrix and verify A * A^-1 = I', () => {
    const A = matNFromArray(2, [4, 7, 2, 6]);
    const Ainv = inverse(A);
    expect(Ainv).not.toBeNull();

    const product = matNMultiply(A, Ainv!);
    for (let i = 0; i < 2; i++) {
      for (let j = 0; j < 2; j++) {
        expect(matNGet(product, i, j)).toBeCloseTo(i === j ? 1 : 0);
      }
    }
  });

  it('should invert a 3x3 matrix and verify A * A^-1 = I', () => {
    const A = matNFromArray(3, [1, 2, 3, 0, 1, 4, 5, 6, 0]);
    const Ainv = inverse(A);
    expect(Ainv).not.toBeNull();

    const product = matNMultiply(A, Ainv!);
    for (let i = 0; i < 3; i++) {
      for (let j = 0; j < 3; j++) {
        expect(matNGet(product, i, j)).toBeCloseTo(i === j ? 1 : 0);
      }
    }
  });

  it('should return null for a singular matrix', () => {
    const A = matNFromArray(2, [1, 2, 2, 4]);
    expect(inverse(A)).toBeNull();
  });

  it('should return null for an all-zeros matrix', () => {
    expect(inverse(matN(3))).toBeNull();
  });

  it('should return identity when inverting identity', () => {
    const I = matNIdentity(3);
    const Iinv = inverse(I);
    expect(Iinv).not.toBeNull();
    for (let i = 0; i < 3; i++) {
      for (let j = 0; j < 3; j++) {
        expect(matNGet(Iinv!, i, j)).toBeCloseTo(i === j ? 1 : 0);
      }
    }
  });

  it('should invert a 1x1 matrix', () => {
    const A = matNFromArray(1, [4]);
    const Ainv = inverse(A);
    expect(Ainv).not.toBeNull();
    expect(matNGet(Ainv!, 0, 0)).toBeCloseTo(0.25);
  });

  it('should handle inverse of a 0x0 matrix', () => {
    const A = matN(0);
    const Ainv = inverse(A);
    expect(Ainv).not.toBeNull();
    expect(Ainv!.size).toBe(0);
  });
});
