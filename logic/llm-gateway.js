// logic/llm-gateway.js
// ToniGateway: versucht lokale Ollama-Instanz, fällt bei Fehlern auf Cloud-Fallback zurück
// Liefert immer ein normalisiertes Objekt: { text, source, error }
// Zusätzlich: initCheck() beim Script-Load, das gateway:status emittiert.

window.ToniGateway = {
    status: 'unknown', // 'local' | 'cloud' | 'error' | 'unknown'
    _initChecked: false,

    // initial check to determine availability (call on load)
    async initCheck(timeout = 1500) {
        if (this._initChecked) return this.status;
        this._initChecked = true;
        try {
            const controller = new AbortController();
            const id = setTimeout(() => controller.abort(), timeout);

            try {
                const res = await fetch('http://localhost:11434/api/generate', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ model: 'gemma', prompt: 'ping', stream: false }),
                    signal: controller.signal
                });
                clearTimeout(id);
                if (res.ok) {
                    this.status = 'local';
                    console.log('[ToniGateway] initCheck: local reachable');
                } else {
                    this.status = 'unknown';
                    console.warn('[ToniGateway] initCheck: local responded with', res.status);
                }
            } catch (e) {
                clearTimeout(id);
                console.warn('[ToniGateway] initCheck: local unreachable', e && e.name ? e.name : e);
                this.status = 'unknown';
            }
        } catch (e) {
            console.warn('[ToniGateway] initCheck failed', e);
            this.status = 'unknown';
        } finally {
            try { window.ToniEvents.emit('gateway:status', this.status); } catch (e) { /* ignore */ }
            return this.status;
        }
    },

    async ask(prompt) {
        if (!this._initChecked) {
            await this.initCheck();
        }

        try {
            this.status = 'local';
            console.log('[ToniGateway] attempting local Ollama');
            const res = await fetch('http://localhost:11434/api/generate', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ model: 'gemma', prompt: prompt, stream: false })
            });
            if (!res.ok) throw new Error('Ollama HTTP ' + res.status);
            const data = await res.json();
            const text = data?.response || data?.text || (typeof data === 'string' ? data : '');
            console.log('[ToniGateway] local response received');
            return { text: text || '', source: 'local', error: false };
        } catch (localErr) {
            console.warn('[ToniGateway] local Ollama failed:', localErr);
            try {
                this.status = 'cloud';
                console.log('[ToniGateway] attempting cloud fallback');
                const cloudRes = await fetch('/api/openai-proxy', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ prompt })
                });
                if (!cloudRes.ok) throw new Error('Cloud HTTP ' + cloudRes.status);
                const cloudData = await cloudRes.json();
                const text = cloudData?.text || cloudData?.choices?.[0]?.message?.content || cloudData?.choices?.[0]?.text || '';
                console.log('[ToniGateway] cloud response received');
                return { text: text || '', source: 'cloud', error: false };
            } catch (cloudErr) {
                console.error('[ToniGateway] cloud fallback failed:', cloudErr);
                this.status = 'error';
                return { text: 'Toni ist gerade nicht verfügbar.', source: 'none', error: true };
            }
        } finally {
            try {
                if (window.ToniEvents && typeof window.ToniEvents.emit === 'function') {
                    window.ToniEvents.emit('gateway:status', this.status);
                }
            } catch (e) {
                console.warn('[ToniGateway] failed to emit gateway:status', e);
            }
        }
    },

    isAvailable() {
        return this.status !== 'error';
    }
};

// Auto-run initCheck so UI gets immediate status
try { window.ToniGateway.initCheck(); } catch (e) { /* ignore */ }
