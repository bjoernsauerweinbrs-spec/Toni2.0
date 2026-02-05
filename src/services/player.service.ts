// toni/src/services/player.service.ts

import { db } from './database';
import { Player } from '../models/player.model';
import { calculateOVR } from '../utils/ovr.calc';
import { generateId } from '../utils/id';

export const PlayerService = {
  list(): Player[] {
    return db.getAllPlayers();
  },

  get(id: string): Player | undefined {
    return db.getPlayerById(id);
  },

  create(payload: Partial<Player>): Player {
    const now = new Date().toISOString();

    const player: Player = {
      id: generateId(),
      name: payload.name || 'Unbenannt',
      nummer: payload.nummer || 0,
      position: payload.position || 'ZM',
      team: payload.team || 'Herren',

      pac: payload.pac ?? 50,
      sho: payload.sho ?? 50,
      pas: payload.pas ?? 50,
      dri: payload.dri ?? 50,
      def: payload.def ?? 50,
      phy: payload.phy ?? 50,

      fitness: payload.fitness ?? 100,
      verfuegbarTraining: payload.verfuegbarTraining ?? true,
      verfuegbarSpiel: payload.verfuegbarSpiel ?? true,

      ovr: 0,
      trainingBewertungen: [],
      fitnessDaten: [],

      createdAt: now,
      updatedAt: now,

      ...payload
    };

    player.ovr = calculateOVR(player);

    db.createPlayer(player);
    return player;
  },

  update(id: string, patch: Partial<Player>): Player | undefined {
    const updated = db.updatePlayer(id, patch);
    if (!updated) return undefined;

    const needsRecalc =
      patch.pac !== undefined ||
      patch.sho !== undefined ||
      patch.pas !== undefined ||
      patch.dri !== undefined ||
      patch.def !== undefined ||
      patch.phy !== undefined ||
      patch.fitness !== undefined;

    if (needsRecalc) {
      updated.ovr = calculateOVR(updated);
      db.updatePlayer(id, { ovr: updated.ovr });
    }

    return updated;
  },

  remove(id: string): boolean {
    return db.deletePlayer(id);
  },

  appendFitness(id: string, entry: any) {
    const player = db.getPlayerById(id);
    if (!player) return undefined;

    const list = player.fitnessDaten ?? [];
    const newEntry = {
      ...entry,
      datum: entry.datum || new Date().toISOString()
    };

    list.push(newEntry);

    db.updatePlayer(id, { fitnessDaten: list });
    return newEntry;
  }
};
