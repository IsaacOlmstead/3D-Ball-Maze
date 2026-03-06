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

  const wallMat = new THREE.MeshPhongMaterial({ map: brickTex });
  const floorMat = new THREE.MeshPhongMaterial({ map: concreteTex });

  const mazeGroup = new THREE.Group();
  scene.add(mazeGroup);

  const floorGeo = new THREE.PlaneGeometry(mazeSize * cellSize, mazeSize * cellSize);
  const floor = new THREE.Mesh(floorGeo, floorMat);
  floor.rotation.x = -Math.PI / 2;
  floor.position.set(0, 0, 0);
  mazeGroup.add(floor);

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
        mazeGroup.add(wall);
      }
    }
  }

  const { ball, ballRadius } = createBall(halfSize);
  scene.add(ball);

  if (levelLabel) levelLabel.textContent = `Level ${level}`;

  return { ball, ballRadius, field, mazeSize, halfSize, mazeGroup };
}
