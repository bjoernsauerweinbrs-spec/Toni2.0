import { arenaState } from './arena.state'
import { getCurrentTool } from './arena.toolbar'

export function initDrag() {
  const players = document.querySelectorAll('.player')

  players.forEach(el => {
    el.addEventListener('mousedown', startDrag)
  })
}

function startDrag(e: MouseEvent) {
  const tool = getCurrentTool()
  if (tool !== 'move') return

  const el = e.target as HTMLElement
  const id = el.dataset.id
  if (!id) return

  const offsetX = e.offsetX
  const offsetY = e.offsetY

  function move(ev: MouseEvent) {
    const x = ev.pageX - offsetX
    const y = ev.pageY - offsetY

    el.style.left = x + 'px'
    el.style.top = y + 'px'

    const p = arenaState.players.find(p => p.id === id)
    if (p) {
      p.x = x
      p.y = y
    }
  }

  function stop() {
    document.removeEventListener('mousemove', move)
    document.removeEventListener('mouseup', stop)
  }

  document.addEventListener('mousemove', move)
  document.addEventListener('mouseup', stop)
}
