import { ArenaState } from './arena.types'

export const arenaState: ArenaState = {
  field: 'standard',

  players: [
    // Beispielspieler – du kannst hier beliebig viele hinzufügen
    { id: 'p1', x: 100, y: 100 },
    { id: 'p2', x: 200, y: 100 },
    { id: 'p3', x: 300, y: 100 },
    { id: 'p4', x: 400, y: 100 },
    { id: 'p5', x: 500, y: 100 }
  ],

  lines: []
}
