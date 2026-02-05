// toni/src/components/PlayerPoint.tsx

import { Player } from '../models/player.model';

export function PlayerPoint(player: Player, x: number, y: number): HTMLElement {
  const el = document.createElement('div');
  el.className = 'player-point';
  el.innerText = player.nummer.toString();

  el.style.left = x + 'px';
  el.style.top = y + 'px';

  let dragging = false;

  el.addEventListener('mousedown', () => dragging = true);
  document.addEventListener('mouseup', () => dragging = false);

  document.addEventListener('mousemove', (e) => {
    if (!dragging) return;
    el.style.left = e.pageX - 20 + 'px';
    el.style.top = e.pageY - 20 + 'px';
  });

  return el;
}
