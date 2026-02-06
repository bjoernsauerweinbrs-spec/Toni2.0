// toni-db.js
window.ToniDB = (function () {
  const STORAGE_KEY = "toni_positions_v1";

  const defaultData = {
    squad: {
      home: {
        starters: ["H1","H2","H3","H4","H5","H6","H7","H8","H9","H10","H11"],
        bench:   ["HB1","HB2","HB3","HB4"]
      },
      away: {
        starters: ["A1","A2","A3","A4","A5","A6","A7","A8","A9","A10","A11"]
      }
    },
    positions: {}
  };

  // Lade gespeicherte Positionen aus localStorage (falls vorhanden)
  function loadPositions() {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (!raw) return {};
      return JSON.parse(raw);
    } catch (e) {
      console.warn("ToniDB: loadPositions failed", e);
      return {};
    }
  }

  function savePositions(obj) {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(obj));
    } catch (e) {
      console.warn("ToniDB: savePositions failed", e);
    }
  }

  const data = {
    squad: defaultData.squad,
    positions: Object.assign({}, defaultData.positions, loadPositions())
  };

  return {
    data,
    savePosition(id, x, y) {
      data.positions[id] = { x, y };
      savePositions(data.positions);
    },
    // optional: API zum Löschen aller Positionen
    clearPositions() {
      data.positions = {};
      try { localStorage.removeItem(STORAGE_KEY); } catch (e) {}
    }
  };
})();
