// ============================================
// TONI 2.0 – HYBRID LLM GATEWAY
// Ollama (lokal) → OpenAI (Fallback)
// ============================================

import { ToniEvents } from "./event-bus.js";
import { ToniDB } from "./database.js";

export const LLMGateway = {
    // ----------------------------------------
    // Hauptfunktion: Anfrage an KI
    // ----------------------------------------
    async ask(prompt) {
        // 1) Versuche zuerst OLLAMA
        const ollamaResponse = await this._askOllama(prompt);

        if (ollamaResponse) {
            ToniDB.setGatewayStatus("ollama");
            ToniEvents.emit("gateway:status", "ollama");
            return ollamaResponse;
        }

        // 2) Fallback: OPENAI
        const openaiResponse = await this._askOpenAI(prompt);

        if (openaiResponse) {
            ToniDB.setGatewayStatus("openai");
            ToniEvents.emit("gateway:status", "openai");
            return openaiResponse;
        }

        // 3) Beide nicht erreichbar
        ToniDB.setGatewayStatus("offline");
        ToniEvents.emit("gateway:status", "offline");

        return "⚠️ Toni ist momentan offline. Bitte überprüfe dein Gateway.";
    },

    // ----------------------------------------
    // OLLAMA (lokal)
    // ----------------------------------------
    async _askOllama(prompt) {
        try {
            const res = await fetch("http://localhost:11434/api/generate", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    model: "llama3.1",
                    prompt: prompt
                })
            });

            if (!res.ok) return null;

            const text = await res.text();
            return text;
        } catch (e) {
            return null;
        }
    },

    // ----------------------------------------
    // OPENAI (Fallback)
    // ----------------------------------------
    async _askOpenAI(prompt) {
        try {
            const key = localStorage.getItem("TONI2_APIKEY");
            if (!key) return null;

            const res = await fetch("https://api.openai.com/v1/chat/completions", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": "Bearer " + key
                },
                body: JSON.stringify({
                    model: "gpt-4o-mini",
                    messages: [{ role: "user", content: prompt }]
                })
            });

            if (!res.ok) return null;

            const data = await res.json();
            return data.choices?.[0]?.message?.content ?? null;
        } catch (e) {
            return null;
        }
    }
};

// --------------------------------------------
// Global verfügbar machen
// --------------------------------------------
window.LLMGateway = LLMGateway;

// --------------------------------------------
// Gateway-Check Event
// --------------------------------------------
ToniEvents.on("gateway:check", async () => {
    const result = await LLMGateway.ask("Test");
    console.log("[GATEWAY CHECK]", result);
});
