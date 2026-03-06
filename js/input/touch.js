export function setupTouch(container, acceleration) {
  let lastTouch = null;

  function onTouchStart(e) {
    lastTouch = e.touches[0];
  }

  function onTouchMove(e) {
    const t = e.touches[0];
    const dx = t.clientX - lastTouch.clientX;
    const dy = t.clientY - lastTouch.clientY;
    lastTouch = t;

    const factor = 0.00002;
    acceleration.x += dx * factor;
    acceleration.y += dy * factor;

    e.preventDefault();
  }

  container.addEventListener('touchstart', onTouchStart, { passive: false });
  container.addEventListener('touchmove', onTouchMove, { passive: false });
}
