<!-- (c) 2025-2026 Asymmetric Effort, LLC. MIT LICENSE -->
<!-- SPDX-License-Identifier: MIT -->

# Math — Linear Algebra Library

SpecifyJS ships a lightweight, immutable linear algebra library for 2D/3D vector
math, NxN matrix operations, and numerical solvers. All functions are pure
(they return new values and never mutate their inputs), use `Float64Array` for
numeric precision, and contain zero runtime dependencies.

```typescript
import {
  vec2, vec2Add, vec2Sub, vec2Scale, vec2Dot, vec2Length,
  vec2Normalize, vec2Dist, vec2Lerp,
  vec3, vec3Add, vec3Sub, vec3Scale, vec3Dot, vec3Cross,
  vec3Length, vec3Normalize,
  mat4Identity, mat4Multiply, mat4Transpose, mat4Inverse,
  mat4Translate, mat4Scale, mat4RotateX, mat4RotateY, mat4RotateZ,
  mat4Perspective, mat4Orthographic, mat4LookAt,
  mat4FromQuaternion, mat4TransformVec3, mat4TransformDirection,
  quatIdentity, quatFromAxisAngle, quatFromEuler, quatMultiply,
  quatConjugate, quatInverse, quatNormalize, quatLength,
  quatDot, quatSlerp, quatRotateVec3, quatToEuler, quatLookAt,
  matN, matNIdentity, matNFromArray, matNGet, matNSet,
  matNMultiply, matNMultiplyVec, matNTranspose, matNScale,
  matNAdd, matNCopy,
  solve, luDecompose, luSolve, determinant, inverse,
} from '@asymmetric-effort/specifyjs/math';
```

> **Note:** The `math` subpath is an internal module. Depending on your project
> setup you may need to import directly from the source files
> (e.g. `../../components/math/src/vec`).

---

## Vec2 — 2D Vectors

### Type

```typescript
interface Vec2 {
  readonly x: number;
  readonly y: number;
}
```

All `Vec2` instances are plain objects with immutable `x` and `y` fields.

### Creating a Vec2

```typescript
const v = vec2(3, 4); // { x: 3, y: 4 }
```

### Arithmetic

```typescript
const a = vec2(1, 2);
const b = vec2(3, 4);

vec2Add(a, b);        // { x: 4, y: 6 }
vec2Sub(a, b);        // { x: -2, y: -2 }
vec2Scale(a, 3);      // { x: 3, y: 6 }
```

### Dot Product

Returns a scalar representing the alignment of two vectors.

```typescript
vec2Dot(vec2(1, 0), vec2(0, 1)); // 0  (perpendicular)
vec2Dot(vec2(1, 0), vec2(1, 0)); // 1  (parallel)
```

### Length and Normalization

```typescript
vec2Length(vec2(3, 4));        // 5
vec2Normalize(vec2(3, 4));     // { x: 0.6, y: 0.8 }
vec2Normalize(vec2(0, 0));     // { x: 0, y: 0 } — zero-safe
```

### Distance

```typescript
vec2Dist(vec2(0, 0), vec2(3, 4)); // 5
```

### Linear Interpolation

Interpolates between two points. `t = 0` returns `a`, `t = 1` returns `b`.

```typescript
vec2Lerp(vec2(0, 0), vec2(10, 10), 0.5); // { x: 5, y: 5 }
```

---

## Vec3 — 3D Vectors

### Type

```typescript
interface Vec3 {
  readonly x: number;
  readonly y: number;
  readonly z: number;
}
```

### Creating a Vec3

```typescript
const v = vec3(1, 2, 3);
```

### Arithmetic

```typescript
const a = vec3(1, 2, 3);
const b = vec3(4, 5, 6);

vec3Add(a, b);        // { x: 5, y: 7, z: 9 }
vec3Sub(a, b);        // { x: -3, y: -3, z: -3 }
vec3Scale(a, 2);      // { x: 2, y: 4, z: 6 }
```

### Dot Product

```typescript
vec3Dot(vec3(1, 0, 0), vec3(0, 1, 0)); // 0
```

### Cross Product

Returns a vector perpendicular to both inputs (right-hand rule).

```typescript
vec3Cross(vec3(1, 0, 0), vec3(0, 1, 0)); // { x: 0, y: 0, z: 1 }
```

### Length and Normalization

```typescript
vec3Length(vec3(1, 2, 2));        // 3
vec3Normalize(vec3(0, 0, 5));     // { x: 0, y: 0, z: 1 }
vec3Normalize(vec3(0, 0, 0));     // { x: 0, y: 0, z: 0 } — zero-safe
```

