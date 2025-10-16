require('dotenv').config();
const express = require('express');
const morgan = require('morgan');
const helmet = require('helmet');
const cors = require('cors');
const http = require('http');
const path = require('path');

// Routes
const authRoutes = require('./routes/auth.routes');
const testRoutes = require("./routes/test.route");
const adminStoreRoutes = require("./routes/adminStore.routes");
const branchRoutes = require("./routes/branch.routes");
const categoryRoutes = require("./routes/category.routes");
const productRoutes = require("./routes/product.routes");
const branchProductRoutes = require("./routes/branchProduct.routes");
const stockAlertRoutes = require("./routes/stockAlert.routes");
const branchStockRoutes = require("./routes/branchStock.routes");
const rentalRoutes = require("./routes/rental.routes");
const stockOpnameRoutes = require("./routes/stockOpname.routes");
const notificationRoutes = require("./routes/notification.routes");

// WebSocket
const { initWebSocketServer, broadcast, broadcastStockAlert, broadcastRental } = require("./ws-server");

const app = express();
app.use(helmet());
app.use(cors());
app.use(express.json());
app.use(morgan('dev'));

// ✅ Routing
app.use('/api/auth', authRoutes);
app.use("/api/test", testRoutes);
app.use("/api/admin-stores", adminStoreRoutes);
app.use("/api/branches", branchRoutes);
app.use("/api/categories", categoryRoutes);
app.use("/api/products", productRoutes);
app.use("/api/branch-products", branchProductRoutes);
app.use("/api/stock-alerts", stockAlertRoutes);
app.use("/api/branch-stock", branchStockRoutes);
app.use("/api/rentals", rentalRoutes);
app.use("/api/stock-opnames", stockOpnameRoutes);
app.use("/api/notifications", notificationRoutes);

app.use("/uploads", express.static(path.join(__dirname, "uploads")));

app.get('/', (req, res) => res.send('POS Rental Camping API running'));

// ✨ Buat HTTP server dari Express
const PORT = process.env.PORT || 5000;
const server = http.createServer(app);

// ✨ Init WebSocket server di atas HTTP server
initWebSocketServer(server);

// Jalankan server
server.listen(PORT, () => console.log(`Server listening on port ${PORT}`));

// Optional: test broadcast
app.post("/api/notify", (req, res) => {
  const { title, message } = req.body;
  broadcast({ title, message, created_at: new Date() });
  res.json({ message: "Notification sent via WebSocket" });
});

// Contoh broadcast otomatis ketika stock alert atau rental baru dibuat
app.post("/api/stock-alerts/notify", (req, res) => {
  const { product_id, branch_id, current_stock } = req.body;
  broadcastStockAlert({
    title: `Stock Alert!`,
    message: `Product ID ${product_id} at branch ${branch_id} is low: ${current_stock}`,
  });
  res.json({ message: "Stock alert broadcasted" });
});

app.post("/api/rentals/notify", (req, res) => {
  const { invoice_id, customer_name, total_amount } = req.body;
  broadcastRental({ invoice_id, customer_name, total_amount });
  res.json({ message: "Rental broadcasted" });
});
