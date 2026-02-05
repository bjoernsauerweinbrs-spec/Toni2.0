// toni/src/components/FifaCardMini.tsx

import { Player } from '../models/player.model';

export function FifaCardMini(player: Player): HTMLElement {
  const el = document.createElement('div');
  el.className = 'fifa-mini';

  el.innerHTML = `
    <div class="fifa-mini-photo">
      <img src="${player.foto || 'default.png'}" />
    </div>
    <div class="fifa-mini-info">
      <div class="fifa-mini-name">${player.name}</div>
      <div class="fifa-mini-pos">${player.position}</div>
      <div class="fifa-mini-ovr">${player.ovr}</div>
    </div>
  `;

  return el;
}
