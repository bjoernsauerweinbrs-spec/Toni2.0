import { arenaState } from './arena.state'
import { initDrag } from './arena.drag'
import { initDraw } from './arena.draw'
import { initToolbar } from './arena.toolbar'

/**
 * Initialisiert die komplette Arena
 */
export function initArena() {
  loadField(arenaState.field)
  loadPlayers()
  initDrag()
  initDraw()
  initToolbar()
}

/**
 * Lädt das Spielfeld-Hintergrundbild
 */
export function loadField(name: string) {
  const field = document.getElementById('arena-field')
  if (!field) return
  field.style.backgroundImage = `url('./assets/fields/${name}.png')`
}

/**
 * Rendert alle Spieler auf dem Feld
 */
export function loadPlayers() {
  const container = document.getElementById('arena-players')
  if (!container) return

  container.innerHTML = ''

  arenaState.players.forEach(p => {
    const el = document.createElement('div')
    el.classList.add('player')
    el.dataset.id = p.id
    el.style.left = p.x + 'px'
    el.style.top = p.y + 'px'
    container.appendChild(el)
  })
}
