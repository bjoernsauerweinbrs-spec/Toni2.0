import { arenaState } from './arena.state'
import { renderLines } from './arena.draw'

let currentTool: 'move' | 'line' | 'arrow' | 'delete' = 'move'

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
  fieldSelect.addEventListener('change', () => {
    arenaState.field = fieldSelect.value
    loadField(arenaState.field)
  })
}

export function getCurrentTool() {
  return currentTool
}

function highlightActiveTool(tool: string) {
  const buttons = document.querySelectorAll('#arena-toolbar button')
  buttons.forEach(b => b.classList.remove('active'))

  const active = document.querySelector(`#arena-toolbar button[data-tool="${tool}"]`)
  if (active) active.classList.add('active')
}

function resetArena() {
  arenaState.players.forEach(p => {
    p.x = 100
    p.y = 100
  })

  arenaState.lines = []
  renderLines()
}
