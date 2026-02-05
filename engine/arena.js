// ============================================
// TONI 2.0 – ARENA ENGINE
// Spielfeld, Spieler, Drag & Drop, Rendering
// ============================================

import { ToniEvents } from "../logic/event-bus.js";
import { ToniDB } from "../logic/database.js";

export const arena = {
    canvas: null,
    ctx: null,

    players: {}, // { id: { x, y, color } }

    dragging: null,
    offsetX: 0,
    offsetY: 0,

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

        this._loadPlayers();
        this._setupMouseEvents();

        requestAnimationFrame(() => this._render());
        console.log("%c[TONI 2.0] Arena geladen", "color:#00ff88");
    },

    // ----------------------------------------
    // Canvas an Fenster anpassen
    // ----------------------------------------
    _resizeCanvas() {
        this.canvas.width = this.canvas.clientWidth;
        this.canvas.height = this.canvas.clientHeight;
    },

    // ----------------------------------------
    // Spieler laden (11+5 Heim, 11 Gegner)
    // ----------------------------------------
    _loadPlayers() {
        const homeStarters = ToniDB.data.squad.home.starters;
        const homeBench = ToniDB.data.squad.home.bench;
        const awayStarters = ToniDB.data.squad.away.starters;

        const allPlayers = [
            ...homeStarters.map(id => ({ id, color: "red" })),
            ...homeBench.map(id => ({ id, color: "red" })),
            ...awayStarters.map(id => ({ id, color: "blue" }))
        ];

        allPlayers.forEach((p, index) => {
            const savedPos = ToniDB.data.positions[p.id];

            this.players[p.id] = {
                x: savedPos?.x ?? (100 + (index * 40)),
                y: savedPos?.y ?? (100 + (index * 20)),
                color: p.color
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

            ctx.fillStyle = "white";
            ctx.font = "12px Arial";
            ctx.textAlign = "center";
            ctx.fillText(id, p.x, p.y + 4);
        }
    },

    // ----------------------------------------
    // Render-Loop
    // ----------------------------------------
    _render() {
        this._drawField();
        this._drawPlayers();

        requestAnimationFrame(() => this._render());
    }
};

// --------------------------------------------
// Global verfügbar machen
// --------------------------------------------
window.arena = arena;
