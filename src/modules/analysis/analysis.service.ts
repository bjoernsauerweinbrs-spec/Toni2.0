// toni/src/modules/analysis/analysis.service.ts

import { Player } from '../../models/player.model';

export const AnalysisService = {
  getPlayerTrend(player: Player) {
    const fitness = player.fitnessDaten || [];
    if (fitness.length < 2) return null;

    const last = fitness[fitness.length - 1].belastungsindex ?? 0;
    const prev = fitness[fitness.length - 2].belastungsindex ?? 0;

    return last - prev;
  },

  getPlayerRisk(player: Player) {
    const data = player.fitnessDaten || [];
    if (data.length === 0) return 'niedrig';

    const last = data[data.length - 1];

    if ((last.puls ?? 0) > 180) return 'hoch';
    if ((last.regenerationszeit ?? 0) > 48) return 'mittel';

    return 'niedrig';
  },

  getTeamFitness(players: Player[]) {
    if (players.length === 0) return 0;
    const sum = players.reduce((acc, p) => acc + (p.fitness ?? 0), 0);
    return Math.round(sum / players.length);
  },

  getTeamOVR(players: Player[]) {
    if (players.length === 0) return 0;
    const sum = players.reduce((acc, p) => acc + (p.ovr ?? 0), 0);
    return Math.round(sum / players.length);
  }
};
