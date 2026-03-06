import * as THREE from 'https://unpkg.com/three@0.160.0/build/three.module.js';

const COLOR_4000K = 0xFFE6CC;

export function setupLighting(scene) {
  const ambient = new THREE.AmbientLight(COLOR_4000K, 0.12);
  scene.add(ambient);

  const spot = new THREE.SpotLight(COLOR_4000K, 2.2, 25, Math.PI / 6, 0.4, 1);
  spot.castShadow = true;
  spot.position.set(0, 10, 0);
  scene.add(spot);
  scene.add(spot.target);

  const rim = new THREE.DirectionalLight(COLOR_4000K, 0.35);
  rim.position.set(1, 1, 1);
  scene.add(rim);

  return { spot };
}
