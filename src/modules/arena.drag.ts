import { arenaState } from './arena.state'

export function initDrag() {
  const players = document.querySelectorAll('.player')

  players.forEach(el => {
    el.addEventListener('mousedown', startDrag)
  })
}

function startDrag(e: MouseEvent) {
  const el = e.target as HTMLElement
  const id = el.dataset.id
  const offsetX = e.offsetX
  const offsetY = e.offsetY

  function move(ev: MouseEvent) {
    el.style.left = ev.pageX - offsetX + 'px'
    el.style.top = ev.pageY - offsetY + 'px'

    const p = arenaState.players.find(p => p.id === id)
    if (p) {
      p.x = ev.pageX - offsetX
      p.y = ev.pageY - offsetY
    }
  }

  function stop() {
    document.removeEventListener('mousemove', move)
    document.removeEventListener('mouseup', stop)
  }

  document.addEventListener('mousemove', move)
  document.addEventListener('mouseup', stop)
}
