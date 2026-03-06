import * as THREE from 'https://unpkg.com/three@0.160.0/build/three.module.js';

export function updatePhysics(
  ball,
  velocity,
  field,
  mazeSize,
  cellSize,
  halfSize,
  ballRadius = 0.25
) {
  if (!ball) return;

  // Move ball
  ball.position.x += velocity.x;
  ball.position.z += velocity.y;

  // Resolve collisions
  resolveCollisions(ball, velocity, field, mazeSize, cellSize, halfSize, ballRadius);
}

function resolveCollisions(ball, velocity, field, mazeSize, cellSize, halfSize, ballRadius) {
  const bx = ball.position.x;
  const bz = ball.position.z;

  const gx = Math.floor((bx + halfSize) / cellSize);
  const gz = Math.floor((bz + halfSize) / cellSize);

  for (let ix = gx - 1; ix <= gx + 1; ix++) {
    for (let iz = gz - 1; iz <= gz + 1; iz++) {
      if (!isWall(ix, iz, field, mazeSize)) continue;

      const wx = ix * cellSize - halfSize + cellSize / 2;
      const wz = iz * cellSize - halfSize + cellSize / 2;
      const hw = cellSize / 2;

      const closestX = clamp(bx, wx - hw, wx + hw);
      const closestZ = clamp(bz, wz - hw, wz + hw);

      const dx = bx - closestX;
      const dz = bz - closestZ;
      const distSq = dx * dx + dz * dz;

      if (distSq < ballRadius * ballRadius) {
        const dist = Math.sqrt(distSq) || 0.0001;
        const overlap = ballRadius - dist;

        const nx = dx / dist;
        const nz = dz / dist;

        // Push ball out
        ball.position.x += nx * overlap;
        ball.position.z += nz * overlap;

        // Velocity INTO the wall
        const inward = velocity.x * nx + velocity.y * nz;

        if (inward > 0) {
          // Remove inward component → NO JITTER
          velocity.x -= inward * nx;
          velocity.y -= inward * nz;
        }

        // Bounce only if impact is strong
        const bounceThreshold = 0.06;
        const restitution = 0.35;

        if (inward > bounceThreshold) {
          velocity.x += inward * restitution * nx;
          velocity.y += inward * restitution * nz;
        }
      }
    }
  }
}

function isWall(ix, iz, field, mazeSize) {
  if (ix < 0 || iz < 0 || ix >= mazeSize || iz >= mazeSize) return false;
  return field[ix][iz] === true;
}

function clamp(v, min, max) {
  return v < min ? min : v > max ? max : v;
}
