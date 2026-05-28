// (c) 2025-2026 Asymmetric Effort, LLC. MIT LICENSE
// SPDX-License-Identifier: MIT

/**
 * force-sim.ts -- Pure math 3D force simulation engine.
 *
 * No rendering, no DOM, no 3dSpace dependencies.
 * Suitable for testing in isolation.
 */

import type { Vec3 } from '../../../math/src/vec';

/** A simulation node. */
export interface SimNode {
  id: string;
  position: Vec3;
  velocity: Vec3;
  mass: number;
  fixed: boolean;
  /** Radius for sphere-sphere collision detection. Default: 1. */
  collisionRadius?: number;
}

/** A simulation edge. */
export interface SimEdge {
  source: string;
  target: string;
  restLength: number;
  stiffness: number;
}

/** Simulation configuration. */
export interface SimConfig {
  repulsionStrength: number;
  attractionStrength: number;
  damping: number;
  centerGravity: number;
  timeStep: number;
  bounds: { min: Vec3; max: Vec3 };
  /** Enable sphere-sphere collision detection and response. Default: false. */
  collisionEnabled?: boolean;
  /** Coefficient of restitution (bounciness) 0-1. 1 = perfectly elastic. Default: 0.8. */
  restitution?: number;
}

/** Minimum mass to avoid division by zero. */
const MIN_MASS = 0.001;

/** Epsilon to avoid singularity when nodes overlap. */
const EPSILON = 0.001;

/** Maximum velocity component per axis. */
const MAX_VELOCITY = 50;

/**
 * Run one step of the 3D force simulation.
 * Mutates node positions and velocities in place.
 *
 * Forces applied:
 * 1. Repulsion: Coulomb-like between all pairs  F = repulsion * m1 * m2 / dist^2
 * 2. Attraction: Hooke spring along edges  F = stiffness * (dist - restLength)
 * 3. Center gravity: pull toward origin  F = centerGravity * mass * (-position)
 * 4. Damping: velocity *= damping
 * 5. Semi-implicit Euler integration
 * 6. Boundary clamping
 */
