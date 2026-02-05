// toni/src/app/router.ts

import { renderPlayerList } from '../modules/m-team/m-team.ui';
import { renderArena } from '../modules/arena/arena.ui';
import { renderTeamDashboard } from '../modules/analysis/team-dashboard';
import { PlayerService } from '../services/player.service';

export const Router = {
  view: null as HTMLElement | null,

  init() {
    this.view = document.getElementById('app-view');
    this.navigate('team'); // Default
  },

  navigate(route: string) {
    if (!this.view) return;

    switch (route) {
      case 'team':
        renderPlayerList(this.view);
        break;

      case 'arena':
        renderArena(this.view);
        break;

      case 'analysis':
        const players = PlayerService.list();
        renderTeamDashboard(players, this.view);
        break;

      case 'training':
        this.view.innerHTML = `<h2>Training kommt später</h2>`;
        break;

      case 'settings':
        this.view.innerHTML = `<h2>Einstellungen kommen später</h2>`;
        break;

      default:
        this.view.innerHTML = `<h2>404 – Seite nicht gefunden</h2>`;
    }
  }
};
