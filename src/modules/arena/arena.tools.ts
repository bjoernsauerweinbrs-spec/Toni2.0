// toni/src/modules/arena/arena.tools.ts

export const ArenaTools = {
  drawLine(startX: number, startY: number, endX: number, endY: number) {
    const line = document.createElement('div');
    line.className = 'arena-line';
    line.style.left = startX + 'px';
    line.style.top = startY + 'px';
    line.style.width = Math.hypot(endX - startX, endY - startY) + 'px';
    line.style.transform = `rotate(${Math.atan2(endY - startY, endX - startX)}rad)`;
    return line;
  },

  drawCone(x: number, y: number) {
    const cone = document.createElement('div');
    cone.className = 'arena-cone';
    cone.style.left = x + 'px';
    cone.style.top = y + 'px';
    return cone;
  }
};
