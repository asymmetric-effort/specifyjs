// (c) 2025-2026 Asymmetric Effort, LLC. MIT LICENSE
// SPDX-License-Identifier: MIT

/** NxN matrix stored as a flat row-major Float64Array. */
export interface MatN {
  readonly data: Float64Array;
  readonly size: number;
}

/**
 * Create a zero-initialized NxN matrix.
 * @param size - The number of rows (and columns).
 */
export function matN(size: number): MatN {
  return { data: new Float64Array(size * size), size };
}

/**
 * Create an NxN identity matrix.
 * @param size - The number of rows (and columns).
 */
export function matNIdentity(size: number): MatN {
  const data = new Float64Array(size * size);
  for (let i = 0; i < size; i++) {
    data[i * size + i] = 1;
  }
  return { data, size };
}

/**
 * Get the value at (row, col) in a MatN.
 * @param m - The matrix.
 * @param row - Row index (zero-based).
 * @param col - Column index (zero-based).
 */
export function matNGet(m: MatN, row: number, col: number): number {
  return m.data[row * m.size + col] ?? 0;
}

/**
 * Return a new MatN with the value at (row, col) set to val.
 * @param m - The source matrix.
 * @param row - Row index (zero-based).
 * @param col - Column index (zero-based).
 * @param val - The value to set.
 */
export function matNSet(m: MatN, row: number, col: number, val: number): MatN {
  const data = new Float64Array(m.data);
  data[row * m.size + col] = val;
  return { data, size: m.size };
}

/**
 * Multiply two NxN matrices. Both must have the same size.
 * @param a - Left matrix.
 * @param b - Right matrix.
 */
export function matNMultiply(a: MatN, b: MatN): MatN {
  const n = a.size;
  const out = new Float64Array(n * n);
  for (let i = 0; i < n; i++) {
    for (let k = 0; k < n; k++) {
      const aik = a.data[i * n + k]!;
      for (let j = 0; j < n; j++) {
        out[i * n + j]! += aik * b.data[k * n + j]!;
      }
    }
  }
  return { data: out, size: n };
}

/**
 * Multiply an NxN matrix by an N-length column vector.
 * @param m - The matrix.
 * @param v - The vector as a Float64Array of length N.
 * @returns A new Float64Array of length N.
 */
export function matNMultiplyVec(m: MatN, v: Float64Array): Float64Array {
  const n = m.size;
  const out = new Float64Array(n);
  for (let i = 0; i < n; i++) {
    let sum = 0;
    for (let j = 0; j < n; j++) {
      sum += m.data[i * n + j]! * v[j]!;
    }
    out[i] = sum;
  }
  return out;
}

/**
 * Transpose an NxN matrix.
 * @param m - The matrix to transpose.
 */
export function matNTranspose(m: MatN): MatN {
  const n = m.size;
  const out = new Float64Array(n * n);
  for (let i = 0; i < n; i++) {
    for (let j = 0; j < n; j++) {
      out[j * n + i] = m.data[i * n + j]!;
    }
  }
  return { data: out, size: n };
}

/**
 * Scale every element of a matrix by a scalar.
 * @param m - The matrix.
 * @param s - The scalar.
 */
export function matNScale(m: MatN, s: number): MatN {
  const data = new Float64Array(m.data.length);
  for (let i = 0; i < data.length; i++) {
    data[i] = m.data[i]! * s;
  }
  return { data, size: m.size };
}

/**
 * Add two NxN matrices element-wise. Both must have the same size.
 * @param a - First matrix.
 * @param b - Second matrix.
 */
export function matNAdd(a: MatN, b: MatN): MatN {
  const data = new Float64Array(a.data.length);
  for (let i = 0; i < data.length; i++) {
    data[i] = a.data[i]! + b.data[i]!;
  }
  return { data, size: a.size };
}

/**
 * Create a deep copy of a MatN.
 * @param m - The matrix to copy.
 */
export function matNCopy(m: MatN): MatN {
  return { data: new Float64Array(m.data), size: m.size };
}

/**
 * Create an NxN matrix from a flat array of numbers (row-major order).
 * @param size - The number of rows (and columns).
 * @param values - Flat array of size*size numbers.
 */
export function matNFromArray(size: number, values: number[]): MatN {
  const data = new Float64Array(size * size);
  const len = Math.min(values.length, size * size);
  for (let i = 0; i < len; i++) {
    data[i] = values[i]!;
  }
  return { data, size };
}
