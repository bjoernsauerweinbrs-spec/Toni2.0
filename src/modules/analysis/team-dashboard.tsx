// toni/src/modules/analysis/team-dashboard.tsx

import { AnalysisService } from './analysis.service';
import { Player } from '../../models/player.model';

export function renderTeamDashboard(players: Player[], container: HTMLElement) {
  const avgFitness = AnalysisService.getTeamFitness(players);
  const avgOVR = AnalysisService.getTeamOVR(players);

  container.innerHTML = `
    <div class="analysis-team">
      <h2>Team Analyse</h2>

      <div class="analysis-section">
        <strong>Durchschnittliche Fitness:</strong> ${avgFitness}
      </div>

      <div class="analysis-section">
        <strong>Durchschnittlicher OVR:</strong> ${avgOVR}
      </div>

      <div class="analysis-section">
        <strong>Anzahl Spieler:</strong> ${players.length}
      </div>
    </div>
  `;
}