---

## Mat4 — 4x4 Matrices

### Type

```typescript
type Mat4 = Float64Array; // 16 elements, column-major order
```

Index layout (column-major, OpenGL convention):

```
[0]  [4]  [8]  [12]
[1]  [5]  [9]  [13]
[2]  [6]  [10] [14]
[3]  [7]  [11] [15]
```

All Mat4 functions return new arrays and never mutate their inputs.

### Creating Matrices

```typescript
const eye = mat4Identity(); // 4x4 identity matrix
```

### Arithmetic

```typescript
mat4Multiply(a, b);    // result = a * b (column-major)
mat4Transpose(m);      // transpose of m
```

### Inverse

Returns `null` if the matrix is singular (determinant smaller than `1e-15`).

```typescript
const inv = mat4Inverse(m); // Mat4 | null
```

### Transforms

Apply transforms to a matrix (result = m * T):

```typescript
mat4Translate(m, { x: 1, y: 2, z: 3 });  // translation
mat4Scale(m, { x: 2, y: 2, z: 2 });      // uniform scale
mat4RotateX(m, Math.PI / 4);              // rotate around X (radians)
mat4RotateY(m, Math.PI / 4);              // rotate around Y
mat4RotateZ(m, Math.PI / 4);              // rotate around Z
```

### Projection Matrices

```typescript
// Perspective: fovY (radians), aspect ratio, near, far
mat4Perspective(Math.PI / 4, 16 / 9, 0.1, 1000);

// Orthographic: left, right, bottom, top, near, far
mat4Orthographic(-10, 10, -10, 10, 0.1, 100);
```

### View Matrix

```typescript
// Camera at eye, looking at target, with world up
mat4LookAt(
  { x: 0, y: 5, z: 10 },  // eye
  { x: 0, y: 0, z: 0 },   // target
  { x: 0, y: 1, z: 0 },   // up
);
```

### Quaternion Conversion

```typescript
mat4FromQuaternion(q); // rotation matrix from a unit quaternion
```

### Vector Transformation

```typescript
// Transform a point (w=1, applies translation, perspective divide)
mat4TransformVec3(m, { x: 1, y: 2, z: 3 });

// Transform a direction (w=0, ignores translation)
mat4TransformDirection(m, { x: 0, y: 1, z: 0 });
```

### Function Reference

| Function | Signature | Description |
|----------|-----------|-------------|
| `mat4Identity` | `() => Mat4` | 4x4 identity matrix |
| `mat4Multiply` | `(a: Mat4, b: Mat4) => Mat4` | Matrix multiplication |
| `mat4Transpose` | `(m: Mat4) => Mat4` | Transpose |
| `mat4Inverse` | `(m: Mat4) => Mat4 \| null` | Inverse (null if singular) |
| `mat4Translate` | `(m: Mat4, v: Vec3) => Mat4` | Apply translation |
| `mat4Scale` | `(m: Mat4, v: Vec3) => Mat4` | Apply scale |
| `mat4RotateX` | `(m: Mat4, radians: number) => Mat4` | Rotate around X axis |
| `mat4RotateY` | `(m: Mat4, radians: number) => Mat4` | Rotate around Y axis |
| `mat4RotateZ` | `(m: Mat4, radians: number) => Mat4` | Rotate around Z axis |
| `mat4Perspective` | `(fovY, aspect, near, far) => Mat4` | Perspective projection |
| `mat4Orthographic` | `(left, right, bottom, top, near, far) => Mat4` | Orthographic projection |
| `mat4LookAt` | `(eye: Vec3, target: Vec3, up: Vec3) => Mat4` | View (look-at) matrix |
| `mat4FromQuaternion` | `(q: Quaternion) => Mat4` | Rotation matrix from quaternion |
| `mat4TransformVec3` | `(m: Mat4, v: Vec3) => Vec3` | Transform point (w=1) |
| `mat4TransformDirection` | `(m: Mat4, v: Vec3) => Vec3` | Transform direction (w=0) |

---

## Quaternion — Rotation Representation

### Type

```typescript
interface Quaternion {
  readonly x: number;
  readonly y: number;
  readonly z: number;
  readonly w: number;  // scalar component
}
```

All quaternion functions return new objects and never mutate their inputs.

### Creating Quaternions

