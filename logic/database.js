// ============================================
// TONI 2.0 – DATABASE CORE
// Persistente Speicherung aller Systemdaten
// ============================================

export const ToniDB = {
    KEY: "TONI2_DB",

    data: {
        squad: {
            home: {
                starters: [],   // 11 Spieler
                bench: []       // 5 Spieler
            },
            away: {
                starters: []    // 11 Gegner
            }
        },

        playerData: {}, // FIFA-Karten, Ratings, Vitaldaten

        positions: {},  // Spielfeld-Koordinaten aller Spieler

        templates: [],  // Matchday-Programm Muster

        settings: {
            gateway: "unknown",
            voiceEnabled: false
        }
    },

    // ----------------------------------------
    // Initialisierung
    // ----------------------------------------
    init() {
        const saved = localStorage.getItem(this.KEY);

        if (saved) {
            try {
                this.data = JSON.parse(saved);
                console.log("%c[TONI 2.0] DB geladen", "color:#00ff88");
                return;
            } catch (e) {
                console.error("[DB] Fehler beim Laden, erstelle neue DB", e);
            }
        }

        this._createDefaultData();
        this.save();
        console.log("%c[TONI 2.0] Neue DB erstellt", "color:#00aaff");
    },

    // ----------------------------------------
    // Standard-Daten erzeugen
    // ----------------------------------------
    _createDefaultData() {
        // 11 Heimspieler + 5 Bankspieler
        this.data.squad.home.starters = this._generatePlayers("H", 11);
        this.data.squad.home.bench = this._generatePlayers("HB", 5);

        // 11 Gegner
        this.data.squad.away.starters = this._generatePlayers("A", 11);

        // FIFA-Karten + Vitaldaten + Ratings
        [...this.data.squad.home.starters,
         ...this.data.squad.home.bench,
         ...this.data.squad.away.starters].forEach(id => {
            this.data.playerData[id] = this._generatePlayerData(id);
        });
    },

    // ----------------------------------------
    // Spieler-IDs generieren
    // ----------------------------------------
    _generatePlayers(prefix, count) {
        const arr = [];
        for (let i = 1; i <= count; i++) {
            arr.push(prefix + i);
        }
        return arr;
    },

    // ----------------------------------------
    // FIFA-Karten + Vitaldaten generieren
    // ----------------------------------------
    _generatePlayerData(id) {
        return {
            name: "Spieler " + id,
            number: Math.floor(Math.random() * 30) + 1,
            position: this._randomPosition(),
            rating: Math.floor(Math.random() * 20) + 80, // 80–99
            flag: "de", // später erweiterbar
            available: true,

            vitals: {
                bpm: 70 + Math.floor(Math.random() * 20),
                spo2: 95 + Math.floor(Math.random() * 5)
            }
        };
    },

    _randomPosition() {
        const pos = ["TW", "IV", "IV", "LV", "RV", "ZM", "ZM", "LM", "RM", "ST", "ST"];
        return pos[Math.floor(Math.random() * pos.length)];
    },

    // ----------------------------------------
    // Positionen speichern
    // ----------------------------------------
    savePosition(id, x, y) {
        this.data.positions[id] = { x, y };
        this.save();
    },

    // ----------------------------------------
    // Anwesenheit ändern
    // ----------------------------------------
    setAvailability(id, status) {
        if (this.data.playerData[id]) {
            this.data.playerData[id].available = status;
            this.save();
        }
    },

    // ----------------------------------------
    // Template speichern
    // ----------------------------------------
    saveTemplate(template) {
        this.data.templates.push(template);
        this.save();
    },

    // ----------------------------------------
    // Gateway-Status speichern
    // ----------------------------------------
    setGatewayStatus(status) {
        this.data.settings.gateway = status;
        this.save();
    },

    // ----------------------------------------
    // Speichern in LocalStorage
    // ----------------------------------------
    save() {
        try {
            localStorage.setItem(this.KEY, JSON.stringify(this.data));
        } catch (e) {
            console.error("[DB] Fehler beim Speichern", e);
        }
    }
};

// --------------------------------------------
// Global verfügbar machen
// --------------------------------------------
window.ToniDB = ToniDB;

console.log("%c[TONI 2.0] Database geladen", "color:#00ff88");
