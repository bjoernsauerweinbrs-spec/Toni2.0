// toni/src/models/arena-state.model.ts

export interface ArenaState {
  state: 'karte' | 'punkt' | 'miniKarte';
  x?: number;
  y?: number;
  teamColor?: 'rot' | 'blau' | 'gelb' | 'gruen';
}
