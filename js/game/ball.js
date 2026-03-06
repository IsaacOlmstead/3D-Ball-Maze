import * as THREE from 'https://unpkg.com/three@0.160.0/build/three.module.js';

export function createBall(halfSize) {
  const loader = new THREE.TextureLoader();
  const ballTex = loader.load('assets/ball.png');
  const ballMat = new THREE.MeshPhongMaterial({ map: ballTex });

  const ballRadius = 0.25;
  const ballGeo = new THREE.SphereGeometry(ballRadius, 32, 32);
  const ball = new THREE.Mesh(ballGeo, ballMat);

  ball.position.set(-halfSize + 1.5, ballRadius, -halfSize + 1.5);
  return { ball, ballRadius };
}
