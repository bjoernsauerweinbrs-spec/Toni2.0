// ============================================
// TONI 2.0 – ARENA ENGINE (4-4-2 + KI-Bewegung)
// Spielfeld, Spieler, Drag & Drop, Gruppen,
// KI-Formation-Movement
// ============================================

// Statt ES-Modulen greifen wir auf globale Objekte zu.
// Wenn ToniEvents / ToniDB noch nicht existieren, legen wir harmlose Platzhalter an,
// damit die Arena trotzdem läuft und nichts crasht.

const ToniEvents = window.ToniEvents || {
  on: () => {}
};

const ToniDB = window.ToniDB || {
  data: {
    squad: {
      home: { starters: [], bench: [] },
      away: { starters: [] }
    },
    positions: {}
  },
  savePosition: () => {}
};

const arena = {
  canvas: null,
  ctx: null,

  players: {},      // { id: { x, y, color, role, line } }
  dragging: null,
  offsetX: 0,
  offsetY: 0,

  animating: false,
  animationTargets: {}, // { id: { x, y } }

  // ----------------------------------------
  // Initialisierung
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
    this._setupMouseEvents();
    this._setupAIListeners();

    requestAnimationFrame(() => this._render());
    console.log("%c[TONI 2.0] Arena (4-4-2) geladen", "color:#00ff88");
  },

  // ----------------------------------------
  // Canvas an Fenster anpassen
  // ----------------------------------------
  _resizeCanvas() {
    this.canvas.width = this.canvas.clientWidth;
    this.canvas.height = this.canvas.clientHeight;
  },

  // ----------------------------------------
  // Spieler mit 4-4-2-Formation laden
  // ----------------------------------------
  _loadPlayersWithFormation() {
    const homeStarters = ToniDB.data.squad.home.starters;
    const homeBench = ToniDB.data.squad.home.bench;
    const awayStarters = ToniDB.data.squad.away.starters;

    const w = this.canvas.width;
    const h = this.canvas.height;

    const formationHome = [
      { line: "keeper",  x: 0.10, y: 0.50 }, // TW
      { line: "defense", x: 0.25, y: 0.20 }, // RV
      { line: "defense", x: 0.25, y: 0.40 }, // IV rechts
      { line: "defense", x: 0.25, y: 0.60 }, // IV links
      { line: "defense", x: 0.25, y: 0.80 }, // LV
      { line: "midfield", x: 0.45, y: 0.20 }, // RM
      { line: "midfield", x: 0.45, y: 0.40 }, // ZM rechts
      { line: "midfield", x: 0.45, y: 0.60 }, // ZM links
      { line: "midfield", x: 0.45, y: 0.80 }, // LM
      { line: "attack", x: 0.65, y: 0.35 }, // ST rechts
      { line: "attack", x: 0.65, y: 0.65 }  // ST links
    ];

    const formationAway = [
      { line: "attack",   x: 0.90, y: 0.50 },
      { line: "midfield", x: 0.75, y: 0.20 },
      { line: "midfield", x: 0.75, y: 0.40 },
      { line: "midfield", x: 0.75, y: 0.60 },
      { line: "midfield", x: 0.75, y: 0.80 },
      { line: "defense",  x: 0.55, y: 0.20 },
      { line: "defense",  x: 0.55, y: 0.40 },
      { line: "defense",  x: 0.55, y: 0.60 },
      { line: "defense",  x: 0.55, y: 0.80 },
      { line: "keeper",   x: 0.80, y: 0.50 },
      { line: "attack",   x: 0.88, y: 0.30 }
    ];

    // Heim: 11 Startspieler
    homeStarters.forEach((id, index) => {
      const savedPos = ToniDB.data.positions[id];
      const f = formationHome[index] ?? { line: "midfield", x: 0.5, y: 0.5 };

      const baseX = f.x * w;
      const baseY = f.y * h;

      this.players[id] = {
        x: savedPos?.x ?? baseX,
        y: savedPos?.y ?? baseY,
        color: "red",
        line: f.line
      };
    });

    // Bank: rechts unten parken
    homeBench.forEach((id, index) => {
      const savedPos = ToniDB.data.positions[id];
      const baseX = 0.10 * w;
      const baseY = (0.10 + index * 0.07) * h;

      this.players[id] = {
        x: savedPos?.x ?? baseX,
        y: savedPos?.y ?? baseY,
        color: "red",
        line: "bench"
      };
    });

    // Gegner: 11 Spieler
    awayStarters.forEach((id, index) => {
      const savedPos = ToniDB.data.positions[id];
      const f = formationAway[index] ?? { line: "midfield", x: 0.7, y: 0.5 };

      const baseX = f.x * w;
      const baseY = f.y * h;

      this.players[id] = {
        x: savedPos?.x ?? baseX,
        y: savedPos?.y ?? baseY,
        color: "blue",
        line: f.line
      };
    });
  },

  // ----------------------------------------
  // Maus-Events für Drag & Drop
  // ----------------------------------------
  _setupMouseEvents() {
    this.canvas.addEventListener("mousedown", (e) => this._onDown(e));
    this.canvas.addEventListener("mousemove", (e) => this._onMove(e));
    this.canvas.addEventListener("mouseup", () => this._onUp());
    this.canvas.addEventListener("mouseleave", () => this._onUp());
  },

  _onDown(e) {
    const rect = this.canvas.getBoundingClientRect();
    const mx = e.clientX - rect.left;
    const my = e.clientY - rect.top;

    for (const id in this.players) {
      const p = this.players[id];
      const dx = mx - p.x;
      const dy = my - p.y;

      if (dx * dx + dy * dy < 20 * 20) {
        this.dragging = id;
        this.offsetX = dx;
        this.offsetY = dy;
        return;
      }
    }
  },

  _onMove(e) {
    if (!this.dragging) return;

    const rect = this.canvas.getBoundingClientRect();
    const mx = e.clientX - rect.left;
    const my = e.clientY - rect.top;

    this.players[this.dragging].x = mx - this.offsetX;
    this.players[this.dragging].y = my - this.offsetY;

    ToniDB.savePosition(this.dragging, mx - this.offsetX, my - this.offsetY);
  },

  _onUp() {
    this.dragging = null;
  },

  // ----------------------------------------
  // KI-Events aus ToniCore
  // ----------------------------------------
  _setupAIListeners() {
    ToniEvents.on("ai:move", (payload) => {
      const direction = payload?.direction ?? null;
      if (!direction) return;

      this._applyFormationShift(direction);
    });
  },

  // ----------------------------------------
  // Formation verschieben (KI-Bewegung)
  // ----------------------------------------
  _applyFormationShift(direction) {
    const w = this.canvas.width;
    const h = this.canvas.height;

    const shift = {
      forward: { dx: w * 0.03, dy: 0 },
      back:    { dx: -w * 0.03, dy: 0 },
      left:    { dx: 0, dy: -h * 0.03 },
      right:   { dx: 0, dy: h * 0.03 }
    }[direction];

    if (!shift) return;

    this.animationTargets = {};
    this.animating = true;

    for (const id in this.players) {
      const p = this.players[id];

      let factor = 1;
      if (p.line === "keeper") factor = 0.3;
      if (p.line === "bench") factor = 0;

      const targetX = p.x + shift.dx * factor;
      const targetY = p.y + shift.dy * factor;

      this.animationTargets[id] = {
        x: targetX,
        y: targetY
      };
    }
  },

  // ----------------------------------------
  // Spielfeld zeichnen
  // ----------------------------------------
  _drawField() {
    const ctx = this.ctx;
    const w = this.canvas.width;
    const h = this.canvas.height;

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
  },

  // ----------------------------------------
  // Spieler zeichnen
  // ----------------------------------------
  _drawPlayers() {
    const ctx = this.ctx;

    for (const id in this.players) {
      const p = this.players[id];

      ctx.beginPath();
      ctx.fillStyle = p.color === "red" ? "#ff4444" : "#448aff";
      ctx.arc(p.x, p.y, 20, 0, Math.PI * 2);
      ctx.fill();

      if (p.line === "keeper") {
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
  // Animation updaten
  // ----------------------------------------
  _updateAnimation() {
    if (!this.animating) return;

    let stillMoving = false;

    for (const id in this.animationTargets) {
      const target = this.animationTargets[id];
      const p = this.players[id];
      if (!p || !target) continue;

      const dx = target.x - p.x;
      const dy = target.y - p.y;

      const dist = Math.sqrt(dx * dx + dy * dy);
      if (dist < 1) {
        p.x = target.x;
        p.y = target.y;
        continue;
      }

      const step = 0.15;
      p.x += dx * step;
      p.y += dy * step;

      stillMoving = true;
    }

    if (!stillMoving) {
      this.animating = false;
      this.animationTargets = {};
    }
  },

  // ----------------------------------------
  // Render-Loop
  // ----------------------------------------
  _render() {
    this._updateAnimation();
    this._drawField();
    this._drawPlayers();

    requestAnimationFrame(() => this._render());
  }
};

// global machen
window.arena = arena;
