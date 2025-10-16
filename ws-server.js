const WebSocket = require("ws");

let wss; // WebSocket server instance

const initWebSocketServer = (server) => {
  wss = new WebSocket.Server({ server });

  wss.on("connection", (ws, req) => {
    console.log("New client connected");

    ws.on("message", (message) => {
      console.log("Received message from client:", message.toString());
    });

    ws.on("close", () => {
      console.log("Client disconnected");
    });
  });
};

// Fungsi umum broadcast
const broadcast = (data) => {
  if (!wss) return;
  wss.clients.forEach((client) => {
    if (client.readyState === WebSocket.OPEN) {
      client.send(JSON.stringify(data));
    }
  });
};

// Broadcast untuk stock alert
const broadcastStockAlert = (alert) => {
  broadcast({
    type: "STOCK_ALERT",
    title: alert.title || "Stock Alert",
    message: alert.message || "Stock is low",
    created_at: new Date(),
  });
};

// Broadcast untuk rental baru
const broadcastRental = (rental) => {
  broadcast({
    type: "RENTAL",
    title: `New Rental: ${rental.invoice_id}`,
    message: `Customer: ${rental.customer_name}, Total: ${rental.total_amount}`,
    created_at: new Date(),
  });
};

module.exports = {
  initWebSocketServer,
  broadcast,
  broadcastStockAlert,
  broadcastRental,
};
