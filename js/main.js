import * as THREE from 'https://unpkg.com/three@0.160.0/build/three.module.js';

const container = document.getElementById('game-container');
const levelLabel = document.getElementById('level-label');
const fullscreenBtn = document.getElementById('fullscreen-btn');
const tiltBtn = document.getElementById('tilt-btn');

let scene, camera, renderer;
let ball, mazeGroup;
let level = 1;
let velocity = new THREE.Vector2(0, 0); // x,z plane
let field = null;
let mazeSize = 0;
const cellSize = 1;
let halfSize = 0;
const ballRadius = 0.4;

init();
animate();

function init() {
  scene = new THREE.Scene();
  scene.background = new THREE.Color(0x000000);

  const aspect = container.clientWidth / container.clientHeight;
  camera = new THREE.PerspectiveCamera(45, aspect, 0.1, 1000);
  camera.position.set(0, 40, 40);
  camera.lookAt(0, 0, 0);

  renderer = new THREE.WebGLRenderer({ antialias: true });
  renderer.setSize(container.clientWidth, container.clientHeight);
  container.appendChild(renderer.domElement);

  const ambient = new THREE.AmbientLight(0xffffff, 0.4);
  scene.add(ambient);

  const dirLight = new THREE.DirectionalLight(0xffffff, 0.8);
  dirLight.position.set(20, 40, 20);
  scene.add(dirLight);

  createLevel(level);
  setupControls();
  setupFullscreen();
  setupTilt();
  window.addEventListener('resize', onWindowResize);
}

function createLevel(n) {
  if (mazeGroup) scene.remove(mazeGroup);
  mazeGroup = new THREE.Group();
  scene.add(mazeGroup);

  mazeSize = 9 + (n - 1) * 2; // grow maze per level
  field = generateSquareMaze(mazeSize);
  halfSize = (mazeSize * cellSize) / 2;

  const loader = new THREE.TextureLoader();
  const brickTex = loader.load('assets/brick.png');
  const concreteTex = loader.load('assets/concrete.png');
  const ballTex = loader.load('assets/ball.png');

  brickTex.wrapS = brickTex.wrapT = THREE.RepeatWrapping;
  concreteTex.wrapS = concreteTex.wrapT = THREE.RepeatWrapping;

  const wallMat = new THREE.MeshPhongMaterial({ map: brickTex });
  const floorMat = new THREE.MeshPhongMaterial({ map: concreteTex });
  const ballMat = new THREE.MeshPhongMaterial({ map: ballTex });

  // floor
  const floorGeo = new THREE.PlaneGeometry(mazeSize * cellSize, mazeSize * cellSize);
  const floor = new THREE.Mesh(floorGeo, floorMat);
  floor.rotation.x = -Math.PI / 2;
  floor.position.set(0, 0, 0);
  mazeGroup.add(floor);

  // walls
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

  // ball
  if (ball) scene.remove(ball);
  const ballGeo = new THREE.SphereGeometry(ballRadius, 32, 32);
  ball = new THREE.Mesh(ballGeo, ballMat);
  ball.position.set(-halfSize + 1.5, ballRadius, -halfSize + 1.5);
  scene.add(ball);

  // reset velocity
  velocity.set(0, 0);

  levelLabel.textContent = `Level ${n}`;
}

function setupControls() {
  window.addEventListener('keydown', (e) => {
    const speed = 0.05;
    if (e.key === 'ArrowLeft' || e.key === 'a' || e.key === 'h') velocity.x -= speed;
    if (e.key === 'ArrowRight' || e.key === 'd' || e.key === 'l') velocity.x += speed;
    if (e.key === 'ArrowUp' || e.key === 'w' || e.key === 'k') velocity.y -= speed;
    if (e.key === 'ArrowDown' || e.key === 's' || e.key === 'j') velocity.y += speed;
  });

  let lastTouch = null;
  container.addEventListener('touchstart', (e) => {
    lastTouch = e.touches[0];
  });
  container.addEventListener('touchmove', (e) => {
    const t = e.touches[0];
    const dx = t.clientX - lastTouch.clientX;
    const dy = t.clientY - lastTouch.clientY;
    lastTouch = t;
    const factor = 0.0008;
    velocity.x += dx * factor;
    velocity.y += dy * factor;
  });
}

function setupFullscreen() {
  fullscreenBtn.addEventListener('click', () => {
    if (!document.fullscreenElement) {
      container.requestFullscreen?.();
    } else {
      document.exitFullscreen?.();
    }
  });
}

function setupTilt() {
  tiltBtn.addEventListener('click', async () => {
    if (typeof DeviceOrientationEvent !== 'undefined' &&
        typeof DeviceOrientationEvent.requestPermission === 'function') {
      const perm = await DeviceOrientationEvent.requestPermission();
      if (perm !== 'granted') return;
    }
    window.addEventListener('deviceorientation', (event) => {
      const beta = event.beta || 0;   // front/back
      const gamma = event.gamma || 0; // left/right
      const factor = 0.0008;
      velocity.x += gamma * factor;
      velocity.y += beta * factor;
    });
  });
}

function onWindowResize() {
  const w = container.clientWidth;
  const h = container.clientHeight;
  camera.aspect = w / h;
  camera.updateProjectionMatrix();
  renderer.setSize(w, h);
}

function animate() {
  requestAnimationFrame(animate);

  updatePhysics();
  renderer.render(scene, camera);
}

function updatePhysics() {
  // proposed new position
  let newX = ball.position.x + velocity.x;
  let newZ = ball.position.z + velocity.y;

  // friction
  velocity.multiplyScalar(0.95);

  // collision on X axis
  if (!isWallAt(newX, ball.position.z)) {
    ball.position.x = newX;
  } else {
    velocity.x = 0;
  }

  // collision on Z axis
  if (!isWallAt(ball.position.x, newZ)) {
    ball.position.z = newZ;
  } else {
    velocity.y = 0;
  }

  // TODO: exit detection & level progression
}

function isWallAt(worldX, worldZ) {
  // convert world position to maze indices
  const localX = worldX + halfSize;
  const localZ = worldZ + halfSize;

  const ix = Math.floor(localX / cellSize);
  const iy = Math.floor(localZ / cellSize);

  if (ix < 0 || iy < 0 || ix >= mazeSize || iy >= mazeSize) return true;
  return field[ix][iy] === true;
}