```typescript
const q = quatIdentity();  // { x: 0, y: 0, z: 0, w: 1 } — no rotation

// From axis + angle (axis is auto-normalized)
quatFromAxisAngle({ x: 0, y: 1, z: 0 }, Math.PI / 2);  // 90-degree Y rotation

// From Euler angles (intrinsic ZYX / yaw-pitch-roll, radians)
quatFromEuler(pitch, yaw, roll);

// Look in a direction
quatLookAt(
  { x: 0, y: 0, z: -1 },  // forward direction
  { x: 0, y: 1, z: 0 },   // up vector
);
```

### Arithmetic

```typescript
// Hamilton product: applies rotation b first, then a
quatMultiply(a, b);

quatConjugate(q);   // { -x, -y, -z, w }
quatInverse(q);     // conjugate / |q|^2 (safe for zero-length)
quatNormalize(q);   // unit quaternion
```

### Measurements

```typescript
quatLength(q);     // magnitude (sqrt of sum of squares)
quatDot(a, b);     // dot product
```

### Interpolation

```typescript
// Spherical linear interpolation (t: 0 = a, 1 = b)
quatSlerp(a, b, 0.5);
```

Automatically takes the shorter arc (negates one quaternion if the dot product
is negative). Falls back to normalised lerp when quaternions are very close
(`dot > 0.9995`).

### Transforming Vectors

```typescript
// Rotate a Vec3 by a unit quaternion (optimized q * v * q^-1)
quatRotateVec3(q, { x: 1, y: 0, z: 0 });
```

### Conversion

```typescript
// To Euler angles: returns Vec3 where x=pitch, y=yaw, z=roll
quatToEuler(q);

// To rotation matrix (use Mat4 module)
mat4FromQuaternion(q);
```

### Function Reference

| Function | Signature | Description |
|----------|-----------|-------------|
| `quatIdentity` | `() => Quaternion` | Identity (no rotation) |
| `quatFromAxisAngle` | `(axis: Vec3, radians: number) => Quaternion` | From axis + angle |
| `quatFromEuler` | `(pitch, yaw, roll) => Quaternion` | From Euler angles (ZYX) |
| `quatMultiply` | `(a: Quaternion, b: Quaternion) => Quaternion` | Hamilton product |
| `quatConjugate` | `(q: Quaternion) => Quaternion` | Conjugate |
| `quatInverse` | `(q: Quaternion) => Quaternion` | Inverse |
| `quatNormalize` | `(q: Quaternion) => Quaternion` | Normalize to unit length |
| `quatLength` | `(q: Quaternion) => number` | Magnitude |
| `quatDot` | `(a: Quaternion, b: Quaternion) => number` | Dot product |
| `quatSlerp` | `(a: Quaternion, b: Quaternion, t: number) => Quaternion` | Spherical lerp |
| `quatRotateVec3` | `(q: Quaternion, v: Vec3) => Vec3` | Rotate vector by quaternion |
| `quatToEuler` | `(q: Quaternion) => Vec3` | To Euler angles (x=pitch, y=yaw, z=roll) |
| `quatLookAt` | `(forward: Vec3, up: Vec3) => Quaternion` | Look-rotation from direction |

---

## MatN — NxN Matrices

### Type

```typescript
interface MatN {
  readonly data: Float64Array;  // Row-major flat storage
  readonly size: number;        // Dimension N (rows = cols = N)
}
```

Matrices are stored as flat `Float64Array` in row-major order. Element at
row `i`, column `j` is at index `i * size + j`.

### Creating Matrices

```typescript
// Zero matrix (3x3)
const zero = matN(3);

// Identity matrix (3x3)
const eye = matNIdentity(3);

// From flat array (row-major)
const m = matNFromArray(2, [
  1, 2,
  3, 4,
]);
```

### Element Access

```typescript
const m = matNFromArray(2, [1, 2, 3, 4]);

matNGet(m, 0, 1);              // 2
const m2 = matNSet(m, 0, 1, 9); // Returns a new matrix with m[0][1] = 9
```

`matNSet` returns a **new** matrix; the original is not modified.

### Matrix Multiplication

Both operands must have the same size.

```typescript
const a = matNFromArray(2, [1, 2, 3, 4]);
const b = matNIdentity(2);
const c = matNMultiply(a, b); // c equals a
```

### Matrix-Vector Multiplication

Multiplies an NxN matrix by an N-length column vector.

```typescript
const m = matNFromArray(2, [1, 0, 0, 2]);
const v = new Float64Array([3, 4]);
const result = matNMultiplyVec(m, v); // Float64Array [3, 8]
```

