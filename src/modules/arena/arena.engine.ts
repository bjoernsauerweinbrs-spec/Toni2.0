// toni/src/modules/arena/arena.engine.ts

import { renderPlayerPoint } from './arena-players';

export const ArenaEngine = {
  field: null as HTMLElement | null,
  tools: null as HTMLElement | null,
  playersOnField: [] as any[],

  init(field: HTMLElement, tools: HTMLElement) {
    this.field = field;
    this.tools = tools;

    this.setupTools();
  },

  setupTools() {
    if (!this.tools) return;

    this.tools.innerHTML = `
      <button id="tool-move">Spieler bewegen</button>
      <button id="tool-line">Laufweg</button>
      <button id="tool-pass">Passweg</button>
      <button id="tool-cone">Hütchen</button>
      <button id="tool-undo">Undo</button>
    `;
  },

  addPlayer(player: any, x: number, y: number) {
    if (!this.field) return;

    const point = renderPlayerPoint(player, x, y);
    this.field.appendChild(point);

    this.playersOnField.push({ player, point });
  }
};
