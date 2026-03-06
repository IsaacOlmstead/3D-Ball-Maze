import * as THREE from 'https://unpkg.com/three@0.160.0/build/three.module.js';
import { createRenderer } from './core/renderer.js';
import { createCamera, updateCameraFollow } from './core/camera.js';
import { setupLighting } from './core/lighting.js';
import { createLevel } from './game/level.js';
import { updatePhysics } from './game/collisions.js';
import { setupKeyboard } from './input/keyboard.js';
import { setupTouch } from './input/touch.js';
import { setupTilt } from './input/tilt.js';

const container = document.getElementById('game-container');
const levelLabel = document.getElementById('level-label');
const fullscreenBtn = document.getElementById('fullscreen-btn');
const tiltBtn = document.getElementById('tilt-btn');

let scene, camera, renderer;
let ball, field, mazeSize, halfSize, ballRadius;
let spot;

const cellSize = 1;

// Movement state
const velocity = new THREE.Vector2(0, 0);
const acceleration = new THREE.Vector2(0, 0);

// Tuning
const ACCEL = 0.004;
const MAX_SPEED = 0.12;
const DRAG = 0.90;

init();
animate();

function init() {
  scene = new THREE.Scene();
  scene.background = new THREE.Color(0x000000);

  camera = createCamera(container);
  renderer = createRenderer(container, camera);

  // Create level FIRST so ball exists
  const level = 1;
  const levelData = createLevel(scene, level, levelLabel);
  ball = levelData.ball;
  field = levelData.field;
  mazeSize = levelData.mazeSize;
  halfSize = levelData.halfSize;
  ballRadius = levelData.ballRadius;

  // Lighting AFTER ball exists
  const lighting = setupLighting(scene);
  spot = lighting.spot;

  setupKeyboard(acceleration, ACCEL);
  setupTouch(container, acceleration);
  setupTilt(acceleration, tiltBtn);

  setupFullscreen();

  window.addEventListener('resize', () => {
    const w = container.clientWidth;
    const h = container.clientHeight;
    camera.aspect = w / h;
    camera.updateProjectionMatrix();
    renderer.setSize(w, h);
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

function animate() {
  requestAnimationFrame(animate);
  if (spot && ball) {
  spot.position.set(ball.position.x, 10, ball.position.z);
  spot.target.position.set(ball.position.x, ball.position.y, ball.position.z);
  spot.target.updateMatrixWorld();
}


  // Integrate acceleration → velocity
  velocity.x += acceleration.x;
  velocity.y += acceleration.y;

  // Clamp speed
  const speed = velocity.length();
  if (speed > MAX_SPEED) {
    velocity.multiplyScalar(MAX_SPEED / speed);
  }

  // Apply drag
  velocity.multiplyScalar(DRAG);

  // Physics (movement + collision + bounce)
  updatePhysics(ball, velocity, field, mazeSize, cellSize, halfSize, ballRadius);

  // Visual rolling
  updateBallRolling(ball, velocity, ballRadius);

// Spotlight follow
if (spot && ball) {
  spot.position.set(ball.position.x, 10, ball.position.z);

  // Aim spotlight directly at the ball
  spot.target.position.set(
    ball.position.x,
    ball.position.y,
    ball.position.z
  );

  spot.target.updateMatrixWorld();
}


  // Camera follow
  updateCameraFollow(ball, camera);

  renderer.render(scene, camera);
}

function updateBallRolling(ball, velocity, radius) {
  const speed = velocity.length();
  if (speed < 0.0001) return;

  const axis = new THREE.Vector3(-velocity.y, 0, velocity.x).normalize();
  const angle = speed / radius;
  ball.rotateOnAxis(axis, angle);
}
