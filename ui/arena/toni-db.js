// toni-db.js
// Erweiterte ToniDB: players + positions + events + export/import + snapshots
(function () {
  const STORAGE_KEY = "toni_data_v1";
  const LEGACY_POS_KEY = "toni_positions_v1";

  // Default-Struktur
  const defaultData = {
    meta: { version: "toni_v1", createdAt: new Date().toISOString() },
    squad: {
      home: {
        starters: ["H1","H2","H3","H4","H5","H6","H7","H8","H9","H10","H11"],
        bench:   ["HB1","HB2","HB3","HB4"]
      },
      away: {
        starters: ["A1","A2","A3","A4","A5","A6","A7","A8","A9","A10","A11"]
      }
    },
    // positions: { id: { x:number, y:number } }
    positions: {},
    // players: { id: { id, name, number, role, color, rating, attributes, notes, meta } }
    players: {}
  };

  // Safe event emitter (uses global ToniEvents if available)
  function emitEvent(name, payload) {
    try {
      if (window.ToniEvents && typeof window.ToniEvents.emit === "function") {
        window.ToniEvents.emit(name, payload);
      }
    } catch (e) {
      // ignore emitter errors
    }
  }

  // Load full data from localStorage, with legacy fallback for positions
  function loadData() {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) {
        const parsed = JSON.parse(raw);
        return normalizeData(parsed);
      }

      // fallback: try legacy positions-only key
      const legacy = localStorage.getItem(LEGACY_POS_KEY);
      if (legacy) {
        const parsedPos = JSON.parse(legacy);
        const merged = Object.assign({}, defaultData, { positions: parsedPos });
        return normalizeData(merged);
      }

      // nothing stored -> default
      return normalizeData(defaultData);
    } catch (e) {
      console.warn("ToniDB: loadData failed", e);
      return normalizeData(defaultData);
    }
  }

  // Normalize and coerce types for safety
  function normalizeData(raw) {
    const out = {
      meta: Object.assign({}, defaultData.meta, raw?.meta || {}),
      squad: Object.assign({}, defaultData.squad, raw?.squad || {}),
      positions: {},
      players: {}
    };

    // normalize positions
    const rawPos = raw?.positions || {};
    Object.keys(rawPos).forEach(k => {
      const v = rawPos[k] || {};
      const x = Number(v.x);
      const y = Number(v.y);
      if (Number.isFinite(x) && Number.isFinite(y)) {
        out.positions[k] = { x, y };
      }
    });

    // normalize players
    const rawPlayers = raw?.players || {};
    Object.keys(rawPlayers).forEach(k => {
      const p = rawPlayers[k] || {};
      out.players[k] = {
        id: p.id || k,
        name: typeof p.name === "string" ? p.name : "",
        number: p.number ?? "",
        role: typeof p.role === "string" ? p.role : "",
        color: typeof p.color === "string" ? p.color : "",
        rating: Number.isFinite(Number(p.rating)) ? Number(p.rating) : null,
        attributes: (p.attributes && typeof p.attributes === "object") ? p.attributes : {},
        notes: typeof p.notes === "string" ? p.notes : "",
        meta: Object.assign({ createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() }, p.meta || {})
      };
    });

    return out;
  }

  // Persist full data to localStorage
  function saveData(obj) {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(obj));
    } catch (e) {
      console.warn("ToniDB: saveData failed", e);
    }
  }

  // In-memory data
  let data = loadData();

  // Public API
  const api = {
    // expose data (read-only copy recommended)
    get data() {
      // return shallow copy to discourage direct mutation
      return {
        meta: Object.assign({}, data.meta),
        squad: JSON.parse(JSON.stringify(data.squad)),
        positions: Object.assign({}, data.positions),
        players: JSON.parse(JSON.stringify(data.players))
      };
    },

    // --- Players API ---
    getPlayers() {
      return JSON.parse(JSON.stringify(data.players));
    },

    getPlayer(id) {
      if (!id) return null;
      const p = data.players[id];
      return p ? JSON.parse(JSON.stringify(p)) : null;
    },

    /**
     * Set multiple players at once. playersObj: { id: playerObj, ... }
     * Normalizes entries and emits players:changed.
     */
    setPlayers(playersObj) {
      if (!playersObj || typeof playersObj !== "object") return;
      Object.keys(playersObj).forEach(k => {
        const p = playersObj[k] || {};
        const normalized = {
          id: p.id || k,
          name: typeof p.name === "string" ? p.name : "",
          number: p.number ?? "",
          role: typeof p.role === "string" ? p.role : "",
          color: typeof p.color === "string" ? p.color : "",
          rating: Number.isFinite(Number(p.rating)) ? Number(p.rating) : null,
          attributes: (p.attributes && typeof p.attributes === "object") ? p.attributes : {},
          notes: typeof p.notes === "string" ? p.notes : "",
          meta: Object.assign({ createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() }, p.meta || {})
        };
        data.players[k] = normalized;
      });
      saveData(data);
      emitEvent("players:changed", { count: Object.keys(playersObj).length });
    },

    /**
     * Set single player (partial updates allowed)
     */
    setPlayer(id, playerObj) {
      if (!id || !playerObj || typeof playerObj !== "object") return;
      const existing = data.players[id] || { id };
      const updated = Object.assign({}, existing, playerObj);
      updated.id = id;
      updated.meta = Object.assign({}, existing.meta || {}, { updatedAt: new Date().toISOString() });
      data.players[id] = updated;
      saveData(data);
      emitEvent("players:changed", { id });
    },

    // --- Positions API ---
    getPositions() {
      return Object.assign({}, data.positions);
    },

    getPosition(id) {
      return data.positions[id] ? { x: data.positions[id].x, y: data.positions[id].y } : null;
    },

    /**
     * Replace entire positions map (useful for import)
     */
    setPositions(positionsObj) {
      if (!positionsObj || typeof positionsObj !== "object") return;
      const normalized = {};
      Object.keys(positionsObj).forEach(k => {
        const v = positionsObj[k] || {};
        const x = Number(v.x);
        const y = Number(v.y);
        if (Number.isFinite(x) && Number.isFinite(y)) {
          normalized[k] = { x, y };
        }
      });
      data.positions = normalized;
      saveData(data);
      emitEvent("positions:changed", { count: Object.keys(normalized).length });
    },

    /**
     * Save single position (id, x, y)
     */
    savePosition(id, x, y) {
      if (!id) return;
      const nx = Number(x);
      const ny = Number(y);
      if (!Number.isFinite(nx) || !Number.isFinite(ny)) return;
      data.positions[id] = { x: nx, y: ny };
      saveData(data);
      emitEvent("positions:changed", { id, x: nx, y: ny });
    },

    // --- Export / Import / Snapshot ---
    /**
     * Returns a serializable snapshot object { meta, squad, players, positions }
     */
    exportAll() {
      return {
        meta: Object.assign({}, data.meta, { exportedAt: new Date().toISOString() }),
        squad: JSON.parse(JSON.stringify(data.squad)),
        players: JSON.parse(JSON.stringify(data.players)),
        positions: Object.assign({}, data.positions)
      };
    },

    /**
     * Import full snapshot (validates and replaces data)
     * obj: { meta?, squad?, players?, positions? }
     */
    importAll(obj) {
      if (!obj || typeof obj !== "object") {
        throw new Error("Invalid import payload");
      }
      // merge/replace squad
      if (obj.squad && typeof obj.squad === "object") {
        data.squad = Object.assign({}, defaultData.squad, obj.squad);
      }
      // players
      if (obj.players && typeof obj.players === "object") {
        // normalize via setPlayers
        this.setPlayers(obj.players);
      }
      // positions
      if (obj.positions && typeof obj.positions === "object") {
        this.setPositions(obj.positions);
      }
      // meta
      data.meta = Object.assign({}, data.meta, obj.meta || {}, { importedAt: new Date().toISOString() });
      saveData(data);
      emitEvent("data:imported", { meta: data.meta });
      return true;
    },

    /**
     * Snapshot string for history (JSON string)
     */
    snapshot() {
      try {
        return JSON.stringify({
          players: data.players,
          positions: data.positions,
          squad: data.squad,
          meta: data.meta
        });
      } catch (e) {
        return null;
      }
    },

    /**
     * Restore from snapshot string (as produced by snapshot())
     */
    restoreFromSnapshot(snapshotStr) {
      try {
        const obj = JSON.parse(snapshotStr);
        if (obj.players) this.setPlayers(obj.players);
        if (obj.positions) this.setPositions(obj.positions);
        if (obj.squad) data.squad = obj.squad;
        data.meta = Object.assign({}, data.meta, obj.meta || {}, { restoredAt: new Date().toISOString() });
        saveData(data);
        emitEvent("data:restored", { meta: data.meta });
        return true;
      } catch (e) {
        console.warn("ToniDB: restoreFromSnapshot failed", e);
        return false;
      }
    },

    // --- Utilities ---
    clearPositions() {
      data.positions = {};
      saveData(data);
      emitEvent("positions:cleared", {});
    },

    clearPlayers() {
      data.players = {};
      saveData(data);
      emitEvent("players:cleared", {});
    },

    clearAll() {
      data = normalizeData(defaultData);
      saveData(data);
      // also remove legacy key for cleanliness
      try { localStorage.removeItem(LEGACY_POS_KEY); } catch (e) {}
      emitEvent("data:cleared", {});
    },

    // For debugging / dev: force save current in-memory data
    _forceSave() {
      saveData(data);
    }
  };

  // Expose globally
  window.ToniDB = api;
  return api;
})();
