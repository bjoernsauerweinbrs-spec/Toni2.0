// toni/src/services/seed.service.ts

import { db } from './database';
import { Player } from '../models/player.model';
import { calculateOVR } from '../utils/ovr.calc';
import { generateId } from '../utils/id';

export function seedDemoPlayers() {
  const demo: Player[] = [];

  for (let i = 1; i <= 16; i++) {
    const p: Player = {
      id: generateId(),
      name: `Demo Spieler ${i}`,
      nummer: i,
      position: 'ZM',
      team: 'Herren',

      pac: 50 + (i % 10),
      sho: 50 + (i % 8),
      pas: 50 + (i % 7),
      dri: 50 + (i % 6),
      def: 50 + (i % 5),
      phy: 50 + (i % 9),

      fitness: 90,
      verfuegbarTraining: true,
      verfuegbarSpiel: true,

      ovr: 0,
      trainingBewertungen: [],
      fitnessDaten: [],

      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    p.ovr = calculateOVR(p);
    demo.push(p);
  }

  db.seedPlayers(demo);
}
