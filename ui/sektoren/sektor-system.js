// ============================================
// TONI 2.0 – SEKTOR: SYSTEM
// Gateway-Status, API-Key, Ollama-Setup
// ============================================

import { ToniDB } from "../../logic/database.js";
import { ToniEvents } from "../../logic/event-bus.js";

export const SektorSystem = {
    container: null,

    init(containerId) {
        this.container = document.getElementById(containerId);
        console.log("%c[TONI 2.0] Sektor System geladen", "color:#00ff88");
    },

    // ----------------------------------------
    // Render-Funktion
    // ----------------------------------------
    render(target) {
        if (!target) return;

        const gateway = ToniDB.data.settings.gateway ?? "unknown";

        target.innerHTML = `
            <h2 style="margin-bottom:15px;">System & Einstellungen</h2>

            <h3>Gateway-Status</h3>
            <div class="system-box">
                <p>Aktueller Status: <strong>${gateway.toUpperCase()}</strong></p>
                <button id="refresh-gateway" class="system-btn">Gateway prüfen</button>
            </div>

            <h3 style="margin-top:25px;">OpenAI API-Key</h3>
            <div class="system-box">
                <input id="api-key-input" type="password" placeholder="sk-..." value="${localStorage.getItem("TONI2_APIKEY") ?? ""}">
                <button id="save-api-key" class="system-btn">Speichern</button>
            </div>

            <h3 style="margin-top:25px;">Ollama Setup</h3>
            <div class="system-box">
                <p>Um Ollama lokal zu starten, führe im Terminal aus:</p>
                <pre>OLLAMA_ORIGINS="*" ollama serve</pre>
            </div>
        `;

        this._attachHandlers();
    },

    // ----------------------------------------
    // Buttons aktivieren
    // ----------------------------------------
    _attachHandlers() {
        const refreshBtn = document.getElementById("refresh-gateway");
        const saveKeyBtn = document.getElementById("save-api-key");

        refreshBtn?.addEventListener("click", () => {
            ToniEvents.emit("gateway:check");
            alert("Gateway wird geprüft…");
        });

        saveKeyBtn?.addEventListener("click", () => {
            const key = document.getElementById("api-key-input").value.trim();
            localStorage.setItem("TONI2_APIKEY", key);
            alert("API-Key gespeichert!");
        });
    }
};

// --------------------------------------------
// Global verfügbar machen
// --------------------------------------------
window.SektorSystem = SektorSystem;
