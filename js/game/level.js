import * as THREE from 'https://unpkg.com/three@0.160.0/build/three.module.js';
import { generateSquareMaze } from './maze.js';
import { createBall } from './ball.js';

export function createLevel(scene, level, levelLabel) {
  const mazeSize = 9 + (level - 1) * 2;
  const cellSize = 1;
  const halfSize = (mazeSize * cellSize) / 2;

  const field = generateSquareMaze(mazeSize);

  const loader = new THREE.TextureLoader();
  const brickTex = loader.load('assets/brick.png');
  const concreteTex = loader.load('assets/concrete.png');

  brickTex.wrapS = brickTex.wrapT = THREE.RepeatWrapping;
  concreteTex.wrapS = concreteTex.wrapT = THREE.RepeatWrapping;

  // 4000K warm color
  const COLOR_4000K = 0xFFE6CC;

  // FLOOR MATERIAL
  const floorMat = new THREE.MeshPhongMaterial({
    map: concreteTex
  });

  // WALL MATERIAL WITH FRESNEL GLOW
  const wallMat = new THREE.MeshPhongMaterial({
    map: brickTex,
    emissive: new THREE.Color(COLOR_4000K),
    emissiveIntensity: 0.15,
    onBeforeCompile: (shader) => {
      shader.uniforms.fresnelColor = { value: new THREE.Color(COLOR_4000K) };
      shader.uniforms.fresnelPower = { value: 2.5 };
      shader.uniforms.fresnelIntensity = { value: 1.2 };

      shader.fragmentShader = shader.fragmentShader.replace(
        `#include <common>`,
        `
          #include <common>
          uniform vec3 fresnelColor;
          uniform float fresnelPower;
          uniform float fresnelIntensity;

          float fresnel(vec3 normal, vec3 viewDir) {
            return pow(1.0 - max(dot(normal, viewDir), 0.0), fresnelPower);
          }
        `
      );

      shader.fragmentShader = shader.fragmentShader.replace(
        `#include <dithering_fragment>`,
        `
          #include <dithering_fragment>

          vec3 viewDir = normalize(vViewPosition);
          float f = fresnel(normalize(normal), viewDir);
          vec3 rim = fresnelColor * f * fresnelIntensity;

          gl_FragColor.rgb += rim;
        `
      );
    }
  });

  const mazeGroup = new THREE.Group();
  scene.add(mazeGroup);

  // FLOOR
  const floorGeo = new THREE.PlaneGeometry(mazeSize * cellSize, mazeSize * cellSize);
  const floor = new THREE.Mesh(floorGeo, floorMat);
  floor.rotation.x = -Math.PI / 2;
  floor.position.set(0, 0, 0);
  floor.receiveShadow = true;
  mazeGroup.add(floor);

  // WALLS
  const wallHeight = 1;
  const wallGeo = new THREE.BoxGeometry(cellSize, wallHeight, cellSize);

  for (let x = 0; x < mazeSize; x++) {
    for (let y = 0; y < mazeSize; y++) {
      if (field[x][y]) {
        const wall = new THREE.Mesh(wallGeo, wallMat);
        wall.position.set(
          x * cellSize - halfSize + cellSize / 2,
          wallHeight / 2,
          y * cellSize - halfSize + cellSize / 2
        );
        wall.castShadow = false;
        wall.receiveShadow = true;
        mazeGroup.add(wall);
      }
    }
  }

  // BALL
  const { ball, ballRadius } = createBall(halfSize);
  ball.castShadow = true;
  scene.add(ball);

  if (levelLabel) levelLabel.textContent = `Level ${level}`;

  return { ball, ballRadius, field, mazeSize, halfSize, mazeGroup };
}
