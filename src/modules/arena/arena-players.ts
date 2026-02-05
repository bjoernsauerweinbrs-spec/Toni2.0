// toni/src/modules/arena/arena-players.ts

export function renderPlayerPoint(player: any, x: number, y: number): HTMLElement {
  const el = document.createElement('div');
  el.className = 'arena-player-point';
  el.style.left = x + 'px';
  el.style.top = y + 'px';
  el.innerText = player.nummer;

  let isDragging = false;

  el.addEventListener('mousedown', () => {
    isDragging = true;
  });

  document.addEventListener('mousemove', (e) => {
    if (!isDragging) return;
    el.style.left = e.pageX - 20 + 'px';
    el.style.top = e.pageY - 20 + 'px';
  });

  document.addEventListener('mouseup', () => {
    isDragging = false;
  });

  return el;
}
