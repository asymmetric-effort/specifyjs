# Math

A zero-dependency math library providing vector, matrix, quaternion, and linear algebra operations for 2D and 3D applications.

## Import

```ts
import {
  // Vec2
  vec2, vec2Add, vec2Sub, vec2Scale, vec2Dot, vec2Length, vec2Normalize, vec2Dist, vec2Lerp,
  // Vec3
  vec3, vec3Add, vec3Sub, vec3Scale, vec3Dot, vec3Cross, vec3Length, vec3Normalize,
  // MatN (NxN)
  matN, matNIdentity, matNGet, matNSet, matNMultiply, matNMultiplyVec,
  matNTranspose, matNScale, matNAdd, matNCopy, matNFromArray,
  // Mat4 (4x4, column-major)
  mat4Identity, mat4Multiply, mat4Transpose, mat4Inverse,
  mat4Translate, mat4Scale, mat4RotateX, mat4RotateY, mat4RotateZ,
  mat4Perspective, mat4Orthographic, mat4LookAt, mat4FromQuaternion,
  mat4TransformVec3, mat4TransformDirection,
  // Quaternion
  quatIdentity, quatFromAxisAngle, quatFromEuler, quatMultiply,
  quatConjugate, quatInverse, quatNormalize, quatLength, quatDot,
  quatSlerp, quatRotateVec3, quatToEuler, quatLookAt,
  // Solver
  solve, luDecompose, luSolve, determinant, inverse,
} from '@aspect/math';
```

## Modules

### Vec2 / Vec3 -- Vector Operations

2D and 3D vector types with standard linear algebra operations.

**Types:**

| Type | Fields | Description |
|------|--------|-------------|
| `Vec2` | `{ x: number; y: number }` | 2D vector (readonly) |
| `Vec3` | `{ x: number; y: number; z: number }` | 3D vector (readonly) |

**Vec2 functions:**

| Function | Signature | Description |
|----------|-----------|-------------|
| `vec2` | `(x, y) => Vec2` | Create a Vec2 |
| `vec2Add` | `(a, b) => Vec2` | Add two Vec2s |
| `vec2Sub` | `(a, b) => Vec2` | Subtract b from a |
| `vec2Scale` | `(v, s) => Vec2` | Scale by scalar |
| `vec2Dot` | `(a, b) => number` | Dot product |
| `vec2Length` | `(v) => number` | Magnitude |
| `vec2Normalize` | `(v) => Vec2` | Normalize to unit length |
| `vec2Dist` | `(a, b) => number` | Euclidean distance |
| `vec2Lerp` | `(a, b, t) => Vec2` | Linear interpolation |

**Vec3 functions:**

| Function | Signature | Description |
|----------|-----------|-------------|
| `vec3` | `(x, y, z) => Vec3` | Create a Vec3 |
| `vec3Add` | `(a, b) => Vec3` | Add two Vec3s |
| `vec3Sub` | `(a, b) => Vec3` | Subtract b from a |
| `vec3Scale` | `(v, s) => Vec3` | Scale by scalar |
| `vec3Dot` | `(a, b) => number` | Dot product |
| `vec3Cross` | `(a, b) => Vec3` | Cross product |
| `vec3Length` | `(v) => number` | Magnitude |
| `vec3Normalize` | `(v) => Vec3` | Normalize to unit length |

### MatN -- NxN Matrix Operations

General-purpose NxN matrices stored as flat row-major `Float64Array`.

**Type:** `MatN = { data: Float64Array; size: number }`

| Function | Description |
|----------|-------------|
| `matN(size)` | Create a zero-initialized NxN matrix |
| `matNIdentity(size)` | Create an identity matrix |
| `matNGet(m, row, col)` | Get value at position |
| `matNSet(m, row, col, val)` | Return new matrix with value set |
| `matNMultiply(a, b)` | Multiply two NxN matrices |
| `matNMultiplyVec(m, v)` | Multiply matrix by column vector |
| `matNTranspose(m)` | Transpose a matrix |
| `matNScale(m, s)` | Scale all elements by scalar |
| `matNAdd(a, b)` | Element-wise addition |
| `matNCopy(m)` | Deep copy |
| `matNFromArray(size, values)` | Create from flat row-major array |

