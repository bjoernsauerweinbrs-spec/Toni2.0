// toni/src/components/FifaCardLarge.tsx

import { Player } from '../models/player.model';

export function FifaCardLarge(player: Player): HTMLElement {
  const el = document.createElement('div');
  el.className = 'fifa-large';

  el.innerHTML = `
    <div class="fifa-large-photo">
      <img src="${player.foto || 'default.png'}" />
    </div>

    <div class="fifa-large-info">
      <h2>${player.name}</h2>
      <p>Nummer: ${player.nummer}</p>
      <p>Position: ${player.position}</p>
      <p>OVR: ${player.ovr}</p>
      <p>Fitness: ${player.fitness}</p>
    </div>
  `;

  return el;
}
