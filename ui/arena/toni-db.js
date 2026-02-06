// ui/arena/toni-db.js
window.ToniDB = {
  data: {
    squad: {
      home: {
        // 11 IDs als Strings
        starters: ["H1","H2","H3","H4","H5","H6","H7","H8","H9","H10","H11"],
        bench:   ["HB1","HB2","HB3","HB4"]
      },
      away: {
        starters: ["A1","A2","A3","A4","A5","A6","A7","A8","A9","A10","A11"]
      }
    },
    positions: {
      // optional: gespeicherte Positionen; leer ist ok
    }
  },
  savePosition(id, x, y) {
    // einfache Speicherung im Speicher (keine Persistenz)
    this.data.positions[id] = { x, y };
  }
};
