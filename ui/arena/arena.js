// ============================================
// TONI 2.0 – ARENA ENGINE (Modern Version)
// UX-Modell C: Klick = Auswahl, Long-Press = PlayerCard,
// Drag = Bewegung, Undo/Redo, ToniDB v2 Integration,
// Analyse-Hooks, Toast-System, Touch-Optimierung
// ============================================

// Lokale Fallbacks
const _fallbackToniEvents = { on: () => {}, emit: () => {} };
const _fallbackToniDB = {
  data: { squad: {}, positions: {}, players: {} },
  savePosition: () => {},
  getPositions: () => ({}),
  setPositions: () => {},
  getPlayers: () => ({}),
  setPlayer: () => {},
  setPlayers: () => {},
  snapshot: () => "{}",
  restoreFromSnapshot: () => false,
  exportAll: () => ({}),
  importAll: () => false
};

function getToniEvents() {
  return window.ToniEvents || _fallbackToniEvents;
}
function getToniDB() {
  return window.ToniDB || _fallbackToniDB;
}

const arena = {
  // Canvas
  canvas: null,
  ctx: null,

  // Spieler
  players: {}, // { id: { x,y,color,line } }
  selectedPlayer: null,

  // Drag
  dragging: null,
  offsetX: 0,
  offsetY: 0,
  dragMoved: false,

  // Long-Press
  longPressTimer: null,
  longPressActive: false,
  LONG_PRESS_TIME: 500,

  // Animation
  animating: false,
  animationTargets: {},

  // Tool
  currentTool: "move",

  // Undo/Redo
  history: { past: [], future: [] },

  // ----------------------------------------
  // Init
  // ----------------------------------------
  init(canvasId) {
    this.canvas = document.getElementById(canvasId);
    if (!this.canvas) {
      console.error("[ARENA] Canvas nicht gefunden");
      return;
    }

    this.ctx = this.canvas.getContext("2d");

    this._resizeCanvas();
    window.addEventListener("resize", () => this._resizeCanvas());

    this._loadPlayersWithFormation();
    this._setupPointerEvents();
    this._setupAIListeners();
    this._setupDBListeners();

    requestAnimationFrame(() => this._render());
    console.log("%c[TONI 2.0] Arena geladen", "color:#00ff88");
  },

  // ----------------------------------------
  // Resize
  // ----------------------------------------
  _resizeCanvas() {
    if (!this.canvas) return;
    const rect = this.canvas.getBoundingClientRect();
    const dpr = window.devicePixelRatio || 1;

    const w = Math.max(1, Math.floor(rect.width * dpr));
    const h = Math.max(1, Math.floor(rect.height * dpr));

    if (this.canvas.width !== w || this.canvas.height !== h) {
      this.canvas.width = w;
      this.canvas.height = h;
      if (this.ctx && this.ctx.setTransform) {
        this.ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      }
    }
  },

  // ----------------------------------------
  // Formation laden
  // ----------------------------------------
  _loadPlayersWithFormation() {
    const ToniDB = getToniDB();
    const homeStarters = ToniDB.data?.squad?.home?.starters || [];
    const homeBench = ToniDB.data?.squad?.home?.bench || [];
    const awayStarters = ToniDB.data?.squad?.away?.starters || [];

    const dpr = window.devicePixelRatio || 1;
    const w = this.canvas.width / dpr;
    const h = this.canvas.height / dpr;

    const formationHome = [
      { line: "keeper", x: 0.10, y: 0.50 },
      { line: "defense", x: 0.25, y: 0.20 },
      { line: "defense", x: 0.25, y: 0.40 },
      { line: "defense", x: 0.25, y: 0.60 },
      { line: "defense", x: 0.25, y: 0.80 },
      { line: "midfield", x: 0.45, y: 0.20 },
      { line: "midfield", x: 0.45, y: 0.40 },
      { line: "midfield", x: 0.45, y: 0.60 },
      { line: "midfield", x: 0.45, y: 0.80 },
      { line: "attack", x: 0.65, y: 0.35 },
      { line: "attack", x: 0.65, y: 0.65 }
    ];

    const formationAway = [
      { line: "attack", x: 0.90, y: 0.50 },
      { line: "midfield", x: 0.75, y: 0.20 },
      { line: "midfield", x: 0.75, y: 0.40 },
      { line: "midfield", x: 0.75, y: 0.60 },
      { line: "midfield", x: 0.75, y: 0.80 },
      { line: "defense", x: 0.55, y: 0.20 },
      { line: "defense", x: 0.55, y: 0.40 },
      { line: "defense", x: 0.55, y: 0.60 },
      { line: "defense", x: 0.55, y: 0.80 },
      { line: "keeper", x: 0.80, y: 0.50 },
      { line: "attack", x: 0.88, y: 0.30 }
    ];

    this.players = {};

    homeStarters.forEach((id, i) => {
      const saved = ToniDB.getPosition(id);
      const f = formationHome[i] || { x: 0.5, y: 0.5, line: "midfield" };
      this.players[id] = {
        x: saved?.x ?? f.x * w,
        y: saved?.y ?? f.y * h,
        color: "red",
        line: f.line
      };
    });

    homeBench.forEach((id, i) => {
      const saved = ToniDB.getPosition(id);
      const baseX = 0.10 * w;
      const baseY = (0.10 + i * 0.07) * h;
      this.players[id] = {
        x: saved?.x ?? baseX,
        y: saved?.y ?? baseY,
        color: "red",
        line: "bench"
      };
    });

    awayStarters.forEach((id, i) => {
      const saved = ToniDB.getPosition(id);
      const f = formationAway[i] || { x: 0.7, y: 0.5, line: "midfield" };
      this.players[id] = {
        x: saved?.x ?? f.x * w,
        y: saved?.y ?? f.y * h,
        color: "blue",
        line: f.line
      };
    });
  },

  // ----------------------------------------
  // Pointer Events (Klick, Long-Press, Drag)
  // ----------------------------------------
  _setupPointerEvents() {
    const down = window.PointerEvent ? "pointerdown" : "mousedown";
    const move = window.PointerEvent ? "pointermove" : "mousemove";
    const up = window.PointerEvent ? "pointerup" : "mouseup";

    this.canvas.addEventListener(down, (e) => this._onPointerDown(e));
    this.canvas.addEventListener(move, (e) => this._onPointerMove(e));
    window.addEventListener(up, (e) => this._onPointerUp(e));
  },

  _onPointerDown(e) {
    const rect = this.canvas.getBoundingClientRect();
    const mx = e.clientX - rect.left;
    const my = e.clientY - rect.top;

    const hit = this._findPlayerAt(mx, my);
    if (!hit) return;

    this.dragging = hit;
    this.dragMoved = false;

    const p = this.players[hit];
    this.offsetX = mx - p.x;
    this.offsetY = my - p.y;

    // Long-Press starten
    this.longPressActive = false;
    this.longPressTimer = setTimeout(() => {
      this.longPressActive = true;
      this._openPlayerCard(hit);
    }, this.LONG_PRESS_TIME);
  },

  _onPointerMove(e) {
    if (!this.dragging) return;
    if (this.longPressActive) return;

    const rect = this.canvas.getBoundingClientRect();
    const mx = e.clientX - rect.left;
    const my = e.clientY - rect.top;

    const dx = mx - (this.players[this.dragging].x + this.offsetX);
    const dy = my - (this.players[this.dragging].y + this.offsetY);

    if (Math.abs(dx) > 5 || Math.abs(dy) > 5) {
      this.dragMoved = true;
      clearTimeout(this.longPressTimer);
    }

    this.players[this.dragging].x = mx - this.offsetX;
    this.players[this.dragging].y = my - this.offsetY;

    getToniDB().savePosition(this.dragging, this.players[this.dragging].x, this.players[this.dragging].y);
  },

  _onPointerUp(e) {
    clearTimeout(this.longPressTimer);

    if (!this.dragging) return;

    if (!this.dragMoved && !this.longPressActive) {
      this._selectPlayer(this.dragging);
    }

    if (this.dragMoved) {
      this._pushHistory();
    }

    this.dragging = null;
  },

  // ----------------------------------------
  // Auswahl
  // ----------------------------------------
  _selectPlayer(id) {
    this.selectedPlayer = id;
    this.toast(`Spieler ${id} ausgewählt`, "info");
  },

  // ----------------------------------------
  // Long-Press → PlayerCard
  // ----------------------------------------
  _openPlayerCard(id) {
    const ToniDB = getToniDB();
    const data = ToniDB.getPlayer(id) || { id };
    if (window.openPlayerCardModal) {
      window.openPlayerCardModal(data);
    }
  },

  savePlayerCard(data) {
    getToniDB().setPlayer(data.id, data);
    this.toast("Spieler gespeichert", "success");
    this._pushHistory();
  },

  // ----------------------------------------
  // Undo/Redo
  // ----------------------------------------
  _pushHistory() {
    const ToniDB = getToniDB();
    const snap = ToniDB.snapshot();
    this.history.past.push(snap);
    this.history.future = [];
  },

  undo() {
    if (!this.history.past.length) return;
    const ToniDB = getToniDB();
    const current = ToniDB.snapshot();
    this.history.future.push(current);

    const prev = this.history.past.pop();
    ToniDB.restoreFromSnapshot(prev);
    this._loadPlayersWithFormation();
    this.toast("Undo", "info");
  },

  redo() {
    if (!this.history.future.length) return;
    const ToniDB = getToniDB();
    const current = ToniDB.snapshot();
    this.history.past.push(current);

    const next = this.history.future.pop();
    ToniDB.restoreFromSnapshot(next);
    this._loadPlayersWithFormation();
    this.toast("Redo", "info");
  },

  // ----------------------------------------
  // Export / Import
  // ----------------------------------------
  exportAll() {
    const ToniDB = getToniDB();
    const payload = ToniDB.exportAll();
    const blob = new Blob([JSON.stringify(payload, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `toni-export-${Date.now()}.json`;
    document.body.appendChild(a);
    a.click();
    a.remove();
    URL.revokeObjectURL(url);
    this.toast("Export erfolgreich", "success");
  },

  importAll(obj) {
    const ToniDB = getToniDB();
    try {
      ToniDB.importAll(obj);
      this._loadPlayersWithFormation();
      this.toast("Import erfolgreich", "success");
      this._pushHistory();
    } catch (e) {
      this.toast("Import fehlgeschlagen", "error");
    }
  },

  // ----------------------------------------
  // Analyse-Hooks
  // ----------------------------------------
  _setupDBListeners() {
    const ToniEvents = getToniEvents();
    ToniEvents.on("positions:changed", () => {
      ToniEvents.emit("analysis:update", {
        players: getToniDB().getPlayers(),
        positions: getToniDB().getPositions()
      });
    });
    ToniEvents.on("players:changed", () => {
      ToniEvents.emit("analysis:update", {
        players: getToniDB().getPlayers(),
        positions: getToniDB().getPositions()
      });
    });
  },

  // ----------------------------------------
  // KI-Events
  // ----------------------------------------
  _setupAIListeners() {
    const ToniEvents = getToniEvents();
    ToniEvents.on("ai:move", (payload) => {
      const dir = payload?.direction;
      if (!dir) return;
      this._applyFormationShift(dir);
    });
  },

  _applyFormationShift(direction) {
    const dpr = window.devicePixelRatio || 1;
    const w = this.canvas.width / dpr;
    const h = this.canvas.height / dpr;

    const shift = {
      forward: { dx: w * 0.03, dy: 0 },
      back: { dx: -w * 0.03, dy: 0 },
      left: { dx: 0, dy: -h * 0.03 },
      right: { dx: 0, dy: h * 0.03 }
    }[direction];

    if (!shift) return;

    this.animationTargets = {};
    this.animating = true;

    for (const id in this.players) {
      const p = this.players[id];
      let factor = 1;
      if (p.line === "keeper") factor = 0.3;
      if (p.line === "bench") factor = 0;

      this.animationTargets[id] = {
        x: p.x + shift.dx * factor,
        y: p.y + shift.dy * factor
      };
    }
  },

  // ----------------------------------------
  // Render
  // ----------------------------------------
  _render() {
    this._updateAnimation();
    this._drawField();
    this._drawPlayers();
    requestAnimationFrame(() => this._render());
  },

  _updateAnimation() {
    if (!this.animating) return;
    let moving = false;

    for (const id in this.animationTargets) {
      const t = this.animationTargets[id];
      const p = this.players[id];
      const dx = t.x - p.x;
      const dy = t.y - p.y;
      const dist = Math.sqrt(dx * dx + dy * dy);

      if (dist < 1) {
        p.x = t.x;
        p.y = t.y;
        continue;
      }

      p.x += dx * 0.15;
      p.y += dy * 0.15;
      moving = true;
    }

    if (!moving) {
      this.animating = false;
      this.animationTargets = {};
    }
  },

  _drawField() {
    const ctx = this.ctx;
    const dpr = window.devicePixelRatio || 1;
    const w = this.canvas.width / dpr;
    const h = this.canvas.height / dpr;

    ctx.save();
    ctx.fillStyle = "#0b5e20";
    ctx.fillRect(0, 0, w, h);

    ctx.strokeStyle = "white";
    ctx.lineWidth = 3;

    ctx.strokeRect(20, 20, w - 40, h - 40);

    ctx.beginPath();
    ctx.moveTo(w / 2, 20);
    ctx.lineTo(w / 2, h - 20);
    ctx.stroke();

    ctx.beginPath();
    ctx.arc(w / 2, h / 2, 80, 0, Math.PI * 2);
    ctx.stroke();

    ctx.strokeRect(20, h / 2 - 100, 120, 200);
    ctx.strokeRect(w - 140, h / 2 - 100, 120, 200);

    ctx.strokeRect(20, h / 2 - 40, 60, 80);
    ctx.strokeRect(w - 80, h / 2 - 40, 60, 80);
    ctx.restore();
  },

  _drawPlayers() {
    const ctx = this.ctx;

    for (const id in this.players) {
      const p = this.players[id];

      ctx.beginPath();
      ctx.fillStyle = p.color === "red" ? "#ff4444" : "#448aff";
      ctx.arc(p.x, p.y, 20, 0, Math.PI * 2);
      ctx.fill();

      if (id === this.selectedPlayer) {
        ctx.strokeStyle = "#ffd700";
        ctx.lineWidth = 4;
        ctx.stroke();
      } else if (p.line === "keeper") {
        ctx.strokeStyle = "#ffd700";
        ctx.lineWidth = 2;
        ctx.stroke();
      }

      ctx.fillStyle = "white";
      ctx.font = "12px Arial";
      ctx.textAlign = "center";
      ctx.fillText(id, p.x, p.y + 4);
    }
  },

 // ----------------------------------------
  // Utils
  // ----------------------------------------
  _findPlayerAt(mx, my) {
    // größere Hitbox für Touch
    const HIT = 28;
    for (const id in this.players) {
      const p = this.players[id];
      const dx = mx - p.x;
      const dy = my - p.y;
      if (dx * dx + dy * dy < HIT * HIT) return id;
    }
    return null;
  },

  toast(msg, type = "info") {
    if (!window.showToast) {
      console.log("[TOAST]", msg);
      return;
    }
    window.showToast(msg, type);
  },

  setTool(toolName) {
    this.currentTool = toolName;
    this.toast(`Tool: ${toolName}`, "info");
  },

  reset() {
    const ToniDB = getToniDB();
    ToniDB.clearPositions();
    this._loadPlayersWithFormation();
    this._pushHistory();
    this.toast("Reset durchgeführt", "info");
  },

  setField(fieldKey) {
    const wrapper = document.getElementById("arena-field-wrapper");
    if (wrapper) wrapper.dataset.field = fieldKey;
    this.toast(`Feld geändert: ${fieldKey}`, "info");
  }
};

// global machen
window.arena = arena;
