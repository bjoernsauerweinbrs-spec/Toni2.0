// ============================================
// TONI 2.0 – SEKTOR: SPORTTASCHE
// FIFA-Karten, Anwesenheit, Kaderverwaltung
// ============================================

import { ToniDB } from "../../logic/database.js";
import { ToniEvents } from "../../logic/event-bus.js";

export const SektorSporttasche = {
    container: null,

    init(containerId) {
        this.container = document.getElementById(containerId);
        console.log("%c[TONI 2.0] Sektor Sporttasche geladen", "color:#00ff88");
    },

    // ----------------------------------------
    // Render-Funktion
    // ----------------------------------------
    render(target) {
        if (!target) return;

        target.innerHTML = `
            <h2 style="margin-bottom:15px;">Mannschaftskabine</h2>

            <h3>Startelf (11)</h3>
            <div id="starter-cards" class="card-grid"></div>

            <h3 style="margin-top:25px;">Ersatzbank (5)</h3>
            <div id="bench-cards" class="card-grid"></div>
        `;

        this._renderCards("starter-cards", ToniDB.data.squad.home.starters);
        this._renderCards("bench-cards", ToniDB.data.squad.home.bench);
    },

    // ----------------------------------------
    // Karten rendern
    // ----------------------------------------
    _renderCards(containerId, playerIds) {
        const box = document.getElementById(containerId);
        if (!box) return;

        box.innerHTML = "";

        playerIds.forEach(id => {
            const p = ToniDB.data.playerData[id];
            if (!p) return;

            const card = document.createElement("div");
            card.className = "fifa-card";

            card.innerHTML = `
                <div class="rating">${p.rating}</div>
                <div class="flag">${p.flag.toUpperCase()}</div>
                <div class="name">${p.name}</div>
                <div class="info">
                    <span>Nr. ${p.number}</span>
                    <span>${p.position}</span>
                </div>

                <div class="availability">
                    <label>
                        <input type="checkbox" ${p.available ? "checked" : ""} data-id="${id}">
                        <span>${p.available ? "🟢" : "🔴"}</span>
                    </label>
                </div>
            `;

            box.appendChild(card);
        });

        this._attachAvailabilityHandlers();
    },

    // ----------------------------------------
    // Anwesenheitsschalter
    // ----------------------------------------
    _attachAvailabilityHandlers() {
        const checkboxes = document.querySelectorAll(".availability input");

        checkboxes.forEach(cb => {
            cb.addEventListener("change", () => {
                const id = cb.dataset.id;
                const status = cb.checked;

                ToniDB.setAvailability(id, status);

                // Arena neu rendern (nur anwesende Spieler)
                ToniEvents.emit("squad:changed");

                // Emoji aktualisieren
                cb.nextElementSibling.textContent = status ? "🟢" : "🔴";
            });
        });
    }
};

// --------------------------------------------
// Global verfügbar machen
// --------------------------------------------
window.SektorSporttasche = SektorSporttasche;
