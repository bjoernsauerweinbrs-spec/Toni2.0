// logic/status-manager.js
// Status Manager: verbindet Gateway-Status und DB-Events mit der UI-Statusleiste

(function () {
    const updateStatusText = (text, color) => {
        const el = document.getElementById('status-text');
        if (!el) return;
        el.innerText = text;
        if (color) el.style.color = color;
    };

    const syncInitial = () => {
        if (window.ToniGateway && window.ToniGateway.status) {
            updateStatusText('GATEWAY: ' + window.ToniGateway.status.toUpperCase(), 'var(--neon-green)');
        } else {
            updateStatusText('BEREIT', 'var(--neon-green)');
        }
    };

    try {
        if (window.ToniEvents && typeof window.ToniEvents.on === 'function') {
            window.ToniEvents.on('gateway:status', (s) => {
                const st = (s || 'unknown').toString().toUpperCase();
                const color = s === 'error' ? 'var(--status-error)' : 'var(--neon-green)';
                updateStatusText('GATEWAY: ' + st, color);
                console.log('[StatusManager] gateway:status ->', s);
            });

            window.ToniEvents.on('players:updated', (players) => {
                const count = Array.isArray(players) ? players.length : (window.ToniDB ? window.ToniDB.getPlayers().length : 0);
                const gateway = window.ToniGateway && window.ToniGateway.status ? 'GATEWAY: ' + window.ToniGateway.status.toUpperCase() : null;
                if (!gateway) updateStatusText(`SPIELER: ${count}`, 'var(--neon-green)');
            });
        }
    } catch (e) {
        console.warn('[StatusManager] subscription failed', e);
    }

    window.ToniStatusManager = { syncInitial, updateStatusText };
    try { syncInitial(); } catch (e) { /* ignore */ }
})();
