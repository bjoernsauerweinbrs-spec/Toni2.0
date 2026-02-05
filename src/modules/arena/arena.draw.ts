import { arenaState } from './arena.state'
import { getCurrentTool } from './arena.toolbar'

let drawing = false
let startX = 0
let startY = 0

export function initDraw() {
  const field = document.getElementById('arena-field')

  if (!field) return

  field.addEventListener('mousedown', start)
  field.addEventListener('mouseup', end)
}

function start(e: MouseEvent) {
  const tool = getCurrentTool()

  if (tool === 'line' || tool === 'arrow') {
    drawing = true
    startX = e.offsetX
    startY = e.offsetY
  }
}

function end(e: MouseEvent) {
  const tool = getCurrentTool()

  // Löschen
  if (tool === 'delete') {
    deleteLineAt(e.offsetX, e.offsetY)
    return
  }

  // Linien/Pfeile zeichnen
  if (!drawing) return
  drawing = false

  arenaState.lines.push({
    id: crypto.randomUUID(),
    type: tool === 'arrow' ? 'arrow' : 'line',
    color: '#ff0000',
    start: { x: startX, y: startY },
    end: { x: e.offsetX, y: e.offsetY }
  })

  renderLines()
}

export function renderLines() {
  const layer = document.getElementById('arena-lines')
  if (!layer) return

  layer.innerHTML = ''

  arenaState.lines.forEach(l => {
    const el = document.createElement('div')
    el.classList.add('line')

    const dx = l.end.x - l.start.x
    const dy = l.end.y - l.start.y
    const length = Math.hypot(dx, dy)
    const angle = Math.atan2(dy, dx)

    el.style.left = l.start.x + 'px'
    el.style.top = l.start.y + 'px'
    el.style.width = length + 'px'
    el.style.transform = `rotate(${angle}rad)`
    el.style.background = l.color

    layer.appendChild(el)
  })
}

function deleteLineAt(x: number, y: number) {
  arenaState.lines = arenaState.lines.filter(l => {
    const dist =
      Math.abs((l.end.y - l.start.y) * x - (l.end.x - l.start.x) * y + l.end.x * l.start.y - l.end.y * l.start.x) /
      Math.hypot(l.end.x - l.start.x, l.end.y - l.start.y)

    return dist > 10
  })

  renderLines()
}
