export function setupKeyboard(acceleration, ACCEL) {
  window.addEventListener('keydown', (e) => {
    switch (e.key.toLowerCase()) {
      case 'arrowleft':
      case 'a':
      case 'h':
        acceleration.x = -ACCEL;
        break;

      case 'arrowright':
      case 'd':
      case 'l':
        acceleration.x = ACCEL;
        break;

      case 'arrowup':
      case 'w':
      case 'k':
        acceleration.y = -ACCEL;
        break;

      case 'arrowdown':
      case 's':
      case 'j':
        acceleration.y = ACCEL;
        break;
    }
  });

  window.addEventListener('keyup', (e) => {
    switch (e.key.toLowerCase()) {
      case 'arrowleft':
      case 'a':
      case 'h':
      case 'arrowright':
      case 'd':
      case 'l':
        acceleration.x = 0;
        break;

      case 'arrowup':
      case 'w':
      case 'k':
      case 'arrowdown':
      case 's':
      case 'j':
        acceleration.y = 0;
        break;
    }
  });
}
