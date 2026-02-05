// ============================================
// TONI 2.0 – SEKTOR: ANALYSEZENTRUM
// Vitaldaten, Bewertungen, KI-Reports
// ============================================

import { ToniDB } from "../../logic/database.js";
import { ToniEvents } from "../../logic/event-bus.js";

export const SektorAnalyse = {
    container: null,
    interval: null,

    init(containerId) {
        this.container = document.getElementById(containerId);
        console.log("%c[TONI 2.0] Sektor Analyse geladen", "color:#00ff88");
    },

    // ----------------------------------------
    // Render-Funktion
    // ----------------------------------------
    render(target) {
        if (!target) return;

        target.innerHTML = `
            <h2 style="margin-bottom:15px;">Analysezentrum</h2>

            <h3>Vitaldaten</h3>
            <div id="vital-list" class="vital-grid"></div>

            <h3 style="margin-top:25px;">Bewertungen</h3>
            <div id="rating-list" class="rating-grid"></div>

            <h3 style="margin-top:25px;">Scouting-Report</h3>
            <div id="scouting-report" class="scouting-box">
                <p>Wähle einen Spieler aus, um den KI-Report zu sehen.</p>
            </div>
        `;

        this._renderVitals();
        this._renderRatings();
        this._startVitalSimulation();
    },

    // ----------------------------------------
    // Vitaldaten anzeigen
    // ----------------------------------------
    _renderVitals() {
        const box = document.getElementById("vital-list");
        if (!box) return;

        box.innerHTML = "";

        const players = ToniDB.data.playerData;

        Object.keys(players).forEach(id => {
            const p = players[id];

            const row = document.createElement("div");
            row.className = "vital-row";

            row.innerHTML = `
                <div class="vital-name">${p.name}</div>
                <div class="vital-values">
                    <span>BPM: <strong>${p.vitals.bpm}</strong></span>
                    <span>SpO2: <strong>${p.vitals.spo2}%</strong></span>
                </div>
            `;

            box.appendChild(row);
        });
    },

    // ----------------------------------------
    // Vitaldaten simulieren (alle 3 Sekunden)
    // ----------------------------------------
    _startVitalSimulation() {
        if (this.interval) clearInterval(this.interval);

        this.interval = setInterval(() => {
            const players = ToniDB.data.playerData;

            Object.keys(players).forEach(id => {
                const p = players[id];

                p.vitals.bpm += (Math.random() * 6 - 3);
                p.vitals.bpm = Math.max(60, Math.min(180, Math.round(p.vitals.bpm)));

                p.vitals.spo2 += (Math.random() * 2 - 1);
                p.vitals.spo2 = Math.max(92, Math.min(100, Math.round(p.vitals.spo2)));
            });

            ToniDB.save();
            this._renderVitals();
        }, 3000);
    },

    // ----------------------------------------
    // Bewertungssystem
    // ----------------------------------------
    _renderRatings() {
        const box = document.getElementById("rating-list");
        if (!box) return;

        box.innerHTML = "";

        const players = ToniDB.data.playerData;

        Object.keys(players).forEach(id => {
            const p = players[id];

            const row = document.createElement("div");
            row.className = "rating-row";

            row.innerHTML = `
                <div class="rating-name">${p.name}</div>
                <div class="rating-input">
                    <input type="number" min="1" max="10" value="${p.ratingValue ?? ""}" data-id="${id}">
                </div>
                <button class="rating-btn" data-id="${id}">Speichern</button>
            `;

            box.appendChild(row);
        });

        this._attachRatingHandlers();
    },

    _attachRatingHandlers() {
        const buttons = document.querySelectorAll(".rating-btn");

        buttons.forEach(btn => {
            btn.addEventListener("click", () => {
                const id = btn.dataset.id;
                const input = document.querySelector(`input[data-id="${id}"]`);
                const value = Number(input.value);

                if (value < 1 || value > 10) return;

                ToniDB.data.playerData[id].ratingValue = value;
                ToniDB.save();

                alert("Bewertung gespeichert!");
            });
        });
    },

    // ----------------------------------------
    // KI-Scouting-Report (wird später von ToniCore befüllt)
    // ----------------------------------------
    showScoutingReport(text) {
        const box = document.getElementById("scouting-report");
        if (!box) return;

        box.innerHTML = `<p>${text}</p>`;
    }
};

// --------------------------------------------
// Global verfügbar machen
// --------------------------------------------
window.SektorAnalyse = SektorAnalyse;
