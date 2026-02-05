// toni/src/modules/analysis/player-dashboard.tsx

import { AnalysisService } from './analysis.service';
import { Player } from '../../models/player.model';

export function renderPlayerDashboard(player: Player, container: HTMLElement) {
  const trend = AnalysisService.getPlayerTrend(player);
  const risk = AnalysisService.getPlayerRisk(player);

  container.innerHTML = `
    <div class="analysis-player">
      <h2>${player.name}</h2>
      <div class="analysis-section">
        <strong>OVR:</strong> ${player.ovr}
      </div>
      <div class="analysis-section">
        <strong>Fitness:</strong> ${player.fitness}
      </div>
      <div class="analysis-section">
        <strong>Trend:</strong> ${trend ?? 'Keine Daten'}
      </div>
      <div class="analysis-section">
        <strong>Verletzungsrisiko:</strong> ${risk}
      </div>
    </div>
  `;
}
