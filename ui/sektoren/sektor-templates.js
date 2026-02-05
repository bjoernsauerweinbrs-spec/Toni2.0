// ============================================
// TONI 2.0 – SEKTOR: MATCHDAY TEMPLATES
// Muster erstellen, bearbeiten, speichern
// ============================================

import { ToniDB } from "../../logic/database.js";

export const SektorTemplates = {
    container: null,

    init(containerId) {
        this.container = document.getElementById(containerId);
        console.log("%c[TONI 2.0] Sektor Templates geladen", "color:#00ff88");
    },

    // ----------------------------------------
    // Render-Funktion
    // ----------------------------------------
    render(target) {
        if (!target) return;

        target.innerHTML = `
            <h2 style="margin-bottom:15px;">Matchday-Programm</h2>

            <button id="new-template-btn" class="template-btn">Neues Muster erstellen</button>

            <h3 style="margin-top:25px;">Gespeicherte Muster</h3>
            <div id="template-list" class="template-list"></div>
        `;

        this._renderTemplateList();

        document.getElementById("new-template-btn")
            .addEventListener("click", () => this._openEditor());
    },

    // ----------------------------------------
    // Liste der Templates anzeigen
    // ----------------------------------------
    _renderTemplateList() {
        const box = document.getElementById("template-list");
        if (!box) return;

        box.innerHTML = "";

        ToniDB.data.templates.forEach((tpl, index) => {
            const row = document.createElement("div");
            row.className = "template-row";

            row.innerHTML = `
                <div class="template-title">${tpl.title}</div>
                <button class="template-edit-btn" data-id="${index}">Bearbeiten</button>
            `;

            box.appendChild(row);
        });

        document.querySelectorAll(".template-edit-btn").forEach(btn => {
            btn.addEventListener("click", () => {
                const id = btn.dataset.id;
                this._openEditor(id);
            });
        });
    },

    // ----------------------------------------
    // Editor öffnen (neu oder bearbeiten)
    // ----------------------------------------
    _openEditor(id = null) {
        const existing = id !== null ? ToniDB.data.templates[id] : null;

        this.container.innerHTML = `
            <h2>${id === null ? "Neues Muster" : "Muster bearbeiten"}</h2>

            <div class="editor-field">
                <label>Titel</label>
                <input id="tpl-title" type="text" value="${existing?.title ?? ""}">
            </div>

            <div class="editor-field">
                <label>Trainer-Vorwort</label>
                <textarea id="tpl-vorwort">${existing?.vorwort ?? ""}</textarea>
            </div>

            <div class="editor-field">
                <label>Taktikanalyse</label>
                <textarea id="tpl-analyse">${existing?.analyse ?? ""}</textarea>
            </div>

            <div class="editor-field">
                <label>Startelf automatisch einfügen</label>
                <button id="insert-startelf" class="template-btn">Einfügen</button>
            </div>

            <textarea id="tpl-content" class="content-box">${existing?.content ?? ""}</textarea>

            <div style="margin-top:20px;">
                <button id="save-template" class="template-btn">Speichern</button>
                <button id="cancel-template" class="template-btn cancel">Abbrechen</button>
            </div>
        `;

        document.getElementById("insert-startelf")
            .addEventListener("click", () => this._insertStartelf());

        document.getElementById("save-template")
            .addEventListener("click", () => this._saveTemplate(id));

        document.getElementById("cancel-template")
            .addEventListener("click", () => this.render(this.container));
    },

    // ----------------------------------------
    // Startelf automatisch einfügen
    // ----------------------------------------
    _insertStartelf() {
        const starters = ToniDB.data.squad.home.starters;
        const players = ToniDB.data.playerData;

        let text = "Startelf:\n";

        starters.forEach(id => {
            const p = players[id];
            text += `- ${p.name} (${p.position})\n`;
        });

        const box = document.getElementById("tpl-content");
        box.value += "\n" + text;
    },

    // ----------------------------------------
    // Template speichern
    // ----------------------------------------
    _saveTemplate(id) {
        const title = document.getElementById("tpl-title").value.trim();
        const vorwort = document.getElementById("tpl-vorwort").value.trim();
        const analyse = document.getElementById("tpl-analyse").value.trim();
        const content = document.getElementById("tpl-content").value.trim();

        if (!title) {
            alert("Titel darf nicht leer sein.");
            return;
        }

        const tpl = { title, vorwort, analyse, content };

        if (id === null) {
            ToniDB.data.templates.push(tpl);
        } else {
            ToniDB.data.templates[id] = tpl;
        }

        ToniDB.save();
        this.render(this.container);
    }
};

// --------------------------------------------
// Global verfügbar machen
// --------------------------------------------
window.SektorTemplates = SektorTemplates;
