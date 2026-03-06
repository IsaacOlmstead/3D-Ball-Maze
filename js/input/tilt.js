export function setupTilt(acceleration, tiltBtn) {
  if (!tiltBtn) return;

  tiltBtn.addEventListener('click', async () => {
    if (typeof DeviceOrientationEvent !== 'undefined' &&
        typeof DeviceOrientationEvent.requestPermission === 'function') {
      const perm = await DeviceOrientationEvent.requestPermission();
      if (perm !== 'granted') return;
    }

    window.addEventListener('deviceorientation', (event) => {
      const beta = event.beta || 0;   // front/back
      const gamma = event.gamma || 0; // left/right
      const factor = 0.00002;

      acceleration.x += gamma * factor;
      acceleration.y += beta * factor;
    });
  });
}
