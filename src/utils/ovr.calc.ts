// toni/src/utils/ovr.calc.ts

import { Player } from '../models/player.model';

const positionWeights: Record<string, { pac: number; sho: number; pas: number; dri: number; def: number; phy: number }> = {
  ST: { pac: 0.15, sho: 0.35, pas: 0.1, dri: 0.2, def: 0.05, phy: 0.15 },
  ZM: { pac: 0.15, sho: 0.1, pas: 0.3, dri: 0.2, def: 0.15, phy: 0.1 },
  IV: { pac: 0.1, sho: 0.05, pas: 0.15, dri: 0.05, def: 0.45, phy: 0.2 },
  TW: { pac: 0.05, sho: 0.05, pas: 0.1, dri: 0.05, def: 0.4, phy: 0.35 },
  DEFAULT: { pac: 0.15, sho: 0.15, pas: 0.2, dri: 0.2, def: 0.15, phy: 0.15 }
};

export function calculateOVR(player: Player): number {
  const pos = (player.position || 'DEFAULT').toUpperCase();
  const w = positionWeights[pos] || positionWeights.DEFAULT;

  const attrScore =
    player.pac * w.pac +
    player.sho * w.sho +
    player.pas * w.pas +
    player.dri * w.dri +
    player.def * w.def +
    player.phy * w.phy;

  const attrNormalized = Math.round(attrScore);

  const fitnessFactor = player.fitness ?? 100;

  const ovr = Math.round(attrNormalized * 0.8 + fitnessFactor * 0.2);

  return Math.max(1, Math.min(99, ovr));
}
