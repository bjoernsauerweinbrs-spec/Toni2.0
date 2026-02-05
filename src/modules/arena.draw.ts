import { arenaState } from './arena.state'

let drawing = false
let startX = 0
let startY = 0

export function initDraw() {
  const field = document.getElementById('arena-field')

  field.addEventListener('mousedown', start)
  field.addEventListener('mouseup', end)
}

function start(e: MouseEvent) {
  drawing = true
  startX = e.offsetX
  startY = e.offsetY
}

function end(e: MouseEvent) {
  if (!drawing) return
  drawing = false

  arenaState.lines.push({
    id: crypto.randomUUID(),
    type: 'line',
    color: '#ff0000',
    start: { x: startX, y: startY },
    end: { x: e.offsetX, y: e.offsetY }
  })

  renderLines()
}

function renderLines() {
  const layer = document.getElementById('arena-lines')
  layer.innerHTML = ''

  arenaState.lines.forEach(l => {
    const el = document.createElement('div')
    el.classList.add('line')
    el.style.left = l.start.x + 'px'
    el.style.top = l.start.y + 'px'
    el.style.width = Math.hypot(l.end.x - l.start.x, l.end.y - l.start.y) + 'px'
    el.style.transform = `rotate(${Math.atan2(l.end.y - l.start.y, l.end.x - l.start.x)}rad)`
    layer.appendChild(el)
  })
}
