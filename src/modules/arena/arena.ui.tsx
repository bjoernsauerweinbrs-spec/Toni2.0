// toni/src/modules/arena/arena.ui.tsx

import { ArenaEngine } from './arena.engine';
import { renderPlayerPoint } from './arena-players';

export function renderArena(container: HTMLElement) {
  container.innerHTML = `
    <div id="arena-field" class="arena-field"></div>
    <div id="arena-tools" class="arena-tools"></div>
  `;

  const field = document.getElementById('arena-field')!;
  const tools = document.getElementById('arena-tools')!;

  ArenaEngine.init(field, tools);
}