### Mat4 -- 4x4 Matrix Operations

Specialized 4x4 matrices in column-major order (OpenGL convention), stored as `Float64Array` of 16 elements.

**Type:** `Mat4 = Float64Array`

| Function | Description |
|----------|-------------|
| `mat4Identity()` | Create a 4x4 identity matrix |
| `mat4Multiply(a, b)` | Multiply two 4x4 matrices |
| `mat4Transpose(m)` | Transpose |
| `mat4Inverse(m)` | Inverse (returns null if singular) |
| `mat4Translate(m, v)` | Apply translation |
| `mat4Scale(m, v)` | Apply scale |
| `mat4RotateX(m, radians)` | Rotate around X axis |
| `mat4RotateY(m, radians)` | Rotate around Y axis |
| `mat4RotateZ(m, radians)` | Rotate around Z axis |
| `mat4Perspective(fovY, aspect, near, far)` | Perspective projection |
| `mat4Orthographic(left, right, bottom, top, near, far)` | Orthographic projection |
| `mat4LookAt(eye, target, up)` | View matrix |
| `mat4FromQuaternion(q)` | Rotation matrix from quaternion |
| `mat4TransformVec3(m, v)` | Transform a point (w=1, with perspective division) |
| `mat4TransformDirection(m, v)` | Transform a direction (w=0, no translation) |

### Quaternion

Quaternion operations for rotation representation.

**Type:** `Quaternion = { x: number; y: number; z: number; w: number }`

| Function | Description |
|----------|-------------|
| `quatIdentity()` | Identity quaternion (no rotation) |
| `quatFromAxisAngle(axis, radians)` | Create from axis and angle |
| `quatFromEuler(pitch, yaw, roll)` | Create from Euler angles (intrinsic ZYX) |
| `quatMultiply(a, b)` | Hamilton product (compose rotations) |
| `quatConjugate(q)` | Conjugate |
| `quatInverse(q)` | Inverse |
| `quatNormalize(q)` | Normalize to unit length |
| `quatLength(q)` | Magnitude |
| `quatDot(a, b)` | Dot product |
| `quatSlerp(a, b, t)` | Spherical linear interpolation |
| `quatRotateVec3(q, v)` | Rotate a Vec3 by a quaternion |
| `quatToEuler(q)` | Convert to Euler angles (returns Vec3: x=roll, y=pitch, z=yaw) |
| `quatLookAt(forward, up)` | Create a look-at rotation quaternion |

### Solver -- Linear Algebra

LU decomposition and linear system solving for NxN matrices.

| Function | Description |
|----------|-------------|
| `solve(A, b)` | Solve Ax=b via Gaussian elimination with partial pivoting. Returns null if singular |
| `luDecompose(A)` | LU decomposition with partial pivoting (PA=LU). Returns `{ L, U, P }` or null |
| `luSolve(L, U, P, b)` | Solve using pre-computed LU decomposition |
| `determinant(A)` | Compute determinant via LU decomposition |
| `inverse(A)` | Compute matrix inverse. Returns null if singular |

## Usage

```ts
import { vec3, vec3Add, vec3Cross, mat4Perspective, mat4LookAt, mat4Multiply } from '@aspect/math';

// Vector operations
const a = vec3(1, 2, 3);
const b = vec3(4, 5, 6);
const sum = vec3Add(a, b);       // { x: 5, y: 7, z: 9 }
const cross = vec3Cross(a, b);   // perpendicular vector

// Build a view-projection matrix
const proj = mat4Perspective(Math.PI / 4, 16 / 9, 0.1, 100);
const view = mat4LookAt(vec3(0, 5, 10), vec3(0, 0, 0), vec3(0, 1, 0));
const vp = mat4Multiply(proj, view);

// Solve a linear system
import { solve, matNFromArray } from '@aspect/math';
const A = matNFromArray(2, [2, 1, 5, 3]);
const b = new Float64Array([4, 7]);
const x = solve(A, b); // solution vector
```
