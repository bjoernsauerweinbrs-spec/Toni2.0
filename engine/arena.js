// engine/arena.js
// Arena: Canvas-basiertes Taktik-Board mit DPR-scaling, defensive checks und Event-Subscription

window.arena = {
    canvas: null,
    ctx: null,
    players: [],

    init(id) {
        this.canvas = document.getElementById(id);
        if (!this.canvas) {
            console.error('[Arena] Canvas not found:', id);
            return;
        }

        this.ctx = this.canvas.getContext('2d');
        if (!this.ctx) {
            console.error('[Arena] 2D context not available');
            return;
        }

        // Subscribe to player updates early so we don't miss the initial emit
        if (window.ToniEvents && typeof window.ToniEvents.on === 'function') {
            window.ToniEvents.on('players:updated', (d) => {
                this.players = Array.isArray(d) ? d : [];
                this.render();
            });
        }

        // Initial snapshot from DB
        try {
            this.players = window.ToniDB && typeof window.ToniDB.getPlayers === 'function'
                ? window.ToniDB.getPlayers()
                : [];
        } catch (e) {
            console.error('[Arena] initial getPlayers failed', e);
            this.players = [];
        }

        // Setup sizing and listeners
        this.resize();
        window.addEventListener('resize', () => this.resize());

        // Initial render
        this.render();
        console.log('[Arena] initialized with', this.players.length, 'players');
    },

    resize() {
        if (!this.canvas || !this.ctx) return;

        const parent = this.canvas.parentElement || document.body;
        const width = parent.clientWidth || window.innerWidth;
        const height = parent.clientHeight || Math.max(window.innerHeight * 0.6, 400);

        // CSS size
        this.canvas.style.width = width + 'px';
        this.canvas.style.height = height + 'px';

        // Backing store size for crisp rendering on high-DPI displays
        const dpr = window.devicePixelRatio || 1;
        this.canvas.width = Math.floor(width * dpr);
        this.canvas.height = Math.floor(height * dpr);

        // Reset transform so drawing coordinates map to CSS pixels
        this.ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

        // Re-render after resize
        this.render();
    },

    render() {
        if (!this.ctx || !this.canvas) return;

        const ctx = this.ctx;
        const w = this.canvas.clientWidth;
        const h = this.canvas.clientHeight;

        // Clear
        ctx.clearRect(0, 0, w, h);

        // Background
        ctx.fillStyle = "#051205";
        ctx.fillRect(0, 0, w, h);

        // Pitch outline
        ctx.strokeStyle = "#39FF14";
        ctx.lineWidth = 2;
        const pad = 50;
        ctx.strokeRect(pad, pad, w - pad * 2, h - pad * 2);

        // Middle circle
        ctx.beginPath();
        ctx.arc(w / 2, h / 2, 60, 0, Math.PI * 2);
        ctx.stroke();

        // 16er boxes (example positions)
        ctx.strokeRect(pad, (h / 2) - 130, 120, 260);
        ctx.strokeRect(w - pad - 120, (h / 2) - 130, 120, 260);

        // Draw players grouped by team for stable vertical spacing
        const homePlayers = this.players.filter(p => p.team === 'home');
        const awayPlayers = this.players.filter(p => p.team === 'away');

        const drawTeam = (teamPlayers, isHome) => {
            const baseX = isHome ? 150 : w - 150;
            const maxSpacing = Math.min(60, Math.floor((h - 200) / Math.max(1, teamPlayers.length)));
            teamPlayers.forEach((p, idx) => {
                // allow explicit coordinates if provided
                const x = (typeof p._x === 'number') ? p._x : baseX;
                const y = (typeof p._y === 'number') ? p._y : (100 + idx * maxSpacing);

                // marker
                ctx.beginPath();
                ctx.arc(x, y, 15, 0, Math.PI * 2);
                ctx.fillStyle = isHome ? "#39FF14" : "#3080FF";
                ctx.fill();

                // name (truncate if too long)
                ctx.fillStyle = "#fff";
                ctx.font = '12px Inter, sans-serif';
                const name = p.name.length > 18 ? p.name.slice(0, 15) + '…' : p.name;
                ctx.fillText(name, x - 20, y + 30);

                // presence indicator (small dot)
                ctx.beginPath();
                ctx.arc(x + 18, y - 18, 6, 0, Math.PI * 2);
                ctx.fillStyle = p.isPresent ? '#00ff88' : '#444';
                ctx.fill();

                // rating badge
                ctx.fillStyle = 'rgba(0,0,0,0.6)';
                ctx.fillRect(x - 22, y - 32, 44, 14);
                ctx.fillStyle = '#fff';
                ctx.font = '10px Inter, sans-serif';
                ctx.fillText(String(p.rat || '-'), x - 10, y - 22);
            });
        };

        drawTeam(homePlayers, true);
        drawTeam(awayPlayers, false);
    },

    // Execute tacticalMove objects from ToniCore
    execute(tacticalMove) {
        if (!tacticalMove || !tacticalMove.type) return;
        try {
            switch (tacticalMove.type) {
                case 'MOVE_PLAYER':
                    this._movePlayer(tacticalMove.playerId, tacticalMove.x, tacticalMove.y);
                    break;
                case 'SHIFT_LINE':
                    this._shiftLine(tacticalMove.line, tacticalMove.dx || 0, tacticalMove.dy || 0);
                    break;
                default:
                    console.warn('[Arena] unknown tacticalMove type', tacticalMove.type);
            }
            this.render();
        } catch (e) {
            console.error('[Arena] execute failed', e);
        }
    },

    _movePlayer(playerId, x, y) {
        const p = this.players.find(pl => pl.id === playerId);
        if (p) {
            // store custom coordinates for rendering (non-persistent)
            if (typeof x === 'number' && typeof y === 'number') {
                p._x = x;
                p._y = y;
            } else {
                delete p._x;
                delete p._y;
            }
        } else {
            console.warn('[Arena] _movePlayer: player not found', playerId);
        }
    },

    _shiftLine(lineName, dx, dy) {
        // Map lineName to player subsets (e.g., 'defense', 'midfield', 'attack')
        const mapping = {
            defense: p => ['IV','LV','RV','TW'].includes(p.pos),
            midfield: p => ['ZM','ZM/OM','DM','OM','LM','RM'].includes(p.pos),
            attack: p => ['ST','LF','RF','SS'].includes(p.pos)
        };
        const predicate = mapping[lineName];
        if (!predicate) {
            console.log('[Arena] _shiftLine: unknown line', lineName);
            return;
        }
        this.players.forEach(p => {
            if (predicate(p)) {
                p._x = (p._x || (p.team === 'home' ? 150 : this.canvas.clientWidth - 150)) + dx;
                p._y = (p._y || 100) + dy;
            }
        });
    }
};