### Transpose

```typescript
const m = matNFromArray(2, [1, 2, 3, 4]);
const mt = matNTranspose(m);
// mt = [1, 3, 2, 4]
```

### Scalar Operations

```typescript
const m = matNFromArray(2, [1, 2, 3, 4]);
matNScale(m, 2);  // [2, 4, 6, 8]
```

### Addition

Both operands must have the same size.

```typescript
const a = matNFromArray(2, [1, 2, 3, 4]);
const b = matNFromArray(2, [5, 6, 7, 8]);
const c = matNAdd(a, b); // [6, 8, 10, 12]
```

### Copying

```typescript
const copy = matNCopy(m); // Deep copy (new Float64Array)
```

---

## Solver — Gaussian Elimination and LU Decomposition

### solve(A, b) — Solve Ax = b

Solves a system of linear equations using LU decomposition with partial
pivoting.

```typescript
// Solve:  2x + y = 5
//          x + 3y = 7
const A = matNFromArray(2, [2, 1, 1, 3]);
const b = new Float64Array([5, 7]);
const x = solve(A, b);
// x = Float64Array [1.6, 1.8]
```

Returns `null` if the matrix is singular (no unique solution exists).

```typescript
const singular = matNFromArray(2, [1, 2, 2, 4]);
const result = solve(singular, new Float64Array([1, 2]));
// result === null
```

### luDecompose(A) — LU Decomposition

Computes PA = LU where L is lower-triangular with unit diagonal, U is
upper-triangular, and P is a permutation vector.

```typescript
const A = matNFromArray(3, [
  2, 1, 1,
  4, 3, 3,
  8, 7, 9,
]);
const decomp = luDecompose(A);
// decomp.L  — lower triangular (unit diagonal)
// decomp.U  — upper triangular
// decomp.P  — permutation vector [2, 1, 0] etc.
```

Returns `null` if the matrix is singular (a pivot is smaller than `1e-12`).

### luSolve(L, U, P, b) — Solve with Pre-computed LU

Reuses an existing LU decomposition to solve for a different right-hand side
without repeating the factorization.

```typescript
const decomp = luDecompose(A);
if (decomp) {
  const x1 = luSolve(decomp.L, decomp.U, decomp.P, b1);
  const x2 = luSolve(decomp.L, decomp.U, decomp.P, b2);
}
```

### determinant(A) — Matrix Determinant

Computes the determinant via LU decomposition. Returns `0` for singular
matrices.

```typescript
const m = matNFromArray(2, [1, 2, 3, 4]);
determinant(m); // -2

const singular = matNFromArray(2, [1, 2, 2, 4]);
determinant(singular); // 0
```

The sign is computed by counting swaps in the permutation vector.

### inverse(A) — Matrix Inverse

Returns the inverse matrix, or `null` if the matrix is singular.

```typescript
const m = matNFromArray(2, [4, 7, 2, 6]);
const inv = inverse(m);
// inv is the 2x2 inverse matrix

// Verify: m * inv = identity
const product = matNMultiply(m, inv);
// product ~ matNIdentity(2)
```

```typescript
const singular = matNFromArray(2, [1, 2, 2, 4]);
inverse(singular); // null
```

For an empty matrix (`size === 0`), `inverse` returns a zero-size identity
and `determinant` returns `1` by convention.

---

## Error Handling

| Scenario | Behavior |
|---|---|
| Zero-length vector passed to `vec2Normalize` / `vec3Normalize` | Returns a zero vector |
| Singular 4x4 matrix passed to `mat4Inverse` | Returns `null` (determinant < `1e-15`) |
| Zero-length quaternion passed to `quatNormalize` | Returns `{ x: 0, y: 0, z: 0, w: 0 }` |
| Zero-length quaternion passed to `quatInverse` | Returns `{ x: 0, y: 0, z: 0, w: 0 }` |
| `mat4TransformVec3` with `w = 0` | Uses `invW = 1` (no division by zero) |
| Singular matrix passed to `solve` | Returns `null` |
| Singular matrix passed to `luDecompose` | Returns `null` |
| Singular matrix passed to `inverse` | Returns `null` |
| Singular matrix passed to `determinant` | Returns `0` |
| Empty matrix (`size === 0`) | `determinant` returns `1`; `inverse` returns empty identity |

All functions are safe to call with any numeric input. NaN and Infinity propagate
through arithmetic as expected by IEEE 754.
