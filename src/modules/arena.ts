import { arenaState } from './arena.state'
import { initDrag } from './arena.drag'
import { initDraw } from './arena.draw'

export function initArena() {
  loadField(arenaState.field)
  loadPlayers()
  initDrag()
  initDraw()
}

function loadField(name: string) {
  const field = document.getElementById('arena-field')
  field.style.backgroundImage = `url('./assets/fields/${name}.png')`
}

function loadPlayers() {
  const container = document.getElementById('arena-players')
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
