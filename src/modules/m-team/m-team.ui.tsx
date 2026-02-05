// toni/src/modules/m-team/m-team.ui.tsx

import { MTeamController } from './m-team.controller';
import { Player } from '../../models/player.model';

export function renderPlayerList(container: HTMLElement) {
  const players = MTeamController.listPlayers();

  container.innerHTML = `
    <div class="mteam-list">
      ${players
        .map(
          (p) => `
        <div class="mteam-card" data-id="${p.id}">
          <img src="${p.foto || 'default.png'}" class="mteam-card-photo" />
          <div class="mteam-card-name">${p.name}</div>
          <div class="mteam-card-pos">${p.position}</div>
          <div class="mteam-card-ovr">${p.ovr}</div>
        </div>
      `
        )
        .join('')}
    </div>
  `;

  container.querySelectorAll('.mteam-card').forEach((card) => {
    card.addEventListener('click', () => {
      const id = card.getAttribute('data-id')!;
      const player = MTeamController.getPlayer(id);
      if (player) renderPlayerEditor(player);
    });
  });
}

export function renderPlayerEditor(player: Player) {
  const editor = document.getElementById('mteam-editor');
  if (!editor) return;

  editor.innerHTML = `
    <div class="mteam-editor-card">
      <img src="${player.foto || 'default.png'}" class="mteam-editor-photo" />

      <label>Name</label>
      <input id="edit-name" value="${player.name}" />

      <label>Nummer</label>
      <input id="edit-nummer" type="number" value="${player.nummer}" />

      <label>Position</label>
      <input id="edit-position" value="${player.position}" />

      <label>Fitness</label>
      <input id="edit-fitness" type="number" value="${player.fitness}" />

      <button id="save-player">Speichern</button>
    </div>
  `;

  document.getElementById('save-player')?.addEventListener('click', () => {
    MTeamController.updatePlayer(player.id, {
      name: (document.getElementById('edit-name') as HTMLInputElement).value,
      nummer: Number((document.getElementById('edit-nummer') as HTMLInputElement).value),
      position: (document.getElementById('edit-position') as HTMLInputElement).value,
      fitness: Number((document.getElementById('edit-fitness') as HTMLInputElement).value)
    });

    alert('Spieler gespeichert');
  });
}
