import { initToolbar } from './arena.toolbar'

export function initArena() {
  loadField(arenaState.field)
  loadPlayers()
  initDrag()
  initDraw()
  initToolbar()
}
