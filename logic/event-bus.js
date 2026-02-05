// ============================================
// TONI 2.0 – EVENT BUS
// Globale, modulübergreifende Kommunikation
// ============================================

export const ToniEvents = {
    _events: {},

    // ----------------------------------------
    // Listener registrieren
    // ----------------------------------------
    on(eventName, callback) {
        if (!this._events[eventName]) {
            this._events[eventName] = [];
        }
        this._events[eventName].push(callback);
    },

    // ----------------------------------------
    // Listener entfernen
    // ----------------------------------------
    off(eventName, callback) {
        if (!this._events[eventName]) return;

        this._events[eventName] = this._events[eventName].filter(
            (cb) => cb !== callback
        );
    },

    // ----------------------------------------
    // Event auslösen
    // ----------------------------------------
    emit(eventName, data = null) {
        if (!this._events[eventName]) return;

        for (const callback of this._events[eventName]) {
            try {
                callback(data);
            } catch (err) {
                console.error(`[EventBus] Fehler im Listener für "${eventName}"`, err);
            }
        }
    }
};

// --------------------------------------------
// Global verfügbar machen
// --------------------------------------------
window.ToniEvents = ToniEvents;

console.log("%c[TONI 2.0] EventBus geladen", "color:#00ff88");
