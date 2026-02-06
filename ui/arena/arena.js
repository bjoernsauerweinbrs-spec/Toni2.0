// ============================================
// TONI 2.0 – ARENA ENGINE (Teil 1/4)
// Modern, robust, mit Guards gegen Auto-Open,
// Long-Press, Drag, Undo/Redo, ToniDB-Integration
// ============================================

// Lokale Fallbacks (sicher, falls ToniEvents/ToniDB fehlen)
const _fallbackToniEvents = {
  on: () => {},
  emit: () => {}
};
const _fallbackToniDB = {
  data: { squad: {}, positions: {}, players: {} },
  savePosition: () => {},
  getPositions: () => ({}),
  setPositions: () => {},
  getPlayers: () => ({}),
  getPlayer: () => null,
  getPosition: () => null,
  setPlayer: () => {},
  setPlayers: () => {},
  snapshot: () => "{}",
  restoreFromSnapshot: () => false,
  exportAll: () => ({}),
  importAll: () => false,
  clearPositions: () => {}
};

function getToniEvents() {
  return window.ToniEvents || _fallbackToniEvents;
}
function getToniDB() {
  return window.ToniDB || _fallbackToniDB;
}

const arena = {
  // Canvas + Context
  canvas: null,
  ctx: null,

  // Spieler-Daten
  players: {}, // { id: { x,y,color,line } }
  selectedPlayer: null,

  // Dragging
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
      console.error("[ARENA] Canvas nicht gefunden:", canvasId);
      return;
    }

    this.ctx = this.canvas.getContext("2d");

    this._resizeCanvas();
    window.addEventListener("resize", () => this._resizeCanvas());

    // Lade Spieler/Formation aus ToniDB
    this._loadPlayersWithFormation();

    // Pointer / Touch Events
    this._setupPointerEvents();

    // KI / DB Listener
    this._setupAIListeners();
    this._setupDBListeners();

    // Start Render Loop
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
  // Formation laden (Positionen aus ToniDB oder Default-Formation)
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
      const saved = ToniDB.getPosition ? ToniDB.getPosition(id) : null;
      const f = formationHome[i] || { x: 0.5, y: 0.5, line: "midfield" };
      this.players[id] = {
        x: saved?.x ?? f.x * w,
        y: saved?.y ?? f.y * h,
        color: "red",
        line: f.line
      };
    });

    homeBench.forEach((id, i) => {
      const saved = ToniDB.getPosition ? ToniDB.getPosition(id) : null;
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
      const saved = ToniDB.getPosition ? ToniDB.getPosition(id) : null;
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
    clearTimeout(this.longPressTimer);
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

    const p = this.players[this.dragging];
    if (!p) return;

    const newX = mx - this.offsetX;
    const newY = my - this.offsetY;

    // Bewegung erkannt
    const dx = newX - p.x;
    const dy = newY - p.y;
    if (Math.abs(dx) > 3 || Math.abs(dy) > 3) {
      this.dragMoved = true;
      clearTimeout(this.longPressTimer);
    }

    p.x = newX;
    p.y = newY;

    // Persistente Speicherung der Position (leicht throttlen falls nötig)
    try {
      const ToniDB = getToniDB();
      if (ToniDB.savePosition) ToniDB.savePosition(this.dragging, p.x, p.y);
    } catch (err) {
      console.warn("[ARENA] savePosition failed", err);
    }
  },

  _onPointerUp(e) {
    clearTimeout(this.longPressTimer);

    if (!this.dragging) return;

    if (!this.dragMoved && !this.longPressActive) {
      // kurzer Klick -> Auswahl
      this._selectPlayer(this.dragging);
    }

    if (this.dragMoved) {
      this._pushHistory();
    }

    this.dragging = null;
    this.dragMoved = false;
    this.longPressActive = false;
  },

  // ----------------------------------------
  // Auswahl
  // ----------------------------------------
  _selectPlayer(id) {
    this.selectedPlayer = id;
    this.toast(`Spieler ${id} ausgewählt`, "info");
  },

  // ----------------------------------------
  // PlayerCard öffnen (Long-Press)
  // ----------------------------------------
  _openPlayerCard(id) {
    // Schutz: niemals ohne gültige ID öffnen
    if (!id || (typeof id !== "string" && typeof id !== "number")) return;

    const ToniDB = getToniDB();
    const player = (ToniDB.getPlayer && ToniDB.getPlayer(id)) || { id };

    if (window.openPlayerCardModal) {
      try {
        window.openPlayerCardModal(player);
      } catch (err) {
        console.error("[ARENA] openPlayerCardModal failed", err);
      }
    } else {
      console.warn("[ARENA] openPlayerCardModal not defined");
    }
  },

  // Save aus PlayerCard
  savePlayerCard(data) {
    if (!data || !data.id) {
      this.toast("Kein Spieler zum Speichern angegeben", "error");
      return;
    }

    try {
      const ToniDB = getToniDB();
      if (ToniDB.setPlayer) {
        ToniDB.setPlayer(data.id, data);
      } else {
        console.warn("[ARENA] ToniDB.setPlayer nicht vorhanden");
      }
      this.toast("Spieler gespeichert", "success");
      this._pushHistory();
    } catch (err) {
      console.error("[ARENA] savePlayerCard error", err);
      this.toast("Speichern fehlgeschlagen", "error");
    }
  },

  // ----------------------------------------
  // Undo / Redo (History)
  // ----------------------------------------
  _pushHistory() {
    try {
      const ToniDB = getToniDB();
      const snap = ToniDB.snapshot ? ToniDB.snapshot() : JSON.stringify(ToniDB.data || {});
      this.history.past.push(snap);
      // Begrenze History-Größe
      if (this.history.past.length > 50) this.history.past.shift();
      this.history.future = [];
    } catch (err) {
      console.warn("[ARENA] _pushHistory failed", err);
    }
  },

  undo() {
    if (!this.history.past.length) {
      this.toast("Nichts zum Rückgängig machen", "info");
      return;
    }
    try {
      const ToniDB = getToniDB();
      const current = ToniDB.snapshot ? ToniDB.snapshot() : JSON.stringify(ToniDB.data || {});
      this.history.future.push(current);

      const prev = this.history.past.pop();
      if (ToniDB.restoreFromSnapshot) {
        ToniDB.restoreFromSnapshot(prev);
      } else {
        console.warn("[ARENA] restoreFromSnapshot nicht vorhanden");
      }
      this._loadPlayersWithFormation();
      this.toast("Undo", "info");
    } catch (err) {
      console.error("[ARENA] undo failed", err);
      this.toast("Undo fehlgeschlagen", "error");
    }
  },

  redo() {
    if (!this.history.future.length) {
      this.toast("Nichts zum Wiederherstellen", "info");
      return;
    }
    try {
      const ToniDB = getToniDB();
      const current = ToniDB.snapshot ? ToniDB.snapshot() : JSON.stringify(ToniDB.data || {});
      this.history.past.push(current);

      const next = this.history.future.pop();
      if (ToniDB.restoreFromSnapshot) {
        ToniDB.restoreFromSnapshot(next);
      } else {
        console.warn("[ARENA] restoreFromSnapshot nicht vorhanden");
      }
      this._loadPlayersWithFormation();
      this.toast("Redo", "info");
    } catch (err) {
      console.error("[ARENA] redo failed", err);
      this.toast("Redo fehlgeschlagen", "error");
    }
  },
  
  },
