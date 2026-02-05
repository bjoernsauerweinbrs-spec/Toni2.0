// logic/database.js
// ToniDB: lokale Spielerverwaltung mit Seed + reaktiver Emit-Logik

window.ToniDB = {
    init() {
        try {
            if (!localStorage.getItem('toni_players')) {
                const seed = [
                    { id: 'p1', name: 'Manuel Neuer', nr: 1, pos: 'TW', team: 'home', isStarter: true, isPresent: true, rat: 89, vitals: { pulse: 70, spo2: 98 } },
                    { id: 'p2', name: 'Kylian Mbappé', nr: 7, pos: 'ST', team: 'home', isStarter: true, isPresent: true, rat: 92, vitals: { pulse: 72, spo2: 98 } },
                    { id: 'p3', name: 'Virgil van Dijk', nr: 4, pos: 'IV', team: 'home', isStarter: true, isPresent: true, rat: 90, vitals: { pulse: 68, spo2: 99 } },
                    { id: 'opp1', name: 'Gegner 1', nr: 1, pos: 'TW', team: 'away', isStarter: true, isPresent: true, rat: 80, vitals: { pulse: 75, spo2: 97 } },
                    { id: 'opp2', name: 'Gegner 2', nr: 9, pos: 'ST', team: 'away', isStarter: true, isPresent: true, rat: 82, vitals: { pulse: 76, spo2: 97 } }
                ];
                localStorage.setItem('toni_players', JSON.stringify(seed));
                console.log('[ToniDB] Seed players created');
            }
        } catch (e) {
            console.error('[ToniDB] init seed error', e);
        }

        // Emit initial state so all subscribers can sync immediately
        try {
            const players = this.getPlayers();
            window.ToniEvents.emit('players:updated', players);
            console.log('[ToniDB] players:updated emitted (init)');
        } catch (e) {
            console.error('[ToniDB] emit failed', e);
        }
    },

    getPlayers() {
        try {
            const raw = localStorage.getItem('toni_players');
            return raw ? JSON.parse(raw) : [];
        } catch (e) {
            console.error('[ToniDB] getPlayers parse error', e);
            return [];
        }
    },

    savePlayers(players) {
        try {
            localStorage.setItem('toni_players', JSON.stringify(players));
            window.ToniEvents.emit('players:updated', players);
            console.log('[ToniDB] players saved and emitted');
        } catch (e) {
            console.error('[ToniDB] savePlayers error', e);
        }
    },

    updatePlayer(id, patch) {
        try {
            const players = this.getPlayers();
            const idx = players.findIndex(p => p.id === id);
            if (idx !== -1) {
                players[idx] = { ...players[idx], ...patch };
                this.savePlayers(players);
                console.log('[ToniDB] player updated', id, patch);
            } else {
                console.warn('[ToniDB] updatePlayer: id not found', id);
            }
        } catch (e) {
            console.error('[ToniDB] updatePlayer error', e);
        }
    },

    addPlayer(player) {
        try {
            const players = this.getPlayers();
            players.push(player);
            this.savePlayers(players);
            console.log('[ToniDB] player added', player.id);
        } catch (e) {
            console.error('[ToniDB] addPlayer error', e);
        }
    },

    removePlayer(id) {
        try {
            let players = this.getPlayers();
            players = players.filter(p => p.id !== id);
            this.savePlayers(players);
            console.log('[ToniDB] player removed', id);
        } catch (e) {
            console.error('[ToniDB] removePlayer error', e);
        }
    }
};