export function stepSimulation(
  nodes: Map<string, SimNode>,
  edges: SimEdge[],
  config: SimConfig,
): void {
  const dt = config.timeStep;

  // Collect node entries for pairwise iteration
  const entries = Array.from(nodes.values());
  const count = entries.length;
  if (count === 0) return;

  // Force accumulators (indexed same as entries)
  const fx = new Float64Array(count);
  const fy = new Float64Array(count);
  const fz = new Float64Array(count);

  // 1. Repulsion: O(n^2) pairwise
  for (let i = 0; i < count; i++) {
    const ni = entries[i]!;
    const mi = Math.max(ni.mass, MIN_MASS);
    for (let j = i + 1; j < count; j++) {
      const nj = entries[j]!;
      const mj = Math.max(nj.mass, MIN_MASS);

      let dx = ni.position.x - nj.position.x;
      let dy = ni.position.y - nj.position.y;
      let dz = ni.position.z - nj.position.z;

      let distSq = dx * dx + dy * dy + dz * dz;
      if (distSq < EPSILON * EPSILON) {
        // Nodes at same position: use epsilon offset to avoid singularity
        dx = EPSILON;
        dy = 0;
        dz = 0;
        distSq = EPSILON * EPSILON;
      }
      const dist = Math.sqrt(distSq);

      // F = repulsion * m1 * m2 / dist^2, along direction vector
      const force = config.repulsionStrength * mi * mj / distSq;
      const forceX = (dx / dist) * force;
      const forceY = (dy / dist) * force;
      const forceZ = (dz / dist) * force;

      fx[i]! += forceX;
      fy[i]! += forceY;
      fz[i]! += forceZ;
      fx[j]! -= forceX;
      fy[j]! -= forceY;
      fz[j]! -= forceZ;
    }
  }

  // 2. Attraction: spring forces along edges
  for (const edge of edges) {
    // Skip self-loops
    if (edge.source === edge.target) continue;

    const ns = nodes.get(edge.source);
    const nt = nodes.get(edge.target);
    if (!ns || !nt) continue;

    // Find indices
    const si = entries.indexOf(ns);
    const ti = entries.indexOf(nt);
    if (si === -1 || ti === -1) continue;

    const dx = nt.position.x - ns.position.x;
    const dy = nt.position.y - ns.position.y;
    const dz = nt.position.z - ns.position.z;
    const dist = Math.sqrt(dx * dx + dy * dy + dz * dz);

    if (dist < EPSILON) continue;

    const displacement = dist - edge.restLength;
    const force = config.attractionStrength * edge.stiffness * displacement;
    const forceX = (dx / dist) * force;
    const forceY = (dy / dist) * force;
    const forceZ = (dz / dist) * force;

    fx[si]! += forceX;
    fy[si]! += forceY;
    fz[si]! += forceZ;
    fx[ti]! -= forceX;
    fy[ti]! -= forceY;
    fz[ti]! -= forceZ;
  }

  // 3. Center gravity: F = centerGravity * mass * (-position)
  for (let i = 0; i < count; i++) {
    const n = entries[i]!;
    const m = Math.max(n.mass, MIN_MASS);
    fx[i]! -= config.centerGravity * m * n.position.x;
    fy[i]! -= config.centerGravity * m * n.position.y;
    fz[i]! -= config.centerGravity * m * n.position.z;
  }

  // 4 + 5. Damping + Semi-implicit Euler integration + boundary clamping
  const { min, max } = config.bounds;
  for (let i = 0; i < count; i++) {
    const n = entries[i]!;
    if (n.fixed) continue;

    const m = Math.max(n.mass, MIN_MASS);

    // Semi-implicit Euler: update velocity first, then position
    let vx = (n.velocity.x + (fx[i]! / m) * dt) * config.damping;
    let vy = (n.velocity.y + (fy[i]! / m) * dt) * config.damping;
    let vz = (n.velocity.z + (fz[i]! / m) * dt) * config.damping;

    // Clamp velocity
    vx = Math.max(-MAX_VELOCITY, Math.min(MAX_VELOCITY, vx));
    vy = Math.max(-MAX_VELOCITY, Math.min(MAX_VELOCITY, vy));
    vz = Math.max(-MAX_VELOCITY, Math.min(MAX_VELOCITY, vz));

    let px = n.position.x + vx * dt;
    let py = n.position.y + vy * dt;
    let pz = n.position.z + vz * dt;

    // 6. Boundary clamping
    px = Math.max(min.x, Math.min(max.x, px));
    py = Math.max(min.y, Math.min(max.y, py));
    pz = Math.max(min.z, Math.min(max.z, pz));

    // Mutate in place
    (n.velocity as { x: number; y: number; z: number }).x = vx;
    (n.velocity as { x: number; y: number; z: number }).y = vy;
    (n.velocity as { x: number; y: number; z: number }).z = vz;
    (n.position as { x: number; y: number; z: number }).x = px;
    (n.position as { x: number; y: number; z: number }).y = py;
    (n.position as { x: number; y: number; z: number }).z = pz;
  }

  // 7. Sphere-sphere collision detection and response
  if (config.collisionEnabled) {
    const restitution = config.restitution ?? 0.8;

    for (let i = 0; i < count; i++) {
      const ni = entries[i]!;
      const ri = ni.collisionRadius ?? 1;

      for (let j = i + 1; j < count; j++) {
        const nj = entries[j]!;
        const rj = nj.collisionRadius ?? 1;
        const minDist = ri + rj;

        let dx = nj.position.x - ni.position.x;
        let dy = nj.position.y - ni.position.y;
        let dz = nj.position.z - ni.position.z;
        let distSq = dx * dx + dy * dy + dz * dz;

        if (distSq >= minDist * minDist) continue; // no overlap

        let dist = Math.sqrt(distSq);
        if (dist < EPSILON) {
          // Coincident: push apart along x
          dx = EPSILON;
          dy = 0;
          dz = 0;
          dist = EPSILON;
        }

        // Collision normal (from i to j)
        const nx = dx / dist;
        const ny = dy / dist;
        const nz = dz / dist;

        // Separate overlapping nodes to surface contact
        const overlap = minDist - dist;
        const mi = Math.max(ni.mass, MIN_MASS);
        const mj = Math.max(nj.mass, MIN_MASS);
        const totalMass = mi + mj;

        if (!ni.fixed && !nj.fixed) {
          const pushI = overlap * (mj / totalMass);
          const pushJ = overlap * (mi / totalMass);
          (ni.position as { x: number; y: number; z: number }).x -= nx * pushI;
          (ni.position as { x: number; y: number; z: number }).y -= ny * pushI;
          (ni.position as { x: number; y: number; z: number }).z -= nz * pushI;
          (nj.position as { x: number; y: number; z: number }).x += nx * pushJ;
          (nj.position as { x: number; y: number; z: number }).y += ny * pushJ;
          (nj.position as { x: number; y: number; z: number }).z += nz * pushJ;
        } else if (!ni.fixed) {
          (ni.position as { x: number; y: number; z: number }).x -= nx * overlap;
          (ni.position as { x: number; y: number; z: number }).y -= ny * overlap;
          (ni.position as { x: number; y: number; z: number }).z -= nz * overlap;
        } else if (!nj.fixed) {
          (nj.position as { x: number; y: number; z: number }).x += nx * overlap;
          (nj.position as { x: number; y: number; z: number }).y += ny * overlap;
          (nj.position as { x: number; y: number; z: number }).z += nz * overlap;
        }

        // Elastic collision velocity response
        // Relative velocity along collision normal
        const dvx = ni.velocity.x - nj.velocity.x;
        const dvy = ni.velocity.y - nj.velocity.y;
        const dvz = ni.velocity.z - nj.velocity.z;
        const relVelNormal = dvx * nx + dvy * ny + dvz * nz;

        if (relVelNormal <= 0) continue; // already separating

        // Impulse scalar (1D collision along normal)
        // relVelNormal > 0 means approaching; impulse pushes them apart
        const invMassSum = (ni.fixed ? 0 : 1 / mi) + (nj.fixed ? 0 : 1 / mj);
        if (invMassSum === 0) continue; // both fixed
        const impulse = (1 + restitution) * relVelNormal / invMassSum;

        if (!ni.fixed) {
          (ni.velocity as { x: number; y: number; z: number }).x -= (impulse / mi) * nx;
          (ni.velocity as { x: number; y: number; z: number }).y -= (impulse / mi) * ny;
          (ni.velocity as { x: number; y: number; z: number }).z -= (impulse / mi) * nz;
        }
        if (!nj.fixed) {
          (nj.velocity as { x: number; y: number; z: number }).x += (impulse / mj) * nx;
          (nj.velocity as { x: number; y: number; z: number }).y += (impulse / mj) * ny;
          (nj.velocity as { x: number; y: number; z: number }).z += (impulse / mj) * nz;
        }
      }
    }
  }
}

/** Compute the total kinetic energy of the simulation. */
export function computeKineticEnergy(nodes: Map<string, SimNode>): number {
  let energy = 0;
  for (const n of nodes.values()) {
    const m = Math.max(n.mass, MIN_MASS);
    const vSq = n.velocity.x * n.velocity.x
      + n.velocity.y * n.velocity.y
      + n.velocity.z * n.velocity.z;
    energy += 0.5 * m * vSq;
  }
  return energy;
}
