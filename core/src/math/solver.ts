// (c) 2025-2026 Asymmetric Effort, LLC. MIT LICENSE
// SPDX-License-Identifier: MIT

import type { MatN } from './mat';
import { matN, matNCopy, matNIdentity } from './mat';

/** Tolerance for treating a pivot as zero (singular detection). */
const EPSILON = 1e-12;

/**
 * Solve Ax = b for x using Gaussian elimination with partial pivoting.
 * @param A - NxN coefficient matrix.
 * @param b - N-length right-hand side vector.
 * @returns x - N-length solution vector, or null if A is singular.
 */
export function solve(A: MatN, b: Float64Array): Float64Array | null {
  const decomp = luDecompose(A);
  if (decomp === null) return null;
  return luSolve(decomp.L, decomp.U, decomp.P, b);
}

/**
 * LU decomposition with partial pivoting: PA = LU.
 *
 * Uses an iterative Doolittle algorithm (no recursion).
 *
 * @param A - NxN matrix to decompose.
 * @returns Object containing L, U, and permutation vector P, or null if singular.
 */
export function luDecompose(A: MatN): { L: MatN; U: MatN; P: number[] } | null {
  const n = A.size;
  if (n === 0) return null;

  // Work on a mutable copy
  const u = matNCopy(A);
  const ud = u.data;
  const l = matN(n);
  const ld = l.data;

  // Initialize permutation as identity
  const P: number[] = [];
  for (let i = 0; i < n; i++) {
    P.push(i);
  }

  for (let k = 0; k < n; k++) {
    // Partial pivoting: find the row with the largest absolute value in column k
    let maxVal = Math.abs(ud[k * n + k]!);
    let maxRow = k;
    for (let i = k + 1; i < n; i++) {
      const val = Math.abs(ud[i * n + k]!);
      if (val > maxVal) {
        maxVal = val;
        maxRow = i;
      }
    }

    if (maxVal < EPSILON) return null; // Singular

    // Swap rows in U, L, and permutation
    if (maxRow !== k) {
      // Swap permutation
      const tmp = P[k]!;
      P[k] = P[maxRow]!;
      P[maxRow] = tmp;

      // Swap rows in U
      for (let j = 0; j < n; j++) {
        const ti = ud[k * n + j]!;
        ud[k * n + j] = ud[maxRow * n + j]!;
        ud[maxRow * n + j] = ti;
      }

      // Swap rows in L (only columns 0..k-1 matter)
      for (let j = 0; j < k; j++) {
        const ti = ld[k * n + j]!;
        ld[k * n + j] = ld[maxRow * n + j]!;
        ld[maxRow * n + j] = ti;
      }
    }

    // Eliminate below pivot
    for (let i = k + 1; i < n; i++) {
      const factor = ud[i * n + k]! / ud[k * n + k]!;
      ld[i * n + k] = factor;
      for (let j = k; j < n; j++) {
        ud[i * n + j] = ud[i * n + j]! - factor * ud[k * n + j]!;
      }
    }
  }

  // Set L diagonal to 1
  for (let i = 0; i < n; i++) {
    ld[i * n + i] = 1;
  }

  return { L: { data: ld, size: n }, U: { data: ud, size: n }, P };
}

/**
 * Solve a linear system using a pre-computed LU decomposition.
 *
 * Given PA = LU, solves Ax = b by:
 *   1. Permute b according to P: Pb
 *   2. Forward substitution: Ly = Pb
 *   3. Back substitution: Ux = y
 *
 * @param L - Lower triangular matrix with unit diagonal.
 * @param U - Upper triangular matrix.
 * @param P - Permutation vector from LU decomposition.
 * @param b - N-length right-hand side vector.
 * @returns x - N-length solution vector.
 */
export function luSolve(L: MatN, U: MatN, P: number[], b: Float64Array): Float64Array {
  const n = L.size;
  const ld = L.data;
  const ud = U.data;

  // Apply permutation
  const pb = new Float64Array(n);
  for (let i = 0; i < n; i++) {
    pb[i] = b[P[i]!]!;
  }

  // Forward substitution: Ly = Pb
  const y = new Float64Array(n);
  for (let i = 0; i < n; i++) {
    let sum = pb[i]!;
    for (let j = 0; j < i; j++) {
      sum -= ld[i * n + j]! * y[j]!;
    }
    y[i] = sum; // L diagonal is 1
  }

  // Back substitution: Ux = y
  const x = new Float64Array(n);
  for (let i = n - 1; i >= 0; i--) {
    let sum = y[i]!;
    for (let j = i + 1; j < n; j++) {
      sum -= ud[i * n + j]! * x[j]!;
    }
    x[i] = sum / ud[i * n + i]!;
  }

  return x;
}

/**
 * Compute the determinant of an NxN matrix via LU decomposition.
 *
 * The determinant of PA = LU is:
 *   det(A) = (-1)^swaps * product of U diagonal
 *
 * @param A - NxN matrix.
 * @returns The determinant value. Returns 0 for singular matrices.
 */
export function determinant(A: MatN): number {
  const n = A.size;
  if (n === 0) return 1; // Empty matrix convention

  const decomp = luDecompose(A);
  if (decomp === null) return 0;

  const ud = decomp.U.data;
  let det = 1;
  for (let i = 0; i < n; i++) {
    det *= ud[i * n + i]!;
  }

  // Count permutation swaps to determine sign
  let swaps = 0;
  const visited = new Uint8Array(n);
  for (let i = 0; i < n; i++) {
    if (visited[i] !== 0) continue;
    let cycleLen = 0;
    let j = i;
    // Iteratively trace the cycle
    while (visited[j] === 0) {
      visited[j] = 1;
      j = decomp.P[j]!;
      cycleLen++;
    }
    if (cycleLen > 1) {
      swaps += cycleLen - 1;
    }
  }

  return swaps % 2 === 0 ? det : -det;
}

/**
 * Compute the inverse of an NxN matrix via LU decomposition.
 *
 * Solves A * X_col = e_col for each column of the identity matrix.
 *
 * @param A - NxN matrix to invert.
 * @returns The inverse matrix, or null if A is singular.
 */
export function inverse(A: MatN): MatN | null {
  const n = A.size;
  if (n === 0) return matNIdentity(0);

  const decomp = luDecompose(A);
  if (decomp === null) return null;

  const result = matN(n);
  const rd = result.data;
  const e = new Float64Array(n);

  // Solve for each column of the identity
  for (let col = 0; col < n; col++) {
    // Build identity column vector
    if (col > 0) e[col - 1] = 0;
    e[col] = 1;

    const x = luSolve(decomp.L, decomp.U, decomp.P, e);

    // Write solution into the result column
    for (let row = 0; row < n; row++) {
      rd[row * n + col] = x[row]!;
    }
  }

  return { data: rd, size: n };
}
