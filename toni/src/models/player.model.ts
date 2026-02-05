// toni/src/models/player.model.ts

import { TeamType } from './team-type.model';
import { FitnessEntry } from './fitness-entry.model';
import { TrainingRating } from './training-rating.model';
import { ArenaState } from './arena-state.model';

export interface Player {
  id: string;

  // Identität
  name: string;
  nummer: number;
  position: string;
  team: TeamType;
  foto?: string; // URL oder Base64
  geburtsdatum?: string;

  // Körperdaten
  groesse?: number;
  gewicht?: number;
  koerperfett?: number;
  bmi?: number;
  koerpertyp?: string;

  // FIFA Attribute
  pac: number;
  sho: number;
  pas: number;
  dri: number;
  def: number;
  phy: number;

  // Gesamtwertung (automatisch)
  ovr: number;

  // Fitness & Form
  fitness: number; // 0–100
  form?: 'gut' | 'mittel' | 'schlecht';
  verletzung?: string;

  // Verfügbarkeit
  verfuegbarTraining: boolean;
  verfuegbarSpiel: boolean;
  status?: 'Training' | 'Spieltag' | 'Nicht dabei';

  // Arena
  arenaState?: ArenaState;

  // Trainingsdaten
  trainingBewertungen?: TrainingRating[];

  // Fitness-Uhr-Daten
  fitnessDaten?: FitnessEntry[];

  // System
  createdAt?: string;
  updatedAt?: string;
}
