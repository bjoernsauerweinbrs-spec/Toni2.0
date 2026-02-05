// ============================================
// TONI 2.0 – TONI CORE (KI-Logik)
// Chat, Trainer-Level, KI-Reports, Befehle
// ============================================

import { ToniEvents } from "./event-bus.js";
import { LLMGateway } from "./llm-gateway.js";
import { ToniDB } from "./database.js";

export const ToniCore = {
    trainerLevel: "auto", // auto / beginner / pro

    // ----------------------------------------
    // Hauptfunktion: Eingaben verarbeiten
    // ----------------------------------------
    async processMessage(text) {
        this._addChatMessage("user", text);

        // 1) Sprachbefehle prüfen
        if (this._isMovementCommand(text)) {
            this._handleMovementCommand(text);
            return;
        }

        if (this._isScoutingRequest(text)) {
            await this._handleScoutingRequest(text);
            return;
        }

        // 2) Normale KI-Antwort
        const answer = await LLMGateway.ask(text);
        this._addChatMessage("toni", answer);
    },

    // ----------------------------------------
    // Chat-Ausgabe
    // ----------------------------------------
    _addChatMessage(sender, text) {
        const box = document.getElementById("chat-messages");
        if (!box) return;

        const div = document.createElement("div");
        div.className = sender === "user" ? "chat-user" : "chat-toni";
        div.textContent = text;

        box.appendChild(div);
        box.scrollTop = box.scrollHeight;
    },

    // ----------------------------------------
    // Trainer-Level erkennen
    // ----------------------------------------
    detectTrainerLevel(text) {
        const beginnerWords = ["einfach", "erklären", "anfänger", "leicht"];
        const proWords = ["pressing", "taktik", "raumdeckung", "gegenpressing", "halbspur"];

        if (beginnerWords.some(w => text.toLowerCase().includes(w))) {
            this.trainerLevel = "beginner";
        } else if (proWords.some(w => text.toLowerCase().includes(w))) {
            this.trainerLevel = "pro";
        }
    },

    // ----------------------------------------
    // Sprachbefehle für KI-Bewegung
    // ----------------------------------------
    _isMovementCommand(text) {
        const keywords = ["verschiebe", "schiebe", "rücke", "bewege", "positioniere"];
        return keywords.some(k => text.toLowerCase().includes(k));
    },

    _handleMovementCommand(text) {
        let direction = null;

        if (text.includes("vor")) direction = "forward";
        if (text.includes("zurück")) direction = "back";
        if (text.includes("links")) direction = "left";
        if (text.includes("rechts")) direction = "right";

        ToniEvents.emit("ai:move", { direction });

        this._addChatMessage("toni", "Alles klar, ich verschiebe die Formation.");
    },

    // ----------------------------------------
    // Scouting-Report
    // ----------------------------------------
    _isScoutingRequest(text) {
        return text.toLowerCase().includes("scouting") ||
               text.toLowerCase().includes("analyse zu") ||
               text.toLowerCase().includes("bericht zu");
    },

    async _handleScoutingRequest(text) {
        const players = ToniDB.data.playerData;

        let target = null;
        for (const id in players) {
            if (text.toLowerCase().includes(players[id].name.toLowerCase())) {
                target = players[id];
                break;
            }
        }

        if (!target) {
            this._addChatMessage("toni", "Welchen Spieler soll ich analysieren?");
            return;
        }

        const prompt = `
Erstelle einen kurzen Scouting-Report für diesen Spieler:

Name: ${target.name}
Position: ${target.position}
Rating: ${target.rating}
BPM: ${target.vitals.bpm}
SpO2: ${target.vitals.spo2}

Gib Stärken, Schwächen und eine Empfehlung.
`;

        const answer = await LLMGateway.ask(prompt);

        this._addChatMessage("toni", answer);

        // Analysezentrum aktualisieren
        window.SektorAnalyse?.showScoutingReport(answer);
    }
};

// --------------------------------------------
// Global verfügbar machen
// --------------------------------------------
window.ToniCore = ToniCore;

// --------------------------------------------
// Gateway-Status anzeigen
// --------------------------------------------
ToniEvents.on("gateway:status", (status) => {
    const el = document.getElementById("status-text");
    if (el) el.textContent = "GATEWAY: " + status.toUpperCase();
});
