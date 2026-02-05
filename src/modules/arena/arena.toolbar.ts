import { arenaState } from './arena.state'
import { loadField } from './arena'
import { renderLines } from './arena.draw'

let currentTool: 'move' | 'line' | 'arrow' | 'delete' = 'move'

/**
 * Initialisiert die Toolbar
 */
export function initToolbar() {
  const buttons = document.querySelectorAll('#arena-toolbar button')
  const fieldSelect = document.getElementById('arena-field-select') as HTMLSelectElement

  // Tool Buttons
  buttons.forEach(btn => {
    btn.addEventListener('click', () => {
      const tool = btn.getAttribute('data-tool') as any
      if (!tool) return

      if (tool === 'reset') {
        resetArena()
        return
      }

      currentTool = tool
      highlightActiveTool(tool)
    })
  })

  // Spielfeld wechseln
  if (fieldSelect) {
    fieldSelect.addEventListener('change', () => {
      arenaState.field = fieldSelect.value
      loadField(arenaState.field)
    })
  }
}

/**
 * Gibt das aktuell ausgewählte Tool zurück
 */
export function getCurrentTool() {
  return currentTool
}

/**
 * Markiert den aktiven Button in der Toolbar
 */
function highlightActiveTool(tool: string) {
  const buttons = document.querySelectorAll('#arena-toolbar button')
  buttons.forEach(b => b.classList.remove('active'))

  const active = document.querySelector(`#arena-toolbar button[data-tool="${tool}"]`)
  if (active) active.classList.add('active')
}

/**
 * Setzt Arena zurück (Spielerpositionen + Linien)
 */
function resetArena() {
  // Spieler zurücksetzen
  arenaState.players.forEach(p => {
    p.x = 100
    p.y = 100
  })

  // Linien löschen
  arenaState.lines = []
  renderLines()
}
