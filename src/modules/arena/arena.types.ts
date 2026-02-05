export interface ArenaPlayerPosition {
  id: string
  x: number
  y: number
}

export interface ArenaLine {
  id: string
  type: 'line' | 'arrow'
  color: string
  start: { x: number; y: number }
  end: { x: number; y: number }
}

export interface ArenaState {
  field: string
  players: ArenaPlayerPosition[]
  lines: ArenaLine[]
}
