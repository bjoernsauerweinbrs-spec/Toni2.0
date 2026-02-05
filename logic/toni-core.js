// logic/toni-core.js
// ToniCore: zentrale Verarbeitungs‑ und UI‑Schicht für Chat/Commands, Status und TTS

window.ToniCore = {
    async processMessage(text) {
        try {
            this.updateStatus("DENKT NACH...", "var(--accent-gold)");
            const response = await window.ToniGateway.ask(text);

            if (!response || response.error) {
                this.addChatMessage("Toni", "Systemfehler in der Denk‑Einheit.");
                console.error('[ToniCore] gateway error or no response', response);
                return;
            }

            const reply = response.text || '';
            this.addChatMessage("Toni", reply);

            try {
                const tacticalMatch = reply.match(/\{[\s\S]*"tacticalMove"[\s\S]*\}/);
                if (tacticalMatch) {
                    const json = JSON.parse(tacticalMatch[0]);
                    if (json.tacticalMove && window.arena && typeof window.arena.execute === 'function') {
                        window.arena.execute(json.tacticalMove);
                        console.log('[ToniCore] executed tacticalMove', json.tacticalMove);
                    }
                }
            } catch (e) {
                console.warn('[ToniCore] tacticalMove parse/execute failed', e);
            }

            if (window.ToniTTS && typeof window.ToniTTS.speak === 'function') {
                try { window.ToniTTS.speak(reply); } catch (e) { console.warn('[ToniCore] TTS speak failed', e); }
            }
        } catch (e) {
            console.error('[ToniCore] processMessage failed', e);
            this.addChatMessage("Toni", "Interner Fehler beim Verarbeiten der Anfrage.");
        } finally {
            this.updateStatus("BEREIT", "var(--neon-green)");
        }
    },

    addChatMessage(sender, msg) {
        const box = document.getElementById('chat-messages');
        if (!box) return;
        const div = document.createElement('div');
        div.className = 'chat-line';
        div.innerHTML = `<b>${sender}:</b> ${this._escapeHtml(String(msg))}`;
        box.appendChild(div);
        box.scrollTop = box.scrollHeight;
    },

    updateStatus(text, color) {
        const el = document.getElementById('status-text');
        if (el) {
            el.innerText = text;
            if (color) el.style.color = color;
        }
    },

    _escapeHtml(str) {
        return str.replace(/[&<>"'`=\/]/g, function (s) {
            return ({
                '&': '&amp;',
                '<': '&lt;',
                '>': '&gt;',
                '"': '&quot;',
                "'": '&#39;',
                '/': '&#x2F;',
                '`': '&#x60;',
                '=': '&#x3D;'
            })[s];
        });
    }
};
