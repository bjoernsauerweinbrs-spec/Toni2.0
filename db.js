// ToniDB mit localStorage-Persistenz
window.ToniDB = window.ToniDB || {};
window.ToniDB.data = window.ToniDB.data || {
  squad: {
    home: { starters: ["H1","H2","H3","H4","H5","H6","H7","H8","H9","H10","H11"], bench: ["HB1","HB2","HB3","HB4"] },
    away: { starters: ["A1","A2","A3","A4","A5","A6","A7","A8","A9","A10","A11"] }
  },
  positions: JSON.parse(localStorage.getItem("toni_positions") || "{}")
};

window.ToniDB.savePosition = function(id, x, y) {
  this.data.positions[id] = { x, y };
  try {
    localStorage.setItem("toni_positions", JSON.stringify(this.data.positions));
  } catch (e) {
    console.warn("ToniDB: localStorage failed", e);
  }
};
