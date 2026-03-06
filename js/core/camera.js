import * as THREE from 'https://unpkg.com/three@0.160.0/build/three.module.js';

export function createCamera(container) {
  const aspect = container.clientWidth / container.clientHeight;
  const camera = new THREE.PerspectiveCamera(45, aspect, 0.1, 1000);

  camera.position.set(0, 7, 0);
  camera.up.set(0, 0, -1);

  return camera;
}

export function updateCameraFollow(ball, camera) {
  if (!ball) return;

  const height = 7;
  const desiredPos = new THREE.Vector3(
    ball.position.x,
    height,
    ball.position.z
  );

  camera.position.lerp(desiredPos, 0.15);

  const lookTarget = new THREE.Vector3(
    ball.position.x,
    0,
    ball.position.z
  );

  camera.lookAt(lookTarget);
}
