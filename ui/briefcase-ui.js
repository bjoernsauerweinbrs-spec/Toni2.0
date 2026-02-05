// ============================================
// TONI 2.0 – BRIEFCASE UI CONTROLLER
// Öffnet/Schließt die Sektoren (Sporttasche,
// Analyse, Templates, System)
// ============================================

export const BriefcaseUI = {
    overlay: null,
    content: null,
    active: null,

    init() {
        this.overlay = document.getElementById("briefcase-overlay");
        this.content = document.getElementById("active-content");

        if (!this.overlay || !this.content) {
            console.error("[BRIEFCASE] Overlay oder Content nicht gefunden");
            return;
        }

        console.log("%c[TONI 2.0] Briefcase UI geladen", "color:#00ff88");
    },

    // ----------------------------------------
    // Fenster öffnen/schließen
    // ----------------------------------------
    toggle(sector) {
        if (!this.overlay) return;

        // Wenn derselbe Sektor erneut geklickt wird → schließen
        if (this.active === sector) {
            this.close();
            return;
        }

        this.active = sector;
        this.overlay.style.display = "flex";

        this._loadSector(sector);
    },

    close() {
        if (!this.overlay) return;

        this.overlay.style.display = "none";
        this.active = null;

        if (this.content) {
            this.content.innerHTML = "";
        }
    },

    // ----------------------------------------
    // Sektor laden
    // ----------------------------------------
    _loadSector(sector) {
        if (!this.content) return;

        switch (sector) {
            case "sporttasche":
                window.SektorSporttasche?.render(this.content);
                break;

            case "analyse":
                window.SektorAnalyse?.render(this.content);
                break;

            case "templates":
                window.SektorTemplates?.render(this.content);
                break;

            case "system":
                window.SektorSystem?.render(this.content);
                break;

            default:
                this.content.innerHTML = "<p>Unbekannter Sektor.</p>";
        }
    }
};

// --------------------------------------------
// Global verfügbar machen
// --------------------------------------------
window.BriefcaseUI = BriefcaseUI;

// Automatisch initialisieren
setTimeout(() => BriefcaseUI.init(), 50);
